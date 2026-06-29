// ============================================================
// PARDA FAAS — Main Entry Point
// Phaser 3 game initialization
// ============================================================

import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import MainMenuScene from './scenes/MainMenuScene.js';
import TutorialScene from './scenes/TutorialScene.js';
import Level1Scene from './scenes/Level1Scene.js';
import LevelSelectScene from './scenes/LevelSelectScene.js';
import CinematicScene from './scenes/CinematicScene.js';
import ResultScene from './scenes/ResultScene.js';

// Game dimensions
const GAME_WIDTH = 960;
const GAME_HEIGHT = 600;

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#1A1A2E',
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // Set per-scene
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    min: {
      width: 480,
      height: 300,
    },
    max: {
      width: 1920,
      height: 1200,
    },
  },
  scene: [
    BootScene,
    MainMenuScene,
    TutorialScene,
    Level1Scene,
    LevelSelectScene,
    CinematicScene,
    ResultScene,
  ],
  render: {
    antialias: false,
    pixelArt: false,
    roundPixels: true,
  },
  dom: {
    createContainer: true,
  },
  audio: {
    disableWebAudio: false,
  },
};

// Create game instance
const game = new Phaser.Game(config);

// Handle visibility change (streak system hook)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    // Player returned — potential streak warning
    console.log('[Parda Faas] Player returned to tab');
  }
});

// Prevent context menu on right-click in game
document.getElementById('game-container').addEventListener('contextmenu', (e) => {
  e.preventDefault();
});

export default game;
