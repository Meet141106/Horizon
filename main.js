/**
 * PROJECT POLIS — PS-03 (HORIZON'26)
 * Architecture: Vanilla JS + Three.js (single file)
 * Entry: index.html → main.js
 * Note: src/ contains an experimental React port (dead code, not loaded)
 */

import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

// ============ LANDING PAGE — DRONE SCENE ============

let droneRenderer, droneScene, droneCamera, droneGroup;
let droneMixer, droneClock = new THREE.Clock();
let landingActive = true;

function initDroneScene() {
  const canvas = document.getElementById('drone-canvas');
  if (!canvas) return;

  droneRenderer = new THREE.WebGLRenderer({ 
    canvas, alpha: true, antialias: true 
  });
  droneRenderer.setSize(window.innerWidth, window.innerHeight);
  droneRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  droneScene = new THREE.Scene();
  
  droneCamera = new THREE.PerspectiveCamera(
    45, window.innerWidth / window.innerHeight, 0.1, 1000
  );
  droneCamera.position.set(0, 10, 30);

  // Lighting
  droneScene.add(new THREE.AmbientLight(0x223344, 2));
  const dir = new THREE.DirectionalLight(0x00d2ff, 3);
  dir.position.set(10, 20, 10);
  droneScene.add(dir);
  const rim = new THREE.DirectionalLight(0x0044ff, 1.5);
  rim.position.set(-10, 5, -10);
  droneScene.add(rim);

  droneGroup = new THREE.Group();
  droneScene.add(droneGroup);

  // Load drone GLB
  const droneLoader = new GLTFLoader();
  droneLoader.load(
    './animated_drone_with_camera_free.glb',
    (gltf) => {
      const model = gltf.scene;
      model.scale.set(2, 2, 2);
      droneGroup.add(model);

      if (gltf.animations.length > 0) {
        droneMixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach(clip => 
          droneMixer.clipAction(clip).play()
        );
      }

      setupDroneScrollAnimation();
    },
    undefined,
    (err) => console.warn('Drone GLB load error:', err)
  );

  // Animate loop for drone
  function animateDrone() {
    if (!landingActive) return; // stop loop when landing exits
    requestAnimationFrame(animateDrone);
    const delta = droneClock.getDelta();
    if (droneMixer) droneMixer.update(delta);
    droneRenderer.render(droneScene, droneCamera);
  }
  animateDrone();

  // Resize
  window.addEventListener('resize', () => {
    droneCamera.aspect = window.innerWidth / window.innerHeight;
    droneCamera.updateProjectionMatrix();
    droneRenderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function setupDroneScrollAnimation() {
  // Initial position — Stage 1
  droneGroup.position.set(0, 8, 25);

  // Scroll-driven animation using plain scroll event
  // (no GSAP dependency — keeps it simple)
  window.addEventListener('scroll', () => {
    if (!landingActive) return;
    
    const scrollY = window.scrollY;
    const maxScroll = document.getElementById('landing-view')
      .offsetHeight - window.innerHeight;
    const progress = Math.min(scrollY / maxScroll, 1); // 0 to 1

    // Stage 1 → Stage 2 (progress 0 to 0.5)
    // Stage 2 → Stage 3 (progress 0.5 to 1)
    
    if (progress <= 0.5) {
      const t = progress / 0.5; // 0 to 1 within stage
      droneGroup.position.x = lerp(0,   -3,  t);
      droneGroup.position.y = lerp(8,    2,  t);
      droneGroup.position.z = lerp(25,   8,  t);
      droneGroup.rotation.x = lerp(0,  -0.3, t);
      droneGroup.rotation.y = lerp(0,   0.4, t);
    } else {
      const t = (progress - 0.5) / 0.5; // 0 to 1 within stage
      droneGroup.position.x = lerp(-3,   8,  t);
      droneGroup.position.y = lerp(2,   15,  t);
      droneGroup.position.z = lerp(8,  -10,  t);
      droneGroup.rotation.x = lerp(-0.3, -0.5, t);
      droneGroup.rotation.y = lerp(0.4,  -0.8, t);
    }
  });

  // Gentle hover bob
  let bobT = 0;
  function bob() {
    if (!landingActive) return;
    requestAnimationFrame(bob);
    bobT += 0.01;
    droneGroup.position.y += Math.sin(bobT) * 0.002;
  }
  bob();
}

function lerp(a, b, t) {
  return a + (b - a) * Math.min(Math.max(t, 0), 1);
}

// ============ LANDING → APP TRANSITION ============

function enterApp() {
  const landingEl = document.getElementById('landing-view');
  const appEl = document.getElementById('app-view');
  
  landingEl.classList.add('fade-out');
  
  setTimeout(() => {
    // Hide landing completely
    landingEl.style.display = 'none';
    landingActive = false;
    
    // Stop drone render loop (memory cleanup)
    if (droneRenderer) {
      droneRenderer.dispose();
    }
    
    // Show app
    appEl.style.display = 'block';
    document.body.classList.add('app-active');
    
    // Reset scroll to top for app
    window.scrollTo(0, 0);
    
    // Initialize the city map (call your existing init function)
    initCityMap(); 
    
  }, 800);
}

// Boot landing on page load
document.addEventListener('DOMContentLoaded', () => {
  initDroneScene();
  
  document.getElementById('enter-app-btn')
    .addEventListener('click', enterApp);
});

// ============ END LANDING ============

function initCityMap() {
const uuid = () => Math.random().toString(36).substring(2, 9);

const defaultIssues = [
  { id: 'seed-1', title: "Subterranean Network Breach", category: "infrastructure", status: "new", votes: 85, coords: {x: 10, y: 0, z: 20}, zone: "Industrial Belt", timestamp: Date.now(), verified: false, seeded: true },
  { id: 'seed-2', title: "Hydroponic Array Failure", category: "greenery", status: "new", votes: 45, coords: {x: -25, y: 0, z: -25}, zone: "Neon Market", timestamp: Date.now(), verified: false, seeded: true },
  { id: 'seed-3', title: "Bio-Waste Leakage", category: "sanitation", status: "inprogress", votes: 34, coords: {x: -15, y: 0, z: 5}, zone: "Civic Core", timestamp: Date.now(), verified: false, seeded: true },
  { id: 'seed-4', title: "Rogue Drone Activity", category: "safety", status: "resolved", votes: 210, coords: {x: 25, y: 0, z: -10}, zone: "Tech Quarter", timestamp: Date.now(), verified: true, seeded: true },
  { id: 'seed-5', title: "Signal Tower Blackout", category: "infrastructure", status: "new", votes: 62, coords: {x: 15, y: 0, z: 15}, zone: "Industrial Belt", timestamp: Date.now(), verified: false, seeded: true },
  { id: 'seed-6', title: "Contaminated Water Grid", category: "sanitation", status: "inprogress", votes: 71, coords: {x: -10, y: 0, z: 10}, zone: "Residential Ring", timestamp: Date.now(), verified: false, seeded: true },
  { id: 'seed-7', title: "Park Sector Overgrowth", category: "greenery", status: "resolved", votes: 38, coords: {x: -20, y: 0, z: -10}, zone: "Neon Market", timestamp: Date.now(), verified: true, seeded: true }
];

// TASK 2 — localStorage Zero Error
let issues = [];
try {
  const saved = localStorage.getItem('polis-nexus-3d');
  issues = saved ? JSON.parse(saved) : defaultIssues;
  
  // TASK 4.3 — Trim oldest issues
  if (issues.length > 50) {
    const nonSeeded = issues.filter(i => !i.seeded);
    if (nonSeeded.length > 10) {
      nonSeeded.sort((a, b) => a.timestamp - b.timestamp);
      const toRemove = nonSeeded.slice(0, 10).map(i => i.id);
      issues = issues.filter(i => !toRemove.includes(i.id));
    }
  }
} catch (e) {
  console.error("Storage corruption detected. Resetting to defaults.");
  issues = defaultIssues;
}

const saveState = () => localStorage.setItem('polis-nexus-3d', JSON.stringify(issues));

const colorMap = {
  infrastructure: 0x00bcd4,
  sanitation: 0xffeb3b,
  safety: 0xf44336,
  greenery: 0x4caf50
};

const ZONES = [
  { name: "Neon Market",     xMin: -Infinity, xMax: -15, zMin: -Infinity, zMax:   0,  color: 0x00bcd4 },
  { name: "Civic Core",      xMin: -15,  xMax:   0, zMin: -Infinity, zMax:   0,  color: 0x9c27b0 },
  { name: "Tech Quarter",    xMin:   0,  xMax:  Infinity, zMin: -Infinity, zMax: -10,  color: 0x673ab7 },
  { name: "Skybridge West",  xMin: -Infinity, xMax: -10, zMin:   0,  zMax:  Infinity,  color: 0x4caf50 },
  { name: "Residential Ring",xMin: -10,  xMax:  10, zMin:   0,  zMax:  Infinity,  color: 0x8bc34a },
  { name: "Industrial Belt", xMin:  10,  xMax:  Infinity, zMin:   0,  zMax:  15,  color: 0xff9800 },
  { name: "Harbor Fringe",   xMin:  10,  xMax:  Infinity, zMin:  15,  zMax:  Infinity,  color: 0xff5722 }
];

const getZone = (x, z) => {
  for (let zInfo of ZONES) {
    if (x >= zInfo.xMin && x < zInfo.xMax && z >= zInfo.zMin && z < zInfo.zMax) {
      return zInfo;
    }
  }
  return ZONES[1]; // Civic Core
};

// Elements
const mapView = document.getElementById('map-view');
const flipContainer = document.getElementById('flip-container');
const toggleBtn = document.getElementById('toggle-view-btn');
const addIssueForm = document.getElementById('add-issue-form');
const tooltip = document.getElementById('tooltip');

// View state — tracks whether kanban is showing so toast is suppressed
let isKanbanActive = false;

// Three.js Globals
let scene, camera, renderer, labelRenderer, controls;
let pinGroup = new THREE.Group();
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

let currentHitPoint = null;
let activeFilter = 'all'; // Renamed from currentFilter for Bug 2
const sortModes = { new: 'votes', inprogress: 'votes', resolved: 'votes' };

let ghostPin = null;
let ghostLabel = null;

// TASK 3.3 — Debounce renderKanban
let kanbanDirty = false;
function scheduleKanban() {
  if (kanbanDirty) return;
  kanbanDirty = true;
  requestAnimationFrame(() => { 
    renderKanban(); 
    kanbanDirty = false; 
  });
}

function init3D() {
  const canvas = document.getElementById('webgl-canvas');
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x03050a);
  scene.fog = new THREE.FogExp2(0x03050a, 0.005);

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
  
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap; // Task 2 — Update deprecated shadow map

  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.style.position = 'fixed';
  labelRenderer.domElement.style.top = '0px';
  labelRenderer.domElement.style.left = '0px';
  labelRenderer.domElement.style.pointerEvents = 'none';
  labelRenderer.domElement.style.zIndex = '3';
  document.body.appendChild(labelRenderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2 - 0.05;
  
  camera.position.set(0, 150, 150);
  controls.target.set(0, 0, 0);

  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 6.0));
  const dirLight = new THREE.DirectionalLight(0xffffff, 8.0);
  dirLight.position.set(50, 150, 50);
  dirLight.castShadow = true;
  scene.add(dirLight);

  const fillLight = new THREE.DirectionalLight(0x00d2ff, 5.0);
  fillLight.position.set(-50, 50, -50);
  scene.add(fillLight);

  scene.add(pinGroup);

  createZonePlanes();

  const loader = new GLTFLoader();
  loader.load('/cyberpunk_city_-_1.glb', function (gltf) {
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());
    
    model.position.x += (model.position.x - center.x);
    model.position.y += (model.position.y - center.y);
    model.position.z += (model.position.z - center.z);
    model.position.y = 0;
    
    const scale = 200 / size;
    model.scale.set(scale, scale, scale);
    
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.roughness = 0.3;
          child.material.metalness = 0.8;
        }
      }
    });
    scene.add(model);
    
    // Hide loading screen and show app
    const loadingScreen = document.getElementById('loading-screen');
    const appContainer = document.getElementById('app-container');
    const metricStrip = document.getElementById('metric-strip');
    
    if (loadingScreen) {
      loadingScreen.style.opacity = '0';
      setTimeout(() => {
        loadingScreen.style.display = 'none';
        if (appContainer) appContainer.style.display = 'block';
        if (metricStrip) metricStrip.style.display = 'flex';
      }, 500);
    }
  }, undefined, (error) => console.error("Model failed to load:", error));

  window.addEventListener('resize', onWindowResize);
  
  renderer.domElement.addEventListener('dblclick', onMapDoubleClick);
  renderer.domElement.addEventListener('mousemove', onMapHover);
  renderer.domElement.addEventListener('click', (e) => {
    // TASK 1 — Accidental click check: handled by only dblclick having logic
  });

  animate();
}

