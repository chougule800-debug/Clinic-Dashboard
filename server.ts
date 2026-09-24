import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '5mb' }));

// Lazy Google GenAI Client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  const key = process.env.GEMINI_API_KEY;
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({ apiKey: key || '' });
  }
  return genAIClient;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasGeminiKey: Boolean(process.env.GEMINI_API_KEY) });
});

// AI Voice / Text Patient Intake Parser
app.post('/api/parse-patient', async (req, res) => {
  try {
    const { text, customApiKey } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Text is required for patient intake parsing' });
    }

    const apiKeyToUse = (customApiKey && String(customApiKey).trim()) || process.env.GEMINI_API_KEY;

    if (!apiKeyToUse) {
      // Fallback response if no Gemini key
      return res.json({ parsed: null, source: 'fallback_needed' });
    }

    const ai = new GoogleGenAI({ apiKey: apiKeyToUse });

    const prompt = `You are a medical receptionist and clinical intake AI for Dr. Bharat's Aroga Homeopathy clinic in Belgaum.
Extract structured patient information from this doctor's voice transcription or spoken paragraph:
"${text.trim()}"

Extract the following JSON fields:
- name: string (Patient's full name, capitalized cleanly, e.g. "Sachin Chougule". Strip titles like Mr/Mrs if appropriate or retain standard form)
- age: number or null (e.g. 25 from "25 years" or "25 yrs")
- gender: "Male" | "Female" | "Other" (e.g. "Male" from "male", "Female" from "female")
- mobile: string (10-digit mobile number with +91 if provided, else "")
- address: string (e.g. "Belgaum" or "Satya, Belgaum" or area/location mentioned, else "")
- bpSystolic: number or null (e.g. 130 from "Bp-130-80" or "130/80")
- bpDiastolic: number or null (e.g. 80 from "Bp-130-80" or "130/80")
- rbs: number or null (Blood sugar, e.g. 110 from "RBS- 110" or "sugar 110")
- weight: number or null (e.g. 65 from "65 kg")
- heightInches: number or null (height in inches if mentioned)
- allergies: string[] (any allergies mentioned)
- chronicDiseases: string[] (any chronic illness mentioned)
- chiefComplaints: string (any main complaint mentioned)
- medicineGiven: string or null (Medicines given or prescribed, e.g. "Arnica 200 TDS" from "Medicine Arnica 200 TDS" or "Arnica 200")
- totalBill: number or null (Total bill/fee in rupees, e.g. 500 from "Bill 500" or "Fee 500" or "₹500")

Return ONLY a valid JSON object matching these fields with no markdown backticks and no extra commentary.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.1,
        maxOutputTokens: 1024,
        responseMimeType: 'application/json'
      }
    });

    const responseText = response.text || '';
    let parsedData = null;

    try {
      // Remove any unintentional backticks
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanJson);
    } catch (e) {
      console.warn('Failed to parse Gemini JSON output:', responseText);
    }

    return res.json({ parsed: parsedData, source: 'gemini' });
  } catch (error: any) {
    console.error('Gemini patient parsing error:', error);
    return res.json({ parsed: null, error: error?.message, source: 'error_fallback' });
  }
});

// Server-side Repertorize API
app.post('/api/repertorize', async (req, res) => {
  try {
    const { prompt, method, customApiKey } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const apiKeyToUse = (customApiKey && String(customApiKey).trim()) || process.env.GEMINI_API_KEY;

    if (!apiKeyToUse) {
      return res.status(401).json({
        error: 'Gemini API key is not configured. Please set GEMINI_API_KEY or provide a key in settings.'
      });
    }

    const ai = new GoogleGenAI({ apiKey: apiKeyToUse });

    // Call Gemini 2.5 Flash
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.2,
        maxOutputTokens: 4096
      }
    });

    const text = response.text || '';
    if (!text) {
      return res.status(502).json({ error: 'Gemini returned an empty response.' });
    }

    return res.json({ result: text, method });
  } catch (error: any) {
    console.error('Gemini repertorization error:', error);
    const msg = error?.message || 'Gemini API execution failed';
    return res.status(500).json({ error: msg });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Dr. Bharat's Aroga Homeopathy server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
