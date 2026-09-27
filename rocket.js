const urlParams = new URLSearchParams(window.location.search);
const rocketId = parseInt(urlParams.get('id') || '0');

const PLANETS = {
    'Merkür':  { nameEn: 'Mercury', gravity: 3.7,  escapeVelocity: 4.3,  color: '#8c8c8c', orbitVelocity: 3000,  orbitAltitude: 200000, realFlightTime: 420 },
    'Venüs':   { nameEn: 'Venus',   gravity: 8.87, escapeVelocity: 10.3, color: '#e6b800', orbitVelocity: 7300,  orbitAltitude: 300000, realFlightTime: 480 },
    'Dünya':   { nameEn: 'Earth',   gravity: 9.81, escapeVelocity: 11.2, color: '#4da6ff', orbitVelocity: 7800,  orbitAltitude: 400000, realFlightTime: 540 },
    'Mars':    { nameEn: 'Mars',    gravity: 3.71, escapeVelocity: 5.0,  color: '#ff6666', orbitVelocity: 3500,  orbitAltitude: 300000, realFlightTime: 390 },
    'Jüpiter': { nameEn: 'Jupiter', gravity: 24.79,escapeVelocity: 60,   color: '#d9b38c', orbitVelocity: 42000, orbitAltitude: 500000, realFlightTime: 900 },
    'Satürn':  { nameEn: 'Saturn',  gravity: 10.44,escapeVelocity: 36,   color: '#e6ccb3', orbitVelocity: 25000, orbitAltitude: 500000, realFlightTime: 720 },
    'Uranüs':  { nameEn: 'Uranus',  gravity: 8.69, escapeVelocity: 22,   color: '#99ccff', orbitVelocity: 15000, orbitAltitude: 400000, realFlightTime: 600 },
    'Neptün':  { nameEn: 'Neptune', gravity: 11.15,escapeVelocity: 24,   color: '#6666ff', orbitVelocity: 16000, orbitAltitude: 400000, realFlightTime: 630 },
    'Plüton':  { nameEn: 'Pluto',   gravity: 0.62, escapeVelocity: 2.3,  color: '#c2c2a3', orbitVelocity: 1200,  orbitAltitude: 150000, realFlightTime: 240 }
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

// ==== ROKET ALIASES (Sadece bu roket için) ====
const ALL_ALIASES = {
    0: ['saturn v', 'saturn bes', 'saturn beş', 'saturn 5', 'saturn'],
    1: ['falcon 9', 'falcon nine', 'falcon dokuz', 'falcon'],
    2: ['ariane 5', 'ariane bes', 'ariane beş', 'ariane'],
    3: ['soyuz fg', 'soyuz'],
    4: ['long march 5', 'long march bes', 'long march beş', 'long march'],
    5: ['h iia', 'h i i a', 'h 2 a', 'h2a'],
    6: ['delta iv heavy', 'delta 4 heavy', 'delta heavy', 'delta'],
    7: ['proton m', 'proton'],
    8: ['electron']
};
const MY_ALIASES = ALL_ALIASES[rocketId] || [];

// ==== ÇEVİRİLER ====
const LANG = {
    tr: {
        standby: 'Bekleniyor...', countdown: '⏱️ Geri sayım...', launched: '🚀 Ateşlendi!',
        descending: '🛬 İniş yapılıyor...', landed: '✅ İniş tamamlandı',
        successTitle: 'KALKIŞ BAŞARILI', successSub: 'Yörüngeye ulaşıldı!',
        speed: 'HIZ', accel: 'İVME', fuel: 'YAKIT', mass: 'KÜTLE',
        altitude: 'YÜKSEKLİK', time: 'SÜRE',
        telemetry: 'TELEMETRİ', waitingData: 'Veri bekleniyor...',
        speedLegend: 'Hız', altLegend: 'Yükseklik',
        missionStats: 'GÖREV İSTATİSTİKLERİ', flightTime: 'UÇUŞ SÜRESİ',
        fuelUsed: 'YAKIT TÜKETİMİ', maxSpeed: 'MAKS HIZ', maxAlt: 'MAKS YÜKSEKLİK',
        comparison: '🏆 GÖREV KARŞILAŞTIRMASI', pending: 'bekliyor',
        launchBtn: '🚀 ATEŞLE', resetBtn: '🔄 SIFIRLA',
        gravity: 'YERÇEKİMİ', escapeVel: 'KAÇIŞ HIZI',
        speech: ['Üç', 'İki', 'Bir', 'Ateş!'], speechLang: 'tr-TR',
        voiceStart: '🎤 SESLİ DENETİM', voiceListening: 'DİNLİYOR',
        voiceHeard: 'Duyuldu', voiceCommandLaunch: 'ateşleme',
        voiceCommandReset: 'sıfırlama',
        voiceDenied: 'Mikrofon izni verilmedi',
        voiceNotSupported: 'Tarayıcı desteklemiyor',
        voiceOwn: `Bu ekran sadece kendine ait komutu dinler`
    },
    en: {
        standby: 'Standby...', countdown: '⏱️ Countdown...', launched: '🚀 Launched!',
        descending: '🛬 Landing...', landed: '✅ Landing complete',
        successTitle: 'LAUNCH SUCCESSFUL', successSub: 'Orbit achieved!',
        speed: 'SPEED', accel: 'ACCEL', fuel: 'FUEL', mass: 'MASS',
        altitude: 'ALTITUDE', time: 'TIME',
        telemetry: 'TELEMETRY', waitingData: 'Waiting for data...',
        speedLegend: 'Speed', altLegend: 'Altitude',
        missionStats: 'MISSION STATISTICS', flightTime: 'FLIGHT TIME',
        fuelUsed: 'FUEL USED', maxSpeed: 'MAX SPEED', maxAlt: 'MAX ALTITUDE',
        comparison: '🏆 MISSION COMPARISON', pending: 'pending',
        launchBtn: '🚀 LAUNCH', resetBtn: '🔄 RESET',
        gravity: 'GRAVITY', escapeVel: 'ESCAPE VELOCITY',
        speech: ['Three', 'Two', 'One', 'Fire!'], speechLang: 'en-US',
        voiceStart: '🎤 VOICE CONTROL', voiceListening: 'LISTENING',
        voiceHeard: 'Heard', voiceCommandLaunch: 'launch',
        voiceCommandReset: 'reset',
        voiceDenied: 'Microphone permission denied',
        voiceNotSupported: 'Browser not supported',
        voiceOwn: `This screen only listens for its own command`
    }
};

let localOverride = null;
try { localOverride = localStorage.getItem('rocket_lang_' + rocketId); } catch (e) {}
let currentLang = localOverride || 'tr';
function t(k) { return LANG[currentLang][k] || k; }

function formatTime(sec) {
    if (sec < 60) return `${sec.toFixed(1)} s`;
    const min = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return currentLang === 'tr' ? `${min} dk ${s} sn` : `${min} min ${s} s`;
}
function formatAltitude(m) {
    if (m < 1000) return `${Math.round(m)} m`;
    if (m < 100000) return `${(m / 1000).toFixed(1)} km`;
    return `${Math.round(m / 1000).toLocaleString('tr-TR')} km`;
}

// ==== DOM ====
const canvas = document.getElementById('rocket-canvas');
const ctx = canvas.getContext('2d');
const chartCanvas = document.getElementById('chart-canvas');
const chartCtx = chartCanvas.getContext('2d');
const statusMessage = document.getElementById('status-message');
const launchBtn = document.getElementById('launch-btn');
const resetBtn = document.getElementById('reset-btn');
const voiceBtn = document.getElementById('voice-btn');
const countdownOverlay = document.getElementById('countdown-overlay');
const countdownNumber = document.getElementById('countdown-number');
const successOverlay = document.getElementById('success-overlay');
const statsPanel = document.getElementById('stats-panel');
const atmosphereEl = document.getElementById('atmosphere');
const infoSpeed = document.getElementById('info-speed');
const infoAccel = document.getElementById('info-accel');
const infoFuel = document.getElementById('info-fuel');
const infoMass = document.getElementById('info-mass');
const infoAltitude = document.getElementById('info-altitude');
const infoTime = document.getElementById('info-time');
const rocketNameEl = document.getElementById('rocket-name');
const statValTime = document.getElementById('stat-val-time');
const statValFuel = document.getElementById('stat-val-fuel');
const statValSpeed = document.getElementById('stat-val-speed');
const statValAlt = document.getElementById('stat-val-alt');
const comparisonBlock = document.getElementById('comparison-block');
const comparisonList = document.getElementById('comparison-list');
const rLangTr = document.getElementById('r-lang-tr');
const rLangEn = document.getElementById('r-lang-en');

rocketNameEl.textContent = currentRocket.name.toUpperCase();

let rocket = null;
let animationId = null;
let stars = [];
let shootingStars = [];
let countdownTimer = null;
let initialSnapshotDone = false;
let isCountdownInitiator = false;
let chartData = [];
let lastChartSample = 0;
let currentGroupId = null;
let comparisonUnsub = null;

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
function playWarningSound() {
    playBeep(400, 0.12, 0.25);
    setTimeout(() => playBeep(400, 0.12, 0.25), 160);
}
function playLaunchSound() {
    try {
        const c = getAudioCtx();
        const o = c.createOscillator(), g = c.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(60, c.currentTime);
        o.frequency.exponentialRampToValueAtTime(180, c.currentTime + 2.5);
        g.gain.setValueAtTime(0.3, c.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 2.5);
        o.connect(g); g.connect(c.destination);
        o.start(); o.stop(c.currentTime + 2.5);
        const bs = c.sampleRate * 2.5;
        const buf = c.createBuffer(1, bs, c.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < bs; i++) d[i] = Math.random() * 2 - 1;
        const n = c.createBufferSource(); n.buffer = buf;
        const ng = c.createGain();
        ng.gain.setValueAtTime(0.12, c.currentTime);
        ng.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 2.5);
        const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 800;
        n.connect(f); f.connect(ng); ng.connect(c.destination);
        n.start();
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

// ==== SESLİ KOMUT (ROKET EKRANI) ====
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let voiceActive = false;
let lastCommandTime = 0;
let lastCommandKey = '';

const TR_NUMS = {
    'bir': 1, '1': 1, 'iki': 2, '2': 2, 'üç': 3, 'uc': 3, '3': 3,
    'dört': 4, 'dort': 4, '4': 4, 'beş': 5, 'bes': 5, '5': 5,
    'altı': 6, 'alti': 6, '6': 6, 'yedi': 7, '7': 7,
    'sekiz': 8, '8': 8, 'dokuz': 9, '9': 9
};
const EN_NUMS = {
    'one': 1, '1': 1, 'two': 2, '2': 2, 'three': 3, '3': 3,
    'four': 4, '4': 4, 'five': 5, '5': 5, 'six': 6, '6': 6,
    'seven': 7, '7': 7, 'eight': 8, '8': 8, 'nine': 9, '9': 9
};

function normalizeText(text) {
    return text.toLowerCase()
        .replace(/[.,!?;:'"()\[\]{}]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}
function extractNumber(words, nums) {
    for (const w of words) {
        if (nums[w] !== undefined) return nums[w];
    }
    return null;
}
function matchesMyName(norm) {
    return MY_ALIASES.some(a => norm.includes(a));
}

// Bu ekran için geçerli mi? Sadece kendi komutu
function parseMyCommand(transcript) {
    const norm = normalizeText(transcript);
    const words = norm.split(' ');
    const nums = currentLang === 'tr' ? TR_NUMS : EN_NUMS;

    const hasFire = norm.includes('ateşle') || norm.includes('atesle') ||
                    norm.includes('fırlat') || norm.includes('firlat') ||
                    norm.includes('launch') || norm.includes('fire');
    const hasReset = norm.includes('sıfırla') || norm.includes('sifirla') || norm.includes('reset');

    if (!hasFire && !hasReset) return null;

    // 1) "roket N" ile mi?
    const hasRocketWord = norm.includes('roket') || norm.includes('rocket');
    if (hasRocketWord) {
        const n = extractNumber(words, nums);
        if (n !== null) {
            // Bu benim numaram mı?
            if (n === rocketId + 1) {
                return hasFire ? 'launch' : 'reset';
            }
            // Değilse, bu komut başka roketin — yoksay
            return null;
        }
    }

    // 2) Roket adıyla mı? (Sadece benim ismimse)
    if (matchesMyName(norm)) {
        return hasFire ? 'launch' : 'reset';
    }

    return null;
}

function showVoiceToast(text, type = 'ok') {
    const el = document.getElementById('voice-toast');
    if (!el) return;
    el.textContent = text;
    el.className = 'voice-toast';
    if (type === 'no-match') el.classList.add('not-matched');
    if (type === 'error') el.classList.add('error-toast');
    void el.offsetWidth;
    el.classList.add('show');
    clearTimeout(el._timeout);
    el._timeout = setTimeout(() => el.classList.remove('show'), 2500);
}

async function executeMyCommand(cmd, transcript) {
    const key = cmd;
    const now = Date.now();
    if (key === lastCommandKey && (now - lastCommandTime) < 2000) return;
    lastCommandKey = key;
    lastCommandTime = now;

    if (cmd === 'launch') {
        // Sadece idle ise çalış
        if (rocket && rocket.status === 'idle') {
            showVoiceToast(`🎤 ${t('voiceHeard')}: "${transcript}" → ${currentRocket.name} ${t('voiceCommandLaunch')}`, 'ok');
            playBeep(900, 0.08, 0.15);
            const gid = `single_${Date.now()}_${rocketId}`;
            try {
                isCountdownInitiator = true;
                await db.collection('rockets').doc(`rocket${rocketId}`).update({
                    status: 'countdown', groupId: gid,
                    countdownStart: firebase.firestore.FieldValue.serverTimestamp()
                });
            } catch (e) {}
        }
    } else if (cmd === 'reset') {
        if (rocket && rocket.status !== 'idle') {
            showVoiceToast(`🎤 ${t('voiceHeard')}: "${transcript}" → ${currentRocket.name} ${t('voiceCommandReset')}`, 'ok');
            playBeep(500, 0.1, 0.15);
            cancelCountdown();
            rocket.reset();
            try {
                await db.collection('rockets').doc(`rocket${rocketId}`).update({
                    status: 'idle', launchTime: null
                });
            } catch (e) {}
        }
    }
}

function initVoiceRecognition() {
    if (!SpeechRecognition) {
        showVoiceToast('❌ ' + t('voiceNotSupported'), 'error');
        return null;
    }
    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = false;
    rec.maxAlternatives = 3;
    rec.lang = LANG[currentLang].speechLang;

    rec.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const res = event.results[i];
            if (!res.isFinal) continue;
            for (let k = 0; k < res.length; k++) {
                const transcript = res[k].transcript.trim();
                if (!transcript) continue;
                const cmd = parseMyCommand(transcript);
                if (cmd) {
                    executeMyCommand(cmd, transcript);
                    return;
                }
                // Belirsizse: "ateşle" var ama kime ait belirsiz
                const norm = normalizeText(transcript);
                if ((norm.includes('ateşle') || norm.includes('atesle') ||
                    norm.includes('launch') || norm.includes('fire')) &&
                    (norm.includes('roket') || norm.includes('rocket'))) {
                    // Başka bir roketin numarasıysa belki kullanıcı karıştırdı, uyarı ver
                    const n = extractNumber(norm.split(' '), currentLang === 'tr' ? TR_NUMS : EN_NUMS);
                    if (n !== null && n !== rocketId + 1) {
                        // Başka roketin komutu — sessizce yoksay
                    }
                }
            }
        }
    };
    rec.onerror = (e) => {
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
            showVoiceToast('❌ ' + t('voiceDenied'), 'error');
            stopVoice();
        }
    };
    rec.onend = () => {
        if (voiceActive) {
            try { rec.start(); } catch (e) {}
        }
    };
    return rec;
}

function startVoice() {
    if (!recognition) recognition = initVoiceRecognition();
    if (!recognition) return;
    try {
        recognition.lang = LANG[currentLang].speechLang;
        recognition.start();
        voiceActive = true;
        updateVoiceBtn();
        showVoiceToast(`🎤 ${t('voiceListening')}: "${currentRocket.name}" / "Roket ${rocketId+1}"`, 'ok');
    } catch (e) { console.warn(e); }
}
function stopVoice() {
    voiceActive = false;
    if (recognition) { try { recognition.stop(); } catch (e) {} }
    updateVoiceBtn();
}
function updateVoiceBtn() {
    if (!voiceBtn) return;
    if (voiceActive) {
        voiceBtn.classList.add('listening');
        voiceBtn.classList.remove('error');
        voiceBtn.textContent = '● ' + t('voiceListening');
    } else {
        voiceBtn.classList.remove('listening', 'error');
        voiceBtn.textContent = t('voiceStart');
    }
}
if (voiceBtn) {
    voiceBtn.onclick = () => {
        if (voiceActive) { stopVoice(); }
        else { startVoice(); }
    };
}

// ==== DİL ====
function updateLangButtons() {
    rLangTr.classList.toggle('active', currentLang === 'tr');
    rLangEn.classList.toggle('active', currentLang === 'en');
}
function setLocalLanguage(lang) {
    currentLang = lang;
    localOverride = lang;
    try { localStorage.setItem('rocket_lang_' + rocketId, lang); } catch (e) {}
    updateLangButtons();
    applyLanguage();
    if (voiceActive && recognition) {
        try {
            recognition.stop();
            setTimeout(() => { try { recognition.lang = LANG[currentLang].speechLang; recognition.start(); } catch(e){} }, 300);
        } catch (e) {}
    }
}
rLangTr.onclick = () => setLocalLanguage('tr');
rLangEn.onclick = () => setLocalLanguage('en');

async function listenToLanguage() {
    db.collection('config').doc('language').onSnapshot(doc => {
        if (doc.exists && doc.data().lang) {
            const masterLang = doc.data().lang;
            if (!localOverride && masterLang !== currentLang) {
                currentLang = masterLang;
                updateLangButtons();
                applyLanguage();
            }
        }
    });
}

// ==== ÇEVİRİ UYGULA ====
function applyLanguage() {
    document.getElementById('lbl-speed').textContent = t('speed');
    document.getElementById('lbl-accel').textContent = t('accel');
    document.getElementById('lbl-fuel').textContent = t('fuel');
    document.getElementById('lbl-mass').textContent = t('mass');
    document.getElementById('lbl-alt').textContent = t('altitude');
    document.getElementById('lbl-time').textContent = t('time');
    document.getElementById('chart-title').textContent = t('telemetry');
    document.getElementById('legend-speed').textContent = t('speedLegend');
    document.getElementById('legend-alt').textContent = t('altLegend');
    document.getElementById('success-title').textContent = t('successTitle');
    document.getElementById('success-sub').textContent = t('successSub');
    document.getElementById('stats-title').textContent = t('missionStats');
    document.getElementById('stat-lbl-time').textContent = t('flightTime');
    document.getElementById('stat-lbl-fuel').textContent = t('fuelUsed');
    document.getElementById('stat-lbl-speed').textContent = t('maxSpeed');
    document.getElementById('stat-lbl-alt').textContent = t('maxAlt');
    document.getElementById('comparison-title').textContent = t('comparison');
    launchBtn.textContent = t('launchBtn');
    resetBtn.textContent = t('resetBtn');
    updateVoiceBtn();
    if (rocket) {
        if (rocket.status === 'idle') {
            statusMessage.textContent = `${t('standby')} (${currentRocket.name})`;
        } else if (rocket.status === 'descending') {
            statusMessage.textContent = t('descending');
        } else if (rocket.status === 'landed') {
            statusMessage.textContent = t('landed');
        }
    }
    drawChart();
    updateInfoPanel();
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

function triggerShake() {
    document.body.classList.remove('shake');
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
        this.width = 60; this.height = 130;
        this.x = canvas.width / 2;
        this.y = this.groundY - this.height / 2;
        this.vy = 0;
        this.status = 'idle';
        this.color = planetData.color;
        this.trail = [];
        this.fuel = 100;
        this.elapsedTime = 0;
        this.netAcceleration = 0;
        this.animationDuration = 12;
        this.timeMultiplier = 1;
        this.realFlightTime = planetData.realFlightTime;
        this.initialMass = rocketData.mass;
        this.currentMass = rocketData.mass;
        this.maxSpeed = 0;
        this.maxAltitude = 0;
        this.descentStartY = 0;
        this.descentEndY = 0;
        this.descentElapsed = 0;
        this.descentDuration = 8;
        this.descentTimeout = null;
        this.recalculateAcceleration();
    }
    recalculateAcceleration() {
        const startY = this.groundY - this.height / 2;
        const endY = -this.height;
        const travelDistance = startY - endY;
        const speedFactor = 0.8 + 0.4 * (this.planet.escapeVelocity / 60);
        this.animationDuration = 12 / speedFactor;
        this.netAcceleration = 2 * travelDistance / (this.animationDuration * this.animationDuration);
        this.timeMultiplier = this.realFlightTime / this.animationDuration;
    }
    reset() {
        if (this.descentTimeout) { clearTimeout(this.descentTimeout); this.descentTimeout = null; }
        this.y = this.groundY - this.height / 2;
        this.vy = 0; this.status = 'idle';
        this.trail = []; this.fuel = 100; this.elapsedTime = 0;
        this.currentMass = this.initialMass;
        this.maxSpeed = 0; this.maxAltitude = 0;
        chartData = [];
        if (animationId) { cancelAnimationFrame(animationId); animationId = null; }
        statusMessage.textContent = `${t('standby')} (${this.rocketData.name})`;
        statusMessage.style.color = '#aaa';
        launchBtn.disabled = false; resetBtn.disabled = true;
        successOverlay.classList.remove('active');
        successOverlay.classList.remove('fade-out');
        statsPanel.style.display = 'none';
        comparisonBlock.style.display = 'none';
        if (comparisonUnsub) { comparisonUnsub(); comparisonUnsub = null; }
        atmosphereEl.style.opacity = '1';
        updateInfoPanel(); drawChart(); drawScene();
    }
    start() {
        if (this.descentTimeout) { clearTimeout(this.descentTimeout); this.descentTimeout = null; }
        this.status = 'launching';
        this.vy = 0; this.trail = []; this.fuel = 100;
        this.elapsedTime = 0; this.currentMass = this.initialMass;
        this.maxSpeed = 0; this.maxAltitude = 0;
        chartData = []; lastChartSample = 0;
        statusMessage.textContent = t('launched');
        statusMessage.style.color = '#ffaa00';
        launchBtn.disabled = true; resetBtn.disabled = false;
        successOverlay.classList.remove('active');
        successOverlay.classList.remove('fade-out');
        statsPanel.style.display = 'none';
        comparisonBlock.style.display = 'none';
        if (animationId) cancelAnimationFrame(animationId);
        lastTime = 0;
        animationId =