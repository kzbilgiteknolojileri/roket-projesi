// ==== ROKET VE GEZEGEN VERİLERİ ====
const PLANETS = {
    'Merkür':  { nameEn: 'Mercury', gravity: 3.7,  escapeVelocity: 4.3,  color: '#8c8c8c' },
    'Venüs':   { nameEn: 'Venus',   gravity: 8.87, escapeVelocity: 10.3, color: '#e6b800' },
    'Dünya':   { nameEn: 'Earth',   gravity: 9.81, escapeVelocity: 11.2, color: '#4da6ff' },
    'Mars':    { nameEn: 'Mars',    gravity: 3.71, escapeVelocity: 5.0,  color: '#ff6666' },
    'Jüpiter': { nameEn: 'Jupiter', gravity: 24.79,escapeVelocity: 60,   color: '#d9b38c' },
    'Satürn':  { nameEn: 'Saturn',  gravity: 10.44,escapeVelocity: 36,   color: '#e6ccb3' },
    'Uranüs':  { nameEn: 'Uranus',  gravity: 8.69, escapeVelocity: 22,   color: '#99ccff' },
    'Neptün':  { nameEn: 'Neptune', gravity: 11.15,escapeVelocity: 24,   color: '#6666ff' },
    'Plüton':  { nameEn: 'Pluto',   gravity: 0.62, escapeVelocity: 2.3,  color: '#c2c2a3' }
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

// ==== ÇEVİRİLER ====
const LANG = {
    tr: {
        title: '🚀 ROKET KONTROL MERKEZİ',
        live: 'CANLI YAYIN',
        launchAll: '🔥 TÜMÜNÜ ATEŞLE',
        stopAll: '⏹ TÜMÜNÜ DURDUR',
        resetAll: '🔄 TÜMÜNÜ SIFIRLA',
        standby: 'BEKLİYOR',
        countdown: 'GERİ SAYIM',
        launched: 'ATEŞLENDİ',
        complete: 'TAMAMLANDI',
        launch: '🚀 ATEŞLE',
        loginTitle: 'Kontrol Merkezi',
        loginSub: 'Yetkili giriş gereklidir',
        loginPass: 'Şifre',
        loginBtn: 'GİRİŞ YAP',
        loginError: '❌ Hatalı şifre!',
        speech: ['Üç', 'İki', 'Bir', 'Ateş!'],
        speechLang: 'tr-TR'
    },
    en: {
        title: '🚀 ROCKET CONTROL CENTER',
        live: 'LIVE',
        launchAll: '🔥 LAUNCH ALL',
        stopAll: '⏹ STOP ALL',
        resetAll: '🔄 RESET ALL',
        standby: 'STANDBY',
        countdown: 'COUNTDOWN',
        launched: 'LAUNCHED',
        complete: 'COMPLETE',
        launch: '🚀 LAUNCH',
        loginTitle: 'Control Center',
        loginSub: 'Authorized access required',
        loginPass: 'Password',
        loginBtn: 'LOG IN',
        loginError: '❌ Wrong password!',
        speech: ['Three', 'Two', 'One', 'Fire!'],
        speechLang: 'en-US'
    }
};

let currentLang = 'tr';
function t(key) { return LANG[currentLang][key] || key; }

// ==== SES ====
let audioCtx = null;
function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
}
function playBeep(freq = 800, dur = 0.15, vol = 0.2) {
    try {
        const c = getAudioCtx();
        const o = c.createOscillator(), g = c.createGain();
        o.type = 'sine'; o.frequency.value = freq;
        g.gain.setValueAtTime(vol, c.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
        o.connect(g); g.connect(c.destination);
        o.start(); o.stop(c.currentTime + dur);
    } catch (e) {}
}
function playLaunchSound() {
    try {
        const c = getAudioCtx();
        const o = c.createOscillator(), g = c.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(60, c.currentTime);
        o.frequency.exponentialRampToValueAtTime(180, c.currentTime + 2.5);
        g.gain.setValueAtTime(0.25, c.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 2.5);
        o.connect(g); g.connect(c.destination);
        o.start(); o.stop(c.currentTime + 2.5);
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
            const o = c.createOscillator(), g = c.createGain();
            o.type = 'sine'; o.frequency.value = f;
            const tt = c.currentTime + i * 0.1;
            g.gain.setValueAtTime(0.15, tt);
            g.gain.exponentialRampToValueAtTime(0.001, tt + 0.3);
            o.connect(g); g.connect(c.destination);
            o.start(tt); o.stop(tt + 0.3);
        });
    } catch (e) {}
}
function speak(text) {
    if (!('speechSynthesis' in window)) return;
    try {
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = LANG[currentLang].speechLang;
        u.rate = 1.0; u.volume = 1.0;
        speechSynthesis.speak(u);
    } catch (e) {}
}

