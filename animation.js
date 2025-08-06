]let scene, camera, renderer, particles;
let mouse = { x: 0, y: 0 };
let config = {
  particleCount: 500,
  colorSpeed: 0.01,
  particleSize: 0.1
};

// Load config from JSON
fetch('particles.json')
  .then(res => res.json())
  .then(data => {
    config = data;
    init();
    animate();
  })
  .catch(err => {
    console.warn('Could not load particles.json, using defaults.', err);
    init();
    animate();
  });

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const geometry = new THREE.BufferGeometry();
  const positions = [];
  const colors = [];

  for (let i = 0; i < config.particleCount; i++) {
    positions.push((Math.random() - 0.5) * 10);
    positions.push((Math.random() - 0.5) * 10);
    positions.push((Math.random() - 0.5) * 10);

    colors.push(Math.random(), Math.random(), Math.random());
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: config.particleSize,
    vertexColors: true,
    transparent: true,
    opacity: 0.8
  });

  particles = new THREE.Points(geometry, material);
  scene.add(particles);

  window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function animate() {
  requestAnimationFrame(animate);

  particles.rotation.y += (mouse.x - particles.rotation.y) * 0.05;
  particles.rotation.x += (mouse.y - particles.rotation.x) * 0.05;

  const colors = particles.geometry.attributes.color.array;
  for (let i = 0; i < colors.length; i += 3) {
    colors[i] = (colors[i] + config.colorSpeed) % 1;
    colors[i + 1] = (colors[i + 1] + config.colorSpeed) % 1;
    colors[i + 2] = (colors[i + 2] + config.colorSpeed) % 1;
  }
  particles.geometry.attributes.color.needsUpdate = true;

  renderer.render(scene, camera);
}