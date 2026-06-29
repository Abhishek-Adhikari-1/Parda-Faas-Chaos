// ============================================================
// PARDA FAAS — Bribe System
// Status-framed bribe offers, reject mechanic, integrity tracking
// ============================================================

import STRINGS from '../config/strings.js';

export class BribeSystem {
  constructor(scene) {
    this.scene = scene;
    this.integrity = 100;
    this.bribesRejected = 0;
    this.bribesOffered = 0;
    this.active = false;
    this.holdStartTime = null;
    this.HOLD_DURATION = 3000; // hold B+Enter for 3s to accidentally accept
    this.onReject = null;
    this.onAccept = null;
    this.onIntegrityChange = null;
    this._regenInterval = null;
  }

  offerBribe(amount) {
    if (this.active) return;
    this.active = true;
    this.bribesOffered += 1;
    const insultPool = STRINGS.bribe;
    const msg = insultPool[Math.floor(Math.random() * insultPool.length)];
    return {
      amount,
      message: msg.insult,
      // Reduce integrity slightly just from being offered (pressure)
      pressureDamage: 5,
    };
  }

  reject() {
    if (!this.active) return false;
    this.active = false;
    this.bribesRejected += 1;
    this.holdStartTime = null;

    const rejectMsg = STRINGS.briberRejectText;
    const insult = STRINGS.briberRejectInsult[
      Math.floor(Math.random() * STRINGS.briberRejectInsult.length)
    ];

    // Integrity bonus for rejecting
    this.integrity = Math.min(100, this.integrity + 10);
    if (this.onIntegrityChange) this.onIntegrityChange(this.integrity);
    if (this.onReject) this.onReject(rejectMsg, insult);
    return true;
  }

  startAcceptHold() {
    if (!this.active) return;
    this.holdStartTime = Date.now();
  }

  updateAcceptHold() {
    if (!this.active || !this.holdStartTime) return null;
    const elapsed = Date.now() - this.holdStartTime;
    const progress = Math.min(1, elapsed / this.HOLD_DURATION);
    if (elapsed >= this.HOLD_DURATION) {
      return this._accept();
    }
    return { progress, remaining: this.HOLD_DURATION - elapsed };
  }

  cancelAcceptHold() {
    this.holdStartTime = null;
  }

  _accept() {
    if (!this.active) return null;
    this.active = false;
    this.holdStartTime = null;
    // Heavy integrity penalty
    this.integrity = Math.max(0, this.integrity - 40);
    if (this.onIntegrityChange) this.onIntegrityChange(this.integrity);
    if (this.onAccept) this.onAccept();
    return { accepted: true };
  }

  takePressureDamage(amount = 5) {
    this.integrity = Math.max(0, this.integrity - amount);
    if (this.onIntegrityChange) this.onIntegrityChange(this.integrity);
  }

  /** Mahabir Pun special: regenerate integrity */
  startMountainPatience() {
    if (this._regenInterval) clearInterval(this._regenInterval);
    this._regenInterval = setInterval(() => {
      if (this.integrity < 100) {
        this.integrity = Math.min(100, this.integrity + 2);
        if (this.onIntegrityChange) this.onIntegrityChange(this.integrity);
      }
    }, 500);
    // Stop after 15s
    setTimeout(() => {
      if (this._regenInterval) clearInterval(this._regenInterval);
    }, 15000);
  }

  isIntegrityZero() { return this.integrity <= 0; }
  get currentIntegrity() { return this.integrity; }
}
