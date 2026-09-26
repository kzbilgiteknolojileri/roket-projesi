const urlParams = new URLSearchParams(window.location.search);
const rocketId = parseInt(urlParams.get('id') || '0');

const PLANETS = {
    'Merkür':  { gravity: 3.7,  escapeVelocity: 4.3,  color: '#8c8c8c' },
    'Venüs':   { gravity: 8.87, escapeVelocity: 10.3, color: '#e6b800' },
    'Dünya':   { gravity: 9.81, escapeVelocity: 11.2, color: '#4da6ff' },
    'Mars':    { gravity: 3.71, escapeVelocity: 5.0,  color: '#ff6666' },
    'Jüpiter': { gravity: 24.79,escapeVelocity: 60,   color: '#d9b38c' },
    'Satürn':  { gravity: 10.44,escapeVelocity: 36,   color: '#e6ccb3' },
    'Uranüs':  { gravity: 8.69, escapeVelocity: 22,   color: '#99ccff' },
    'Neptün':  { gravity: 11.15,escapeVelocity: 24,   color: '#6666ff' },
    'Plüton':  { gravity: 0.62, escapeVelocity: 2.3,  color: '#c2c2a3' }
};

const ROCKETS = [
    { name: 'Saturn V',       planet: 'Merkür',  mass: 2970000, thrust: 35100 },
    { name: 'Falcon 9',       planet: 'Venüs',   mass: 549054,  thrust: 7607  },
    { name: 'Ariane 5',       planet: 'Dünya',   mass: 777000,  thrust: 13000 },
    { name: 'Soyuz-FG',       planet: 'Mars',    mass: 305000,  thrust: 4000  },
    { name: 'Long March 5',   planet: 'Jüpiter', mass: 867000,  thrust: 10565 },
    { name: 'H-IIA',          planet: 'Satürn',  mass: 289000,  thrust: 4000  },
    { name: 'Delta IV Heavy', planet: 'Uranüs',  mass: 733000,  thrust: 9480  },
    { name: 'Proton-M',       planet: 'Neptün',  mass: 705000,  thrust: 10532 },
    { name: 'Electron',       planet: 'Plüton',  mass: 13000,   thrust: 162   }
];

const currentRocket = ROCKETS[rocketId];
const currentPlanet = PLANETS[currentRocket.planet];

const canvas = document.getElementById('rocket-canvas');
const ctx = canvas.getContext('2d');
const chartCanvas = document.getElementById('chart-canvas');
const chartCtx = chartCanvas.getContext('2d');

const statusMessage = document.getElementById('status-message');
const launchBtn = document.getElementById('launch-btn');
const resetBtn = document.getElementById('reset-btn');
const countdownOverlay = document.getElementById('countdown-overlay');
const countdownNumber = document.getElementById('countdown-number');
const successOverlay = document.getElementById('success-overlay');
const atmosphereEl = document.getElementById('atmosphere');

const infoSpeed = document.getElementById('info-speed');
const infoAccel = document.getElementById('info-accel');
const infoFuel = document.getElementById('info-fuel');
const infoMass = document.getElementById('info-mass');
const infoAltitude = document.getElementById('info-altitude');
const infoTime = document.getElementById('info-time');
const rocketNameEl = document.getElementById('rocket-name');

rocketNameEl.textContent = currentRocket.name.toUpperCase();

const PIXEL_TO_METERS = 50;

let rocket = null;
let animationId = null;
let stars = [];
let shootingStars = [];
let countdownTimer = null;
let initialSnapshotDone = false;
let isCountdownInitiator = false;
let chartData = [];
let lastChartSample = 0;

