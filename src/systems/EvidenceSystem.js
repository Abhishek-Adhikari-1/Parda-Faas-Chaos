// ============================================================
// PARDA FAAS — Evidence System
// Handles collection, validation, red herring detection
// ============================================================

import { RAPID_EVIDENCE_CHAIN } from '../config/controls.js';

export class EvidenceSystem {
  constructor(scene, levelConfig) {
    this.scene = scene;
    this.config = levelConfig;
    this.collected = [];
    this.required = levelConfig.requiredEvidence;
    this.credibilityMultiplier = 1;
    this.multiplierTimer = null;
    this.evidenceChainBuffer = [];
    this.chainTimer = null;
    this.onCollect = null;
    this.onComplete = null;
    this.onRedHerring = null;
  }

  collect(evidenceId) {
    const pool = [...(this.config.evidencePool || []), ...(this.config.redHerrings || [])];
    const item = pool.find(e => e.id === evidenceId);
    if (!item) return false;
    if (this.collected.find(e => e.id === evidenceId)) return false; // already collected

    this.collected.push(item);

    if (!item.valid) {
      // Red herring
      const penalty = item.penalty || -10;
      if (this.onRedHerring) this.onRedHerring(item, penalty);
      return 'redherring';
    }

    // Track for rapid evidence chain combo
    this._trackChain('INTERACT');

    if (this.onCollect) this.onCollect(item, this.getProgress());

    if (this.isComplete()) {
      if (this.onComplete) this.onComplete();
    }

    return 'valid';
  }

  _trackChain(action) {
    const now = Date.now();
    this.evidenceChainBuffer.push({ action, time: now });

    // Trim old entries outside time window
    this.evidenceChainBuffer = this.evidenceChainBuffer.filter(
      e => now - e.time < RAPID_EVIDENCE_CHAIN.timeWindow
    );

    // Check sequence
    const seq = RAPID_EVIDENCE_CHAIN.sequence;
    const buf = this.evidenceChainBuffer.map(e => e.action);

    if (buf.length >= seq.length) {
      const lastN = buf.slice(-seq.length);
      if (JSON.stringify(lastN) === JSON.stringify(seq)) {
        this._triggerRapidChain();
        this.evidenceChainBuffer = [];
      }
    }
  }

  triggerSpecialAction() {
    this._trackChain('SPECIAL');
  }

  _triggerRapidChain() {
    this.credibilityMultiplier = RAPID_EVIDENCE_CHAIN.multiplier;
    if (this.multiplierTimer) clearTimeout(this.multiplierTimer);
    this.multiplierTimer = setTimeout(() => {
      this.credibilityMultiplier = 1;
    }, 3000);

    if (this.scene && this.scene.events) {
      this.scene.events.emit('rapidEvidenceChain');
    }
  }

  activateViralPost() {
    // Aasika's special: ×2 evidence value for 8s
    this.credibilityMultiplier = 2;
    setTimeout(() => { this.credibilityMultiplier = 1; }, 8000);
  }

  getValidCollected() {
    return this.collected.filter(e => e.valid);
  }

  getProgress() {
    return {
      collected: this.getValidCollected().length,
      required: this.required,
      percent: Math.min(100, (this.getValidCollected().length / this.required) * 100),
    };
  }

  isComplete() {
    return this.getValidCollected().length >= this.required;
  }

  calculateCredibility() {
    let base = 0;
    for (const e of this.getValidCollected()) {
      base += (e.weight || 1) * 10;
    }
    // Penalties for red herrings
    for (const e of this.collected.filter(e => !e.valid)) {
      base += (e.penalty || -10);
    }
    return Math.max(0, Math.min(100, Math.floor(base * this.credibilityMultiplier)));
  }

  getEvidenceTypes() {
    const types = {};
    for (const e of this.getValidCollected()) {
      types[e.type] = (types[e.type] || 0) + 1;
    }
    return types;
  }
}
