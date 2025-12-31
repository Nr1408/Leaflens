/*
  Banana disease info
  - Small built-in knowledge base used to show symptoms and treatments
    for the top diagnosis. Mapped by canonical names and aliases.
*/
export type DiseaseInfo = {
  name: string;
  symptoms: string[];
  treatment: string[];
};

// Canonical disease database. Keys should be human-readable names.
export const bananaDiseaseLibrary: Record<string, DiseaseInfo> = {
  Healthy: {
    name: 'Healthy Banana Leaf',
    symptoms: ['No visible lesions or spots', 'Vibrant green coloration', 'Intact leaf margins', 'No signs of wilting or discoloration'],
    treatment: [
      'Maintain optimal growing conditions including proper watering and fertilization',
      'Regularly inspect for early signs of disease or pest infestation',
      'Ensure good air circulation around the plants',
      'Consider preventative cultural practices to reduce stress on the plants',
    ],
  },
  'Black Sigatoka': {
    name: 'Black and Yellow Sigatoka',
    symptoms: ['Dark, elongated streaks on leaf undersides', 'Brown to black necrotic spots that coalesce', 'Premature leaf death reducing yield'],
    treatment: ['Remove and destroy heavily infected leaves', 'Reduce leaf wetness; improve spacing and airflow', 'Apply recommended fungicides per local guidance'],
  },
  'Yellow Sigatoka': {
    name: 'Yellow Sigatoka',
    symptoms: ['Yellowish streaks or spots on leaves', 'Lesions develop brown centers with yellow halos', 'Leaf area loss over time'],
    treatment: ['Improve sanitation by removing infected leaves', 'Optimize irrigation to avoid prolonged wetness', 'Follow a fungicide rotation program if advised'],
  },
  'Fusarium Wilt': {
    name: 'Fusarium Wilt',
    symptoms: ['Yellowing of older leaves first', 'Brown vascular discoloration in pseudostem', 'Plant wilting and collapse in severe cases'],
    treatment: ['Rogue infected plants and destroy safely', 'Improve soil drainage and avoid waterlogging', 'Use resistant or tolerant cultivars when available'],
  },
  'Bacterial Wilt': {
    name: 'Bacterial Wilt',
    symptoms: ['Sudden leaf yellowing and wilting', 'Bacterial ooze from cut tissues', 'Fruit pulp discoloration in advanced stages'],
    treatment: ['Uproot and destroy infected plants', 'Disinfect tools and avoid movement of contaminated soil', 'Use clean planting material and control insect vectors'],
  },
  Anthracnose: {
    name: 'Anthracnose',
    symptoms: ['Small dark spots on leaves or fruit', 'Lesions expand with orange/pink spore masses under humid conditions', 'Fruit blemishes and post-harvest rots'],
    treatment: ['Prune to increase airflow', 'Avoid overhead irrigation', 'Apply approved fungicides pre- and post-harvest where recommended'],
  },
  'Banana Bunchy Top Virus': {
    name: 'Banana Bunchy Top Virus',
    symptoms: ['Stunted growth with bunched leaves at the top', 'Dark green streaks on leaf midrib and petiole', 'Narrow, upright leaves with marginal chlorosis'],
    treatment: ['Remove infected mats promptly', 'Control aphid vectors', 'Use virus-free planting material'],
  },
  'Banana Streak Virus': {
    name: 'Banana Streak Virus',
    symptoms: ['Chlorotic streaks and mosaic patterns on leaves', 'Reduced vigor and yield'],
    treatment: ['Use clean suckers', 'Control mealybug vectors', 'Remove severely affected plants'],
  },
  'Banana Split Peel': {
    name: 'Banana Split Peel',
    symptoms: ['Peel cracking or splitting during development', 'Often associated with irregular watering or rapid growth', 'Fruit surface blemishes without significant leaf lesions'],
    treatment: ['Maintain even irrigation and avoid sudden water stress', 'Mulch to regulate soil moisture', 'Avoid physical damage and extreme temperature fluctuations'],
  },
  'Banana Leaf Spot': {
    name: 'Banana Leaf Spot',
    symptoms: ['Small brown spots on leaves that may enlarge', 'Yellow halos around lesions in some cases'],
    treatment: ['Remove severely affected leaves', 'Reduce overhead watering', 'Consider protective sprays per local recommendations'],
  },
  // New: dataset-specific classes and pests
  'Black and Yellow Sigatoka': {
    name: 'Black and Yellow Sigatoka',
    symptoms: [
      'Yellowish streaks progressing to brown/black lesions',
      'Dark necrotic patches that may coalesce',
      'Premature leaf death reducing photosynthetic area',
    ],
    treatment: [
      'Sanitation: remove and destroy heavily infected leaves',
      'Improve airflow and reduce leaf wetness (optimize spacing/irrigation)',
      'Follow recommended fungicide rotation where advised',
    ],
  },
  'Banana Fruit-Scarring Beetle': {
    name: 'Banana Fruit-Scarring Beetle',
    symptoms: [
      'Feeding scars and pitting on developing fruit surface',
      'Superficial blemishes that can reduce market quality',
      'Occasional secondary infections at damaged sites',
    ],
    treatment: [
      'Field sanitation: remove infested/deformed fruit and crop debris',
      'Use baited traps or barriers when suitable',
      'Apply targeted insecticides only if economic thresholds are exceeded per local guidance',
    ],
  },
  'Banana Skipper Damage': {
    name: 'Banana Skipper Damage',
    symptoms: [
      'Rolled or folded leaves with caterpillars inside',
      'Irregular chewing damage on leaves',
      'Reduced leaf area and vigor under heavy infestation',
    ],
    treatment: [
      'Hand-remove rolled leaves harboring larvae where practical',
      'Encourage biological control; consider Bacillus thuringiensis (Bt) for young larvae',
      'Avoid broad-spectrum insecticides that disrupt beneficials unless necessary',
    ],
  },
  'Chewing insect damage on banana leaf': {
    name: 'Chewing insect damage on banana leaf',
    symptoms: [
      'Holes or notches along leaf margins',
      'Irregular patches of missing tissue',
      'Frass or insect presence on or under leaves',
    ],
    treatment: [
      'Manual removal or exclusion (nets, traps) depending on pest',
      'Botanical options such as neem-based sprays where appropriate',
      'Targeted insecticides only if required; monitor and follow local IPM guidance',
    ],
  },
};

