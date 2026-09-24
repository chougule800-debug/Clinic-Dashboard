import {
  Patient,
  SystemFormRecord,
  Prescription,
  FollowUpRecord,
  Appointment,
  WhatsAppConversation,
  BillingInvoice,
  ClinicalSystemKey
} from '../types';

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'PT-1001',
    abhaId: '91-4523-8891-2311',
    abhaAddress: 'sunita.verma@abdm',
    name: 'Mrs. Sunita Verma',
    age: 38,
    gender: 'Female',
    dob: '1988-04-14',
    mobile: '+91 98201 45892',
    email: 'sunita.v@example.com',
    bloodGroup: 'B+',
    address: 'Flat 402, Lotus Residency, Pune, Maharashtra',
    occupation: 'Secondary School Teacher',
    emergencyContact: '+91 98201 11223 (Husband - Alok)',
    vitals: {
      bpSystolic: 124,
      bpDiastolic: 82,
      pulse: 76,
      temperature: 98.4,
      spo2: 99,
      weight: 62,
      height: 63,
      heightInch: 63,
      bmi: 24.2,
      rbs: 110,
      respiratoryRate: 16
    },
    allergies: ['Dust mites', 'Sulpha drugs'],
    chronicDiseases: ['Chronic Migraine', 'Mild Dyspepsia'],
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-15T14:30:00Z'
  },
  {
    id: 'PT-1002',
    abhaId: '91-8721-4412-9034',
    abhaAddress: 'rajesh.kulkarni@abdm',
    name: 'Mr. Rajesh Kulkarni',
    age: 46,
    gender: 'Male',
    dob: '1980-08-22',
    mobile: '+91 94220 89123',
    email: 'rajesh.k@example.com',
    bloodGroup: 'O+',
    address: 'B-14, Shivneri Colony, Kothrud, Pune',
    occupation: 'Software Team Lead',
    emergencyContact: '+91 94220 55432 (Wife - Smita)',
    vitals: {
      bpSystolic: 136,
      bpDiastolic: 88,
      pulse: 82,
      temperature: 98.6,
      spo2: 98,
      weight: 81,
      height: 68,
      heightInch: 68,
      bmi: 26.8,
      rbs: 138,
      respiratoryRate: 18
    },
    allergies: ['Penicillin'],
    chronicDiseases: ['Lumbar Spondylosis (L4-L5)', 'Dry Eczema on hands'],
    createdAt: '2026-03-05T11:15:00Z',
    updatedAt: '2026-03-14T16:20:00Z'
  },
  {
    id: 'PT-1003',
    abhaId: '91-1209-6634-1188',
    abhaAddress: 'aarav.mehta@abdm',
    name: 'Master Aarav Mehta',
    age: 7,
    gender: 'Male',
    dob: '2019-06-10',
    mobile: '+91 98812 77654',
    email: 'parents.mehta@example.com',
    bloodGroup: 'A+',
    address: 'Row House 9, Green Glades, Baner, Pune',
    occupation: 'Student (2nd Grade)',
    emergencyContact: '+91 98812 77654 (Mother - Meera)',
    vitals: {
      bpSystolic: 100,
      bpDiastolic: 65,
      pulse: 92,
      temperature: 99.1,
      spo2: 99,
      weight: 22,
      height: 48,
      heightInch: 48,
      bmi: 14.8,
      rbs: 94,
      respiratoryRate: 22
    },
    allergies: ['Egg white'],
    chronicDiseases: ['Allergic Bronchitis', 'Dentition delays in infancy'],
    createdAt: '2026-03-08T09:30:00Z',
    updatedAt: '2026-03-16T11:00:00Z'
  },
  {
    id: 'PT-1004',
    abhaId: '91-3341-9988-5520',
    abhaAddress: 'priya.deshmukh@abdm',
    name: 'Ms. Priya Deshmukh',
    age: 26,
    gender: 'Female',
    dob: '2000-11-04',
    mobile: '+91 97654 32109',
    email: 'priya.deshmukh@example.com',
    bloodGroup: 'AB+',
    address: 'C-301, Viman Nagar Heights, Pune',
    occupation: 'Graphic Designer',
    emergencyContact: '+91 97654 00981 (Father - Nitin)',
    vitals: {
      bpSystolic: 118,
      bpDiastolic: 76,
      pulse: 74,
      temperature: 98.3,
      spo2: 99,
      weight: 58,
      height: 65,
      heightInch: 65,
      bmi: 21.3,
      rbs: 98,
      respiratoryRate: 15
    },
    allergies: [],
    chronicDiseases: ['PCOD (Polycystic Ovarian Disease)', 'Acne Vulgaris'],
    createdAt: '2026-03-12T15:00:00Z',
    updatedAt: '2026-03-15T18:00:00Z'
  }
];

