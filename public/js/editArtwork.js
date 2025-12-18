// public/js/editArtwork.js
const canvas = document.getElementById('cyrusCanvas');
if (!canvas) throw new Error('Canvas element not found');

const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const btnClear = document.getElementById('btnClear');
const btnSave = document.getElementById('btnSave');

const artworkId = parseInt(canvas.dataset.artworkId, 10);
const pixelSize = 10;

let currentColor = colorPicker ? colorPicker.value : '#ff007a';
let drawing = false;

// Load saved state from server (injected into window.__ARTWORK__)
let state = [];
try {
  state = JSON.parse(window.__ARTWORK__?.state_json || '[]');
} catch (e) {
  state = [];
}

function drawPixel(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, pixelSize, pixelSize);
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function redrawFromState() {
  clearCanvas();
  state.forEach((op) => {
    if (op.type === 'pixel') {
      drawPixel(op.x, op.y, op.color);
    }
  });
}

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  const x = Math.floor((clientX - rect.left) / pixelSize) * pixelSize;
  const y = Math.floor((clientY - rect.top) / pixelSize) * pixelSize;
  return { x, y };
}

function addPixel(x, y, color) {
  state.push({ type: 'pixel', x, y, color });
  drawPixel(x, y, color);
}

// Initial render
redrawFromState();

// Drawing handlers
function startDrawing(e) {
  e.preventDefault();
  drawing = true;
  const { x, y } = getPos(e);
  addPixel(x, y, currentColor);
}

function moveDrawing(e) {
  if (!drawing) return;
  e.preventDefault();
  const { x, y } = getPos(e);
  addPixel(x, y, currentColor);
}

function stopDrawing() {
  drawing = false;
}

// Mouse events
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', moveDrawing);
window.addEventListener('mouseup', stopDrawing);

// Touch events
canvas.addEventListener('touchstart', startDrawing, { passive: false });
canvas.addEventListener('touchmove', moveDrawing, { passive: false });
window.addEventListener('touchend', stopDrawing);

// Colour picker
if (colorPicker) {
  colorPicker.addEventListener('input', (e) => {
    currentColor = e.target.value;
  });
}

// Clear button
if (btnClear) {
  btnClear.addEventListener('click', () => {
    state = [];
    clearCanvas();
  });
}

// Save updates to the same artwork row
if (btnSave) {
  btnSave.addEventListener('click', async () => {
    const imageUrl = canvas.toDataURL('image/png');

    try {
      const res = await fetch(`/artwork/${artworkId}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: window.__ARTWORK__?.title || 'Untitled',
          description: window.__ARTWORK__?.description || '',
          imageUrl,
          stateJson: JSON.stringify(state)
        })
      });

      const data = await res.json();

      if (data.success) {
        alert('Artwork updated!');
        window.location.href = `/gallery/${artworkId}`;
      } else {
        alert(data.message || 'Failed to update artwork');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating artwork.');
    }
  });
}
