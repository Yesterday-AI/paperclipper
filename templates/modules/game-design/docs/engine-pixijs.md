# Engine Guide: PixiJS

PixiJS is a fast 2D rendering engine (not a full game framework). Use it for: games where you want full control over the game loop, custom physics, or non-standard rendering. Also great for interactive visualizations, animated UIs, and creative coding. Runs on WebGL/WebGPU with Canvas fallback.

PixiJS handles rendering. You build the game loop, physics, input handling, and scene management yourself (or bring a library).

## Project Setup

```bash
npm init -y && npm install pixi.js
```

## Core Architecture

### Application and Game Loop

```javascript
import { Application, Assets, Sprite, Ticker } from 'pixi.js';

const app = new Application();
await app.init({
  width: 800,
  height: 600,
  backgroundColor: 0x1099bb,
  antialias: true,
  resolution: window.devicePixelRatio,
  preference: 'webgl',  // or 'webgpu'
});

document.body.appendChild(app.canvas);

// Game loop via ticker
app.ticker.add((ticker) => {
  // ticker.deltaTime = dimensionless scalar (~1.0 at 60fps)
  // ticker.deltaMS = milliseconds since last frame
  update(ticker.deltaTime);
});
```

### Display Objects and Scene Graph

PixiJS uses a tree of display objects. `app.stage` is the root container.

```javascript
import { Container, Sprite, Graphics, Text } from 'pixi.js';

// Containers group display objects
const gameWorld = new Container();
const uiLayer = new Container();
app.stage.addChild(gameWorld);
app.stage.addChild(uiLayer);  // UI renders on top

// Sprites
const texture = await Assets.load('player.png');
const player = new Sprite(texture);
player.anchor.set(0.5);  // center origin
player.x = 400;
player.y = 300;
gameWorld.addChild(player);

// Graphics (primitives)
const rect = new Graphics();
rect.rect(0, 0, 50, 50);
rect.fill(0xff0000);
gameWorld.addChild(rect);

// Text
const scoreText = new Text({ text: 'Score: 0', style: { fontSize: 24, fill: 0xffffff } });
uiLayer.addChild(scoreText);
```

### Asset Loading

```javascript
import { Assets, Spritesheet } from 'pixi.js';

// Single asset
const texture = await Assets.load('bunny.png');

// Multiple assets
const textures = await Assets.load(['player.png', 'enemy.png', 'tileset.png']);

// Asset bundles (recommended for larger games)
Assets.addBundle('game', {
  player: 'assets/player.png',
  enemy: 'assets/enemy.png',
  tileset: 'assets/tileset.png',
  spritesheet: 'assets/sprites.json',
});
const assets = await Assets.loadBundle('game');

// Background loading with progress
Assets.loadBundle('game', (progress) => {
  console.log(`Loading: ${Math.round(progress * 100)}%`);
});
```

### Spritesheet Animations

```javascript
import { AnimatedSprite, Assets, Texture } from 'pixi.js';

// Load spritesheet (JSON + PNG)
await Assets.load('spritesheet.json');

// Create frames array
const frames = [];
for (let i = 0; i < 8; i++) {
  frames.push(Texture.from(`walk_${i.toString().padStart(4, '0')}.png`));
}

const animation = new AnimatedSprite(frames);
animation.anchor.set(0.5);
animation.animationSpeed = 0.15;  // speed multiplier
animation.loop = true;
animation.play();

// Events
animation.onComplete = () => { /* non-looping animation finished */ };
animation.onFrameChange = (frame) => { /* trigger SFX on specific frames */ };

// Controls
animation.gotoAndPlay(0);   // restart
animation.gotoAndStop(3);   // freeze on frame
animation.stop();

gameWorld.addChild(animation);
```

### Input Handling

PixiJS has pointer events on display objects. For keyboard, use the browser directly.

