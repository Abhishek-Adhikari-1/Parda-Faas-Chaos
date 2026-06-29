// ============================================================
// PARDA FAAS — Level Configuration
// All 5 levels + tutorial evidence pools, countermoves, NPCs
// ============================================================

export const LEVELS = {
  tutorial: {
    id: 'tutorial',
    name: 'Ward Office, Kathmandu',
    nameNP: 'वार्ड कार्यालय, काठमाडौं',
    difficulty: 0,
    difficultyLabel: '📗 Tutorial',
    canLose: false,
    forcedCharacter: 'balen',
    timeLimit: 0, // no timer
    requiredEvidence: 3,
    evidencePool: [
      { id: 'tut_doc1', type: 'document', valid: true, weight: 1, label: 'Budget Sheet', labelNP: 'बजेट पाना', x: 350, y: 520 },
      { id: 'tut_doc2', type: 'document', valid: true, weight: 1, label: 'Ghost Invoice', labelNP: 'भुत बिल', x: 650, y: 420 },
      { id: 'tut_witness1', type: 'witness', valid: true, weight: 2, label: 'Local Resident', labelNP: 'स्थानीय बासिन्दा', x: 900, y: 470, dialogue: 'witness_tut_1' },
    ],
    redHerrings: [],
    countermoves: [],
    officialName: 'Ward Councillor Rajan',
    officialNameNP: 'वार्ड परिषद् राजन',
    scandal: 'Ghost Project Budget',
    scandalNP: 'भुत परियोजना बजेट',
    background: 'ward_office',
    music: 'background_tutorial',
    cutscene: null,
  },

  level1: {
    id: 'level1',
    name: 'Ward Councillor',
    nameNP: 'वार्ड परिषद्',
    subtitle: 'Local ward office — ghost projects, missing budgets',
    subtitleNP: 'स्थानीय वार्ड कार्यालय — भुत परियोजना, हराएको बजेट',
    difficulty: 1,
    difficultyLabel: '🟢 Easy',
    canLose: true,
    timeLimit: 120000, // 2 minutes
    requiredEvidence: 5,
    evidencePool: [
      { id: 'l1_e1', type: 'document', valid: true, weight: 2, label: 'Missing Road Budget', labelNP: 'हराएको सडक बजेट', x: 450, y: 480 },
      { id: 'l1_e2', type: 'financial', valid: true, weight: 3, label: 'Ghost Invoice #447', labelNP: 'भुत बिल #४४७', x: 780, y: 380 },
      { id: 'l1_e3', type: 'document', valid: true, weight: 2, label: 'Broken Footpath Report', labelNP: 'टुटेको फुटपाथ रिपोर्ट', x: 1100, y: 500 },
      { id: 'l1_e4', type: 'photo', valid: true, weight: 2, label: 'Construction Photo', labelNP: 'निर्माण तस्वीर', x: 1450, y: 430 },
      { id: 'l1_e5', type: 'witness', valid: true, weight: 3, label: 'Ward Resident', labelNP: 'वार्ड बासिन्दा', x: 1750, y: 500, dialogue: 'witness_l1_1' },
      { id: 'l1_e6', type: 'witness', valid: true, weight: 2, label: 'Junior Clerk', labelNP: 'कनिष्ठ क्लर्क', x: 2100, y: 460, dialogue: 'witness_l1_2' },
    ],
    redHerrings: [
      { id: 'l1_rh1', type: 'document', valid: false, weight: 0, label: 'Routine Maintenance Form', labelNP: 'नियमित मर्मत फाराम', x: 600, y: 500, penalty: -5 },
    ],
    countermoves: [
      { type: 'thugs', delay: 20000, duration: 5000, label: 'Hired Thugs', labelNP: 'भाडाका गुण्डाहरू' },
    ],
    officialName: 'Ward Councillor Bikash Khadka',
    officialNameNP: 'वार्ड परिषद् विकास खड्का',
    scandal: 'Ghost Road Project — ₹2 Crore Missing',
    scandalNP: 'भुत सडक परियोजना — रु. २ करोड हिनामिना',
    background: 'ward_office',
    music: 'background_level1',
    cutscene: {
      duration: 8000,
      images: ['broken_road', 'children_walking'],
      text: '₹2 crore allocated. Road: still broken.',
      textNP: 'रु. २ करोड छुट्याइयो। सडक: अझै टुटेकै।',
    },
    platformLayout: [
      { x: 0, y: 576, width: 400, type: 'ground' },
      { x: 380, y: 576, width: 800, type: 'ground' },
      { x: 1160, y: 576, width: 700, type: 'ground' },
      { x: 1840, y: 576, width: 600, type: 'ground' },
      { x: 2420, y: 576, width: 400, type: 'ground' },
      // Elevated platforms
      { x: 300, y: 450, width: 200, type: 'platform' },
      { x: 600, y: 380, width: 180, type: 'platform' },
      { x: 900, y: 440, width: 200, type: 'platform' },
      { x: 1200, y: 360, width: 180, type: 'platform' },
      { x: 1500, y: 420, width: 200, type: 'platform' },
      { x: 1800, y: 380, width: 180, type: 'platform' },
      { x: 2100, y: 450, width: 200, type: 'platform' },
    ],
    worldWidth: 3200,
  },

  level2: {
    id: 'level2',
    name: 'Municipality Mayor',
    nameNP: 'नगरपालिका मेयर',
    difficulty: 2,
    difficultyLabel: '🟡 Medium',
    timeLimit: 100000,
    requiredEvidence: 5,
    evidencePool: [],
    redHerrings: [
      { id: 'l2_rh1', type: 'financial', valid: false, weight: 0, label: 'Planted Expense Report', labelNP: 'लगाइएको खर्च रिपोर्ट', x: 400, y: 480, penalty: -20, isConfirmationBiasTrap: true },
    ],
    countermoves: [
      { type: 'misinformation_cloud', delay: 30000, duration: 20000 },
    ],
    officialName: 'Mayor Deepak Shrestha',
    officialNameNP: 'मेयर दीपक श्रेष्ठ',
    scandal: 'Melamchi Water Project Fund Diversion',
    scandalNP: 'मेलम्ची पानी परियोजना कोष हिनामिना',
    background: 'municipality',
    music: 'background_level2',
  },
};