export const INITIAL_SYSTEM_FORMS: SystemFormRecord[] = [];

export const INITIAL_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'RX-8801',
    patientId: 'PT-1001',
    consultationDate: '2026-03-15',
    diagnosis: 'Chronic Migraine with Dyspepsia (Natrum Muriaticum constitutional picture)',
    clinicalNotes: 'Right-sided hemicrania with salt craving and sun aggravation. Good vitality. Repertory score: Nat-m (18/6), Bell (12/4).',
    homeoMedicines: [
      {
        id: 'hm-1',
        remedy: 'Natrum Muriaticum',
        potency: '200C',
        form: 'Globules #30',
        dosage: '4 pills',
        frequency: 'OD (Once Daily)',
        duration: '3 days (Morning stat)',
        instructions: 'Take dry on tongue 30 mins before breakfast. Do not handle pills with bare fingers.'
      },
      {
        id: 'hm-2',
        remedy: 'Belladonna',
        potency: '30C',
        form: 'Globules #30',
        dosage: '4 pills',
        frequency: 'Stat / SOS',
        duration: '15 days (SOS)',
        instructions: 'During acute headache throbbing attack, repeat every 2 hours up to 3 doses.'
      }
    ],
    alloMedicines: [
      {
        id: 'am-1',
        name: 'Tab. Naproxen + Domperidone (Naxdom)',
        type: 'Tablet',
        strength: '500 mg / 10 mg',
        frequency: 'SOS',
        timing: 'After Food',
        duration: 'As needed',
        instructions: 'Rescue medication for acute unbearable migraine episode only.'
      }
    ],
    dietaryAdvise: [
      'Maintain regular meal timings; do not fast or skip breakfast.',
      'Wear sunglasses or hat when stepping into bright sunlight.',
      'Avoid strong direct coffee or raw onion 30 mins around homeopathic dose.',
      'Adequate hydration (2.5L water daily).'
    ],
    investigationsOrdered: ['Serum Ferritin', 'Vitamin D3', 'Fundus Examination'],
    followUpDate: '2026-03-30',
    doctorName: 'Dr. Anand Deshpande',
    doctorDegree: 'M.D. (Homoeopathy), C.C.M.P.',
    doctorRegNo: 'MCH-48921-A',
    clinicName: 'ClinicaPro Holistic Healthcare & Research Centre',
    clinicAddress: 'Suite 204, Mediplex Arcade, F.C. Road, Shivajinagar, Pune - 411005',
    clinicPhone: '+91 20 2553 9088 / +91 98220 12345'
  },
  {
    id: 'RX-8802',
    patientId: 'PT-1002',
    consultationDate: '2026-03-14',
    diagnosis: 'Lumbar Spondylosis with Sciatic Neuritis + Dry Palmar Eczema',
    clinicalNotes: 'Classic Rhus Tox modalities: relief on continuous movement, worse cold damp.',
    homeoMedicines: [
      {
        id: 'hm-3',
        remedy: 'Rhus Toxicodendron',
        potency: '200C',
        form: 'Globules #30',
        dosage: '4 pills',
        frequency: 'BD (Twice Daily)',
        duration: '14 days',
        instructions: 'Morning and night on empty stomach.'
      }
    ],
    alloMedicines: [
      {
        id: 'am-2',
        name: 'Cap. Pregabalin + Methylcobalamin',
        type: 'Capsule',
        strength: '75 mg / 1500 mcg',
        frequency: 'OD',
        timing: 'After Food',
        duration: '10 days',
        instructions: 'Take at night after dinner.'
      }
    ],
    dietaryAdvise: [
      'Avoid sleeping on excessively soft mattress.',
      'Gentle spinal lumbar extension exercises twice daily.',
      'Hot fomentation for 15 mins at bedtime.'
    ],
    investigationsOrdered: ['MRI Lumbar Spine (if numbness increases)'],
    followUpDate: '2026-03-28',
    doctorName: 'Dr. Anand Deshpande',
    doctorDegree: 'M.D. (Homoeopathy), C.C.M.P.',
    doctorRegNo: 'MCH-48921-A',
    clinicName: 'ClinicaPro Holistic Healthcare & Research Centre',
    clinicAddress: 'Suite 204, Mediplex Arcade, F.C. Road, Shivajinagar, Pune - 411005',
    clinicPhone: '+91 20 2553 9088 / +91 98220 12345'
  }
];

