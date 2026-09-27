// ==== ROKET VE GEZEGEN VERİLERİ ====
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

const rocketCount = 9;
const MASTER_PASSWORD = '1234';

// ==== SES MOTORU ====
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
    } catch (e) {}
}
function playClickSound() { playBeep(900, 0.08, 0.15); }
function playWarningSound() {
    playBeep(400, 0.12, 0.2);
    setTimeout(() => playBeep(400, 0.12, 0.2), 160);
}
function playSuccessSound() {
    try {
        const c = getAudioCtx();
        [523, 659, 784, 1047].forEach((f, i) => {
            const osc = c.createOscillator();
            const gain = c.createGain();
            osc.type = 'sine';
            osc.frequency.value = f;
            const t = c.currentTime + i * 0.1;
            gain.gain.setValueAtTime(0.15, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
            osc.connect(gain); gain.connect(c.destination);
            osc.start(t); osc.stop(t + 0.3);
        });
    } catch (e) {}
}

// ==== SESLİ GERİ SAYIM ====
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

// ==== GİRİŞ EKRANI ====
const loginScreen = document.getElementById('login-screen');
const controlPanel = document.getElementById('control-panel');
const passwordInput = document.getElementById('password-input');
const loginBtn = document.getElementById('login-btn');
const loginError = document.getElementById('login-error');

function checkAuth() {
    if (localStorage.getItem('roket_auth') === 'ok') {
        loginScreen.style.display = 'none';
        controlPanel.style.display = 'block';
        return true;
    }
    return false;
}

function attemptLogin() {
    if (passwordInput.value === MASTER_PASSWORD) {
        localStorage.setItem('roket_auth', 'ok');
        playSuccessSound();
        loginScreen.style.display = 'none';
        controlPanel.style.display = 'block';
        init();
    } else {
        loginError.textContent = '❌ Hatalı şifre!';
        playWarningSound();
        loginScreen.querySelector('.login-box').classList.add('shake');
        setTimeout(() => loginScreen.querySelector('.login-box').classList.remove('shake'), 400);
        passwordInput.value = '';
    }
}

loginBtn.onclick = attemptLogin;
passwordInput.addEventListener('keypress', e => { if (e.key === 'Enter') attemptLogin(); });

// ==== ARAYÜZ ====
const controlsContainer = document.getElementById('rocket-controls');
const launchAllBtn = document.getElementById('launch-all');
const stopAllBtn = document.getElementById('stop-all');
const resetAllBtn = document.getElementById('reset-all');
const headerTime = document.getElementById('header-time');

function createRocketTiles() {
    controlsContainer.innerHTML = '';
    for (let i = 0; i < rocketCount; i++) {
        const r = ROCKETS[i];
        const planetColor = PLANETS[r.planet].color;

        const tile = document.createElement('div');
        tile.className = 'rocket-tile idle';
        tile.id = `rocket-tile-${i}`;

        tile.innerHTML = `
            <div class="tile-header">
                <div class="tile-live">
                    <span class="tile-live-dot"></span>LIVE
                </div>
                <div class="tile-name">${r.name.toUpperCase()}</div>
            </div>
            <div class="tile-body">
                <div class="tile-rocket-icon">🚀</div>
                <div class="tile-status idle" id="tile-status-${i}">BEKLİYOR</div>
            </div>
            <div class="tile-planet-row">
                <span class="tile-planet-dot" style="background:${planetColor}; box-shadow: 0 0 8px ${planetColor};"></span>
                📍 ${r.planet.toUpperCase()}
            </div>
            <div class="tile-actions">
                <button class="tile-btn launch" id="launch-btn-${i}">🚀 ATEŞLE</button>
                <button class="tile-btn reset" id="reset-btn-${i}">🔄</button>
            </div>
        `;

        controlsContainer.appendChild(tile);

        document.getElementById(`launch-btn-${i}`).onclick = () => startCountdown(i);
        document.getElementById(`reset-btn-${i}`).onclick = () => resetRocket(i);
    }
}

// Saat güncelle
function updateClock() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    headerTime.textContent = `${hh}:${mm}:${ss}`;
}
setInterval(updateClock, 1000);
updateClock();