// Map model output variants or machine labels to canonical keys above.
const aliases: Record<string, string> = {
  // common sigatoka variants
  black_sigatoka: 'Black Sigatoka',
  yellow_sigatoka: 'Yellow Sigatoka',
  sigatoka: 'Yellow Sigatoka',
  black_and_yellow_sigatoka: 'Black and Yellow Sigatoka',
  // fusarium
  fusarium: 'Fusarium Wilt',
  panama: 'Fusarium Wilt',
  panama_disease: 'Fusarium Wilt',
  panama_wilt: 'Fusarium Wilt',
  panama_wilt_disease: 'Fusarium Wilt',
  // bacterial wilt
  bacterial_wilt: 'Bacterial Wilt',
  moko: 'Bacterial Wilt',
  // viruses
  bbTV: 'Banana Bunchy Top Virus',
  bunchy_top: 'Banana Bunchy Top Virus',
  bsv: 'Banana Streak Virus',
  streak_virus: 'Banana Streak Virus',
  // other
  anthracnose: 'Anthracnose',
  leaf_spot: 'Banana Leaf Spot',
  healthy: 'Healthy',
  banana_split_peel: 'Banana Split Peel',
  banana_split: 'Banana Split Peel',
  // dataset names / pests
  banana_fruit_scarring_beetle: 'Banana Fruit-Scarring Beetle',
  banana_skipper_damage: 'Banana Skipper Damage',
  chewing_insect_damage_on_banana_leaf: 'Chewing insect damage on banana leaf',
  healthy_banana: 'Healthy',
  healthy_banana_leaf: 'Healthy',
};

function norm(s: string) {
  return String(s || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

// Look up disease info by label, handling aliases and basic title-casing
export function getDiseaseInfo(label: string): DiseaseInfo | null {
  if (!label) return null;
  // direct match first
  if (bananaDiseaseLibrary[label]) return bananaDiseaseLibrary[label];
  // alias match
  const n = norm(label);
  const key = aliases[n];
  if (key && bananaDiseaseLibrary[key]) return bananaDiseaseLibrary[key];
  // title-case heuristic
  const guess = label
    .split(/[_\-\s]+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
  if (bananaDiseaseLibrary[guess]) return bananaDiseaseLibrary[guess];
  return null;
}
