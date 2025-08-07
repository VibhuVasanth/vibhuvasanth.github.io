// --- Dropdown menu logic ---
const menuBtn = document.getElementById('menuBtn');
const dropdown = document.getElementById('dropdownMenu');
menuBtn.onclick = (e) => {
  e.stopPropagation();
  dropdown.classList.toggle('show');
};
window.onclick = (e) => {
  if (!dropdown.contains(e.target) && e.target !== menuBtn) {
    dropdown.classList.remove('show');
  }
};

// --- Smooth scroll for anchor links ---
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
    dropdown.classList.remove('show');
  });
});

// --- Animate skill bars ---
window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.fill').forEach(fill => {
    const width = fill.style.width;
    fill.style.setProperty('--fill-width', width);
    fill.style.width = '0';
    setTimeout(() => {
      fill.style.width = width;
    }, 400);
  });
});

// --- Three.js 3D Shield Animation (centered, covers text) ---
const container = document.getElementById('three-container');
let scene, camera, renderer, shield, leftHalf, rightHalf, clock, shineMesh, shieldGroup;
let shieldState = 0; // 0: closed, 1: open
let shieldAnim = 0; // 0 to 1

function createShield() {
  shieldGroup = new THREE.Group();

  // Left half
  const leftShape = new THREE.Shape();
  leftShape.moveTo(0, 1.2);
  leftShape.bezierCurveTo(-0.8, 1.1, -1.1, 0.2, 0, -1.5);
  leftShape.lineTo(0, 1.2);
  const leftGeom = new THREE.ExtrudeGeometry(leftShape, { depth: 0.18, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.09, bevelSegments: 6 });
  const leftMat = new THREE.MeshPhysicalMaterial({
    color: 0xff2d2d,
    metalness: 0.85,
    roughness: 0.18,
    clearcoat: 0.85,
    reflectivity: 0.95,
    transmission: 0.08,
    ior: 1.3,
    sheen: 1,
    sheenColor: new THREE.Color(0xffffff),
    sheenRoughness: 0.2
  });
  leftHalf = new THREE.Mesh(leftGeom, leftMat);
  leftHalf.position.z = -0.09;
  leftHalf.castShadow = true;
  shieldGroup.add(leftHalf);

  // Right half
  const rightShape = new THREE.Shape();
  rightShape.moveTo(0, 1.2);
  rightShape.bezierCurveTo(0.8, 1.1, 1.1, 0.2, 0, -1.5);
  rightShape.lineTo(0, 1.2);
  const rightGeom = new THREE.ExtrudeGeometry(rightShape, { depth: 0.18, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.09, bevelSegments: 6 });
  const rightMat = leftMat.clone();
  rightHalf = new THREE.Mesh(rightGeom, rightMat);
  rightHalf.position.z = 0.09;
  rightHalf.castShadow = true;
  shieldGroup.add(rightHalf);

  // Outline
  const outlineGeom = new THREE.TorusGeometry(1.13, 0.035, 16, 100);
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const outline = new THREE.Mesh(outlineGeom, outlineMat);
  outline.rotation.x = Math.PI / 2;
  outline.position.z = 0.01;
  shieldGroup.add(outline);

  // Shine overlay (glass effect)
  const shineGeom = new THREE.SphereGeometry(1.05, 32, 32, Math.PI * 0.7, Math.PI * 0.6, 0, Math.PI * 0.5);
  const shineMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.13,
    metalness: 0.7,
    roughness: 0.05,
    clearcoat: 1,
    reflectivity: 1
  });
  shineMesh = new THREE.Mesh(shineGeom, shineMat);
  shineMesh.position.z = 0.13;
  shineMesh.rotation.z = Math.PI * 0.13;
  shieldGroup.add(shineMesh);

  // Lock icon in the center
  const lockGroup = new THREE.Group();
  const lockBody = new THREE.CylinderGeometry(0.18, 0.18, 0.28, 32);
  const lockMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0.7, roughness: 0.2 });
  const lockMesh = new THREE.Mesh(lockBody, lockMat);
  lockMesh.position.set(0, -0.25, 0.13);
  lockGroup.add(lockMesh);

  const lockArc = new THREE.TorusGeometry(0.13, 0.035, 16, 32, Math.PI);
  const lockArcMat = lockMat.clone();
  const lockArcMesh = new THREE.Mesh(lockArc, lockArcMat);
  lockArcMesh.position.set(0, -0.11, 0.13);
  lockArcMesh.rotation.x = Math.PI / 2;
  lockGroup.add(lockArcMesh);

  shieldGroup.add(lockGroup);

  shieldGroup.scale.set(1.7, 1.7, 1.7);
  return shieldGroup;
}

