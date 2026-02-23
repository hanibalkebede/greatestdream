const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
let W = canvas.width = window.innerWidth;
let H = canvas.height = window.innerHeight;

window.addEventListener('resize', () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight });

// Game state
let lanes = 5;
let laneHeight = H / lanes;
let laneCenters = () => Array.from({ length: lanes }, (_, i) => Math.floor((i + 0.5) * laneHeight));
let centers = laneCenters();

let snake = {
    type: 'normal',
    lane: 2,
    x: Math.floor(W * 0.2),
    color: '#0f0',
    size: 14,
    length: 6,
    segments: [],
    speed: 2.0,
    baseSpeed: 2.0,
    invincible: false,
    shape: 'snake'
};

let game = { running: false, paused: false, score: 0 };

const hudSpeed = document.getElementById('speed');
const hudScore = document.getElementById('score');

// Items on the road
let objects = [];
let bigPointTimer = 0;

function spawnObject() {
    // spawn regular small points near center or sides of lanes
    let lane = Math.floor(Math.random() * lanes);
    let side = Math.random() < 0.6 ? 'middle' : 'side';
    let obj = { x: W + 40 + Math.random() * 400, lane, r: side === 'middle' ? 8 : 10, type: 'point' };
    objects.push(obj);
}

function spawnBigPoint() {
    let lane = Math.floor(Math.random() * lanes);
    objects.push({ x: W + 200, lane, r: 24, type: 'big' });
}

function resetSegments() {
    snake.segments = [];
    for (let i = 0; i < snake.length; i++) snake.segments.push({ x: snake.x - i * (snake.size + 2), y: centers[snake.lane] });
}

resetSegments();

// Selection UI
document.querySelectorAll('.choice').forEach(el => el.addEventListener('click', (e) => {
    snake.type = el.dataset.type;
    document.getElementById('overlay').style.display = 'none';
    game.running = true;
    game.paused = true; // wait for space to start moving
}));

// Controls
window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'a') { snake.lane = Math.max(0, snake.lane - 1); }
    if (k === 'd') { snake.lane = Math.min(lanes - 1, snake.lane + 1); }
    if (k === ' ') { game.paused = !game.paused; }
    if (k === 'w') { snake.speed = Math.min(12, snake.speed + 1); }
    if (k === 's') { snake.speed = Math.max(0.5, snake.speed - 1); }
    if (k === 'e') { snake.color = '#' + Math.floor(Math.random() * 16777215).toString(16); }
    if (k === 'r') { triggerFire(); }
    if (k === 'q') { snake.invincible = !snake.invincible; }
    if (k === 't') { transformRandom(); }
    if (k === 'f') { snake.shape = 'car'; }
    if (k === 'g') { triggerWater(); }
    if (k === 'c') { snake.shape = 'fish'; }
    if (k === 'y') { snake.size = Math.max(6, snake.size - 4); }
});

// Effects
let fireTimer = 0, waterTimer = 0;
function triggerFire() { fireTimer = 40; }
function triggerWater() { waterTimer = 40; }
function transformRandom() { const opts = ['lion', 'bird', 'tiger']; snake.shape = opts[Math.floor(Math.random() * opts.length)]; }

// Game loop
let last = 0;
function loop(ts) {
    if (!last) last = ts;
    let dt = (ts - last) / 16.666; last = ts;
    update(dt);
    draw();
    requestAnimationFrame(loop);
}

function update(dt) {
    centers = laneCenters();
    if (!game.running) return;
    if (game.paused) return;

    // spawn objects occasionally
    if (Math.random() < 0.02) spawnObject();
    bigPointTimer += dt;
    if (bigPointTimer > 800) { spawnBigPoint(); bigPointTimer = 0; }

    // move objects left to simulate forward motion
    let roadSpeed = snake.speed || snake.baseSpeed;
    objects.forEach(o => o.x -= roadSpeed * dt);
    objects = objects.filter(o => o.x > -100);

    // move snake forward (x increases when not paused)
    snake.x += roadSpeed * dt;
    // wrap to make endless (when reaches right, push objects forward)
    if (snake.x > W * 0.6) { // shift world
        let shift = snake.x - W * 0.2;
        snake.x = W * 0.2;
        objects.forEach(o => o.x -= shift);
    }

    // smooth lane movement for head
    let targetY = centers[snake.lane];
    let headY = snake.segments[0].y;
    headY += (targetY - headY) * 0.2;
    snake.segments[0].y = headY;

    // follow head for other segments
    for (let i = 1; i < snake.segments.length; i++) {
        let a = snake.segments[i - 1];
        let b = snake.segments[i];
        let dx = a.x - b.x; let dy = a.y - b.y;
        b.x += dx * 0.2; b.y += dy * 0.2;
    }

    // keep adding segments until length
    while (snake.segments.length < snake.length) {
        let lastSeg = snake.segments[snake.segments.length - 1];
        snake.segments.push({ x: lastSeg.x - (snake.size + 2), y: lastSeg.y });
    }

    // collision with objects
    for (let i = objects.length - 1; i >= 0; i--) {
        let o = objects[i];
        let dx = (o.x - snake.segments[0].x);
        let dy = (centers[o.lane] - snake.segments[0].y);
        if (Math.hypot(dx, dy) < o.r + snake.size) {
            if (o.type === 'point') {
                objects.splice(i, 1);
                snake.length += 1; game.score += 10; resetSegments();
            } else if (o.type === 'big') {
                objects.splice(i, 1);
                snake.length += 4; game.score += 50; resetSegments();
            }
        }
    }

    // fire/water timers reduce
    if (fireTimer > 0) fireTimer -= dt; if (waterTimer > 0) waterTimer -= dt;

    // update HUD
    hudSpeed.textContent = 'Speed: ' + (snake.speed || snake.baseSpeed).toFixed(1);
    hudScore.textContent = 'Score: ' + game.score;
}

