export interface ParsedPatientData {
  name?: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  mobile?: string;
  address?: string;
  bpSystolic?: number;
  bpDiastolic?: number;
  rbs?: number;
  weight?: number;
  heightInches?: number;
  allergies?: string[];
  chronicDiseases?: string[];
  chiefComplaints?: string;
  medicineGiven?: string;
  totalBill?: number;
}

/**
 * Intelligent rule-based parser that extracts patient demographics and vitals
 * from natural speech text (English, Marathi, Hindi phonetics).
 * Used both as immediate local parser and fallback when offline/no API key.
 */
export function parsePatientTextLocally(input: string): ParsedPatientData {
  if (!input || !input.trim()) return {};

  const text = input.trim();
  const lower = text.toLowerCase();
  const result: ParsedPatientData = {};

  // 1. Blood Pressure: e.g. "Bp-130-80", "BP 130/80", "BP 130 80", "130/80 mmhg"
  const bpMatch = text.match(/(?:bp|blood\s*pressure)[:\s-]*(\d{2,3})[\s\/-]+(\d{2,3})/i) ||
                  text.match(/\b(\d{2,3})[\/-](\d{2,3})\s*(?:mmhg)?\b/i);
  if (bpMatch) {
    const sys = parseInt(bpMatch[1], 10);
    const dia = parseInt(bpMatch[2], 10);
    if (sys >= 60 && sys <= 260) result.bpSystolic = sys;
    if (dia >= 30 && dia <= 160) result.bpDiastolic = dia;
  }

  // 2. Random Blood Sugar (RBS): e.g. "RBS- 110", "RBS 110", "Sugar 110", "Blood sugar 110"
  const rbsMatch = text.match(/(?:rbs|sugar|blood\s*sugar|glucose|b\.?s\.?)[:\s-]*(\d{2,3})/i);
  if (rbsMatch) {
    const sugar = parseInt(rbsMatch[1], 10);
    if (sugar >= 40 && sugar <= 600) {
      result.rbs = sugar;
    }
  }

  // 3. Age: e.g. "25 years", "25 yrs", "25 yr", "age 25", "25 y/o", "25 वर्षांचा"
  const ageMatch = text.match(/\b(\d{1,3})\s*(?:years?|yrs?|yr|y\.?o\.?|वर्षे?|वर्षांचा|साल)\b/i) ||
                   text.match(/(?:age|वय)[:\s-]*(\d{1,3})/i);
  if (ageMatch) {
    const a = parseInt(ageMatch[1], 10);
    if (a >= 0 && a <= 125) {
      result.age = a;
    }
  }

  // 4. Gender: e.g. "male", "female", "man", "woman", "boy", "girl", "स्त्री", "पुरुष"
  if (/\b(?:female|woman|lady|girl|स्त्री|महिला)\b/i.test(lower)) {
    result.gender = 'Female';
  } else if (/\b(?:male|man|gent|boy|पुरुष|गृहस्थ)\b/i.test(lower)) {
    result.gender = 'Male';
  } else if (/\b(?:other|transgender|तृतीयपंथी)\b/i.test(lower)) {
    result.gender = 'Other';
  }

  // 5. Mobile / Phone number: 10 digits starting with 6,7,8,9
  const mobileMatch = text.match(/(?:mobile|phone|contact|ph|mob)?[:\s-]*(\+?91[\s-]*)?([6-9]\d{9})\b/i);
  if (mobileMatch) {
    result.mobile = `+91 ${mobileMatch[2]}`;
  }

  // 6. Weight: e.g. "60 kg", "weight 65", "65 किलो"
  const weightMatch = text.match(/(?:weight|wt)[:\s-]*(\d{2,3}(?:\.\d+)?)\s*(?:kg|किलो)?/i) ||
                      text.match(/\b(\d{2,3}(?:\.\d+)?)\s*(?:kg|kgs|किलो)\b/i);
  if (weightMatch) {
    result.weight = parseFloat(weightMatch[1]);
  }

  // 7. Height: e.g. "height 65 inches", "5.4 feet", "65 inch"
  const heightMatch = text.match(/(?:height|ht)[:\s-]*(\d{2,3}(?:\.\d+)?)\s*(?:inch|inches|in)?/i) ||
                      text.match(/\b(\d{2,3})\s*(?:inch|inches)\b/i);
  if (heightMatch) {
    result.heightInches = parseFloat(heightMatch[1]);
  }

  // 8. Address / City: look for "at <city/area>", "from <city>", "residing at <city>", "राहणार <गाव/शहर>"
  const addressMatch = text.match(/(?:at|from|residing\s*at|in|address|राहणार|येथील)\s+([A-Za-z0-9\s,.-]+?)(?=\s*(?:,|bp|rbs|sugar|mobile|phone|weight|\b|$))/i);
  if (addressMatch) {
    let rawAddr = addressMatch[1].trim();
    // remove leading prepositions
    rawAddr = rawAddr.replace(/^(?:at|in|from)\s+/i, '').trim();
    if (rawAddr.length >= 2) {
      // Capitalize words
      result.address = rawAddr.split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    }
  } else if (/belgaum|hindalga|kolhapur|pune|hubli|dharwad|goa|sangli/i.test(text)) {
    const knownCity = text.match(/\b(belgaum|hindalga|kolhapur|pune|hubli|dharwad|goa|sangli)\b/i);
    if (knownCity) {
      result.address = knownCity[1].charAt(0).toUpperCase() + knownCity[1].slice(1).toLowerCase();
    }
  }

  // 9. Name: Extract the opening words before age / gender / "at" / "bp" / commas
  // e.g. "sachin chougule 25 years male satya at belgaum"
  // Cut string before any vital or demographic token
  const cleanTokens = text
    .replace(/(?:bp|blood\s*pressure)[:\s-]*\d{2,3}[\s\/-]+\d{2,3}.*$/i, '')
    .replace(/(?:rbs|sugar)[:\s-]*\d{2,3}.*$/i, '');

  const nameCandidate = cleanTokens
    .split(/\b(?:\d{1,3}\s*(?:years?|yrs?|yr|y\.?o\.?)|age|वय|male|female|at|from|mobile|phone)\b/i)[0]
    .replace(/^(?:mr\.?|mrs\.?|ms\.?|dr\.?|patient|नाव|name[:\s-]*)\s*/i, '')
    .replace(/[,;:-]+$/, '')
    .trim();

  if (nameCandidate && nameCandidate.length > 2 && !/^\d+$/.test(nameCandidate)) {
    // Only keep alphabetic words
    const words = nameCandidate.split(/\s+/).filter(w => /^[a-zA-Z\u0900-\u097F]+$/.test(w));
    if (words.length > 0 && words.length <= 4) {
      result.name = words
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    }
  }

  // 10. Medicine Given (Quick Prescription shortcut): e.g. "Medicine Arnica 200 TDS", "medicine Nux Vomica 30", "Rx: Bryonia 200"
  const medMatch = text.match(/(?:medicine|medicines|med|rx|औषध|औषधे|remedy)[:\s-]+([^,;.\n]+?)(?=\s*(?:,|bill|fee|charge|amount|\b|$))/i);
  if (medMatch) {
    const rawMed = medMatch[1].trim();
    if (rawMed.length >= 2) {
      result.medicineGiven = rawMed;
    }
  }

  // 11. Total Bill (Quick Billing shortcut): e.g. "Bill 500", "Total bill: 500", "Bill-500", "₹500", "fee 600"
  const billMatch = text.match(/(?:total\s*bill|bill|fee|fees|charges?|amount|बिल|रुपये)[:\s-]*₹?\s*(\d{2,6})\b/i) ||
                    text.match(/₹\s*(\d{2,6})\b/);
  if (billMatch) {
    const b = parseInt(billMatch[1], 10);
    if (b > 0 && b <= 500000) {
      result.totalBill = b;
    }
  }

  return result;
}

/**
 * Call server AI endpoint to parse patient voice/text using Gemini 3.8 Flash,
 * with automatic fallback to local regex parsing if server or key is unavailable.
 */
export async function parsePatientWithAI(text: string): Promise<ParsedPatientData> {
  const localParsed = parsePatientTextLocally(text);

  try {
    const response = await fetch('/api/parse-patient', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.parsed) {
        // Merge AI parsed with local parsed (AI takes priority for non-empty fields)
        return {
          ...localParsed,
          ...Object.fromEntries(
            Object.entries(data.parsed).filter(([_, v]) => v !== null && v !== undefined && v !== '')
          )
        };
      }
    }
  } catch (err) {
    console.warn('AI patient parse server call failed, using local parser:', err);
  }

  return localParsed;
}
