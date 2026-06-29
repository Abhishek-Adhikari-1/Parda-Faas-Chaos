// ============================================================
// PARDA FAAS — Boot Scene
// Asset preloading, loading screen with news ticker
// Gamification: Priming — news ticker shapes investigator mindset
// ============================================================

import Phaser from 'phaser';
import { CHARACTERS, CHARACTER_ORDER } from '../config/characters.js';
import { CharacterLoader } from '../systems/CharacterLoader.js';

const NEWS_HEADLINES = [
  '🔴 BREAKING: Ward budget misappropriated — ₹2 crore unaccounted | रु. २ करोड बेपत्ता',
  '📰 Municipality construction fund diverted | नगरपालिका निर्माण कोष हिनामिना',
  '🔍 Citizens demand transparency in district project | पारदर्शिता माग',
  '⚠️ Ghost employees found on government payroll | भुत कर्मचारी',
  '🗂️ Leaked documents expose procurement fraud | खरिद ठगी उजागर',
  '🏛️ Province assembly budget under investigation | प्रदेश सभा बजेट अनुसन्धानमा',
  '💰 Audit report: ₹50 lakh unspent, rerouted | रु. ५० लाख अन्यत्र',
  '📱 Social media pressure forces official resignation | राजीनामा',
  '🕵️ Investigative journalist exposes water project fraud | जल परियोजना ठगी',
  '🚨 Cabinet-level corruption network dismantled | नेटवर्क भंग',
];

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    this._setupLoadingUI();
    this._loadAssets();
  }

  _setupLoadingUI() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    // The HTML loading screen handles visual loading display
    // We update its bar here
    this.load.on('progress', (value) => {
      const bar = document.getElementById('loading-bar');
      const tip = document.getElementById('loading-tip');
      if (bar) bar.style.width = `${Math.floor(value * 100)}%`;
      if (tip) {
        const tips = [
          'Loading investigation files...',
          'Preparing evidence folders...',
          'Briefing investigators...',
          'Setting up case files...',
          'Almost ready to expose corruption...',
        ];
        tip.textContent = tips[Math.floor(value * (tips.length - 1))];
      }
    });

    this.load.on('complete', () => {
      const screen = document.getElementById('loading-screen');
      if (screen) {
        screen.classList.add('fade-out');
        setTimeout(() => { screen.style.display = 'none'; }, 900);
      }
    });
  }

  _loadAssets() {
    // Load character assets (with fallback handling)
    CharacterLoader.preloadAll(this, CHARACTER_ORDER);

    // Load UI assets that might exist
    this.load.image('panel_bg', 'assets/ui/panel_bg.png');
    this.load.image('dhaka_border', 'assets/ui/dhaka_border.png');
    this.load.image('health_bar', 'assets/ui/health_bar.png');
    this.load.image('evidence_icon', 'assets/icons/evidence.png');
    this.load.image('bribe_icon', 'assets/icons/bribe.png');

    // Suppress 404 errors for optional assets
    this.load.on('loaderror', (file) => {
      // Silently ignore missing optional assets
      console.log(`[Asset] Fallback active for: ${file.key}`);
    });

    // Create a tiny 1x1 pixel texture for when assets are missing
    // This prevents Phaser from showing the missing texture checkerboard everywhere
  }

  create() {
    // Create all placeholder textures for characters
    Object.values(CHARACTERS).forEach(charConfig => {
      CharacterLoader.createFallbackTexture(this, charConfig.id, charConfig);
      CharacterLoader.createPortraitTexture(this, charConfig.id, charConfig);
    });

    // Create common game textures procedurally
    this._createGameTextures();

    // Start news ticker (Priming gamification technique)
    this._startNewsTicker();

    // Transition to main menu after 1.5s
    this.time.delayedCall(1500, () => {
      this.scene.start('MainMenuScene');
    });
  }

  _createGameTextures() {
    // Ground tile
    const groundGfx = this.make.graphics({ x: 0, y: 0, add: false });
    groundGfx.fillStyle(0x5D4037, 1);
    groundGfx.fillRect(0, 0, 64, 32);
    groundGfx.lineStyle(2, 0x3E2723, 1);
    groundGfx.strokeRect(0, 0, 64, 32);
    groundGfx.fillStyle(0x8D6E63, 1);
    groundGfx.fillRect(2, 2, 60, 8);
    groundGfx.generateTexture('ground_tile', 64, 32);
    groundGfx.destroy();

    // Platform tile
    const platGfx = this.make.graphics({ x: 0, y: 0, add: false });
    platGfx.fillStyle(0x4E342E, 1);
    platGfx.fillRoundedRect(0, 0, 64, 20, 4);
    platGfx.lineStyle(2, 0x795548, 1);
    platGfx.strokeRoundedRect(0, 0, 64, 20, 4);
    platGfx.fillStyle(0x6D4C41, 0.5);
    platGfx.fillRect(4, 4, 56, 8);
    platGfx.generateTexture('platform_tile', 64, 20);
    platGfx.destroy();

    // Evidence items
    const evidenceTypes = {
      document: { color: 0xECEFF1, accent: 0x1565C0 },
      financial: { color: 0xFFF9C4, accent: 0xF57F17 },
      witness: { color: 0xE8F5E9, accent: 0x2E7D32 },
      photo: { color: 0xFCE4EC, accent: 0xC62828 },
      social: { color: 0xE3F2FD, accent: 0x1976D2 },
    };

    Object.entries(evidenceTypes).forEach(([type, colors]) => {
      const eg = this.make.graphics({ x: 0, y: 0, add: false });
      eg.fillStyle(colors.color, 1);
      eg.fillRoundedRect(0, 0, 36, 44, 6);
      eg.lineStyle(3, 0x000000, 1);
      eg.strokeRoundedRect(0, 0, 36, 44, 6);
      eg.fillStyle(colors.accent, 1);
      eg.fillRect(4, 8, 28, 4);
      eg.fillRect(4, 16, 20, 4);
      eg.fillRect(4, 24, 24, 4);
      eg.fillRect(4, 32, 16, 4);
      // Glow dot
      eg.fillStyle(colors.accent, 1);
      eg.fillCircle(30, 8, 5);
      eg.generateTexture(`evidence_${type}`, 36, 44);
      eg.destroy();
    });

    // Red herring evidence (slightly warmer glow)
    const rhGfx = this.make.graphics({ x: 0, y: 0, add: false });
    rhGfx.fillStyle(0xFFF8E1, 1);
    rhGfx.fillRoundedRect(0, 0, 36, 44, 6);
    rhGfx.lineStyle(3, 0xFF6B00, 1);
    rhGfx.strokeRoundedRect(0, 0, 36, 44, 6);
    rhGfx.fillStyle(0xFF8F00, 1);
    rhGfx.fillRect(4, 8, 28, 4);
    rhGfx.fillRect(4, 16, 20, 4);
    rhGfx.fillRect(4, 24, 24, 4);
    rhGfx.fillCircle(30, 8, 5);
    rhGfx.generateTexture('evidence_redherring', 36, 44);
    rhGfx.destroy();

    // Witness NPC (generic cartoon figure)
    const witnessGfx = this.make.graphics({ x: 0, y: 0, add: false });
    witnessGfx.fillStyle(0xFFCC80, 1);
    witnessGfx.fillCircle(24, 20, 18);
    witnessGfx.lineStyle(3, 0x000000, 1);
    witnessGfx.strokeCircle(24, 20, 18);
    witnessGfx.fillStyle(0x5C6BC0, 1);
    witnessGfx.fillRoundedRect(8, 36, 32, 40, 6);
    witnessGfx.lineStyle(2, 0x000000, 1);
    witnessGfx.strokeRoundedRect(8, 36, 32, 40, 6);
    witnessGfx.fillStyle(0x000000, 1);
    witnessGfx.fillCircle(18, 18, 3);
    witnessGfx.fillCircle(30, 18, 3);
    witnessGfx.lineStyle(2, 0x333333, 1);
    witnessGfx.beginPath();
    witnessGfx.arc(24, 24, 5, 0.3, Math.PI - 0.3);
    witnessGfx.strokePath();
    witnessGfx.generateTexture('npc_witness', 48, 80);
    witnessGfx.destroy();

    // Thug NPC (enemy)
    const thugGfx = this.make.graphics({ x: 0, y: 0, add: false });
    thugGfx.fillStyle(0xFF5722, 1);
    thugGfx.fillCircle(24, 20, 18);
    thugGfx.lineStyle(3, 0x000000, 1);
    thugGfx.strokeCircle(24, 20, 18);
    thugGfx.fillStyle(0x212121, 1);
    thugGfx.fillRoundedRect(6, 36, 36, 44, 6);
    thugGfx.lineStyle(2, 0x000000, 1);
    thugGfx.strokeRoundedRect(6, 36, 36, 44, 6);
    thugGfx.fillStyle(0x000000, 1);
    thugGfx.fillCircle(17, 18, 4);
    thugGfx.fillCircle(31, 18, 4);
    thugGfx.lineStyle(3, 0x333333, 1);
    thugGfx.beginPath();
    thugGfx.moveTo(18, 26);
    thugGfx.lineTo(30, 26);
    thugGfx.strokePath();
    thugGfx.generateTexture('npc_thug', 48, 84);
    thugGfx.destroy();

    // Official (boss-lite NPC)
    const officialGfx = this.make.graphics({ x: 0, y: 0, add: false });
    officialGfx.fillStyle(0xFFDDAA, 1);
    officialGfx.fillCircle(30, 22, 22);
    officialGfx.lineStyle(3, 0x000000, 1);
    officialGfx.strokeCircle(30, 22, 22);
    // Suit
    officialGfx.fillStyle(0x1A237E, 1);
    officialGfx.fillRoundedRect(6, 40, 48, 56, 8);
    officialGfx.lineStyle(2, 0x000000, 1);
    officialGfx.strokeRoundedRect(6, 40, 48, 56, 8);
    // Tie
    officialGfx.fillStyle(0xC0392B, 1);
    officialGfx.fillTriangle(30, 42, 24, 68, 36, 68);
    // Eyes (shifty)
    officialGfx.fillStyle(0xFFFFFF, 1);
    officialGfx.fillCircle(22, 20, 6);
    officialGfx.fillCircle(38, 20, 6);
    officialGfx.fillStyle(0x000000, 1);
    officialGfx.fillCircle(24, 20, 3);
    officialGfx.fillCircle(40, 20, 3);
    // Sweat drop
    officialGfx.fillStyle(0x64B5F6, 1);
    officialGfx.fillCircle(52, 12, 4);
    officialGfx.generateTexture('npc_official', 60, 100);
    officialGfx.destroy();

    // Bribe envelope
    const envGfx = this.make.graphics({ x: 0, y: 0, add: false });
    envGfx.fillStyle(0xFFF9C4, 1);
    envGfx.fillRoundedRect(0, 12, 80, 56, 4);
    envGfx.lineStyle(3, 0x000000, 1);
    envGfx.strokeRoundedRect(0, 12, 80, 56, 4);
    envGfx.fillStyle(0xF57F17, 0.3);
    envGfx.fillTriangle(0, 12, 80, 12, 40, 40);
    envGfx.lineStyle(2, 0x000000, 0.5);
    envGfx.beginPath();
    envGfx.moveTo(0, 12); envGfx.lineTo(40, 40); envGfx.lineTo(80, 12);
    envGfx.strokePath();
    // Money peek
    envGfx.fillStyle(0x4CAF50, 1);
    envGfx.fillRect(20, 30, 40, 20);
    envGfx.lineStyle(1, 0x000000, 1);
    envGfx.strokeRect(20, 30, 40, 20);
    envGfx.generateTexture('bribe_envelope', 80, 70);
    envGfx.destroy();

    // Corruption bubble
    const bubbleGfx = this.make.graphics({ x: 0, y: 0, add: false });
    bubbleGfx.fillStyle(0x4A148C, 0.7);
    bubbleGfx.fillCircle(32, 32, 30);
    bubbleGfx.lineStyle(3, 0xAB47BC, 1);
    bubbleGfx.strokeCircle(32, 32, 30);
    bubbleGfx.fillStyle(0xCE93D8, 0.4);
    bubbleGfx.fillCircle(22, 22, 10);
    bubbleGfx.generateTexture('corruption_bubble', 64, 64);
    bubbleGfx.destroy();

    // Particle: gold spark
    const sparkGfx = this.make.graphics({ x: 0, y: 0, add: false });
    sparkGfx.fillStyle(0xF1C40F, 1);
    sparkGfx.fillCircle(4, 4, 4);
    sparkGfx.generateTexture('spark', 8, 8);
    sparkGfx.destroy();

    // Particle: red confetti
    const confGfx = this.make.graphics({ x: 0, y: 0, add: false });
    confGfx.fillStyle(0xFF6B00, 1);
    confGfx.fillRect(0, 0, 8, 4);
    confGfx.generateTexture('confetti_orange', 8, 4);
    confGfx.destroy();

    const confGfx2 = this.make.graphics({ x: 0, y: 0, add: false });
    confGfx2.fillStyle(0xF1C40F, 1);
    confGfx2.fillRect(0, 0, 6, 8);
    confGfx2.generateTexture('confetti_gold', 6, 8);
    confGfx2.destroy();

    const confGfx3 = this.make.graphics({ x: 0, y: 0, add: false });
    confGfx3.fillStyle(0xC0392B, 1);
    confGfx3.fillRect(0, 0, 10, 5);
    confGfx3.generateTexture('confetti_red', 10, 5);
    confGfx3.destroy();

    // Integrity shield
    const shieldGfx = this.make.graphics({ x: 0, y: 0, add: false });
    shieldGfx.fillStyle(0x0D7377, 0.6);
    shieldGfx.fillTriangle(24, 2, 2, 10, 2, 38);
    shieldGfx.fillTriangle(24, 2, 46, 10, 46, 38);
    shieldGfx.fillTriangle(2, 38, 24, 50, 46, 38);
    shieldGfx.lineStyle(3, 0x26C6DA, 1);
    shieldGfx.beginPath();
    shieldGfx.moveTo(24, 2); shieldGfx.lineTo(2, 10); shieldGfx.lineTo(2, 38);
    shieldGfx.lineTo(24, 50); shieldGfx.lineTo(46, 38); shieldGfx.lineTo(46, 10);
    shieldGfx.closePath();
    shieldGfx.strokePath();
    shieldGfx.generateTexture('integrity_shield', 48, 52);
    shieldGfx.destroy();

    // Press badge (for HUD)
    const badgeGfx = this.make.graphics({ x: 0, y: 0, add: false });
    badgeGfx.fillStyle(0xFF6B00, 1);
    badgeGfx.fillRoundedRect(0, 0, 56, 72, 6);
    badgeGfx.lineStyle(3, 0x000000, 1);
    badgeGfx.strokeRoundedRect(0, 0, 56, 72, 6);
    badgeGfx.fillStyle(0xFFFFFF, 1);
    badgeGfx.fillRoundedRect(4, 4, 48, 64, 4);
    badgeGfx.fillStyle(0xFF6B00, 1);
    badgeGfx.fillRect(8, 20, 40, 6);
    badgeGfx.fillRect(8, 32, 30, 4);
    badgeGfx.fillRect(8, 42, 36, 4);
    badgeGfx.fillStyle(0x1A1A2E, 1);
    badgeGfx.fillRoundedRect(8, 8, 40, 40, 4);
    // "PRESS" text area
    badgeGfx.fillStyle(0xF1C40F, 1);
    badgeGfx.fillRect(8, 54, 40, 10);
    badgeGfx.generateTexture('press_badge', 56, 72);
    badgeGfx.destroy();

    // Tutorial arrow
    const arrowGfx = this.make.graphics({ x: 0, y: 0, add: false });
    arrowGfx.fillStyle(0xF1C40F, 1);
    arrowGfx.fillTriangle(20, 0, 40, 20, 0, 20);
    arrowGfx.generateTexture('tutorial_arrow', 40, 20);
    arrowGfx.destroy();

    // Interaction prompt (E key icon)
    const eKeyGfx = this.make.graphics({ x: 0, y: 0, add: false });
    eKeyGfx.fillStyle(0x1A1A2E, 0.9);
    eKeyGfx.fillRoundedRect(0, 0, 32, 32, 6);
    eKeyGfx.lineStyle(2, 0xF1C40F, 1);
    eKeyGfx.strokeRoundedRect(0, 0, 32, 32, 6);
    eKeyGfx.generateTexture('e_key_bg', 32, 32);
    eKeyGfx.destroy();
  }

  _startNewsTicker() {
    // Update HTML loading screen tip with news headlines
    let idx = 0;
    const tip = document.getElementById('loading-tip');
    if (!tip) return;
    const rotate = () => {
      tip.textContent = NEWS_HEADLINES[idx % NEWS_HEADLINES.length];
      idx++;
    };
    rotate();
    this._tickerInterval = setInterval(rotate, 800);
    // Clean up
    this.events.once('destroy', () => {
      if (this._tickerInterval) clearInterval(this._tickerInterval);
    });
  }
}