export const INITIAL_FOLLOW_UPS: FollowUpRecord[] = [
  {
    id: 'FU-501',
    patientId: 'PT-1001',
    date: '2026-03-15',
    response: 'Moderate Improvement',
    subjectiveFeedback: 'Headache frequency reduced from 3 times weekly to 1 mild episode this week. Digestion is calmer; less burning acidity.',
    vitalsCheck: {
      bpSystolic: 122,
      bpDiastolic: 80,
      pulse: 74,
      weight: 62
    },
    remedyActionAssessment: 'Remedy acting favorably. Nat-m 200 has initiated systemic response without medicinal aggravation.',
    prescriptionAdjustment: 'Maintain Placebo (SL #30) 4 pills BD for next 14 days. Do not repeat remedy yet.',
    nextFollowUpDate: '2026-03-30'
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'APT-101',
    patientId: 'PT-1001',
    patientName: 'Mrs. Sunita Verma',
    patientMobile: '+91 98201 45892',
    date: '2026-03-17',
    timeSlot: '10:30 AM',
    type: 'Follow-up',
    status: 'Scheduled',
    notes: 'Follow-up on migraine and dyspepsia response'
  },
  {
    id: 'APT-102',
    patientId: 'PT-1002',
    patientName: 'Mr. Rajesh Kulkarni',
    patientMobile: '+91 94220 89123',
    date: '2026-03-17',
    timeSlot: '11:15 AM',
    type: 'Follow-up',
    status: 'Waiting',
    notes: 'Reviewing remote intake form submission for lumbar pain'
  },
  {
    id: 'APT-103',
    patientId: 'PT-1003',
    patientName: 'Master Aarav Mehta',
    patientMobile: '+91 98812 77654',
    date: '2026-03-17',
    timeSlot: '12:00 PM',
    type: 'New Consultation',
    status: 'Scheduled',
    notes: 'Pediatric respiratory allergy evaluation'
  },
  {
    id: 'APT-104',
    patientId: 'PT-1004',
    patientName: 'Ms. Priya Deshmukh',
    patientMobile: '+91 97654 32109',
    date: '2026-03-17',
    timeSlot: '04:30 PM',
    type: 'Remote WhatsApp Consult',
    status: 'Scheduled',
    notes: 'PCOD hormonal reports discussion'
  }
];

