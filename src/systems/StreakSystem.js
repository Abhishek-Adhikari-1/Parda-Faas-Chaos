// ============================================================
// PARDA FAAS — Streak System (Daily Login + Extinction Burst)
// Uses localStorage for persistence
// ============================================================

const STORAGE_KEY = 'pardafaas_streak';
const PLAYER_KEY = 'pardafaas_player';

export class StreakSystem {
  constructor() {
    this.data = this._load();
    this._checkStreak();
  }

  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {
      streak: 0,
      lastLogin: null,
      longestStreak: 0,
      totalDays: 0,
    };
  }

  _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {}
  }

  _checkStreak() {
    const now = new Date();
    const today = now.toDateString();
    const lastLogin = this.data.lastLogin ? new Date(this.data.lastLogin) : null;

    if (!lastLogin) {
      // First time
      this.data.streak = 1;
      this.data.totalDays = 1;
      this.data.lastLogin = now.toISOString();
      this._save();
      return;
    }

    const daysSince = Math.floor((now - lastLogin) / 86400000);

    if (today === lastLogin.toDateString()) {
      // Already logged in today — no change
      return;
    } else if (daysSince === 1) {
      // Consecutive day!
      this.data.streak += 1;
      this.data.totalDays += 1;
      if (this.data.streak > this.data.longestStreak) {
        this.data.longestStreak = this.data.streak;
      }
    } else if (daysSince > 1) {
      // Streak broken
      this.data.streak = 1;
      this.data.totalDays += 1;
    }

    this.data.lastLogin = now.toISOString();
    this._save();
  }

  get streak() { return this.data.streak; }
  get totalDays() { return this.data.totalDays; }
  get longestStreak() { return this.data.longestStreak; }

  /** Returns true if user is at risk of losing streak (hasn't logged in today AND last login was yesterday) */
  isAtRisk() {
    if (!this.data.lastLogin) return false;
    const last = new Date(this.data.lastLogin);
    const now = new Date();
    const hoursSince = (now - last) / 3600000;
    return hoursSince >= 12 && hoursSince < 36;
  }

  /** Get daily reward info for current streak day */
  getDailyReward() {
    const s = this.data.streak;
    if (s >= 30) return { type: 'rank_badge', label: 'Senior Correspondent Badge', credibility: 500 };
    if (s >= 14) return { type: 'special_case', label: 'Election Season Case', credibility: 200 };
    if (s >= 7) return { type: 'cinematic', label: 'Week 1 Investigator News Headline', credibility: 150 };
    if (s >= 5) return { type: 'skin', label: 'Rare Press Badge Skin', credibility: 75 };
    if (s >= 3) return { type: 'badge', label: 'Investigator Badge Upgrade', credibility: 30 };
    if (s >= 2) return { type: 'credibility', label: '+10 Credibility Bonus', credibility: 10 };
    return { type: 'case', label: '"Neta of the Day" Case', credibility: 5 };
  }
}

// ============================================================
// Player Profile (localStorage)
// ============================================================
export class PlayerProfile {
  constructor() {
    this.data = this._load();
  }

  _load() {
    try {
      const raw = localStorage.getItem(PLAYER_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {
      name: 'Investigator',
      nameSet: false,
      credibility: 0,
      casesCompleted: 0,
      officialsExposed: 0,
      currentCharacter: 'balen',
      reputation: 0,
      rank: 0,
      unlockedCharacters: ['balen', 'aasika_tamang', 'mahabir_pun'],
      unlockedLevels: ['tutorial', 'level1'],
      achievements: [],
      history: [],
    };
  }

  _save() {
    try {
      localStorage.setItem(PLAYER_KEY, JSON.stringify(this.data));
    } catch (e) {}
  }

  setName(name) {
    this.data.name = name;
    this.data.nameSet = true;
    this._save();
  }

  addCredibility(amount) {
    this.data.credibility += amount;
    this.data.reputation = Math.min(100, Math.floor(this.data.credibility / 50));
    this._save();
  }

  completeCase(levelId, officialName, credibilityEarned) {
    this.data.casesCompleted += 1;
    this.data.officialsExposed += 1;
    this.addCredibility(credibilityEarned);
    this.data.history.push({
      date: new Date().toISOString(),
      levelId,
      officialName,
      credibility: credibilityEarned,
    });
    this._save();
  }

  setCharacter(charId) {
    this.data.currentCharacter = charId;
    this._save();
  }

  unlockCharacter(charId) {
    if (!this.data.unlockedCharacters.includes(charId)) {
      this.data.unlockedCharacters.push(charId);
      this._save();
    }
  }

  getRank() {
    const ranks = [
      { min: 0, title: 'Rookie', titleNP: 'नवागत' },
      { min: 5, title: 'Field Reporter', titleNP: 'फिल्ड रिपोर्टर' },
      { min: 10, title: 'Correspondent', titleNP: 'संवाददाता' },
      { min: 20, title: 'Senior Journalist', titleNP: 'वरिष्ठ पत्रकार' },
      { min: 40, title: 'Editor-in-Chief', titleNP: 'प्रधान सम्पादक' },
    ];
    let rank = ranks[0];
    for (const r of ranks) {
      if (this.data.casesCompleted >= r.min) rank = r;
    }
    return rank;
  }

  get name() { return this.data.name; }
  get credibility() { return this.data.credibility; }
  get reputation() { return this.data.reputation; }
  get casesCompleted() { return this.data.casesCompleted; }
  get currentCharacter() { return this.data.currentCharacter; }
  get unlockedCharacters() { return this.data.unlockedCharacters; }
}