// ==== SES ====
let audioCtx = null;
function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
}
function playBeep(frequency = 800, duration = 0.15, volume = 0.2) {
    try {
        const c = getAudioCtx();
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'sine';
        osc.frequency.value = frequency;
        gain.gain.setValueAtTime(volume, c.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
        osc.connect(gain); gain.connect(c.destination);
        osc.start(); osc.stop(c.currentTime + duration);
    } catch (e) {}
}
function playWarningSound() {
    playBeep(400, 0.12, 0.25);
    setTimeout(() => playBeep(400, 0.12, 0.25), 160);
}
function playLaunchSound() {
    try {
        const c = getAudioCtx();
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(60, c.currentTime);
        osc.frequency.exponentialRampToValueAtTime(180, c.currentTime + 2.5);
        gain.gain.setValueAtTime(0.3, c.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 2.5);
        osc.connect(gain); gain.connect(c.destination);
        osc.start(); osc.stop(c.currentTime + 2.5);
        const bufferSize = c.sampleRate * 2.5;
        const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = c.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = c.createGain();
        noiseGain.gain.setValueAtTime(0.12, c.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 2.5);
        const filter = c.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        noise.connect(filter); filter.connect(noiseGain); noiseGain.connect(c.destination);
        noise.start();
    } catch (e) {}
}
function speak(text) {
    if (!('speechSynthesis' in window)) return;
    try {
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'tr-TR';
        u.rate = 1.0;
        u.volume = 1.0;
        speechSynthesis.speak(u);
    } catch (e) {}
}

// ==== CANVAS ====
function getGroundY() { return canvas.height - 90; }
function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    if (rocket) {
        rocket.groundY = getGroundY();
        if (rocket.status === 'idle') rocket.y = rocket.groundY - rocket.height / 2;
        rocket.recalculateAcceleration();
    }
}
window.addEventListener('resize', () => { resizeCanvas(); initStars(); });

// ==== KALKIS SARSINTISI ====
function triggerShake() {
    document.body.classList.remove('shake');
    // Force reflow
    void document.body.offsetWidth;
    document.body.classList.add('shake');
    setTimeout(() => document.body.classList.remove('shake'), 1500);
}

// ==== ROKET SINIFI ====
class Rocket {
    constructor(id, planetData, rocketData) {
        this.id = id;
        this.planet = planetData;
        this.rocketData = rocketData;
        this.groundY = getGroundY();
        this.width = 60;
        this.height = 130;
        this.x = canvas.width / 2;
        this.y = this.groundY - this.height / 2;
        this.vy = 0;
        this.status = 'idle';
        this.color = planetData.color;
        this.trail = [];
        this.fuel = 100;
        this.elapsedTime = 0;
        this.netAcceleration = 0;
        this.targetTime = 12;
        this.initialMass = rocketData.mass;
        this.currentMass = rocketData.mass;
        this.recalculateAcceleration();
    }

    recalculateAcceleration() {
        const startY = this.groundY - this.height / 2;
        const endY = -this.height;
        const travelDistance = startY - endY;
        const speedFactor = 0.8 + 0.4 * (this.planet.escapeVelocity / 60);
        this.targetTime = 12 / speedFactor;
        this.netAcceleration = 2 * travelDistance / (this.targetTime * this.targetTime);
    }

    reset() {
        this.y = this.groundY - this.height / 2;
        this.vy = 0;
        this.status = 'idle';
        this.trail = [];
        this.fuel = 100;
        this.elapsedTime = 0;
        this.currentMass = this.initialMass;
        chartData = [];
        if (animationId) { cancelAnimationFrame(animationId); animationId = null; }
        statusMessage.textContent = `Bekleniyor... (${this.rocketData.name})`;
        statusMessage.style.color = '#aaa';
        launchBtn.disabled = false;
        resetBtn.disabled = true;
        successOverlay.classList.remove('active');
        atmosphereEl.style.opacity = '1';
        updateInfoPanel();
        drawChart();
        drawScene();
    }

    start() {
        this.status = 'launching';
        this.vy = 0;
        this.trail = [];
        this.fuel = 100;
        this.elapsedTime = 0;
        this.currentMass = this.initialMass;
        chartData = [];
        lastChartSample = 0;
        statusMessage.textContent = '🚀 Ateşlendi!';
        statusMessage.style.color = '#ffaa00';
        launchBtn.disabled = true;
        resetBtn.disabled = false;
        successOverlay.classList.remove('active');
        if (animationId) cancelAnimationFrame(animationId);
        lastTime = 0;
        animationId = requestAnimationFrame(animate);

        // Kalkış sarsıntısı - güçlendirilmiş
        triggerShake();
    }

