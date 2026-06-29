// ============================================================
// PARDA FAAS — Game Scene (Core Platformer Engine)
// Handles: movement, physics, evidence interaction, NPCs,
// bribe system, parallax, HUD, keyboard controls
// This is the base class — TutorialScene and Level1Scene extend it
// ============================================================

import Phaser from 'phaser';
import { EvidenceSystem } from '../systems/EvidenceSystem.js';
import { BribeSystem } from '../systems/BribeSystem.js';
import { CharacterLoader } from '../systems/CharacterLoader.js';
import { CHARACTERS } from '../config/characters.js';
import { LEVELS, WITNESS_DIALOGUES } from '../config/levels.js';
import { PlayerProfile } from '../systems/StreakSystem.js';
import STRINGS from '../config/strings.js';

const WORLD_WIDTH_DEFAULT = 3200;
const GRAVITY = 800;
const MOVE_SPEED = 220;
const JUMP_FORCE = -480;
const DOUBLE_JUMP_FORCE = -420;
const PLAYER_WIDTH = 48;
const PLAYER_HEIGHT = 72;

export default class GameScene extends Phaser.Scene {
  constructor(key = 'GameScene') {
    super({ key });
    this.levelKey = 'level1';
    this.characterId = 'balen';
    this.isTutorial = false;
  }

  init(data) {
    this.characterId = (data && data.character) || 'balen';
    this.playerData = (data && data.player) || {};
    this.levelKey = (data && data.levelKey) || 'level1';
    this.isTutorial = (data && data.isTutorial) || false;
    this._player = new PlayerProfile();
  }

  create() {
    this.levelConfig = LEVELS[this.levelKey];
    this.charConfig = CHARACTERS[this.characterId];
    const worldWidth = (this.levelConfig.platformLayout && this.levelConfig.worldWidth) || WORLD_WIDTH_DEFAULT;

    // Physics world
    this.physics.world.gravity.y = GRAVITY;
    this.physics.world.setBounds(0, 0, worldWidth, this.scale.height);

    // === PARALLAX BACKGROUND ===
    this._createParallax(worldWidth);

    // === PLATFORMS & GROUND ===
    this._createPlatforms();

    // === EVIDENCE ITEMS ===
    this._evidenceSystem = new EvidenceSystem(this, this.levelConfig);
    this._evidenceItems = this._createEvidence();

    // === NPCs ===
    this._createNPCs();

    // === PLAYER ===
    this._createPlayer(worldWidth);

    // === BRIBE SYSTEM ===
    this._bribeSystem = new BribeSystem(this);
    this._bribeUI = null;
    this._setupBribeSystem();

    // === HUD ===
    this._createHUD();

    // === CAMERA ===
    this.cameras.main.setBounds(0, 0, worldWidth, this.scale.height);
    this.cameras.main.startFollow(this._playerSprite, true, 0.08, 0.08);
    this.cameras.main.fadeIn(400);

    // === KEYBOARD ===
    this._setupKeyboard();

    // === COMBO TRACKING ===
    this._comboBuffer = [];
    this._lastInteractTime = 0;

    // === TIMER ===
    if (this.levelConfig.timeLimit && !this.isTutorial) {
      this._timeRemaining = this.levelConfig.timeLimit;
      this._timerEvent = this.time.addEvent({
        delay: 1000,
        callback: this._tickTimer,
        callbackScope: this,
        loop: true,
      });
    }

    // === COUNTERMOVES ===
    this._scheduleCountermoves();

    // === TUTORIAL OVERLAYS ===
    if (this.isTutorial) {
      this._setupTutorial();
    }

    // === CINEMATIC CUTSCENE ===
    if (this.levelConfig.cutscene) {
      this._playCutscene();
    }

    // Evidence system events
    this._evidenceSystem.onCollect = (item, progress) => this._onEvidenceCollect(item, progress);
    this._evidenceSystem.onComplete = () => this._onEvidenceComplete();
    this._evidenceSystem.onRedHerring = (item, penalty) => this._onRedHerring(item, penalty);

    // Bribe system events
    this._bribeSystem.onReject = (msg, insult) => this._onBribeReject(msg, insult);
    this._bribeSystem.onIntegrityChange = (val) => this._updateIntegrityBar(val);
  }

  // ============================================================
  // PARALLAX BACKGROUND
  // ============================================================
  _createParallax(worldWidth) {
    const h = this.scale.height;
    const w = this.scale.width;

    // FAR LAYER: sky gradient + Kathmandu skyline silhouette
    const farBg = this.add.graphics();
    farBg.fillGradientStyle(0x1A1A3E, 0x1A1A3E, 0x2C3E50, 0x4A90A4, 1);
    farBg.fillRect(0, 0, worldWidth, h * 0.7);
    // Ground sky
    farBg.fillGradientStyle(0x4A90A4, 0x4A90A4, 0xF39C12, 0xE74C3C, 1);
    farBg.fillRect(0, h * 0.4, worldWidth, h * 0.3);
    farBg.setScrollFactor(0.1);

    // Distant hills silhouette
    const hills = this.add.graphics();
    hills.fillStyle(0x0D2137, 0.8);
    for (let x = 0; x < worldWidth; x += 300) {
      const hillH = Phaser.Math.Between(80, 180);
      hills.fillEllipse(x + 150, h - 100 - hillH / 2, 350, hillH * 2);
    }
    hills.setScrollFactor(0.15);

    // Boudhanath stupa silhouette (iconic Kathmandu)
    const stupa = this.add.graphics();
    stupa.fillStyle(0x0D2137, 0.9);
    // Base
    stupa.fillRect(worldWidth * 0.35, h - 260, 200, 80);
    // Dome
    stupa.fillEllipse(worldWidth * 0.35 + 100, h - 270, 180, 100);
    // Spire
    stupa.fillRect(worldWidth * 0.35 + 85, h - 370, 30, 120);
    stupa.fillTriangle(worldWidth * 0.35 + 80, h - 370, worldWidth * 0.35 + 120, h - 370, worldWidth * 0.35 + 100, h - 420);
    stupa.setScrollFactor(0.12);

    // MID LAYER: building facades
    const midBg = this.add.graphics();
    midBg.fillStyle(0x1A2744, 0.85);
    const buildingWidths = [80, 100, 60, 120, 90, 70, 110];
    let bx = 0;
    while (bx < worldWidth + 200) {
      const bw = buildingWidths[bx % buildingWidths.length] + Phaser.Math.Between(0, 40);
      const bh = Phaser.Math.Between(80, 220);
      midBg.fillRect(bx, h - 100 - bh, bw - 4, bh);
      // Windows
      midBg.fillStyle(0xF1C40F, 0.3);
      for (let wy = h - 100 - bh + 10; wy < h - 110; wy += 30) {
        for (let wx = bx + 8; wx < bx + bw - 14; wx += 20) {
          if (Math.random() > 0.4) midBg.fillRect(wx, wy, 10, 14);
        }
      }
      midBg.fillStyle(0x1A2744, 0.85);
      bx += bw;
    }

    // Power lines
    midBg.lineStyle(1, 0x4A5568, 0.6);
    for (let px = 0; px < worldWidth; px += 200) {
      if (px > 0) {
        midBg.beginPath();
        midBg.moveTo(px - 200, h - 180);
        midBg.lineTo(px, h - 190 + Phaser.Math.Between(-20, 20));
        midBg.strokePath();
      }
      // Pole
      midBg.fillStyle(0x2D3748, 1);
      midBg.fillRect(px - 3, h - 230, 6, 130);
    }
    midBg.setScrollFactor(0.3);

    // NEAR LAYER: foreground debris / litter
    const nearBg = this.add.graphics();
    nearBg.fillStyle(0x2D3748, 0.7);
    for (let fx = 0; fx < worldWidth; fx += Phaser.Math.Between(80, 200)) {
      // Scattered papers
      nearBg.fillStyle(0xFFFFFF, 0.08);
      nearBg.setRotation(Phaser.Math.FloatBetween(-0.3, 0.3));
      nearBg.fillRect(fx, h - 130, 24, 32);
      nearBg.setRotation(0);
    }
    nearBg.setScrollFactor(0.7);
  }

