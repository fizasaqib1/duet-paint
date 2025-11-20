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
  const rect = canvas.getBoundingClientRect();
  lastX = e.clientX - rect.left;
  lastY = e.clientY - rect.top;
});
canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('mouseout', () => drawing = false);
canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  drawMove(x, y);
});

canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  drawing = true;
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  lastX = touch.clientX - rect.left;
  lastY = touch.clientY - rect.top;
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
  const rect = canvas.getBoundingClientRect();
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;
  drawMove(x, y);
});

function drawMove(x, y){
  if(!drawing) return;
  const color = colorPicker.value;
  const size = brushSize.value;
  const type = brushType.value;

  drawLine(lastX, lastY, x, y, color, size, type);
  socket.emit('drawing', { x0: lastX, y0: lastY, x1: x, y1: y, color, size, type });

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

window.addEventListener('resize', () => {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.putImageData(imageData, 0, 0);
});