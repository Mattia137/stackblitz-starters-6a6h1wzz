const preview = document.getElementById("cursorPreview");
const media = document.getElementById("cursorPreviewMedia");

let targetX = 0;
let targetY = 0;
let currentX = 0;
let currentY = 0;

let lastX = 0;
let lastY = 0;
let rotX = 0;
let rotY = 0;

// smooth follow + tilt
function animate() {
  currentX += (targetX - currentX) * 0.12;
  currentY += (targetY - currentY) * 0.12;

  const vx = currentX - lastX;
  const vy = currentY - lastY;

  // tilt based on velocity (clamped)
  rotY = Math.max(-10, Math.min(10, vx * 0.35));
  rotX = Math.max(-10, Math.min(10, -vy * 0.35));

  preview.style.left = `${currentX}px`;
  preview.style.top = `${currentY}px`;
  preview.style.transform = `translate(-50%, -50%) rotateX(${rotX}deg) rotateY(${rotY}deg)`;

  lastX = currentX;
  lastY = currentY;

  requestAnimationFrame(animate);
}
animate();

// track mouse
window.addEventListener("mousemove", (e) => {
  targetX = e.clientX;
  targetY = e.clientY;
});

// attach hover handlers to list items
document.querySelectorAll(".project").forEach((item) => {
  item.addEventListener("mouseenter", () => {
    const url = item.dataset.preview;
    media.style.backgroundImage = `url("${url}")`;
    preview.classList.add("is-visible");
  });

  item.addEventListener("mouseleave", () => {
    preview.classList.remove("is-visible");
  });
});
