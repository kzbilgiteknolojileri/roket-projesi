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

let rocket = null;
let animationId = null;
let stars = [];
let countdownTimer = null;

// ---- Ses motoru ----
let audioCtx = null;
function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
}

function playBeep(frequency = 800, duration = 0.15) {
    try {
        const ctx2 = getAudioCtx();
        const osc = ctx2.createOscillator();
        const gain = ctx2.createGain();
        osc.type = 'sine';
        osc.frequency.value = frequency;
        gain.gain.setValueAtTime(0.2, ctx2.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx2.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx2.destination);
        osc.start();
        osc.stop(ctx2.currentTime + duration);
    } catch (e) { console.warn('Ses hatası:', e); }
}

function playLaunchSound() {
    try {
        const ctx2 = getAudioCtx();
        // Düşük frekanslı gürültü + yükselen frekans
        const osc = ctx2.createOscillator();
        const gain = ctx2.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(60, ctx2.currentTime);
        osc.frequency.exponentialRampToValueAtTime(180, ctx2.currentTime + 2.5);
        gain.gain.setValueAtTime(0.25, ctx2.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx2.currentTime + 2.5);
        osc.connect(gain);
        gain.connect(ctx2.destination);
        osc.start();
        osc.stop(ctx2.currentTime + 2.5);

        // Gürültü efekti (whoosh)
        const bufferSize = ctx2.sampleRate * 2.5;
        const buffer = ctx2.createBuffer(1, bufferSize, ctx2.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx2.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = ctx2.createGain();
        noiseGain.gain.setValueAtTime(0.1, ctx2.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx2.currentTime + 2.5);
        const filter = ctx2.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(ctx2.destination);
        noise.start();
    } catch (e) { console.warn('Ses hatası:', e); }
}

// ---- Canvas boyutlandırma ----
function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    if (rocket) rocket.recalculateAcceleration(canvas.height);
}
window.addEventListener('resize', () => { resizeCanvas(); initStars(); });

// ---- Roket sınıfı ----
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
        this.trail = []; // Alev izi
        this.recalculateAcceleration(canvas.height);
    }

    recalculateAcceleration(canvasHeight) {
        // Gezegene göre hız faktörü: kaçış hızı yüksekse daha hızlı kalkar
        // Formül: 0.8 + 0.4 * (escapeVelocity / 60)
        const speedFactor = 0.8 + 0.4 * (this.planet.escapeVelocity / 60);
        // Hedef süre: hız faktörüne göre 12 saniye civarı
        // Jüpiter (factor 1.2)  -> 10 sn
        // Plüton (factor 0.815) -> 14.7 sn
        const targetTime = 12 / speedFactor;
        this.netAcceleration = 2 * canvasHeight / (targetTime * targetTime);
        this.targetTime = targetTime;
    }

    reset() {
        this.y = canvas.height - 80;
        this.vy = 0;
        this.status = 'idle';
        this.trail = [];
        this.recalculateAcceleration(canvas.height);
        if (animationId) { cancelAnimationFrame(animationId); animationId = null; }
        statusMessage.textContent = `Bekleniyor... (${this.planet.name})`;
        statusMessage.style.color = '#aaa';
        launchBtn.disabled = false;
        resetBtn.disabled = true;
        drawScene();
    }

    start() {
        this.status = 'launching';
        this.vy = 0;
        this.trail = [];
        statusMessage.textContent = '🚀 Ateşlendi!';
        statusMessage.style.color = '#ffaa00';
        launchBtn.disabled = true;
        resetBtn.disabled = false;
        if (animationId) cancelAnimationFrame(animationId);
        lastTime = 0;
        animationId = requestAnimationFrame(animate);
    }

    update(dt) {
        if (this.status === 'launching') {
            this.vy += this.netAcceleration * dt;
            this.y -= this.vy * dt;

            // Alev izi
            this.trail.push({ x: this.x, y: this.y + this.height / 2, life: 1 });
            if (this.trail.length > 80) this.trail.shift();
            this.trail.forEach(t => t.life -= dt * 1.5);
            this.trail = this.trail.filter(t => t.life > 0);

            if (this.y + this.height < 0) {
                this.status = 'launched';
                statusMessage.textContent = '✅ Görev Tamamlandı';
                statusMessage.style.color = '#00cc66';
                launchBtn.disabled = false;
                db.collection('rockets').doc(`rocket${this.id}`).update({ status: 'launched' });
            }
        }
    }

    draw() {
        // Alev izi
        this.trail.forEach(t => {
            ctx.fillStyle = `rgba(255, 150, 50, ${t.life * 0.5})`;
            ctx.beginPath();
            ctx.arc(t.x + (Math.random() - 0.5) * 10, t.y + (Math.random() - 0.5) * 20, 6 + Math.random() * 6, 0, Math.PI * 2);
            ctx.fill();
        });

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

        // Kenar çizgisi
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Pencere
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.beginPath();
        ctx.arc(0, -this.height / 4, 8, 0, Math.PI * 2);
        ctx.fill();

        // Alev
        if (this.status === 'launching') {
            const flameLength = 30 + Math.random() * 25;
            const grad = ctx.createLinearGradient(0, this.height / 2, 0, this.height / 2 + flameLength);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.2, '#ffcc00');
            grad.addColorStop(0.6, '#ff4400');
            grad.addColorStop(1, 'rgba(255,0,0,0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(-this.width / 3, this.height / 2);
            ctx.lineTo(0, this.height / 2 + flameLength);
            ctx.lineTo(this.width / 3, this.height / 2);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
    }
}

