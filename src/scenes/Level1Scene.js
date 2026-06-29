// ============================================================
// PARDA FAAS — Level 1 Scene
// Ward Councillor — full platformer experience
// ============================================================

import GameScene from './GameScene.js';

export default class Level1Scene extends GameScene {
  constructor() {
    super('Level1Scene');
    this.levelKey = 'level1';
  }

  init(data) {
    super.init(data);
    this.levelKey = 'level1';
    this.isTutorial = false;
  }
}