// ==== FIRESTORE ====
async function startCountdown(id) {
    playClickSound();
    try {
        await db.collection('rockets').doc(`rocket${id}`).update({
            status: 'countdown',
            countdownStart: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (e) {
        try {
            await db.collection('rockets').doc(`rocket${id}`).set({
                planet: ROCKETS[id].planet,
                name: ROCKETS[id].name,
                status: 'countdown',
                countdownStart: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (e2) {}
    }
}

async function stopRocket(id) {
    try {
        await db.collection('rockets').doc(`rocket${id}`).update({
            status: 'idle',
            launchTime: null
        });
    } catch (e) {}
}

async function resetRocket(id) {
    playClickSound();
    await stopRocket(id);
}

async function launchAll() {
    for (let i = 0; i < rocketCount; i++) {
        await startCountdown(i);
    }
}

async function stopAll() {
    playBeep(400, 0.2, 0.25);
    for (let i = 0; i < rocketCount; i++) {
        await stopRocket(i);
    }
}

async function resetAll() {
    for (let i = 0; i < rocketCount; i++) {
        await resetRocket(i);
    }
}

// ==== GERİ SAYIM (Master) ====
const activeCountdowns = {};

function runCountdown(id) {
    if (activeCountdowns[id]) return;
    activeCountdowns[id] = true;
    let count = 3;
    playWarningSound();
    speak('Üç');

    const tick = () => {
        if (count > 1) {
            count--;
            const words = { 2: 'İki', 1: 'Bir' };
            speak(words[count] || String(count));
            playWarningSound();
            setTimeout(tick, 1000);
        } else {
            setTimeout(async () => {
                speak('Ateş!');
                playLaunchSound();
                try {
                    await db.collection('rockets').doc(`rocket${id}`).update({
                        status: 'launching',
                        launchTime: firebase.firestore.FieldValue.serverTimestamp()
                    });
                } catch (e) {}
                delete activeCountdowns[id];
            }, 1000);
        }
    };
    setTimeout(tick, 1000);
}

// ==== DİNLEYİCİ ====
function listenToRockets() {
    db.collection('rockets').onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
            const data = change.doc.data();
            const id = parseInt(change.doc.id.replace('rocket', ''));
            if (isNaN(id) || id < 0 || id >= rocketCount) return;
            updateRocketUI(id, data.status);
            if (data.status === 'countdown') runCountdown(id);
        });
    });
}

function updateRocketUI(id, status) {
    const tile = document.getElementById(`rocket-tile-${id}`);
    const statusEl = document.getElementById(`tile-status-${id}`);
    const launchBtn = document.getElementById(`launch-btn-${id}`);
    const resetBtn = document.getElementById(`reset-btn-${id}`);
    if (!tile || !statusEl || !launchBtn || !resetBtn) return;

    tile.className = `rocket-tile ${status}`;
    statusEl.className = `tile-status ${status}`;

    if (status === 'idle') {
        statusEl.textContent = 'BEKLİYOR';
        launchBtn.disabled = false;
        resetBtn.disabled = true;
    } else if (status === 'countdown') {
        statusEl.textContent = 'GERİ SAYIM';
        launchBtn.disabled = true;
        resetBtn.disabled = false;
    } else if (status === 'launching') {
        statusEl.textContent = 'ATEŞLENDİ';
        launchBtn.disabled = true;
        resetBtn.disabled = false;
    } else if (status === 'launched') {
        statusEl.textContent = 'TAMAMLANDI';
        launchBtn.disabled = false;
        resetBtn.disabled = false;
    }
}

// ==== TEMİZLİK ====
async function cleanupStuckRockets() {
    for (let i = 0; i < rocketCount; i++) {
        const docRef = db.collection('rockets').doc(`rocket${i}`);
        try {
            const doc = await docRef.get();
            if (!doc.exists) {
                await docRef.set({
                    planet: ROCKETS[i].planet,
                    name: ROCKETS[i].name,
                    status: 'idle',
                    launchTime: null
                });
            } else {
                const data = doc.data();
                if (data.status === 'countdown' || data.status === 'launching') {
                    await docRef.update({ status: 'idle', launchTime: null });
                }
                if (data.name !== ROCKETS[i].name) {
                    await docRef.update({ name: ROCKETS[i].name, planet: ROCKETS[i].planet });
                }
            }
        } catch (e) {}
    }
}

// ==== BAŞLATMA ====
let initialized = false;
function init() {
    if (initialized) return;
    initialized = true;
    createRocketTiles();
    launchAllBtn.onclick = launchAll;
    stopAllBtn.onclick = stopAll;
    resetAllBtn.onclick = resetAll;
    listenToRockets();
    cleanupStuckRockets();
    document.body.addEventListener('click', () => getAudioCtx(), { once: true });
}

if (checkAuth()) {
    init();
}