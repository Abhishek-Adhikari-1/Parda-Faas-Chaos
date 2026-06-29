// ============================================================
// PARDA FAAS — Main Menu Scene
// Character select, daily login, priming, bystander effect,
// self-fulfilling prophecy reputation display
// ============================================================

import Phaser from 'phaser';
import { CHARACTERS, CHARACTER_ORDER, ARCHETYPES } from '../config/characters.js';
import { StreakSystem, PlayerProfile } from '../systems/StreakSystem.js';
import { CharacterLoader } from '../systems/CharacterLoader.js';
import STRINGS from '../config/strings.js';

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
    this.selectedCharIdx = 0;
    this.streak = null;
    this.player = null;
    this.menuState = 'main'; // 'main' | 'character_select' | 'daily'
  }

  create() {
    this.streak = new StreakSystem();
    this.player = new PlayerProfile();

    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    // If player hasn't set name, show name input
    if (!this.player.data.nameSet) {
      this._showNameInput();
      return;
    }

    this._buildMainMenu();
  }

  _showNameInput() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    // Dark overlay
    this.add.rectangle(w / 2, h / 2, w, h, 0x1A1A2E, 1);

    // Title
    this.add.text(w / 2, h / 2 - 140, 'पर्दाफास', {
      fontFamily: 'Teko Bold',
      fontSize: '72px',
      color: '#FF6B00',
      stroke: '#C0392B',
      strokeThickness: 4,
      shadow: { blur: 20, color: '#FF6B00', fill: true },
    }).setOrigin(0.5);

    this.add.text(w / 2, h / 2 - 80, 'PARDA FAAS', {
      fontFamily: 'Teko Bold',
      fontSize: '36px',
      color: '#F1C40F',
      letterSpacing: 8,
    }).setOrigin(0.5);

    this.add.text(w / 2, h / 2 - 20, 'Enter your investigator name:', {
      fontFamily: 'Mukta',
      fontSize: '22px',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    // HTML input overlay
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'name-input';
    input.placeholder = 'Your Name / तपाईंको नाम';
    input.maxLength = 20;
    input.style.cssText = `
      position: fixed;
      left: 50%; top: 50%;
      transform: translateX(-50%);
      width: 300px; padding: 14px 20px;
      font-family: Mukta, sans-serif; font-size: 20px;
      background: rgba(26,26,46,0.95);
      color: #FFFFFF; border: 2px solid #FF6B00;
      border-radius: 10px; outline: none;
      text-align: center; z-index: 1000;
    `;
    document.body.appendChild(input);
    input.focus();

    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'START INVESTIGATION →';
    confirmBtn.id = 'name-confirm-btn';
    confirmBtn.style.cssText = `
      position: fixed;
      left: 50%; top: calc(50% + 60px);
      transform: translateX(-50%);
      padding: 14px 32px;
      font-family: Teko Bold, sans-serif; font-size: 22px;
      background: linear-gradient(135deg, #FF6B00, #C0392B);
      color: #FFF; border: none; border-radius: 10px;
      cursor: pointer; letter-spacing: 2px; z-index: 1000;
      transition: transform 0.1s;
    `;
    document.body.appendChild(confirmBtn);

    const proceed = () => {
      const name = input.value.trim() || 'Investigator';
      this.player.setName(name);
      input.remove();
      confirmBtn.remove();
      this._buildMainMenu();
    };

    confirmBtn.addEventListener('click', proceed);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') proceed();
    });
  }

  _buildMainMenu() {
    this.children.removeAll(true);
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    // === BACKGROUND ===
    this._drawBackground(w, h);

    // === ANIMATED PARTICLES (priming atmosphere) ===
    this._addAtmosphere(w, h);

    // === LOGO ===
    this._drawLogo(w, h);

    // === STREAK DISPLAY ===
    this._drawStreakBanner(w, h);

    // === BYSTANDER EFFECT: Neglected case notice ===
    this._drawBystanderHook(w, h);

    // === MENU BUTTONS ===
    this._drawMenuButtons(w, h);

    // === DISCLAIMER ===
    this.add.text(w / 2, h - 18, STRINGS.disclaimer.en, {
      fontFamily: 'Mukta',
      fontSize: '11px',
      color: 'rgba(255,255,255,0.3)',
    }).setOrigin(0.5);

    // === Keyboard hint ===
    this.add.text(w / 2, h - 36, '← → Select Character   |   ENTER Play   |   ESC Quit', {
      fontFamily: 'Mukta',
      fontSize: '13px',
      color: 'rgba(255,255,255,0.25)',
    }).setOrigin(0.5);

    // Animate entrance
    this.cameras.main.fadeIn(400, 26, 26, 46);
  }

  _drawBackground(w, h) {
    // Dark gradient background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1A1A2E, 0x1A1A2E, 0x16213E, 0x0F3460, 1);
    bg.fillRect(0, 0, w, h);

    // Subtle grid lines (investigative board aesthetic)
    bg.lineStyle(1, 0xFFFFFF, 0.03);
    for (let x = 0; x < w; x += 60) { bg.beginPath(); bg.moveTo(x, 0); bg.lineTo(x, h); bg.strokePath(); }
    for (let y = 0; y < h; y += 60) { bg.beginPath(); bg.moveTo(0, y); bg.lineTo(w, y); bg.strokePath(); }

    // Pinboard-like corner dots
    const dotPositions = [[120, 80], [w-120, 80], [80, h-80], [w-80, h-80]];
    dotPositions.forEach(([x, y]) => {
      bg.fillStyle(0xFF6B00, 0.6);
      bg.fillCircle(x, y, 5);
    });

    // String lines (investigative board aesthetic — connecting "pins")
    bg.lineStyle(1, 0xFF6B00, 0.08);
    bg.beginPath(); bg.moveTo(120, 80); bg.lineTo(w - 120, 80); bg.strokePath();
    bg.beginPath(); bg.moveTo(80, h - 80); bg.lineTo(w - 80, h - 80); bg.strokePath();
    bg.beginPath(); bg.moveTo(120, 80); bg.lineTo(80, h - 80); bg.strokePath();
    bg.beginPath(); bg.moveTo(w - 120, 80); bg.lineTo(w - 80, h - 80); bg.strokePath();
  }

  _addAtmosphere(w, h) {
    // Floating evidence papers (priming)
    for (let i = 0; i < 6; i++) {
      const x = Phaser.Math.Between(50, w - 50);
      const y = Phaser.Math.Between(100, h - 100);
      const paper = this.add.graphics();
      paper.fillStyle(0xFFFFFF, 0.04);
      paper.fillRoundedRect(-20, -28, 40, 56, 3);
      paper.lineStyle(1, 0xFF6B00, 0.08);
      paper.strokeRoundedRect(-20, -28, 40, 56, 3);
      paper.x = x; paper.y = y;
      paper.setRotation(Phaser.Math.FloatBetween(-0.3, 0.3));

      this.tweens.add({
        targets: paper,
        y: y - 30,
        rotation: Phaser.Math.FloatBetween(-0.2, 0.2),
        duration: Phaser.Math.Between(3000, 5000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Phaser.Math.Between(0, 2000),
      });
    }
  }

  _drawLogo(w, h) {
    // Glow behind logo
    const glow = this.add.graphics();
    glow.fillStyle(0xFF6B00, 0.1);
    glow.fillCircle(w / 2, 130, 200);

    const titleNP = this.add.text(w / 2, 80, 'पर्दाफास', {
      fontFamily: '"Mukta", sans-serif',
      fontSize: '52px',
      color: '#FF6B00',
      stroke: '#000000',
      strokeThickness: 4,
      shadow: { blur: 30, color: '#FF6B00', fill: true, offsetX: 0, offsetY: 0 },
    }).setOrigin(0.5);

    const titleEN = this.add.text(w / 2, 140, 'PARDA FAAS', {
      fontFamily: '"Teko Bold", sans-serif',
      fontSize: '68px',
      color: '#FFFFFF',
      stroke: '#000000',
      strokeThickness: 6,
      letterSpacing: 10,
    }).setOrigin(0.5);

    const subtitle = this.add.text(w / 2, 196, "Nepal's Civic Investigation Game", {
      fontFamily: '"Mukta", sans-serif',
      fontSize: '16px',
      color: 'rgba(241,196,15,0.8)',
      letterSpacing: 3,
    }).setOrigin(0.5);

    // Pulse animation on logo
    this.tweens.add({
      targets: [titleNP, titleEN],
      scaleX: 1.02, scaleY: 1.02,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  _drawStreakBanner(w, h) {
    // Self-fulfilling prophecy: show rank + credibility
    const rank = this.player.getRank();
    const y = 240;

    const panel = this.add.graphics();
    panel.fillStyle(0xFF6B00, 0.12);
    panel.fillRoundedRect(w / 2 - 200, y, 400, 52, 10);
    panel.lineStyle(1, 0xFF6B00, 0.4);
    panel.strokeRoundedRect(w / 2 - 200, y, 400, 52, 10);

    const streakText = `🔥 ${this.streak.streak}-day streak  |  📋 ${this.player.casesCompleted} cases  |  🏅 ${rank.title}`;
    this.add.text(w / 2, y + 26, streakText, {
      fontFamily: '"Mukta", sans-serif',
      fontSize: '16px',
      color: '#F1C40F',
    }).setOrigin(0.5);

    // Streak at-risk warning (Extinction Burst)
    if (this.streak.isAtRisk()) {
      const warnPanel = this.add.graphics();
      warnPanel.fillStyle(0xC0392B, 0.9);
      warnPanel.fillRoundedRect(w / 2 - 240, y + 58, 480, 36, 8);

      this.add.text(w / 2, y + 76, STRINGS.streak.warning.en, {
        fontFamily: '"Mukta", sans-serif',
        fontSize: '13px',
        color: '#FFFFFF',
      }).setOrigin(0.5);

      this.tweens.add({
        targets: warnPanel,
        alpha: 0.6,
        duration: 600,
        yoyo: true,
        repeat: -1,
      });
    }
  }

  _drawBystanderHook(w, h) {
    // Bystander Effect: show neglected case to spur action
    const y = 310;

    const panel = this.add.graphics();
    panel.fillStyle(0x0D7377, 0.1);
    panel.fillRoundedRect(w / 2 - 220, y, 440, 44, 8);
    panel.lineStyle(1, 0x0D7377, 0.5);
    panel.strokeRoundedRect(w / 2 - 220, y, 440, 44, 8);

    const caseText = '📁 Case #34 — Ward Budget Fraud  |  Neglected 3 days  |  0 investigators';
    this.add.text(w / 2, y + 22, caseText, {
      fontFamily: '"Mukta", sans-serif',
      fontSize: '14px',
      color: 'rgba(255,255,255,0.7)',
    }).setOrigin(0.5);

    // Pulsing red border on neglected case
    const pulseBorder = this.add.graphics();
    pulseBorder.lineStyle(2, 0xC0392B, 1);
    pulseBorder.strokeRoundedRect(w / 2 - 220, y, 440, 44, 8);

    this.tweens.add({
      targets: pulseBorder,
      alpha: 0,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Tooltip
    this.add.text(w / 2 + 200, y + 22, '→ If not you, who?', {
      fontFamily: '"Mukta", sans-serif',
      fontSize: '12px',
      color: '#FF6B00',
      fontStyle: 'italic',
    }).setOrigin(1, 0.5);
  }

  _drawMenuButtons(w, h) {
    const buttons = [
      { label: '▶  START INVESTIGATION', labelNP: 'अन्वेषण सुरु गर्नुस्', id: 'btn-play', action: () => this._startGame(), primary: true },
      { label: '👥  INVESTIGATORS', labelNP: 'अन्वेषकहरू', id: 'btn-chars', action: () => this._showCharacterSelect(), primary: false },
      { label: '📊  LEADERBOARD', labelNP: 'लिडरबोर्ड', id: 'btn-leaderboard', action: () => this._showLeaderboard(), primary: false },
      { label: '⚙️  SETTINGS', labelNP: 'सेटिङ', id: 'btn-settings', action: () => {}, primary: false },
    ];

    const startY = 390;
    const btnH = 60;
    const gap = 14;

    buttons.forEach((btn, i) => {
      const y = startY + i * (btnH + gap);
      const btnGfx = this.add.graphics();

      if (btn.primary) {
        btnGfx.fillStyle(0xFF6B00, 1);
        btnGfx.fillRoundedRect(w / 2 - 200, y, 400, btnH, 12);
        btnGfx.lineStyle(3, 0xF1C40F, 1);
        btnGfx.strokeRoundedRect(w / 2 - 200, y, 400, btnH, 12);
      } else {
        btnGfx.fillStyle(0x0D1117, 0.7);
        btnGfx.fillRoundedRect(w / 2 - 200, y, 400, btnH, 12);
        btnGfx.lineStyle(1, 0x4A5568, 1);
        btnGfx.strokeRoundedRect(w / 2 - 200, y, 400, btnH, 12);
      }

      const labelText = this.add.text(w / 2, y + btnH / 2, btn.label, {
        fontFamily: '"Teko Bold", sans-serif',
        fontSize: btn.primary ? '26px' : '22px',
        color: btn.primary ? '#FFFFFF' : '#CBD5E0',
        letterSpacing: 2,
      }).setOrigin(0.5);

      // Sub-label in Nepali
      if (!btn.primary) {
        this.add.text(w / 2, y + btnH / 2 + 16, btn.labelNP, {
          fontFamily: '"Mukta", sans-serif',
          fontSize: '11px',
          color: 'rgba(255,255,255,0.35)',
        }).setOrigin(0.5);
      }

      // Hit area
      const hitZone = this.add.zone(w / 2, y + btnH / 2, 400, btnH).setInteractive({ useHandCursor: true });

      hitZone.on('pointerover', () => {
        btnGfx.clear();
        btnGfx.fillStyle(btn.primary ? 0xFF8C00 : 0x1A2744, 0.9);
        btnGfx.fillRoundedRect(w / 2 - 200, y, 400, btnH, 12);
        btnGfx.lineStyle(btn.primary ? 3 : 1, btn.primary ? 0xF1C40F : 0xFF6B00, 1);
        btnGfx.strokeRoundedRect(w / 2 - 200, y, 400, btnH, 12);
        labelText.setColor(btn.primary ? '#F1C40F' : '#FFFFFF');
        this.tweens.add({ targets: labelText, scaleX: 1.04, scaleY: 1.04, duration: 100 });
      });

      hitZone.on('pointerout', () => {
        btnGfx.clear();
        if (btn.primary) {
          btnGfx.fillStyle(0xFF6B00, 1);
          btnGfx.fillRoundedRect(w / 2 - 200, y, 400, btnH, 12);
          btnGfx.lineStyle(3, 0xF1C40F, 1);
          btnGfx.strokeRoundedRect(w / 2 - 200, y, 400, btnH, 12);
        } else {
          btnGfx.fillStyle(0x0D1117, 0.7);
          btnGfx.fillRoundedRect(w / 2 - 200, y, 400, btnH, 12);
          btnGfx.lineStyle(1, 0x4A5568, 1);
          btnGfx.strokeRoundedRect(w / 2 - 200, y, 400, btnH, 12);
        }
        labelText.setColor(btn.primary ? '#FFFFFF' : '#CBD5E0');
        this.tweens.add({ targets: labelText, scaleX: 1, scaleY: 1, duration: 100 });
      });

      hitZone.on('pointerdown', () => {
        this.cameras.main.flash(80, 255, 107, 0);
        btn.action();
      });
    });

    // Keyboard navigation
    this.input.keyboard.on('keydown-ENTER', () => this._startGame());
    this.input.keyboard.on('keydown-C', () => this._showCharacterSelect());
  }

  _startGame() {
    // Set selected character
    this.player.setCharacter(CHARACTER_ORDER[this.selectedCharIdx]);
    this.cameras.main.fadeOut(400, 26, 26, 46);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      // Start with tutorial if never played, else level select
      const casesCompleted = this.player.casesCompleted;
      if (casesCompleted === 0) {
        this.scene.start('TutorialScene', {
          character: this.player.currentCharacter,
          player: this.player.data,
        });
      } else {
        this.scene.start('LevelSelectScene', {
          character: this.player.currentCharacter,
          player: this.player.data,
        });
      }
    });
  }

  _showCharacterSelect() {
    this.children.removeAll(true);
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x0D1117, 1);
    bg.fillRect(0, 0, w, h);

    this.add.text(w / 2, 40, 'SELECT INVESTIGATOR', {
      fontFamily: '"Teko Bold", sans-serif',
      fontSize: '42px',
      color: '#FF6B00',
      stroke: '#000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(w / 2, 80, 'अन्वेषक छान्नुस्', {
      fontFamily: '"Mukta", sans-serif',
      fontSize: '18px',
      color: '#F1C40F',
    }).setOrigin(0.5);

    // Character grid
    const cols = Math.min(4, CHARACTER_ORDER.length);
    const cardW = 160, cardH = 220, gapX = 24, gapY = 20;
    const totalW = cols * cardW + (cols - 1) * gapX;
    const startX = (w - totalW) / 2;
    const startY = 120;

    CHARACTER_ORDER.forEach((charId, idx) => {
      const char = CHARACTERS[charId];
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const cx = startX + col * (cardW + gapX);
      const cy = startY + row * (cardH + gapY);

      const isUnlocked = this.player.unlockedCharacters.includes(charId);
      const isSelected = this.selectedCharIdx === idx;

      // Card background
      const cardGfx = this.add.graphics();
      const cardColor = isSelected ? 0xFF6B00 : (isUnlocked ? 0x1A2744 : 0x0D1117);
      cardGfx.fillStyle(cardColor, isUnlocked ? 0.9 : 0.5);
      cardGfx.fillRoundedRect(cx, cy, cardW, cardH, 14);
      cardGfx.lineStyle(isSelected ? 3 : 1, isSelected ? 0xF1C40F : (isUnlocked ? 0x4A5568 : 0x2D3748), 1);
      cardGfx.strokeRoundedRect(cx, cy, cardW, cardH, 14);

      // Portrait
      const portraitKey = CharacterLoader.getPortraitKey(this, charId);
      if (portraitKey !== '__MISSING') {
        const portrait = this.add.image(cx + cardW / 2, cy + 70, portraitKey)
          .setDisplaySize(cardW - 16, 120)
          .setAlpha(isUnlocked ? 1 : 0.3);
      } else {
        // Draw procedural portrait in card
        const pfx = this.add.graphics();
        const charColor = parseInt(char.color.replace('#', ''), 16);
        pfx.fillStyle(charColor, isUnlocked ? 0.8 : 0.3);
        pfx.fillRoundedRect(cx + 8, cy + 8, cardW - 16, 120, 8);
        pfx.fillStyle(0xFFDDAA, isUnlocked ? 1 : 0.3);
        pfx.fillCircle(cx + cardW / 2, cy + 48, 30);
        pfx.lineStyle(3, 0x000000, 0.5);
        pfx.strokeCircle(cx + cardW / 2, cy + 48, 30);
        pfx.fillStyle(charColor, isUnlocked ? 1 : 0.3);
        pfx.fillRoundedRect(cx + cardW / 2 - 20, cy + 78, 40, 48, 6);
      }

      // Lock overlay
      if (!isUnlocked) {
        const lockGfx = this.add.graphics();
        lockGfx.fillStyle(0x000000, 0.5);
        lockGfx.fillRoundedRect(cx, cy, cardW, cardH, 14);
        this.add.text(cx + cardW / 2, cy + 70, '🔒', { fontSize: '28px' }).setOrigin(0.5);
        this.add.text(cx + cardW / 2, cy + 100, 'Pro', {
          fontFamily: '"Teko Bold", sans-serif',
          fontSize: '16px',
          color: '#F1C40F',
        }).setOrigin(0.5);
      }

      // Name
      this.add.text(cx + cardW / 2, cy + 136, char.name, {
        fontFamily: '"Teko Bold", sans-serif',
        fontSize: '18px',
        color: isSelected ? '#F1C40F' : '#FFFFFF',
        wordWrap: { width: cardW - 10 },
      }).setOrigin(0.5);

      this.add.text(cx + cardW / 2, cy + 156, char.nameNP, {
        fontFamily: '"Mukta", sans-serif',
        fontSize: '13px',
        color: isSelected ? '#F1C40F' : 'rgba(255,255,255,0.6)',
      }).setOrigin(0.5);

      // Title
      this.add.text(cx + cardW / 2, cy + 176, char.title, {
        fontFamily: '"Mukta", sans-serif',
        fontSize: '12px',
        color: char.color,
      }).setOrigin(0.5);

      // Archetype badge
      const archetype = ARCHETYPES[char.archetype];
      const badgeGfx = this.add.graphics();
      badgeGfx.fillStyle(parseInt(archetype.color.replace('#', ''), 16), 0.8);
      badgeGfx.fillRoundedRect(cx + 8, cy + cardH - 34, cardW - 16, 24, 6);
      this.add.text(cx + cardW / 2, cy + cardH - 22, archetype.label, {
        fontFamily: '"Mukta", sans-serif',
        fontSize: '10px',
        color: '#FFFFFF',
      }).setOrigin(0.5);

      // Click handler
      const hitZone = this.add.zone(cx + cardW / 2, cy + cardH / 2, cardW, cardH).setInteractive({ useHandCursor: isUnlocked });

      if (isUnlocked) {
        hitZone.on('pointerdown', () => {
          this.selectedCharIdx = idx;
          this.player.setCharacter(charId);
          this._showCharacterSelect(); // re-render
        });

        hitZone.on('pointerdblclick', () => {
          this.selectedCharIdx = idx;
          this.player.setCharacter(charId);
          this._startGame();
        });
      }
    });

    // Back button
    this._addBackButton(() => this._buildMainMenu());

    // Play button
    const playBtn = this.add.text(w / 2, h - 60, '▶  PLAY WITH SELECTED  →', {
      fontFamily: '"Teko Bold", sans-serif',
      fontSize: '26px',
      color: '#FFFFFF',
      backgroundColor: '#FF6B00',
      padding: { x: 24, y: 12 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    playBtn.on('pointerover', () => playBtn.setStyle({ color: '#F1C40F' }));
    playBtn.on('pointerout', () => playBtn.setStyle({ color: '#FFFFFF' }));
    playBtn.on('pointerdown', () => this._startGame());

    this.cameras.main.fadeIn(300, 13, 17, 23);
  }

  _showLeaderboard() {
    // Placeholder leaderboard
    this.children.removeAll(true);
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    this.add.graphics().fillStyle(0x0D1117, 1).fillRect(0, 0, w, h);

    this.add.text(w / 2, 60, '📊 LEADERBOARD', {
      fontFamily: '"Teko Bold", sans-serif',
      fontSize: '42px',
      color: '#F1C40F',
    }).setOrigin(0.5);

    this.add.text(w / 2, 100, 'लिडरबोर्ड', {
      fontFamily: '"Mukta", sans-serif',
      fontSize: '18px',
      color: '#FF6B00',
    }).setOrigin(0.5);

    // Mock leaderboard entries
    const entries = [
      { rank: 1, name: this.player.name, cases: this.player.casesCompleted, cred: this.player.credibility, isYou: true },
      { rank: 2, name: 'Investigator Sujan', cases: 12, cred: 840, isYou: false },
      { rank: 3, name: 'Reporter Priya', cases: 8, cred: 620, isYou: false },
      { rank: 4, name: 'Correspondent Anil', cases: 6, cred: 480, isYou: false },
      { rank: 5, name: 'Journalist Mina', cases: 4, cred: 320, isYou: false },
    ];

    entries.forEach((entry, i) => {
      const y = 160 + i * 64;
      const bg = this.add.graphics();
      bg.fillStyle(entry.isYou ? 0xFF6B00 : 0x1A2744, entry.isYou ? 0.3 : 0.5);
      bg.fillRoundedRect(w / 2 - 280, y, 560, 52, 10);
      if (entry.isYou) {
        bg.lineStyle(2, 0xFF6B00, 1);
        bg.strokeRoundedRect(w / 2 - 280, y, 560, 52, 10);
      }

      this.add.text(w / 2 - 260, y + 26, `#${entry.rank}`, {
        fontFamily: '"Teko Bold", sans-serif',
        fontSize: '26px',
        color: entry.rank <= 3 ? '#F1C40F' : '#CBD5E0',
      }).setOrigin(0, 0.5);

      this.add.text(w / 2 - 220, y + 26, entry.name + (entry.isYou ? ' (You)' : ''), {
        fontFamily: '"Mukta", sans-serif',
        fontSize: '18px',
        color: entry.isYou ? '#FF6B00' : '#FFFFFF',
      }).setOrigin(0, 0.5);

      this.add.text(w / 2 + 120, y + 20, `${entry.cases} cases`, {
        fontFamily: '"Mukta", sans-serif',
        fontSize: '14px',
        color: '#94A3B8',
      }).setOrigin(0.5);

      this.add.text(w / 2 + 220, y + 26, `${entry.cred} CR`, {
        fontFamily: '"Teko Bold", sans-serif',
        fontSize: '22px',
        color: '#F1C40F',
      }).setOrigin(0.5);
    });

    this.add.text(w / 2, h - 80, '(Full leaderboard requires Supabase backend — coming soon)', {
      fontFamily: '"Mukta", sans-serif',
      fontSize: '13px',
      color: 'rgba(255,255,255,0.3)',
    }).setOrigin(0.5);

    this._addBackButton(() => this._buildMainMenu());
    this.cameras.main.fadeIn(300);
  }

  _addBackButton(action) {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    const backBtn = this.add.text(60, h - 40, '← BACK', {
      fontFamily: '"Teko Bold", sans-serif',
      fontSize: '20px',
      color: 'rgba(255,255,255,0.6)',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerover', () => backBtn.setStyle({ color: '#FF6B00' }));
    backBtn.on('pointerout', () => backBtn.setStyle({ color: 'rgba(255,255,255,0.6)' }));
    backBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(200, 13, 17, 23);
      this.cameras.main.once('camerafadeoutcomplete', action);
    });

    this.input.keyboard.once('keydown-ESC', () => {
      this.cameras.main.fadeOut(200, 13, 17, 23);
      this.cameras.main.once('camerafadeoutcomplete', action);
    });
  }
}
