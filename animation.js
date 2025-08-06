import * as THREE from 'three';

let camera, scene, renderer;
let particles, particleMaterial;
let mouseX = 0, mouseY = 0;

const particleCount = 1000;
const particlePositions = new Float32Array(particleCount * 3) ;

init();
animate();

function init() {
    // Set up camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 200;

    // Set up scene
    scene = new THREE.Scene();

    // Create particles
    particleMaterial = new THREE.PointsMaterial({
        color: 0xcccccc,
        size: 2,
        transparent: true,
        blending: THREE.AdditiveBlending
    });

    const geometry = new THREE.BufferGeometry();
    for (let i = 0; i < particleCount; i++) {
        // Initial random positions for particles
        particlePositions[i * 3] = (Math.random() * 2 - 1) * 50;
        particlePositions[i * 3 + 1] = (Math.random() * 2 - 1) * 50;
        particlePositions[i * 3 + 2] = (Math.random() * 2 - 1) * 50;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    particles = new THREE.Points(geometry, particleMaterial);
    scene.add(particles);

    // Set up renderer
    renderer = new THREE.WebGLRenderer({ alpha: true }); // Crucial for transparent background
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Mouse move event listener
    document.addEventListener('mousemove', onDocumentMouseMove);
    window.addEventListener('resize', onWindowResize);
}

function onDocumentMouseMove(event) {
    // Update mouse coordinates based on event
    mouseX = (event.clientX - window.innerWidth / 2);
    mouseY = (event.clientY - window.innerHeight / 2);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    // Animate particles
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        // Simple easing effect to follow the mouse
        particlePositions[i3] += (mouseX / 2 - particlePositions[i3]) * 0.05;
        particlePositions[i3 + 1] += (-mouseY / 2 - particlePositions[i3 + 1]) * 0.05;
    }
    particles.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
}
