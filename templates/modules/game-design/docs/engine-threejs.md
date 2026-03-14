# Engine Guide: Three.js

Three.js is a 3D rendering library for the web. Use it for: 3D games, first-person/third-person games, voxel worlds, procedural environments, 3D puzzle games, and any game that needs a 3D scene. Runs on WebGL and WebGPU.

Like PixiJS, Three.js is a renderer — you build the game loop, physics, and input yourself (or bring libraries like Rapier, cannon-es, or Ammo.js).

## Project Setup

```bash
npm init -y && npm install three
```

For TypeScript: `npm install three @types/three`

## Core Architecture

### Scene, Camera, Renderer

Every Three.js app needs these three things:

```javascript
import * as THREE from 'three';

// Scene — the container for all 3D objects
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);  // sky blue
scene.fog = new THREE.Fog(0x87ceeb, 50, 200);  // distance fog

// Camera — the viewpoint
const camera = new THREE.PerspectiveCamera(
  75,                                    // FOV
  window.innerWidth / window.innerHeight, // aspect
  0.1,                                   // near clipping
  1000                                   // far clipping
);
camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Animation loop
const timer = new THREE.Timer();
timer.connect(document);

renderer.setAnimationLoop(() => {
  timer.update();
  const delta = timer.getDelta();
  update(delta);
  renderer.render(scene, camera);
});

// Handle resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
```

### Meshes, Materials, Geometry

```javascript
// Built-in geometries
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(100, 100),
  new THREE.MeshStandardMaterial({ color: 0x228b22 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Box
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({ color: 0xff4444 })
);
cube.position.set(0, 0.5, 0);
cube.castShadow = true;
scene.add(cube);

// Instanced mesh (for many identical objects — trees, enemies, particles)
const count = 1000;
const mesh = new THREE.InstancedMesh(geometry, material, count);
const dummy = new THREE.Object3D();
for (let i = 0; i < count; i++) {
  dummy.position.set(Math.random() * 100 - 50, 0, Math.random() * 100 - 50);
  dummy.updateMatrix();
  mesh.setMatrixAt(i, dummy.matrix);
}
scene.add(mesh);
```

### Lighting

```javascript
// Ambient — baseline illumination
const ambient = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambient);

// Hemisphere — sky/ground gradient
const hemi = new THREE.HemisphereLight(0x87ceeb, 0x228b22, 0.6);
scene.add(hemi);

// Directional — sun-like, casts shadows
const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(10, 20, 10);
sun.castShadow = true;
sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;
sun.shadow.camera.near = 0.5;
sun.shadow.camera.far = 50;
sun.shadow.camera.left = -20;
sun.shadow.camera.right = 20;
sun.shadow.camera.top = 20;
sun.shadow.camera.bottom = -20;
scene.add(sun);

// Point — omnidirectional (torch, lamp)
const point = new THREE.PointLight(0xff8800, 1, 20);
point.position.set(5, 3, 5);
scene.add(point);
```

### Loading 3D Models (GLTF)

GLTF/GLB is the standard format for 3D web content.

```javascript
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
loader.load('models/character.glb', (gltf) => {
  const model = gltf.scene;
  model.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  scene.add(model);

  // Animations
  const mixer = new THREE.AnimationMixer(model);
  const idleAction = mixer.clipAction(gltf.animations[0]);
  const walkAction = mixer.clipAction(gltf.animations[1]);
  idleAction.play();

  // In update loop:
  // mixer.update(delta);

  // Crossfade between animations
  // walkAction.reset().fadeIn(0.3).play();
  // idleAction.fadeOut(0.3);
});
```

### Raycasting (Input / Click Detection)

```javascript
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

window.addEventListener('click', (event) => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    const hit = intersects[0];
    console.log('Hit:', hit.object.name, 'at', hit.point);
  }
});
```

### Camera Controls

```javascript
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Orbit camera (debug / strategy games)
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.update();  // call in animation loop

// First-person: use PointerLockControls
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
const fpControls = new PointerLockControls(camera, renderer.domElement);
renderer.domElement.addEventListener('click', () => fpControls.lock());
```

### Third-Person Camera Pattern

```javascript
function updateCamera(player, camera) {
  const offset = new THREE.Vector3(0, 5, 10);  // behind and above
  const targetPos = player.position.clone().add(offset);
  camera.position.lerp(targetPos, 0.1);  // smooth follow
  camera.lookAt(player.position);
}
```

## Physics Integration

Three.js has no built-in physics. Common choices:

### Rapier (recommended — fast, WASM, Rust-based)

```bash
npm install @dimforge/rapier3d-compat
```

```javascript
import RAPIER from '@dimforge/rapier3d-compat';

await RAPIER.init();
const world = new RAPIER.World({ x: 0, y: -9.81, z: 0 });

// Ground
const groundBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed());
world.createCollider(
  RAPIER.ColliderDesc.cuboid(50, 0.1, 50),
  groundBody
);

// Dynamic box
const boxBody = world.createRigidBody(
  RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 5, 0)
);
world.createCollider(RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5), boxBody);

// In update loop:
world.step();
const pos = boxBody.translation();
cube.position.set(pos.x, pos.y, pos.z);
const rot = boxBody.rotation();
cube.quaternion.set(rot.x, rot.y, rot.z, rot.w);
```

### Cannon-es (pure JS, simpler API)

```bash
npm install cannon-es
```

## Project Structure Convention

```
src/
├── scenes/
│   ├── MenuScene.js
│   ├── GameScene.js
│   └── GameOverScene.js
├── objects/
│   ├── Player.js          # Mesh + physics body + animation mixer
│   ├── Enemy.js
│   └── Terrain.js
├── systems/
│   ├── InputManager.js    # Keyboard + pointer state
│   ├── PhysicsWorld.js    # Rapier/cannon-es wrapper
│   ├── SceneManager.js    # Scene switching
│   └── AudioManager.js    # Spatial audio via Web Audio API
├── config/
│   └── constants.js       # Tuning parameters
├── assets/
│   ├── models/            # .glb files
│   ├── textures/
│   └── audio/
└── main.js                # Renderer, scene, loop setup
```

## Tuning Parameters Pattern

```javascript
export const PLAYER = {
  MOVE_SPEED: 5,
  SPRINT_MULTIPLIER: 1.8,
  JUMP_FORCE: 8,
  MASS: 70,
  CAMERA_OFFSET: { x: 0, y: 5, z: 10 },
  CAMERA_LERP: 0.1,
};
```

## Performance Notes

- Use `InstancedMesh` for repeated geometry (trees, bullets, particles) — massive perf gain
- LOD (Level of Detail): `THREE.LOD` swaps geometry based on camera distance
- Frustum culling is on by default — objects outside camera view skip rendering
- Texture compression: use KTX2 + Basis Universal for GPU-compressed textures
- Shadow map resolution: 1024 is fine for most cases, 2048 for hero shadows
- Object pooling: reuse meshes instead of creating/disposing
- `renderer.info` shows draw calls, triangles, textures in memory
- Use `dispose()` on geometries, materials, and textures when removing objects
- WebGPU renderer (`THREE.WebGPURenderer`) available for modern browsers — same API, better performance