function createZonePlanes() {
  ZONES.forEach(z => {
    const wMin = z.xMin === -Infinity ? -100 : z.xMin;
    const wMax = z.xMax === Infinity ? 100 : z.xMax;
    const dMin = z.zMin === -Infinity ? -100 : z.zMin;
    const dMax = z.zMax === Infinity ? 100 : z.zMax;
    
    const width = wMax - wMin;
    const depth = dMax - dMin;
    const cx = wMin + width/2;
    const cz = dMin + depth/2;

    const geo = new THREE.PlaneGeometry(width, depth);
    const mat = new THREE.MeshBasicMaterial({ color: z.color, transparent: true, opacity: 0.15, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(geo, mat);
    plane.rotation.x = -Math.PI / 2;
    plane.position.set(cx, 0.1, cz);
    plane.userData.isZonePlane = true;
    scene.add(plane);

    const div = document.createElement('div');
    div.className = 'zone-label';
    div.textContent = z.name;
    div.style.color = '#' + z.color.toString(16).padStart(6, '0');
    div.style.fontWeight = '800';
    div.style.fontSize = window.innerWidth <= 480 ? '9px' : '11px';
    div.style.textTransform = 'uppercase';
    div.style.opacity = '0.6';
    div.style.pointerEvents = 'none';

    const label = new CSS2DObject(div);
    label.position.set(cx, 10, cz);
    scene.add(label);
  });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  
  document.querySelectorAll('.zone-label').forEach(el => {
    el.style.fontSize = window.innerWidth <= 480 ? '9px' : '11px';
  });
  
  // TASK 4.5 — Re-run initMobileTabs on resize
  initMobileTabs();
}

function handleScroll() {
  const scrollTop = mapView.scrollTop;
  const scrollHeight = mapView.scrollHeight - mapView.clientHeight;
  if (scrollHeight <= 0) return;
  const progress = scrollTop / scrollHeight;
  
  const scrolly = document.getElementById('scrolly-overlay');
  const scrollyText = document.getElementById('scrolly-text');
  
  if (progress > 0.8) {
    scrolly.classList.remove('hidden');
    scrollyText.innerText = "Street Level Grid: Highlighting hyper-local issue density and recent reports.";
  } else if (progress > 0.4) {
    scrolly.classList.remove('hidden');
    scrollyText.innerText = "Mid-Altitude Scan: Regional anomaly detection active.";
  } else {
    scrolly.classList.add('hidden');
  }
}

function onMapDoubleClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  raycaster.setFromCamera(mouse, camera);
  let intersects = raycaster.intersectObjects(scene.children, true);
  intersects = intersects.filter(i => !i.object.userData.isHalo && !i.object.userData.isZonePlane && i.object !== (ghostPin ? ghostPin.children[1] : null));

  if (intersects.length > 0) {
    currentHitPoint = intersects[0].point;
    const zoneInfo = getZone(currentHitPoint.x, currentHitPoint.z);
    
    if (!ghostPin) {
      ghostPin = new THREE.Group();
      
      const shaftGeo = new THREE.CylinderGeometry(0.2, 0.2, 12);
      const shaftMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
      const shaft = new THREE.Mesh(shaftGeo, shaftMat);
      shaft.position.y = 6;
      ghostPin.add(shaft);

      const orbGeo = new THREE.SphereGeometry(3, 16, 16);
      const orbMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 });
      const orb = new THREE.Mesh(orbGeo, orbMat);
      orb.position.y = 12;
      ghostPin.add(orb);
      
      scene.add(ghostPin);
    }
    ghostPin.position.set(currentHitPoint.x, 0, currentHitPoint.z);

    if (!ghostLabel) {
      const div = document.createElement('div');
      div.className = 'ghost-zone-label';
      div.style.cssText = `font-family:'Outfit',sans-serif;font-size:${window.innerWidth<=480?'9px':'11px'};color:white;background:rgba(0,0,0,0.5);padding:3px 8px;border-radius:4px;opacity:0.75;pointer-events:none;white-space:nowrap;`;
      ghostLabel = new CSS2DObject(div);
      scene.add(ghostLabel);
    }
    ghostLabel.element.innerText = zoneInfo.name;
    ghostLabel.position.set(currentHitPoint.x, 15, currentHitPoint.z);

    addIssueForm.classList.remove('inactive-form');
    document.getElementById('issue-title').disabled = false;
    document.getElementById('issue-category').disabled = false;
    document.getElementById('submit-issue').disabled = false;
    document.getElementById('cancel-issue').disabled = false;
    document.getElementById('form-helper-text').style.display = 'none';

    const formZone = document.getElementById('form-zone-name');
    formZone.innerText = `📍 ${zoneInfo.name}`;
    formZone.style.color = '#' + zoneInfo.color.toString(16).padStart(6, '0');
  } else {
    // TASK 4.2 — Click on water/sky toast
    showToast("Click on a city area to place a pin");
  }
}

