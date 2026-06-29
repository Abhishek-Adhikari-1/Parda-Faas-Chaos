// ============================================================
// PARDA FAAS — Strings / Localization
// All UI text in Nepali (primary) + English (subtitle)
// ============================================================

export const STRINGS = {
  // Meta
  disclaimer: {
    np: 'काल्पनिक — शैक्षिक तथा मनोरञ्जन उद्देश्यका लागि',
    en: 'Fictional — For Educational & Entertainment Purposes Only',
  },

  // Main Menu
  mainMenu: {
    playNow: { np: 'अहिले खेल्नुहोस्', en: 'Play Now' },
    characters: { np: 'अन्वेषकहरू', en: 'Investigators' },
    leaderboard: { np: 'लिडरबोर्ड', en: 'Leaderboard' },
    daily: { np: 'आजको नेता', en: "Today's Neta" },
    squad: { np: 'मेरो टोली', en: 'My Squad' },
    settings: { np: 'सेटिङ', en: 'Settings' },
  },

  // HUD
  hud: {
    integrity: { np: 'इमानदारी', en: 'Integrity' },
    evidence: { np: 'प्रमाण', en: 'Evidence' },
    streak: { np: 'स्ट्रिक', en: 'Streak' },
    special: { np: 'विशेष', en: 'Special' },
    case: { np: 'मुद्दा फाइल', en: 'Case File' },
  },

  // Controls hint
  controls: {
    move: { np: 'हिँड्नुस्', en: 'Move' },
    jump: { np: 'उफ्रिनुस्', en: 'Jump' },
    interact: { np: 'संवाद', en: 'Interact' },
    special: { np: 'विशेष क्षमता', en: 'Special Ability' },
    caseFile: { np: 'मुद्दा फाइल', en: 'Case File' },
    publish: { np: 'पर्दाफास प्रकाशन', en: 'Publish Exposé' },
    pause: { np: 'रोक्नुस्', en: 'Pause' },
    rejectBribe: { np: 'घुस अस्वीकार', en: 'Reject Bribe' },
  },

  // Failure messages (self-serving framing)
  failure: [
    { np: 'तपाईं परास्त भइनुभयो — तीन सहयोगीले यो प्रमाण श्रृंखला सुरक्षित गरे', en: 'You were outmaneuvered — three allies protected this evidence chain' },
    { np: 'समय सही नहुँदा साक्षीलाई चुप लगाइयो', en: 'The witness was silenced before your timing was right' },
    { np: 'गलत सूचना अभियानले तपाईंको पर्दाफास दबाइयो — ७३% सही थियो', en: 'A misinformation campaign buried your exposé — 73% of it was correct' },
    { np: 'अधिकारीका साथीहरूले प्रमाण लुकाए', en: 'The official\'s allies concealed the evidence in time' },
    { np: 'भ्रष्टाचार नेटवर्क तपाईंभन्दा एक कदम अगाडि थियो', en: 'The corruption network was one step ahead this time' },
  ],

  // Evidence types
  evidence: {
    document: { np: 'कागजात', en: 'Document' },
    witness: { np: 'साक्षी', en: 'Witness' },
    financial: { np: 'वित्तीय रेकर्ड', en: 'Financial Record' },
    social: { np: 'सामाजिक मिडिया', en: 'Social Media' },
    photo: { np: 'फोटो', en: 'Photo' },
  },

  // Bribe messages
  bribe: [
    { amount: 2000, insult: { np: 'एक सरकारी साथीले खाम थमाए। रु. २,०००। के तपाईंको इमानदारी यति मात्र हो?', en: 'An official\'s ally slides you an envelope. Rs. 2,000. They think THAT is what your integrity costs.' } },
    { amount: 5000, insult: { np: 'मन्त्रीको साथीले भने — रु. ५,०००। तपाईंको २० वर्षको काम यतिमै बिक्छ?', en: 'The minister\'s friend says — Rs. 5,000. They think your 20 years of work costs this much?' } },
    { amount: 500, insult: { np: 'रु. ५०० — उसले सोच्यो यही तपाईंको मूल्य हो।', en: 'Rs. 500 — he thought this was your price.' } },
  ],

  // Bribe reject animation text
  briberRejectText: { np: 'अस्वीकार!', en: 'REJECTED!' },
  briberRejectInsult: [
    { np: 'मेरो इमानदारी बिक्दैन!', en: 'My integrity is NOT for sale!' },
    { np: 'आफ्नो खाम फिर्ता लैजानुस्!', en: 'Take your envelope back!' },
    { np: 'पर्दाफास हुन्छ!', en: 'This will be exposed!' },
  ],

  // Cinematic / The Moment
  cinematic: {
    headline: (playerName, officialName, scandal) =>
      `${playerName} EXPOSES ${officialName.toUpperCase()}: ${scandal} UNCOVERED`,
    headlineNP: (playerName, officialName, scandal) =>
      `${playerName}ले ${officialName}को पर्दाफास गरे: ${scandal} उजागर`,
    dateline: 'Kathmandu, Nepal',
    paperName: 'The Pardafaas Tribune',
    paperNameNP: 'पर्दाफास ट्रिब्युन',
    byline: (playerName) => `By ${playerName}, Investigative Correspondent`,
    bylineNP: (playerName) => `${playerName} द्वारा, अन्वेषणात्मक संवाददाता`,
    shareText: { np: 'पर्दाफास कार्ड सेयर गर्नुस्', en: 'Share Exposé Card' },
    downloadText: { np: 'डाउनलोड', en: 'Download' },
    credibility: { np: 'विश्वसनीयता', en: 'Credibility' },
  },

  // Streak
  streak: {
    day: { np: 'दिन', en: 'Day' },
    warning: { np: '⚠️ तपाईंको केस चिसो हुँदैछ — साक्ष्य नष्ट हुँदैछ!', en: '⚠️ Your case goes cold — evidence is being destroyed!' },
    kept: { np: 'स्ट्रिक जारी!', en: 'Streak kept!' },
    broken: { np: 'स्ट्रिक तोडियो। आजैबाट सुरु गर्नुस्।', en: 'Streak broken. Start fresh today.' },
  },

  // Ranks
  ranks: [
    { min: 0, title: 'Rookie', titleNP: 'नवागत' },
    { min: 5, title: 'Field Reporter', titleNP: 'फिल्ड रिपोर्टर' },
    { min: 10, title: 'Correspondent', titleNP: 'संवाददाता' },
    { min: 20, title: 'Senior Journalist', titleNP: 'वरिष्ठ पत्रकार' },
    { min: 40, title: 'Editor-in-Chief', titleNP: 'प्रधान सम्पादक' },
  ],

  // NPC Witness by reputation
  witnessDialogue: {
    low: [
      { np: 'म जान्दिन... के तपाईंलाई विश्वास गर्न सकिन्छ?', en: "I don't know... can I trust you?" },
      { np: 'माफ गर्नुस्, म बोल्न सक्दिन।', en: "Sorry, I can't speak up." },
    ],
    high: [
      { np: 'वार्ड केस उजागर गर्नुभयो? राम्रो भयो। म बोल्छु।', en: "You exposed the Ward case? Good. I'll talk." },
      { np: 'तपाईंको साहस छ। म साक्षी दिन तयार छु।', en: "You have courage. I'm ready to testify." },
    ],
  },

  // Tutorial messages
  tutorial: {
    welcome: { np: 'पर्दाफासमा स्वागत छ!', en: 'Welcome to Parda Faas!' },
    move: { np: 'A/D वा Arrow Keys — हिँड्नुस्', en: 'A/D or Arrow Keys — Move' },
    jump: { np: 'W वा Up Arrow — उफ्रिनुस्। दोस्रो पटक थिच्नुस् — डबल जम्प!', en: 'W or Up Arrow — Jump. Press again mid-air for Double Jump!' },
    interact: { np: 'E — प्रमाण संकलन गर्नुस् र साक्षीसँग कुरा गर्नुस्', en: 'E — Collect evidence and talk to witnesses' },
    special: { np: 'Q — विशेष क्षमता: Demo Mode', en: 'Q — Special Ability: Demo Mode' },
    bribe: { np: 'B — घुस अस्वीकार गर्नुस्। कहिल्यै स्वीकार नगर्नुस्!', en: 'B — Reject the bribe. Never accept!' },
    publish: { np: 'Space — सबै प्रमाण संकलन भएपछि पर्दाफास प्रकाशन गर्नुस्', en: 'Space — Publish Exposé when all evidence is collected' },
    complete: { np: 'शाबास! तपाईंले पहिलो पर्दाफास गर्नुभयो!', en: 'Excellent! You completed your first exposé!' },
  },

  // Scandal names for Level 1
  scandals: {
    level1: 'Ghost Project Budget Diversion',
    level1NP: 'भुत परियोजना बजेट हिनामिना',
    level2: 'Melamchi Water Project Fund Misuse',
    level2NP: 'मेलम्ची पानी परियोजना कोष दुरुपयोग',
    level3: 'Kalanki Overpass Construction Fraud',
    level3NP: 'कलंकी ओभरपास निर्माण ठगी',
    level4: 'Province Budget Ghost Schools',
    level4NP: 'प्रदेश बजेट भुत विद्यालय',
    level5: 'Singha Durbar Ghost Contracts',
    level5NP: 'सिंहदरबार भुत ठेक्का',
  },
};

export default STRINGS;
