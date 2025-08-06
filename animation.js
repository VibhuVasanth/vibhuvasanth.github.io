let scene, camera, renderer, particles, mouse = { x: 0, y: 0 };

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
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const particleCount = 500;
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  const colors = [];

  for (let i = 0; i < particleCount; i++) {
    positions.push((Math.random() - 0.5) * 10); // x
    positions.push((Math.random() - 0.5) * 10); // y
    positions.push((Math.random() - 0.5) * 10); // z

    colors.push(Math.random(), Math.random(), Math.random());
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.1,
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

  // Smoothly rotate particles based on mouse position
  particles.rotation.y += (mouse.x - particles.rotation.y) * 0.05;
  particles.rotation.x += (mouse.y - particles.rotation.x) * 0.05;

  // Update colors dynamically
  const colors = particles.geometry.attributes.color.array;
  for (let i = 0; i < colors.length; i += 3) {
    colors[i] = (colors[i] + 0.01) % 1;       // R
    colors[i + 1] = (colors[i + 1] + 0.01) % 1; // G
    colors[i + 2] = (colors[i + 2] + 0.01) % 1; // B
  }
  particles.geometry.attributes.color.needsUpdate = true;

  renderer.render(scene, camera);
}