// ============================================================
// PARDA FAAS — Tutorial Scene
// Extends GameScene — Balen only, can't lose, step-by-step intro
// Gamification: Learned Helplessness Countermeasure
// ============================================================

import GameScene from './GameScene.js';
import Phaser from 'phaser';
import STRINGS from '../config/strings.js';

const TUTORIAL_STEPS = [
  { id: 'welcome', message: STRINGS.tutorial.welcome, trigger: 'start' },
  { id: 'move', message: STRINGS.tutorial.move, trigger: 'start', arrow: 'right' },
  { id: 'jump', message: STRINGS.tutorial.jump, trigger: 'moved' },
  { id: 'interact', message: STRINGS.tutorial.interact, trigger: 'jumped' },
  { id: 'special', message: STRINGS.tutorial.special, trigger: 'collect' },
  { id: 'bribe', message: STRINGS.tutorial.bribe, trigger: 'special' },
  { id: 'publish', message: STRINGS.tutorial.publish, trigger: 'bribe' },
  { id: 'complete', message: STRINGS.tutorial.complete, trigger: 'collect_all' },
];

export default class TutorialScene extends GameScene {
  constructor() {
    super('TutorialScene');
    this.levelKey = 'tutorial';
    this.isTutorial = true;
    this._tutStep = 0;
    this._tutStepsCompleted = new Set();
    this._tutOverlay = null;
    this._tutMoved = false;
    this._tutJumped = false;
  }

  init(data) {
    super.init(data);
    this.characterId = 'balen'; // forced
    this.levelKey = 'tutorial';
    this.isTutorial = true;
  }

  create() {
    super.create();
    // Start tutorial flow after short delay
    this.time.delayedCall(800, () => {
      this._showTutorialStep('start');
    });
  }

  _setupTutorial() {
    this._tutStep = 0;
    this._tutStepsCompleted = new Set();
  }

  _updateTutorial() {
    // Track movement
    if (!this._tutMoved) {
      if (this._keys.left.isDown || this._keys.right.isDown ||
          this._keys.a.isDown || this._keys.d.isDown) {
        this._tutMoved = true;
        this.time.delayedCall(600, () => this._showTutorialStep('moved'));
      }
    }

    // Track jump
    if (this._tutMoved && !this._tutJumped) {
      if (this._keys.up.isDown || this._keys.w.isDown) {
        this._tutJumped = true;
        this.time.delayedCall(800, () => this._showTutorialStep('jumped'));
      }
    }
  }

  _advanceTutorial(step) {
    switch (step) {
      case 'collect':
        if (!this._tutStepsCompleted.has('collect')) {
          this._tutStepsCompleted.add('collect');
          this.time.delayedCall(400, () => this._showTutorialStep('collect'));
        }
        break;
      case 'special':
        this._showTutorialStep('special');
        break;
      case 'bribe':
        this._showTutorialStep('bribe');
        break;
    }
    if (this._evidenceSystem.isComplete()) {
      this.time.delayedCall(600, () => this._showTutorialStep('collect_all'));
    }
  }

  _showTutorialStep(trigger) {
    const step = TUTORIAL_STEPS.find(s => s.trigger === trigger && !this._tutStepsCompleted.has(s.id));
    if (!step) return;
    this._tutStepsCompleted.add(step.id);

    const w = this.scale.width;
    const h = this.scale.height;

    // Clear old overlay
    if (this._tutOverlay) {
      this._tutOverlay.forEach(item => {
        if (item && item.destroy) {
          this.tweens.add({ targets: item, alpha: 0, duration: 300, onComplete: () => item.destroy() });
        }
      });
      this._tutOverlay = null;
    }

    if (step.id === 'complete') {
      // Tutorial complete — trigger cinematic
      this.time.delayedCall(1000, () => {
        this._onPublish();
      });
      return;
    }

    // Show tip panel
    const panel = this.add.graphics().setScrollFactor(0).setDepth(200);
    panel.fillStyle(0x0D1117, 0.92);
    panel.fillRoundedRect(w / 2 - 260, h - 160, 520, 100, 14);
    panel.lineStyle(2, 0xFF6B00, 0.9);
    panel.strokeRoundedRect(w / 2 - 260, h - 160, 520, 100, 14);

    const npText = this.add.text(w / 2, h - 132, step.message.np, {
      fontFamily: '"Mukta", sans-serif',
      fontSize: '18px',
      color: '#F1C40F',
      align: 'center',
      wordWrap: { width: 480 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201).setAlpha(0);

    const enText = this.add.text(w / 2, h - 100, step.message.en, {
      fontFamily: '"Mukta", sans-serif',
      fontSize: '14px',
      color: 'rgba(255,255,255,0.7)',
      align: 'center',
      wordWrap: { width: 480 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201).setAlpha(0);

    this.tweens.add({ targets: [panel, npText, enText], alpha: 1, duration: 400 });

    // Tutorial arrow pointing at relevant item
    if (step.arrow === 'right') {
      const arrow = this.add.text(200, h / 2, '→', {
        fontFamily: '"Bangers", cursive',
        fontSize: '48px',
        color: '#F1C40F',
        stroke: '#000',
        strokeThickness: 4,
      }).setScrollFactor(0).setDepth(201);
      this.tweens.add({ targets: arrow, x: 220, duration: 400, yoyo: true, repeat: -1 });
      this._tutOverlay = [panel, npText, enText, arrow];
    } else {
      this._tutOverlay = [panel, npText, enText];
    }

    // Auto-dismiss after 4s
    this.time.delayedCall(4000, () => {
      if (this._tutOverlay) {
        this._tutOverlay.forEach(item => {
          if (item && item.destroy) {
            this.tweens.add({ targets: item, alpha: 0, duration: 400, onComplete: () => item.destroy() });
          }
        });
        this._tutOverlay = null;
      }
    });

    // Inject tutorial bribe after step 5 if not already offered
    if (step.id === 'special' && !this._bribeOffered) {
      this._bribeOffered = true;
      this.time.delayedCall(2000, () => this._offerBribe());
    }
  }
}
