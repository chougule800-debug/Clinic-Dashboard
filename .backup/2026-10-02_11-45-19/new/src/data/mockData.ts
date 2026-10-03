import type { ClinicalSystemKey } from '../types';

/**
 * Static metadata describing the 9 clinical systems and their standard
 * structured fields. This is used as an offline fallback if the
 * `clinical_systems` table cannot be reached. The authoritative version
 * lives in Supabase.
 */
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
    label: 'Mind & Generals / Psycho-Somatic',
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