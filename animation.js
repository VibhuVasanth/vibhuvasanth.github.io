// --- Dropdown menu logic ---
const menuBtn = document.getElementById('menuBtn');
const dropdown = document.getElementById('dropdownMenu');
if (menuBtn && dropdown) {
  menuBtn.onclick = (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('show');
  };
  window.onclick = (e) => {
    if (!dropdown.contains(e.target) && e.target !== menuBtn) {
      dropdown.classList.remove('show');
    }
  };
}

// --- Smooth scroll for anchor links ---
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
    if (dropdown) dropdown.classList.remove('show');
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

// --- 3D Neural Network/AI Particle Animation (Three.js, interactive) ---
const aiBg = document.getElementById('ai-bg');
let aiScene, aiCamera, aiRenderer, aiParticles, aiLines, aiParticlePositions, aiLinePositions, aiColors, aiMouse = {x:0,y:0}, aiFrame = 0;
const AI_PARTICLE_COUNT = 120;
const AI_CONNECTION_DIST = 1.2;

function initAIParticles() {
  aiScene = new THREE.Scene();
  aiCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  aiCamera.position.set(0, 0, 5);

  aiRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  aiRenderer.setClearColor(0x0a1833, 1);
  aiRenderer.setSize(window.innerWidth, window.innerHeight);
  aiRenderer.setPixelRatio(window.devicePixelRatio);
  aiBg.appendChild(aiRenderer.domElement);

  // Particles
  aiParticlePositions = [];
  aiColors = new Float32Array(AI_PARTICLE_COUNT * 3);
  for (let i = 0; i < AI_PARTICLE_COUNT; i++) {
    aiParticlePositions.push(
      (Math.random() - 0.5) * 3.5,
      (Math.random() - 0.5) * 2.5,
      (Math.random() - 0.5) * 2.5
    );
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(aiParticlePositions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(aiColors, 3));
  const material = new THREE.PointsMaterial({ size: 0.12, vertexColors: true });
  aiParticles = new THREE.Points(geometry, material);
  aiScene.add(aiParticles);

  // Lines
  aiLinePositions = new Float32Array(AI_PARTICLE_COUNT * AI_PARTICLE_COUNT * 3 * 2);
  const lineGeom = new THREE.BufferGeometry();
  lineGeom.setAttribute('position', new THREE.BufferAttribute(aiLinePositions, 3));
  const lineMat = new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.35 });
  aiLines = new THREE.LineSegments(lineGeom, lineMat);
  aiScene.add(aiLines);

  aiBg.addEventListener('mousemove', (e) => {
    aiMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    aiMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  window.addEventListener('resize', onAIResize, false);
  animateAIParticles();
}

function onAIResize() {
  aiCamera.aspect = window.innerWidth / window.innerHeight;
  aiCamera.updateProjectionMatrix();
  aiRenderer.setSize(window.innerWidth, window.innerHeight);
}

function animateAIParticles() {
  aiFrame++;
  const positions = aiParticles.geometry.attributes.position.array;
  for (let i = 0; i < AI_PARTICLE_COUNT; i++) {
    const ix = i * 3;
    positions[ix] += Math.sin(aiFrame * 0.008 + i) * 0.002 + (aiMouse.x * 0.01 - positions[ix] * 0.0005);
    positions[ix+1] += Math.cos(aiFrame * 0.009 + i) * 0.002 + (aiMouse.y * 0.01 - positions[ix+1] * 0.0005);
    positions[ix+2] += Math.sin(aiFrame * 0.007 + i) * 0.001;
    aiColors[ix] = 0.5 + 0.5 * Math.sin(aiFrame * 0.01 + i);
    aiColors[ix+1] = 0.5 + 0.5 * Math.sin(aiFrame * 0.013 + i + 2);
    aiColors[ix+2] = 0.5 + 0.5 * Math.sin(aiFrame * 0.017 + i + 4);
  }
  aiParticles.geometry.attributes.position.needsUpdate = true;
  aiParticles.geometry.attributes.color.needsUpdate = true;

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

  aiCamera.position.x = aiMouse.x * 0.3;
  aiCamera.position.y = aiMouse.y * 0.2;

  aiRenderer.render(aiScene, aiCamera);
  requestAnimationFrame(animateAIParticles);
}

initAIParticles();