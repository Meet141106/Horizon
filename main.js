import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// 1. Unified State Atom
const defaultIssues = [
  { id: 1, title: "Subterranean Network Breach", category: "infrastructure", status: "new", votes: 85, x: 10, z: 20 },
  { id: 2, title: "Bio-Waste Leakage", category: "sanitation", status: "in-progress", votes: 34, x: -15, z: 5 },
  { id: 3, title: "Rogue Drone Activity", category: "safety", status: "resolved", votes: 210, x: 25, z: -10 },
  { id: 4, title: "Hydroponic Array Failure", category: "greenery", status: "new", votes: 45, x: -25, z: -25 },
];

let issues = JSON.parse(localStorage.getItem('polis-nexus-3d')) || defaultIssues;
const saveState = () => localStorage.setItem('polis-nexus-3d', JSON.stringify(issues));

const colorMap = {
  infrastructure: 0x00d2ff,
  sanitation: 0xffde00,
  safety: 0xff2a2a,
  greenery: 0x00ff66
};

// Elements
const mapView = document.getElementById('map-view');
const flipContainer = document.getElementById('flip-container');
const toggleBtn = document.getElementById('toggle-view-btn');

// Three.js Globals
let scene, camera, renderer, controls;
let pinGroup = new THREE.Group();
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

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
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't go below ground
  
  // Initial camera position (Bird's eye)
  camera.position.set(0, 150, 150);
  controls.target.set(0, 0, 0);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 6.0);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 8.0);
  dirLight.position.set(50, 150, 50);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 500;
  dirLight.shadow.camera.left = -100;
  dirLight.shadow.camera.right = 100;
  dirLight.shadow.camera.top = 100;
  dirLight.shadow.camera.bottom = -100;
  scene.add(dirLight);

  // Blue neon fill light
  const fillLight = new THREE.DirectionalLight(0x00d2ff, 5.0);
  fillLight.position.set(-50, 50, -50);
  scene.add(fillLight);

  scene.add(pinGroup);

  // Load GLB Model
  const loader = new GLTFLoader();
  loader.load(
    '/cyberpunk_city_-_1.glb',
    function (gltf) {
      const model = gltf.scene;
      
      // Auto-scale model to fit nicely
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3()).length();
      const center = box.getCenter(new THREE.Vector3());
      
      model.position.x += (model.position.x - center.x);
      model.position.y += (model.position.y - center.y); // Center vertically? Or just keep bottom at 0
      model.position.z += (model.position.z - center.z);
      
      // Assume model bottom is near 0
      model.position.y = 0;
      
      const desiredSize = 200;
      const scale = desiredSize / size;
      model.scale.set(scale, scale, scale);
      
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          // Add some Cyber-noir specular if needed
          if (child.material) {
            child.material.roughness = 0.3;
            child.material.metalness = 0.8;
          }
        }
      });
      
      scene.add(model);
    },
    undefined,
    function (error) {
      console.error('Error loading GLB:', error);
      // Fallback base plane if error
      const geo = new THREE.PlaneGeometry(200, 200);
      const mat = new THREE.MeshStandardMaterial({ color: 0x111520 });
      const plane = new THREE.Mesh(geo, mat);
      plane.rotation.x = -Math.PI / 2;
      plane.receiveShadow = true;
      scene.add(plane);
    }
  );

  // Resize handler
  window.addEventListener('resize', onWindowResize);
  
  // Click handler for dropping pins
  renderer.domElement.addEventListener('dblclick', onDoubleClick);

  animate();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Scrollytelling Dive mapping
function handleScroll() {
  const st = mapView.scrollTop;
  const maxScroll = mapView.scrollHeight - mapView.clientHeight;
  const progress = maxScroll > 0 ? Math.min(1, Math.max(0, st / maxScroll)) : 0;
  
  // Interpolate camera position
  // Bird's eye: y=150, z=150
  // Street dive: y=10, z=30
  const diveY = 150 - (140 * progress);
  const diveZ = 150 - (120 * progress);
  
  // Only override if they are scrolling, but OrbitControls handles pan/zoom too.
  // We can adjust camera position manually
  camera.position.setY(diveY);
  // camera.position.setZ(diveZ); // This might snap if they rotated
  // A simple hack: just adjust Y
  
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

// 3D Pins Rendering
function render3DPins() {
  // Clear old pins
  while(pinGroup.children.length > 0){ 
      const child = pinGroup.children[0];
      pinGroup.remove(child); 
  }
  
  issues.forEach(issue => {
    // Pin shaft
    const shaftGeo = new THREE.CylinderGeometry(0.5, 0.5, 10);
    const color = colorMap[issue.category];
    const shaftMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
    const shaft = new THREE.Mesh(shaftGeo, shaftMat);
    
    // Glowing Orb
    const orbGeo = new THREE.SphereGeometry(3, 16, 16);
    const orbMat = new THREE.MeshBasicMaterial({ color: color });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    orb.position.y = 6;
    
    // Halo (Heatmap logic translated to 3D)
    const haloGeo = new THREE.RingGeometry(2, 5 + (issue.votes * 0.1), 32);
    const haloMat = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide, transparent: true, opacity: 0.2 });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = -4.9; // Just above ground
    
    const pin = new THREE.Group();
    pin.add(shaft);
    pin.add(orb);
    pin.add(halo);
    
    pin.position.set(issue.x, 5, issue.z);
    
    // Add pulsing animation data
    pin.userData = { isPin: true, id: issue.id, phase: Math.random() * Math.PI * 2 };
    
    pinGroup.add(pin);
  });
}

