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

// --- Three.js 3D Shield Animation ---
const container = document.getElementById('three-container');
let scene, camera, renderer, shield, leftHalf, rightHalf, clock, shineMesh;

function createShield() {
  // Shield base geometry (ellipse)
  const shieldGroup = new THREE.Group();

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
  const rightMat = new THREE.MeshPhysicalMaterial({
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

  // Add a subtle shine overlay (glass effect)
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

  // Add a lock icon in the center (simple 3D lock)
  const lockGroup = new THREE.Group();
  const lockBody = new THREE.CylinderGeometry(0.18, 0.18, 0.28, 32);
  const lockMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0.7, roughness: 0.2 });
  const lockMesh = new THREE.Mesh(lockBody, lockMat);
  lockMesh.position.set(0, -0.25, 0.13);
  lockGroup.add(lockMesh);

  const lockArc = new THREE.TorusGeometry(0.13, 0.035, 16, 32, Math.PI);
  const lockArcMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0.7, roughness: 0.2 });
  const lockArcMesh = new THREE.Mesh(lockArc, lockArcMat);
  lockArcMesh.position.set(0, -0.11, 0.13);
  lockArcMesh.rotation.x = Math.PI / 2;
  lockGroup.add(lockArcMesh);

  shieldGroup.add(lockGroup);

  shieldGroup.scale.set(1.7, 1.7, 1.7);
  return shieldGroup;
}

function animateShieldOpenClose() {
  // Animate halves opening and closing
  const t = Math.sin(clock.getElapsedTime() * 1.2) * 0.5 + 0.5; // 0 to 1
  // t: 0 = closed, 1 = open
  leftHalf.rotation.z = THREE.MathUtils.lerp(0, Math.PI / 2.1, t);
  rightHalf.rotation.z = THREE.MathUtils.lerp(0, -Math.PI / 2.1, t);
  shineMesh.material.opacity = 0.13 + 0.07 * Math.abs(Math.sin(clock.getElapsedTime() * 1.2));
}

function initThree() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111111);

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

  // Add a blue rim light for cyber effect
  const rimLight = new THREE.PointLight(0x00eaff, 0.7, 8);
  rimLight.position.set(-2, 2, 4);
  scene.add(rimLight);

  // Shield
  shield = createShield();
  scene.add(shield);

  clock = new THREE.Clock();

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
  animateShieldOpenClose();
  shield.rotation.y += 0.003;
  shield.rotation.x = Math.sin(clock.getElapsedTime() * 0.3) * 0.08;
  renderer.render(scene, camera);
}

initThree();