function showToast(msg) {
  // BUG 1 — Never show map toast while kanban is active
  if (isKanbanActive) return;
  const existing = document.getElementById('polis-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'polis-toast';
  toast.innerText = msg;
  toast.style.cssText = `position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:rgba(255,80,80,0.9);color:white;padding:10px 20px;border-radius:8px;z-index:9999;font-weight:600;font-size:0.9rem;box-shadow:0 5px 15px rgba(0,0,0,0.3);`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.5s';
    setTimeout(() => toast.remove(), 500);
  }, 2000);
}

function clearGhostPin() {
  addIssueForm.classList.add('inactive-form');
  document.getElementById('issue-title').disabled = true;
  document.getElementById('issue-category').disabled = true;
  document.getElementById('submit-issue').disabled = true;
  document.getElementById('cancel-issue').disabled = true;
  document.getElementById('issue-title').value = '';
  document.getElementById('form-zone-name').innerText = '';
  document.getElementById('form-helper-text').style.display = 'block';
  
  // TASK 3.1 — Dispose resources
  if (ghostPin) { 
    ghostPin.traverse(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
    scene.remove(ghostPin); 
    ghostPin = null; 
  }
  if (ghostLabel) { scene.remove(ghostLabel); ghostLabel = null; }
  currentHitPoint = null;
}

function onMapHover(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(pinGroup.children, true);
  if (intersects.length > 0) {
    let pin = intersects[0].object;
    while(pin.parent && pin.parent !== pinGroup) pin = pin.parent;
    
    if (pin.userData.issue) {
      const issue = pin.userData.issue;
      tooltip.innerHTML = `<b style="color:var(--text-color)">${issue.title}</b><span style="color:#${colorMap[issue.category].toString(16).padStart(6,'0')}">${issue.category.toUpperCase()}</span><span>Votes: ${issue.votes}</span>`;
      tooltip.style.left = (event.clientX + 15) + 'px';
      tooltip.style.top = (event.clientY + 15) + 'px';
      tooltip.classList.remove('hidden');
      document.body.style.cursor = 'pointer';
      return;
    }
  }
  tooltip.classList.add('hidden');
  document.body.style.cursor = 'default';
}

function render3DPins() {
  while(pinGroup.children.length > 0){ 
      const pin = pinGroup.children[0];
      pin.traverse(c => { if(c.geometry) c.geometry.dispose(); if(c.material) c.material.dispose(); });
      pinGroup.remove(pin); 
  }
  
  const filtered = activeFilter === 'all' ? issues : issues.filter(i => i.category === activeFilter);

  filtered.forEach(issue => {
    const color = colorMap[issue.category];
    let emissiveColor = 0x000000;
    if (issue.status === 'new') emissiveColor = 0xffffff;
    else if (issue.status === 'inprogress') emissiveColor = 0xff9800;
    else if (issue.status === 'resolved') emissiveColor = 0x00ff66;

    const orbGeo = new THREE.SphereGeometry(3, 16, 16);
    const orbMat = new THREE.MeshStandardMaterial({ color: color, emissive: emissiveColor, emissiveIntensity: 0.8 });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    orb.position.y = 12;
    
    const shaftGeo = new THREE.CylinderGeometry(0.2, 0.2, 12);
    const shaftMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    shaft.position.y = 6;

    const haloGeo = new THREE.RingGeometry(1, 4 + (issue.votes * 0.05), 32);
    const haloMat = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide, transparent: true, opacity: 0.3 });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = 0.1;
    halo.userData.isHalo = true;
    
    const pin = new THREE.Group();
    pin.add(orb);
    pin.add(shaft);
    pin.add(halo);
    pin.position.set(issue.coords.x, 0, issue.coords.z);
    pin.userData = { isPin: true, issue: issue, phase: Math.random() * Math.PI * 2, visible: true };
    pinGroup.add(pin);
  });
}