// ==== DİL ====
function applyLanguage() {
    document.getElementById('header-title').textContent = t('title');
    document.getElementById('live-text').textContent = t('live');
    document.getElementById('launch-all').textContent = t('launchAll');
    document.getElementById('stop-all').textContent = t('stopAll');
    document.getElementById('reset-all').textContent = t('resetAll');
    document.getElementById('login-title').textContent = t('loginTitle');
    document.getElementById('login-sub').textContent = t('loginSub');
    document.getElementById('password-input').placeholder = t('loginPass');
    document.getElementById('login-btn').textContent = t('loginBtn');

    document.getElementById('lang-tr').classList.toggle('active', currentLang === 'tr');
    document.getElementById('lang-en').classList.toggle('active', currentLang === 'en');

    // Tile'ları yeniden oluştur
    if (initialized) createRocketTiles();
}

async function setLanguage(lang) {
    try {
        await db.collection('config').doc('language').set({ lang }, { merge: true });
    } catch (e) { console.warn(e); }
}

function listenToLanguage() {
    db.collection('config').doc('language').onSnapshot(doc => {
        if (doc.exists && doc.data().lang && doc.data().lang !== currentLang) {
            currentLang = doc.data().lang;
            applyLanguage();
        }
    });
}

// ==== LOGIN ====
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
        loginError.textContent = t('loginError');
        playWarningSound();
        loginScreen.querySelector('.login-box').classList.add('shake');
        setTimeout(() => loginScreen.querySelector('.login-box').classList.remove('shake'), 400);
        passwordInput.value = '';
    }
}
loginBtn.onclick = attemptLogin;
passwordInput.addEventListener('keypress', e => { if (e.key === 'Enter') attemptLogin(); });
document.getElementById('lang-tr').onclick = () => setLanguage('tr');
document.getElementById('lang-en').onclick = () => setLanguage('en');

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
        const planetName = currentLang === 'tr' ? r.planet : PLANETS[r.planet].nameEn;

        const tile = document.createElement('div');
        tile.className = 'rocket-tile idle';
        tile.id = `rocket-tile-${i}`;

        tile.innerHTML = `
            <div class="tile-header">
                <div class="tile-live"><span class="tile-live-dot"></span>LIVE</div>
                <div class="tile-name">${r.name.toUpperCase()}</div>
            </div>
            <div class="tile-body">
                <div class="tile-rocket-icon">🚀</div>
                <div class="tile-status idle" id="tile-status-${i}">${t('standby')}</div>
            </div>
            <div class="tile-planet-row">
                <span class="tile-planet-dot" style="background:${planetColor}; box-shadow: 0 0 8px ${planetColor};"></span>
                📍 ${planetName.toUpperCase()}
            </div>
            <div class="tile-actions">
                <button class="tile-btn launch" id="launch-btn-${i}">${t('launch')}</button>
                <button class="tile-btn reset" id="reset-btn-${i}">🔄</button>
            </div>
        `;
        controlsContainer.appendChild(tile);
        document.getElementById(`launch-btn-${i}`).onclick = () => startCountdown(i, null);
        document.getElementById(`reset-btn-${i}`).onclick = () => resetRocket(i);
    }

    // Mevcut durumları Firestore'dan yeniden çekip uygula
    if (lastKnownStatuses.length === rocketCount) {
        for (let i = 0; i < rocketCount; i++) {
            if (lastKnownStatuses[i]) updateRocketUI(i, lastKnownStatuses[i]);
        }
    }
}

