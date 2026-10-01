// ==== LOGO YÜKLEME ====
const logoImage = new Image();
logoImage.src = 'flag.png'; // GitHub'a yüklediğin logo dosyasının adı
logoImage.onload = () => { console.log('[Logo] Yüklendi:', logoImage.naturalWidth, 'x', logoImage.naturalHeight); };
logoImage.onerror = () => { console.warn('[Logo] Yüklenemedi! Dosya adı doğru mu?'); };

const urlParams = new URLSearchParams(window.location.search);
const rocketId = parseInt(urlParams.get('id') || '0');

// ==== GEZEGEN VERİLERİ ====
const PLANETS = {
    'Merkür':  { nameEn: 'Mercury', gravity: 3.7,  escapeVelocity: 4.3,  color: '#8c8c8c', atmosphere: '#c4c4c4', ring: false, orbitVelocity: 3000,  orbitAltitude: 200000, realFlightTime: 420 },
    'Venüs':   { nameEn: 'Venus',   gravity: 8.87, escapeVelocity: 10.3, color: '#e6b800', atmosphere: '#ffe680', ring: false, orbitVelocity: 7300,  orbitAltitude: 300000, realFlightTime: 480 },
    'Dünya':   { nameEn: 'Earth',   gravity: 9.81, escapeVelocity: 11.2, color: '#4da6ff', atmosphere: '#a3d9ff', ring: false, orbitVelocity: 7800,  orbitAltitude: 400000, realFlightTime: 540 },
    'Mars':    { nameEn: 'Mars',    gravity: 3.71, escapeVelocity: 5.0,  color: '#ff6666', atmosphere: '#ffb3b3', ring: false, orbitVelocity: 3500,  orbitAltitude: 300000, realFlightTime: 390 },
    'Jüpiter': { nameEn: 'Jupiter', gravity: 24.79,escapeVelocity: 60,   color: '#d9b38c', atmosphere: '#f0d9b3', ring: false, orbitVelocity: 42000, orbitAltitude: 500000, realFlightTime: 900 },
    'Satürn':  { nameEn: 'Saturn',  gravity: 10.44,escapeVelocity: 36,   color: '#e6ccb3', atmosphere: '#fff2cc', ring: true,  orbitVelocity: 25000, orbitAltitude: 500000, realFlightTime: 720 },
    'Uranüs':  { nameEn: 'Uranus',  gravity: 8.69, escapeVelocity: 22,   color: '#99ccff', atmosphere: '#cce6ff', ring: true,  orbitVelocity: 15000, orbitAltitude: 400000, realFlightTime: 600 },
    'Neptün':  { nameEn: 'Neptune', gravity: 11.15,escapeVelocity: 24,   color: '#6666ff', atmosphere: '#9999ff', ring: false, orbitVelocity: 16000, orbitAltitude: 400000, realFlightTime: 630 },
    'Plüton':  { nameEn: 'Pluto',   gravity: 0.62, escapeVelocity: 2.3,  color: '#c2c2a3', atmosphere: '#e0e0c8', ring: false, orbitVelocity: 1200,  orbitAltitude: 150000, realFlightTime: 240 }
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

// ==== ANİMASYON SÜRELERİ ====
const ANIMATION_DURATIONS = {
    'Merkür':  16.0,
    'Venüs':   19.0,
    'Dünya':   20.5,
    'Mars':    17.5,
    'Jüpiter': 25.0,
    'Satürn':  24.0,
    'Uranüs':  22.0,
    'Neptün':  23.0,
    'Plüton':  15.0
};
const animDuration = ANIMATION_DURATIONS[currentRocket.planet] || 20;

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

const LANG = {
    tr: {
        standby: 'Bekleniyor...', countdown: '⏱️ Geri sayım...', launched: '🚀 Ateşlendi!',
        descending: '🛬 İniş yapılıyor...', landed: '✅ İniş tamamlandı',
        successTitle: 'KALKIŞ BAŞARILI', successSub: 'Yörüngeye ulaşıldı!',
        speed: 'HIZ', accel: 'İVME', fuel: 'YAKIT', mass: 'KÜTLE',
        altitude: 'YÜKSEKLİK', time: 'SÜRE',
        speedLegend: 'Hız', altLegend: 'Yükseklik',
        missionStats: 'GÖREV İSTATİSTİKLERİ',
        orbitOrder: 'YÖRÜNGEYE ÇIKIŞ',
        soloFlight: 'TEK UÇUŞ SÜRESİ',
        fuelUsed: 'YAKIT TÜKETİMİ', maxSpeed: 'MAKS HIZ', maxAlt: 'MAKS YÜKSEKLİK',
        comparison: '🏆 GÖREV KARŞILAŞTIRMASI', pending: 'bekliyor',
        launchBtn: '🚀 ATEŞLE', resetBtn: '🔄 SIFIRLA',
        gravity: 'YERÇEKİMİ', escapeVel: 'KAÇIŞ HIZI',
        orderSuffix: '. sırada çıktı',
        speech: ['Beş', 'Dört', 'Üç', 'İki', 'Bir', 'Ateş!'], speechLang: 'tr-TR',
        voiceStart: '🎤 SESLİ DENETİM', voiceListening: 'DİNLİYOR',
        voiceHeardAny: 'Duyulan', voiceNoMatch: 'Bu ekran için değil',
        voiceCommandLaunch: 'ateşleme', voiceCommandReset: 'sıfırlama',
        voiceDenied: 'Mikrofon izni verilmedi',
        voiceNotSupported: 'Tarayıcı desteklemiyor (Chrome/Edge kullanın)',
        voiceHint: (id, name) => `"Roket ${id} ateşle" veya "${name} ateşle" de`
    },
    en: {
        standby: 'Standby...', countdown: '⏱️ Countdown...', launched: '🚀 Launched!',
        descending: '🛬 Landing...', landed: '✅ Landing complete',
        successTitle: 'LAUNCH SUCCESSFUL', successSub: 'Orbit achieved!',
        speed: 'SPEED', accel: 'ACCEL', fuel: 'FUEL', mass: 'MASS',
        altitude: 'ALTITUDE', time: 'TIME',
        speedLegend: 'Speed', altLegend: 'Altitude',
        missionStats: 'MISSION STATISTICS',
        orbitOrder: 'ORBIT ARRIVAL',
        soloFlight: 'SOLO FLIGHT TIME',
        fuelUsed: 'FUEL USED', maxSpeed: 'MAX SPEED', maxAlt: 'MAX ALTITUDE',
        comparison: '🏆 MISSION COMPARISON', pending: 'pending',
        launchBtn: '🚀 LAUNCH', resetBtn: '🔄 RESET',
        gravity: 'GRAVITY', escapeVel: 'ESCAPE VELOCITY',
        orderSuffix: '-th to arrive',
        speech: ['Five', 'Four', 'Three', 'Two', 'One', 'Fire!'], speechLang: 'en-US',
        voiceStart: '🎤 VOICE CONTROL', voiceListening: 'LISTENING',
        voiceHeardAny: 'Heard', voiceNoMatch: 'Not for this screen',
        voiceCommandLaunch: 'launch', voiceCommandReset: 'reset',
        voiceDenied: 'Microphone permission denied',
        voiceNotSupported: 'Browser not supported (use Chrome/Edge)',
        voiceHint: (id, name) => `Say "Rocket ${id} launch" or "${name} launch"`
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
function formatOrdinal(n) {
    if (currentLang === 'tr') return `${n}.`;
    if (n === 1) return '1st';
    if (n === 2) return '2nd';
    if (n === 3) return '3rd';
    return `${n}th`;
}

// ==== DOM ====
const canvas = document.getElementById('rocket-canvas');
const ctx = canvas.getContext('2d');
const planetCanvas = document.getElementById('planet-canvas');
const planetCtx = planetCanvas.getContext('2d');
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
const statLabelTime = document.getElementById('stat-lbl-time');
const comparisonBlock = document.getElementById('comparison-block');
const comparisonList = document.getElementById('comparison-list');
const rLangTr = document.getElementById('r-lang-tr');
const rLangEn = document.getElementById('r-lang-en');
const planetViewTitle = document.getElementById('planet-view-title');
const planetInfoRow = document.getElementById('planet-info-row');

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

// ==== ROKET MOTOR SESİ (Loop) ====
let engineNoiseSource = null;
let engineGainNode = null;
let engineFilter = null;
let engineActive = false;

function startEngineSound() {
    try {
        if (engineActive) return;
        const c = getAudioCtx();
        const bufferSize = c.sampleRate * 2;
        const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        const noise = c.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = c.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        filter.Q.value = 0.7;

        const gain = c.createGain();
        gain.gain.setValueAtTime(0, c.currentTime);
        gain.gain.linearRampToValueAtTime(0.18, c.currentTime + 0.6);

        const lfo = c.createOscillator();
        lfo.frequency.value = 12;
        const lfoGain = c.createGain();
        lfoGain.gain.value = 60;
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(c.destination);

        noise.start();
        lfo.start();

        engineNoiseSource = noise;
        engineGainNode = gain;
        engineFilter = filter;
        engineActive = true;
    } catch (e) { console.warn('Motor sesi başlatılamadı:', e); }
}

function updateEngineSound(progress) {
    if (!engineActive || !engineFilter || !engineGainNode) return;
    try {
        const c = getAudioCtx();
        const freq = 400 + progress * 500;
        engineFilter.frequency.setTargetAtTime(freq, c.currentTime, 0.2);
        const vol = 0.18 - progress * 0.06;
        engineGainNode.gain.setTargetAtTime(Math.max(0.08, vol), c.currentTime, 0.3);
    } catch (e) {}
}

function stopEngineSound() {
    if (!engineActive) return;
    try {
        const c = getAudioCtx();
        if (engineGainNode) {
            engineGainNode.gain.cancelScheduledValues(c.currentTime);
            engineGainNode.gain.setValueAtTime(engineGainNode.gain.value, c.currentTime);
            engineGainNode.gain.linearRampToValueAtTime(0, c.currentTime + 0.5);
        }
        const src = engineNoiseSource;
        setTimeout(() => { try { src.stop(); } catch (e) {} }, 600);
    } catch (e) {}
    engineNoiseSource = null;
    engineGainNode = null;
    engineFilter = null;
    engineActive = false;
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

// ==== SESLİ KOMUT (ROKET) ====
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
        .replace(/[.,!?;:'"()\[\]{}]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}
function extractNumber(words, nums) {
    for (const w of words) {
        if (nums[w] !== undefined) return nums[w];
    }
    return null;
}
function containsAnyWord(norm, wordList) {
    const words = norm.split(' ');
    return wordList.some(w => words.includes(w));
}
function matchesMyName(norm) {
    return MY_ALIASES.some(a => norm.includes(a));
}

function parseMyCommand(transcript) {
    const norm = normalizeText(transcript);
    const words = norm.split(' ');
    const nums = currentLang === 'tr' ? TR_NUMS : EN_NUMS;
    const fireWords = ['ateşle', 'atesle', 'ateş', 'ates', 'fırlat', 'firlat', 'başlat', 'baslat', 'launch', 'fire', 'start', 'go', 'başla', 'basla'];
    const resetWords = ['sıfırla', 'sifirla', 'temizle', 'reset', 'clear'];
    const hasFire = containsAnyWord(norm, fireWords);
    const hasReset = containsAnyWord(norm, resetWords);
    if (!hasFire && !hasReset) return null;
    const hasRocketWord = words.includes('roket') || words.includes('rocket');
    if (hasRocketWord) {
        const n = extractNumber(words, nums);
        if (n !== null) {
            if (n === rocketId + 1) return hasFire ? 'launch' : 'reset';
            return null;
        }
    }
    if (matchesMyName(norm)) return hasFire ? 'launch' : 'reset';
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
    el._timeout = setTimeout(() => el.classList.remove('show'), 3500);
}

async function executeMyCommand(cmd, transcript) {
    const key = cmd;
    const now = Date.now();
    if (key === lastCommandKey && (now - lastCommandTime) < 2000) return;
    lastCommandKey = key;
    lastCommandTime = now;
    if (cmd === 'launch') {
        if (rocket && rocket.status === 'idle') {
            showVoiceToast(`🎤 "${transcript}" → ${currentRocket.name} ${t('voiceCommandLaunch')}`, 'ok');
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
            showVoiceToast(`🎤 "${transcript}" → ${currentRocket.name} ${t('voiceCommandReset')}`, 'ok');
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
    rec.continuous = false;
    rec.interimResults = false;
    rec.maxAlternatives = 3;
    rec.lang = LANG[currentLang].speechLang;
    rec.onresult = (event) => {
        let found = false;
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const res = event.results[i];
            for (let k = 0; k < res.length; k++) {
                const transcript = res[k].transcript.trim();
                if (!transcript) continue;
                const cmd = parseMyCommand(transcript);
                if (cmd) {
                    executeMyCommand(cmd, transcript);
                    found = true;
                    break;
                }
            }
            if (found) break;
        }
        if (!found) {
            const lastRes = event.results[event.results.length - 1];
            if (lastRes && lastRes[0]) {
                const heard = lastRes[0].transcript.trim();
                if (heard) showVoiceToast(`🎤 ${t('voiceHeardAny')}: "${heard}" — ${t('voiceNoMatch')}`, 'no-match');
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
        if (voiceActive) setTimeout(() => {
            if (voiceActive) { try { rec.start(); } catch (e) {} }
        }, 250);
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
        const hint = LANG[currentLang].voiceHint(rocketId + 1, currentRocket.name);
        showVoiceToast(`🎤 ${t('voiceListening')} — ${hint}`, 'ok');
    } catch (e) {
        try {
            recognition.stop();
            setTimeout(() => { try { recognition.start(); voiceActive = true; updateVoiceBtn(); } catch(e2) {} }, 300);
        } catch (e2) {}
    }
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
if (voiceBtn) voiceBtn.onclick = () => { if (voiceActive) stopVoice(); else startVoice(); };

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
            setTimeout(() => {
                try { recognition.lang = LANG[currentLang].speechLang; recognition.start(); } catch(e){}
            }, 400);
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

function applyLanguage() {
    document.getElementById('lbl-speed').textContent = t('speed');
    document.getElementById('lbl-accel').textContent = t('accel');
    document.getElementById('lbl-fuel').textContent = t('fuel');
    document.getElementById('lbl-mass').textContent = t('mass');
    document.getElementById('lbl-alt').textContent = t('altitude');
    document.getElementById('lbl-time').textContent = t('time');
    document.getElementById('success-title').textContent = t('successTitle');
    document.getElementById('success-sub').textContent = t('successSub');
    document.getElementById('stats-title').textContent = t('missionStats');
    document.getElementById('stat-lbl-time').textContent = t('orbitOrder');
    document.getElementById('stat-lbl-fuel').textContent = t('fuelUsed');
    document.getElementById('stat-lbl-speed').textContent = t('maxSpeed');
    document.getElementById('stat-lbl-alt').textContent = t('maxAlt');
    document.getElementById('comparison-title').textContent = t('comparison');
    launchBtn.textContent = t('launchBtn');
    resetBtn.textContent = t('resetBtn');
    updateVoiceBtn();
    updatePlanetViewTitle();
    if (rocket) {
        if (rocket.status === 'idle') statusMessage.textContent = `${t('standby')} (${currentRocket.name})`;
        else if (rocket.status === 'descending') statusMessage.textContent = t('descending');
        else if (rocket.status === 'landed') statusMessage.textContent = t('landed');
    }
    updateInfoPanel();
}

// ==== PLANET VIEW ====
function updatePlanetViewTitle() {
    const name = currentLang === 'tr' ? currentRocket.planet : currentPlanet.nameEn;
    planetViewTitle.textContent = name.toUpperCase();
    planetInfoRow.textContent = `${t('gravity')}: ${currentPlanet.gravity} m/s² • ${t('escapeVel')}: ${currentPlanet.escapeVelocity} km/s`;
}

let planetRotation = 0;
function drawPlanetView(dt) {
    const w = planetCanvas.width, h = planetCanvas.height;
    const cx = w / 2, cy = h / 2;
    const radius = Math.min(w, h) / 2 - 20;
    planetRotation += dt * 0.3;

    planetCtx.clearRect(0, 0, w, h);

    const glowGrad = planetCtx.createRadialGradient(cx, cy, radius * 0.85, cx, cy, radius * 1.4);
    glowGrad.addColorStop(0, hexToRgba(currentPlanet.atmosphere, 0.45));
    glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
    planetCtx.fillStyle = glowGrad;
    planetCtx.beginPath();
    planetCtx.arc(cx, cy, radius * 1.4, 0, Math.PI * 2);
    planetCtx.fill();

    if (currentPlanet.ring) {
        planetCtx.save();
        planetCtx.translate(cx, cy);
        planetCtx.rotate(-0.3);
        planetCtx.strokeStyle = hexToRgba(currentPlanet.atmosphere, 0.55);
        planetCtx.lineWidth = 6;
        planetCtx.beginPath();
        planetCtx.ellipse(0, 0, radius * 1.5, radius * 0.4, 0, Math.PI, Math.PI * 2);
        planetCtx.stroke();
        planetCtx.restore();
    }

    const grad = planetCtx.createRadialGradient(
        cx - radius * 0.35, cy - radius * 0.35, radius * 0.1,
        cx, cy, radius
    );
    grad.addColorStop(0, lightenColor(currentPlanet.color, 0.4));
    grad.addColorStop(0.5, currentPlanet.color);
    grad.addColorStop(1, darkenColor(currentPlanet.color, 0.45));
    planetCtx.fillStyle = grad;
    planetCtx.beginPath();
    planetCtx.arc(cx, cy, radius, 0, Math.PI * 2);
    planetCtx.fill();

    planetCtx.save();
    planetCtx.beginPath();
    planetCtx.arc(cx, cy, radius, 0, Math.PI * 2);
    planetCtx.clip();
    const spots = 7;
    for (let i = 0; i < spots; i++) {
        const offsetAngle = (i / spots) * Math.PI * 2 + planetRotation;
        const sx = cx + Math.cos(offsetAngle) * radius * 0.45;
        const sy = cy + Math.sin(offsetAngle * 1.3) * radius * 0.35;
        const sr = radius * 0.22 + Math.sin(planetRotation * 2 + i) * 6;
        planetCtx.fillStyle = hexToRgba(darkenColor(currentPlanet.color, 0.7), 0.35);
        planetCtx.beginPath();
        planetCtx.ellipse(sx, sy, sr, sr * 0.55, offsetAngle, 0, Math.PI * 2);
        planetCtx.fill();
    }
    for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 - planetRotation * 0.7;
        const bx = cx + Math.cos(angle) * radius * 0.5;
        const by = cy + Math.sin(angle) * radius * 0.3;
        planetCtx.fillStyle = hexToRgba(currentPlanet.atmosphere, 0.25);
        planetCtx.beginPath();
        planetCtx.ellipse(bx, by, radius * 0.3, radius * 0.12, angle, 0, Math.PI * 2);
        planetCtx.fill();
    }
    planetCtx.restore();

    const shine = planetCtx.createRadialGradient(
        cx - radius * 0.4, cy - radius * 0.4, 0,
        cx - radius * 0.4, cy - radius * 0.4, radius * 0.6
    );
    shine.addColorStop(0, 'rgba(255,255,255,0.5)');
    shine.addColorStop(1, 'rgba(255,255,255,0)');
    planetCtx.fillStyle = shine;
    planetCtx.beginPath();
    planetCtx.arc(cx, cy, radius, 0, Math.PI * 2);
    planetCtx.fill();

    planetCtx.strokeStyle = hexToRgba(currentPlanet.atmosphere, 0.6);
    planetCtx.lineWidth = 2;
    planetCtx.beginPath();
    planetCtx.arc(cx, cy, radius, 0, Math.PI * 2);
    planetCtx.stroke();

    if (currentPlanet.ring) {
        planetCtx.save();
        planetCtx.translate(cx, cy);
        planetCtx.rotate(-0.3);
        planetCtx.strokeStyle = hexToRgba(currentPlanet.atmosphere, 0.75);
        planetCtx.lineWidth = 6;
        planetCtx.beginPath();
        planetCtx.ellipse(0, 0, radius * 1.5, radius * 0.4, 0, 0, Math.PI);
        planetCtx.stroke();
        planetCtx.restore();
    }
}

function hexToRgba(hex, alpha) {
    const h = hex.replace('#', '');
    const r = parseInt(h.substr(0, 2), 16);
    const g = parseInt(h.substr(2, 2), 16);
    const b = parseInt(h.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
function lightenColor(hex, factor) {
    const h = hex.replace('#', '');
    const r = parseInt(h.substr(0, 2), 16);
    const g = parseInt(h.substr(2, 2), 16);
    const b = parseInt(h.substr(4, 2), 16);
    return `rgb(${Math.min(255, Math.floor(r + (255 - r) * factor))}, ${Math.min(255, Math.floor(g + (255 - g) * factor))}, ${Math.min(255, Math.floor(b + (255 - b) * factor))})`;
}
function darkenColor(hex, factor) {
    const h = hex.replace('#', '');
    const r = parseInt(h.substr(0, 2), 16);
    const g = parseInt(h.substr(2, 2), 16);
    const b = parseInt(h.substr(4, 2), 16);
    return `rgb(${Math.floor(r * factor)}, ${Math.floor(g * factor)}, ${Math.floor(b * factor)})`;
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
    setTimeout(() => document.body.classList.remove('shake'), 1700);
}

// ==== ROKET SINIFI ====
class Rocket {
    constructor(id, planetData, rocketData, animDuration) {
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
        this.animationDuration = animDuration;
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
        this.orbitArrivalRank = null;
        this.launchStartMs = null;
        this.recalculateAcceleration();
    }
    recalculateAcceleration() {
        const startY = this.groundY - this.height / 2;
        const endY = -this.height;
        const travelDistance = startY - endY;
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
        this.orbitArrivalRank = null;
        this.launchStartMs = null;
        chartData = [];
        if (animationId) { cancelAnimationFrame(animationId); animationId = null; }
        stopEngineSound();
        statusMessage.textContent = `${t('standby')} (${this.rocketData.name})`;
        statusMessage.style.color = '#aaa';
        launchBtn.disabled = false; resetBtn.disabled = true;
        successOverlay.classList.remove('active');
        successOverlay.classList.remove('fade-out');
        statsPanel.style.display = 'none';
        comparisonBlock.style.display = 'none';
        if (comparisonUnsub) { comparisonUnsub(); comparisonUnsub = null; }
        atmosphereEl.style.opacity = '1';
        updateInfoPanel(); drawScene();
    }
    start() {
        if (this.descentTimeout) { clearTimeout(this.descentTimeout); this.descentTimeout = null; }
        this.status = 'launching';
        this.vy = 0; this.trail = []; this.fuel = 100;
        this.elapsedTime = 0; this.currentMass = this.initialMass;
        this.maxSpeed = 0; this.maxAltitude = 0;
        this.orbitArrivalRank = null;
        this.launchStartMs = Date.now();
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
        animationId = requestAnimationFrame(animate);
        triggerShake();
        startEngineSound();
    }
    startDescent() {
        this.status = 'descending';
        this.trail = [];
        stopEngineSound();
        this.descentStartY = this.y;
        this.descentEndY = this.groundY - this.height / 2;
        this.descentElapsed = 0;
        statusMessage.textContent = t('descending');
        statusMessage.style.color = '#88aaff';
        successOverlay.classList.add('fade-out');
        lastTime = 0;
        if (animationId) cancelAnimationFrame(animationId);
        animationId = requestAnimationFrame(animate);
    }
    update(dt) {
        if (this.status === 'launching') {
            this.vy += this.netAcceleration * dt;
            this.y -= this.vy * dt;
            this.elapsedTime += dt;
            this.fuel = Math.max(0, 100 - (this.elapsedTime / this.animationDuration) * 100);
            const dryMassRatio = 0.3;
            this.currentMass = this.initialMass * (dryMassRatio + (1 - dryMassRatio) * (this.fuel / 100));
            for (let k = 0; k < 3; k++) {
                this.trail.push({
                    x: this.x + (Math.random() - 0.5) * 14,
                    y: this.y + this.height / 2 + Math.random() * 5,
                    life: 1, size: 8 + Math.random() * 14,
                    vx: (Math.random() - 0.5) * 30
                });
            }
            if (this.trail.length > 200) this.trail.shift();
            this.trail.forEach(tt => {
                tt.life -= dt * 0.8; tt.y += dt * 20; tt.x += tt.vx * dt; tt.size += dt * 15;
            });
            this.trail = this.trail.filter(tt => tt.life > 0);

            const startY = this.groundY - this.height / 2;
            const travelDistance = startY + this.height;
            const altRatio = Math.min(1, (startY - this.y) / travelDistance);
            atmosphereEl.style.opacity = String(Math.max(0, 1 - altRatio * 1.2));

            const progress = Math.min(1, this.elapsedTime / this.animationDuration);
            updateEngineSound(progress);

            const timeProgress = progress;
            const realSpeed = this.planet.orbitVelocity * timeProgress;
            const realAltitude = this.planet.orbitAltitude * altRatio;
            if (realSpeed > this.maxSpeed) this.maxSpeed = realSpeed;
            if (realAltitude > this.maxAltitude) this.maxAltitude = realAltitude;
            if (this.elapsedTime - lastChartSample > 0.15) {
                lastChartSample = this.elapsedTime;
                chartData.push({ t: this.elapsedTime, speed: realSpeed, alt: realAltitude });
                if (chartData.length > 200) chartData.shift();
            }

            if (this.y + this.height / 2 < 0) {
                this.status = 'launched';
                this.y = -this.height;
                statusMessage.textContent = '';
                launchBtn.disabled = false; resetBtn.disabled = false;
                atmosphereEl.style.opacity = '0';
                stopEngineSound();
                this.maxSpeed = this.planet.orbitVelocity;
                this.maxAltitude = this.planet.orbitAltitude;
                showStatsAndSave();
                this.descentTimeout = setTimeout(() => {
                    this.startDescent();
                    this.descentTimeout = null;
                }, 3000);
            }
        } else if (this.status === 'descending') {
            this.descentElapsed += dt;
            const progress = Math.min(1, this.descentElapsed / this.descentDuration);
            const eased = 0.5 * (1 - Math.cos(Math.PI * progress));
            this.y = this.descentStartY + (this.descentEndY - this.descentStartY) * eased;
            if (progress >= 1) {
                this.y = this.descentEndY;
                this.status = 'landed';
                statusMessage.textContent = t('landed');
                statusMessage.style.color = '#00cc66';
                successOverlay.classList.remove('fade-out');
            }
        }
    }
    darken(color, factor) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        return `rgb(${Math.floor(r*factor)}, ${Math.floor(g*factor)}, ${Math.floor(b*factor)})`;
    }
    draw() {
        // Roket izi (duman)
        this.trail.forEach(tt => {
            const alpha = tt.life * 0.5;
            const grd = ctx.createRadialGradient(tt.x, tt.y, 0, tt.x, tt.y, tt.size);
            grd.addColorStop(0, `rgba(255, 230, 150, ${alpha})`);
            grd.addColorStop(0.3, `rgba(200, 150, 100, ${alpha*0.7})`);
            grd.addColorStop(0.7, `rgba(120, 120, 120, ${alpha*0.4})`);
            grd.addColorStop(1, `rgba(80, 80, 80, 0)`);
            ctx.fillStyle = grd;
            ctx.beginPath(); ctx.arc(tt.x, tt.y, tt.size, 0, Math.PI * 2); ctx.fill();
        });
        ctx.save();
        ctx.translate(this.x, this.y);
        const w = this.width, h = this.height;

        // Kanatçıklar
        ctx.fillStyle = '#cc2222'; ctx.strokeStyle = '#881111'; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-w*0.3, h*0.1); ctx.lineTo(-w*0.7, h*0.5); ctx.lineTo(-w*0.3, h*0.45);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(w*0.3, h*0.1); ctx.lineTo(w*0.7, h*0.5); ctx.lineTo(w*0.3, h*0.45);
        ctx.closePath(); ctx.fill(); ctx.stroke();

        // Nozzle
        ctx.fillStyle = '#3a3a3a';
        ctx.beginPath();
        ctx.moveTo(-w*0.2, h*0.4); ctx.lineTo(-w*0.32, h*0.5);
        ctx.lineTo(w*0.32, h*0.5); ctx.lineTo(w*0.2, h*0.4);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#222'; ctx.lineWidth = 1.5; ctx.stroke();

        // Gövde
        const bg = ctx.createLinearGradient(-w*0.3, 0, w*0.3, 0);
        bg.addColorStop(0, this.darken(this.color, 0.55));
        bg.addColorStop(0.25, this.color); bg.addColorStop(0.75, this.color);
        bg.addColorStop(1, this.darken(this.color, 0.55));
        ctx.fillStyle = bg;
        ctx.fillRect(-w*0.3, -h*0.3, w*0.6, h*0.7);
        ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 2;
        ctx.strokeRect(-w*0.3, -h*0.3, w*0.6, h*0.7);

        // Beyaz şeritler
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillRect(-w*0.3, -h*0.05, w*0.6, 4);
        ctx.fillRect(-w*0.3, h*0.12, w*0.6, 4);

        // Burun
        ctx.fillStyle = '#cc2222';
        ctx.beginPath();
        ctx.moveTo(0, -h*0.5); ctx.lineTo(w*0.3, -h*0.3); ctx.lineTo(-w*0.3, -h*0.3);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#881111'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.beginPath();
        ctx.moveTo(-w*0.15, -h*0.42); ctx.lineTo(0, -h*0.5); ctx.lineTo(-w*0.05, -h*0.32);
        ctx.closePath(); ctx.fill();

        // Pencere
        ctx.fillStyle = 'rgba(100,180,255,0.95)';
        ctx.beginPath(); ctx.arc(0, -h*0.12, w*0.15, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath(); ctx.arc(-w*0.05, -h*0.15, w*0.05, 0, Math.PI*2); ctx.fill();

        // ==== LOGO RESMİ (roket gövdesinin ortasında) ====
        if (logoImage && logoImage.complete && logoImage.naturalWidth > 0) {
            const logoSize = w * 0.55;
            const logoX = -logoSize / 2;
            const logoY = h * 0.05;

            // Beyaz çerçeve
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.fillRect(logoX - 2, logoY - 2, logoSize + 4, logoSize + 4);

            // Logo
            ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);

            // İnce çerçeve çizgisi
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.lineWidth = 1;
            ctx.strokeRect(logoX - 2, logoY - 2, logoSize + 4, logoSize + 4);
        }

        // ==== "KidZania İstanbul" YAZISI (dikey, roketin sağ tarafında) ====
        ctx.save();
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.98)';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        // Rotasyon sonrası: x ekseni = roketin uzunluğu, y ekseni = roketin genişliği
        // y = w * 0.55 → roketin sağ tarafına
        ctx.fillText('KidZania İstanbul', 0, w * 0.55);
        ctx.restore();

        // ==== ROKET ADI (dikey, roketin sol tarafında) ====
        ctx.save();
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = 'rgba(255, 220, 100, 0.98)';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.fillText(this.rocketData.name.toUpperCase(), 0, -w * 0.55);
        ctx.restore();

        // Alev
        if (this.status === 'launching' && this.fuel > 0) {
            const fl = 60 + Math.random() * 40;
            const fw = w * 0.55;
            const fg = ctx.createLinearGradient(0, h*0.5, 0, h*0.5 + fl);
            fg.addColorStop(0, '#ffffff'); fg.addColorStop(0.15, '#ffff00');
            fg.addColorStop(0.4, '#ff8800'); fg.addColorStop(0.75, '#ff2200');
            fg.addColorStop(1, 'rgba(200,0,0,0)');
            ctx.fillStyle = fg;
            ctx.beginPath();
            ctx.moveTo(-fw/2, h*0.5);
            ctx.quadraticCurveTo(-fw*0.7, h*0.5 + fl*0.6, 0, h*0.5 + fl);
            ctx.quadraticCurveTo(fw*0.7, h*0.5 + fl*0.6, fw/2, h*0.5);
            ctx.closePath(); ctx.fill();
            ctx.fillStyle = 'rgba(255,255,220,0.9)';
            ctx.beginPath();
            ctx.moveTo(-fw*0.2, h*0.5);
            ctx.quadraticCurveTo(0, h*0.5 + fl*0.5, 0, h*0.5 + fl*0.7);
            ctx.quadraticCurveTo(0, h*0.5 + fl*0.5, fw*0.2, h*0.5);
            ctx.closePath(); ctx.fill();
        }
        ctx.restore();
    }
}

// ==== İSTATİSTİKLER ====
async function showStatsAndSave() {
    const realTime = rocket.elapsedTime * rocket.timeMultiplier;
    const fuelUsed = 100 - rocket.fuel;
    const maxSpeed = rocket.planet.orbitVelocity;
    const maxAlt = rocket.planet.orbitAltitude;

    try {
        await db.collection('rockets').doc(`rocket${rocketId}`).set({
            status: 'launched',
            stats: {
                elapsedTime: realTime,
                animationTime: rocket.elapsedTime,
                fuelUsed: fuelUsed,
                maxSpeed: maxSpeed,
                maxAltitude: maxAlt,
                completedAt: Date.now()
            }
        }, { merge: true });
    } catch (e) { console.warn(e); }

    if (currentGroupId && currentGroupId.startsWith('group_')) {
        startComparisonListener();
    } else {
        statLabelTime.textContent = t('soloFlight');
        statValTime.textContent = formatTime(realTime);
        statValFuel.textContent = `%${fuelUsed.toFixed(1)}`;
        statValSpeed.textContent = `${Math.round(maxSpeed).toLocaleString('tr-TR')} m/s`;
        statValAlt.textContent = formatAltitude(maxAlt);
        successOverlay.classList.add('active');
        statsPanel.style.display = 'block';
    }
}

function startComparisonListener() {
    if (comparisonUnsub) comparisonUnsub();
    const q = db.collection('rockets').where('groupId', '==', currentGroupId);

    comparisonUnsub = q.onSnapshot(snap => {
        const rows = [];
        snap.forEach(doc => {
            const d = doc.data();
            const id = parseInt(doc.id.replace('rocket', ''));
            rows.push({
                id, name: ROCKETS[id]?.name || doc.id,
                stats: d.stats || null,
                status: d.status
            });
        });
        if (rows.length <= 1) return;

        const done = rows
            .filter(r => r.stats && r.stats.animationTime !== undefined)
            .sort((a, b) => a.stats.animationTime - b.stats.animationTime);
        const pending = rows.filter(r => !r.stats || r.stats.animationTime === undefined);

        const myIndex = done.findIndex(r => r.id === rocketId);
        const myRank = myIndex >= 0 ? myIndex + 1 : null;

        if (myRank !== null) {
            statLabelTime.textContent = t('orbitOrder');
            statValTime.textContent = `${formatOrdinal(myRank)}`;
        } else {
            statLabelTime.textContent = t('orbitOrder');
            statValTime.textContent = '...';
        }
        if (rocket) {
            statValFuel.textContent = `%${(100 - rocket.fuel).toFixed(1)}`;
            statValSpeed.textContent = `${Math.round(rocket.maxSpeed).toLocaleString('tr-TR')} m/s`;
            statValAlt.textContent = formatAltitude(rocket.maxAltitude);
        }
        successOverlay.classList.add('active');
        statsPanel.style.display = 'block';

        comparisonList.innerHTML = '';
        done.forEach((r, i) => {
            const row = document.createElement('div');
            row.className = 'comparison-row' + (r.id === rocketId ? ' is-me' : '');
            const rank = i + 1;
            const cls = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : '';
            row.innerHTML = `
                <span class="comparison-rank ${cls}">${rank}.</span>
                <span class="comparison-name">${r.name}${r.id === rocketId ? ' ←' : ''}</span>
                <span class="comparison-time">${r.stats.animationTime.toFixed(2)} s${rank === 1 ? ' ⚡' : ''}</span>
            `;
            comparisonList.appendChild(row);
        });
        pending.forEach(r => {
            const row = document.createElement('div');
            row.className = 'comparison-row pending';
            row.innerHTML = `
                <span class="comparison-rank">-</span>
                <span class="comparison-name">${r.name}</span>
                <span class="comparison-time">${t('pending')}...</span>
            `;
            comparisonList.appendChild(row);
        });
        comparisonBlock.style.display = 'block';
    });
}

// ==== BİLGİ PANELİ ====
function updateInfoPanel() {
    if (!rocket) return;
    const startY = rocket.groundY - rocket.height / 2;
    const travelDistance = startY + rocket.height;
    const timeProgress = Math.min(1, rocket.elapsedTime / rocket.animationDuration);
    const altitudeProgress = Math.min(1, Math.max(0, (startY - rocket.y) / travelDistance));
    const realTime = rocket.elapsedTime * rocket.timeMultiplier;
    const realSpeed = rocket.planet.orbitVelocity * timeProgress;
    const realAltitude = rocket.planet.orbitAltitude * altitudeProgress;
    const realAccel = rocket.status === 'launching' ? rocket.planet.orbitVelocity / rocket.realFlightTime : 0;
    infoSpeed.textContent = `${Math.round(realSpeed).toLocaleString('tr-TR')} m/s`;
    infoAccel.textContent = `${Math.round(realAccel).toLocaleString('tr-TR')} m/s²`;
    infoFuel.textContent = `${Math.round(rocket.fuel)}%`;
    infoMass.textContent = `${(rocket.currentMass / 1000).toFixed(1)} t`;
    infoAltitude.textContent = formatAltitude(realAltitude);
    infoTime.textContent = formatTime(realTime);
    if (rocket.fuel < 30) infoFuel.style.color = '#ff4444';
    else if (rocket.fuel < 60) infoFuel.style.color = '#ffaa00';
    else infoFuel.style.color = '#00cc66';
}

// ==== GEZEGEN (Yüzey) ====
function drawPlanetGround() {
    if (!rocket) return;
    const groundY = getGroundY();
    const curveHeight = 90;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(0, groundY + curveHeight);
    ctx.quadraticCurveTo(canvas.width/2, groundY - curveHeight, canvas.width, groundY + curveHeight);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    const pg = ctx.createLinearGradient(0, groundY - curveHeight, 0, canvas.height);
    pg.addColorStop(0, rocket.planet.color);
    pg.addColorStop(1, rocket.darken(rocket.planet.color, 0.3));
    ctx.fillStyle = pg; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, groundY + curveHeight);
    ctx.quadraticCurveTo(canvas.width/2, groundY - curveHeight, canvas.width, groundY + curveHeight);
    ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    for (let i = 0; i < 18; i++) {
        const x = (i*137 + 50) % canvas.width;
        const y = groundY + 30 + Math.sin(i)*30 + (i*23) % 50;
        const r = 5 + (i*7) % 18;
        ctx.beginPath(); ctx.ellipse(x, y, r, r*0.5, 0, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();

    const planetName = currentLang === 'tr' ? rocket.rocketData.planet : rocket.planet.nameEn;
    ctx.save();
    ctx.textAlign = 'right';
    ctx.font = 'bold 60px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.fillText(planetName.toUpperCase(), canvas.width - 30, canvas.height - 100);
    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fillText(`${t('gravity')}: ${rocket.planet.gravity} m/s²  •  ${t('escapeVel')}: ${rocket.planet.escapeVelocity} km/s`, canvas.width - 30, canvas.height - 65);
    ctx.restore();
}

// ==== YILDIZLAR ====
function initStars() {
    stars = [];
    for (let i = 0; i < 130; i++) {
        stars.push({
            x: Math.random() * canvas.width, y: Math.random() * canvas.height,
            radius: Math.random() * 1.5, brightness: Math.random()
        });
    }
}
function drawStars() {
    stars.forEach(s => {
        ctx.fillStyle = `rgba(255,255,255,${s.brightness})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.radius, 0, Math.PI*2); ctx.fill();
    });
}
function spawnShootingStar() {
    if (Math.random() < 0.012 && shootingStars.length < 3) {
        shootingStars.push({
            x: Math.random() * canvas.width, y: Math.random() * canvas.height * 0.5,
            vx: -(4 + Math.random()*4), vy: 2 + Math.random()*3, life: 1
        });
    }
}
function updateAndDrawShootingStars(dt) {
    spawnShootingStar();
    shootingStars.forEach(s => {
        s.x += s.vx * 60 * dt; s.y += s.vy * 60 * dt; s.life -= dt * 0.6;
        if (s.life > 0) {
            const g = ctx.createLinearGradient(s.x, s.y, s.x - s.vx*10, s.y - s.vy*10);
            g.addColorStop(0, `rgba(255,255,255,${s.life})`);
            g.addColorStop(0.5, `rgba(180,200,255,${s.life*0.5})`);
            g.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.strokeStyle = g; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx*10, s.y - s.vy*10); ctx.stroke();
            ctx.fillStyle = `rgba(255,255,255,${s.life})`;
            ctx.beginPath(); ctx.arc(s.x, s.y, 2, 0, Math.PI*2); ctx.fill();
        }
    });
    shootingStars = shootingStars.filter(s => s.life > 0 && s.y < canvas.height && s.x > -100);
}

// ==== ANİMASYON ====
let lastTime = 0;
let lastPlanetDraw = 0;
function animate(time) {
    const dt = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawStars(); updateAndDrawShootingStars(dt); drawPlanetGround();
    if (rocket) {
        rocket.update(dt); rocket.draw();
        updateInfoPanel();
        if (rocket.status === 'launching' || rocket.status === 'descending') {
            animationId = requestAnimationFrame(animate);
        } else { animationId = null; }
    }

    lastPlanetDraw += dt;
    drawPlanetView(dt);
}
function drawScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawStars(); drawPlanetGround();
    if (rocket) rocket.draw();
    updateInfoPanel();
    drawPlanetView(0);
}

// ==== GERİ SAYIM (Roket) — 5'ten başlar ====
function runLocalCountdown() {
    if (countdownTimer) return;
    let count = 5;
    countdownOverlay.classList.add('active');
    countdownNumber.textContent = count;
    countdownNumber.style.animation = 'none';
    void countdownNumber.offsetWidth;
    countdownNumber.style.animation = 'countdownPulse 0.8s ease-out';
    playWarningSound();
    speak(LANG[currentLang].speech[0]);
    statusMessage.textContent = t('countdown');
    statusMessage.style.color = '#ffcc00';
    launchBtn.disabled = true;
    countdownTimer = setInterval(() => {
        count--;
        if (count > 0) {
            countdownNumber.textContent = count;
            countdownNumber.style.animation = 'none';
            void countdownNumber.offsetWidth;
            countdownNumber.style.animation = 'countdownPulse 0.8s ease-out';
            const speechIdx = 5 - count;
            if (speechIdx >= 0 && speechIdx < 5) {
                speak(LANG[currentLang].speech[speechIdx]);
            }
            playWarningSound();
        } else {
            clearInterval(countdownTimer); countdownTimer = null;
            countdownOverlay.classList.remove('active');
            speak(LANG[currentLang].speech[5]);
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
    const gid = `single_${Date.now()}_${rocketId}`;
    try {
        isCountdownInitiator = true;
        await db.collection('rockets').doc(`rocket${rocketId}`).update({
            status: 'countdown', groupId: gid,
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
            status: 'idle', launchTime: null
        });
    } catch (e) {}
};

// ==== DİNLEYİCİ ====
function listenToRocket() {
    db.collection('rockets').doc(`rocket${rocketId}`).onSnapshot(doc => {
        if (!doc.exists) return;
        const data = doc.data();
        if (data.groupId) currentGroupId = data.groupId;
        if (!initialSnapshotDone) {
            initialSnapshotDone = true;
            if (data.status === 'launched') {
                rocket.status = 'landed';
                rocket.y = rocket.groundY - rocket.height / 2;
                if (data.stats) {
                    statValFuel.textContent = `%${data.stats.fuelUsed.toFixed(1)}`;
                    statValSpeed.textContent = `${Math.round(data.stats.maxSpeed).toLocaleString('tr-TR')} m/s`;
                    statValAlt.textContent = formatAltitude(data.stats.maxAltitude);
                }
                successOverlay.classList.add('active');
                statsPanel.style.display = 'block';
                launchBtn.disabled = false; resetBtn.disabled = false;
                atmosphereEl.style.opacity = '0';
                if (currentGroupId && currentGroupId.startsWith('group_')) startComparisonListener();
                drawScene();
            } else if (data.status === 'countdown') { runLocalCountdown(); }
            else if (data.status === 'launching') { playLaunchSound(); rocket.start(); }
            return;
        }
        if (data.status === 'countdown') {
            if (!countdownTimer && rocket.status !== 'launching') {
                if (rocket.status !== 'idle') rocket.reset();
                runLocalCountdown();
            }
        } else if (data.status === 'launching') {
            if (rocket.status !== 'launching' && !countdownTimer) {
                cancelCountdown(); playLaunchSound(); rocket.start();
            }
        } else if (data.status === 'launched') {
            const localStates = ['launching', 'launched', 'descending', 'landed'];
            if (!localStates.includes(rocket.status)) {
                rocket.status = 'launched';
                launchBtn.disabled = false; resetBtn.disabled = false;
                if (data.stats) {
                    statValFuel.textContent = `%${data.stats.fuelUsed.toFixed(1)}`;
                    statValSpeed.textContent = `${Math.round(data.stats.maxSpeed).toLocaleString('tr-TR')} m/s`;
                    statValAlt.textContent = formatAltitude(data.stats.maxAltitude);
                }
                successOverlay.classList.add('active');
                statsPanel.style.display = 'block';
                atmosphereEl.style.opacity = '0';
            }
        } else if (data.status === 'idle') {
            if (rocket.status !== 'idle' && !countdownTimer) {
                cancelCountdown(); rocket.reset();
            }
        }
    });
}

// ==== BAŞLATMA ====
async function init() {
    if (!localOverride) {
        try {
            const d = await db.collection('config').doc('language').get();
            if (d.exists && d.data().lang) currentLang = d.data().lang;
        } catch (e) {}
    }
    updateLangButtons();
    resizeCanvas(); initStars();
    rocket = new Rocket(rocketId, currentPlanet, currentRocket, animDuration);
    statusMessage.textContent = `${t('standby')} (${currentRocket.name})`;
    resetBtn.disabled = true;
    atmosphereEl.style.opacity = '1';
    applyLanguage();
    updatePlanetViewTitle();
    drawScene();

    function planetLoop(t) {
        const dt = Math.min((t - lastPlanetDraw) / 1000, 0.05);
        lastPlanetDraw = t;
        drawPlanetView(dt);
        requestAnimationFrame(planetLoop);
    }
    requestAnimationFrame(planetLoop);

    listenToLanguage();
    listenToRocket();
    document.body.addEventListener('click', () => getAudioCtx(), { once: true });
}
init();