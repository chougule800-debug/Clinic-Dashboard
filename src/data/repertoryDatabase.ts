import { RepertoryRubric, RemedyScore } from '../types';

export interface RemedyDefinition {
  name: string;
  abbreviation: string;
  commonName: string;
  keynotes: string;
  thermals: 'Chilly' | 'Hot' | 'Ambi-thermal';
  thirst: 'Thirsty' | 'Thirstless';
  miasm: 'Psora' | 'Sycosis' | 'Syphilis' | 'Tubercular';
  // Rubrics this remedy covers with grade 1, 2, or 3
  rubricGrades: Record<string, number>;
}

export const REPERTORY_RUBRICS: RepertoryRubric[] = [
  // Mind
  { id: 'rub_mind_anxiety', chapter: 'Mind', rubricName: 'Anxiety about health, future, evening agg', grade: 3 },
  { id: 'rub_mind_weeping', chapter: 'Mind', rubricName: 'Weeps easily when talking or consoling agg', grade: 2 },
  { id: 'rub_mind_irritability', chapter: 'Mind', rubricName: 'Irritability, cannot bear contradiction or noise', grade: 3 },
  { id: 'rub_mind_fastidious', chapter: 'Mind', rubricName: 'Fastidious, wants everything in order and clean', grade: 3 },
  { id: 'rub_mind_hurried', chapter: 'Mind', rubricName: 'Hurried, impatient, wants things done immediately', grade: 2 },
  { id: 'rub_mind_grief', chapter: 'Mind', rubricName: 'Ailments from silent grief or disappointed love', grade: 3 },
  
  // Head
  { id: 'rub_head_throbbing', chapter: 'Head', rubricName: 'Headache: Throbbing, pulsating, congestive', grade: 3, systemOrigin: 'headache' },
  { id: 'rub_head_sun_agg', chapter: 'Head', rubricName: 'Headache: Aggravation from exposure to sun or heat', grade: 3, systemOrigin: 'headache' },
  { id: 'rub_head_right_sided', chapter: 'Head', rubricName: 'Headache: Right-sided (hemicrania)', grade: 2, systemOrigin: 'headache' },
  { id: 'rub_head_pressure_amel', chapter: 'Head', rubricName: 'Headache: Amelioration from hard pressure & tight bandage', grade: 3, systemOrigin: 'headache' },
  { id: 'rub_head_gastric', chapter: 'Head', rubricName: 'Headache: Gastric, associated with nausea, sour vomiting', grade: 3, systemOrigin: 'headache' },
  { id: 'rub_head_vertex', chapter: 'Head', rubricName: 'Headache: Pain on vertex with burning heat', grade: 2, systemOrigin: 'headache' },

  // Stomach & GIT
  { id: 'rub_stom_acidity', chapter: 'Stomach', rubricName: 'Acidity, heartburn, sour eructations after meals', grade: 3, systemOrigin: 'gastrointestinal' },
  { id: 'rub_stom_flatulence', chapter: 'Stomach', rubricName: 'Flatulence, abdomen distended, 4 to 8 PM agg', grade: 3, systemOrigin: 'gastrointestinal' },
  { id: 'rub_stom_spicy_craving', chapter: 'Stomach', rubricName: 'Desire for spices, fatty, rich food, stimulants', grade: 2, systemOrigin: 'gastrointestinal' },
  { id: 'rub_stom_sweets_craving', chapter: 'Stomach', rubricName: 'Desire for sweets, sugar, warm food and drinks', grade: 3, systemOrigin: 'gastrointestinal' },
  { id: 'rub_stom_constipation_ineff', chapter: 'Stomach', rubricName: 'Constipation: Frequent ineffectual urging for stool', grade: 3, systemOrigin: 'gastrointestinal' },
  { id: 'rub_stom_morning_diarrhea', chapter: 'Stomach', rubricName: 'Diarrhea: Drives out of bed early in morning (5 AM)', grade: 3, systemOrigin: 'gastrointestinal' },

  // Skin & Hair
  { id: 'rub_skin_itching_warmth', chapter: 'Skin', rubricName: 'Skin: Intense itching, burning, aggravated in warm bed', grade: 3, systemOrigin: 'skin_hair' },
  { id: 'rub_skin_eczema_folds', chapter: 'Skin', rubricName: 'Eczema in folds of limbs, behind ears, sticky discharge', grade: 2, systemOrigin: 'skin_hair' },
  { id: 'rub_skin_alopecia', chapter: 'Skin', rubricName: 'Hair: Falling in circular spots (Alopecia areata)', grade: 2, systemOrigin: 'skin_hair' },
  { id: 'rub_skin_suppuration', chapter: 'Skin', rubricName: 'Tendency to boils, acne, unhealthy skin suppurates easily', grade: 3, systemOrigin: 'skin_hair' },

  // Extremities & Spine
  { id: 'rub_extr_rest_agg', chapter: 'Extremities', rubricName: 'Joint pain: Aggravated at rest and first motion, amel continued motion', grade: 3, systemOrigin: 'musculoskeletal' },
  { id: 'rub_extr_motion_agg', chapter: 'Extremities', rubricName: 'Joint pain: Stitching, aggravated by least motion, amel absolute rest', grade: 3, systemOrigin: 'musculoskeletal' },
  { id: 'rub_extr_cold_damp_agg', chapter: 'Extremities', rubricName: 'Backache & Sciatica: Aggravated by cold wet weather', grade: 2, systemOrigin: 'musculoskeletal' },
  { id: 'rub_extr_cervical_stiff', chapter: 'Extremities', rubricName: 'Cervical stiffness extending to occiput and shoulders', grade: 2, systemOrigin: 'musculoskeletal' },

  // Respiratory
  { id: 'rub_resp_night_cough', chapter: 'Respiratory', rubricName: 'Cough: Dry, tickling, aggravated lying down at night', grade: 3, systemOrigin: 'respiratory' },
  { id: 'rub_resp_asthma_night', chapter: 'Respiratory', rubricName: 'Dyspnea / Asthma: Aggravated between 1 AM and 3 AM', grade: 3, systemOrigin: 'respiratory' },
  { id: 'rub_resp_rhinitis_sneezing', chapter: 'Respiratory', rubricName: 'Allergic rhinitis: Violent paroxysmal morning sneezing', grade: 2, systemOrigin: 'respiratory' },

  // Female & Urinary
  { id: 'rub_fem_delayed_scanty', chapter: 'Female', rubricName: 'Menses: Delayed, scanty, suppressed from cold feet', grade: 3, systemOrigin: 'female_gynae' },
  { id: 'rub_fem_dysmenorrhea_clots', chapter: 'Female', rubricName: 'Dysmenorrhea: Severe cramping pain with dark clotted flow', grade: 2, systemOrigin: 'female_gynae' },
  { id: 'rub_urin_burning_mict', chapter: 'Urinary', rubricName: 'Urinary: Burning cutting pain during and after urination', grade: 3, systemOrigin: 'urinary' },

  // Generalities
  { id: 'rub_gen_chilly', chapter: 'Generalities', rubricName: 'Physical Generals: Extremely chilly, sensitive to cold draughts', grade: 3, systemOrigin: 'other_mind_generals' },
  { id: 'rub_gen_hot', chapter: 'Generalities', rubricName: 'Physical Generals: Hot patient, intolerant of warm room or wraps', grade: 3, systemOrigin: 'other_mind_generals' },
  { id: 'rub_gen_thirst_small_sips', chapter: 'Generalities', rubricName: 'Thirst: Frequent small sips of water at short intervals', grade: 3, systemOrigin: 'other_mind_generals' },
  { id: 'rub_gen_thirstless', chapter: 'Generalities', rubricName: 'Thirst: Completely thirstless with dry mouth', grade: 3, systemOrigin: 'other_mind_generals' }
];