function updateClock() {
    const now = new Date();
    headerTime.textContent = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
}
setInterval(updateClock, 1000); updateClock();

// ==== FIRESTORE ====
async function startCountdown(id, groupId) {
    playClickSound();
    const gid = groupId || `single_${Date.now()}_${id}`;
    try {
        await db.collection('rockets').doc(`rocket${id}`).update({
            status: 'countdown',
            groupId: gid,
            countdownStart: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (e) {
        try {
            await db.collection('rockets').doc(`rocket${id}`).set({
                planet: ROCKETS[id].planet,
                name: ROCKETS[id].name,
                status: 'countdown',
                groupId: gid,
                countdownStart: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (e2) {}
    }
}
async function stopRocket(id) {
    try {
        await db.collection('rockets').doc(`rocket${id}`).update({
            status: 'idle', launchTime: null
        });
    } catch (e) {}
}
async function resetRocket(id) { playClickSound(); await stopRocket(id); }

async function launchAll() {
    const gid = `group_${Date.now()}`;
    for (let i = 0; i < rocketCount; i++) await startCountdown(i, gid);
}
async function stopAll() {
    playBeep(400, 0.2, 0.25);
    for (let i = 0; i < rocketCount; i++) await stopRocket(i);
}
async function resetAll() {
    for (let i = 0; i < rocketCount; i++) await resetRocket(i);
}

// ==== GERİ SAYIM (Master) ====
const activeCountdowns = {};
function runCountdown(id) {
    if (activeCountdowns[id]) return;
    activeCountdowns[id] = true;
    let count = 3;
    playWarningSound();
    speak(LANG[currentLang].speech[0]);

    const tick = () => {
        if (count > 1) {
            count--;
            speak(LANG[currentLang].speech[3 - count]);
            playWarningSound();
            setTimeout(tick, 1000);
        } else {
            setTimeout(async () => {
                speak(LANG[currentLang].speech[3]);
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
const lastKnownStatuses = [];
function listenToRockets() {
    db.collection('rockets').onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
            const data = change.doc.data();
            const id = parseInt(change.doc.id.replace('rocket', ''));
            if (isNaN(id) || id < 0 || id >= rocketCount) return;
            lastKnownStatuses[id] = data.status;
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
        statusEl.textContent = t('standby');
        launchBtn.disabled = false; resetBtn.disabled = true;
    } else if (status === 'countdown') {
        statusEl.textContent = t('countdown');
        launchBtn.disabled = true; resetBtn.disabled = false;
    } else if (status === 'launching') {
        statusEl.textContent = t('launched');
        launchBtn.disabled = true; resetBtn.disabled = false;
    } else if (status === 'launched') {
        statusEl.textContent = t('complete');
        launchBtn.disabled = false; resetBtn.disabled = false;
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
                    planet: ROCKETS[i].planet, name: ROCKETS[i].name,
                    status: 'idle', launchTime: null
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
    applyLanguage();
    createRocketTiles();
    launchAllBtn.onclick = launchAll;
    stopAllBtn.onclick = stopAll;
    resetAllBtn.onclick = resetAll;
    listenToLanguage();
    listenToRockets();
    cleanupStuckRockets();
    document.body.addEventListener('click', () => getAudioCtx(), { once: true });
}

if (checkAuth()) {
    // Önce dili oku, sonra init yap
    db.collection('config').doc('language').get().then(d => {
        if (d.exists && d.data().lang) currentLang = d.data().lang;
    }).catch(() => {}).finally(() => init());
}