  // ============================================================
  // PLATFORMS & GROUND
  // ============================================================
  _createPlatforms() {
    this._platforms = this.physics.add.staticGroup();
    const layout = this.levelConfig.platformLayout;
    const h = this.scale.height;
    const tileW = 64;

    if (!layout) {
      // Default: full-width ground
      for (let x = 0; x < WORLD_WIDTH_DEFAULT; x += tileW) {
        this._platforms.create(x + tileW / 2, h - 16, 'ground_tile');
      }
      return;
    }

    layout.forEach(plat => {
      const isGround = plat.type === 'ground';
      const texKey = isGround ? 'ground_tile' : 'platform_tile';
      const platH = isGround ? 32 : 20;
      const tiles = Math.ceil(plat.width / tileW);

      for (let i = 0; i < tiles; i++) {
        const tx = plat.x + i * tileW + tileW / 2;
        const ty = isGround ? h - platH / 2 : plat.y + platH / 2;
        const tile = this._platforms.create(tx, ty, texKey);
        tile.setDisplaySize(tileW, platH);
        tile.refreshBody();
      }
    });
  }

  // ============================================================
  // EVIDENCE
  // ============================================================
  _createEvidence() {
    const group = this.add.group();
    const pool = [...(this.levelConfig.evidencePool || []), ...(this.levelConfig.redHerrings || [])];
    const h = this.scale.height;

    pool.forEach(ev => {
      const texKey = ev.valid ? `evidence_${ev.type}` : 'evidence_redherring';
      const sprite = this.add.image(ev.x, ev.y || h - 120, texKey)
        .setInteractive();
      sprite.evidenceId = ev.id;
      sprite.evidenceLabel = ev.label;
      sprite.isWitness = ev.type === 'witness';
      sprite.isValid = ev.valid;

      // Float + glow animation
      this.tweens.add({
        targets: sprite,
        y: (ev.y || h - 120) - 12,
        duration: 1800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Math.random() * 1000,
      });

      // Glow overlay
      const glow = this.add.graphics();
      glow.fillStyle(ev.valid ? 0xF1C40F : 0xFF6B00, 0.15);
      glow.fillCircle(ev.x, ev.y || h - 120, 28);
      this.tweens.add({
        targets: glow,
        alpha: 0,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 500,
      });

      // Interaction prompt
      const label = this.add.text(ev.x, (ev.y || h - 120) - 50, `[E] ${ev.label}`, {
        fontFamily: '"Mukta", sans-serif',
        fontSize: '13px',
        color: '#FFFFFF',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: { x: 8, y: 4 },
        stroke: '#000',
        strokeThickness: 2,
      }).setOrigin(0.5).setVisible(false);

      sprite.promptLabel = label;
      group.add(sprite);
    });

    return group;
  }

