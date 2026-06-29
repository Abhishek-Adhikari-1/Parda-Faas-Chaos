// ============================================================
// PARDA FAAS — Level Select Scene
// Shows all 5 levels + tutorial with lock/unlock states
// ============================================================

import Phaser from 'phaser';
import { PlayerProfile } from '../systems/StreakSystem.js';
import STRINGS from '../config/strings.js';

const LEVEL_CARDS = [
  {
    key: 'tutorial',
    name: 'Tutorial',
    nameNP: 'ट्यूटोरियल',
    subtitle: 'Ward Office, Kathmandu',
    subtitleNP: 'वार्ड कार्यालय, काठमाडौं',
    difficulty: '📗 Intro',
    icon: '🎓',
    color: 0x27AE60,
    unlocked: true,
  },
  {
    key: 'level1',
    name: 'Ward Councillor',
    nameNP: 'वार्ड परिषद्',
    subtitle: 'Ghost project, missing budget',
    subtitleNP: 'भुत परियोजना, हराएको बजेट',
    difficulty: '🟢 Easy',
    icon: '🏘️',
    color: 0x27AE60,
    unlocked: true,
  },
  {
    key: 'level2',
    name: 'Municipality Mayor',
    nameNP: 'नगरपालिका मेयर',
    subtitle: 'Construction funds missing',
    subtitleNP: 'निर्माण कोष हिनामिना',
    difficulty: '🟡 Medium',
    icon: '🏙️',
    color: 0xF1C40F,
    unlocked: false,
    comingSoon: true,
  },
  {
    key: 'level3',
    name: 'District Chief',
    nameNP: 'जिल्ला प्रमुख',
    subtitle: 'Multi-floor corruption',
    subtitleNP: 'बहुतले भ्रष्टाचार',
    difficulty: '🟠 Medium-Hard',
    icon: '🏛️',
    color: 0xE67E22,
    unlocked: false,
    comingSoon: true,
  },
  {
    key: 'level4',
    name: 'Province Minister',
    nameNP: 'प्रदेश मन्त्री',
    subtitle: 'Charm, lies, and bribe traps',
    subtitleNP: 'आकर्षण, झूठ र घुस जाल',
    difficulty: '🔴 Hard',
    icon: '🏟️',
    color: 0xE74C3C,
    unlocked: false,
    comingSoon: true,
  },
  {
    key: 'level5',
    name: 'Cabinet Minister',
    nameNP: 'क्याबिनेट मन्त्री',
    subtitle: 'Singha Durbar — the final boss',
    subtitleNP: 'सिंहदरबार — अन्तिम बस',
    difficulty: '⚫ Very Hard',
    icon: '👑',
    color: 0x8E44AD,
    unlocked: false,
    comingSoon: true,
  },
];

