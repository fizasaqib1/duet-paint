const canvas = document.getElementById('paintCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const clearBtn = document.getElementById('clearBtn');
const saveBtn = document.getElementById('saveBtn');

const socket = io('http://localhost:3000');

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
    if (!drawing) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const color = colorPicker.value;
    const size = brushSize.value;

    drawLine(lastX, lastY, x, y, color, size);
    socket.emit('drawing', { x0: lastX, y0: lastY, x1: x, y1: y, color, size });

    lastX = x;
    lastY = y;
});

function drawLine(x0, y0, x1, y1, color, size) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.closePath();
}

socket.on('drawing', data => drawLine(data.x0, data.y0, data.x1, data.y1, data.color, data.size));
socket.on('clearCanvas', () => ctx.clearRect(0, 0, canvas.width, canvas.height));


clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('clearCanvas');
});

saveBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'duet-paint.png';
    link.href = canvas.toDataURL();
    link.click();
});
