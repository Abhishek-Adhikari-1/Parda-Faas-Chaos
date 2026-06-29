// ============================================================
// PARDA FAAS — Result Scene
// Success/failure debrief + retry + share
// Gamification: Learned Helplessness Countermeasure (failure language)
// Self-Serving Bias (Chapter 28) — never blame the player
// ============================================================

import Phaser from 'phaser';
import { PlayerProfile } from '../systems/StreakSystem.js';
import STRINGS from '../config/strings.js';

export default class ResultScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ResultScene' });
  }

  init(data) {
    this.success = (data && data.success) || false;
    this.credibility = (data && data.credibility) || 0;
    this.playerName = (data && data.playerName) || 'Investigator';
    this.officialName = (data && data.officialName) || 'The Official';
    this.scandal = (data && data.scandal) || '';
    this.nextLevel = (data && data.nextLevel) || null;
    this.levelKey = (data && data.levelKey) || 'level1';
    this.characterId = (data && data.characterId) || 'balen';
    this.reason = (data && data.reason) || 'unknown';
    this.evidenceCollected = (data && data.evidenceCollected) || [];
  }

  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    this._player = new PlayerProfile();

    if (this.success) {
      this._showSuccess(w, h);
    } else {
      this._showDebrief(w, h);
    }

    this.cameras.main.fadeIn(400, 26, 26, 46);
  }

  _showSuccess(w, h) {
    // Dark BG with gold accent
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1A2744, 0x1A2744, 0x0F3460, 0x1A2744, 1);
    bg.fillRect(0, 0, w, h);

    // Gold top bar
    const topBar = this.add.graphics();
    topBar.fillStyle(0xF1C40F, 1);
    topBar.fillRect(0, 0, w, 8);

    // Success icon
    this.add.text(w / 2, 80, '🎉', { fontSize: '64px' }).setOrigin(0.5);

    this.add.text(w / 2, 160, 'INVESTIGATION COMPLETE!', {
      fontFamily: '"Teko Bold", sans-serif',
      fontSize: '52px',
      color: '#F1C40F',
      stroke: '#000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(w / 2, 220, 'अन्वेषण सम्पन्न!', {
      fontFamily: '"Mukta", sans-serif',
      fontSize: '24px',
      color: '#FFFFFF',
    }).setOrigin(0.5);

    // Stats panel
    const panelGfx = this.add.graphics();
    panelGfx.fillStyle(0x0D1117, 0.8);
    panelGfx.fillRoundedRect(w / 2 - 250, 260, 500, 200, 14);
    panelGfx.lineStyle(2, 0xF1C40F, 0.6);
    panelGfx.strokeRoundedRect(w / 2 - 250, 260, 500, 200, 14);

    // Credibility meter
    const credColor = this.credibility >= 80 ? '#2ECC71' : this.credibility >= 60 ? '#F39C12' : '#E74C3C';
    this.add.text(w / 2, 288, `CREDIBILITY SCORE: ${this.credibility}%`, {
      fontFamily: '"Teko Bold", sans-serif',
      fontSize: '28px',
      color: credColor,
    }).setOrigin(0.5);

    // Credibility bar
    const barBg = this.add.graphics();
    barBg.fillStyle(0x2D3748, 1);
    barBg.fillRoundedRect(w / 2 - 180, 320, 360, 20, 4);

    const barFill = this.add.graphics();
    barFill.fillStyle(parseInt(credColor.replace('#', ''), 16), 1);
    barFill.fillRoundedRect(w / 2 - 180, 320, 0, 20, 4);
    this.tweens.add({
      targets: { val: 0 },
      val: this.credibility / 100,
      duration: 1500,
      ease: 'Power2.easeOut',
      onUpdate: (tween) => {
        barFill.clear();
        barFill.fillStyle(parseInt(credColor.replace('#', ''), 16), 1);
        barFill.fillRoundedRect(w / 2 - 180, 320, Math.floor(360 * tween.getValue()), 20, 4);
      },
    });

    // Rank earned
    const rank = this._player.getRank();
    this.add.text(w / 2, 360, `Rank: ${rank.titleNP} (${rank.title})`, {
      fontFamily: '"Mukta", sans-serif',
      fontSize: '18px',
      color: '#94A3B8',
    }).setOrigin(0.5);

    // Cases completed
    this.add.text(w / 2, 392, `Total cases exposed: ${this._player.casesCompleted}`, {
      fontFamily: '"Mukta", sans-serif',
      fontSize: '16px',
      color: '#CBD5E0',
    }).setOrigin(0.5);

    // Self-fulfilling prophecy: positive reinforcement
    const percentile = Math.floor(Math.random() * 15) + 5;
    this.add.text(w / 2, 430, `🔎 Top ${percentile}% of investigators this week!`, {
      fontFamily: '"Teko Bold", sans-serif',
      fontSize: '18px',
      color: '#F1C40F',
    }).setOrigin(0.5);

    // Buttons
    this._addSuccessButtons(w, h);
  }

  _showDebrief(w, h) {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1A1A2E, 0x1A1A2E, 0x0D1117, 0x1A1A2E, 1);
    bg.fillRect(0, 0, w, h);

    // NOT "FAILED" — self-serving bias framing
    this.add.text(w / 2, 60, '🔍 INVESTIGATION DEBRIEF', {
      fontFamily: '"Teko Bold", sans-serif',
      fontSize: '38px',
      color: '#FFFFFF',
      stroke: '#000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.add.text(w / 2, 100, 'अन्वेषण विश्लेषण', {
      fontFamily: '"Mukta", sans-serif',
      fontSize: '18px',
      color: '#94A3B8',
    }).setOrigin(0.5);

    // Failure reason — never blame the player
    const failureMsg = STRINGS.failure[Math.floor(Math.random() * STRINGS.failure.length)];
    const failPanel = this.add.graphics();
    failPanel.fillStyle(0x0D1117, 0.9);
    failPanel.fillRoundedRect(w / 2 - 280, 130, 560, 80, 12);
    failPanel.lineStyle(2, 0xE74C3C, 0.6);
    failPanel.strokeRoundedRect(w / 2 - 280, 130, 560, 80, 12);

    this.add.text(w / 2, 158, failureMsg.np, {
      fontFamily: '"Mukta", sans-serif',
      fontSize: '17px',
      color: '#FFFFFF',
      align: 'center',
      wordWrap: { width: 520 },
    }).setOrigin(0.5);

    this.add.text(w / 2, 196, failureMsg.en, {
      fontFamily: '"Mukta", sans-serif',
      fontSize: '13px',
      color: 'rgba(255,255,255,0.55)',
      align: 'center',
      wordWrap: { width: 520 },
    }).setOrigin(0.5);

    // Evidence collected breakdown
    this.add.text(w / 2 - 260, 240, '📋 EVIDENCE COLLECTED:', {
      fontFamily: '"Teko Bold", sans-serif',
      fontSize: '18px',
      color: '#94A3B8',
    });

    if (this.evidenceCollected.length === 0) {
      this.add.text(w / 2, 270, 'No evidence collected this run.', {
        fontFamily: '"Mukta", sans-serif', fontSize: '16px', color: '#4A5568',
      }).setOrigin(0.5);
    } else {
      this.evidenceCollected.forEach((ev, i) => {
        const icon = ev.type === 'witness' ? '🎤' : ev.type === 'document' ? '📄' : ev.type === 'financial' ? '💰' : '📸';
        this.add.text(w / 2 - 240, 268 + i * 26, `✅ ${icon} ${ev.label}`, {
          fontFamily: '"Mukta", sans-serif', fontSize: '14px', color: '#2ECC71',
        });
      });
    }

    // Partial credibility
    const partialY = 280 + this.evidenceCollected.length * 26 + 10;
    this.add.text(w / 2, partialY, `Your investigation was ${this.credibility}% credible.`, {
      fontFamily: '"Mukta", sans-serif', fontSize: '16px', color: '#CBD5E0',
    }).setOrigin(0.5);

    // Rookie shield hint (3 consecutive losses)
    this.add.text(w / 2, partialY + 30, '💡 Tip: The same allies will be weaker next run. Try again!', {
      fontFamily: '"Mukta", sans-serif', fontSize: '14px', color: '#F1C40F',
      fontStyle: 'italic',
    }).setOrigin(0.5);

    // Retry button
    this._addDebriefButtons(w, h);
  }

  _addSuccessButtons(w, h) {
    const btnY = h - 100;

    const nextBtn = this.add.text(w / 2, btnY, '▶ NEXT CASE →', {
      fontFamily: '"Teko Bold", sans-serif', fontSize: '30px',
      color: '#FFFFFF', backgroundColor: '#FF6B00',
      padding: { x: 32, y: 14 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    nextBtn.on('pointerover', () => { nextBtn.setStyle({ color: '#F1C40F' }); });
    nextBtn.on('pointerout', () => { nextBtn.setStyle({ color: '#FFFFFF' }); });
    nextBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(400, 26, 26, 46);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('LevelSelectScene', { character: this.characterId });
      });
    });

    const menuBtn = this.add.text(w / 2, btnY + 64, '🏠 MAIN MENU', {
      fontFamily: '"Teko Bold", sans-serif', fontSize: '20px', color: '#94A3B8',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    menuBtn.on('pointerover', () => menuBtn.setStyle({ color: '#FFFFFF' }));
    menuBtn.on('pointerout', () => menuBtn.setStyle({ color: '#94A3B8' }));
    menuBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(400, 26, 26, 46);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MainMenuScene');
      });
    });

    this.input.keyboard.on('keydown-ENTER', () => nextBtn.emit('pointerdown'));
  }

  _addDebriefButtons(w, h) {
    const btnY = h - 110;

    const retryBtn = this.add.text(w / 2 - 130, btnY, '🔄 TRY AGAIN', {
      fontFamily: '"Teko Bold", sans-serif', fontSize: '26px',
      color: '#FFFFFF', backgroundColor: '#FF6B00',
      padding: { x: 24, y: 12 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    retryBtn.on('pointerover', () => retryBtn.setStyle({ color: '#F1C40F' }));
    retryBtn.on('pointerout', () => retryBtn.setStyle({ color: '#FFFFFF' }));
    retryBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(400, 26, 26, 46);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        const sceneKey = this.levelKey === 'tutorial' ? 'TutorialScene' : 'Level1Scene';
        this.scene.start(sceneKey, {
          character: this.characterId,
          levelKey: this.levelKey,
        });
      });
    });

    const menuBtn = this.add.text(w / 2 + 130, btnY, '🏠 MENU', {
      fontFamily: '"Teko Bold", sans-serif', fontSize: '26px',
      color: '#94A3B8', backgroundColor: '#1A2744',
      padding: { x: 24, y: 12 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    menuBtn.on('pointerover', () => menuBtn.setStyle({ color: '#FFFFFF' }));
    menuBtn.on('pointerout', () => menuBtn.setStyle({ color: '#94A3B8' }));
    menuBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(400, 26, 26, 46);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MainMenuScene');
      });
    });

    this.input.keyboard.on('keydown-ENTER', () => retryBtn.emit('pointerdown'));
    this.input.keyboard.on('keydown-ESC', () => menuBtn.emit('pointerdown'));
  }
}
