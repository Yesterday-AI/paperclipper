# Engine Guide: Phaser

Phaser is a 2D HTML5 game framework. Use it for: platformers, top-down RPGs, puzzle games, arcade games, visual novels — anything 2D that runs in the browser.

## Project Setup

```bash
npm create @phaserjs/game@latest my-game
cd my-game && npm install
```

Or manually:

```bash
npm init -y && npm install phaser
```

Minimal game entry:

```javascript
import Phaser from 'phaser';

const config = {
  type: Phaser.AUTO,           // WebGL with Canvas fallback
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 300 }, debug: false }
  },
  scene: { preload, create, update }
};

const game = new Phaser.Game(config);
```

## Core Architecture

### Scenes

Scenes are the fundamental organizational unit. Every screen (menu, gameplay, pause, game over) is a Scene.

```javascript
class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  preload() {
    this.load.image('sky', 'assets/sky.png');
    this.load.spritesheet('player', 'assets/player.png', {
      frameWidth: 32, frameHeight: 48
    });
  }

  create() {
    this.add.image(400, 300, 'sky');
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play('left', true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play('right', true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play('idle', true);
    }
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
    }
  }
}
```

Scene transitions:

```javascript
this.scene.start('GameOverScene', { score: this.score });  // switch scene
this.scene.launch('PauseScene');   // run in parallel (overlay)
this.scene.pause();                // pause this scene
this.scene.resume('GameScene');    // resume a paused scene
```

### Physics

**Arcade** — fast, AABB-only. Use for most 2D games.

```javascript
// Static group (platforms, walls)
const platforms = this.physics.add.staticGroup();
platforms.create(400, 568, 'ground').setScale(2).refreshBody();

// Dynamic sprites
const player = this.physics.add.sprite(100, 450, 'player');
player.setBounce(0.2);
player.setCollideWorldBounds(true);

// Collisions
this.physics.add.collider(player, platforms);

// Overlap (pickup items)
this.physics.add.overlap(player, stars, collectStar, null, this);

function collectStar(player, star) {
  star.disableBody(true, true);  // remove from physics + hide
  score += 10;
}
```

**Matter** — full rigid body physics with polygons, constraints, joints. Use when you need realistic physics (ragdolls, chains, complex shapes).

```javascript
const config = {
  physics: {
    default: 'matter',
    matter: { gravity: { y: 1 }, debug: true }
  }
};

// Matter body
const box = this.matter.add.image(400, 200, 'box');
box.setFriction(0.005);
box.setBounce(0.6);
```

### Animations

```javascript
this.anims.create({
  key: 'walk',
  frames: this.anims.generateFrameNumbers('player', { start: 0, end: 7 }),
  frameRate: 10,
  repeat: -1    // -1 = loop forever
});

this.anims.create({
  key: 'idle',
  frames: [{ key: 'player', frame: 4 }],
  frameRate: 20
});

sprite.anims.play('walk', true);  // true = ignore if already playing
sprite.on('animationcomplete', (anim) => { /* ... */ });
```

### Tilemaps

```javascript
preload() {
  this.load.tilemapTiledJSON('map', 'assets/map.json');  // Tiled editor export
  this.load.image('tiles', 'assets/tileset.png');
}

create() {
  const map = this.make.tilemap({ key: 'map' });
  const tileset = map.addTilesetImage('tileset-name', 'tiles');
  const ground = map.createLayer('Ground', tileset);
  const walls = map.createLayer('Walls', tileset);

  walls.setCollisionByProperty({ collides: true });
  this.physics.add.collider(this.player, walls);

  // Object layer spawn points
  const spawnPoint = map.findObject('Objects', obj => obj.name === 'Spawn');
  this.player.setPosition(spawnPoint.x, spawnPoint.y);
}
```

### Input

```javascript
// Keyboard
const cursors = this.input.keyboard.createCursorKeys();
const wasd = this.input.keyboard.addKeys('W,A,S,D');
const space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

// Pointer (mouse + touch)
this.input.on('pointerdown', (pointer) => {
  console.log(pointer.x, pointer.y, pointer.button);
});

// Gamepad
this.input.gamepad.on('connected', (pad) => { /* ... */ });
```

### Camera

```javascript
this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
this.cameras.main.setZoom(2);
this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
this.cameras.main.fadeIn(500);
```

### Audio

```javascript
preload() {
  this.load.audio('bgm', 'assets/music.ogg');
  this.load.audio('jump', 'assets/jump.wav');
}

create() {
  this.bgm = this.sound.add('bgm', { loop: true, volume: 0.5 });
  this.bgm.play();

  this.jumpSfx = this.sound.add('jump');
}

// Play on event
this.jumpSfx.play();
```

### Groups

```javascript
const enemies = this.physics.add.group({
  key: 'enemy',
  repeat: 5,
  setXY: { x: 100, y: 0, stepX: 120 }
});

enemies.children.iterate((child) => {
  child.setBounceY(Phaser.Math.FloatBetween(0.2, 0.4));
});
```

## Project Structure Convention

```
src/
├── scenes/
│   ├── BootScene.js       # Asset loading
│   ├── MenuScene.js       # Title screen
│   ├── GameScene.js       # Main gameplay
│   └── GameOverScene.js   # End screen
├── objects/
│   ├── Player.js          # Player class extending Phaser.Physics.Arcade.Sprite
│   └── Enemy.js
├── config/
│   └── constants.js       # Tuning parameters (speeds, gravity, scores)
└── main.js                # Game config + scene registration
```

## Tuning Parameters Pattern

Expose all balance values as importable constants — never hardcode in game logic:

```javascript
// config/constants.js
export const PLAYER = {
  SPEED: 160,
  JUMP_VELOCITY: -330,
  BOUNCE: 0.2,
};

export const ENEMIES = {
  SPEED: 80,
  SPAWN_INTERVAL: 3000,
};
```

## Common Patterns

### State machine for player/enemy states

```javascript
class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.state = 'idle';
  }

  update(cursors) {
    switch (this.state) {
      case 'idle': this.handleIdle(cursors); break;
      case 'running': this.handleRunning(cursors); break;
      case 'jumping': this.handleJumping(cursors); break;
      case 'hurt': this.handleHurt(); break;
    }
  }
}
```

### Scene data passing

```javascript
// From GameScene
this.scene.start('GameOverScene', { score: this.score, level: this.level });

// In GameOverScene
create(data) {
  this.add.text(400, 300, `Score: ${data.score}`, { fontSize: '32px' });
}
```

## Performance Notes

- Phaser.AUTO picks WebGL when available, falls back to Canvas
- Use texture atlases (spritesheet packer) instead of individual images to reduce draw calls
- Object pooling: reuse sprites with `group.get()` instead of creating/destroying
- Minimize physics bodies — disable physics on off-screen objects
- Use `this.cameras.main.ignore(uiLayer)` to exclude UI from game camera transforms
