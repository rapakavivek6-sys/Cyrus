// public/js/canvas.js

const canvas = document.getElementById('cyrusCanvas');

if (canvas) {
  const ctx = canvas.getContext('2d');
  const colorPicker = document.getElementById('colorPicker');
  const btnClear = document.getElementById('btnClear');
  const btnSave = document.getElementById('btnSave');

  // ---- NEW: build a visible colour palette bar ----
  const PALETTE_COLORS = [
    '#ff007a', // pink
    '#9b4dff', // purple
    '#4d9bff', // blue
    '#00e676', // green
    '#ffcc00', // yellow
    '#ffffff', // white
    '#000000'  // black
  ];

  // Try to find an existing container, or create one next to the colour input
  let paletteContainer = document.getElementById('colorPalette');
  if (!paletteContainer && colorPicker && colorPicker.parentElement) {
    paletteContainer = document.createElement('div');
    paletteContainer.id = 'colorPalette';
    paletteContainer.className = 'color-palette';
    colorPicker.parentElement.appendChild(paletteContainer);
  }

  // Helper to update which swatch looks "active"
  function setActiveSwatch(color) {
    if (!paletteContainer) return;
    const swatches = paletteContainer.querySelectorAll('.color-swatch');
    swatches.forEach((swatch) => {
      if (swatch.dataset.color.toLowerCase() === color.toLowerCase()) {
        swatch.classList.add('is-active');
      } else {
        swatch.classList.remove('is-active');
      }
    });
  }

  // Actually create the swatch buttons
  if (paletteContainer) {
    PALETTE_COLORS.forEach((hex) => {
      const swatch = document.createElement('button');
      swatch.type = 'button';
      swatch.className = 'color-swatch';
      swatch.dataset.color = hex;
      swatch.style.backgroundColor = hex;

      swatch.addEventListener('click', () => {
        currentColor = hex;
        if (colorPicker) {
          colorPicker.value = hex;
        }
        setActiveSwatch(hex);
      });

      paletteContainer.appendChild(swatch);
    });
  }

  // -------------------------------------------------

  const canvasId = parseInt(canvas.dataset.canvasId, 10);
  const socket = io();

  socket.on('connect', () => {
    console.log('✅ socket connected', socket.id, 'canvasId=', canvasId);
  });

  let drawing = false;
  let currentColor = colorPicker ? colorPicker.value : '#ff007a';
  const pixelSize = 10;

  // Make sure palette highlights the initial colour
  setActiveSwatch(currentColor);

  function drawPixel(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, pixelSize, pixelSize);
  }

  function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const x = Math.floor((clientX - rect.left) / pixelSize) * pixelSize;
    const y = Math.floor((clientY - rect.top) / pixelSize) * pixelSize;
    return { x, y };
  }

  // Join room for this canvas
  socket.emit('join_canvas', { canvasId });

  socket.on('canvas_full', () => {
    alert('This canvas already has 5 active collaborators. Please try again later.');
    window.location.href = '/workspaces';
  });

  socket.on('init_canvas', (state) => {
    clearCanvas();
    state.forEach((item) => {
      if (item.type === 'pixel') {
        drawPixel(item.x, item.y, item.color);
      }
    });
  });

  // --------- Drawing handlers (mouse + touch) ---------

  function startDrawing(e) {
    e.preventDefault();
    drawing = true;
    const { x, y } = getPos(e);
    drawPixel(x, y, currentColor);

    socket.emit('canvas_update', {
      canvasId,
      ops: [{ type: 'pixel', x, y, color: currentColor }]
    });
  }

  function moveDrawing(e) {
    if (!drawing) return;
    e.preventDefault();
    const { x, y } = getPos(e);
    drawPixel(x, y, currentColor);

    socket.emit('canvas_update', {
      canvasId,
      ops: [{ type: 'pixel', x, y, color: currentColor }]
    });
  }

  function stopDrawing() {
    drawing = false;
  }

  // Mouse
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', moveDrawing);
  window.addEventListener('mouseup', stopDrawing);

  // Touch (mobile / tablet)
  canvas.addEventListener('touchstart', startDrawing, { passive: false });
  canvas.addEventListener('touchmove', moveDrawing, { passive: false });
  window.addEventListener('touchend', stopDrawing);

  // ----------------------------------------------------

  if (colorPicker) {
    colorPicker.addEventListener('input', (e) => {
      currentColor = e.target.value;
      setActiveSwatch(currentColor);
    });
  }

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      clearCanvas();
      socket.emit('clear_canvas', { canvasId });
    });
  }

  if (btnSave) {
    btnSave.addEventListener('click', async () => {
      const title = prompt('Artwork title?');
      if (!title) return;

      const imageUrl = canvas.toDataURL('image/png');

      try {
        const res = await fetch('/canvas/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description: 'Created on CYRUS collaborative canvas',
            imageUrl,
            canvasId // ✅ added for "Edit Again"
          })
        });

        const data = await res.json();
        if (data.success) {
          alert('Saved to gallery!');
          window.location.href = '/gallery';
        } else {
          alert('Failed to save artwork');
        }
      } catch (err) {
        console.error(err);
        alert('Error saving artwork.');
      }
    });
  }

  // Receive updates from other users
  socket.on('canvas_update', ({ ops }) => {
    ops.forEach((op) => {
      if (op.type === 'pixel') {
        drawPixel(op.x, op.y, op.color);
      }
    });
  });

  socket.on('clear_canvas', () => {
    clearCanvas();
  });
}