export const WITNESS_DIALOGUES = {
  witness_tut_1: {
    lines: [
      { np: 'हजुर! म यहाँको बासिन्दा हुँ। बाटो बन्दैन।', en: "Yes! I'm a local resident. The road never gets built." },
      { np: 'मेरा बच्चाहरू हरेक दिन खाल्डो छलेर स्कुल जान्छन्।', en: 'My children walk around potholes every day to reach school.' },
      { np: 'यो बजेट कहाँ गयो? सोध्नुपर्छ।', en: 'Where did this budget go? We must ask.' },
    ],
    evidenceGranted: true,
  },
  witness_l1_1: {
    lines: [
      { np: 'म सुरुमा बोल्न डराएँ। तर तपाईंको साहस देखेर...',  en: "I was afraid to speak at first. But seeing your courage..." },
      { np: 'वार्ड परिषद् विकासले ठेकेदारलाई आधा रकम दिए। बाँकी?', en: 'Ward Councillor Bikash paid the contractor half the amount. The rest?' },
      { np: 'उनको घरको तल्लो तलामा नयाँ गाडी आयो।', en: 'A new car appeared in his garage.' },
    ],
    evidenceGranted: true,
  },
  witness_l1_2: {
    lines: [
      { np: 'मलाई जागिर जाला भनेर डर लागेको थियो।', en: 'I was afraid of losing my job.' },
      { np: 'तर फाइलहरूमा जे लेखिएको छ... त्यो साँचो होइन।', en: "But what's written in those files... it's not true." },
      { np: 'बजेट अनुमोदन गरियो — काम भएन। सबैलाई थाहा छ।', en: 'Budget was approved — work never happened. Everyone knows.' },
    ],
    evidenceGranted: true,
  },
};

export default LEVELS;