function animateShieldOpenClose() {
  // Animate halves opening and closing to cover/uncover text
  // shieldAnim: 0 (closed), 1 (open)
  leftHalf.rotation.z = THREE.MathUtils.lerp(0, Math.PI / 2.1, shieldAnim);
  rightHalf.rotation.z = THREE.MathUtils.lerp(0, -Math.PI / 2.1, shieldAnim);
  shineMesh.material.opacity = 0.13 + 0.07 * Math.abs(Math.sin(clock.getElapsedTime() * 1.2));
}

function initThree() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a1833);

  camera = new THREE.PerspectiveCamera(45, container.offsetWidth / container.offsetHeight, 0.1, 100);
  camera.position.set(0, 0, 6);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  // Lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambient);
  const spot = new THREE.SpotLight(0xff2d2d, 1.2, 10, Math.PI / 4, 0.5, 2);
  spot.position.set(2, 4, 5);
  spot.castShadow = true;
  scene.add(spot);

  // Blue rim light
  const rimLight = new THREE.PointLight(0x00eaff, 0.7, 8);
  rimLight.position.set(-2, 2, 4);
  scene.add(rimLight);

  // Shield
  shield = createShield();
  scene.add(shield);

  clock = new THREE.Clock();

  // Open/close shield every 3s
  setInterval(() => {
    shieldState = 1 - shieldState;
  }, 3000);

  window.addEventListener('resize', onWindowResize, false);
  animate();
}

function onWindowResize() {
  camera.aspect = container.offsetWidth / container.offsetHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.offsetWidth, container.offsetHeight);
}

function animate() {
  requestAnimationFrame(animate);
  // Animate shieldAnim towards shieldState
  shieldAnim += (shieldState - shieldAnim) * 0.07;
  animateShieldOpenClose();
  shield.rotation.y += 0.003;
  shield.rotation.x = Math.sin(clock.getElapsedTime() * 0.3) * 0.08;
  renderer.render(scene, camera);
}

initThree();

// --- 3D Neural Network/AI Particle Animation (Three.js, interactive) ---
const aiBg = document.getElementById('ai-bg');
let aiScene, aiCamera, aiRenderer, aiParticles, aiLines, aiParticlePositions, aiLinePositions, aiColors, aiColorVals, aiMouse = {x:0,y:0}, aiFrame = 0;
const AI_PARTICLE_COUNT = 80;
const AI_CONNECTION_DIST = 1.1;

