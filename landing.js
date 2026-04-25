/**
 * Landing Page — Drone Scrollytelling (Vanilla Three.js)
 * Loads animated_drone_with_camera_free.glb, animates it
 * through 3 scroll stages via GSAP ScrollTrigger.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ──────────────────────────── SCENE SETUP ────────────────────────────

const canvas = document.getElementById('drone-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.set(0, 10, 30);

// ──────────────────────────── LIGHTING ────────────────────────────

const ambient = new THREE.AmbientLight(0x223344, 2);
scene.add(ambient);

const dirLight = new THREE.DirectionalLight(0x00d2ff, 3);
dirLight.position.set(10, 20, 10);
scene.add(dirLight);

const rimLight = new THREE.DirectionalLight(0x0044ff, 1.5);
rimLight.position.set(-10, 5, -10);
scene.add(rimLight);

// Subtle ground glow
const pointLight = new THREE.PointLight(0x00d2ff, 1, 50);
pointLight.position.set(0, 0, 10);
scene.add(pointLight);

// ──────────────────────────── LOAD DRONE ────────────────────────────

const loader = new GLTFLoader();
let droneGroup = new THREE.Group();
scene.add(droneGroup);

loader.load('./animated_drone_with_camera_free.glb', (gltf) => {
  const drone = gltf.scene;
  drone.scale.set(2, 2, 2);
  droneGroup.add(drone);

  // Start propeller / built-in animations
  if (gltf.animations.length > 0) {
    const mixer = new THREE.AnimationMixer(drone);
    gltf.animations.forEach(clip => mixer.clipAction(clip).play());
    droneGroup.userData.mixer = mixer;
  }

  setupScrollAnimation();
}, undefined, (err) => {
  console.error('Failed to load drone GLB:', err);
});

// ──────────────────────────── SCROLL WAYPOINTS ────────────────────────────

const waypoints = {
  stage1: { x: 0,  y: 8,  z: 25,  rotX: -0.1, rotY: 0,    rotZ: 0    },
  stage2: { x: -3, y: 2,  z: 8,   rotX: -0.3, rotY: 0.4,  rotZ: 0.05 },
  stage3: { x: 8,  y: 15, z: -10, rotX: -0.5, rotY: -0.8, rotZ: 0.1  }
};

function setupScrollAnimation() {
  // Set initial position
  droneGroup.position.set(waypoints.stage1.x, waypoints.stage1.y, waypoints.stage1.z);
  droneGroup.rotation.set(waypoints.stage1.rotX, waypoints.stage1.rotY, waypoints.stage1.rotZ);

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.landing-scroll-content',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.5,
    }
  });

  // Stage 1 → Stage 2 (first 50% of scroll)
  tl.to(droneGroup.position, {
    x: waypoints.stage2.x,
    y: waypoints.stage2.y,
    z: waypoints.stage2.z,
    duration: 1,
    ease: 'power2.inOut'
  }, 0)
  .to(droneGroup.rotation, {
    x: waypoints.stage2.rotX,
    y: waypoints.stage2.rotY,
    z: waypoints.stage2.rotZ,
    duration: 1,
    ease: 'power2.inOut'
  }, 0)

  // Stage 2 → Stage 3 (last 50% of scroll)
  .to(droneGroup.position, {
    x: waypoints.stage3.x,
    y: waypoints.stage3.y,
    z: waypoints.stage3.z,
    duration: 1,
    ease: 'power2.in'
  }, 1)
  .to(droneGroup.rotation, {
    x: waypoints.stage3.rotX,
    y: waypoints.stage3.rotY,
    z: waypoints.stage3.rotZ,
    duration: 1,
    ease: 'power2.in'
  }, 1);

  // Hover bob effect (independent of scroll)
  gsap.to(droneGroup.position, {
    y: `+=0.3`,
    duration: 2,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1
  });
}

// ──────────────────────────── RENDER LOOP ────────────────────────────

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  if (droneGroup.userData.mixer) {
    droneGroup.userData.mixer.update(delta);
  }
  renderer.render(scene, camera);
}
animate();

// ──────────────────────────── RESIZE ────────────────────────────

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ──────────────────────────── ENTER BUTTON ────────────────────────────

document.getElementById('enter-btn').addEventListener('click', () => {
  document.body.classList.add('landing-exit');
  setTimeout(() => {
    window.location.href = '/app';
  }, 800);
});