// ---- Animasyon döngüsü ----
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

function drawScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawStars();
    if (rocket) rocket.draw();
}

// ---- Yıldızlar ----
function initStars() {
    stars = [];
    for (let i = 0; i < 120; i++) {
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

// ---- Geri sayım ----
function runLocalCountdown() {
    let count = 3;
    countdownOverlay.classList.add('active');
    countdownNumber.textContent = count;
    countdownNumber.style.animation = 'none';
    void countdownNumber.offsetWidth; // reflow
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
        }
    }, 1000);
}

function cancelCountdown() {
    if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
    }
    countdownOverlay.classList.remove('active');
}

// ---- Yerel butonlar ----
launchBtn.onclick = async () => {
    const docRef = db.collection('rockets').doc(`rocket${rocketId}`);
    const doc = await docRef.get();
    if (!doc.exists) return;
    const data = doc.data();
    if (data.status === 'idle' || data.status === 'launched') {
        await docRef.update({
            status: 'countdown',
            countdownStart: firebase.firestore.FieldValue.serverTimestamp()
        });
    }
};

resetBtn.onclick = async () => {
    cancelCountdown();
    if (rocket) rocket.reset();
    await db.collection('rockets').doc(`rocket${rocketId}`).update({
        status: 'idle',
        launchTime: null
    });
};

// ---- Firestore dinleyicisi ----
function listenToRocket() {
    db.collection('rockets').doc(`rocket${rocketId}`).onSnapshot(doc => {
        if (doc.exists) {
            const data = doc.data();
            if (data.status === 'countdown' && rocket.status === 'idle' && !countdownTimer) {
                runLocalCountdown();
            } else if (data.status === 'launching' && rocket.status === 'idle') {
                // Kontrol merkezi geri sayımı çoktan yaptıysa direkt ateşle
                cancelCountdown();
                if (!countdownTimer) playLaunchSound();
                rocket.start();
            } else if (data.status === 'launched' && rocket.status !== 'launched') {
                rocket.status = 'launched';
                statusMessage.textContent = '✅ Görev Tamamlandı';
                statusMessage.style.color = '#00cc66';
                launchBtn.disabled = false;
                resetBtn.disabled = false;
            } else if (data.status === 'idle' && rocket.status !== 'idle') {
                cancelCountdown();
                rocket.reset();
            }
        }
    });
}

// ---- Başlatma ----
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