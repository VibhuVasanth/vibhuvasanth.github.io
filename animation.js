let scene, camera, renderer, particles, particlePositions, particleVelocities;
let mouse = new THREE.Vector3();

// 🔧 Config is now hardcoded
const config = {
  particleCount: 300,
  particleSize: 0.15,
  colorSpeed: 0.01,
  followStrength: 0.02
};

init();
animate();

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 10;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const geometry = new THREE.BufferGeometry();
  particlePositions = new Float32Array(config.particleCount * 3);
  particleVelocities = new Float32Array(config.particleCount * 3);
  const colors = new Float32Array(config.particleCount * 3);

  for (let i = 0; i < config.particleCount; i++) {
    const i3 = i * 3;
    particlePositions[i3] = (Math.random() - 0.5) * 20;
    particlePositions[i3 + 1] = (Math.random() - 0.5) * 20;
    particlePositions[i3 + 2] = (Math.random() - 0.5) * 20;

    particleVelocities[i3] = 0;
    particleVelocities[i3 + 1] = 0;
    particleVelocities[i3 + 2] = 0;

    colors[i3] = Math.random();
    colors[i3 + 1] = Math.random();
    colors[i3 + 2] = Math.random();
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: config.particleSize,
    vertexColors: true,
    transparent: true,
    opacity: 0.9
  });

  particles = new THREE.Points(geometry, material);
  scene.add(particles);

  window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
    vector.unproject(camera);
    mouse.copy(vector);
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function animate() {
  requestAnimationFrame(animate);

  const positions = particles.geometry.attributes.position.array;
  const colors = particles.geometry.attributes.color.array;

  for (let i = 0; i < config.particleCount; i++) {
    const i3 = i * 3;

    const px = positions[i3];
    const py = positions[i3 + 1];
    const pz = positions[i3 + 2];

    const dx = mouse.x - px;
    const dy = mouse.y - py;
    const dz = mouse.z - pz;

    particleVelocities[i3] += dx * config.followStrength;
    particleVelocities[i3 + 1] += dy * config.followStrength;
    particleVelocities[i3 + 2] += dz * config.followStrength;

    particleVelocities[i3] *= 0.9;
    particleVelocities[i3 + 1] *= 0.9;
    particleVelocities[i3 + 2] *= 0.9;

    positions[i3] += particleVelocities[i3];
    positions[i3 + 1] += particleVelocities[i3 + 1];
    positions[i3 + 2] += particleVelocities[i3 + 2];

    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    colors[i3] = (colors[i3] + config.colorSpeed + dist * 0.0005) % 1;
    colors[i3 + 1] = (colors[i3 + 1] + config.colorSpeed + dist * 0.0005) % 1;
    colors[i3 + 2] = (colors[i3 + 2] + config.colorSpeed + dist * 0.0005) % 1;
  }

  particles.geometry.attributes.position.needsUpdate = true;
  particles.geometry.attributes.color.needsUpdate = true;

  renderer.render(scene, camera);
}