export const INITIAL_CONVERSATIONS: WhatsAppConversation[] = [
  {
    id: 'CONV-1',
    patientId: 'PT-1001',
    patientName: 'Mrs. Sunita Verma',
    phone: '+919820145892',
    category: 'Patients',
    unreadCount: 0,
    lastMessage: 'Thank you doctor! The headache is significantly reduced after the morning dose.',
    lastMessageTime: '10:45 AM',
    status: 'In-Progress',
    messages: [
      {
        id: 'msg-1',
        sender: 'doctor',
        text: 'Hello Mrs. Sunita Verma, this is Dr. Anand Deshpande\'s Clinic. Your appointment is confirmed for tomorrow 10:30 AM.',
        timestamp: 'Yesterday 04:00 PM',
        status: 'read'
      },
      {
        id: 'msg-2',
        sender: 'patient',
        text: 'Thank you doctor! Should I come fasting for blood tests?',
        timestamp: 'Yesterday 04:15 PM'
      },
      {
        id: 'msg-3',
        sender: 'doctor',
        text: 'Yes, please come with 8 hours overnight fasting for fasting glucose and lipid profile.',
        timestamp: 'Yesterday 04:20 PM',
        status: 'read'
      },
      {
        id: 'msg-4',
        sender: 'patient',
        text: 'Thank you doctor! The headache is significantly reduced after the morning dose.',
        timestamp: '10:45 AM'
      }
    ]
  },
  {
    id: 'CONV-2',
    patientId: 'PT-1002',
    patientName: 'Mr. Rajesh Kulkarni',
    phone: '+919422089123',
    category: 'Follow-up',
    unreadCount: 1,
    lastMessage: '✅ I have submitted the Musculoskeletal Spine case form using the link!',
    lastMessageTime: '11:20 AM',
    status: 'Pending',
    messages: [
      {
        id: 'msg-201',
        sender: 'doctor',
        text: 'Dear Mr. Rajesh Kulkarni, please click this link to fill your Musculoskeletal & Spine clinical case form before consultation: https://clinicapro.app/intake?pt=PT-1002&form=musculoskeletal',
        timestamp: '10:00 AM',
        status: 'read',
        linkData: {
          type: 'case_intake',
          system: 'musculoskeletal',
          patientId: 'PT-1002'
        }
      },
      {
        id: 'msg-202',
        sender: 'patient',
        text: '✅ I have submitted the Musculoskeletal Spine case form using the link!',
        timestamp: '11:20 AM'
      }
    ]
  },
  {
    id: 'CONV-3',
    patientId: 'PT-1004',
    patientName: 'Ms. Priya Deshmukh',
    phone: '+919765432109',
    category: 'Appointment',
    unreadCount: 2,
    lastMessage: 'Doctor, can we do the follow-up over video call or WhatsApp today?',
    lastMessageTime: '09:15 AM',
    status: 'Pending',
    messages: [
      {
        id: 'msg-301',
        sender: 'patient',
        text: 'Hello Dr. Anand, my ultrasound pelvis reports are ready.',
        timestamp: '09:10 AM'
      },
      {
        id: 'msg-302',
        sender: 'patient',
        text: 'Doctor, can we do the follow-up over video call or WhatsApp today?',
        timestamp: '09:15 AM'
      }
    ]
  },
  {
    id: 'CONV-4',
    patientName: 'Vikas Shinde',
    phone: '+919923488771',
    category: 'New enquiries',
    unreadCount: 1,
    lastMessage: 'Hello, do you provide homeopathic treatment for chronic kidney stone & uric acid?',
    lastMessageTime: '08:30 AM',
    status: 'Pending',
    messages: [
      {
        id: 'msg-401',
        sender: 'patient',
        text: 'Hello, do you provide homeopathic treatment for chronic kidney stone & uric acid?',
        timestamp: '08:30 AM'
      }
    ]
  },
  {
    id: 'CONV-5',
    patientId: 'PT-1003',
    patientName: 'Meera Mehta (Aarav\'s Mother)',
    phone: '+919881277654',
    category: 'Completed',
    unreadCount: 0,
    lastMessage: 'Medicines collected from clinic pharmacy. Thank you!',
    lastMessageTime: 'Mar 15',
    status: 'Resolved',
    messages: [
      {
        id: 'msg-501',
        sender: 'doctor',
        text: 'Prescription for Aarav Mehta is ready: Calcarea Carb 200 & Biochemic Calc Phos 6X.',
        timestamp: 'Mar 15, 02:00 PM',
        status: 'read'
      },
      {
        id: 'msg-502',
        sender: 'patient',
        text: 'Medicines collected from clinic pharmacy. Thank you!',
        timestamp: 'Mar 15, 04:30 PM'
      }
    ]
  }
];

export const INITIAL_INVOICES: BillingInvoice[] = [
  {
    id: 'INV-2026-001',
    invoiceNumber: 'CP-INV-1082',
    patientId: 'PT-1001',
    patientName: 'Mrs. Sunita Verma',
    date: '2026-03-15',
    consultationFee: 800,
    medicineCharges: 450,
    discount: 50,
    totalAmount: 1200,
    paymentMode: 'UPI',
    status: 'Paid',
    items: [
      { description: 'Comprehensive Classical Case Consultation', amount: 800 },
      { description: 'Homeopathic Medicines Dispensing (15 Days)', amount: 450 }
    ]
  },
  {
    id: 'INV-2026-002',
    invoiceNumber: 'CP-INV-1083',
    patientId: 'PT-1002',
    patientName: 'Mr. Rajesh Kulkarni',
    date: '2026-03-14',
    consultationFee: 700,
    medicineCharges: 500,
    discount: 0,
    totalAmount: 1200,
    paymentMode: 'Cash',
    status: 'Paid',
    items: [
      { description: 'Musculoskeletal & Spine Consultation', amount: 700 },
      { description: 'Dual Homeo-Allo Prescribed Dispensing', amount: 500 }
    ]
  }
];