function draw() {
    ctx.clearRect(0, 0, W, H);
    drawRoad();
    drawObjects();
    drawSnake();
    drawEffects();
}

function drawRoad() {
    // asphalt
    ctx.fillStyle = '#222'; ctx.fillRect(0, 0, W, H);
    // lanes (5) with five lines and highway style
    ctx.strokeStyle = '#666'; ctx.lineWidth = 2;
    for (let i = 0; i < lanes; i++) {
        // lane separators
        if (i < lanes - 1) {
            ctx.setLineDash([40, 20]);
            ctx.beginPath(); ctx.moveTo(0, (i + 1) * laneHeight); ctx.lineTo(W, (i + 1) * laneHeight); ctx.stroke();
        }
    }
    ctx.setLineDash([]);
}

function drawObjects() {
    objects.forEach(o => {
        let y = centers[o.lane];
        if (o.type === 'point') {
            ctx.fillStyle = '#ffdd00'; ctx.beginPath(); ctx.arc(o.x, y, o.r, 0, Math.PI * 2); ctx.fill();
        } else if (o.type === 'big') {
            ctx.fillStyle = '#ff00aa'; ctx.beginPath(); ctx.arc(o.x, y, o.r, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#fff'; ctx.stroke();
        }
    });
}

function drawSnake() {
    // head
    for (let i = snake.segments.length - 1; i >= 0; i--) {
        let s = snake.segments[i];
        let sz = snake.size * (1 - i / snake.segments.length * 0.6);
        ctx.fillStyle = (i === 0 ? snake.color : shadeColor(snake.color, -10 * i));
        if (snake.shape === 'car') ctx.fillStyle = '#c00';
        ctx.beginPath(); ctx.ellipse(s.x, s.y, sz, sz * 0.7, 0, 0, Math.PI * 2); ctx.fill();
        if (snake.type === 'cobra' && i === 0) { // hood
            ctx.fillStyle = 'rgba(255,200,0,0.6)'; ctx.beginPath(); ctx.ellipse(s.x - 20, s.y, sz * 1.2, sz * 1.6, 0, 0, Math.PI * 2); ctx.fill();
        }
        if (snake.type === 'winged' && i === 0) { ctx.fillStyle = 'rgba(200,200,255,0.6)'; ctx.fillRect(s.x - 10, s.y - 30, 10, 20); ctx.fillRect(s.x - 10, s.y + 10, 10, 20); }
    }
}

function drawEffects() {
    if (fireTimer > 0) {
        ctx.fillStyle = 'rgba(255,90,0,0.9)'; ctx.beginPath(); ctx.moveTo(snake.segments[0].x + 20, snake.segments[0].y);
        ctx.lineTo(snake.segments[0].x + 80, snake.segments[0].y - 30);
        ctx.lineTo(snake.segments[0].x + 80, snake.segments[0].y + 30);
        ctx.closePath(); ctx.fill();
    }
    if (waterTimer > 0) { ctx.fillStyle = 'rgba(0,140,255,0.6)'; ctx.beginPath(); ctx.arc(snake.segments[0].x + 40, snake.segments[0].y, 30, 0, Math.PI * 2); ctx.fill(); }
}

function shadeColor(color, percent) {
    let f = parseInt(color.slice(1), 16), t = percent < 0 ? 0 : 255, p = percent < 0 ? percent * -1 : percent;
    let R = f >> 16, G = f >> 8 & 0x00FF, B = f & 0x0000FF;
    let nr = Math.round((t - R) * p / 100) + R;
    let ng = Math.round((t - G) * p / 100) + G;
    let nb = Math.round((t - B) * p / 100) + B;
    return `#${(nr << 16 | ng << 8 | nb).toString(16).padStart(6, '0')}`;
}

// Start loop
requestAnimationFrame(loop);
