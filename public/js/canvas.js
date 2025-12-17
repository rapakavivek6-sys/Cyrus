const canvas = document.getElementById('cyrusCanvas');

if (canvas) {
  const ctx = canvas.getContext('2d');
  const colorPicker = document.getElementById('colorPicker');
  const btnClear = document.getElementById('btnClear');
  const btnSave = document.getElementById('btnSave');

  const canvasId = parseInt(canvas.dataset.canvasId, 10);

  const socket = io();

  let drawing = false;
  let currentColor = colorPicker ? colorPicker.value : '#ff007a';
  const pixelSize = 10;

  function drawPixel(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, pixelSize, pixelSize);
  }

  function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / pixelSize) * pixelSize;
    const y = Math.floor((e.clientY - rect.top) / pixelSize) * pixelSize;
    return { x, y };
  }

  socket.emit('join_canvas', { canvasId });

  socket.on('canvas_full', () => {
    alert('This canvas already has 5 active collaborators. Please try again later.');
    window.location.href = '/workspaces';
  });

  socket.on('init_canvas', (state) => {
    clearCanvas();
    state.forEach(item => {
      if (item.type === 'pixel') {
        drawPixel(item.x, item.y, item.color);
      }
    });
  });

  canvas.addEventListener('mousedown', (e) => {
    drawing = true;
    const { x, y } = getPos(e);
    drawPixel(x, y, currentColor);

    socket.emit('canvas_update', {
      canvasId,
      ops: [{ type: 'pixel', x, y, color: currentColor }]
    });
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!drawing) return;
    const { x, y } = getPos(e);
    drawPixel(x, y, currentColor);

    socket.emit('canvas_update', {
      canvasId,
      ops: [{ type: 'pixel', x, y, color: currentColor }]
    });
  });

  window.addEventListener('mouseup', () => {
    drawing = false;
  });

  if (colorPicker) {
    colorPicker.addEventListener('input', (e) => {
      currentColor = e.target.value;
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

      const res = await fetch('/canvas/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: 'Created on CYRUS collaborative canvas',
          imageUrl
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('Saved to gallery!');
        window.location.href = '/gallery';
      } else {
        alert('Failed to save artwork');
      }
    });
  }

  socket.on('canvas_update', ({ ops }) => {
    ops.forEach(op => {
      if (op.type === 'pixel') {
        drawPixel(op.x, op.y, op.color);
      }
    });
  });

  socket.on('clear_canvas', () => {
    clearCanvas();
  });
}