function initAIParticles() {
  aiScene = new THREE.Scene();
  aiCamera = new THREE.PerspectiveCamera(60, aiBg.offsetWidth / aiBg.offsetHeight, 0.1, 100);
  aiCamera.position.set(0, 0, 5);

  aiRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  aiRenderer.setClearColor(0x0a1833, 1);
  aiRenderer.setSize(aiBg.offsetWidth, aiBg.offsetHeight);
  aiRenderer.setPixelRatio(window.devicePixelRatio);
  aiBg.appendChild(aiRenderer.domElement);

  // Particles
  aiParticlePositions = [];
  aiColorVals = [];
  for (let i = 0; i < AI_PARTICLE_COUNT; i++) {
    aiParticlePositions.push(
      (Math.random() - 0.5) * 3.5,
      (Math.random() - 0.5) * 2.5,
      (Math.random() - 0.5) * 2.5
    );
    aiColorVals.push(Math.random(), Math.random(), Math.random());
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(aiParticlePositions, 3));
  aiColors = new Float32Array(AI_PARTICLE_COUNT * 3);
  geometry.setAttribute('color', new THREE.BufferAttribute(aiColors, 3));
  const material = new THREE.PointsMaterial({ size: 0.08, vertexColors: true });
  aiParticles = new THREE.Points(geometry, material);
  aiScene.add(aiParticles);

  // Lines
  aiLinePositions = new Float32Array(AI_PARTICLE_COUNT * AI_PARTICLE_COUNT * 3 * 2);
  const lineGeom = new THREE.BufferGeometry();
  lineGeom.setAttribute('position', new THREE.BufferAttribute(aiLinePositions, 3));
  const lineMat = new THREE.LineBasicMaterial({ color: 0x00eaff, transparent: true, opacity: 0.25 });
  aiLines = new THREE.LineSegments(lineGeom, lineMat);
  aiScene.add(aiLines);

  aiBg.addEventListener('mousemove', (e) => {
    const rect = aiBg.getBoundingClientRect();
    aiMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    aiMouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  });

  window.addEventListener('resize', onAIResize, false);
  animateAIParticles();
}

function onAIResize() {
  aiCamera.aspect = aiBg.offsetWidth / aiBg.offsetHeight;
  aiCamera.updateProjectionMatrix();
  aiRenderer.setSize(aiBg.offsetWidth, aiBg.offsetHeight);
}

function animateAIParticles() {
  aiFrame++;
  // Animate particles
  const positions = aiParticles.geometry.attributes.position.array;
  for (let i = 0; i < AI_PARTICLE_COUNT; i++) {
    const ix = i * 3;
    // Move in a wavy pattern, plus mouse influence
    positions[ix] += Math.sin(aiFrame * 0.008 + i) * 0.002 + (aiMouse.x * 0.01 - positions[ix] * 0.0005);
    positions[ix+1] += Math.cos(aiFrame * 0.009 + i) * 0.002 + (aiMouse.y * 0.01 - positions[ix+1] * 0.0005);
    positions[ix+2] += Math.sin(aiFrame * 0.007 + i) * 0.001;
    // Color shift
    aiColors[ix] = 0.5 + 0.5 * Math.sin(aiFrame * 0.01 + i);
    aiColors[ix+1] = 0.5 + 0.5 * Math.sin(aiFrame * 0.013 + i + 2);
    aiColors[ix+2] = 0.5 + 0.5 * Math.sin(aiFrame * 0.017 + i + 4);
  }
  aiParticles.geometry.attributes.position.needsUpdate = true;
  aiParticles.geometry.attributes.color.needsUpdate = true;

  // Draw lines between close particles
  let ptr = 0;
  for (let i = 0; i < AI_PARTICLE_COUNT; i++) {
    for (let j = i + 1; j < AI_PARTICLE_COUNT; j++) {
      const ix = i * 3, jx = j * 3;
      const dx = positions[ix] - positions[jx];
      const dy = positions[ix+1] - positions[jx+1];
      const dz = positions[ix+2] - positions[jx+2];
      const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
      if (dist < AI_CONNECTION_DIST) {
        aiLinePositions[ptr++] = positions[ix];
        aiLinePositions[ptr++] = positions[ix+1];
        aiLinePositions[ptr++] = positions[ix+2];
        aiLinePositions[ptr++] = positions[jx];
        aiLinePositions[ptr++] = positions[jx+1];
        aiLinePositions[ptr++] = positions[jx+2];
      }
    }
  }
  aiLines.geometry.setDrawRange(0, ptr / 3);
  aiLines.geometry.attributes.position.needsUpdate = true;

  // Camera slight movement for depth
  aiCamera.position.x = aiMouse.x * 0.3;
  aiCamera.position.y = aiMouse.y * 0.2;

  aiRenderer.render(aiScene, aiCamera);
  requestAnimationFrame(animateAIParticles);
}

initAIParticles();