export const CLINICAL_SYSTEMS_METADATA: {
  key: ClinicalSystemKey;
  label: string;
  iconName: string;
  description: string;
  fields: {
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'chips';
    options?: string[];
    placeholder?: string;
  }[];
}[] = [
  {
    key: 'headache',
    label: 'Headache / Neurological',
    iconName: 'Brain',
    description: 'Headache location, sensations, sun/noise modalities, aura, vertigo, cranial nerves.',
    fields: [
      {
        name: 'location',
        label: 'Location of Headache',
        type: 'chips',
        options: ['Frontal / Forehead', 'Right Temporal (Hemicrania)', 'Left Temporal (Hemicrania)', 'Occipital radiating down neck', 'Vertex (Top of head)', 'Orbital / Above eyes', 'Generalized Band-like']
      },
      {
        name: 'sensation',
        label: 'Character of Pain & Sensation',
        type: 'chips',
        options: ['Throbbing / Pulsating', 'Bursting / Splitting', 'Heavy dull weight', 'Stitching like needles', 'Pressing inward', 'Burning heat on crown', 'Shooting / Stabbing']
      },
      {
        name: 'timing',
        label: 'Periodicity & Time Modalities',
        type: 'text',
        placeholder: 'e.g. Begins 9 AM, peaks at noon, subsides at sunset; or early morning on waking'
      },
      {
        name: 'triggers',
        label: 'Triggers & Causes',
        type: 'chips',
        options: ['Sunlight / Heat', 'Mental Stress / Worry', 'Fasting / Skipped Meals', 'Noise & Loud Sounds', 'Lack of Sleep', 'Pre-menstrual', 'Eye strain / Screens']
      },
      {
        name: 'reliefFactors',
        label: 'Amelioration / What Relieves Pain?',
        type: 'chips',
        options: ['Tight bandage / Hard pressure', 'Dark quiet room', 'Cold water wash', 'Warm applications', 'Sleeping / Lying flat', 'Vomiting / Sour eructation']
      },
      {
        name: 'auras',
        label: 'Associated Auras & Concomitants',
        type: 'chips',
        options: ['Photophobia (Light sensitivity)', 'Phonophobia (Sound sensitivity)', 'Nausea / Vomiting', 'Visual zigzags / Blurring', 'Giddiness / Vertigo', 'Scalp soreness']
      }
    ]
  },
  {
    key: 'skin_hair',
    label: 'Skin & Hair',
    iconName: 'Sparkles',
    description: 'Lesions, eczema, psoriasis, itching modalities, discharge, alopecia, scalp conditions.',
    fields: [
      {
        name: 'lesionType',
        label: 'Primary Skin Lesion Type',
        type: 'chips',
        options: ['Dry erythematous patches', 'Vesicular / Blisters', 'Pustular / Boils', 'Scaling / Flaking', 'Cracked & bleeding fissures', 'Urticarial wheals', 'Pigmentation / Melasma']
      },
      {
        name: 'location',
        label: 'Distribution & Affected Areas',
        type: 'text',
        placeholder: 'e.g. Flexures of elbows, knees, face, palms, scalp'
      },
      {
        name: 'itchingModality',
        label: 'Itching Aggravation Modalities',
        type: 'chips',
        options: ['Aggravated in warm bed at night', 'Aggravated by washing / bathing with water', 'Aggravated by woollens', 'Aggravated by scratching (burns after scratching)', 'Aggravated in cold dry winter']
      },
      {
        name: 'discharge',
        label: 'Nature of Discharge (if any)',
        type: 'chips',
        options: ['Dry (No discharge)', 'Sticky, golden honey-like', 'Watery thin fluid', 'Thick yellow pus', 'Bloody serosanguinous', 'Offensive odor']
      },
      {
        name: 'hairComplaints',
        label: 'Hair & Scalp Complaints',
        type: 'chips',
        options: ['Alopecia areata (circular bald patches)', 'Diffuse generalized hair thinning', 'Severe dry dandruff', 'Greasy scalp with crusts', 'Premature graying', 'Hairfall after fever / grief']
      }
    ]
  },
  {
    key: 'gastrointestinal',
    label: 'Gastrointestinal (GIT)',
    iconName: 'Utensils',
    description: 'Appetite, thirst, cravings, aversions, acid reflux, bowel patterns, abdomen pain.',
    fields: [
      {
        name: 'appetite',
        label: 'Appetite Pattern',
        type: 'chips',
        options: ['Normal', 'Poor / Total loss of appetite', 'Canine / Ravenous (gets hungry quickly)', 'Fullness after two mouthfuls', 'Hunger headache if delayed']
      },
      {
        name: 'thirst',
        label: 'Thirst Characteristics',
        type: 'chips',
        options: ['Thirstless with dry mouth', 'Large quantities at long intervals', 'Frequent small sips of chilled water', 'Desires warm / hot water', 'Extreme thirst during fever']
      },
      {
        name: 'cravings',
        label: 'Food Desires & Cravings',
        type: 'chips',
        options: ['Sweets & Sugar', 'Spicy / Tangy food', 'Extra Salt / Savouries', 'Warm food & drinks', 'Sour / Pickles', 'Fats & Meat', 'Cold drinks & ice']
      },
      {
        name: 'aversions',
        label: 'Food Aversions & Intolerances',
        type: 'chips',
        options: ['Milk / Dairy', 'Meat', 'Bread & Starch', 'Oily / Fatty foods', 'Sweets', 'Coffee / Tea']
      },
      {
        name: 'bowels',
        label: 'Bowel Habits & Stool Characteristics',
        type: 'chips',
        options: ['Regular daily', 'Obstinate constipation (dry hard stool)', 'Frequent ineffectual urging (Nux Vomica type)', 'Morning diarrhea (drives out of bed 5 AM)', 'Loose offensive stool', 'Bleeding piles / hemorrhoids']
      },
      {
        name: 'acidityReflux',
        label: 'Gastric Reflux & Gas',
        type: 'chips',
        options: ['Sour waterbrash / heartburn', 'Abdominal bloating 4 PM - 8 PM', 'Loud noisy eructations', 'Burning in epigastrium', 'Nausea after greasy food']
      }
    ]
  },
  {
    key: 'urinary',
    label: 'Urinary System',
    iconName: 'Droplet',
    description: 'Frequency, burning micturition, renal colic, stones, incontinence, sediment.',
    fields: [
      {
        name: 'frequency',
        label: 'Urination Frequency',
        type: 'chips',
        options: ['Normal (4-5 times/day)', 'Frequent day and night (Nocturia)', 'Sudden urgency / cannot hold', 'Scanty urine output', 'Incontinence on coughing / sneezing']
      },
      {
        name: 'painBurning',
        label: 'Burning & Sensation During Micturition',
        type: 'chips',
        options: ['Burning before urination begins', 'Intense burning during flow', 'Severe burning & cutting after urination finishes', 'Tenesmus / constant urge to pass drops', 'No burning']
      },
      {
        name: 'renalPain',
        label: 'Renal / Flank Pain (Stones / Infection)',
        type: 'chips',
        options: ['Right loin pain radiating to groin', 'Left loin pain radiating to thigh', 'Dull ache in lower back kidneys', 'History of Renal Calculi (Kidney stones)']
      },
      {
        name: 'sedimentColor',
        label: 'Urine Color & Sediment',
        type: 'chips',
        options: ['Pale yellow clear', 'Dark amber concentrated', 'Turbid / Cloudy with foul odor', 'Reddish / Hematuria (blood tinged)', 'Red sand / brick-dust sediment']
      }
    ]
  },
  {
    key: 'musculoskeletal',
    label: 'Musculoskeletal + Spine',
    iconName: 'Activity',
    description: 'Joint pains, cervical/lumbar spine, arthritis, modalities of motion/rest/weather.',
    fields: [
      {
        name: 'jointsAffected',
        label: 'Joints & Regions Affected',
        type: 'chips',
        options: ['Cervical spine & neck', 'Lumbar spine / Sciatica (Low back)', 'Knee joints (Bilateral / Unilateral)', 'Small joints of fingers & wrist', 'Shoulder joint (Frozen shoulder)', 'Heel / Plantar fascia pain']
      },
      {
        name: 'painCharacter',
        label: 'Character of Pain',
        type: 'chips',
        options: ['Stiffness with soreness', 'Stitching pain aggravated by movement', 'Aching bruised muscular pain', 'Burning joint inflammation', 'Numbness / tingling pins & needles', 'Cramping spasms in calves']
      },
      {
        name: 'motionModality',
        label: 'Motion Modalities (Key Indicator)',
        type: 'chips',
        options: ['Worse on first motion, relieves on continued walking (Rhus Tox)', 'Worse by slightest movement, absolute rest relieves (Bryonia)', 'Pains shift rapidly from joint to joint (Pulsatilla)', 'Worse by standing still (Sulphur)']
      },
      {
        name: 'weatherModality',
        label: 'Weather & Thermal Modalities',
        type: 'chips',
        options: ['Worse in cold damp / rainy weather', 'Relieved by hot fermentation / warmth', 'Worse by heat, wants cold air / cold pack', 'Worse before a thunderstorm']
      }
    ]
  },
  {
    key: 'respiratory',
    label: 'Respiratory System',
    iconName: 'Wind',
    description: 'Cough, expectoration, asthma, dyspnea, wheezing, allergies, sinus, nasal polyp.',
    fields: [
      {
        name: 'coughType',
        label: 'Cough Characteristics',
        type: 'chips',
        options: ['Dry barking / tickling cough', 'Loose rattling with chest congestion', 'Paroxysmal spasmodic coughing bouts', 'Cough ending in retching / vomiting', 'Nocturnal cough on lying down']
      },
      {
        name: 'expectoration',
        label: 'Nature of Sputum / Expectoration',
        type: 'chips',
        options: ['Scanty / Dry (no phlegm)', 'Thick yellow-green purulent', 'White frothy mucus', 'Tough, stringy, ropy mucus', 'Salty or sweetish taste']
      },
      {
        name: 'breathlessness',
        label: 'Dyspnea & Asthma Modalities',
        type: 'chips',
        options: ['Asthma worse 1 AM to 3 AM (Arsenic)', 'Asthma worse 3 AM to 5 AM (Kali Carb)', 'Dyspnea worse lying down, must sit up bending forward', 'Wheezing triggered by dust, cold drinks, pollen', 'Shortness of breath on walking uphill']
      },
      {
        name: 'sinusRhinitis',
        label: 'Nose, Sinus & Throat',
        type: 'chips',
        options: ['Violent paroxysms of morning sneezing', 'Watery acrid nasal discharge', 'Post-nasal drip with throat clearing', 'Frontal sinus heaviness and pain', 'Loss of smell / Anosmia']
      }
    ]
  },
  {
    key: 'female_gynae',
    label: 'Female / Gynaecology',
    iconName: 'HeartHandshake',
    description: 'Menstrual cycles, LMP, flow, dysmenorrhea, leucorrhea, PCOD, menopausal symptoms.',
    fields: [
      {
        name: 'menstrualCycle',
        label: 'Cycle Regularity & Interval',
        type: 'chips',
        options: ['Regular (28-30 days)', 'Delayed / Infrequent (35-60 days - Oligomenorrhea)', 'Frequent / Early (under 21 days)', 'Amenorrhea (Absent menses for months)', 'Irregular unpredictable intervals']
      },
      {
        name: 'flowQuantity',
        label: 'Nature & Quantity of Flow',
        type: 'chips',
        options: ['Normal moderate flow', 'Profuse, heavy bleeding with clots (Menorrhagia)', 'Scanty, short duration (1-2 days)', 'Dark black clotted blood', 'Pale watery pink']
      },
      {
        name: 'dysmenorrhea',
        label: 'Menstrual Cramps & Dysmenorrhea',
        type: 'chips',
        options: ['Severe pain before flow begins, relieved once flow starts', 'Violent cramping during menses requiring bed rest', 'Pain radiating down thighs & back', 'Bearing down sensation in lower abdomen', 'No menstrual pain']
      },
      {
        name: 'leucorrhea',
        label: 'Leucorrhea / Vaginal Discharge',
        type: 'chips',
        options: ['None', 'White curdy odorless discharge', 'Acrid burning excoriating discharge', 'Thick yellowish discharge', 'Offensive odor']
      },
      {
        name: 'concomitants',
        label: 'Premenstrual & Hormonal Symptoms',
        type: 'chips',
        options: ['Premenstrual mood swings & weeping', 'Mastalgia (breast tenderness)', 'Severe pre-menstrual acne flare', 'Hot flashes & night sweats (Perimenopause)', 'Weight gain / Hirsutism (PCOD pattern)']
      }
    ]
  },
  {
    key: 'pediatric',
    label: 'Pediatric Case Taking',
    iconName: 'Baby',
    description: 'Developmental milestones, dentition, birth history, behavioral temperament, head sweats.',
    fields: [
      {
        name: 'milestones',
        label: 'Developmental Milestones',
        type: 'chips',
        options: ['All milestones normal & on time', 'Delayed walking / crawling', 'Delayed speech / talking', 'Delayed closure of fontanelles', 'Slow learning / attention difficulty']
      },
      {
        name: 'dentition',
        label: 'Teething History',
        type: 'chips',
        options: ['Normal smooth dentition', 'Teething delayed past 10 months', 'Diarrhea / greenish stools during teething', 'Extreme irritability / weeping during teething (Chamomilla)', 'Fever or convulsions with teething']
      },
      {
        name: 'headSweat',
        label: 'Perspiration Pattern',
        type: 'chips',
        options: ['Profuse head sweat soaking pillow at night (Calcarea Carb)', 'Sweat on palms and soles with foul odor (Silica)', 'Hot sweat on face during crying', 'Dry skin, hardly sweats']
      },
      {
        name: 'temperament',
        label: 'Behavior & Temperament',
        type: 'chips',
        options: ['Shy, clings to mother', 'Temper tantrums, screams, obstinate', 'Fears darkness, animals, strangers', 'Hyperactive, cannot sit still', 'Mild, gentle, weeping easily']
      }
    ]
  },
  {
    key: 'other_mind_generals',
    label: 'Mind & Generals / Psycho-Somatic (मानसिक-शारीरिक)',
    iconName: 'Brain',
    description: 'Psycho-somatic mapping, emotional triggers, mind states, emotion-body sequence, Kent rubrics, sleep & generals.',
    fields: [
      {
        name: 'mentalState',
        label: 'Mental & Emotional State / मानसिक अवस्था',
        type: 'chips',
        options: [
          'Anxiety / चिंता',
          'Fear / भीती',
          'Anger / राग',
          'Irritability / चिडचिड',
          'Grief / दुःख',
          'Sadness / उदासी',
          'Jealousy / मत्सर',
          'Restlessness / अस्वस्थता',
          'Mood change / मनःस्थिती बदल',
          'Desire for company / सोबत हवी',
          'Desire for solitude / एकांताची इच्छा',
          'Overthinking / अतिविचार'
        ]
      },
      {
        name: 'emotionalTriggers',
        label: 'Emotional Triggers / मानसिक कारणे',
        type: 'chips',
        options: [
          'Work stress / कामाचा ताण',
          'Family conflict / कौटुंबिक संघर्ष',
          'Financial stress / आर्थिक ताण',
          'Relationship conflict / संबंधातील संघर्ष',
          'Grief / दुःख',
          'Humiliation / अपमान',
          'Suppression / भावना दडपणे'
        ]
      },
      {
        name: 'somatizationBody',
        label: 'Psycho-Somatic Body Reaction / शारीरिक लक्षण',
        type: 'chips',
        options: [
          'Headache/Migraine / डोकेदुखी',
          'Palpitations / हृदयाची धडधड',
          'Breathlessness/Chest tightness / छातीत जडपणा',
          'Acidity/Gastric symptoms / आम्लपित्त',
          'Bowel disturbance / आतड्यांची तक्रार',
          'Sleep disturbance / झोपेचा त्रास'
        ]
      },
      {
        name: 'generalModalities',
        label: 'General Modalities / सामान्य लक्षणे',
        type: 'chips',
        options: [
          'Worse by heat / उष्णतेने वाढते',
          'Worse by cold / थंडीने वाढते',
          'Better by warmth / उष्णतेने आराम',
          'Better by cold / थंडीत आराम',
          'Worse at night / रात्री वाढते',
          'Worse morning / सकाळी वाढते'
        ]
      }
    ]
  }
];
