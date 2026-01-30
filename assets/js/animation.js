const canvas = document.getElementById('textCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];
const particleCount = 3000;
const textSize = 200;
const text = 'Vibhu Vasanth';

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = (Math.random() - 0.5) * 4;
    this.radius = Math.random() * 2 + 1;
    this.opacity = 0.8;
    this.color = `hsl(${Math.random() * 60 + 200}, 100%, 60%)`;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.98;
    this.vy *= 0.98;
    this.opacity -= 0.008;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.opacity;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawText() {
  ctx.font = `bold ${textSize}px Arial`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
}

function getParticlesFromText() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = `bold ${textSize}px Arial`;
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const textPixels = [];

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 128) {
      textPixels.push(i / 4);
    }
  }

  return textPixels;
}

function createParticles() {
  const textPixels = getParticlesFromText();
  particles.length = 0;

  for (let i = 0; i < particleCount && i < textPixels.length; i++) {
    const pixelIndex = textPixels[Math.floor(Math.random() * textPixels.length)];
    const x = (pixelIndex % canvas.width);
    const y = Math.floor(pixelIndex / canvas.width);
    particles.push(new Particle(x, y));
  }
}

function animate() {
  ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(102, 126, 234, 0.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw text outline lightly
  drawText();

  // Update and draw particles
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].draw();

    if (particles[i].opacity <= 0) {
      particles.splice(i, 1);
    }
  }

  // Add new particles from text
  if (Math.random() < 0.3 && particles.length < particleCount) {
    const textPixels = getParticlesFromText();
    if (textPixels.length > 0) {
      const pixelIndex = textPixels[Math.floor(Math.random() * textPixels.length)];
      const x = (pixelIndex % canvas.width);
      const y = Math.floor(pixelIndex / canvas.width);
      particles.push(new Particle(x, y));
    }
  }

  requestAnimationFrame(animate);
}

// Handle window resize
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  createParticles();
});

// Start animation
createParticles();
animate();