function animate() {
  requestAnimationFrame(animate);
  if (controls) controls.update();
  
  const time = Date.now() * 0.005;
  pinGroup.children.forEach(pin => {
    // TASK 3.2 — Visibility check (simple frustum or distance)
    const dist = camera.position.distanceTo(pin.position);
    if (dist > 500) { pin.userData.visible = false; } else { pin.userData.visible = true; }

    if (pin.userData.isPin && pin.userData.visible) {
      const orb = pin.children[0];
      const halo = pin.children[2];
      const scale = 1 + 0.5 * Math.sin(time + pin.userData.phase);
      halo.scale.set(scale, scale, scale);
      halo.material.opacity = 0.5 - (0.2 * Math.sin(time + pin.userData.phase));
      const orbScale = 1 + 0.1 * Math.sin(time + pin.userData.phase);
      orb.scale.set(orbScale, orbScale, orbScale);
    }
  });

  if (ghostPin) {
    const orb = ghostPin.children[1];
    const scale = 0.9 + 0.2 * Math.sin(time * 2);
    orb.scale.set(scale, scale, scale);
  }
  
  if (renderer && scene && camera) renderer.render(scene, camera);
  // TASK 2 — CSS2DRenderer null check
  if (labelRenderer && scene && camera) labelRenderer.render(scene, camera);
}


