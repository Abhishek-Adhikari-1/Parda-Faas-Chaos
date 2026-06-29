// ============================================================
// PARDA FAAS — Character Loader
// Dynamically loads spritesheets with fallback to procedural sprites
// ============================================================

export class CharacterLoader {
  /**
   * Register all character assets in Phaser's loader.
   * Falls back to placeholder if file doesn't exist.
   */
  static preloadAll(scene, characters) {
    characters.forEach(charId => {
      const states = ['idle', 'run', 'attack', 'hit', 'win'];
      states.forEach(state => {
        const key = `${charId}_${state}`;
        const path = `assets/characters/${charId}/${state}.png`;
        // Phaser will load; if missing, onFileError handles it
        scene.load.image(key, path);
      });
      // Portrait
      scene.load.image(`${charId}_portrait`, `assets/characters/${charId}/portrait.png`);
    });
  }

  /**
   * Generate a fallback placeholder texture for a character
   * using Phaser's Graphics API (colored rectangle with initials)
   */
  static createFallbackTexture(scene, charId, charConfig) {
    const key = `${charId}_placeholder`;
    if (scene.textures.exists(key)) return key;

    const color = parseInt(charConfig.color.replace('#', ''), 16);
    const color2 = parseInt((charConfig.color2 || '#333333').replace('#', ''), 16);

    const gfx = scene.make.graphics({ x: 0, y: 0, add: false });
    // Body
    gfx.fillStyle(color, 1);
    gfx.fillRoundedRect(8, 20, 48, 56, 8);
    // Head
    gfx.fillStyle(0xFFDDAA, 1);
    gfx.fillCircle(32, 18, 18);
    // Outline
    gfx.lineStyle(3, 0x000000, 1);
    gfx.strokeCircle(32, 18, 18);
    gfx.strokeRoundedRect(8, 20, 48, 56, 8);
    // Eyes
    gfx.fillStyle(0x000000, 1);
    gfx.fillCircle(26, 16, 3);
    gfx.fillCircle(38, 16, 3);
    // Smile
    gfx.lineStyle(2, 0x000000, 1);
    gfx.beginPath();
    gfx.arc(32, 20, 6, 0.2, Math.PI - 0.2, false);
    gfx.strokePath();
    // Accent strip (archetype color)
    gfx.fillStyle(color2, 1);
    gfx.fillRect(10, 52, 44, 8);

    gfx.generateTexture(key, 64, 80);
    gfx.destroy();
    return key;
  }

  /**
   * Create a portrait placeholder for the character select screen
   */
  static createPortraitTexture(scene, charId, charConfig) {
    const key = `${charId}_portrait_fallback`;
    if (scene.textures.exists(key)) return key;

    const color = parseInt(charConfig.color.replace('#', ''), 16);
    const w = 160, h = 200;

    const gfx = scene.make.graphics({ x: 0, y: 0, add: false });

    // Background gradient-like box
    gfx.fillStyle(color, 0.3);
    gfx.fillRoundedRect(0, 0, w, h, 16);
    gfx.fillStyle(color, 1);
    gfx.fillRoundedRect(4, 4, w - 8, 80, 12);

    // Head silhouette
    gfx.fillStyle(0xFFDDAA, 1);
    gfx.fillCircle(w / 2, 44, 36);
    // Outline
    gfx.lineStyle(4, 0x000000, 1);
    gfx.strokeCircle(w / 2, 44, 36);

    // Body
    gfx.fillStyle(color, 1);
    gfx.fillRoundedRect(w / 2 - 30, 80, 60, 70, 6);
    gfx.lineStyle(3, 0x000000, 1);
    gfx.strokeRoundedRect(w / 2 - 30, 80, 60, 70, 6);

    // Eyes
    gfx.fillStyle(0x000000, 1);
    gfx.fillCircle(w / 2 - 12, 40, 4);
    gfx.fillCircle(w / 2 + 12, 40, 4);
    // Eye whites
    gfx.fillStyle(0xFFFFFF, 1);
    gfx.fillCircle(w / 2 - 12, 40, 2);
    gfx.fillCircle(w / 2 + 12, 40, 2);

    // Name area
    gfx.fillStyle(0x1A1A2E, 0.8);
    gfx.fillRoundedRect(4, h - 56, w - 8, 52, { bl: 14, br: 14, tl: 0, tr: 0 });

    gfx.generateTexture(key, w, h);
    gfx.destroy();
    return key;
  }

  /**
   * Returns the valid texture key for a character + state
   * Falls back to placeholder if real asset not loaded
   */
  static getTextureKey(scene, charId, state = 'idle') {
    const realKey = `${charId}_${state}`;
    if (scene.textures.exists(realKey) && scene.textures.get(realKey).key !== '__MISSING') {
      return realKey;
    }
    const fallback = `${charId}_placeholder`;
    if (scene.textures.exists(fallback)) return fallback;
    return '__MISSING';
  }

  static getPortraitKey(scene, charId) {
    const realKey = `${charId}_portrait`;
    if (scene.textures.exists(realKey) && scene.textures.get(realKey).key !== '__MISSING') {
      return realKey;
    }
    const fallback = `${charId}_portrait_fallback`;
    if (scene.textures.exists(fallback)) return fallback;
    return '__MISSING';
  }
}