    update(dt) {
        if (this.status === 'launching') {
            this.vy += this.netAcceleration * dt;
            this.y -= this.vy * dt;
            this.elapsedTime += dt;
            this.fuel = Math.max(0, 100 - (this.elapsedTime / this.targetTime) * 100);

            const dryMassRatio = 0.3;
            this.currentMass = this.initialMass * (dryMassRatio + (1 - dryMassRatio) * (this.fuel / 100));

            for (let k = 0; k < 3; k++) {
                this.trail.push({
                    x: this.x + (Math.random() - 0.5) * 14,
                    y: this.y + this.height / 2 + Math.random() * 5,
                    life: 1,
                    size: 8 + Math.random() * 14,
                    vx: (Math.random() - 0.5) * 30
                });
            }
            if (this.trail.length > 200) this.trail.shift();
            this.trail.forEach(t => {
                t.life -= dt * 0.8;
                t.y += dt * 20;
                t.x += t.vx * dt;
                t.size += dt * 15;
            });
            this.trail = this.trail.filter(t => t.life > 0);

            const startY = this.groundY - this.height / 2;
            const altRatio = Math.min(1, (startY - this.y) / (startY + this.height));
            atmosphereEl.style.opacity = String(Math.max(0, 1 - altRatio * 1.2));

            if (this.elapsedTime - lastChartSample > 0.15) {
                lastChartSample = this.elapsedTime;
                const speedMs = Math.abs(this.vy) * PIXEL_TO_METERS;
                const altM = Math.max(0, (startY - this.y) * PIXEL_TO_METERS);
                chartData.push({ t: this.elapsedTime, speed: speedMs, alt: altM });
                if (chartData.length > 200) chartData.shift();
            }

            if (this.y + this.height / 2 < 0) {
                this.status = 'launched';
                statusMessage.textContent = '';
                launchBtn.disabled = false;
                resetBtn.disabled = false;
                successOverlay.classList.add('active');
                atmosphereEl.style.opacity = '0';
                setTimeout(() => {
                    db.collection('rockets').doc(`rocket${this.id}`).update({ status: 'launched' });
                }, 1500);
            }
        }
    }

