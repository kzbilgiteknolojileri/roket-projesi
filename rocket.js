const urlParams = new URLSearchParams(window.location.search);
const rocketId = parseInt(urlParams.get('id') || '0');

const planets = [
    { name: 'Merkür', gravity: 3.7, escapeVelocity: 4.3, color: '#8c8c8c' },
    { name: 'Venüs', gravity: 8.87, escapeVelocity: 10.3, color: '#e6b800' },
    { name: 'Dünya', gravity: 9.81, escapeVelocity: 11.2, color: '#4da6ff' },
    { name: 'Mars', gravity: 3.71, escapeVelocity: 5.0, color: '#ff6666' },
    { name: 'Jüpiter', gravity: 24.79, escapeVelocity: 60, color: '#d9b38c' },
    { name: 'Satürn', gravity: 10.44, escapeVelocity: 36, color: '#e6ccb3' },
    { name: 'Uranüs', gravity: 8.69, escapeVelocity: 22, color: '#99ccff' },
    { name: 'Neptün', gravity: 11.15, escapeVelocity: 24, color: '#6666ff' },
    { name: 'Plüton', gravity: 0.62, escapeVelocity: 2.3, color: '#c2c2a3' }
];

const canvas = document.getElementById('rocket-canvas');
const ctx = canvas.getContext('2d');
const statusMessage = document.getElementById('status-message');

let rocket = null;
let animationId = null;
let stars = [];

function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    if (rocket) rocket.recalculateAcceleration(canvas.height, 12);
}
window.addEventListener('resize', () => { resizeCanvas(); initStars(); });

class Rocket {
    constructor(id, planet) {
        this.id = id;
        this.planet = planet;
        this.x = canvas.width / 2;
        this.y = canvas.height - 80;
        this.vy = 0;
        this.status = 'idle';
        this.color = planet.color;
        this.width = 40;
        this.height = 80;
        this.netAcceleration = 0;
        this.recalculateAcceleration(canvas.height, 12);
    }

    recalculateAcceleration(canvasHeight, targetTime) {
        // Hedef sürede ekranın üstüne ulaşmak için gereken ortalama ivme
        const baseAcceleration = 2 * canvasHeight / (targetTime * targetTime);
        // Gezegenin yerçekimine göre ölçekleme (gerçekçilik + süre dengesi)
        const gravityRatio = this.planet.gravity / 9.81;
        this.netAcceleration = baseAcceleration * (0.6 + 0.4 * gravityRatio);
    }

    start() {
        this.status = 'launching';
        this.vy = 0;
        statusMessage.textContent = '🚀 Ateşlendi!';
        statusMessage.style.color = '#ffaa00';
        if (animationId) cancelAnimationFrame(animationId);
        animate(0);
    }

    update(dt) {
        if (this.status === 'launching') {
            this.vy += this.netAcceleration * dt;
            this.y -= this.vy * dt;
            if (this.y + this.height < 0) {
                this.status = 'launched';
                statusMessage.textContent = '✅ Görev Tamamlandı';
                statusMessage.style.color = '#00cc66';
                db.collection('rockets').doc(`rocket${this.id}`).update({ status: 'launched' });
            }
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        // Gövde
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(0, -this.height / 2);
        ctx.lineTo(this.width / 2, this.height / 2);
        ctx.lineTo(-this.width / 2, this.height / 2);
        ctx.closePath();
        ctx.fill();
        // Pencere
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.beginPath();
        ctx.arc(0, -this.height / 4, 8, 0, Math.PI * 2);
        ctx.fill();
        // Alev
        if (this.status === 'launching') {
            const flameLength = 30 + Math.random() * 20;
            const grad = ctx.createLinearGradient(0, this.height / 2, 0, this.height / 2 + flameLength);
            grad.addColorStop(0, '#ffaa00');
            grad.addColorStop(0.5, '#ff4400');
            grad.addColorStop(1, 'rgba(255,0,0,0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(-this.width / 4, this.height / 2);
            ctx.lineTo(0, this.height / 2 + flameLength);
            ctx.lineTo(this.width / 4, this.height / 2);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    }
}

let lastTime = 0;
function animate(time) {
    const dt = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawStars();
    if (rocket) {
        rocket.update(dt);
        rocket.draw();
        if (rocket.status === 'launching') animationId = requestAnimationFrame(animate);
        else animationId = null;
    }
}

function initStars() {
    stars = [];
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1.5,
            brightness: Math.random()
        });
    }
}

function drawStars() {
    stars.forEach(s => {
        ctx.fillStyle = `rgba(255,255,255,${s.brightness})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

function listenToRocket() {
    db.collection('rockets').doc(`rocket${rocketId}`).onSnapshot(doc => {
        if (doc.exists) {
            const data = doc.data();
            if (data.status === 'launching' && rocket.status === 'idle') rocket.start();
            else if (data.status === 'launched' && rocket.status !== 'launched') {
                rocket.status = 'launched';
                statusMessage.textContent = '✅ Görev Tamamlandı';
                statusMessage.style.color = '#00cc66';
            }
        }
    });
}

function init() {
    resizeCanvas();
    initStars();
    rocket = new Rocket(rocketId, planets[rocketId]);
    statusMessage.textContent = `Bekleniyor... (${planets[rocketId].name})`;
    listenToRocket();
    animate(0);
}
init();