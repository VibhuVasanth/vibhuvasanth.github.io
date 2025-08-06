let scene, camera, renderer, particleSystem;

async function loadConfig() {
  const response = await fetch("config.json");
  return await response.json();
}

function createParticles(config) {
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  const colors = [];

  for (let i = 0; i < config.particleCount; i++) {
    const x = (Math.random() - 0.5) * 10;
    const y = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    positions.push(x, y, z);

    const color = new THREE.Color();
    color.setHSL(Math.random(), config.colorSaturation, config.colorLightness);
    colors.push(color.r, color.g, color.b);
  }

  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: config.particleSize,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  return new THREE.Points(geometry, material);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate(config) {
  requestAnimationFrame(() => animate(config));
  particleSystem.rotation.x += config.rotationSpeedX;
  particleSystem.rotation.y += config.rotationSpeedY;
  renderer.render(scene, camera);
}

async function init() {
  const config = await loadConfig();

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000);
  document.body.appendChild(renderer.domElement);

  particleSystem = createParticles(config);
  scene.add(particleSystem);

  window.addEventListener("resize", onWindowResize, false);

  animate(config);
}

init();