function renderKanban() {
  const statuses = ['new', 'inprogress', 'resolved'];
  
  statuses.forEach(status => {
    const col = document.querySelector(`[data-status="${status}"]`);
    if (!col) return;
    const cardsContainer = col.querySelector('.kanban-cards');
    cardsContainer.innerHTML = '';
    
    const colIssues = issues.filter(issue => {
      const statusMatch = issue.status === status;
      const categoryMatch = activeFilter === 'all' || issue.category === activeFilter;
      return statusMatch && categoryMatch;
    });

    const sortMode = sortModes[status];
    colIssues.sort((a, b) => {
      if (sortMode === 'votes') return b.votes - a.votes;
      return b.timestamp - a.timestamp;
    });

    col.querySelector('.count-badge').innerText = `(${colIssues.length})`;
    let totalVotes = 0;
    
    if (colIssues.length === 0) {
      // TASK 4.4 — Zone appropriate empty state
      cardsContainer.innerHTML = `<div class="empty-placeholder">The Sector is Calm. No ${status.replace('inprogress','in progress')} issues found.</div>`;
    } else {
      colIssues.forEach(issue => {
        totalVotes += issue.votes;
        const card = document.createElement('div');
        card.className = `card issue-card ${issue.status === 'resolved' ? 'faint-green' : ''} ${issue.verified ? 'resolved-badge' : ''}`;
        const colorHex = '#' + colorMap[issue.category].toString(16).padStart(6, '0');
        card.style.setProperty('--card-color', colorHex);
        card.draggable = true;
        card.dataset.id = issue.id;
        
        card.innerHTML = `<div class="card-title">${issue.title}</div><div class="card-meta"><span style="text-transform:capitalize;color:var(--card-color);font-size:13px;">${issue.category}</span><button class="upvote-btn" data-id="${issue.id}">▲ ${issue.votes}</button></div>`;
        
        // BUG 2B — Card click actions area
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'card-actions';
        if (issue.status === 'new') {
          actionsDiv.innerHTML = `<button class="card-action-btn move-btn" data-target="inprogress">→ Move to In Progress</button><button class="card-action-btn cancel-btn">✕ Cancel</button>`;
        } else if (issue.status === 'inprogress') {
          actionsDiv.innerHTML = `<button class="card-action-btn resolve-btn" data-target="resolved">→ Move to Resolved</button><button class="card-action-btn cancel-btn">✕ Cancel</button>`;
        } else {
          actionsDiv.innerHTML = `<button class="card-action-btn cancel-btn">✕ Close</button>`;
        }
        card.appendChild(actionsDiv);
        
        if (issue.status === 'resolved') {
          for(let i=0; i<3; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.left = `${Math.random() * 100}%`;
            p.style.bottom = '0';
            p.style.animationDelay = `${Math.random() * 1.5}s`;
            card.appendChild(p);
          }
        }
        
        // Card click — expand to show action buttons
        card.addEventListener('click', (e) => {
          e.stopPropagation(); // BUG 1 — stop bubbling to map layer
          if (e.target.classList.contains('upvote-btn')) return;
          if (e.target.classList.contains('card-action-btn')) return;
          document.querySelectorAll('.issue-card.card-expanded').forEach(c => c.classList.remove('card-expanded'));
          card.classList.add('card-expanded');
        });
        
        // Move button handlers
        actionsDiv.querySelectorAll('.card-action-btn[data-target]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const newStatus = btn.dataset.target;
            issue.status = newStatus;
            if (newStatus === 'resolved') {
              setTimeout(() => { issue.verified = true; saveState(); updateUI(); }, 2000);
            }
            saveState();
            updateUI();
          });
        });
        // Cancel/close button
        actionsDiv.querySelector('.cancel-btn')?.addEventListener('click', (e) => {
          e.stopPropagation();
          card.classList.remove('card-expanded');
        });
        
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
        
        // Touch
        let touchStartX, clone, sourceCol;
        card.addEventListener('touchstart', e => {
          touchStartX = e.touches[0].clientX;
          sourceCol = card.closest('.kanban-column').dataset.status;
          clone = card.cloneNode(true);
          clone.style.cssText = `position:fixed;opacity:0.85;pointer-events:none;z-index:9999;width:${card.offsetWidth}px;transform:rotate(3deg);left:${touchStartX - card.offsetWidth/2}px;top:${e.touches[0].clientY - 30}px;`;
          document.body.appendChild(clone);
        }, { passive: true });

        card.addEventListener('touchmove', e => {
          if (!clone) return;
          e.preventDefault();
          clone.style.left = (e.touches[0].clientX - card.offsetWidth/2) + 'px';
          clone.style.top  = (e.touches[0].clientY - 30) + 'px';
        }, { passive: false });

        card.addEventListener('touchend', e => {
          if (!clone) return;
          clone.remove();
          clone = null;
          const target = document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY)?.closest('.kanban-column');
          if (target && target.dataset.status !== sourceCol) {
            const issueId = card.dataset.id;
            const issue = issues.find(i => i.id === issueId);
            if (issue) {
              issue.status = target.dataset.status;
              if (issue.status === 'resolved') {
                setTimeout(() => { issue.verified = true; saveState(); updateUI(); }, 2000);
              }
              saveState();
              updateUI();
            }
          }
        });

        card.querySelector('.upvote-btn').addEventListener('click', (e) => {
          e.stopPropagation(); 
          issue.votes++;
          saveState();
          updateUI();
        });
        cardsContainer.appendChild(card);
      });
    }
    const avg = colIssues.length ? Math.round(totalVotes / colIssues.length) : 0;
    col.querySelector('.avg-upvotes').innerText = avg;
  });
  initMobileTabs();
  attachFilterListeners(); // BUG 3 — re-attach after every DOM rebuild
}

