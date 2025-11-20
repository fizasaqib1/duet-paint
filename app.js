const canvas = document.getElementById('paintCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const brushType = document.getElementById('brushType');
const clearBtn = document.getElementById('clearBtn');
const saveBtn = document.getElementById('saveBtn');

const socket = io("https://94201f60-373a-41cc-86d3-48c88d75ae26-00-41ol8kgpkytn.sisko.replit.dev");
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
canvas.addEventListener('mousemove', e => drawMove(e.clientX, e.clientY));

canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  drawing = true;
  const touch = e.touches[0];
  lastX = touch.clientX;
  lastY = touch.clientY;
});
canvas.addEventListener('touchend', e => {
  e.preventDefault();
  drawing = false;
});
canvas.addEventListener('touchcancel', e => {
  e.preventDefault();
  drawing = false;
});
canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  const touch = e.touches[0];
  drawMove(touch.clientX, touch.clientY);
});

function drawMove(x, y){
  if(!drawing) return;
  const color = colorPicker.value;
  const size = brushSize.value;
  const type = brushType.value;

  drawLine(lastX, lastY, x, y, color, size, type);
  socket.emit('drawing', { x0: lastX, y0: lastY, x1: x, y1: y, color, size, type });
  socket.emit('cursor', { id: socket.id, x, y, color });

  lastX = x;
  lastY = y;
}

function drawLine(x0, y0, x1, y1, color, size, type, opacity = 1){
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

clearBtn.addEventListener('click', () => {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  socket.emit('clearCanvas');
});

saveBtn.addEventListener('click', () => {
  const link = document.createElement('a'); 
  link.download = 'duet-paint.png'; 
  link.href = canvas.toDataURL(); 
  link.click(); 
});

socket.on('drawing', data => {
  drawLine(data.x0, data.y0, data.x1, data.y1, data.color, data.size, data.type);
});

socket.on('clearCanvas', () => ctx.clearRect(0,0,canvas.width,canvas.height));

const cursors = {};
socket.on('cursor', data => {
  cursors[data.id] = data;
  drawCursors();
});

function drawCursors(){
  ctx.save();
  for(const id in cursors){
    const c = cursors[id];
    ctx.beginPath();
    ctx.arc(c.x, c.y, 5, 0, Math.PI*2);
    ctx.fillStyle = c.color;
    ctx.fill();
    ctx.closePath();
  }
  ctx.restore();
}