export const REMEDIES_DATABASE: RemedyDefinition[] = [
  {
    name: 'Lycopodium Clavatum',
    abbreviation: 'Lyc.',
    commonName: 'Club Moss',
    thermals: 'Chilly',
    thirst: 'Thirsty',
    miasm: 'Psora',
    keynotes: 'Right-sided ailments, 4-8 PM aggravation, desires warm food and drinks, flatulence and abdominal bloating, intellectual but lacks self-confidence.',
    rubricGrades: {
      rub_mind_anxiety: 2,
      rub_mind_hurried: 2,
      rub_head_right_sided: 3,
      rub_head_gastric: 2,
      rub_stom_acidity: 3,
      rub_stom_flatulence: 3,
      rub_stom_sweets_craving: 3,
      rub_stom_constipation_ineff: 2,
      rub_gen_chilly: 2,
      rub_extr_rest_agg: 2
    }
  },
  {
    name: 'Natrum Muriaticum',
    abbreviation: 'Nat-m.',
    commonName: 'Common Salt',
    thermals: 'Hot',
    thirst: 'Thirsty',
    miasm: 'Sycosis',
    keynotes: 'Throbbing frontal headache like little hammers agg 10 AM to 3 PM, mapped tongue, desire for salt, silent grief, weeping makes worse, worse from sun.',
    rubricGrades: {
      rub_mind_weeping: 3,
      rub_mind_grief: 3,
      rub_head_throbbing: 3,
      rub_head_sun_agg: 3,
      rub_skin_alopecia: 2,
      rub_skin_eczema_folds: 2,
      rub_fem_delayed_scanty: 2,
      rub_gen_hot: 3,
      rub_resp_rhinitis_sneezing: 3
    }
  },
  {
    name: 'Nux Vomica',
    abbreviation: 'Nux-v.',
    commonName: 'Poison Nut',
    thermals: 'Chilly',
    thirst: 'Thirsty',
    miasm: 'Psora',
    keynotes: 'Sedentary habits, highly irritable and fault-finding, gastric migraine, ineffectual urging for stool, desires stimulants and rich spicy food, very chilly.',
    rubricGrades: {
      rub_mind_irritability: 3,
      rub_mind_hurried: 3,
      rub_head_gastric: 3,
      rub_head_sun_agg: 1,
      rub_stom_acidity: 3,
      rub_stom_spicy_craving: 3,
      rub_stom_constipation_ineff: 3,
      rub_gen_chilly: 3,
      rub_resp_night_cough: 2
    }
  },
  {
    name: 'Arsenicum Album',
    abbreviation: 'Ars.',
    commonName: 'White Arsenic',
    thermals: 'Chilly',
    thirst: 'Thirsty',
    miasm: 'Psora',
    keynotes: 'Intense anxiety about health and death, restlessness, fastidious perfectionist, burning pains relieved by heat, thirst for frequent small sips, agg midnight 1-3 AM.',
    rubricGrades: {
      rub_mind_anxiety: 3,
      rub_mind_fastidious: 3,
      rub_head_pressure_amel: 2,
      rub_skin_itching_warmth: 2,
      rub_resp_asthma_night: 3,
      rub_gen_chilly: 3,
      rub_gen_thirst_small_sips: 3,
      rub_urin_burning_mict: 2
    }
  },
  {
    name: 'Pulsatilla Pratensis',
    abbreviation: 'Puls.',
    commonName: 'Wind Flower',
    thermals: 'Hot',
    thirst: 'Thirstless',
    miasm: 'Sycosis',
    keynotes: 'Mild, gentle, weeping disposition seeking consolation, changeable symptoms, thirstless, intolerance of warm stuffy room, relief in open air, rich fatty food aggravates.',
    rubricGrades: {
      rub_mind_weeping: 3,
      rub_head_throbbing: 2,
      rub_head_pressure_amel: 2,
      rub_stom_acidity: 2,
      rub_fem_delayed_scanty: 3,
      rub_fem_dysmenorrhea_clots: 3,
      rub_gen_hot: 3,
      rub_gen_thirstless: 3,
      rub_extr_rest_agg: 2
    }
  },
  {
    name: 'Sulphur',
    abbreviation: 'Sulph.',
    commonName: 'Sublimated Sulphur',
    thermals: 'Hot',
    thirst: 'Thirsty',
    miasm: 'Psora',
    keynotes: 'Standing is the worst position, burning sensations (palms, soles, vertex), itching skin agg by warmth of bed and washing, morning diarrhea drives out of bed at 5 AM, philosophical mind.',
    rubricGrades: {
      rub_mind_irritability: 2,
      rub_head_vertex: 3,
      rub_stom_morning_diarrhea: 3,
      rub_stom_sweets_craving: 3,
      rub_skin_itching_warmth: 3,
      rub_skin_suppuration: 3,
      rub_gen_hot: 3,
      rub_urin_burning_mict: 2
    }
  },
  {
    name: 'Bryonia Alba',
    abbreviation: 'Bry.',
    commonName: 'Wild Hops',
    thermals: 'Hot',
    thirst: 'Thirsty',
    miasm: 'Psora',
    keynotes: 'Every symptom aggravated by the least motion, stitching tearing pains, ameliorated by absolute rest and hard pressure, great thirst for large quantities at long intervals, dryness of mucous membranes.',
    rubricGrades: {
      rub_mind_irritability: 2,
      rub_head_throbbing: 3,
      rub_head_pressure_amel: 3,
      rub_extr_motion_agg: 3,
      rub_extr_cervical_stiff: 2,
      rub_resp_night_cough: 2,
      rub_stom_constipation_ineff: 2
    }
  },
  {
    name: 'Rhus Toxicodendron',
    abbreviation: 'Rhus-t.',
    commonName: 'Poison Ivy',
    thermals: 'Chilly',
    thirst: 'Thirsty',
    miasm: 'Psora',
    keynotes: 'Restlessness, triangular red tip of tongue, joint and muscular stiffness agg at rest and initial movement, ameliorated by continuous movement and warm dry weather, ailments from getting wet.',
    rubricGrades: {
      rub_mind_anxiety: 2,
      rub_extr_rest_agg: 3,
      rub_extr_cold_damp_agg: 3,
      rub_extr_cervical_stiff: 3,
      rub_skin_itching_warmth: 2,
      rub_skin_eczema_folds: 2,
      rub_gen_chilly: 2
    }
  },
  {
    name: 'Belladonna',
    abbreviation: 'Bell.',
    commonName: 'Deadly Nightshade',
    thermals: 'Hot',
    thirst: 'Thirsty',
    miasm: 'Psora',
    keynotes: 'Sudden violent onset, redness, burning heat and violent throbbing carotids, right-sided headache agg light, noise, jar, lying down.',
    rubricGrades: {
      rub_head_throbbing: 3,
      rub_head_right_sided: 3,
      rub_head_sun_agg: 3,
      rub_skin_suppuration: 2,
      rub_gen_hot: 2
    }
  },
  {
    name: 'Sepia Officinalis',
    abbreviation: 'Sep.',
    commonName: 'Inky Juice of Cuttlefish',
    thermals: 'Chilly',
    thirst: 'Thirstless',
    miasm: 'Psora',
    keynotes: 'Indifference to loved ones, bearing down sensation in pelvis as if everything would protrude through vulva, yellow saddle across nose, ameliorated by violent exercise, chilly.',
    rubricGrades: {
      rub_mind_weeping: 2,
      rub_mind_irritability: 2,
      rub_head_vertex: 2,
      rub_fem_delayed_scanty: 3,
      rub_fem_dysmenorrhea_clots: 2,
      rub_skin_alopecia: 2,
      rub_gen_chilly: 3
    }
  },
  {
    name: 'Calcarea Carbonica',
    abbreviation: 'Calc.',
    commonName: 'Middle Layer of Oyster Shell',
    thermals: 'Chilly',
    thirst: 'Thirsty',
    miasm: 'Psora',
    keynotes: 'Fat, fair, flabby, perspires easily especially on head during sleep soaking pillow, cold damp feet, craving for boiled eggs and indigestible things, great chilliness.',
    rubricGrades: {
      rub_mind_anxiety: 3,
      rub_head_vertex: 2,
      rub_stom_sweets_craving: 2,
      rub_fem_delayed_scanty: 2,
      rub_extr_cold_damp_agg: 2,
      rub_gen_chilly: 3
    }
  },
  {
    name: 'Cantharis Vesicatoria',
    abbreviation: 'Canth.',
    commonName: 'Spanish Fly',
    thermals: 'Chilly',
    thirst: 'Thirsty',
    miasm: 'Psora',
    keynotes: 'Constant intolerable urging to urinate, tenesmus of bladder, burning scalding cutting pain drop by drop before, during and after micturition.',
    rubricGrades: {
      rub_urin_burning_mict: 3,
      rub_mind_anxiety: 2
    }
  }
];

export function calculateRepertorisation(selectedRubricIds: string[]): RemedyScore[] {
  if (!selectedRubricIds || selectedRubricIds.length === 0) return [];

  const results: RemedyScore[] = REMEDIES_DATABASE.map(remedy => {
    let totalMarks = 0;
    const matched: string[] = [];

    selectedRubricIds.forEach(rubId => {
      const grade = remedy.rubricGrades[rubId];
      if (grade && grade > 0) {
        totalMarks += grade;
        matched.push(rubId);
      }
    });

    return {
      remedyName: remedy.name,
      commonName: remedy.commonName,
      abbreviation: remedy.abbreviation,
      totalMarks,
      rubricsCovered: matched.length,
      keynotes: remedy.keynotes,
      matchedRubricIds: matched
    };
  });

  // Sort by marks desc, then by rubrics covered desc
  return results
    .filter(r => r.rubricsCovered > 0)
    .sort((a, b) => b.totalMarks - a.totalMarks || b.rubricsCovered - a.rubricsCovered);
}