// BUG 3 — Dedicated filter listener attachment
function attachFilterListeners() {
  document.querySelectorAll('.filter-pill').forEach(pill => {
    // Clone to remove any stale listeners before re-attaching
    const fresh = pill.cloneNode(true);
    pill.parentNode.replaceChild(fresh, pill);
    fresh.addEventListener('click', (e) => {
      e.stopPropagation();
      activeFilter = fresh.dataset.category || 'all';
      document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      fresh.classList.add('active');
      renderKanban();
    });
  });
}

// BUG 1 — Collapse expanded cards when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.issue-card')) {
    document.querySelectorAll('.issue-card.card-expanded').forEach(c => c.classList.remove('card-expanded'));
  }
});

function initMobileTabs() {
  if (window.innerWidth > 480) {
    const existing = document.querySelector('.mobile-kanban-tabs');
    if (existing) existing.remove();
    document.querySelectorAll('.kanban-column').forEach(col => col.classList.remove('active-tab'));
    return;
  }
  if (document.querySelector('.mobile-kanban-tabs')) return;
  const tabs = document.createElement('div');
  tabs.className = 'mobile-kanban-tabs';
  tabs.innerHTML = `<button class="tab-btn active" data-col="new">NEW</button><button class="tab-btn" data-col="inprogress">IN PROGRESS</button><button class="tab-btn" data-col="resolved">RESOLVED</button>`;
  document.querySelector('.kanban-board').before(tabs);
  tabs.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.kanban-column').forEach(col => col.classList.remove('active-tab'));
      const targetCol = document.querySelector(`.kanban-column[data-status="${btn.dataset.col}"]`);
      if (targetCol) targetCol.classList.add('active-tab');
    });
  });
  const firstCol = document.querySelectorAll('.kanban-column')[0];
  if (firstCol) firstCol.classList.add('active-tab');
}

