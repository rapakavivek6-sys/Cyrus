const canvas = document.getElementById("cyrusCanvas");
const colorPicker = document.getElementById("colorPicker");
const brushSize = document.getElementById("brushSize");

if (canvas) {
  const ctx = canvas.getContext("2d");
  let drawing = false;
  let currentColor = colorPicker ? colorPicker.value : "#ff00ff";
  let currentSize = brushSize ? parseInt(brushSize.value, 10) : 8;

  function getPos(evt) {
    const rect = canvas.getBoundingClientRect();
    const clientX = evt.clientX ?? (evt.touches && evt.touches[0]?.clientX);
    const clientY = evt.clientY ?? (evt.touches && evt.touches[0]?.clientY);
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  function startDraw(evt) {
    drawing = true;
    draw(evt);
  }

  function endDraw() {
    drawing = false;
    ctx.beginPath();
  }

  function draw(evt) {
    if (!drawing) return;
    const { x, y } = getPos(evt);

    ctx.fillStyle = currentColor;
    ctx.beginPath();
    ctx.arc(x, y, currentSize, 0, Math.PI * 2);
    ctx.fill();
  }

  canvas.addEventListener("mousedown", startDraw);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", endDraw);
  canvas.addEventListener("mouseleave", endDraw);

  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    startDraw(e);
  });
  canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    draw(e);
  });
  canvas.addEventListener("touchend", (e) => {
    e.preventDefault();
    endDraw();
  });

  if (colorPicker) {
    colorPicker.addEventListener("input", (e) => {
      currentColor = e.target.value;
    });
  }

  if (brushSize) {
    brushSize.addEventListener("input", (e) => {
      currentSize = parseInt(e.target.value, 10);
    });
  }
}