export default class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelSelectScene' });
  }

  init(data) {
    this.characterId = (data && data.character) || 'balen';
    this.playerData = (data && data.player) || {};
  }

  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;
    this._player = new PlayerProfile();

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1A1A2E, 0x1A1A2E, 0x16213E, 0x0F3460, 1);
    bg.fillRect(0, 0, w, h);

    // Title
    this.add.text(w / 2, 44, 'SELECT CASE', {
      fontFamily: '"Teko Bold", sans-serif',
      fontSize: '48px',
      color: '#FF6B00',
      stroke: '#000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(w / 2, 88, 'मुद्दा छान्नुस्', {
      fontFamily: '"Mukta", sans-serif',
      fontSize: '20px',
      color: '#F1C40F',
    }).setOrigin(0.5);

    // Level cards grid
    const cardW = 200, cardH = 180;
    const cols = 3;
    const gapX = 24, gapY = 20;
    const totalW = cols * cardW + (cols - 1) * gapX;
    const startX = (w - totalW) / 2;
    const startY = 130;

    LEVEL_CARDS.forEach((level, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const cx = startX + col * (cardW + gapX);
      const cy = startY + row * (cardH + gapY);

      const isUnlocked = level.unlocked;
      const isComingSoon = level.comingSoon;

      const cardGfx = this.add.graphics();
      cardGfx.fillStyle(isUnlocked ? level.color : 0x1A2744, isUnlocked ? 0.15 : 0.3);
      cardGfx.fillRoundedRect(cx, cy, cardW, cardH, 14);
      cardGfx.lineStyle(isUnlocked ? 2 : 1, isUnlocked ? level.color : 0x2D3748, isUnlocked ? 1 : 0.5);
      cardGfx.strokeRoundedRect(cx, cy, cardW, cardH, 14);

      // Icon
      this.add.text(cx + cardW / 2, cy + 30, level.icon, { fontSize: '32px' }).setOrigin(0.5);

      // Name
      this.add.text(cx + cardW / 2, cy + 65, level.name, {
        fontFamily: '"Teko Bold", sans-serif',
        fontSize: '18px',
        color: isUnlocked ? '#FFFFFF' : '#4A5568',
        wordWrap: { width: cardW - 16 },
        align: 'center',
      }).setOrigin(0.5);

      this.add.text(cx + cardW / 2, cy + 85, level.nameNP, {
        fontFamily: '"Mukta", sans-serif',
        fontSize: '14px',
        color: isUnlocked ? `#${level.color.toString(16)}` : '#2D3748',
      }).setOrigin(0.5);

      this.add.text(cx + cardW / 2, cy + 110, level.subtitleNP, {
        fontFamily: '"Mukta", sans-serif',
        fontSize: '11px',
        color: 'rgba(255,255,255,0.4)',
        wordWrap: { width: cardW - 16 },
        align: 'center',
      }).setOrigin(0.5);

      this.add.text(cx + cardW / 2, cy + 140, level.difficulty, {
        fontFamily: '"Mukta", sans-serif',
        fontSize: '13px',
        color: 'rgba(255,255,255,0.6)',
      }).setOrigin(0.5);

      if (isComingSoon) {
        const lockOverlay = this.add.graphics();
        lockOverlay.fillStyle(0x000000, 0.5);
        lockOverlay.fillRoundedRect(cx, cy, cardW, cardH, 14);
        this.add.text(cx + cardW / 2, cy + cardH / 2 - 16, '🔒', { fontSize: '24px' }).setOrigin(0.5);
        this.add.text(cx + cardW / 2, cy + cardH / 2 + 14, 'Coming Soon', {
          fontFamily: '"Mukta", sans-serif', fontSize: '14px', color: '#4A5568',
        }).setOrigin(0.5);
      } else if (isUnlocked) {
        const hitZone = this.add.zone(cx + cardW / 2, cy + cardH / 2, cardW, cardH)
          .setInteractive({ useHandCursor: true });

        hitZone.on('pointerover', () => {
          cardGfx.clear();
          cardGfx.fillStyle(level.color, 0.3);
          cardGfx.fillRoundedRect(cx, cy, cardW, cardH, 14);
          cardGfx.lineStyle(3, level.color, 1);
          cardGfx.strokeRoundedRect(cx, cy, cardW, cardH, 14);
        });

        hitZone.on('pointerout', () => {
          cardGfx.clear();
          cardGfx.fillStyle(level.color, 0.15);
          cardGfx.fillRoundedRect(cx, cy, cardW, cardH, 14);
          cardGfx.lineStyle(2, level.color, 1);
          cardGfx.strokeRoundedRect(cx, cy, cardW, cardH, 14);
        });

        hitZone.on('pointerdown', () => {
          this.cameras.main.fadeOut(400, 26, 26, 46);
          this.cameras.main.once('camerafadeoutcomplete', () => {
            const SceneKey = level.key === 'tutorial' ? 'TutorialScene' : 'Level1Scene';
            this.scene.start(SceneKey, {
              character: this.characterId,
              player: this._player.data,
              levelKey: level.key,
              isTutorial: level.key === 'tutorial',
            });
          });
        });
      }
    });

    // Back button
    const backBtn = this.add.text(60, h - 40, '← BACK', {
      fontFamily: '"Teko Bold", sans-serif', fontSize: '20px',
      color: 'rgba(255,255,255,0.5)',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    backBtn.on('pointerover', () => backBtn.setStyle({ color: '#FF6B00' }));
    backBtn.on('pointerout', () => backBtn.setStyle({ color: 'rgba(255,255,255,0.5)' }));
    backBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(300);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MainMenuScene');
      });
    });

    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.start('MainMenuScene');
    });

    this.cameras.main.fadeIn(400, 26, 26, 46);
  }
}