let draggedCard = null;
let lastMouseX = 0;

function handleDragStart(e) {
  draggedCard = this;
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.id || '');
  }
  setTimeout(() => this.style.opacity = '0.4', 0);
  lastMouseX = e.clientX;
}

function handleDragEnd(e) {
  this.style.opacity = '1';
  this.style.transform = 'rotate(0deg)';
  draggedCard = null;
}

function initKanbanDrag() {
  document.querySelectorAll('.kanban-column').forEach(col => {
    col.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
      }
      if (draggedCard) {
        const deltaX = e.clientX - lastMouseX;
        lastMouseX = e.clientX;
        const rotate = Math.min(Math.max(deltaX * 0.8, -15), 15);
        draggedCard.style.transform = `rotate(${rotate}deg)`;
      }
    });
    col.addEventListener('drop', (e) => {
      e.preventDefault();
      if (draggedCard) {
        const id = draggedCard.dataset.id;
        const newStatus = col.dataset.status;
        const issue = issues.find(i => i.id == id);
        if (issue && issue.status !== newStatus) {
          issue.status = newStatus;
          if (newStatus === 'resolved') {
            setTimeout(() => { issue.verified = true; saveState(); updateUI(); }, 2000);
          }
          saveState();
          updateUI();
        }
      }
    });
  });
  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const col = e.target.closest('.kanban-column');
      const status = col.dataset.status;
      sortModes[status] = sortModes[status] === 'votes' ? 'recent' : 'votes';
      e.target.innerText = sortModes[status] === 'votes' ? '▲ Votes' : '🕐 Recent';
      scheduleKanban();
    });
  });
  attachFilterListeners(); // initial attach on page load
}

