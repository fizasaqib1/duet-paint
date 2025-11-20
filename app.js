const canvas = document.getElementById('paintCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const brushType = document.getElementById('brushType');
const clearBtn = document.getElementById('clearBtn');
const saveBtn = document.getElementById('saveBtn');

const socket = io(window.location.origin);
let drawing = false;
let lastX = 0;
let lastY = 0;

canvas.addEventListener('mousedown', e => { 
  drawing = true; 
  lastX = e.clientX; 
  lastY = e.clientY; 
});
canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('mouseout', () => drawing = false);

canvas.addEventListener('mousemove', e => {
  if (!drawing) return;

  const x = e.clientX;
  const y = e.clientY;
  const color = colorPicker.value;
  const size = brushSize.value;
  const type = brushType.value;

  drawLine(lastX, lastY, x, y, color, size, type);
  socket.emit('drawing', { x0: lastX, y0: lastY, x1: x, y1: y, color, size, type });
  socket.emit('cursor', { id: socket.id, x, y, color });

  lastX = x;
  lastY = y;
});

// draw lines
function drawLine(x0, y0, x1, y1, color, size, type, opacity = 1) {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.globalAlpha = opacity;
  ctx.lineWidth = size;
  ctx.lineCap = 'round';
  ctx.shadowBlur = (type === 'glow') ? 15 : 0;
  ctx.shadowColor = (type === 'glow') ? color : 0;
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.closePath();
  ctx.globalAlpha = 1;
}

// clear canvas
clearBtn.addEventListener('click', () => {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  socket.emit('clearCanvas');
});

// save canvas
saveBtn.addEventListener('click', () => {
  const link = document.createElement('a'); 
  link.download = 'duet-paint.png'; 
  link.href = canvas.toDataURL(); 
  link.click(); 
});

// listen for remote drawing
socket.on('drawing', data => {
  drawLine(data.x0, data.y0, data.x1, data.y1, data.color, data.size, data.type);
});

// listen for clearing
socket.on('clearCanvas', () => ctx.clearRect(0,0,canvas.width,canvas.height));

// cursors
const cursors = {};
socket.on('cursor', data => {
  cursors[data.id] = data;
  drawCursors();
});

function drawCursors() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(const id in cursors){
    const c = cursors[id];
    ctx.beginPath();
    ctx.arc(c.x, c.y, 5, 0, Math.PI*2);
    ctx.fillStyle = c.color;
    ctx.fill();
    ctx.closePath();
  }
}