```javascript
// Pointer events on sprites
sprite.eventMode = 'static';  // enable interaction
sprite.cursor = 'pointer';
sprite.on('pointerdown', (event) => { /* click/tap */ });
sprite.on('pointerover', () => { /* hover */ });

// Keyboard (browser API — build your own input manager)
const keys = {};
window.addEventListener('keydown', (e) => { keys[e.code] = true; });
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

// In game loop
function update(dt) {
  if (keys['ArrowLeft']) player.x -= SPEED * dt;
  if (keys['ArrowRight']) player.x += SPEED * dt;
  if (keys['Space']) jump();
}
```

### Ticker (Game Loop) Control

```javascript
import { Ticker, UPDATE_PRIORITY } from 'pixi.js';

// Priority-based updates (higher priority runs first)
app.ticker.add((ticker) => {
  physics.update(ticker.deltaTime);
}, undefined, UPDATE_PRIORITY.HIGH);

app.ticker.add((ticker) => {
  render(ticker.deltaTime);
}, undefined, UPDATE_PRIORITY.NORMAL);

// Speed control (slow motion / fast forward)
app.ticker.speed = 0.5;  // half speed
app.ticker.speed = 2.0;  // double speed

// Cap minimum FPS (prevents huge delta spikes on tab-away)
app.ticker.minFPS = 30;
```

## Building a Game with PixiJS

Since PixiJS is a renderer, you need to build or bring these yourself:

### Scene Manager Pattern

```javascript
class SceneManager {
  constructor(app) {
    this.app = app;
    this.currentScene = null;
  }

  switchTo(SceneClass, data = {}) {
    if (this.currentScene) {
      this.app.ticker.remove(this.currentScene.update, this.currentScene);
      this.currentScene.destroy();
      this.app.stage.removeChild(this.currentScene.container);
    }
    this.currentScene = new SceneClass(this.app, this, data);
    this.app.stage.addChild(this.currentScene.container);
    this.app.ticker.add(this.currentScene.update, this.currentScene);
  }
}

class GameScene {
  constructor(app, manager, data) {
    this.container = new Container();
    this.manager = manager;
    // set up game objects...
  }
  update(ticker) { /* game loop */ }
  destroy() { this.container.destroy({ children: true }); }
}
```

### Simple AABB Collision

```javascript
function intersects(a, b) {
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}

// In update loop
for (const enemy of enemies) {
  if (intersects(player.getBounds(), enemy.getBounds())) {
    handleCollision(player, enemy);
  }
}
```

### Camera (Viewport) Pattern

```javascript
// Use a container as the "world" and move it to simulate camera
const world = new Container();
app.stage.addChild(world);

function updateCamera(target) {
  world.x = -target.x + app.screen.width / 2;
  world.y = -target.y + app.screen.height / 2;
}
```

## Project Structure Convention

```
src/
├── scenes/
│   ├── MenuScene.js
│   ├── GameScene.js
│   └── GameOverScene.js
├── objects/
│   ├── Player.js
│   └── Enemy.js
├── systems/
│   ├── InputManager.js    # Keyboard/pointer state
│   ├── SceneManager.js    # Scene switching
│   ├── Physics.js         # Collision detection
│   └── Camera.js          # Viewport management
├── config/
│   └── constants.js       # Tuning parameters
└── main.js                # App init, asset loading, scene start
```

## Tuning Parameters Pattern

```javascript
export const PLAYER = {
  SPEED: 5,            // pixels per frame at 60fps
  JUMP_FORCE: -12,
  GRAVITY: 0.5,
  MAX_FALL_SPEED: 10,
};
```

## Performance Notes

- PixiJS is extremely fast — thousands of sprites at 60fps
- Use spritesheets/texture atlases to reduce draw calls (TexturePacker, free-tex-packer)
- `Container.cacheAsChild = true` for complex static containers (renders to texture)
- Use `ParticleContainer` for large numbers of simple sprites (limited features, big perf gain)
- Destroy textures and display objects when done: `sprite.destroy({ texture: true })`
- `app.ticker.minFPS = 30` prevents huge delta spikes when tab is backgrounded

## Useful Companion Libraries

- **bump.js** or custom AABB — collision detection
- **pixi-viewport** — camera/viewport with pan, zoom, follow
- **pixi-sound** — audio playback (PixiJS has no built-in audio)
- **pixi-filters** — blur, glow, outline, displacement, and other shader effects