function updateMetrics() {
  document.getElementById('metric-total').innerText = issues.length;
  const resolved = issues.filter(i => i.status === 'resolved').length;
  const rate = issues.length ? Math.round((resolved / issues.length) * 100) : 0;
  document.getElementById('metric-rate').innerText = `${rate}%`;
  const zoneCounts = {};
  issues.forEach(i => { zoneCounts[i.zone] = (zoneCounts[i.zone] || 0) + 1; });
  let topZone = 'NONE';
  let max = 0;
  for(let z in zoneCounts) { if (zoneCounts[z] > max) { max = zoneCounts[z]; topZone = z; } }
  document.getElementById('metric-zone').innerText = topZone.toUpperCase();
}

function updateUI() {
  render3DPins();
  scheduleKanban();
  updateMetrics();
}

function initApp() {
  init3D();
  initKanbanDrag();
  mapView.addEventListener('scroll', handleScroll);
  toggleBtn.addEventListener('click', () => {
    isKanbanActive = !isKanbanActive;
    flipContainer.style.transform = isKanbanActive ? 'rotateY(180deg)' : 'rotateY(0deg)';
    toggleBtn.innerText = isKanbanActive ? 'Switch to Map View' : 'Switch to Kanban';
    labelRenderer.domElement.style.display = isKanbanActive ? 'none' : 'block';
    // BUG 2A — allow page to scroll in kanban, lock it on map
    document.body.style.overflow = isKanbanActive ? 'auto' : 'hidden';
  });
  
  document.getElementById('submit-issue').addEventListener('click', () => {
    const titleEl = document.getElementById('issue-title');
    const title = titleEl.value.trim();
    const category = document.getElementById('issue-category').value;
    
    // TASK 4.1 — Inline validation
    const existingError = document.getElementById('form-error');
    if (existingError) existingError.remove();

    if (!title) {
      const err = document.createElement('div');
      err.id = 'form-error';
      err.innerText = "Please describe the issue";
      err.style.cssText = "color:#ff5050; font-size:11px; margin-top:5px; font-weight:600;";
      titleEl.after(err);
      return;
    }
    
    if (!currentHitPoint) return;
    const x = currentHitPoint.x;
    const z = currentHitPoint.z;
    const zoneInfo = getZone(x, z);

    issues.push({ id: uuid(), title, category, status: 'new', votes: 1, coords: { x, y: currentHitPoint.y, z }, zone: zoneInfo.name, timestamp: Date.now(), verified: false });
    saveState();
    clearGhostPin();
    updateUI();
  });

  document.getElementById('cancel-issue').addEventListener('click', () => {
    clearGhostPin();
  });
  
  updateUI();
}

  initApp();
}
