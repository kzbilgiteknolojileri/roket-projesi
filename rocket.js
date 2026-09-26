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
const launchBtn = document.getElementById('launch-btn');
const resetBtn = document.getElementById('reset-btn');
const countdownOverlay = document.getElementById('countdown-overlay');
const countdownNumber = document.getElementById('countdown-number');
const successOverlay = document.getElementById('success-overlay');
const infoSpeed = document.getElementById('info-speed');
const infoAccel = document.getElementById('info-accel');
const infoFuel = document.getElementById('info-fuel');
const infoAltitude = document.getElementById('info-altitude');
const infoTime = document.getElementById('info-time');

const PIXEL_TO_METERS = 50;

let rocket = null;
let animationId = null;
let stars = [];
let countdownTimer = null;
let initialSnapshotDone = false;
let isCountdownInitiator = false;

// ==== SES MOTORU ====
let audioCtx = null;
function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
}
function playBeep(frequency = 800, duration = 0.15) {
    try {
        const c = getAudioCtx();
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'sine';
        osc.frequency.value = frequency;
        gain.gain.setValueAtTime(0.2, c.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
        osc.connect(gain); gain.connect(c.destination);
        osc.start(); osc.stop(c.currentTime + duration);
    } catch (e) { console.warn('Ses hatası:', e); }
}
function playLaunchSound() {
    try {
        const c = getAudioCtx();
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(60, c.currentTime);
        osc.frequency.exponentialRampToValueAtTime(180, c.currentTime + 2.5);
        gain.gain.setValueAtTime(0.25, c.currentTime);
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
        noiseGain.gain.setValueAtTime(0.1, c.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 2.5);
        const filter = c.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        noise.connect(filter); filter.connect(noiseGain); noiseGain.connect(c.destination);
        noise.start();
    } catch (e) { console.warn('Ses hatası:', e); }
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

// ==== ROKET SINIFI ====
class Rocket {
    constructor(id, planet) {
        this.id = id;
        this.planet = planet;
        this.groundY = getGroundY();
        this.width = 60;
        this.height = 130;
        this.x = canvas.width / 2;
        this.y = this.groundY - this.height / 2;
        this.vy = 0;
        this.status = 'idle';
        this.color = planet.color;
        this.trail = [];
        this.fuel = 100;
        this.elapsedTime = 0;
        this.netAcceleration = 0;
        this.targetTime = 12;
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
        if (animationId) { cancelAnimationFrame(animationId); animationId = null; }
        statusMessage.textContent = `Bekleniyor... (${this.planet.name})`;
        statusMessage.style.color = '#aaa';
        launchBtn.disabled = false;
        resetBtn.disabled = true;
        successOverlay.classList.remove('active');
        updateInfoPanel();
        drawScene();
    }

    start() {
        this.status = 'launching';
        this.vy = 0;
        this.trail = [];
        this.fuel = 100;
        this.elapsedTime = 0;
        statusMessage.textContent = '🚀 Ateşlendi!';
        statusMessage.style.color = '#ffaa00';
        launchBtn.disabled = true;
        resetBtn.disabled = false;
        successOverlay.classList.remove('active');
        if (animationId) cancelAnimationFrame(animationId);
        lastTime = 0;
        animationId = requestAnimationFrame(animate);
    }

    update(dt) {
        if (this.status === 'launching') {
            this.vy += this.netAcceleration * dt;
            this.y -= this.vy * dt;
            this.elapsedTime += dt;
            this.fuel = Math.max(0, 100 - (this.elapsedTime / this.targetTime) * 100);

            this.trail.push({
                x: this.x + (Math.random() - 0.5) * 10,
                y: this.y + this.height / 2,
                life: 1,
                size: 6 + Math.random() * 10
            });
            if (this.trail.length > 120) this.trail.shift();
            this.trail.forEach(t => t.life -= dt * 1.1);
            this.trail = this.trail.filter(t => t.life > 0);

            if (this.y + this.height / 2 < 0) {
                this.status = 'launched';
                statusMessage.textContent = '';
                launchBtn.disabled = false;
                resetBtn.disabled = false;
                successOverlay.classList.add('active');
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
            const alpha = t.life * 0.6;
            const gradient = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, t.size);
            gradient.addColorStop(0, `rgba(255, 220, 100, ${alpha})`);
            gradient.addColorStop(0.5, `rgba(255, 100, 0, ${alpha * 0.6})`);
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

        // KANATÇIKLAR
        ctx.fillStyle = '#cc2222';
        ctx.strokeStyle = '#881111';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-w * 0.3, h * 0.1);
        ctx.lineTo(-w * 0.7, h * 0.5);
        ctx.lineTo(-w * 0.3, h * 0.45);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(w * 0.3, h * 0.1);
        ctx.lineTo(w * 0.7, h * 0.5);
        ctx.lineTo(w * 0.3, h * 0.45);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // NOZZLE
        ctx.fillStyle = '#3a3a3a';
        ctx.beginPath();
        ctx.moveTo(-w * 0.2, h * 0.4);
        ctx.lineTo(-w * 0.32, h * 0.5);
        ctx.lineTo(w * 0.32, h * 0.5);
        ctx.lineTo(w * 0.2, h * 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // GÖVDE
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

        // ŞERİTLER
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillRect(-w * 0.3, -h * 0.05, w * 0.6, 4);
        ctx.fillRect(-w * 0.3, h * 0.12, w * 0.6, 4);

        // BURUN
        ctx.fillStyle = '#cc2222';
        ctx.beginPath();
        ctx.moveTo(0, -h * 0.5);
        ctx.lineTo(w * 0.3, -h * 0.3);
        ctx.lineTo(-w * 0.3, -h * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#881111';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.beginPath();
        ctx.moveTo(-w * 0.15, -h * 0.42);
        ctx.lineTo(0, -h * 0.5);
        ctx.lineTo(-w * 0.05, -h * 0.32);
        ctx.closePath();
        ctx.fill();

        // PENCERE
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

        // ALEV
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
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = 'rgba(255, 255, 220, 0.9)';
            ctx.beginPath();
            ctx.moveTo(-flameWidth * 0.2, h * 0.5);
            ctx.quadraticCurveTo(0, h * 0.5 + flameLength * 0.5, 0, h * 0.5 + flameLength * 0.7);
            ctx.quadraticCurveTo(0, h * 0.5 + flameLength * 0.5, flameWidth * 0.2, h * 0.5);
            ctx.closePath();
            ctx.fill();
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
    const altitudePx = startY - rocket.y;
    const altitudeM = Math.max(0, altitudePx) * PIXEL_TO_METERS;

    infoSpeed.textContent = `${Math.round(speedMs).toLocaleString('tr-TR')} m/s`;
    infoAccel.textContent = `${Math.round(accelMs2).toLocaleString('tr-TR')} m/s²`;
    infoFuel.textContent = `${Math.round(rocket.fuel)}%`;
    infoAltitude.textContent = `${Math.round(altitudeM).toLocaleString('tr-TR')} m`;
    infoTime.textContent = `${rocket.elapsedTime.toFixed(1)} s`;

    if (rocket.fuel < 30) infoFuel.style.color = '#ff4444';
    else if (rocket.fuel < 60) infoFuel.style.color = '#ffaa00';
    else infoFuel.style.color = '#00cc66';
}

// ==== GEZEGEN ÇİZİMİ ====
function drawPlanet() {
    if (!rocket) return;
    const groundY = getGroundY();
    const curveHeight = 70;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(0, groundY + curveHeight);
    ctx.quadraticCurveTo(canvas.width / 2, groundY - curveHeight, canvas.width, groundY + curveHeight);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    const planetGrad = ctx.createLinearGradient(0, groundY - curveHeight, 0, canvas.height);
    planetGrad.addColorStop(0, rocket.planet.color);
    planetGrad.addColorStop(1, rocket.darken(rocket.planet.color, 0.35));
    ctx.fillStyle = planetGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, groundY + curveHeight);
    ctx.quadraticCurveTo(canvas.width / 2, groundY - curveHeight, canvas.width, groundY + curveHeight);
    ctx.stroke();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    for (let i = 0; i < 15; i++) {
        const x = (i * 137 + 50) % canvas.width;
        const y = groundY + 30 + Math.sin(i) * 30 + (i * 23) % 40;
        const r = 5 + (i * 7) % 15;
        ctx.beginPath();
        ctx.ellipse(x, y, r, r * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fillText(rocket.planet.name.toUpperCase(), canvas.width - 30, canvas.height - 30);
    ctx.font = '12px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fillText(`Yerçekimi: ${rocket.planet.gravity} m/s²`, canvas.width - 30, canvas.height - 12);
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

// ==== ANİMASYON ====
let lastTime = 0;
function animate(time) {
    const dt = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawStars();
    drawPlanet();
    if (rocket) {
        rocket.update(dt);
        rocket.draw();
        updateInfoPanel();
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
}

// ==== GERİ SAYIM ====
function runLocalCountdown() {
    if (countdownTimer) return; // zaten çalışıyor
    let count = 3;
    countdownOverlay.classList.add('active');
    countdownNumber.textContent = count;
    countdownNumber.style.animation = 'none';
    void countdownNumber.offsetWidth;
    countdownNumber.style.animation = 'countdownPulse 0.8s ease-out';
    playBeep(600, 0.2);
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
            playBeep(600, 0.2);
        } else {
            clearInterval(countdownTimer);
            countdownTimer = null;
            countdownOverlay.classList.remove('active');
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
    try {
        isCountdownInitiator = true;
        await db.collection('rockets').doc(`rocket${rocketId}`).update({
            status: 'countdown',
            countdownStart: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (e) { console.warn('Ateşleme hatası:', e); }
};

resetBtn.onclick = async () => {
    cancelCountdown();
    if (rocket) rocket.reset();
    try {
        await db.collection('rockets').doc(`rocket${rocketId}`).update({
            status: 'idle',
            launchTime: null
        });
    } catch (e) { console.warn(e); }
};

// ==== FIRESTORE DİNLEYİCİSİ ====
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
                drawScene();
            } else if (data.status === 'countdown') {
                runLocalCountdown();
            } else if (data.status === 'launching') {
                playLaunchSound();
                rocket.start();
            }
            return;
        }

        // Sonraki değişiklikler
        if (data.status === 'countdown') {
            if (!countdownTimer && rocket.status !== 'launching') {
                // Önceki durumdan (launched vs.) kalan görüntüyü temizle
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
    rocket = new Rocket(rocketId, planets[rocketId]);
    statusMessage.textContent = `Bekleniyor... (${planets[rocketId].name})`;
    resetBtn.disabled = true;
    drawScene();
    listenToRocket();
}
init();