function onDoubleClick(event) {
  // Raycast to find click position on ground
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  raycaster.setFromCamera(mouse, camera);
  
  // Raycast against a flat plane at y=0 for simplicity, or against the model
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const target = new THREE.Vector3();
  raycaster.ray.intersectPlane(plane, target);
  
  if (target) {
    const title = document.getElementById('issue-title').value || 'New Anomaly';
    const category = document.getElementById('issue-category').value;
    
    issues.push({
      id: Date.now(), title, category, status: 'new', votes: 1, 
      x: target.x, z: target.z
    });
    
    saveState();
    updateUI();
    document.getElementById('issue-title').value = '';
  }
}

function animate() {
  requestAnimationFrame(animate);
  
  controls.update();
  
  // Pulse animation for pins
  const time = Date.now() * 0.005;
  pinGroup.children.forEach(pin => {
    if (pin.userData.isPin) {
      const scale = 1 + 0.2 * Math.sin(time + pin.userData.phase);
      pin.children[1].scale.set(scale, scale, scale); // Orb
    }
  });
  
  renderer.render(scene, camera);
}

// Kanban Rendering & Drag/Drop
function renderKanban() {
  const columns = {
    'new': document.querySelector('[data-status="new"] .kanban-cards'),
    'in-progress': document.querySelector('[data-status="in-progress"] .kanban-cards'),
    'resolved': document.querySelector('[data-status="resolved"] .kanban-cards')
  };
  
  Object.values(columns).forEach(col => col.innerHTML = '');
  
  const sorted = [...issues].sort((a, b) => b.votes - a.votes);
  
  sorted.forEach(issue => {
    const card = document.createElement('div');
    card.className = `card ${issue.status === 'resolved' ? 'resolved-badge' : ''}`;
    // Convert hex color to CSS
    const colorHex = '#' + colorMap[issue.category].toString(16).padStart(6, '0');
    card.style.setProperty('--card-color', colorHex);
    card.draggable = true;
    card.dataset.id = issue.id;
    
    card.innerHTML = `
      <div class="card-title">${issue.title}</div>
      <div class="card-meta">
        <span style="text-transform: capitalize; color: var(--card-color);">${issue.category}</span>
        <button class="upvote-btn" data-id="${issue.id}">
          ▲ ${issue.votes}
        </button>
      </div>
    `;
    
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
    
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);
    
    card.querySelector('.upvote-btn').addEventListener('click', (e) => {
      e.stopPropagation(); 
      const id = parseInt(e.currentTarget.dataset.id);
      const targetIssue = issues.find(i => i.id === id);
      if (targetIssue) {
        targetIssue.votes++;
        saveState();
        updateUI();
      }
    });
    
    if (columns[issue.status]) {
      columns[issue.status].appendChild(card);
    }
  });
}

let draggedCard = null;
let lastMouseX = 0;

function handleDragStart(e) {
  draggedCard = this;
  setTimeout(() => this.style.opacity = '0.4', 0);
  lastMouseX = e.clientX;
}

function handleDragEnd() {
  this.style.opacity = '1';
  this.style.transform = 'rotate(0deg)';
  draggedCard = null;
}

function initKanbanDrag() {
  document.querySelectorAll('.kanban-column').forEach(col => {
    col.addEventListener('dragover', (e) => {
      e.preventDefault();
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
        const id = parseInt(draggedCard.dataset.id);
        const newStatus = col.dataset.status;
        const issue = issues.find(i => i.id === id);
        if (issue && issue.status !== newStatus) {
          issue.status = newStatus;
          saveState();
          updateUI();
        }
      }
    });
  });
}

function updateMetrics() {
  document.getElementById('metric-total').innerText = issues.length;
  const resolved = issues.filter(i => i.status === 'resolved').length;
  const rate = issues.length ? Math.round((resolved / issues.length) * 100) : 0;
  document.getElementById('metric-rate').innerText = `${rate}%`;
  
  const highest = [...issues].sort((a, b) => b.votes - a.votes)[0];
  document.getElementById('metric-zone').innerText = highest ? highest.category.toUpperCase() : 'NONE';
}

function updateUI() {
  render3DPins();
  renderKanban();
  updateMetrics();
}

function initApp() {
  init3D();
  initKanbanDrag();
  
  mapView.addEventListener('scroll', handleScroll);
  
  let isKanban = false;
  toggleBtn.addEventListener('click', () => {
    isKanban = !isKanban;
    flipContainer.style.transform = isKanban ? 'rotateY(180deg)' : 'rotateY(0deg)';
    toggleBtn.innerText = isKanban ? 'Switch to Map View' : 'Switch to Kanban';
  });
  
  // Submit via button instead of double click raycast is still possible
  document.getElementById('submit-issue').addEventListener('click', () => {
    const title = document.getElementById('issue-title').value;
    const category = document.getElementById('issue-category').value;
    if (!title) return;
    
    issues.push({
      id: Date.now(), title, category, status: 'new', votes: 1, 
      x: (Math.random() - 0.5) * 100, 
      z: (Math.random() - 0.5) * 100
    });
    
    saveState();
    updateUI();
    document.getElementById('issue-title').value = '';
  });
  
  updateUI();
}

initApp();
