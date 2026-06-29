// ============================================================
// PARDA FAAS — Cinematic Scene (THE MOMENT)
// Full newspaper reveal + shareable card + crowd cheer
// Gamification: The Moment (Chapter 43), Spotlight Effect (Chapter 29)
// ============================================================

import Phaser from 'phaser';
import { CharacterLoader } from '../systems/CharacterLoader.js';
import { CHARACTERS } from '../config/characters.js';
import STRINGS from '../config/strings.js';

export default class CinematicScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CinematicScene' });
  }

  init(data) {
    this.playerName = (data && data.playerName) || 'Investigator';
    this.characterId = (data && data.characterId) || 'balen';
    this.officialName = (data && data.officialName) || 'The Official';
    this.scandal = (data && data.scandal) || 'Corruption Uncovered';
    this.credibility = (data && data.credibility) || 80;
    this.evidence = (data && data.evidence) || [];
    this.nextLevel = (data && data.nextLevel) || null;
  }

  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    this._phase = 0;
    this._w = w;
    this._h = h;

    // Start cinematic sequence
    this._playPhase1_FadeToBlack();
  }

  // ============================================================
  // PHASE 1: Fade to black (0.8s)
  // ============================================================
  _playPhase1_FadeToBlack() {
    const w = this._w, h = this._h;

    const black = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 1).setDepth(100);

    this.time.delayedCall(300, () => {
      this._playPhase2_Typewriter();
    });
  }

  // ============================================================
  // PHASE 2: Typewriter sound + newspaper build
  // ============================================================
  _playPhase2_Typewriter() {
    const w = this._w, h = this._h;

    // Dark BG
    this.add.rectangle(w / 2, h / 2, w, h, 0x1A1A1A, 1);

    // Typewriter effect: flashing cursor
    const cursor = this.add.text(w / 2, h / 2 - 20, '|', {
      fontFamily: '"Teko Bold", sans-serif',
      fontSize: '36px',
      color: '#FFFFFF',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: cursor, alpha: 1,
      duration: 200, yoyo: true, repeat: 4,
    });

    // Headline build text
    const headline = STRINGS.cinematic.headline(this.playerName, this.officialName, this.scandal);
    const words = headline.split(' ');
    let built = '';
    let wordIdx = 0;

    const buildText = this.add.text(w / 2, h / 2 - 20, '', {
      fontFamily: '"Teko Bold", sans-serif',
      fontSize: '28px',
      color: '#FFFFFF',
      align: 'center',
      wordWrap: { width: w * 0.7 },
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: buildText, alpha: 1, duration: 300, delay: 400 });

    const typeTimer = this.time.addEvent({
      delay: 80,
      repeat: words.length - 1,
      callback: () => {
        built += (built ? ' ' : '') + words[wordIdx];
        buildText.setText(built);
        wordIdx++;
        if (wordIdx >= words.length) {
          typeTimer.destroy();
          this.time.delayedCall(600, () => this._playPhase3_Newspaper());
        }
      },
    });
  }

  // ============================================================
  // PHASE 3: Full animated newspaper front page
  // ============================================================
  _playPhase3_Newspaper() {
    // Clear and build newspaper
    this.children.removeAll(true);
    const w = this._w, h = this._h;

    // Paper background (warm paper color)
    const paper = this.add.graphics();
    paper.fillStyle(0xFDF6E3, 1);
    paper.fillRoundedRect(w / 2 - 340, 20, 680, h - 40, 8);
    paper.lineStyle(3, 0x2C1810, 1);
    paper.strokeRoundedRect(w / 2 - 340, 20, 680, h - 40, 8);
    paper.setAlpha(0);

    // Aged paper texture (horizontal lines)
    for (let y = 60; y < h - 40; y += 18) {
      paper.lineStyle(1, 0xC9A84C, 0.15);
      paper.beginPath();
      paper.moveTo(w / 2 - 328, y);
      paper.lineTo(w / 2 + 328, y);
      paper.strokePath();
    }

    this.tweens.add({ targets: paper, alpha: 1, duration: 500, ease: 'Power2.easeOut' });

    // Paper slide in from top
    paper.y = -50;
    this.tweens.add({ targets: paper, y: 0, duration: 600, ease: 'Back.easeOut' });

    const paperXL = w / 2 - 330;
    const paperXR = w / 2 + 330;
    const paperW = 660;

    // Header bar
    const headerBar = this.add.graphics().setAlpha(0);
    headerBar.fillStyle(0x2C1810, 1);
    headerBar.fillRect(w / 2 - 336, 28, 672, 52);
    this.tweens.add({ targets: headerBar, alpha: 1, duration: 400, delay: 300 });

    // Newspaper name
    const paperName = this.add.text(w / 2, 54, STRINGS.cinematic.paperName, {
      fontFamily: '"Teko Bold", sans-serif',
      fontSize: '28px',
      color: '#FDF6E3',
      letterSpacing: 6,
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: paperName, alpha: 1, duration: 400, delay: 400 });

    // Date and edition
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    this.add.text(w / 2 - 320, 86, STRINGS.cinematic.dateline, {
      fontFamily: '"Mukta", sans-serif', fontSize: '12px', color: '#2C1810',
    }).setAlpha(0).then ? null : null;

    const datelineText = this.add.text(w / 2 - 320, 88, STRINGS.cinematic.dateline, {
      fontFamily: '"Mukta", sans-serif', fontSize: '11px', color: '#5D4037',
    }).setAlpha(0);

    const editionText = this.add.text(w / 2 + 320, 88, today, {
      fontFamily: '"Mukta", sans-serif', fontSize: '11px', color: '#5D4037',
    }).setOrigin(1, 0).setAlpha(0);

    this.tweens.add({ targets: [datelineText, editionText], alpha: 1, duration: 400, delay: 500 });

    // Decorative divider
    const divider = this.add.graphics().setAlpha(0);
    divider.lineStyle(2, 0x2C1810, 1);
    divider.beginPath(); divider.moveTo(w / 2 - 320, 104); divider.lineTo(w / 2 + 320, 104); divider.strokePath();
    divider.lineStyle(1, 0x2C1810, 1);
    divider.beginPath(); divider.moveTo(w / 2 - 320, 108); divider.lineTo(w / 2 + 320, 108); divider.strokePath();
    this.tweens.add({ targets: divider, alpha: 1, duration: 400, delay: 500 });

    // *** MAIN HEADLINE ***
    const headlineText = STRINGS.cinematic.headline(this.playerName, this.officialName, this.scandal);
    const headlineNP = STRINGS.cinematic.headlineNP(this.playerName, this.officialName, this.scandal);

    const headline = this.add.text(w / 2, 150, headlineText, {
      fontFamily: '"Teko Bold", sans-serif',
      fontSize: '32px',
      color: '#1A0A00',
      align: 'center',
      wordWrap: { width: paperW - 40 },
      lineSpacing: 4,
    }).setOrigin(0.5).setAlpha(0);

    const headlineNPText = this.add.text(w / 2, 220, headlineNP, {
      fontFamily: '"Mukta", sans-serif',
      fontSize: '18px',
      color: '#3E2723',
      align: 'center',
      wordWrap: { width: paperW - 40 },
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: headline, alpha: 1, duration: 600, delay: 700, ease: 'Power2.easeOut' });
    this.tweens.add({ targets: headlineNPText, alpha: 1, duration: 600, delay: 900, ease: 'Power2.easeOut' });

    // Headline scale-in
    headline.setScale(0.8);
    this.tweens.add({ targets: headline, scaleX: 1, scaleY: 1, duration: 400, delay: 700 });

    // Divider below headline
    const div2 = this.add.graphics().setAlpha(0);
    div2.lineStyle(1, 0x2C1810, 0.5);
    div2.beginPath(); div2.moveTo(w / 2 - 310, 268); div2.lineTo(w / 2 + 310, 268); div2.strokePath();
    this.tweens.add({ targets: div2, alpha: 1, duration: 400, delay: 1000 });

    // Portrait + byline (left column)
    const charConfig = CHARACTERS[this.characterId];
    const portraitKey = CharacterLoader.getPortraitKey(this, this.characterId);

    let portrait;
    if (portraitKey !== '__MISSING') {
      portrait = this.add.image(w / 2 - 250, 340, portraitKey)
        .setDisplaySize(120, 150).setAlpha(0);
    } else {
      portrait = this.add.graphics().setAlpha(0);
      const pc = parseInt(charConfig.color.replace('#', ''), 16);
      portrait.fillStyle(pc, 1);
      portrait.fillRoundedRect(w / 2 - 310, 278, 120, 150, 8);
      portrait.fillStyle(0xFFDDAA, 1);
      portrait.fillCircle(w / 2 - 250, 318, 36);
      portrait.lineStyle(3, 0x000000, 1);
      portrait.strokeCircle(w / 2 - 250, 318, 36);
    }

    this.tweens.add({ targets: portrait, alpha: 1, duration: 500, delay: 1100 });

    // Byline
    const bylineStr = STRINGS.cinematic.byline(this.playerName);
    const byline = this.add.text(w / 2 - 180, 278, bylineStr, {
      fontFamily: '"Mukta", sans-serif', fontSize: '13px', color: '#3E2723',
      fontStyle: 'italic',
    }).setAlpha(0);
    this.tweens.add({ targets: byline, alpha: 1, duration: 400, delay: 1200 });

    const bylineNP = this.add.text(w / 2 - 180, 296, STRINGS.cinematic.bylineNP(this.playerName), {
      fontFamily: '"Mukta", sans-serif', fontSize: '12px', color: '#5D4037',
      fontStyle: 'italic',
    }).setAlpha(0);
    this.tweens.add({ targets: bylineNP, alpha: 1, duration: 400, delay: 1300 });

    // Article body text (simulated columns)
    const articleText = `The investigation reveals a systematic diversion of public funds. 
Evidence collected: ${this.evidence.length} verified documents and witnesses. 
The official has been formally accused of ${this.scandal}.
Credibility Score: ${this.credibility}%`;

    const article = this.add.text(w / 2 - 180, 320, articleText, {
      fontFamily: '"Mukta", sans-serif', fontSize: '13px', color: '#3E2723',
      wordWrap: { width: 460 }, lineSpacing: 4,
    }).setAlpha(0);
    this.tweens.add({ targets: article, alpha: 1, duration: 400, delay: 1400 });

    // *** CREDIBILITY BADGE ***
    const credPanel = this.add.graphics().setAlpha(0);
    const credColor = this.credibility >= 80 ? 0x27AE60 : this.credibility >= 60 ? 0xF39C12 : 0xE74C3C;
    credPanel.fillStyle(credColor, 1);
    credPanel.fillRoundedRect(w / 2 + 160, 278, 160, 80, 10);
    credPanel.lineStyle(2, 0x000000, 0.3);
    credPanel.strokeRoundedRect(w / 2 + 160, 278, 160, 80, 10);

    const credLabel = this.add.text(w / 2 + 240, 300, STRINGS.cinematic.credibility.en, {
      fontFamily: '"Teko Bold", sans-serif', fontSize: '14px', color: '#FFFFFF',
    }).setOrigin(0.5).setAlpha(0);

    const credNum = this.add.text(w / 2 + 240, 328, `${this.credibility}%`, {
      fontFamily: '"Teko Bold", sans-serif', fontSize: '32px', color: '#FFFFFF',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: [credPanel, credLabel, credNum], alpha: 1, duration: 600, delay: 1500 });

    // Scale bounce on credibility
    credNum.setScale(0.5);
    this.tweens.add({ targets: credNum, scaleX: 1, scaleY: 1, duration: 500, delay: 1500, ease: 'Back.easeOut' });

    // *** CORRUPTION NETWORK DIAGRAM ***
    const netY = 450;
    const networkNodes = [
      { label: 'Official', x: w / 2, y: netY + 40, color: 0xC0392B },
      ...this.evidence.slice(0, 4).map((ev, i) => ({
        label: ev.label ? ev.label.substring(0, 12) : `Evidence ${i + 1}`,
        x: w / 2 - 200 + i * 100,
        y: netY + 100,
        color: 0x27AE60,
      })),
    ];

    const netGfx = this.add.graphics().setAlpha(0);
    // Draw connecting lines first
    networkNodes.slice(1).forEach(node => {
      netGfx.lineStyle(1, 0xAAAAAA, 0.6);
      netGfx.beginPath();
      netGfx.moveTo(networkNodes[0].x, networkNodes[0].y + 10);
      netGfx.lineTo(node.x, node.y - 10);
      netGfx.strokePath();
    });
    // Draw nodes
    networkNodes.forEach(node => {
      netGfx.fillStyle(node.color, 0.9);
      netGfx.fillCircle(node.x, node.y, 14);
      netGfx.lineStyle(2, 0xFFFFFF, 0.5);
      netGfx.strokeCircle(node.x, node.y, 14);
    });

    this.tweens.add({ targets: netGfx, alpha: 1, duration: 600, delay: 1700 });

    networkNodes.forEach((node, i) => {
      const nodeLabel = this.add.text(node.x, node.y + 20, node.label, {
        fontFamily: '"Mukta", sans-serif', fontSize: '10px', color: '#2C1810', align: 'center',
        wordWrap: { width: 80 },
      }).setOrigin(0.5).setAlpha(0);
      this.tweens.add({ targets: nodeLabel, alpha: 1, duration: 400, delay: 1700 + i * 100 });
    });

    // Section label
    const netLabel = this.add.text(w / 2, netY + 20, '▲ Corruption Network', {
      fontFamily: '"Teko Bold", sans-serif', fontSize: '14px', color: '#5D4037',
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: netLabel, alpha: 1, duration: 400, delay: 1800 });

    // Launch confetti + crowd cheer after 2.5s
    this.time.delayedCall(2500, () => this._playPhase4_Celebration(paper, headline));
  }

  // ============================================================
  // PHASE 4: Confetti + crowd cheer
  // ============================================================
  _playPhase4_Celebration(paper, headline) {
    const w = this._w, h = this._h;

    // Camera shake
    this.cameras.main.shake(500, 0.015);
    // Golden flash
    this.cameras.main.flash(300, 241, 196, 15, true);

    // Confetti emitter
    const confettiColors = ['confetti_orange', 'confetti_gold', 'confetti_red'];
    confettiColors.forEach(key => {
      const emitter = this.add.particles(
        Phaser.Math.Between(0, w), -10, key,
        {
          x: { min: 0, max: w },
          y: { min: -20, max: -10 },
          speedY: { min: 100, max: 300 },
          speedX: { min: -60, max: 60 },
          rotate: { min: 0, max: 360 },
          scale: { min: 0.8, max: 1.5 },
          lifespan: 4000,
          quantity: 3,
          frequency: 40,
        }
      ).setDepth(50);
    });

    // Headline glow pulse
    this.tweens.add({
      targets: headline,
      scaleX: 1.03, scaleY: 1.03,
      duration: 200, yoyo: true, repeat: 2,
    });

    // Show action buttons
    this.time.delayedCall(800, () => this._showActionButtons());
  }

  // ============================================================
  // PHASE 5: Share + Continue buttons
  // ============================================================
  _showActionButtons() {
    const w = this._w, h = this._h;
    const btnY = h - 70;

    // Shareable card panel
    const sharepanel = this.add.graphics().setAlpha(0);
    sharepanel.fillStyle(0x1A1A2E, 0.95);
    sharepanel.fillRoundedRect(w / 2 - 320, btnY - 20, 640, 80, 12);
    sharepanel.lineStyle(2, 0xFF6B00, 0.8);
    sharepanel.strokeRoundedRect(w / 2 - 320, btnY - 20, 640, 80, 12);
    this.tweens.add({ targets: sharepanel, alpha: 1, duration: 400 });

    // Share button
    const shareBtn = this.add.text(w / 2 - 160, btnY + 20, '📤 ' + STRINGS.cinematic.shareText.en, {
      fontFamily: '"Teko Bold", sans-serif', fontSize: '22px',
      color: '#FFFFFF', backgroundColor: '#FF6B00',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setAlpha(0).setInteractive({ useHandCursor: true });

    // Continue button
    const continueBtn = this.add.text(w / 2 + 160, btnY + 20, '▶ CONTINUE →', {
      fontFamily: '"Teko Bold", sans-serif', fontSize: '22px',
      color: '#FFFFFF', backgroundColor: '#0D7377',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setAlpha(0).setInteractive({ useHandCursor: true });

    this.tweens.add({ targets: [shareBtn, continueBtn], alpha: 1, duration: 400, delay: 200 });

    shareBtn.on('pointerover', () => shareBtn.setStyle({ color: '#F1C40F' }));
    shareBtn.on('pointerout', () => shareBtn.setStyle({ color: '#FFFFFF' }));
    shareBtn.on('pointerdown', () => this._generateShareCard());

    continueBtn.on('pointerover', () => continueBtn.setStyle({ color: '#F1C40F' }));
    continueBtn.on('pointerout', () => continueBtn.setStyle({ color: '#FFFFFF' }));
    continueBtn.on('pointerdown', () => this._continueGame());

    // Spotlight effect text (Gamification technique)
    this.add.text(w / 2, btnY - 5, `🔴 BREAKING: ${this.playerName} exposes ${this.officialName} — Case Credibility: ${this.credibility}%`, {
      fontFamily: '"Mukta", sans-serif', fontSize: '13px',
      color: '#FF6B00',
    }).setOrigin(0.5).setAlpha(0.9);

    // Auto-continue after 15s
    this.time.delayedCall(15000, () => {
      if (this.scene.isActive('CinematicScene')) {
        this._continueGame();
      }
    });
  }

  _generateShareCard() {
    // Use html2canvas to capture the newspaper and download
    const gameCanvas = this.game.canvas;

    import('html2canvas').then(({ default: html2canvas }) => {
      // Create a temporary share card element
      const shareDiv = document.createElement('div');
      shareDiv.style.cssText = `
        position: fixed; left: -9999px; top: 0;
        width: 680px; background: #FDF6E3;
        font-family: 'Teko Bold', sans-serif;
        padding: 24px; border: 3px solid #2C1810;
      `;
      shareDiv.innerHTML = `
        <div style="background:#2C1810;color:#FDF6E3;text-align:center;padding:12px;font-size:24px;letter-spacing:4px;">
          ${STRINGS.cinematic.paperName}
        </div>
        <div style="font-size:28px;color:#1A0A00;text-align:center;padding:16px;line-height:1.3;">
          ${STRINGS.cinematic.headline(this.playerName, this.officialName, this.scandal)}
        </div>
        <div style="font-size:16px;color:#3E2723;text-align:center;padding:8px;">
          ${STRINGS.cinematic.headlineNP(this.playerName, this.officialName, this.scandal)}
        </div>
        <hr style="border:1px solid #2C1810;margin:8px 0;">
        <div style="display:flex;justify-content:space-between;padding:8px;font-size:14px;color:#5D4037;">
          <span>${STRINGS.cinematic.dateline}</span>
          <span>Credibility: <strong>${this.credibility}%</strong></span>
        </div>
        <div style="font-size:13px;color:#3E2723;padding:8px;font-style:italic;">
          ${STRINGS.cinematic.byline(this.playerName)}
        </div>
        <div style="background:#1A1A2E;color:#FF6B00;text-align:center;padding:8px;font-size:16px;margin-top:8px;">
          🔴 पर्दाफास — Parda Faas
        </div>
      `;
      document.body.appendChild(shareDiv);

      html2canvas(shareDiv, { backgroundColor: '#FDF6E3', scale: 2 }).then(canvas => {
        const link = document.createElement('a');
        link.download = `pardafaas-expose-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        shareDiv.remove();

        // Show success flash
        this.cameras.main.flash(200, 241, 196, 15, true);
        const t = this.add.text(this._w / 2, this._h / 2, '✅ Exposé card downloaded!', {
          fontFamily: '"Bangers", cursive', fontSize: '32px', color: '#27AE60',
          stroke: '#000', strokeThickness: 4,
        }).setOrigin(0.5).setDepth(999);
        this.tweens.add({ targets: t, alpha: 0, y: '-=60', delay: 1000, duration: 800, onComplete: () => t.destroy() });
      }).catch(err => {
        console.error('html2canvas failed:', err);
        shareDiv.remove();
      });
    }).catch(err => {
      console.error('Failed to load html2canvas:', err);
    });
  }

  _continueGame() {
    this.cameras.main.fadeOut(600, 26, 26, 46);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('ResultScene', {
        success: true,
        credibility: this.credibility,
        playerName: this.playerName,
        officialName: this.officialName,
        scandal: this.scandal,
        nextLevel: this.nextLevel,
        characterId: this.characterId,
      });
    });
  }
}
