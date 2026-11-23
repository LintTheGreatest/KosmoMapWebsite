const viewport = document.getElementById('viewport');
const canvas = document.getElementById('canvas');

let scale = 1;
let pointX = 0;
let pointY = 0;

// Panning state variables
let isPanning = false;
let startX = 0;
let startY = 0;

// Helper to apply the CSS transform
function updateTransform() {
  canvas.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
}

// 1. Zoom at cursor position using the Mouse Wheel
viewport.addEventListener('wheel', (e) => {
  e.preventDefault(); // Prevent default page scrolling

  // Get cursor position relative to the viewport
  const rect = viewport.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // Calculate the cursor's position inside the unscaled canvas
  const xs = (mouseX - pointX) / scale;
  const ys = (mouseY - pointY) / scale;

  // Determine zoom direction and clamp scale between 0.2x and 5x
  const zoomFactor = 1.1;
  const newScale = e.deltaY < 0 ? scale * zoomFactor : scale / zoomFactor;
  scale = Math.min(Math.max(0.1, newScale), 100);

  // Adjust translation so the point under the cursor stays in the same place
  pointX = mouseX - xs * scale;
  pointY = mouseY - ys * scale;

  updateTransform();
}, { passive: false });

// 2. Pan using Middle Mouse Button (e.button === 1)
viewport.addEventListener('mousedown', (e) => {
  if (e.button === 1) { // 1 is the Middle Mouse Button
    e.preventDefault(); // Prevents the browser's default auto-scroll circle icon
    isPanning = true;
    startX = e.clientX - pointX;
    startY = e.clientY - pointY;
  }
});

window.addEventListener('mousemove', (e) => {
  if (!isPanning) return;
  pointX = e.clientX - startX;
  pointY = e.clientY - startY;
  updateTransform();
});

window.addEventListener('mouseup', (e) => {
  if (e.button === 1) {
    isPanning = false;
  }
});

function resetView() {
  pointX = viewport.clientWidth / 3;
  pointY = 0;
  updateTransform();
}