  // ============================================================
  // NPCs
  // ============================================================
  _createNPCs() {
    this._witnesses = [];
    this._thugs = [];
    this._officials = [];

    const evidencePool = this.levelConfig.evidencePool || [];
    const h = this.scale.height;

    // Create witness sprites at witness evidence positions
    evidencePool.filter(e => e.type === 'witness').forEach(ev => {
      const w = this.physics.add.sprite(ev.x, (ev.y || h - 120), 'npc_witness');
      w.setCollideWorldBounds(true);
      w.setBounce(0);
      this.physics.add.collider(w, this._platforms);
      w.evidenceId = ev.id;
      w.dialogueKey = ev.dialogue;
      w.isInteracted = false;

      // Idle bob
      this.tweens.add({
        targets: w,
        y: w.y - 6,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      // Speech bubble hint
      const bubble = this.add.text(ev.x, (ev.y || h - 120) - 100, '?', {
        fontFamily: '"Bangers", cursive',
        fontSize: '32px',
        color: '#F1C40F',
        stroke: '#000',
        strokeThickness: 4,
      }).setOrigin(0.5);

      this.tweens.add({
        targets: bubble,
        scaleX: 1.2, scaleY: 1.2,
        duration: 800,
        yoyo: true,
        repeat: -1,
      });

      w.speechBubble = bubble;
      this._witnesses.push(w);
    });

    // Official NPC (at end of level)
    const officialX = (this.levelConfig.worldWidth || WORLD_WIDTH_DEFAULT) - 300;
    const official = this.physics.add.sprite(officialX, h - 50, 'npc_official');
    official.setCollideWorldBounds(true);
    this.physics.add.collider(official, this._platforms);

    // Official sweating animation
    this.tweens.add({
      targets: official,
      scaleX: 1.05,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    this._officials.push(official);

    // Official name tag
    this.add.text(officialX, h - 160, this.levelConfig.officialNameNP || this.levelConfig.officialName, {
      fontFamily: '"Mukta", sans-serif',
      fontSize: '14px',
      color: '#FF6B00',
      backgroundColor: 'rgba(0,0,0,0.8)',
      padding: { x: 8, y: 4 },
    }).setOrigin(0.5);
  }

  // ============================================================
  // PLAYER
  // ============================================================
  _createPlayer(worldWidth) {
    const h = this.scale.height;
    const startX = 80;
    const color = parseInt(this.charConfig.color.replace('#', ''), 16);

    // Use real sprite if available, else placeholder
    const texKey = CharacterLoader.getTextureKey(this, this.characterId, 'idle');

    this._playerSprite = this.physics.add.sprite(startX, h - 120, texKey);
    this._playerSprite.setDisplaySize(PLAYER_WIDTH, PLAYER_HEIGHT);
    this._playerSprite.setCollideWorldBounds(true);
    this._playerSprite.setBounce(0);
    this._playerSprite.setGravityY(0); // already set globally

    // Body resize for tighter collision
    this._playerSprite.body.setSize(PLAYER_WIDTH - 8, PLAYER_HEIGHT - 4);
    this._playerSprite.body.setOffset(4, 4);

    // Drop shadow
    this._playerShadow = this.add.ellipse(startX, h - 100, 40, 10, 0x000000, 0.3);

    // Player outline highlight
    this._playerHighlight = this.add.graphics();

    // Double-jump state
    this._canDoubleJump = false;
    this._jumpsUsed = 0;

    // Shield state
    this._shieldActive = false;
    this._shieldTimer = null;
    this._shieldGfx = null;

    // Special ability cooldown
    this._specialCooldown = 0;
    this._specialMaxCooldown = this.charConfig.special.cooldown;

    // Platform collision
    this.physics.add.collider(this._playerSprite, this._platforms, () => {
      this._jumpsUsed = 0; // reset on ground contact
    });

    // Overlap with evidence
    this.physics.add.overlap(this._playerSprite, this._evidenceItems, (player, ev) => {
      // Show prompt if close enough (just show nearby via update loop)
    });
  }

  // ============================================================
  // KEYBOARD
  // ============================================================
  _setupKeyboard() {
    const kb = this.input.keyboard;

    this._keys = {
      left:    kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right:   kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      up:      kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      down:    kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      a:       kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      d:       kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      w:       kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      s:       kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      e:       kb.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      q:       kb.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
      f:       kb.addKey(Phaser.Input.Keyboard.KeyCodes.F),
      b:       kb.addKey(Phaser.Input.Keyboard.KeyCodes.B),
      tab:     kb.addKey(Phaser.Input.Keyboard.KeyCodes.TAB),
      space:   kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      esc:     kb.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
      enter:   kb.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
    };

    // Prevent tab default (browser focus switch)
    this._keys.tab.preventDefault = true;

    // One-shot key listeners
    this._keys.e.on('down', () => this._onInteract());
    this._keys.q.on('down', () => this._onSpecial());
    this._keys.f.on('down', () => this._onShield());
    this._keys.b.on('down', () => this._onRejectBribe());
    this._keys.space.on('down', () => this._onPublish());
    this._keys.esc.on('down', () => this._onPause());
    this._keys.tab.on('down', () => this._onToggleCaseFile());
  }

  // ============================================================
  // HUD
  // ============================================================
  _createHUD() {
    const w = this.scale.width;
    const cam = this.cameras.main;

    // HUD is in a fixed camera (UI layer)
    const hudCam = this.cameras.add(0, 0, w, this.scale.height);
    hudCam.setScroll(0, 0);
    this._hudContainer = this.add.container(0, 0);
    hudCam.ignore([]); // HUD container will be set to fixed

    // Separate HUD layer using setScrollFactor(0)
    const hudY = 16;

    // --- Left panel: integrity bar ---
    this._hudPanelLeft = this.add.graphics().setScrollFactor(0).setDepth(100);
    this._hudPanelLeft.fillStyle(0x1A1A2E, 0.85);
    this._hudPanelLeft.fillRoundedRect(12, hudY, 240, 56, 10);
    this._hudPanelLeft.lineStyle(1, 0x4A5568, 0.8);
    this._hudPanelLeft.strokeRoundedRect(12, hudY, 240, 56, 10);

    this._integrityLabel = this.add.text(24, hudY + 8, '🛡 INTEGRITY', {
      fontFamily: '"Teko Bold", sans-serif',
      fontSize: '14px',
      color: '#94A3B8',
      letterSpacing: 1,
    }).setScrollFactor(0).setDepth(101);

    // Integrity bar bg
    const intBg = this.add.graphics().setScrollFactor(0).setDepth(101);
    intBg.fillStyle(0x2D3748, 1);
    intBg.fillRoundedRect(24, hudY + 26, 216, 16, 4);

    this._integrityBar = this.add.graphics().setScrollFactor(0).setDepth(102);
    this._drawIntegrityBar(100);

    // --- Center: evidence counter ---
    this._hudCenter = this.add.graphics().setScrollFactor(0).setDepth(100);
    this._hudCenter.fillStyle(0x1A1A2E, 0.85);
    this._hudCenter.fillRoundedRect(w / 2 - 100, hudY, 200, 56, 10);
    this._hudCenter.lineStyle(1, 0x4A5568, 0.8);
    this._hudCenter.strokeRoundedRect(w / 2 - 100, hudY, 200, 56, 10);

    this._evidenceLabel = this.add.text(w / 2, hudY + 8, '📁 EVIDENCE', {
      fontFamily: '"Teko Bold", sans-serif',
      fontSize: '14px',
      color: '#94A3B8',
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(101);

    this._evidenceCounter = this.add.text(w / 2, hudY + 28, `0 / ${this.levelConfig.requiredEvidence}`, {
      fontFamily: '"Teko Bold", sans-serif',
      fontSize: '22px',
      color: '#F1C40F',
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(101);

    // --- Right panel: streak + special ---
    this._hudRight = this.add.graphics().setScrollFactor(0).setDepth(100);
    this._hudRight.fillStyle(0x1A1A2E, 0.85);
    this._hudRight.fillRoundedRect(w - 252, hudY, 240, 56, 10);
    this._hudRight.lineStyle(1, 0x4A5568, 0.8);
    this._hudRight.strokeRoundedRect(w - 252, hudY, 240, 56, 10);

    const profile = new PlayerProfile();
    this._streakText = this.add.text(w - 240, hudY + 8, `🔥 Streak: Day ${profile.data.streak || 1}`, {
      fontFamily: '"Teko Bold", sans-serif',
      fontSize: '14px',
      color: '#FF6B00',
    }).setScrollFactor(0).setDepth(101);

    this._specialLabel = this.add.text(w - 240, hudY + 28, `[Q] ${this.charConfig.special.name} ${this.charConfig.special.icon}`, {
      fontFamily: '"Teko Bold", sans-serif',
      fontSize: '14px',
      color: '#0D7377',
    }).setScrollFactor(0).setDepth(101);

    // Special cooldown bar
    const specBg = this.add.graphics().setScrollFactor(0).setDepth(101);
    specBg.fillStyle(0x2D3748, 1);
    specBg.fillRoundedRect(w - 120, hudY + 26, 108, 8, 4);

    this._specialBar = this.add.graphics().setScrollFactor(0).setDepth(102);
    this._drawSpecialBar(1);

    // --- Timer (if applicable) ---
    if (this.levelConfig.timeLimit && !this.isTutorial) {
      this._timerText = this.add.text(w / 2, hudY + 80, '⏱ 2:00', {
        fontFamily: '"Teko Bold", sans-serif',
        fontSize: '28px',
        color: '#FFFFFF',
        stroke: '#000',
        strokeThickness: 3,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(101);
    }

    // --- Publish prompt (hidden initially) ---
    this._publishPrompt = this.add.text(w / 2, this.scale.height - 60, '[ SPACE ] — PUBLISH EXPOSÉ  📰', {
      fontFamily: '"Teko Bold", sans-serif',
      fontSize: '24px',
      color: '#F1C40F',
      backgroundColor: 'rgba(0,0,0,0.85)',
      padding: { x: 20, y: 12 },
      stroke: '#FF6B00',
      strokeThickness: 2,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101).setVisible(false);

    this.tweens.add({
      targets: this._publishPrompt,
      scaleX: 1.04, scaleY: 1.04,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    // --- Character portrait (corner) ---
    const portKey = CharacterLoader.getPortraitKey(this, this.characterId);
    if (portKey !== '__MISSING') {
      this.add.image(w - 16, this.scale.height - 16, portKey)
        .setDisplaySize(56, 72)
        .setOrigin(1, 1)
        .setScrollFactor(0)
        .setDepth(101)
        .setAlpha(0.9);
    }

    // Player name tag
    this.add.text(w - 44, this.scale.height - 20, this.charConfig.nameNP, {
      fontFamily: '"Mukta", sans-serif',
      fontSize: '13px',
      color: this.charConfig.color,
    }).setOrigin(1, 1).setScrollFactor(0).setDepth(101);
  }

  _drawIntegrityBar(value) {
    const w = this.scale.width;
    const pct = Math.max(0, value / 100);
    const color = pct > 0.5 ? 0x2ECC71 : pct > 0.25 ? 0xF39C12 : 0xE74C3C;
    this._integrityBar.clear();
    this._integrityBar.fillStyle(color, 1);
    this._integrityBar.fillRoundedRect(24, 16 + 26, Math.floor(216 * pct), 16, 4);
  }

  _drawSpecialBar(pct) {
    const w = this.scale.width;
    this._specialBar.clear();
    if (pct >= 1) {
      this._specialBar.fillStyle(0x0D7377, 1);
    } else {
      this._specialBar.fillStyle(0x4A5568, 1);
    }
    this._specialBar.fillRoundedRect(w - 120, 16 + 26, Math.floor(108 * pct), 8, 4);
  }

  _updateIntegrityBar(val) {
    this._drawIntegrityBar(val);
    if (val < 30) {
      this._integrityLabel.setStyle({ color: '#E74C3C' });
    }
  }

  // ============================================================
  // UPDATE LOOP
  // ============================================================
  update(time, delta) {
    if (!this._playerSprite) return;
    this._handleMovement();
    this._updateShadow();
    this._checkEvidenceProximity();
    this._updateSpecialCooldown(delta);
    this._updateBribeHold();
    this._updateCountermoves(delta);
    if (this.isTutorial) this._updateTutorial();
  }

  _handleMovement() {
    const kb = this._keys;
    const sp = this._playerSprite;
    const onGround = sp.body.blocked.down;

    // Horizontal
    if (Phaser.Input.Keyboard.JustDown(kb.left) || kb.left.isDown || kb.a.isDown) {
      sp.setVelocityX(-MOVE_SPEED);
      sp.setFlipX(true);
    } else if (kb.right.isDown || kb.d.isDown) {
      sp.setVelocityX(MOVE_SPEED);
      sp.setFlipX(false);
    } else {
      sp.setVelocityX(sp.body.velocity.x * 0.7); // friction
    }

    // Crouch
    if ((kb.down.isDown || kb.s.isDown) && onGround) {
      sp.setDisplaySize(PLAYER_WIDTH, PLAYER_HEIGHT * 0.6);
    } else {
      sp.setDisplaySize(PLAYER_WIDTH, PLAYER_HEIGHT);
    }

    // Jump
    if (Phaser.Input.Keyboard.JustDown(kb.up) || Phaser.Input.Keyboard.JustDown(kb.w)) {
      if (onGround) {
        sp.setVelocityY(JUMP_FORCE);
        this._jumpsUsed = 1;
        this._showJumpEffect();
      } else if (this._jumpsUsed === 1) {
        sp.setVelocityY(DOUBLE_JUMP_FORCE);
        this._jumpsUsed = 2;
        this._showDoubleJumpEffect();
      }
    }

    // Drop through platform on S + Down (approximate)
    if ((kb.down.isDown || kb.s.isDown) && !onGround) {
      sp.setVelocityY(sp.body.velocity.y + 200);
    }
  }

  _showJumpEffect() {
    const sp = this._playerSprite;
    const dust = this.add.graphics();
    dust.fillStyle(0xAAAAAA, 0.5);
    dust.fillCircle(sp.x, sp.y + PLAYER_HEIGHT / 2, 12);
    this.tweens.add({ targets: dust, alpha: 0, scaleX: 2, scaleY: 2, duration: 300, onComplete: () => dust.destroy() });
  }

  _showDoubleJumpEffect() {
    const sp = this._playerSprite;
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const spark = this.add.graphics();
      spark.fillStyle(0x0D7377, 0.8);
      spark.fillCircle(sp.x, sp.y, 5);
      this.tweens.add({
        targets: spark,
        x: sp.x + Math.cos(angle) * 30,
        y: sp.y + Math.sin(angle) * 30,
        alpha: 0,
        duration: 400,
        onComplete: () => spark.destroy(),
      });
    }
  }

  _updateShadow() {
    if (!this._playerShadow) return;
    this._playerShadow.x = this._playerSprite.x;
    this._playerShadow.y = this.scale.height - 95;
    const heightAbove = Math.max(0, this.scale.height - 95 - this._playerSprite.y);
    const scale = Math.max(0.3, 1 - heightAbove / 300);
    this._playerShadow.setScale(scale);
    this._playerShadow.setAlpha(scale * 0.4);
  }

  // ============================================================
  // EVIDENCE PROXIMITY
  // ============================================================
  _checkEvidenceProximity() {
    if (!this._evidenceItems) return;
    const px = this._playerSprite.x;
    const py = this._playerSprite.y;
    const PROXIMITY = 80;

    this._evidenceItems.getChildren().forEach(ev => {
      if (!ev.active) return;
      const dist = Phaser.Math.Distance.Between(px, py, ev.x, ev.y);
      if (ev.promptLabel) {
        ev.promptLabel.setVisible(dist < PROXIMITY);
      }
    });

    // Witness proximity
    this._witnesses.forEach(w => {
      if (!w.active) return;
      const dist = Phaser.Math.Distance.Between(px, py, w.x, w.y);
      if (w.speechBubble) {
        w.speechBubble.setVisible(dist < PROXIMITY);
      }
    });
  }

  // ============================================================
  // ACTION HANDLERS
  // ============================================================
  _onInteract() {
    if (this._dialogueActive) return;

    const px = this._playerSprite.x;
    const py = this._playerSprite.y;
    const PROXIMITY = 90;

    // Check evidence items
    let collected = false;
    this._evidenceItems.getChildren().forEach(ev => {
      if (!ev.active || collected) return;
      const dist = Phaser.Math.Distance.Between(px, py, ev.x, ev.y);
      if (dist < PROXIMITY) {
        const result = this._evidenceSystem.collect(ev.evidenceId);
        if (result) {
          ev.setActive(false).setVisible(false);
          if (ev.promptLabel) ev.promptLabel.destroy();
          this._showCollectEffect(ev.x, ev.y, ev.isValid);
          collected = true;
        }
      }
    });

    // Check witnesses
    if (!collected) {
      this._witnesses.forEach(w => {
        if (!w.active || collected) return;
        const dist = Phaser.Math.Distance.Between(px, py, w.x, w.y);
        if (dist < PROXIMITY && !w.isInteracted) {
          w.isInteracted = true;
          const dialogue = WITNESS_DIALOGUES[w.dialogueKey];
          if (dialogue) {
            this._showDialogue(dialogue, w, () => {
              if (dialogue.evidenceGranted) {
                this._evidenceSystem.collect(w.evidenceId);
                this._showCollectEffect(w.x, w.y, true);
              }
              if (w.speechBubble) w.speechBubble.destroy();
            });
          }
          collected = true;
        }
      });
    }

    // Track for combo
    this._evidenceSystem.triggerSpecialAction();
  }

  _showCollectEffect(x, y, isValid) {
    // Gold flash + floating text
    const color = isValid ? 0xF1C40F : 0xFF6B00;
    const text = isValid ? '+EVIDENCE!' : '⚠️ Red Herring!';

    const flash = this.add.graphics();
    flash.fillStyle(color, 0.4);
    flash.fillCircle(x, y, 40);
    this.tweens.add({ targets: flash, alpha: 0, scaleX: 2.5, scaleY: 2.5, duration: 500, onComplete: () => flash.destroy() });

    const floatText = this.add.text(x, y - 20, text, {
      fontFamily: '"Bangers", cursive',
      fontSize: '22px',
      color: `#${color.toString(16).padStart(6, '0')}`,
      stroke: '#000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.tweens.add({ targets: floatText, y: y - 80, alpha: 0, duration: 1000, onComplete: () => floatText.destroy() });

    // Camera shake on valid collect
    if (isValid) {
      this.cameras.main.shake(80, 0.005);
    }

    // Sparks
    for (let i = 0; i < 5; i++) {
      const spark = this.add.graphics();
      spark.fillStyle(color, 1);
      spark.fillCircle(x, y, 4);
      this.tweens.add({
        targets: spark,
        x: x + Phaser.Math.Between(-50, 50),
        y: y + Phaser.Math.Between(-50, 20),
        alpha: 0,
        duration: Phaser.Math.Between(300, 600),
        onComplete: () => spark.destroy(),
      });
    }
  }

  _onEvidenceCollect(item, progress) {
    // Update HUD counter
    if (this._evidenceCounter) {
      this._evidenceCounter.setText(`${progress.collected} / ${progress.required}`);
      if (progress.collected >= progress.required) {
        this._evidenceCounter.setStyle({ color: '#2ECC71' });
      }
    }

    // Tutorial step advancement
    if (this.isTutorial) this._advanceTutorial('collect');
  }

  _onEvidenceComplete() {
    // Show publish prompt
    if (this._publishPrompt) {
      this._publishPrompt.setVisible(true);
    }
    // Golden breakthrough effect
    this.cameras.main.flash(200, 241, 196, 15, true);
    this.cameras.main.shake(200, 0.01);
  }

  _onRedHerring(item, penalty) {
    this._showFloatingText(item.x, item.y - 20, `${penalty} CREDIBILITY`, '#FF6B00');
    this.cameras.main.shake(150, 0.01);
  }

  _onSpecial() {
    if (this._specialCooldown > 0) return;

    this._specialCooldown = this._specialMaxCooldown;
    this._drawSpecialBar(0);

    const special = this.charConfig.special;
    this._showFloatingText(this._playerSprite.x, this._playerSprite.y - 60,
      `${special.icon} ${special.name}!`, '#0D7377');

    this.cameras.main.flash(100, 13, 115, 119, true);

    // Execute character-specific ability
    switch (this.characterId) {
      case 'balen':
        this._abilityDemoMode();
        break;
      case 'aasika_tamang':
        this._evidenceSystem.activateViralPost();
        break;
      case 'mahabir_pun':
        this._bribeSystem.startMountainPatience();
        break;
      case 'punya_gautam':
        this._abilityBreakingStory();
        break;
      default:
        // Generic ability flash
        this.cameras.main.flash(300, 13, 115, 119, true);
    }
  }

  _abilityDemoMode() {
    // Smash any corruption bubbles on screen
    this._showFloatingText(this._playerSprite.x, this._playerSprite.y - 80,
      '💥 DEMO MODE ACTIVATED!', '#FF6B00');
    this.cameras.main.shake(400, 0.02);
    // Destroy all corruption bubbles
    if (this._corruptionBubbles) {
      this._corruptionBubbles.forEach(b => {
        if (b.active) {
          const ex = this.add.graphics();
          ex.fillStyle(0xFF6B00, 0.8);
          ex.fillCircle(b.x, b.y, 50);
          this.tweens.add({ targets: ex, alpha: 0, scaleX: 3, scaleY: 3, duration: 500, onComplete: () => ex.destroy() });
          b.destroy();
        }
      });
    }
  }

  _abilityBreakingStory() {
    // Freeze countermoves for 12s
    this._counterFrozen = true;
    setTimeout(() => { this._counterFrozen = false; }, 12000);
    this._showFloatingText(this._playerSprite.x, this._playerSprite.y - 80,
      '📰 COUNTERMOVES FROZEN 12s', '#C0392B');
  }

  _updateSpecialCooldown(delta) {
    if (this._specialCooldown > 0) {
      this._specialCooldown = Math.max(0, this._specialCooldown - delta);
      const pct = 1 - (this._specialCooldown / this._specialMaxCooldown);
      this._drawSpecialBar(pct);
    }
  }

  _onShield() {
    if (this._shieldActive) return;
    this._shieldActive = true;

    const shield = this.add.image(this._playerSprite.x, this._playerSprite.y, 'integrity_shield')
      .setAlpha(0.8).setDepth(50);

    this.tweens.add({ targets: shield, alpha: 0.4, duration: 200, yoyo: true, repeat: 4 });

    this._shieldTimer = this.time.delayedCall(2000, () => {
      this._shieldActive = false;
      shield.destroy();
    });

    this._showFloatingText(this._playerSprite.x, this._playerSprite.y - 60, '[F] SHIELD ACTIVE 2s', '#0D7377');
  }

  _onRejectBribe() {
    if (!this._bribeSystem.active) return;
    const rejected = this._bribeSystem.reject();
    if (rejected) {
      if (this._bribeUI) {
        this._bribeUI.destroy();
        this._bribeUI = null;
      }
    }
  }

  _updateBribeHold() {
    if (this._bribeSystem.active && this._keys.b.isDown && this._keys.enter.isDown) {
      this._bribeSystem.startAcceptHold();
    } else {
      this._bribeSystem.cancelAcceptHold();
    }
  }

  _onPublish() {
    if (!this._evidenceSystem.isComplete()) {
      this._showFloatingText(this._playerSprite.x, this._playerSprite.y - 60,
        '⚠️ Collect more evidence first!', '#E74C3C');
      return;
    }
    this._publishExpose();
  }

  _publishExpose() {
    const credibility = this._evidenceSystem.calculateCredibility();
    const levelConf = this.levelConfig;
    const charConf = this.charConfig;

    this.cameras.main.fadeOut(800, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this._player.completeCase(this.levelKey, levelConf.officialName, credibility);
      this.scene.start('CinematicScene', {
        playerName: this._player.name,
        characterId: this.characterId,
        officialName: levelConf.officialNameNP || levelConf.officialName,
        scandal: levelConf.scandalNP || levelConf.scandal,
        credibility,
        evidence: this._evidenceSystem.getValidCollected(),
        nextLevel: this._getNextLevel(),
      });
    });
  }

  _getNextLevel() {
    const order = ['tutorial', 'level1', 'level2', 'level3', 'level4', 'level5'];
    const idx = order.indexOf(this.levelKey);
    return idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null;
  }

  _onPause() {
    this._showPauseMenu();
  }

  _onToggleCaseFile() {
    if (this._caseFileOpen) {
      this._closeCaseFile();
    } else {
      this._openCaseFile();
    }
  }

  _openCaseFile() {
    this._caseFileOpen = true;
    const w = this.scale.width;
    const h = this.scale.height;

    this._caseFilePanel = this.add.graphics().setScrollFactor(0).setDepth(200);
    this._caseFilePanel.fillStyle(0x0D1117, 0.95);
    this._caseFilePanel.fillRoundedRect(w / 2 - 280, 60, 560, h - 120, 14);
    this._caseFilePanel.lineStyle(2, 0xFF6B00, 0.8);
    this._caseFilePanel.strokeRoundedRect(w / 2 - 280, 60, 560, h - 120, 14);

    this._caseFileTexts = [];
    const addText = (text, x, y, style) => {
      const t = this.add.text(x, y, text, style).setScrollFactor(0).setDepth(201);
      this._caseFileTexts.push(t);
    };

    addText('📁 CASE FILE', w / 2, 90, {
      fontFamily: '"Teko Bold", sans-serif', fontSize: '32px',
      color: '#FF6B00', stroke: '#000', strokeThickness: 2,
    }).then ? null : null;

    this.add.text(w / 2, 90, '📁 CASE FILE', {
      fontFamily: '"Teko Bold", sans-serif', fontSize: '32px', color: '#FF6B00',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

    this.add.text(w / 2, 130, `मुद्दा: ${this.levelConfig.scandalNP || this.levelConfig.scandal}`, {
      fontFamily: '"Mukta", sans-serif', fontSize: '18px', color: '#F1C40F',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

    this.add.text(w / 2, 160, `अधिकारी: ${this.levelConfig.officialNameNP || this.levelConfig.officialName}`, {
      fontFamily: '"Mukta", sans-serif', fontSize: '16px', color: '#CBD5E0',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201);

    // Evidence list
    const progress = this._evidenceSystem.getProgress();
    this.add.text(w / 2 - 240, 200, `📋 EVIDENCE (${progress.collected}/${progress.required}):`, {
      fontFamily: '"Teko Bold", sans-serif', fontSize: '18px', color: '#94A3B8',
    }).setScrollFactor(0).setDepth(201);

    this._evidenceSystem.collected.forEach((ev, i) => {
      const icon = ev.valid ? '✅' : '❌';
      const evType = ev.type === 'witness' ? '🎤' : ev.type === 'document' ? '📄' : ev.type === 'financial' ? '💰' : '📸';
      this.add.text(w / 2 - 240, 230 + i * 28, `${icon} ${evType} ${ev.label} — ${ev.labelNP || ''}`, {
        fontFamily: '"Mukta", sans-serif', fontSize: '14px', color: ev.valid ? '#FFFFFF' : '#E74C3C',
      }).setScrollFactor(0).setDepth(201);
    });

    // Credibility preview
    const credPct = this._evidenceSystem.calculateCredibility();
    this.add.text(w / 2 - 240, h - 160, `📊 Credibility Score: ${credPct}%`, {
      fontFamily: '"Teko Bold", sans-serif', fontSize: '20px', color: '#F1C40F',
    }).setScrollFactor(0).setDepth(201);

    this.add.text(w / 2, h - 100, '[TAB] Close Case File', {
      fontFamily: '"Mukta", sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.4)',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201);
  }

  _closeCaseFile() {
    this._caseFileOpen = false;
    if (this._caseFilePanel) {
      // Destroy all added UI elements with depth 200+
      this.children.list.filter(c => c.depth >= 200 && c.depth <= 202).forEach(c => c.destroy());
      this._caseFilePanel = null;
    }
  }

  // ============================================================
  // COUNTERMOVES
  // ============================================================
  _scheduleCountermoves() {
    const moves = this.levelConfig.countermoves || [];
    moves.forEach(cm => {
      this.time.delayedCall(cm.delay, () => {
        if (!this._counterFrozen) {
          this._triggerCountermove(cm);
        }
      });
    });
  }

  _triggerCountermove(cm) {
    if (cm.type === 'thugs') {
      this._spawnThugs(cm.duration);
    } else if (cm.type === 'misinformation_cloud') {
      this._spawnMisinfCloud(cm.duration);
    }
  }

  _spawnThugs(duration) {
    const h = this.scale.height;
    const px = this._playerSprite.x;

    // Spawn 2 thugs to slow player
    for (let i = 0; i < 2; i++) {
      const side = i === 0 ? -1 : 1;
      const tx = px + side * 200;
      const thug = this.physics.add.sprite(tx, h - 120, 'npc_thug');
      thug.setCollideWorldBounds(true);
      this.physics.add.collider(thug, this._platforms);

      // Move toward player
      const moveThug = () => {
        if (!thug.active) return;
        const dir = this._playerSprite.x > thug.x ? 1 : -1;
        thug.setVelocityX(dir * 100);
        thug.setFlipX(dir < 0);
      };

      const thugTimer = this.time.addEvent({ delay: 200, callback: moveThug, repeat: duration / 200 });

      // Overlap with player = slow down
      this.physics.add.overlap(thug, this._playerSprite, () => {
        this._playerSprite.setVelocityX(this._playerSprite.body.velocity.x * 0.3);
        this._showFloatingText(this._playerSprite.x, this._playerSprite.y - 40, '⚠️ SLOWED!', '#E74C3C');
      });

      this._thugs.push(thug);

      // Despawn after duration
      this.time.delayedCall(duration, () => {
        thugTimer.destroy();
        if (thug.active) {
          this.tweens.add({ targets: thug, alpha: 0, duration: 500, onComplete: () => thug.destroy() });
        }
      });
    }

    this._showFloatingText(this._playerSprite.x, this._playerSprite.y - 80,
      '⚠️ गुण्डाहरू आए! Hired thugs incoming!', '#E74C3C');
  }

  _spawnMisinfCloud(duration) {
    const w = this.scale.width;
    const h = this.scale.height;

    const cloud = this.add.graphics().setScrollFactor(0).setDepth(50);
    cloud.fillStyle(0x1A1A2E, 0.35);
    cloud.fillRect(0, 0, w * 0.3, h);

    this.time.delayedCall(duration, () => {
      this.tweens.add({ targets: cloud, alpha: 0, duration: 1000, onComplete: () => cloud.destroy() });
    });
  }

  _updateCountermoves(delta) {
    // Move thugs toward player (handled by timer above)
  }

  // ============================================================
  // BRIBE SYSTEM
  // ============================================================
  _setupBribeSystem() {
    const briberDelay = 25000 + Phaser.Math.Between(0, 10000);
    this.time.delayedCall(briberDelay, () => {
      if (!this._evidenceSystem.isComplete()) {
        this._offerBribe();
      }
    });
  }

  _offerBribe() {
    const amounts = [500, 2000, 5000];
    const amount = amounts[Math.floor(Math.random() * amounts.length)];
    const bribeInfo = this._bribeSystem.offerBribe(amount);
    if (!bribeInfo) return;

    const w = this.scale.width;
    const h = this.scale.height;

    // Bribe UI panel
    const panel = this.add.graphics().setScrollFactor(0).setDepth(150);
    panel.fillStyle(0x1A1A2E, 0.97);
    panel.fillRoundedRect(w / 2 - 220, h / 2 - 120, 440, 240, 14);
    panel.lineStyle(3, 0xF1C40F, 1);
    panel.strokeRoundedRect(w / 2 - 220, h / 2 - 120, 440, 240, 14);

    const envelope = this.add.image(w / 2, h / 2 - 60, 'bribe_envelope').setScrollFactor(0).setDepth(151);
    this.tweens.add({ targets: envelope, rotation: 0.05, duration: 400, yoyo: true, repeat: -1 });

    const msg = bribeInfo.message;
    const msgText = this.add.text(w / 2, h / 2 + 10, msg.np, {
      fontFamily: '"Mukta", sans-serif', fontSize: '16px', color: '#FFFFFF',
      wordWrap: { width: 380 }, align: 'center',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(151);

    const msgEN = this.add.text(w / 2, h / 2 + 40, msg.en, {
      fontFamily: '"Mukta", sans-serif', fontSize: '13px', color: 'rgba(255,255,255,0.6)',
      wordWrap: { width: 380 }, align: 'center',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(151);

    const rejectHint = this.add.text(w / 2, h / 2 + 80, '[B] REJECT BRIBE — Protect your integrity!', {
      fontFamily: '"Teko Bold", sans-serif', fontSize: '18px', color: '#FF6B00',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(151);

    this.tweens.add({ targets: rejectHint, scaleX: 1.05, scaleY: 1.05, duration: 400, yoyo: true, repeat: -1 });

    const bribeContainer = this.add.container(0, 0, [panel, envelope, msgText, msgEN, rejectHint]);
    this._bribeUI = { container: bribeContainer, items: [panel, envelope, msgText, msgEN, rejectHint] };

    // Auto-dismiss after 8s with integrity pressure
    this.time.delayedCall(8000, () => {
      if (this._bribeSystem.active) {
        this._bribeSystem.takePressureDamage(10);
        this._bribeSystem.active = false;
        bribeContainer.destroy();
        this._bribeUI = null;
      }
    });
  }

  _onBribeReject(msg, insult) {
    if (this._bribeUI) {
      this._bribeUI.items.forEach(i => {
        if (i && i.destroy) {
          this.tweens.add({ targets: i, alpha: 0, duration: 300, onComplete: () => i.destroy() });
        }
      });
      this._bribeUI = null;
    }

    const w = this.scale.width;
    const h = this.scale.height;

    // Dramatic reject animation
    const rejectText = this.add.text(w / 2, h / 2, `${insult.np}`, {
      fontFamily: '"Bangers", cursive', fontSize: '48px', color: '#F1C40F',
      stroke: '#000', strokeThickness: 6,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200);

    const rejectEN = this.add.text(w / 2, h / 2 + 55, `"${insult.en}"`, {
      fontFamily: '"Mukta", sans-serif', fontSize: '20px', color: '#FFFFFF',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200);

    this.cameras.main.flash(200, 241, 196, 15, true);
    this.cameras.main.shake(300, 0.015);

    // Integrity pulse gold
    this._integrityBar.setAlpha(1);
    this.tweens.add({
      targets: this._integrityBar, alpha: 0.3, duration: 200,
      yoyo: true, repeat: 3, onComplete: () => this._integrityBar.setAlpha(1),
    });

    this.tweens.add({
      targets: [rejectText, rejectEN], y: '-=60', alpha: 0,
      duration: 1500, delay: 500, onComplete: () => { rejectText.destroy(); rejectEN.destroy(); },
    });

    if (this.isTutorial) this._advanceTutorial('bribe');
  }

  // ============================================================
  // TIMER
  // ============================================================
  _tickTimer() {
    if (!this._timeRemaining) return;
    this._timeRemaining -= 1000;
    const minutes = Math.floor(this._timeRemaining / 60000);
    const seconds = Math.floor((this._timeRemaining % 60000) / 1000);
    const timeStr = `⏱ ${minutes}:${seconds.toString().padStart(2, '0')}`;

    if (this._timerText) {
      this._timerText.setText(timeStr);
      if (this._timeRemaining <= 30000) {
        this._timerText.setStyle({ color: '#E74C3C' });
      }
    }

    if (this._timeRemaining <= 0) {
      this._timerEvent.destroy();
      if (!this._evidenceSystem.isComplete()) {
        this._gameOver('timeout');
      }
    }
  }

  // ============================================================
  // GAME OVER
  // ============================================================
  _gameOver(reason) {
    this.cameras.main.fadeOut(600, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('ResultScene', {
        success: false,
        reason,
        levelKey: this.levelKey,
        characterId: this.characterId,
        evidenceCollected: this._evidenceSystem.getValidCollected(),
        credibility: this._evidenceSystem.calculateCredibility(),
      });
    });
  }

  // ============================================================
  // PAUSE MENU
  // ============================================================
  _showPauseMenu() {
    const w = this.scale.width;
    const h = this.scale.height;

    this.physics.pause();

    const overlay = this.add.graphics().setScrollFactor(0).setDepth(300);
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, w, h);

    this.add.text(w / 2, h / 2 - 80, 'PAUSED', {
      fontFamily: '"Teko Bold", sans-serif', fontSize: '64px', color: '#FFFFFF',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    const resumeBtn = this.add.text(w / 2, h / 2 + 20, '▶ RESUME', {
      fontFamily: '"Teko Bold", sans-serif', fontSize: '28px',
      color: '#FF6B00', backgroundColor: '#1A1A2E', padding: { x: 24, y: 12 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301).setInteractive({ useHandCursor: true });

    resumeBtn.on('pointerdown', () => {
      overlay.destroy();
      resumeBtn.destroy();
      quitBtn.destroy();
      this.physics.resume();
    });

    const quitBtn = this.add.text(w / 2, h / 2 + 90, '🏠 MAIN MENU', {
      fontFamily: '"Teko Bold", sans-serif', fontSize: '22px',
      color: '#94A3B8', padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301).setInteractive({ useHandCursor: true });

    quitBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(400);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MainMenuScene');
      });
    });
  }

  // ============================================================
  // FLOATING TEXT HELPER
  // ============================================================
  _showFloatingText(x, y, text, color = '#FFFFFF') {
    const t = this.add.text(x, y, text, {
      fontFamily: '"Bangers", cursive',
      fontSize: '20px',
      color,
      stroke: '#000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(80);

    this.tweens.add({
      targets: t, y: y - 60, alpha: 0, duration: 1200,
      onComplete: () => t.destroy(),
    });
  }

  // ============================================================
  // TUTORIAL SYSTEM (overridden by TutorialScene)
  // ============================================================
  _setupTutorial() {}
  _updateTutorial() {}
  _advanceTutorial(step) {}

  // ============================================================
  // CUTSCENE
  // ============================================================
  _playCutscene() {
    const cs = this.levelConfig.cutscene;
    if (!cs) return;

    this.physics.pause();

    const w = this.scale.width;
    const h = this.scale.height;

    const overlay = this.add.graphics().setScrollFactor(0).setDepth(500);
    overlay.fillStyle(0x000000, 0.9);
    overlay.fillRect(0, 0, w, h);

    const cutText = this.add.text(w / 2, h / 2, cs.textNP, {
      fontFamily: '"Mukta", sans-serif', fontSize: '28px', color: '#FFFFFF',
      align: 'center', wordWrap: { width: w - 100 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(501).setAlpha(0);

    const cutEN = this.add.text(w / 2, h / 2 + 60, cs.text, {
      fontFamily: '"Mukta", sans-serif', fontSize: '18px', color: 'rgba(255,255,255,0.6)',
      align: 'center', wordWrap: { width: w - 100 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(501).setAlpha(0);

    this.tweens.add({ targets: [cutText, cutEN], alpha: 1, duration: 1000, delay: 500 });
    this.tweens.add({
      targets: [overlay, cutText, cutEN],
      alpha: 0,
      duration: 800,
      delay: cs.duration - 800,
      onComplete: () => {
        overlay.destroy(); cutText.destroy(); cutEN.destroy();
        this.physics.resume();
      },
    });
  }
}