    darken(color, factor) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        return `rgb(${Math.floor(r * factor)}, ${Math.floor(g * factor)}, ${Math.floor(b * factor)})`;
    }

    draw() {
        this.trail.forEach(t => {
            const alpha = t.life * 0.5;
            const gradient = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, t.size);
            gradient.addColorStop(0, `rgba(255, 230, 150, ${alpha})`);
            gradient.addColorStop(0.3, `rgba(200, 150, 100, ${alpha * 0.7})`);
            gradient.addColorStop(0.7, `rgba(120, 120, 120, ${alpha * 0.4})`);
            gradient.addColorStop(1, `rgba(80, 80, 80, 0)`);
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(t.x, t.y, t.size, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.save();
        ctx.translate(this.x, this.y);
        const w = this.width;
        const h = this.height;

        ctx.fillStyle = '#cc2222';
        ctx.strokeStyle = '#881111';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-w * 0.3, h * 0.1);
        ctx.lineTo(-w * 0.7, h * 0.5);
        ctx.lineTo(-w * 0.3, h * 0.45);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(w * 0.3, h * 0.1);
        ctx.lineTo(w * 0.7, h * 0.5);
        ctx.lineTo(w * 0.3, h * 0.45);
        ctx.closePath(); ctx.fill(); ctx.stroke();

        ctx.fillStyle = '#3a3a3a';
        ctx.beginPath();
        ctx.moveTo(-w * 0.2, h * 0.4);
        ctx.lineTo(-w * 0.32, h * 0.5);
        ctx.lineTo(w * 0.32, h * 0.5);
        ctx.lineTo(w * 0.2, h * 0.4);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        const bodyGrad = ctx.createLinearGradient(-w * 0.3, 0, w * 0.3, 0);
        bodyGrad.addColorStop(0, this.darken(this.color, 0.55));
        bodyGrad.addColorStop(0.25, this.color);
        bodyGrad.addColorStop(0.75, this.color);
        bodyGrad.addColorStop(1, this.darken(this.color, 0.55));
        ctx.fillStyle = bodyGrad;
        ctx.fillRect(-w * 0.3, -h * 0.3, w * 0.6, h * 0.7);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.lineWidth = 2;
        ctx.strokeRect(-w * 0.3, -h * 0.3, w * 0.6, h * 0.7);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillRect(-w * 0.3, -h * 0.05, w * 0.6, 4);
        ctx.fillRect(-w * 0.3, h * 0.12, w * 0.6, 4);

        ctx.fillStyle = '#cc2222';
        ctx.beginPath();
        ctx.moveTo(0, -h * 0.5);
        ctx.lineTo(w * 0.3, -h * 0.3);
        ctx.lineTo(-w * 0.3, -h * 0.3);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#881111';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.beginPath();
        ctx.moveTo(-w * 0.15, -h * 0.42);
        ctx.lineTo(0, -h * 0.5);
        ctx.lineTo(-w * 0.05, -h * 0.32);
        ctx.closePath(); ctx.fill();

        ctx.fillStyle = 'rgba(100, 180, 255, 0.95)';
        ctx.beginPath();
        ctx.arc(0, -h * 0.12, w * 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(-w * 0.05, -h * 0.15, w * 0.05, 0, Math.PI * 2);
        ctx.fill();

        if (this.status === 'launching' && this.fuel > 0) {
            const flameLength = 60 + Math.random() * 40;
            const flameWidth = w * 0.55;
            const flameGrad = ctx.createLinearGradient(0, h * 0.5, 0, h * 0.5 + flameLength);
            flameGrad.addColorStop(0, '#ffffff');
            flameGrad.addColorStop(0.15, '#ffff00');
            flameGrad.addColorStop(0.4, '#ff8800');
            flameGrad.addColorStop(0.75, '#ff2200');
            flameGrad.addColorStop(1, 'rgba(200, 0, 0, 0)');
            ctx.fillStyle = flameGrad;
            ctx.beginPath();
            ctx.moveTo(-flameWidth / 2, h * 0.5);
            ctx.quadraticCurveTo(-flameWidth * 0.7, h * 0.5 + flameLength * 0.6, 0, h * 0.5 + flameLength);
            ctx.quadraticCurveTo(flameWidth * 0.7, h * 0.5 + flameLength * 0.6, flameWidth / 2, h * 0.5);
            ctx.closePath(); ctx.fill();
            ctx.fillStyle = 'rgba(255, 255, 220, 0.9)';
            ctx.beginPath();
            ctx.moveTo(-flameWidth * 0.2, h * 0.5);
            ctx.quadraticCurveTo(0, h * 0.5 + flameLength * 0.5, 0, h * 0.5 + flameLength * 0.7);
            ctx.quadraticCurveTo(0, h * 0.5 + flameLength * 0.5, flameWidth * 0.2, h * 0.5);
            ctx.closePath(); ctx.fill();
        }
        ctx.restore();
    }
}

// ==== BİLGİ PANELİ ====
function updateInfoPanel() {
    if (!rocket) return;
    const speedMs = Math.abs(rocket.vy) * PIXEL_TO_METERS;
    const accelMs2 = rocket.status === 'launching' ? rocket.netAcceleration * PIXEL_TO_METERS : 0;
    const startY = rocket.groundY - rocket.height / 2;
    const altitudeM = Math.max(0, (startY - rocket.y) * PIXEL_TO_METERS);

    infoSpeed.textContent = `${Math.round(speedMs).toLocaleString('tr-TR')} m/s`;
    infoAccel.textContent = `${Math.round(accelMs2).toLocaleString('tr-TR')} m/s²`;
    infoFuel.textContent = `${Math.round(rocket.fuel)}%`;
    const massTons = rocket.currentMass / 1000;
    infoMass.textContent = `${massTons.toFixed(1)} t`;
    infoAltitude.textContent = `${Math.round(altitudeM).toLocaleString('tr-TR')} m`;
    infoTime.textContent = `${rocket.elapsedTime.toFixed(1)} s`;

    if (rocket.fuel < 30) infoFuel.style.color = '#ff4444';
    else if (rocket.fuel < 60) infoFuel.style.color = '#ffaa00';
    else infoFuel.style.color = '#00cc66';
}

// ==== GRAFİK ====
function drawChart() {
    const w = chartCanvas.width;
    const h = chartCanvas.height;
    chartCtx.clearRect(0, 0, w, h);

    chartCtx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    chartCtx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
        chartCtx.beginPath();
        chartCtx.moveTo(0, (h / 4) * i);
        chartCtx.lineTo(w, (h / 4) * i);
        chartCtx.stroke();
    }

    if (chartData.length < 2) {
        chartCtx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        chartCtx.font = '11px monospace';
        chartCtx.textAlign = 'center';
        chartCtx.fillText('Veri bekleniyor...', w / 2, h / 2);
        return;
    }

    const maxSpeed = Math.max(...chartData.map(d => d.speed), 1);
    const maxAlt = Math.max(...chartData.map(d => d.alt), 1);
    const maxT = chartData[chartData.length - 1].t || 1;

    const padding = 4;
    const innerW = w - padding * 2;
    const innerH = h - padding * 2;

    chartCtx.strokeStyle = '#ffaa00';
    chartCtx.lineWidth = 2;
    chartCtx.beginPath();
    chartData.forEach((d, i) => {
        const x = padding + (d.t / maxT) * innerW;
        const y = h - padding - (d.speed / maxSpeed) * innerH;
        if (i === 0) chartCtx.moveTo(x, y);
        else chartCtx.lineTo(x, y);
    });
    chartCtx.stroke();

    chartCtx.strokeStyle = '#00ccff';
    chartCtx.beginPath();
    chartData.forEach((d, i) => {
        const x = padding + (d.t / maxT) * innerW;
        const y = h - padding - (d.alt / maxAlt) * innerH;
        if (i === 0) chartCtx.moveTo(x, y);
        else chartCtx.lineTo(x, y);
    });
    chartCtx.stroke();
}

