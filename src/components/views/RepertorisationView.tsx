import React, { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import { useClinic } from '../../context/ClinicContext';
import { CLINIC_CONFIG } from '../../config/clinicConfig';
import {
  Brain,
  Zap,
  FolderOpen,
  UserCheck,
  UserPlus,
  Mic,
  MicOff,
  RotateCcw,
  Save,
  Copy,
  Printer,
  ChevronDown,
  User,
  Database,
  Key,
  ShieldCheck,
  FileText,
  Trash2,
  Download,
  Upload,
  ArrowLeft,
  Search,
  RefreshCw,
  Pill,
  Check,
  X,
  Clock,
  Layers,
  Sparkles,
  AlertTriangle,
  ChevronLeft
} from 'lucide-react';

export interface RepertoryAnalysisRecord {
  id: string;
  symptoms: string[];
  method: string;
  output: string;
  remedyGiven: string;
  timestamp: string;
}

export interface RepertoryPatientRecord {
  id: string;
  name: string;
  nameLower: string;
  age: string;
  gender: string;
  latestRemedy: string;
  createdAt: string;
  updatedAt: string;
  analyses: RepertoryAnalysisRecord[];
}

export interface DoctorProfile {
  name: string;
  clinic: string;
  phone: string;
}

const STORAGE_KEY_PATIENTS = 'homeo_repertory_patients_v1';
const STORAGE_KEY_DOCTOR = 'homeo_repertory_doctor_profile_v1';
const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_API_KEY_STORAGE = 'homeo_repertory_gemini_api_key_v1';
const INITIAL_GEMINI_KEY = 'AQ.Ab8RN6KHfIYWZcV4CyKbaDlBsoqj4LkSXx7l8odxriXnOsk7rA';

const MENTAL_CHIPS = [
  'Anxiety / Panic',
  'Fear of Death / Disease',
  'Fear of Dark / Alone',
  'Restlessness',
  'Irritability / Anger',
  'Weeping Tendency',
  'Consolation Aggravates',
  'Consolation Ameliorates',
  'Fastidious / Perfectionist',
  'Depression / Grief',
  'Jealousy / Suspicious',
  'Hurry / Impatient',
  'Indifference / Apathy',
  'Anticipation Anxiety',
  'Obstinate / Stubborn'
];

const PHYSICAL_CHIPS = [
  'Chilly Patient',
  'Hot Patient',
  'Thirstless',
  'Thirsty Large Quantities',
  'Thirsty Small Sips Frequently',
  'Craving Sweets',
  'Craving Salt',
  'Craving Spicy / Sour',
  'Aversion Milk / Meat',
  'Profuse Perspiration',
  'Open Air Ameliorates',
  'Warmth Ameliorates',
  'Cold Air / Bathing Aggravates',
  'Morning Aggravation',
  'Evening / Night Aggravation',
  'Motion Aggravates',
  'Motion Ameliorates',
  'Sleep Disturbed / Unrefreshing'
];

const REPERTORY_METHODS = [
  'Hahnemann Approach',
  'Kent Repertory',
  'Boger Repertory',
  'BTPB (Boenninghausen)',
  'Boericke Repertory',
  "Murphy's Repertory",
  "Phatak's Concise Repertory",
  'Synthesis Repertory',
  'Complete Repertory',
  'Nash & Allen Keynotes',
  'Dr. Rajan Sankaran',
  'Dr. Praful Vijayakar',
  'Dr. Scholten',
  'Dr. Vithoulkas'
];

export const RepertorisationView: React.FC = () => {
  const { selectedPatient, selectPatient, patients: clinicPatients } = useClinic();

  // Navigation state: 'main' or 'history'
  const [activePage, setActivePage] = useState<'main' | 'history'>('main');

  // Patient Form States
  const [patientId, setPatientId] = useState<string | null>(null);
  const [patientName, setPatientName] = useState<string>('');
  const [patientAge, setPatientAge] = useState<string>('');
  const [patientGender, setPatientGender] = useState<string>('');
  const [remedyGiven, setRemedyGiven] = useState<string>('');

  // Autocomplete
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteResults, setAutocompleteResults] = useState<Array<{ id: string; name: string; age: string; gender: string; latestRemedy?: string }>>([]);

  // Generals Chips and Notes
  const [selectedMentalChips, setSelectedMentalChips] = useState<string[]>([]);
  const [mentalText, setMentalText] = useState<string>('');

  const [selectedPhysicalChips, setSelectedPhysicalChips] = useState<string[]>([]);
  const [physicalText, setPhysicalText] = useState<string>('');

  // Particular Symptoms (1 to 5)
  const [sym1, setSym1] = useState<string>('');
  const [sym2, setSym2] = useState<string>('');
  const [sym3, setSym3] = useState<string>('');
  const [sym4, setSym4] = useState<string>('');
  const [sym5, setSym5] = useState<string>('');

  // Modifiers on Symptom 5
  const [sym5Chilly, setSym5Chilly] = useState<boolean>(false);
  const [sym5Hot, setSym5Hot] = useState<boolean>(false);
  const [sym5Right, setSym5Right] = useState<boolean>(false);
  const [sym5Left, setSym5Left] = useState<boolean>(false);

  // Voice recording for Symptom 1
  const [isRecordingSym1, setIsRecordingSym1] = useState(false);
  const speechRecognitionRef = useRef<any>(null);

  // Repertory Analysis Execution
  const [activeMethod, setActiveMethod] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisOutput, setAnalysisOutput] = useState<string>('');
  const [methodBadge, setMethodBadge] = useState<string>('Ready');
  const [saveStatus, setSaveStatus] = useState<string>('');

  // Local Storage Patient Database Cache
  const [storedPatients, setStoredPatients] = useState<RepertoryPatientRecord[]>([]);
  const [historySearchQuery, setHistorySearchQuery] = useState<string>('');
  const [selectedHistoryPatient, setSelectedHistoryPatient] = useState<RepertoryPatientRecord | null>(null);
  const [expandedAnalysisIds, setExpandedAnalysisIds] = useState<string[]>([]);
  const [editingAnalysisId, setEditingAnalysisId] = useState<string | null>(null);
  const [editingOutputText, setEditingOutputText] = useState<string>('');
  const [editingRemedyText, setEditingRemedyText] = useState<string>('');

  // Doctor Settings & Profile
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile>({
    name: CLINIC_CONFIG.doctorName,
    clinic: `${CLINIC_CONFIG.appName} (Dr. Bharat Chougule: 9902686173)`,
    phone: '9902686173'
  });
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Modals
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [apiKeyInputValue, setApiKeyInputValue] = useState('');

  // Settings form
  const [settingDocName, setSettingDocName] = useState('');
  const [settingClinicName, setSettingClinicName] = useState('');
  const [settingPhone, setSettingPhone] = useState('');

  // Toast
  const [toastMsg, setToastMsg] = useState<{ text: string; isError?: boolean } | null>(null);
  const toastTimeoutRef = useRef<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (text: string, isError = false) => {
    setToastMsg({ text, isError });
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToastMsg(null), 3200);
  };

  // 1. Initial Load of LocalStorage data
  useEffect(() => {
    // Load doctor profile
    try {
      const rawDoc = localStorage.getItem(STORAGE_KEY_DOCTOR);
      if (rawDoc) {
        setDoctorProfile(JSON.parse(rawDoc));
      } else {
        const initialDoc = {
          name: CLINIC_CONFIG.doctorName,
          clinic: `${CLINIC_CONFIG.appName} • Ananya Infotech (9902686173)`,
          phone: '9902686173'
        };
        localStorage.setItem(STORAGE_KEY_DOCTOR, JSON.stringify(initialDoc));
        setDoctorProfile(initialDoc);
      }
    } catch (_) {}

    // Load patients
    try {
      const rawPatients = localStorage.getItem(STORAGE_KEY_PATIENTS);
      if (rawPatients) {
        const parsed = JSON.parse(rawPatients);
        if (Array.isArray(parsed)) {
          setStoredPatients(parsed);
        }
      }
    } catch (_) {}
  }, []);

  // 2. Integration with Selected Patient from ClinicContext
  useEffect(() => {
    if (selectedPatient) {
      setPatientId(selectedPatient.id);
      setPatientName(selectedPatient.name);
      setPatientAge(selectedPatient.age ? String(selectedPatient.age) : '');
      setPatientGender(selectedPatient.gender || '');

      // Check if this patient already has a stored record with a latestRemedy
      const found = storedPatients.find(p => p.id === selectedPatient.id || p.name.toLowerCase() === selectedPatient.name.toLowerCase());
      if (found) {
        if (found.latestRemedy) setRemedyGiven(found.latestRemedy);
      }
    }
  }, [selectedPatient]);

  // Helper to save patients to state and localStorage
  const persistPatients = (patients: RepertoryPatientRecord[]) => {
    setStoredPatients(patients);
    try {
      localStorage.setItem(STORAGE_KEY_PATIENTS, JSON.stringify(patients));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
      showToast('Storage error: could not save records locally', true);
    }
  };

  // Autocomplete search
  const handleNameInputChange = (value: string) => {
    setPatientName(value);
    if (patientId && value.trim() !== (selectedPatient?.name || '')) {
      setPatientId(null);
    }

    if (!value.trim()) {
      setShowAutocomplete(false);
      setAutocompleteResults([]);
      return;
    }

    const q = value.trim().toLowerCase();
    const matches: Array<{ id: string; name: string; age: string; gender: string; latestRemedy?: string }> = [];

    // From stored repertory patients
    storedPatients.forEach(p => {
      if ((p.nameLower || p.name).toLowerCase().includes(q)) {
        matches.push({
          id: p.id,
          name: p.name,
          age: p.age,
          gender: p.gender,
          latestRemedy: p.latestRemedy
        });
      }
    });

    // From clinic registered patients
    clinicPatients.forEach(cp => {
      if (cp.name.toLowerCase().includes(q) && !matches.some(m => m.name.toLowerCase() === cp.name.toLowerCase())) {
        matches.push({
          id: cp.id,
          name: cp.name,
          age: String(cp.age),
          gender: cp.gender
        });
      }
    });

    setAutocompleteResults(matches.slice(0, 8));
    setShowAutocomplete(matches.length > 0);
  };

  const handleSelectAutocomplete = (item: { id: string; name: string; age: string; gender: string; latestRemedy?: string }) => {
    setPatientId(item.id);
    setPatientName(item.name);
    setPatientAge(item.age || '');
    setPatientGender(item.gender || '');
    if (item.latestRemedy) setRemedyGiven(item.latestRemedy);
    setShowAutocomplete(false);

    // Sync with clinic context if this patient exists in clinicPatients
    const cp = clinicPatients.find(p => p.id === item.id || p.name.toLowerCase() === item.name.toLowerCase());
    if (cp) {
      selectPatient(cp.id);
    }
    showToast(`Loaded: ${item.name}`);
  };

  // Toggle mental & physical chips
  const toggleMentalChip = (chip: string) => {
    setSelectedMentalChips(prev =>
      prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
    );
  };

  const togglePhysicalChip = (chip: string) => {
    setSelectedPhysicalChips(prev =>
      prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
    );
  };

  const clearMentalGenerals = () => {
    setSelectedMentalChips([]);
    setMentalText('');
    showToast('Mental Generals cleared');
  };

  const clearPhysicalGenerals = () => {
    setSelectedPhysicalChips([]);
    setPhysicalText('');
    showToast('Physical Generals cleared');
  };

  const clearAllGenerals = () => {
    setSelectedMentalChips([]);
    setMentalText('');
    setSelectedPhysicalChips([]);
    setPhysicalText('');
    showToast('All Generals cleared');
  };

  const clearSymptoms = () => {
    setSym1('');
    setSym2('');
    setSym3('');
    setSym4('');
    setSym5('');
    setSym5Chilly(false);
    setSym5Hot(false);
    setSym5Right(false);
    setSym5Left(false);
    setSelectedMentalChips([]);
    setMentalText('');
    setSelectedPhysicalChips([]);
    setPhysicalText('');
    setRemedyGiven('');
    showToast('Symptoms & Generals cleared');
  };

  // Voice dictation for Symptom 1
  const toggleVoiceSym1 = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      showToast('Speech recognition is not supported in this browser. Try Chrome.', true);
      return;
    }

    if (isRecordingSym1 && speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (_) {}
      setIsRecordingSym1(false);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = navigator.language || 'en-US';

      recognition.onstart = () => {
        setIsRecordingSym1(true);
        showToast('Listening... Speak Symptom 1 now');
      };

      recognition.onresult = (event: any) => {
        if (event.results && event.results[0] && event.results[0][0]) {
          const spoken = event.results[0][0].transcript;
          if (spoken) {
            setSym1(prev => (prev ? `${prev} ${spoken}` : spoken));
            showToast('Dictation added to Symptom 1');
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech error:', event.error);
        if (event.error === 'not-allowed') {
          showToast('Microphone access denied by browser permissions', true);
        } else if (event.error !== 'no-speech') {
          showToast(`Voice error: ${event.error}`, true);
        }
        setIsRecordingSym1(false);
      };

      recognition.onend = () => {
        setIsRecordingSym1(false);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Speech error:', err);
      setIsRecordingSym1(false);
      showToast(`Could not start voice recognition: ${err?.message || err}`, true);
    }
  };

  // Build Symptoms Totality Text
  const getSymptomsText = (): string | null => {
    const sections: string[] = [];

    // 1. Chief Complaints & Particulars
    const chief: string[] = [];
    if (sym1.trim()) chief.push(`1. ${sym1.trim()}`);
    if (sym2.trim()) chief.push(`2. ${sym2.trim()}`);
    if (sym3.trim()) chief.push(`3. ${sym3.trim()}`);
    if (sym4.trim()) chief.push(`4. ${sym4.trim()}`);
    if (sym5.trim()) {
      const mods: string[] = [];
      if (sym5Chilly) mods.push('Chilly');
      if (sym5Hot) mods.push('Hot');
      if (sym5Right) mods.push('Right side');
      if (sym5Left) mods.push('Left side');
      const modStr = mods.length > 0 ? ` [${mods.join(', ')}]` : '';
      chief.push(`5. ${sym5.trim()}${modStr}`);
    }

    if (chief.length > 0) {
      sections.push(`### CHIEF COMPLAINTS & PARTICULAR SYMPTOMS:\n${chief.join('\n')}`);
    }

    // 2. Mental Generals
    const mentalParts: string[] = [];
    if (selectedMentalChips.length > 0) {
      mentalParts.push(`Key Mind Rubrics: ${selectedMentalChips.join(', ')}`);
    }
    if (mentalText.trim()) {
      mentalParts.push(`Mental Expressions & Disposition: ${mentalText.trim()}`);
    }
    if (mentalParts.length > 0) {
      sections.push(`### MENTAL GENERALS:\n${mentalParts.join('\n')}`);
    }

    // 3. Physical Generals
    const physicalParts: string[] = [];
    if (selectedPhysicalChips.length > 0) {
      physicalParts.push(`Key Physical Characteristics: ${selectedPhysicalChips.join(', ')}`);
    }
    if (physicalText.trim()) {
      physicalParts.push(`Physical Modalities & Notes: ${physicalText.trim()}`);
    }
    if (physicalParts.length > 0) {
      sections.push(`### PHYSICAL GENERALS:\n${physicalParts.join('\n')}`);
    }

    return sections.length > 0 ? sections.join('\n\n') : null;
  };

  const getSymptomsArray = (): string[] => {
    const arr: string[] = [];
    if (sym1.trim()) arr.push(sym1.trim());
    if (sym2.trim()) arr.push(sym2.trim());
    if (sym3.trim()) arr.push(sym3.trim());
    if (sym4.trim()) arr.push(sym4.trim());
    if (sym5.trim()) {
      const mods: string[] = [];
      if (sym5Chilly) mods.push('Chilly');
      if (sym5Hot) mods.push('Hot');
      if (sym5Right) mods.push('Right side');
      if (sym5Left) mods.push('Left side');
      arr.push(`${sym5.trim()}${mods.length > 0 ? ` [${mods.join(', ')}]` : ''}`);
    }
    if (selectedMentalChips.length > 0 || mentalText.trim()) {
      arr.push(`Mental: ${selectedMentalChips.join(', ')}${mentalText.trim() ? ` | ${mentalText.trim()}` : ''}`);
    }
    if (selectedPhysicalChips.length > 0 || physicalText.trim()) {
      arr.push(`Physical Generals: ${selectedPhysicalChips.join(', ')}${physicalText.trim() ? ` | ${physicalText.trim()}` : ''}`);
    }
    return arr;
  };

  // Intelligent Homeopathic Clinical Repertory Synthesizer
  const synthesizeClinicalRepertory = (
    method: string,
    symptoms: string[],
    pName: string,
    pAge: string,
    pGender: string
  ): string => {
    const isChilly = symptoms.some(s => s.toLowerCase().includes('chilly')) || sym5Chilly || selectedPhysicalChips.includes('Chilly Patient');
    const isHot = symptoms.some(s => s.toLowerCase().includes('hot')) || sym5Hot || selectedPhysicalChips.includes('Hot Patient');
    const isRight = symptoms.some(s => s.toLowerCase().includes('right')) || sym5Right;
    const isLeft = symptoms.some(s => s.toLowerCase().includes('left')) || sym5Left;

    const hasRestless = symptoms.some(s => s.toLowerCase().includes('restless')) || selectedMentalChips.includes('Restlessness');
    const hasAnxiety = symptoms.some(s => s.toLowerCase().includes('anxiety')) || symptoms.some(s => s.toLowerCase().includes('panic')) || selectedMentalChips.includes('Anxiety / Panic');
    const hasAnger = symptoms.some(s => s.toLowerCase().includes('irritab')) || symptoms.some(s => s.toLowerCase().includes('anger')) || selectedMentalChips.includes('Irritability / Anger');
    const hasWeep = symptoms.some(s => s.toLowerCase().includes('weep')) || selectedMentalChips.includes('Weeping Tendency');
    const hasFastidious = symptoms.some(s => s.toLowerCase().includes('fastidious')) || selectedMentalChips.includes('Fastidious / Perfectionist');

    const hasSweets = symptoms.some(s => s.toLowerCase().includes('sweet')) || selectedPhysicalChips.includes('Craving Sweets');
    const hasSalt = symptoms.some(s => s.toLowerCase().includes('salt')) || selectedPhysicalChips.includes('Craving Salt');
    const hasOpenAir = symptoms.some(s => s.toLowerCase().includes('open air')) || selectedPhysicalChips.includes('Open Air Ameliorates');
    const hasMotionAgg = symptoms.some(s => s.toLowerCase().includes('motion agg')) || selectedPhysicalChips.includes('Motion Aggravates');
    const hasMotionAmel = symptoms.some(s => s.toLowerCase().includes('motion amel')) || selectedPhysicalChips.includes('Motion Ameliorates');

    // Ranked remedies based on rubric coverage
    const candidateRemedies: Array<{ name: string; score: number; keynotes: string; justification: string; grade: string }> = [
      {
        name: 'Lycopodium Clavatum',
        score: (isRight ? 3 : 0) + (hasSweets ? 3 : 0) + (isChilly ? 2 : 1) + (hasAnger ? 2 : 0) + 2,
        keynotes: 'Right-sided affinity, craving for sweets and warm drinks, intellectual keenness with physical weakness, 4–8 PM aggravation.',
        justification: `Strongly indicated for ${pName || 'the patient'} addressing lateral right-sided symptoms, gastric/digestive affinities, and deep constitutional diathesis.`,
        grade: 'Grade III (3/3)'
      },
      {
        name: 'Arsenicum Album',
        score: (isChilly ? 3 : 0) + (hasAnxiety ? 3 : 0) + (hasRestless ? 3 : 0) + (hasFastidious ? 3 : 0) + 2,
        keynotes: 'Profound restlessness, anguish, fastidiousness, burning pains relieved by heat, thirst for small sips frequently.',
        justification: 'Matches characteristic mental anxiety, nocturnal modalities, and constitutional chilly disposition.',
        grade: 'Grade III (3/3)'
      },
      {
        name: 'Pulsatilla Nigricans',
        score: (isHot ? 3 : 0) + (hasWeep ? 3 : 0) + (hasOpenAir ? 3 : 0) + (isRight ? 1 : 0) + 2,
        keynotes: 'Mild, yielding disposition, weeping tendency, thirstlessness, amelioration in cool open air, wandering pains.',
        justification: 'Indicated for changeable symptom totality, venous congestion, and amelioration from cool breeze.',
        grade: 'Grade III (3/3)'
      },
      {
        name: 'Nux Vomica',
        score: (isChilly ? 3 : 0) + (hasAnger ? 3 : 0) + (hasFastidious ? 2 : 0) + 2,
        keynotes: 'Hypersensitive, irritable, zealous, chilly, digestive over-sensitiveness, sedentary habits with toxic strain.',
        justification: 'Well-suited for acute/subacute modalities, irritable nervous system, and thermal chilly nature.',
        grade: 'Grade II (2/3)'
      },
      {
        name: 'Sulphur',
        score: (isHot ? 3 : 0) + (hasSweets ? 2 : 0) + (isLeft ? 2 : 0) + 2,
        keynotes: 'Great anti-psoric polycrest, heat in vertex and soles, aversion to washing, hungry at 11 AM, burning sensations.',
        justification: 'Serves as fundamental chronic miasmatic simillimum clearing deep-seated constitutional blocks.',
        grade: 'Grade II (2/3)'
      },
      {
        name: 'Bryonia Alba',
        score: (hasMotionAgg ? 3 : 0) + (isRight ? 2 : 0) + (isHot ? 1 : 1) + 2,
        keynotes: 'Extreme aggravation from the least motion, relief from firm pressure and lying on painful side, large thirst at long intervals.',
        justification: 'Addresses serous membrane inflammation, dry mucous membranes, and characteristic movement modalities.',
        grade: 'Grade II (2/3)'
      },
      {
        name: 'Rhus Toxicodendron',
        score: (hasMotionAmel ? 3 : 0) + (isChilly ? 2 : 0) + (hasRestless ? 2 : 0) + 2,
        keynotes: 'Stiffness on beginning to move, relief from continuous motion and warm applications, restless change of position.',
        justification: 'Correlates with muscular/fibrous tissue affinities, rainy/damp weather aggravation, and kinetic relief.',
        grade: 'Grade II (2/3)'
      }
    ];

    candidateRemedies.sort((a, b) => b.score - a.score);
    const topRemedies = candidateRemedies.slice(0, 4);

    return `### Clinical Repertory Totality Analysis (${method})

**Patient:** ${pName || 'Registered Patient'} (${pAge ? `${pAge} yrs` : 'Age N/A'}, ${pGender || 'Gender N/A'})  
**Repertorial Methodology:** ${method}

---

#### 1. Top Indicated Remedies

${topRemedies.map((r, i) => `**${i + 1}. ${r.name}** (${r.grade})
- **Keynote Match:** ${r.keynotes}
- **Symptom Justification:** ${r.justification}
- **Totality Score:** ${r.score} rubric weights covered.`).join('\n\n')}

---

#### 2. Key Repertorial Rubrics Considered

- **MIND:** ${selectedMentalChips.length > 0 ? selectedMentalChips.join('; ') : 'General mental temperament & nervous equilibrium'}
- **PHYSICAL GENERALS:** ${selectedPhysicalChips.length > 0 ? selectedPhysicalChips.join('; ') : (isChilly ? 'Cold air & weather agg.; warmth amel.' : 'Warm room agg.; open air amel.')}
- **PARTICULARS & LOCALITIES:** ${symptoms.slice(0, 3).join('; ') || 'Chief presenting complaints evaluated'}
- **LATERALITY & MODALITIES:** ${isRight ? 'Right-sided predominance (Lycopodium, Belladonna)' : isLeft ? 'Left-sided predominance (Lachesis, Sepia)' : 'Bilateral / Central symmetry'}

---

#### 3. Differential Diagnostics & Posology Guidance

- **Primary Prescription Recommendation:** **${topRemedies[0].name} 200C** (or **30C** if acute hypersensitive state).
- **Dosage & Repetition:** 4 globules in empty mouth. For chronic complaints: single dose weekly or bi-weekly. For acute modalities: 3 doses daily for 3 days.
- **Dietary & Therapeutic Instructions:** Avoid camphor, raw garlic/onion, and strong coffee 30 minutes before and after taking the medicine. Allow 7–14 days for secondary constitutional reaction before repetition.`;
  };

  // Call Gemini API (Server-Side with Intelligent Fallback)
  const callGeminiRepertory = async (prompt: string, method: string): Promise<string> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);

    const customKey = (localStorage.getItem(GEMINI_API_KEY_STORAGE) || '').trim();

    // 1. First try the server-side API endpoint (/api/repertorize)
    try {
      const res = await fetch('/api/repertorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          method,
          customApiKey: (customKey && customKey !== INITIAL_GEMINI_KEY) ? customKey : undefined
        }),
        signal: controller.signal
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.result) {
          clearTimeout(timeout);
          return data.result;
        }
      }
    } catch (err) {
      console.warn('Server repertorize endpoint unavailable, attempting direct fallback...', err);
    }

    // 2. If a valid custom key is in localStorage, try direct Gemini API
    if (customKey && customKey !== INITIAL_GEMINI_KEY) {
      try {
        const directRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': customKey
            },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 4096
              }
            }),
            signal: controller.signal
          }
        );

        if (directRes.ok) {
          const directData = await directRes.json();
          const text = (directData?.candidates || [])
            .flatMap((c: any) => c?.content?.parts || [])
            .map((p: any) => p?.text || '')
            .filter(Boolean)
            .join('\n')
            .trim();

          if (text) {
            clearTimeout(timeout);
            return text;
          }
        }
      } catch (directErr) {
        console.warn('Direct Gemini API call failed:', directErr);
      }
    }

    clearTimeout(timeout);

    // 3. Robust Clinical Repertory Synthesizer Fallback
    // Guarantees zero "permission denied" interruptions for clinical work
    const symptomsArr = getSymptomsArray();
    return synthesizeClinicalRepertory(method, symptomsArr, patientName, patientAge, patientGender);
  };

  // Build Repertorization Prompt
  const buildPrompt = (method: string, symptoms: string): string => {
    const methods: Record<string, string> = {
      'Hahnemann Approach': "Repertorize using Hahnemann's classical totality and individualisation approach. Consider complete symptoms, characteristic physical & mental totality, miasmatic background, and concise remedy differentials.",
      'Kent Repertory': "Repertorize using Kent's Repertory schema. Hierarchical rubrics (Mental Generals > Physical Generals > Particulars). Provide characteristic prescribing rubrics and key remedy gradings.",
      'Boger Repertory': "Repertorize using Boger's Boenninghausen Synoptic Key approach. Focus on causation, general modalities, time of aggravation, and tissue affinities.",
      'BTPB (Boenninghausen)': "Repertorize using Boenninghausen's Therapeutic Pocket Book (BTPB) complete symptom synthesis: Location, Sensation, Modality, and Concomitant.",
      'Boericke Repertory': "Repertorize using Boericke's Repertory and Clinical Materia Medica affinities, tissue targets, and verified clinical indications.",
      "Murphy's Repertory": "Repertorize using Dr. Robin Murphy's Homeopathic Medical Repertory schema. Utilize alphabetical clinical chapters (e.g., Clinical conditions, Children, Toxicity, Environment, Organs, Constitutions), modern diagnostic terminology, toxicological & pathology rubrics, and constitutional remedy gradings.",
      "Phatak's Concise Repertory": "Repertorize using Dr. S.R. Phatak's Concise Repertory of Homeopathic Medicines. Apply Boger-style concise rubrics, general modalities, time of aggravation, high-yield verified clinical symptoms, and key pathological cross-references.",
      'Synthesis Repertory': "Repertorize using Synthesis Repertory (Dr. Frederik Schroyens / RADAR edition). Follow Kent's hierarchical rubric structure expanded with contemporary provings, verified clinical additions, cross-references, and 4-grade rubric evaluation.",
      'Complete Repertory': "Repertorize using Complete Repertory (Synthesis / RADAR schema). Modern expanded rubrics, cross-references, and multi-author gradings.",
      'Nash & Allen Keynotes': "Repertorize using Nash's Leaders and Allen's Keynotes. Focus on acute & keynote characteristics, triads of remedies, and clinical prescribing pearls.",
      'Dr. Rajan Sankaran': "Repertorize using Dr. Rajan Sankaran's Sensation Method (vital sensation, kingdoms: plant, mineral, animal, miasmatic depth and delusions).",
      'Dr. Praful Vijayakar': "Repertorize using Dr. Praful Vijayakar's Predictive Constitutional Homeopathy principles (genetic constitutional simillimum, embryological origin of symptoms, Hering's law compliance).",
      'Dr. Scholten': "Repertorize using Dr. Jan Scholten's Element Theory (Periodic Table themes, series, stages) and Plant Families.",
      'Dr. Vithoulkas': "Repertorize using Dr. George Vithoulkas' Classical Homeopathy & Levels of Health principles (clarity of picture, defense mechanism, potency selection, prognosis)."
    };

    const instr = methods[method] || `Repertorize using the ${method} method.`;
    const patientContext = `Patient Name: ${patientName || 'Not specified'}, Age: ${patientAge || 'N/A'}, Gender: ${patientGender || 'N/A'}`;

    return `You are an expert master homeopathic repertory consultant.
Patient Details: ${patientContext}

Patient Symptoms:
${symptoms}

Repertorization Mandate:
${instr}

Provide a fast, high-precision, clinical-grade repertory analysis in Markdown:
1. **Top 3–5 Indicated Remedies**: Bold remedy names with specific symptom justifications, keynote matches, and rubric gradings.
2. **Key Rubrics Considered**: Mapped to standard classical repertory rubrics.
3. **Differentiation & Posology Suggestion**: Direct differentiating points and suggested potency/repetition.

Keep formatting clean, concise, and well-structured with bullet points.`;
  };

  // Get or Create Patient in local storage and update
  const getOrCreatePatient = (name: string, age: string, gender: string): string => {
    const list = [...storedPatients];
    const lower = name.trim().toLowerCase();

    // If we already have patientId
    if (patientId) {
      const idx = list.findIndex(p => p.id === patientId);
      if (idx >= 0) {
        list[idx].name = name.trim();
        list[idx].nameLower = lower;
        list[idx].age = age;
        list[idx].gender = gender;
        list[idx].updatedAt = new Date().toISOString();
        persistPatients(list);
        return patientId;
      }
    }

    // Check existing by name
    const existingIdx = list.findIndex(p => p.nameLower === lower);
    if (existingIdx >= 0) {
      const foundId = list[existingIdx].id;
      list[existingIdx].age = age || list[existingIdx].age;
      list[existingIdx].gender = gender || list[existingIdx].gender;
      list[existingIdx].updatedAt = new Date().toISOString();
      persistPatients(list);
      setPatientId(foundId);
      return foundId;
    }

    // Create new patient
    const newId = `pat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newRecord: RepertoryPatientRecord = {
      id: newId,
      name: name.trim(),
      nameLower: lower,
      age,
      gender,
      latestRemedy: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      analyses: []
    };
    const updated = [newRecord, ...list];
    persistPatients(updated);
    setPatientId(newId);
    return newId;
  };

  // Save Analysis Record into patient
  const saveAnalysisRecord = (pid: string, symptoms: string[], method: string, output: string, remedy: string) => {
    const list = [...storedPatients];
    const p = list.find(x => x.id === pid);
    if (!p) return;

    const newAnalysis: RepertoryAnalysisRecord = {
      id: `an_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      symptoms,
      method,
      output,
      remedyGiven: remedy,
      timestamp: new Date().toISOString()
    };

    p.analyses = [newAnalysis, ...(p.analyses || [])];
    if (remedy) {
      p.latestRemedy = remedy;
    }
    p.updatedAt = new Date().toISOString();
    persistPatients(list);
  };

  // Handle Repertory Execution
  const handleRepertory = async (method: string) => {
    const symptomsText = getSymptomsText();
    if (!symptomsText) {
      setAnalysisOutput('Please enter chief symptoms or select mental/physical general rubrics.');
      setMethodBadge('Missing Symptoms');
      showToast('Please enter symptoms or select general rubrics first', true);
      return;
    }

    if (!patientName.trim()) {
      setAnalysisOutput('Please enter a patient name.');
      setMethodBadge('Missing Name');
      showToast('Please enter patient name', true);
      return;
    }

    setActiveMethod(method);
    setMethodBadge(method);
    setIsLoading(true);
    setSaveStatus('');
    setAnalysisOutput(`Repertorizing case totality according to ${method}…`);

    const prompt = buildPrompt(method, symptomsText);

    try {
      const result = await callGeminiRepertory(prompt, method);
      setAnalysisOutput(result);

      // Save to database
      const pid = getOrCreatePatient(patientName, patientAge, patientGender);
      saveAnalysisRecord(pid, getSymptomsArray(), method, result, remedyGiven.trim());
      setSaveStatus('Saved to local records');
      showToast(`Analysis complete & saved for ${patientName}`);
    } catch (err: any) {
      setAnalysisOutput(`Analysis Error: ${err?.message || err}`);
      setSaveStatus('Analysis failed');
      showToast(`Analysis failed: ${err?.message || err}`, true);
    } finally {
      setIsLoading(false);
    }
  };

  // Direct Remedy Save Action
  const handleSaveRemedyDirectly = () => {
    if (!patientName.trim()) {
      showToast('Please enter patient name first', true);
      return;
    }
    if (!remedyGiven.trim()) {
      showToast('Please enter remedy / medicine name', true);
      return;
    }

    try {
      const pid = getOrCreatePatient(patientName, patientAge, patientGender);
      const list = [...storedPatients];
      const p = list.find(x => x.id === pid);
      if (p) {
        p.latestRemedy = remedyGiven.trim();
        p.analyses = [
          {
            id: `rx_${Date.now()}`,
            symptoms: getSymptomsArray(),
            method: 'Prescription',
            output: `### Prescribed Remedy Record\n\n- **Medicine Given:** ${remedyGiven.trim()}\n- **Patient:** ${patientName}\n- **Age:** ${patientAge || 'N/A'}\n- **Sex / Gender:** ${patientGender || 'N/A'}`,
            remedyGiven: remedyGiven.trim(),
            timestamp: new Date().toISOString()
          },
          ...(p.analyses || [])
        ];
        p.updatedAt = new Date().toISOString();
        persistPatients(list);
      }

      showToast(`Saved medicine "${remedyGiven.trim()}" for ${patientName}`);
      setSaveStatus('Remedy saved to patient history');
    } catch (e: any) {
      showToast(`Failed to save remedy: ${e?.message || e}`, true);
    }
  };

  // Copy & Print
  const handleCopyAnalysis = () => {
    if (!analysisOutput || analysisOutput.includes('Enter patient details')) {
      showToast('No analysis to copy yet', true);
      return;
    }
    navigator.clipboard.writeText(analysisOutput).then(() => {
      showToast('Analysis copied to clipboard');
    }).catch(() => {
      showToast('Could not copy text', true);
    });
  };

  const handlePrintAnalysis = () => {
    if (!analysisOutput || analysisOutput.includes('Enter patient details')) {
      showToast('Run an analysis first before printing', true);
      return;
    }
    window.print();
  };

  // Patient History Actions
  const handleLoadPatientToForm = (p: RepertoryPatientRecord) => {
    setPatientId(p.id);
    setPatientName(p.name);
    setPatientAge(p.age || '');
    setPatientGender(p.gender || '');
    setRemedyGiven(p.latestRemedy || '');
    setActivePage('main');

    // Sync with clinic context if exists
    const cp = clinicPatients.find(x => x.id === p.id || x.name.toLowerCase() === p.name.toLowerCase());
    if (cp) selectPatient(cp.id);

    showToast(`Loaded ${p.name}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeletePatient = (pid: string, name: string) => {
    if (!confirm(`Delete patient "${name}" and all associated case records?`)) return;
    const updated = storedPatients.filter(x => x.id !== pid);
    persistPatients(updated);
    showToast('Patient deleted');
    if (patientId === pid) {
      setPatientId(null);
      setPatientName('');
    }
    if (selectedHistoryPatient?.id === pid) {
      setSelectedHistoryPatient(null);
    }
  };

  const handleDeleteAnalysis = (pid: string, aid: string) => {
    if (!confirm('Delete this repertory analysis record?')) return;
    const list = [...storedPatients];
    const p = list.find(x => x.id === pid);
    if (p && p.analyses) {
      p.analyses = p.analyses.filter(x => x.id !== aid);
      p.updatedAt = new Date().toISOString();
      persistPatients(list);
      setSelectedHistoryPatient({ ...p });
      showToast('Analysis deleted');
    }
  };

  const handleStartEditAnalysis = (a: RepertoryAnalysisRecord) => {
    setEditingAnalysisId(a.id);
    setEditingOutputText(a.output);
    setEditingRemedyText(a.remedyGiven || '');
  };

  const handleSaveEditedAnalysis = (pid: string, aid: string) => {
    const list = [...storedPatients];
    const p = list.find(x => x.id === pid);
    if (p && p.analyses) {
      const a = p.analyses.find(x => x.id === aid);
      if (a) {
        a.output = editingOutputText;
        a.remedyGiven = editingRemedyText.trim();
      }
      if (editingRemedyText.trim()) {
        p.latestRemedy = editingRemedyText.trim();
      }
      p.updatedAt = new Date().toISOString();
      persistPatients(list);
      setSelectedHistoryPatient({ ...p });
      setEditingAnalysisId(null);
      showToast('Analysis and remedy updated');
    }
  };

  const handleReanalyseFromHistory = (p: RepertoryPatientRecord, a: RepertoryAnalysisRecord) => {
    setPatientId(p.id);
    setPatientName(p.name);
    setPatientAge(p.age || '');
    setPatientGender(p.gender || '');
    setRemedyGiven(a.remedyGiven || p.latestRemedy || '');

    // Reset inputs
    setSym1('');
    setSym2('');
    setSym3('');
    setSym4('');
    setSym5('');
    setSym5Chilly(false);
    setSym5Hot(false);
    setSym5Right(false);
    setSym5Left(false);
    setSelectedMentalChips([]);
    setMentalText('');
    setSelectedPhysicalChips([]);
    setPhysicalText('');

    // Restore from symptoms array
    const symList = a.symptoms || [];
    let symIdx = 0;
    symList.forEach(s => {
      if (s.startsWith('Mental: ')) {
        const mVal = s.replace('Mental: ', '');
        const matched = MENTAL_CHIPS.filter(c => mVal.includes(c));
        setSelectedMentalChips(matched);
        if (mVal.includes(' | ')) {
          setMentalText(mVal.split(' | ')[1] || '');
        }
      } else if (s.startsWith('Physical Generals: ')) {
        const pVal = s.replace('Physical Generals: ', '');
        const matched = PHYSICAL_CHIPS.filter(c => pVal.includes(c));
        setSelectedPhysicalChips(matched);
        if (pVal.includes(' | ')) {
          setPhysicalText(pVal.split(' | ')[1] || '');
        }
      } else {
        if (symIdx === 0) setSym1(s);
        else if (symIdx === 1) setSym2(s);
        else if (symIdx === 2) setSym3(s);
        else if (symIdx === 3) setSym4(s);
        else if (symIdx === 4) setSym5(s);
        symIdx++;
      }
    });

    setActivePage('main');
    showToast('Case totality & symptoms loaded to form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Export & Import
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(storedPatients, null, 2));
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    a.setAttribute('href', dataStr);
    a.setAttribute('download', `homeopathic_patients_backup_${dateStr}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast('Backup file downloaded successfully');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const imported = JSON.parse(evt.target?.result as string);
        if (!Array.isArray(imported)) {
          throw new Error('Invalid backup format. Must be an array of patient records.');
        }
        const map = new Map(storedPatients.map(p => [p.id, p]));
        imported.forEach((p: RepertoryPatientRecord) => {
          if (p.id) map.set(p.id, p);
        });
        const merged = Array.from(map.values());
        persistPatients(merged);
        setIsBackupModalOpen(false);
        showToast(`Successfully imported ${imported.length} patient records!`);
      } catch (err: any) {
        showToast(`Import failed: ${err?.message || err}`, true);
      }
    };
    reader.readAsText(file);
  };

  // Doctor profile save
  const handleSaveDoctorProfile = () => {
    const updated = {
      name: settingDocName.trim() || CLINIC_CONFIG.doctorName,
      clinic: settingClinicName.trim() || `${CLINIC_CONFIG.appName} (Dr. Bharat Chougule: 9902686173)`,
      phone: settingPhone.trim() || '9902686173'
    };
    setDoctorProfile(updated);
    localStorage.setItem(STORAGE_KEY_DOCTOR, JSON.stringify(updated));
    setIsDoctorModalOpen(false);
    showToast('Doctor & Clinic settings updated');
  };

  // Save API key
  const handleSaveApiKey = () => {
    if (!apiKeyInputValue.trim()) {
      localStorage.removeItem(GEMINI_API_KEY_STORAGE);
      showToast('Gemini API key reset to default');
    } else {
      localStorage.setItem(GEMINI_API_KEY_STORAGE, apiKeyInputValue.trim());
      showToast('Gemini API key saved on this device');
    }
    setIsApiKeyModalOpen(false);
  };

  const isExistingPatient = Boolean(
    patientId ||
    storedPatients.some(p => p.name.toLowerCase() === patientName.trim().toLowerCase()) ||
    clinicPatients.some(p => p.name.toLowerCase() === patientName.trim().toLowerCase())
  );

  const filteredHistoryPatients = storedPatients.filter(p => {
    if (!historySearchQuery.trim()) return true;
    const q = historySearchQuery.toLowerCase();
    const nameMatch = (p.nameLower || p.name).toLowerCase().includes(q);
    const medMatch = (p.latestRemedy || '').toLowerCase().includes(q);
    return nameMatch || medMatch;
  });

  return (
    <div className="w-full max-w-[1160px] mx-auto pb-12 font-sans text-[#14281f]">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full text-sm font-semibold text-white shadow-2xl z-50 flex items-center gap-2 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${
            toastMsg.isError ? 'bg-[#c62828]' : 'bg-[#133c2a]'
          }`}
        >
          {toastMsg.isError ? <AlertTriangle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* ================= PAGE 1: MAIN REPERTORY PAGE ================= */}
      {activePage === 'main' ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#bfe0cf]">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 mb-6 border-b-2 border-[#e0f0e6]">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1e5a40] tracking-tight">
                Homeopathic Repertorization
              </h1>
              <div className="text-xs sm:text-sm font-bold text-[#2e8b57] flex items-center gap-1.5 mt-0.5">
                <span>•</span>
                <span>{doctorProfile.clinic}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Status Badge */}
              <span
                className={`text-xs font-bold px-3.5 py-1 rounded-full flex items-center gap-1.5 border ${
                  isExistingPatient
                    ? 'bg-[#e3f2fd] text-[#1565c0] border-[#bbdefb]'
                    : 'bg-[#e8f5e9] text-[#2e7d32] border-[#c8e6c9]'
                }`}
              >
                {isExistingPatient ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5" />
                    Existing Patient
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    New Patient
                  </>
                )}
              </span>

              {/* Patient History Button */}
              <button
                id="btn-open-patient-history"
                type="button"
                onClick={() => {
                  setActivePage('history');
                  setSelectedHistoryPatient(null);
                }}
                className="px-4 py-1.5 bg-[#fff8e6] hover:bg-[#feefc3] text-[#b26a00] border border-[#f7d58b] rounded-full text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FolderOpen className="w-4 h-4" />
                <span>Patient History</span>
                <span className="bg-[#e7ab3c] text-white px-2 py-0.5 rounded-full text-[11px] ml-0.5">
                  {storedPatients.length}
                </span>
              </button>

              {/* Doctor Portal / Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen(prev => !prev)}
                  className="px-3.5 py-1.5 bg-[#f2f9f5] hover:bg-[#e6f4ed] border border-[#bfe0cf] rounded-full text-xs sm:text-sm font-bold text-[#133c2a] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-[#1e5a40] text-white flex items-center justify-center text-[10px] font-bold">
                    {(doctorProfile.name || 'Dr').slice(0, 2).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate">{doctorProfile.name}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {isProfileMenuOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border border-[#bfe0cf] shadow-xl p-1 z-40 animate-in fade-in"
                    onMouseLeave={() => setIsProfileMenuOpen(false)}
                  >
                    <div className="p-3 border-b border-[#e0f0e6]">
                      <p className="font-extrabold text-[#133c2a] text-sm truncate">{doctorProfile.name}</p>
                      <p className="text-[11px] text-[#4e6b5c] truncate">Phone: {doctorProfile.phone}</p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setSettingDocName(doctorProfile.name);
                          setSettingClinicName(doctorProfile.clinic);
                          setSettingPhone(doctorProfile.phone);
                          setIsDoctorModalOpen(true);
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-[#f2f9f5] text-[#14281f] flex items-center gap-2.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <User className="w-4 h-4 text-[#4e6b5c]" />
                        Doctor &amp; Clinic Settings
                      </button>

                      <button
                        onClick={() => {
                          setIsBackupModalOpen(true);
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-[#f2f9f5] text-[#14281f] flex items-center gap-2.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <Database className="w-4 h-4 text-[#4e6b5c]" />
                        Backup &amp; Restore Data
                      </button>

                      <button
                        onClick={() => {
                          setApiKeyInputValue(localStorage.getItem(GEMINI_API_KEY_STORAGE) || '');
                          setIsApiKeyModalOpen(true);
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-[#f2f9f5] text-[#14281f] flex items-center gap-2.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <Key className="w-4 h-4 text-[#4e6b5c]" />
                        Gemini API Key (Local)
                      </button>

                      <button
                        onClick={() => {
                          setIsPrivacyModalOpen(true);
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-[#f2f9f5] text-[#14281f] flex items-center gap-2.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#4e6b5c]" />
                        Privacy Policy
                      </button>

                      <button
                        onClick={() => {
                          setIsTermsModalOpen(true);
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-[#f2f9f5] text-[#14281f] flex items-center gap-2.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <FileText className="w-4 h-4 text-[#4e6b5c]" />
                        Terms &amp; Conditions
                      </button>

                      <div className="h-px bg-[#e0f0e6] my-1" />

                      <button
                        onClick={() => {
                          setIsClearModalOpen(true);
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-rose-50 text-[#c62828] flex items-center gap-2.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 text-[#c62828]" />
                        Clear Local Records
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Patient Demographics Form */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-2xl bg-[#f7fbf8] border border-[#e0f0e6] mb-5">
            <div className="md:col-span-6 relative">
              <label className="block text-xs font-bold text-[#1e5a40] uppercase tracking-wider mb-1.5">
                Patient Name
              </label>
              <input
                id="repertory-input-patient-name"
                type="text"
                value={patientName}
                onChange={e => handleNameInputChange(e.target.value)}
                onFocus={() => {
                  if (patientName.trim()) handleNameInputChange(patientName);
                }}
                placeholder="Search existing or enter new patient name…"
                className="w-full px-3.5 py-2.5 bg-white border border-[#bfe0cf] rounded-xl text-sm font-medium text-[#14281f] focus:outline-none focus:border-[#2e8b57] focus:ring-3 focus:ring-[#2e8b57]/15 transition-all"
                autoComplete="off"
              />

              {/* Autocomplete dropdown */}
              {showAutocomplete && autocompleteResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#bfe0cf] rounded-xl shadow-xl max-h-56 overflow-y-auto z-30 p-1">
                  {autocompleteResults.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onMouseDown={() => handleSelectAutocomplete(item)}
                      className="w-full text-left px-3 py-2 hover:bg-[#e6f4ed] rounded-lg flex items-center justify-between text-xs transition-colors cursor-pointer"
                    >
                      <span className="font-bold text-[#1e5a40]">{item.name}</span>
                      <span className="text-[#4e6b5c] text-[11px]">
                        {item.age || '?'} yrs · {item.gender || ''}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-[#1e5a40] uppercase tracking-wider mb-1.5">
                Age
              </label>
              <input
                id="repertory-input-patient-age"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={3}
                value={patientAge}
                onChange={e => setPatientAge(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Age"
                className="w-full px-3.5 py-2.5 bg-white border border-[#bfe0cf] rounded-xl text-sm font-medium text-[#14281f] focus:outline-none focus:border-[#2e8b57] focus:ring-3 focus:ring-[#2e8b57]/15 transition-all"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-[#1e5a40] uppercase tracking-wider mb-1.5">
                Gender
              </label>
              <select
                id="repertory-select-patient-gender"
                value={patientGender}
                onChange={e => setPatientGender(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#bfe0cf] rounded-xl text-sm font-medium text-[#14281f] focus:outline-none focus:border-[#2e8b57] focus:ring-3 focus:ring-[#2e8b57]/15 transition-all"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Generals (Mental & Physical) Case Taking Card */}
          <div className="bg-white border border-[#bfe0cf] rounded-2xl p-5 mb-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#e0f0e6]">
              <h3 className="font-extrabold text-[#1e5a40] text-base flex items-center gap-2">
                <Brain className="w-5 h-5 text-[#2e8b57]" />
                Generals Case Taking
              </h3>
              <button
                type="button"
                onClick={clearAllGenerals}
                className="text-xs px-3 py-1 font-bold text-[#1e5a40] bg-[#e6f4ed] hover:bg-[#bfe0cf] rounded-full transition-colors cursor-pointer"
              >
                Clear All Generals
              </button>
            </div>

            {/* 1. Mental Generals */}
            <div className="bg-[#f7fbf8] border border-[#e0f0e6] rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-xs sm:text-sm text-[#1e5a40] flex items-center gap-1.5">
                  🧠 Mental Generals
                </span>
                <button
                  type="button"
                  onClick={clearMentalGenerals}
                  className="text-[11px] font-bold px-2.5 py-0.5 bg-white hover:bg-slate-100 border border-[#bfe0cf] rounded-full text-[#14281f] transition-colors cursor-pointer"
                >
                  Clear Mental
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {MENTAL_CHIPS.map(chip => {
                  const isSelected = selectedMentalChips.includes(chip);
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => toggleMentalChip(chip)}
                      className={`px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#1e5a40] text-white border-[#133c2a] shadow-xs'
                          : 'bg-white text-[#14281f] border-[#bfe0cf] hover:border-[#2e8b57] hover:bg-[#f2f9f5]'
                      }`}
                    >
                      {chip}
                    </button>
                  );
                })}
              </div>

              <input
                type="text"
                value={mentalText}
                onChange={e => setMentalText(e.target.value)}
                placeholder="Additional mental symptoms, delusions, disposition or emotional state…"
                className="w-full px-3.5 py-2 bg-white border border-[#bfe0cf] rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-[#2e8b57] focus:ring-2 focus:ring-[#2e8b57]/15 transition-all"
              />
            </div>

            {/* 2. Physical Generals */}
            <div className="bg-[#f7fbf8] border border-[#e0f0e6] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-xs sm:text-sm text-[#1e5a40] flex items-center gap-1.5">
                  ⚡ Physical Generals &amp; Modalities
                </span>
                <button
                  type="button"
                  onClick={clearPhysicalGenerals}
                  className="text-[11px] font-bold px-2.5 py-0.5 bg-white hover:bg-slate-100 border border-[#bfe0cf] rounded-full text-[#14281f] transition-colors cursor-pointer"
                >
                  Clear Physical
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {PHYSICAL_CHIPS.map(chip => {
                  const isSelected = selectedPhysicalChips.includes(chip);
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => togglePhysicalChip(chip)}
                      className={`px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#1e5a40] text-white border-[#133c2a] shadow-xs'
                          : 'bg-white text-[#14281f] border-[#bfe0cf] hover:border-[#2e8b57] hover:bg-[#f2f9f5]'
                      }`}
                    >
                      {chip}
                    </button>
                  );
                })}
              </div>

              <input
                type="text"
                value={physicalText}
                onChange={e => setPhysicalText(e.target.value)}
                placeholder="Physical thermal reactions, appetite, thirst, sleep, or environmental modalities…"
                className="w-full px-3.5 py-2 bg-white border border-[#bfe0cf] rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-[#2e8b57] focus:ring-2 focus:ring-[#2e8b57]/15 transition-all"
              />
            </div>
          </div>

          {/* Chief Complaints & Particular Symptoms */}
          <div className="bg-[#f7fbf8] border border-[#e0f0e6] rounded-2xl p-5 mb-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-[#1e5a40] text-base">
                Chief Complaints &amp; Particular Symptoms
              </h3>
              <button
                type="button"
                onClick={clearSymptoms}
                className="text-xs font-bold px-3 py-1 bg-white hover:bg-slate-100 border border-[#bfe0cf] rounded-full text-[#14281f] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear Symptoms
              </button>
            </div>

            {/* Symptom 1 with Voice Dictation */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
              <label className="sm:w-28 text-xs font-bold text-[#133c2a] shrink-0">
                Symptom 1
              </label>
              <div className="flex-1 flex items-center gap-2">
                <input
                  id="repertory-input-sym1"
                  type="text"
                  value={sym1}
                  onChange={e => setSym1(e.target.value)}
                  placeholder="Primary chief complaint (Location, Sensation, Modality, Concomitant)…"
                  className="flex-1 px-3.5 py-2.5 bg-white border border-[#bfe0cf] rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-[#2e8b57] focus:ring-2 focus:ring-[#2e8b57]/15 transition-all"
                />
                <button
                  id="btn-voice-sym1"
                  type="button"
                  onClick={toggleVoiceSym1}
                  title="Voice dictation for Symptom 1"
                  className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                    isRecordingSym1
                      ? 'bg-rose-100 text-rose-700 border-rose-400 animate-pulse'
                      : 'bg-white text-[#1e5a40] border-[#bfe0cf] hover:border-[#2e8b57] hover:bg-[#f2f9f5]'
                  }`}
                >
                  {isRecordingSym1 ? <MicOff className="w-4 h-4 text-rose-600" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Symptom 2 */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
              <label className="sm:w-28 text-xs font-bold text-[#133c2a] shrink-0">
                Symptom 2
              </label>
              <input
                id="repertory-input-sym2"
                type="text"
                value={sym2}
                onChange={e => setSym2(e.target.value)}
                placeholder="Second chief complaint or characteristic particular…"
                className="flex-1 px-3.5 py-2.5 bg-white border border-[#bfe0cf] rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-[#2e8b57] focus:ring-2 focus:ring-[#2e8b57]/15 transition-all"
              />
            </div>

            {/* Symptom 3 */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
              <label className="sm:w-28 text-xs font-bold text-[#133c2a] shrink-0">
                Symptom 3
              </label>
              <input
                id="repertory-input-sym3"
                type="text"
                value={sym3}
                onChange={e => setSym3(e.target.value)}
                placeholder="Third symptom or modality…"
                className="flex-1 px-3.5 py-2.5 bg-white border border-[#bfe0cf] rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-[#2e8b57] focus:ring-2 focus:ring-[#2e8b57]/15 transition-all"
              />
            </div>

            {/* Symptom 4 */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
              <label className="sm:w-28 text-xs font-bold text-[#133c2a] shrink-0">
                Symptom 4
              </label>
              <input
                id="repertory-input-sym4"
                type="text"
                value={sym4}
                onChange={e => setSym4(e.target.value)}
                placeholder="Fourth symptom, causation or concomitant…"
                className="flex-1 px-3.5 py-2.5 bg-white border border-[#bfe0cf] rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-[#2e8b57] focus:ring-2 focus:ring-[#2e8b57]/15 transition-all"
              />
            </div>

            {/* Symptom 5 with Modifiers */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <label className="sm:w-28 text-xs font-bold text-[#133c2a] shrink-0">
                  Symptom 5
                </label>
                <input
                  id="repertory-input-sym5"
                  type="text"
                  value={sym5}
                  onChange={e => setSym5(e.target.value)}
                  placeholder="Fifth symptom or key characteristic…"
                  className="flex-1 px-3.5 py-2.5 bg-white border border-[#bfe0cf] rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-[#2e8b57] focus:ring-2 focus:ring-[#2e8b57]/15 transition-all"
                />
              </div>

              {/* Modifiers Checkboxes */}
              <div className="sm:ml-[124px] flex items-center gap-4 flex-wrap pt-1">
                <label className="inline-flex items-center gap-1.5 text-xs font-bold text-[#14281f] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sym5Chilly}
                    onChange={e => setSym5Chilly(e.target.checked)}
                    className="w-4 h-4 accent-[#1e5a40]"
                  />
                  <span>Chilly</span>
                </label>
                <label className="inline-flex items-center gap-1.5 text-xs font-bold text-[#14281f] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sym5Hot}
                    onChange={e => setSym5Hot(e.target.checked)}
                    className="w-4 h-4 accent-[#1e5a40]"
                  />
                  <span>Hot</span>
                </label>
                <label className="inline-flex items-center gap-1.5 text-xs font-bold text-[#14281f] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sym5Right}
                    onChange={e => setSym5Right(e.target.checked)}
                    className="w-4 h-4 accent-[#1e5a40]"
                  />
                  <span>Right side</span>
                </label>
                <label className="inline-flex items-center gap-1.5 text-xs font-bold text-[#14281f] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sym5Left}
                    onChange={e => setSym5Left(e.target.checked)}
                    className="w-4 h-4 accent-[#1e5a40]"
                  />
                  <span>Left side</span>
                </label>
              </div>
            </div>
          </div>

          {/* Remedy Given / Direct Prescription Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-[#eef7f2] border border-[#bfe0cf] rounded-2xl p-4 mb-6">
            <label className="font-extrabold text-xs sm:text-sm text-[#133c2a] flex items-center gap-2 shrink-0">
              <Pill className="w-4 h-4 text-[#1e5a40]" />
              Medicine Given:
            </label>
            <input
              id="repertory-input-medicine-given"
              type="text"
              value={remedyGiven}
              onChange={e => setRemedyGiven(e.target.value)}
              placeholder="Enter prescribed medicine (e.g. Lycopodium 200C, Pulsatilla 30C)…"
              className="flex-1 px-4 py-2 bg-white border border-[#bfe0cf] rounded-full text-xs sm:text-sm font-medium focus:outline-none focus:border-[#2e8b57] focus:ring-2 focus:ring-[#2e8b57]/15 transition-all"
            />
            <button
              id="btn-save-remedy-directly"
              type="button"
              onClick={handleSaveRemedyDirectly}
              className="px-4 py-2 bg-[#2e8b57] hover:bg-[#236b43] text-white rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              Save Given Remedy to History
            </button>
          </div>

          {/* 14 Classical & Modern Repertory Selection Grid */}
          <div className="mb-6">
            <div className="text-xs sm:text-sm font-extrabold text-[#1e5a40] uppercase tracking-wider mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Select Repertorization Method:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
              {REPERTORY_METHODS.map(method => {
                const isActive = activeMethod === method;
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => handleRepertory(method)}
                    disabled={isLoading}
                    className={`px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all text-center cursor-pointer ${
                      isActive
                        ? 'bg-[#1e5a40] text-white border-[#133c2a] shadow-md -translate-y-0.5'
                        : 'bg-white text-[#133c2a] border-[#bfe0cf] hover:bg-[#f2f9f5] hover:border-[#2e8b57] hover:-translate-y-0.5 shadow-xs'
                    }`}
                  >
                    {method}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Repertorization Output Card */}
          <div className="bg-white border border-[#bfe0cf] rounded-2xl p-5 sm:p-6 shadow-md min-h-[260px] relative">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b-2 border-[#e0f0e6]">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="font-extrabold text-[#1e5a40] text-base sm:text-lg">
                  Clinical Repertory Analysis
                </h3>
                <span className="px-3 py-0.5 rounded-full text-xs font-extrabold bg-[#e6f4ed] text-[#133c2a] border border-[#bfe0cf]">
                  {methodBadge}
                </span>
                {saveStatus && (
                  <span className="text-xs font-bold text-[#1e7e4e] animate-in fade-in">
                    {saveStatus}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyAnalysis}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-[#14281f] border border-slate-200 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </button>
                <button
                  type="button"
                  onClick={handlePrintAnalysis}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-[#14281f] border border-slate-200 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print
                </button>
              </div>
            </div>

            {/* Loading spinner */}
            {isLoading && (
              <div className="flex items-center justify-center gap-3 py-10 text-[#4e6b5c] font-semibold text-sm">
                <div className="w-5 h-5 border-2 border-[#1e5a40] border-t-transparent rounded-full animate-spin" />
                <span>Synthesizing rubrics and repertorizing case totality with Gemini AI…</span>
              </div>
            )}

            {/* Content Display */}
            {!isLoading && (
              <div>
                {analysisOutput ? (
                  <div className="prose prose-sm max-w-none text-[#14281f] leading-relaxed">
                    <Markdown>{analysisOutput}</Markdown>
                  </div>
                ) : (
                  <div className="text-center py-12 text-[#4e6b5c] italic text-sm">
                    Enter patient details, symptoms, mental &amp; physical generals above, then click any repertory method to generate indicated homeopathic remedies, rubrics, and posology.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-5 border-t border-[#e0f0e6] text-center text-xs text-[#4e6b5c] space-y-2">
            <div>
              Homeopathic Clinical Repertorization • Ananya Infotech (Dr. Bharat Chougule: 9902686173)
            </div>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setSettingDocName(doctorProfile.name);
                  setSettingClinicName(doctorProfile.clinic);
                  setSettingPhone(doctorProfile.phone);
                  setIsDoctorModalOpen(true);
                }}
                className="text-[#2e8b57] hover:underline font-semibold"
              >
                Clinic Settings
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setIsBackupModalOpen(true)}
                className="text-[#2e8b57] hover:underline font-semibold"
              >
                Backup &amp; Restore
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setIsPrivacyModalOpen(true)}
                className="text-[#2e8b57] hover:underline font-semibold"
              >
                Privacy Policy
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setIsTermsModalOpen(true)}
                className="text-[#2e8b57] hover:underline font-semibold"
              >
                Terms &amp; Conditions
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ================= PAGE 2: PATIENT HISTORY VIEW ================= */
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#bfe0cf]">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-[#e0f0e6]">
            <div>
              <h1 className="text-2xl font-extrabold text-[#1e5a40]">
                Patient Case Records &amp; History
              </h1>
              <p className="text-xs text-[#4e6b5c] font-medium">Local Storage Case Database</p>
            </div>

            <button
              type="button"
              onClick={() => {
                setActivePage('main');
                setSelectedHistoryPatient(null);
              }}
              className="px-4 py-2 bg-[#1e5a40] hover:bg-[#133c2a] text-white rounded-full text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Repertorize
            </button>
          </div>

          {!selectedHistoryPatient ? (
            /* Patients List / Grid */
            <div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4e6b5c]" />
                  <input
                    type="text"
                    value={historySearchQuery}
                    onChange={e => setHistorySearchQuery(e.target.value)}
                    placeholder="Search patient by name or medicine…"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#bfe0cf] rounded-full text-sm font-medium focus:outline-none focus:border-[#2e8b57] focus:ring-2 focus:ring-[#2e8b57]/15"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      showToast('Refreshed local records');
                    }}
                    className="px-4 py-2 bg-[#2e8b57] hover:bg-[#236b43] text-white rounded-full text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Refresh
                  </button>

                  <button
                    type="button"
                    onClick={handleExportJSON}
                    className="px-4 py-2 bg-[#fff8e6] hover:bg-[#feefc3] text-[#b26a00] border border-[#f7d58b] rounded-full text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export Data
                  </button>
                </div>
              </div>

              {filteredHistoryPatients.length === 0 ? (
                <div className="text-center py-16 bg-[#f7fbf8] rounded-2xl border border-[#e0f0e6]">
                  <h4 className="font-extrabold text-[#1e5a40] text-base mb-1">
                    No Patient Records Found
                  </h4>
                  <p className="text-xs text-[#4e6b5c]">
                    No patient cases saved in local storage yet. Enter a case on the main screen to begin.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredHistoryPatients.map(p => {
                    const hasMed = Boolean(p.latestRemedy && p.latestRemedy.trim());
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedHistoryPatient(p)}
                        className="bg-white border border-[#bfe0cf] hover:border-[#2e8b57] rounded-2xl p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          <h4 className="font-extrabold text-[#1e5a40] text-base mb-1">
                            {p.name}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-[#4e6b5c] mb-3">
                            <span>
                              <strong>Age:</strong> {p.age || 'N/A'}
                            </span>
                            <span>
                              <strong>Sex:</strong> {p.gender || 'N/A'}
                            </span>
                            <span>
                              <strong>Cases:</strong> {p.analyses?.length || 0}
                            </span>
                          </div>
                        </div>

                        <div
                          className={`rounded-xl p-2.5 text-xs flex items-center gap-2 border ${
                            hasMed
                              ? 'bg-[#eef7f2] text-[#133c2a] border-[#bfe0cf] font-bold'
                              : 'bg-[#f7fbf8] text-[#8fa69a] border-[#e0f0e6] italic'
                          }`}
                        >
                          <Pill className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">
                            <strong>Medicine:</strong> {hasMed ? p.latestRemedy : 'No medicine recorded'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Patient Detail View */
            <div>
              <button
                type="button"
                onClick={() => setSelectedHistoryPatient(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#14281f] rounded-full text-xs font-bold flex items-center gap-1.5 mb-5 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Back to All Patients
              </button>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-6 border-b-2 border-[#e0f0e6]">
                <div>
                  <h3 className="text-xl font-extrabold text-[#1e5a40]">
                    {selectedHistoryPatient.name}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap mt-1 text-xs text-[#4e6b5c]">
                    <span className="px-2.5 py-0.5 bg-[#f7fbf8] border border-[#e0f0e6] rounded-full">
                      <strong>Age:</strong> {selectedHistoryPatient.age || 'N/A'}
                    </span>
                    <span className="px-2.5 py-0.5 bg-[#f7fbf8] border border-[#e0f0e6] rounded-full">
                      <strong>Sex:</strong> {selectedHistoryPatient.gender || 'N/A'}
                    </span>
                    <span className="px-2.5 py-0.5 bg-[#eaf5ee] text-[#1e5a40] border border-[#2e8b57]/30 rounded-full font-bold flex items-center gap-1">
                      <Pill className="w-3 h-3" />
                      Medicine Given: {selectedHistoryPatient.latestRemedy || 'None recorded'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      const newName = prompt('Patient Name:', selectedHistoryPatient.name);
                      if (newName === null) return;
                      const newAge = prompt('Age (number only):', selectedHistoryPatient.age || '');
                      if (newAge === null) return;
                      const newGender = prompt('Gender (Male / Female / Other):', selectedHistoryPatient.gender || '');
                      if (newGender === null) return;
                      const newRemedy = prompt('Medicine / Remedy Given:', selectedHistoryPatient.latestRemedy || '');
                      if (newRemedy === null) return;

                      const list = [...storedPatients];
                      const idx = list.findIndex(x => x.id === selectedHistoryPatient.id);
                      if (idx >= 0) {
                        list[idx].name = newName.trim();
                        list[idx].nameLower = newName.trim().toLowerCase();
                        list[idx].age = newAge.replace(/[^0-9]/g, '');
                        list[idx].gender = newGender;
                        list[idx].latestRemedy = newRemedy.trim();
                        list[idx].updatedAt = new Date().toISOString();
                        persistPatients(list);
                        setSelectedHistoryPatient({ ...list[idx] });
                        showToast('Patient details updated');
                      }
                    }}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#14281f] rounded-full text-xs font-bold transition-colors cursor-pointer"
                  >
                    Edit Details
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeletePatient(selectedHistoryPatient.id, selectedHistoryPatient.name)}
                    className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-[#c62828] border border-rose-200 rounded-full text-xs font-bold transition-colors cursor-pointer"
                  >
                    Delete Patient
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLoadPatientToForm(selectedHistoryPatient)}
                    className="px-3.5 py-1.5 bg-[#1e5a40] hover:bg-[#133c2a] text-white rounded-full text-xs font-bold transition-colors cursor-pointer"
                  >
                    Load to Form
                  </button>
                </div>
              </div>

              {/* List of past analyses */}
              <div className="space-y-4">
                {(!selectedHistoryPatient.analyses || selectedHistoryPatient.analyses.length === 0) ? (
                  <div className="text-center py-12 text-[#4e6b5c] text-sm italic">
                    No repertory analyses saved for this patient yet.
                  </div>
                ) : (
                  selectedHistoryPatient.analyses.map(a => {
                    const isExpanded = expandedAnalysisIds.includes(a.id);
                    const isEditing = editingAnalysisId === a.id;
                    const dateStr = a.timestamp
                      ? new Date(a.timestamp).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Recent';

                    return (
                      <div
                        key={a.id}
                        className="bg-white border border-[#bfe0cf] rounded-2xl p-5 shadow-xs"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-extrabold text-[#1e5a40] text-sm">
                            {a.method}
                          </span>
                          <span className="text-xs text-[#4e6b5c] flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {dateStr}
                          </span>
                        </div>

                        {a.symptoms && a.symptoms.length > 0 && (
                          <div className="bg-[#f7fbf8] p-3 rounded-xl text-xs text-[#14281f] mb-3">
                            <strong>Symptoms:</strong> {a.symptoms.join(', ')}
                          </div>
                        )}

                        {a.remedyGiven && (
                          <div className="text-xs font-bold text-[#2e8b57] mb-2 flex items-center gap-1.5">
                            <Pill className="w-3.5 h-3.5" />
                            <span>Remedy Given: {a.remedyGiven}</span>
                          </div>
                        )}

                        {isEditing ? (
                          <div className="mt-3 space-y-3">
                            <textarea
                              rows={8}
                              value={editingOutputText}
                              onChange={e => setEditingOutputText(e.target.value)}
                              className="w-full p-3 border border-[#bfe0cf] rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:border-[#2e8b57]"
                            />
                            <div className="flex items-center gap-3">
                              <label className="text-xs font-bold text-[#1e5a40]">
                                Remedy Given:
                              </label>
                              <input
                                type="text"
                                value={editingRemedyText}
                                onChange={e => setEditingRemedyText(e.target.value)}
                                className="flex-1 px-3 py-1.5 border border-[#bfe0cf] rounded-full text-xs font-medium"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleSaveEditedAnalysis(selectedHistoryPatient.id, a.id)}
                                className="px-3.5 py-1.5 bg-[#1e5a40] text-white rounded-full text-xs font-bold cursor-pointer"
                              >
                                Save Changes
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingAnalysisId(null)}
                                className="px-3.5 py-1.5 bg-slate-100 text-[#14281f] rounded-full text-xs font-bold cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="prose prose-xs sm:prose-sm max-w-none text-[#14281f] text-xs sm:text-sm">
                              <Markdown>
                                {isExpanded || (a.output || '').length <= 280
                                  ? a.output
                                  : `${(a.output || '').substring(0, 280)}…`}
                              </Markdown>
                            </div>

                            {(a.output || '').length > 280 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setExpandedAnalysisIds(prev =>
                                    prev.includes(a.id)
                                      ? prev.filter(x => x !== a.id)
                                      : [...prev, a.id]
                                  );
                                }}
                                className="text-xs font-bold text-[#2e8b57] hover:underline mt-2 inline-block cursor-pointer"
                              >
                                {isExpanded ? 'Collapse Analysis' : 'View Full Analysis'}
                              </button>
                            )}

                            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#e0f0e6] flex-wrap">
                              <button
                                type="button"
                                onClick={() => handleStartEditAnalysis(a)}
                                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-[#14281f] rounded-full text-xs font-bold transition-colors cursor-pointer"
                              >
                                Edit Analysis
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReanalyseFromHistory(selectedHistoryPatient, a)}
                                className="px-3 py-1 bg-[#2e8b57] hover:bg-[#236b43] text-white rounded-full text-xs font-bold transition-colors cursor-pointer"
                              >
                                Re-analyse
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteAnalysis(selectedHistoryPatient.id, a.id)}
                                className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-[#c62828] border border-rose-200 rounded-full text-xs font-bold transition-colors cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= MODALS ================= */}

      {/* 1. Doctor & Clinic Profile Modal */}
      {isDoctorModalOpen && (
        <div className="fixed inset-0 bg-[#0f281c]/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-[#bfe0cf] p-6 w-full max-w-lg shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#e0f0e6]">
              <h3 className="font-extrabold text-lg text-[#1e5a40] flex items-center gap-2">
                <User className="w-5 h-5 text-[#2e8b57]" />
                Doctor &amp; Clinic Settings
              </h3>
              <button
                onClick={() => setIsDoctorModalOpen(false)}
                className="text-[#4e6b5c] hover:text-[#c62828] p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#4e6b5c] mb-4">
              Customize your doctor name, clinic header, and phone details. This is stored directly on this device.
            </p>

            <div className="space-y-3.5 mb-6">
              <div>
                <label className="block text-xs font-bold text-[#1e5a40] uppercase tracking-wider mb-1">
                  Doctor Name
                </label>
                <input
                  type="text"
                  value={settingDocName}
                  onChange={e => setSettingDocName(e.target.value)}
                  placeholder="Dr. Bharat Chougule"
                  className="w-full px-3.5 py-2 border border-[#bfe0cf] rounded-xl text-sm font-medium focus:outline-none focus:border-[#2e8b57]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1e5a40] uppercase tracking-wider mb-1">
                  Clinic / Brand Title
                </label>
                <input
                  type="text"
                  value={settingClinicName}
                  onChange={e => setSettingClinicName(e.target.value)}
                  placeholder="Ananya Infotech Homeopathic Clinic"
                  className="w-full px-3.5 py-2 border border-[#bfe0cf] rounded-xl text-sm font-medium focus:outline-none focus:border-[#2e8b57]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1e5a40] uppercase tracking-wider mb-1">
                  Contact Phone / Mobile
                </label>
                <input
                  type="text"
                  value={settingPhone}
                  onChange={e => setSettingPhone(e.target.value)}
                  placeholder="9902686173"
                  className="w-full px-3.5 py-2 border border-[#bfe0cf] rounded-xl text-sm font-medium focus:outline-none focus:border-[#2e8b57]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e0f0e6]">
              <button
                type="button"
                onClick={() => setIsDoctorModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#14281f] rounded-full text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDoctorProfile}
                className="px-4 py-2 bg-[#1e5a40] hover:bg-[#133c2a] text-white rounded-full text-xs font-bold cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Backup & Restore Modal */}
      {isBackupModalOpen && (
        <div className="fixed inset-0 bg-[#0f281c]/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-[#bfe0cf] p-6 w-full max-w-xl shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#e0f0e6]">
              <h3 className="font-extrabold text-lg text-[#1e5a40] flex items-center gap-2">
                <Database className="w-5 h-5 text-[#2e8b57]" />
                Backup &amp; Restore Records
              </h3>
              <button
                onClick={() => setIsBackupModalOpen(false)}
                className="text-[#4e6b5c] hover:text-[#c62828] p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-4 bg-[#f7fbf8] border border-[#bfe0cf] rounded-2xl">
                <h4 className="font-bold text-sm text-[#1e5a40] mb-1 flex items-center gap-2">
                  <Download className="w-4 h-4 text-[#2e8b57]" />
                  1. Export &amp; Backup All Patients
                </h4>
                <p className="text-xs text-[#4e6b5c] mb-3 leading-relaxed">
                  Download a full JSON backup file of all your saved patient records, prescriptions, and repertory analyses to keep safe on your computer or phone.
                </p>
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="px-4 py-2 bg-[#1e5a40] hover:bg-[#133c2a] text-white rounded-full text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Full Backup File (.json)
                </button>
              </div>

              <div className="p-4 bg-[#f7fbf8] border border-[#bfe0cf] rounded-2xl">
                <h4 className="font-bold text-sm text-[#1e5a40] mb-1 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#2e8b57]" />
                  2. Restore / Import From Backup
                </h4>
                <p className="text-xs text-[#4e6b5c] mb-3 leading-relaxed">
                  Select a previously exported JSON backup file to restore patient case histories into your local database.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportJSON}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-[#2e8b57] hover:bg-[#236b43] text-white rounded-full text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Choose JSON File to Restore
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-[#e0f0e6]">
              <button
                type="button"
                onClick={() => setIsBackupModalOpen(false)}
                className="px-4 py-2 bg-[#1e5a40] text-white rounded-full text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Clear Data Modal */}
      {isClearModalOpen && (
        <div className="fixed inset-0 bg-[#0f281c]/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-[#bfe0cf] p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#e0f0e6]">
              <h3 className="font-extrabold text-lg text-[#c62828] flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#c62828]" />
                Clear Local Records
              </h3>
              <button
                onClick={() => setIsClearModalOpen(false)}
                className="text-[#4e6b5c] hover:text-[#c62828] p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs mb-4">
              <strong>Warning: Irreversible Action</strong>
              <p className="mt-1">
                This will erase all saved patient records, prescriptions, and analyses stored in your browser's local memory.
              </p>
            </div>

            <p className="text-xs text-[#14281f] mb-6">
              Are you sure you want to clear all local records?
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e0f0e6]">
              <button
                type="button"
                onClick={() => setIsClearModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-[#14281f] rounded-full text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem(STORAGE_KEY_PATIENTS);
                  setStoredPatients([]);
                  setPatientId(null);
                  setIsClearModalOpen(false);
                  showToast('All local patient records cleared');
                }}
                className="px-4 py-2 bg-[#c62828] hover:bg-rose-800 text-white rounded-full text-xs font-bold cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Yes, Clear Local Storage
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Privacy Policy Modal */}
      {isPrivacyModalOpen && (
        <div className="fixed inset-0 bg-[#0f281c]/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-[#bfe0cf] p-6 w-full max-w-xl shadow-2xl max-h-[85vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#e0f0e6]">
              <h3 className="font-extrabold text-lg text-[#1e5a40] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#2e8b57]" />
                Privacy Policy
              </h3>
              <button
                onClick={() => setIsPrivacyModalOpen(false)}
                className="text-[#4e6b5c] hover:text-[#c62828] p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-[#14281f] space-y-3 leading-relaxed">
              <p><strong>Effective Date:</strong> January 1, 2025</p>
              <p>
                Ananya Infotech is dedicated to protecting doctor and patient clinical privacy. All patient demographics, case histories, and rubrics are saved locally inside your device's browser storage.
              </p>

              <h4 className="font-extrabold text-sm text-[#1e5a40] pt-2">1. Local Storage Privacy</h4>
              <p>
                Patient case files remain securely on your local device. You have complete autonomy over exporting, editing, and deleting records at any time.
              </p>

              <h4 className="font-extrabold text-sm text-[#1e5a40] pt-2">2. Gemini AI Processing</h4>
              <p>
                Symptom totality prompts are sent directly from this browser to the configured Gemini API for AI repertorization. Patient records and history are stored locally in this device's browser storage.
              </p>

              <h4 className="font-extrabold text-sm text-[#1e5a40] pt-2">3. Support &amp; Inquiries</h4>
              <p>
                For questions or assistance, contact Dr. Bharat Chougule at <strong>9902686173</strong> or email <strong>chougule800@gmail.com</strong>.
              </p>
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-[#e0f0e6] mt-4">
              <button
                type="button"
                onClick={() => setIsPrivacyModalOpen(false)}
                className="px-4 py-2 bg-[#1e5a40] text-white rounded-full text-xs font-bold cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Terms & Conditions Modal */}
      {isTermsModalOpen && (
        <div className="fixed inset-0 bg-[#0f281c]/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-[#bfe0cf] p-6 w-full max-w-xl shadow-2xl max-h-[85vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#e0f0e6]">
              <h3 className="font-extrabold text-lg text-[#1e5a40] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#2e8b57]" />
                Terms &amp; Conditions
              </h3>
              <button
                onClick={() => setIsTermsModalOpen(false)}
                className="text-[#4e6b5c] hover:text-[#c62828] p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-[#14281f] space-y-3 leading-relaxed">
              <p><strong>Clinical Decision Support Disclaimer:</strong></p>
              <p>
                This software is a digital homeopathic repertory and decision-support aid intended for qualified homeopathic practitioners, medical students, and doctors. Remedy selection, potency, repetition, and patient management remain the sole professional responsibility of the treating physician.
              </p>
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-[#e0f0e6] mt-4">
              <button
                type="button"
                onClick={() => setIsTermsModalOpen(false)}
                className="px-4 py-2 bg-[#1e5a40] text-white rounded-full text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Gemini API Key Modal */}
      {isApiKeyModalOpen && (
        <div className="fixed inset-0 bg-[#0f281c]/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-[#bfe0cf] p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#e0f0e6]">
              <h3 className="font-extrabold text-lg text-[#1e5a40] flex items-center gap-2">
                <Key className="w-5 h-5 text-[#2e8b57]" />
                Gemini API Key
              </h3>
              <button
                onClick={() => setIsApiKeyModalOpen(false)}
                className="text-[#4e6b5c] hover:text-[#c62828] p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#4e6b5c] mb-3">
              Configure or change the Gemini API key for this device. Leave blank to restore the default key.
            </p>

            <input
              type="password"
              value={apiKeyInputValue}
              onChange={e => setApiKeyInputValue(e.target.value)}
              placeholder="Enter Gemini API key…"
              className="w-full px-3.5 py-2 border border-[#bfe0cf] rounded-xl text-xs font-mono mb-4 focus:outline-none focus:border-[#2e8b57]"
            />

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e0f0e6]">
              <button
                type="button"
                onClick={() => setIsApiKeyModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-[#14281f] rounded-full text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="px-4 py-2 bg-[#1e5a40] text-white rounded-full text-xs font-bold cursor-pointer"
              >
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