// ==== GEZEGEN ====
function drawPlanet() {
    if (!rocket) return;
    const groundY = getGroundY();
    const curveHeight = 90;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(0, groundY + curveHeight);
    ctx.quadraticCurveTo(canvas.width / 2, groundY - curveHeight, canvas.width, groundY + curveHeight);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    const planetGrad = ctx.createLinearGradient(0, groundY - curveHeight, 0, canvas.height);
    planetGrad.addColorStop(0, rocket.planet.color);
    planetGrad.addColorStop(1, rocket.darken(rocket.planet.color, 0.3));
    ctx.fillStyle = planetGrad;
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, groundY + curveHeight);
    ctx.quadraticCurveTo(canvas.width / 2, groundY - curveHeight, canvas.width, groundY + curveHeight);
    ctx.stroke();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    for (let i = 0; i < 18; i++) {
        const x = (i * 137 + 50) % canvas.width;
        const y = groundY + 30 + Math.sin(i) * 30 + (i * 23) % 50;
        const r = 5 + (i * 7) % 18;
        ctx.beginPath();
        ctx.ellipse(x, y, r, r * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();

    ctx.save();
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.fillText(rocket.rocketData.planet.toUpperCase(), canvas.width - 30, canvas.height - 40);
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fillText(`YERÇEKİMİ: ${rocket.planet.gravity} m/s²  •  KAÇIŞ HIZI: ${rocket.planet.escapeVelocity} km/s`, canvas.width - 30, canvas.height - 18);
    ctx.restore();
}

// ==== YILDIZLAR ====
function initStars() {
    stars = [];
    for (let i = 0; i < 130; i++) {
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
function spawnShootingStar() {
    if (Math.random() < 0.012 && shootingStars.length < 3) {
        shootingStars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height * 0.5,
            vx: -(4 + Math.random() * 4),
            vy: 2 + Math.random() * 3,
            life: 1
        });
    }
}
function updateAndDrawShootingStars(dt) {
    spawnShootingStar();
    shootingStars.forEach(s => {
        s.x += s.vx * 60 * dt;
        s.y += s.vy * 60 * dt;
        s.life -= dt * 0.6;
        if (s.life > 0) {
            const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 10, s.y - s.vy * 10);
            grad.addColorStop(0, `rgba(255, 255, 255, ${s.life})`);
            grad.addColorStop(0.5, `rgba(180, 200, 255, ${s.life * 0.5})`);
            grad.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.strokeStyle = grad;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(s.x - s.vx * 10, s.y - s.vy * 10);
            ctx.stroke();
            ctx.fillStyle = `rgba(255, 255, 255, ${s.life})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    shootingStars = shootingStars.filter(s => s.life > 0 && s.y < canvas.height && s.x > -100);
}

// ==== ANİMASYON ====
let lastTime = 0;
function animate(time) {
    const dt = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawStars();
    updateAndDrawShootingStars(dt);
    drawPlanet();
    if (rocket) {
        rocket.update(dt);
        rocket.draw();
        updateInfoPanel();
        drawChart();
        if (rocket.status === 'launching') animationId = requestAnimationFrame(animate);
        else animationId = null;
    }
}
function drawScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawStars();
    drawPlanet();
    if (rocket) rocket.draw();
    updateInfoPanel();
    drawChart();
}

// ==== GERİ SAYIM ====
function runLocalCountdown() {
    if (countdownTimer) return;
    let count = 3;
    countdownOverlay.classList.add('active');
    countdownNumber.textContent = count;
    countdownNumber.style.animation = 'none';
    void countdownNumber.offsetWidth;
    countdownNumber.style.animation = 'countdownPulse 0.8s ease-out';
    playWarningSound();
    speak('Üç');
    statusMessage.textContent = '⏱️ Geri sayım...';
    statusMessage.style.color = '#ffcc00';
    launchBtn.disabled = true;

    countdownTimer = setInterval(() => {
        count--;
        if (count > 0) {
            countdownNumber.textContent = count;
            countdownNumber.style.animation = 'none';
            void countdownNumber.offsetWidth;
            countdownNumber.style.animation = 'countdownPulse 0.8s ease-out';
            const words = { 2: 'İki', 1: 'Bir' };
            speak(words[count] || String(count));
            playWarningSound();
        } else {
            clearInterval(countdownTimer);
            countdownTimer = null;
            countdownOverlay.classList.remove('active');
            speak('Ateş!');
            playLaunchSound();
            rocket.start();
            if (isCountdownInitiator) {
                db.collection('rockets').doc(`rocket${rocketId}`).update({
                    status: 'launching',
                    launchTime: firebase.firestore.FieldValue.serverTimestamp()
                });
                isCountdownInitiator = false;
            }
        }
    }, 1000);
}

function cancelCountdown() {
    if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
    countdownOverlay.classList.remove('active');
}

// ==== YEREL BUTONLAR ====
launchBtn.onclick = async () => {
    playBeep(900, 0.08, 0.15);
    try {
        isCountdownInitiator = true;
        await db.collection('rockets').doc(`rocket${rocketId}`).update({
            status: 'countdown',
            countdownStart: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (e) {}
};

resetBtn.onclick = async () => {
    playBeep(500, 0.1, 0.15);
    cancelCountdown();
    if (rocket) rocket.reset();
    try {
        await db.collection('rockets').doc(`rocket${rocketId}`).update({
            status: 'idle',
            launchTime: null
        });
    } catch (e) {}
};

// ==== DİNLEYİCİ ====
function listenToRocket() {
    db.collection('rockets').doc(`rocket${rocketId}`).onSnapshot(doc => {
        if (!doc.exists) return;
        const data = doc.data();

        if (!initialSnapshotDone) {
            initialSnapshotDone = true;
            if (data.status === 'launched') {
                rocket.status = 'launched';
                rocket.y = -rocket.height;
                successOverlay.classList.add('active');
                launchBtn.disabled = false;
                resetBtn.disabled = false;
                atmosphereEl.style.opacity = '0';
                drawScene();
            } else if (data.status === 'countdown') {
                runLocalCountdown();
            } else if (data.status === 'launching') {
                playLaunchSound();
                rocket.start();
            }
            return;
        }

        if (data.status === 'countdown') {
            if (!countdownTimer && rocket.status !== 'launching') {
                if (rocket.status !== 'idle') rocket.reset();
                runLocalCountdown();
            }
        } else if (data.status === 'launching') {
            if (rocket.status !== 'launching' && !countdownTimer) {
                cancelCountdown();
                playLaunchSound();
                rocket.start();
            }
        } else if (data.status === 'launched') {
            if (rocket.status !== 'launched') {
                rocket.status = 'launched';
                launchBtn.disabled = false;
                resetBtn.disabled = false;
                successOverlay.classList.add('active');
                atmosphereEl.style.opacity = '0';
            }
        } else if (data.status === 'idle') {
            if (rocket.status !== 'idle' && !countdownTimer) {
                cancelCountdown();
                rocket.reset();
            }
        }
    });
}

// ==== BAŞLATMA ====
function init() {
    resizeCanvas();
    initStars();
    rocket = new Rocket(rocketId, currentPlanet, currentRocket);
    statusMessage.textContent = `Bekleniyor... (${currentRocket.name})`;
    resetBtn.disabled = true;
    atmosphereEl.style.opacity = '1';
    drawScene();
    listenToRocket();
    document.body.addEventListener('click', () => getAudioCtx(), { once: true });
}
init();