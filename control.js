// ==== VERİLER ====
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
const MASTER_PASSWORD = '230998';

// ==== OTOMATİK ATEŞLEME AYARLARI ====
const AUTO_LAUNCH_DELAY_MS = 15000; // 15 saniye
let autoLaunchTimer = null;
let autoLaunchCountdownInterval = null;
let autoLaunchFired = false; // Bu turda otomatik ateşleme yapıldı mı?

// ==== ÇEVİRİLER ====
const LANG = {
    tr: {
        title: '🚀 ROKET KONTROL MERKEZİ',
        live: 'CANLI YAYIN',
        launchAll: '🔥 TÜMÜNÜ ATEŞLE',
        stopAll: '⏹ TÜMÜNÜ DURDUR',
        resetAll: '🔄 TÜMÜNÜ SIFIRLA',
        standby: 'BEKLİYOR', countdown: 'GERİ SAYIM',
        launched: 'ATEŞLENDİ', complete: 'TAMAMLANDI',
        launch: '🚀 ATEŞLE',
        loginTitle: 'Kontrol Merkezi',
        loginSub: 'Yetkili giriş gereklidir',
        loginPass: 'Şifre', loginBtn: 'GİRİŞ YAP',
        loginError: '❌ Hatalı şifre!',
        speech: ['Beş', 'Dört', 'Üç', 'İki', 'Bir', 'Ateş!'], speechLang: 'tr-TR',
        voiceStart: 'SESLİ DENETİM', voiceListening: 'DİNLİYOR',
        voiceHeard: 'Duyuldu', voiceNoMatch: 'Anlaşılamadı',
        voiceLaunchAll: 'Tüm roketler ateşlendi!',
        voiceStopAll: 'Tüm roketler durduruldu!',
        voiceResetAll: 'Tüm roketler sıfırlandı!',
        voiceLaunchOne: 'ateşlendi', voiceResetOne: 'sıfırlandı',
        voiceDenied: 'Mikrofon izni verilmedi',
        voiceNotSupported: 'Tarayıcı desteklemiyor (Chrome/Edge kullanın)',
        voiceHint: 'Örn: "Tümünü ateşle" veya "Roket 1 ateşle"',
        voiceHeardAny: 'Duyulan',
        autoLaunchStart: 'roket 15 saniye içinde otomatik ateşlenecek',
        autoLaunchCancel: 'Otomatik ateşleme iptal edildi',
        autoLaunchFired: 'roket otomatik ateşlendi!',
        autoLaunchCountdown: 'Otomatik ateşlemeye kalan'
    },
    en: {
        title: '🚀 ROCKET CONTROL CENTER',
        live: 'LIVE',
        launchAll: '🔥 LAUNCH ALL',
        stopAll: '⏹ STOP ALL',
        resetAll: '🔄 RESET ALL',
        standby: 'STANDBY', countdown: 'COUNTDOWN',
        launched: 'LAUNCHED', complete: 'COMPLETE',
        launch: '🚀 LAUNCH',
        loginTitle: 'Control Center',
        loginSub: 'Authorized access required',
        loginPass: 'Password', loginBtn: 'LOG IN',
        loginError: '❌ Wrong password!',
        speech: ['Five', 'Four', 'Three', 'Two', 'One', 'Fire!'], speechLang: 'en-US',
        voiceStart: 'VOICE CONTROL', voiceListening: 'LISTENING',
        voiceHeard: 'Heard', voiceNoMatch: 'Not understood',
        voiceLaunchAll: 'All rockets launched!',
        voiceStopAll: 'All rockets stopped!',
        voiceResetAll: 'All rockets reset!',
        voiceLaunchOne: 'launched', voiceResetOne: 'reset',
        voiceDenied: 'Microphone permission denied',
        voiceNotSupported: 'Browser not supported (use Chrome/Edge)',
        voiceHint: 'Ex: "Launch all" or "Rocket 1 launch"',
        voiceHeardAny: 'Heard',
        autoLaunchStart: 'rockets will auto-launch in 15 seconds',
        autoLaunchCancel: 'Auto-launch cancelled',
        autoLaunchFired: 'rockets auto-launched!',
        autoLaunchCountdown: 'Auto-launch in'
    }
};
let currentLang = 'tr';
function t(k) { return LANG[currentLang][k] || k; }

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

// ==== SESLİ KOMUT (MASTER) ====
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

const ROCKET_ALIASES = {
    0: ['saturn v', 'saturn bes', 'saturn beş', 'saturn 5', 'saturn'],
    1: ['falcon 9', 'falcon nine', 'falcon dokuz', 'falcon'],
    2: ['ariane 5', 'ariane bes', 'ariane beş', 'ariane'],
    3: ['soyuz fg', 'soyuz', 'soyuz f g'],
    4: ['long march 5', 'long march bes', 'long march beş', 'long march'],
    5: ['h iia', 'h i i a', 'h 2 a', 'h2a'],
    6: ['delta iv heavy', 'delta 4 heavy', 'delta heavy', 'delta'],
    7: ['proton m', 'proton'],
    8: ['electron']
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

function parseMasterCommand(transcript) {
    const norm = normalizeText(transcript);
    const words = norm.split(' ');
    const nums = currentLang === 'tr' ? TR_NUMS : EN_NUMS;

    const fireWords = ['ateşle', 'atesle', 'ateş', 'ates', 'fırlat', 'firlat', 'başlat', 'baslat', 'launch', 'fire', 'start', 'go', 'başla', 'basla'];
    const stopWords = ['durdur', 'dur', 'kes', 'stop', 'halt'];
    const resetWords = ['sıfırla', 'sifirla', 'temizle', 'reset', 'clear'];

    const hasFire = containsAnyWord(norm, fireWords);
    const hasStop = containsAnyWord(norm, stopWords);
    const hasReset = containsAnyWord(norm, resetWords);

    if (!hasFire && !hasStop && !hasReset) return null;

    const allWords = ['tümünü', 'tumunu', 'tümü', 'tumu', 'hepsini', 'hepsi', 'tüm', 'tum', 'all', 'everything'];
    const hasAll = containsAnyWord(norm, allWords);

    if (hasAll) {
        if (hasFire) return { type: 'launch-all' };
        if (hasStop) return { type: 'stop-all' };
        if (hasReset) return { type: 'reset-all' };
    }

    const hasRocketWord = words.includes('roket') || words.includes('rocket');
    if (hasRocketWord) {
        const n = extractNumber(words, nums);
        if (n !== null && n >= 1 && n <= 9) {
            if (hasFire) return { type: 'launch-one', id: n - 1 };
            if (hasReset) return { type: 'reset-one', id: n - 1 };
        }
    }

    for (let i = 0; i < rocketCount; i++) {
        const aliases = ROCKET_ALIASES[i] || [];
        const match = aliases.some(a => norm.includes(a));
        if (match) {
            if (hasFire) return { type: 'launch-one', id: i };
            if (hasReset) return { type: 'reset-one', id: i };
        }
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
    el._timeout = setTimeout(() => el.classList.remove('show'), 3500);
}

async function executeMasterCommand(cmd, transcript) {
    const key = JSON.stringify(cmd);
    const now = Date.now();
    if (key === lastCommandKey && (now - lastCommandTime) < 2000) return;
    lastCommandKey = key;
    lastCommandTime = now;

    if (cmd.type === 'launch-all') {
        showVoiceToast(`🎤 "${transcript}" → ${t('voiceLaunchAll')}`, 'ok');
        await launchAll();
    } else if (cmd.type === 'stop-all') {
        showVoiceToast(`🎤 "${transcript}" → ${t('voiceStopAll')}`, 'ok');
        await stopAll();
    } else if (cmd.type === 'reset-all') {
        showVoiceToast(`🎤 "${transcript}" → ${t('voiceResetAll')}`, 'ok');
        await resetAll();
    } else if (cmd.type === 'launch-one') {
        const rn = ROCKETS[cmd.id].name;
        showVoiceToast(`🎤 "${transcript}" → ${rn} ${t('voiceLaunchOne')}`, 'ok');
        await startCountdown(cmd.id);
    } else if (cmd.type === 'reset-one') {
        const rn = ROCKETS[cmd.id].name;
        showVoiceToast(`🎤 "${transcript}" → ${rn} ${t('voiceResetOne')}`, 'ok');
        await resetRocket(cmd.id);
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

    rec.onstart = () => { console.log('[Voice] Başladı, dil:', rec.lang); };
    rec.onresult = (event) => {
        console.log('[Voice] Sonuç:', event.results);
        let found = false;
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const res = event.results[i];
            for (let k = 0; k < res.length; k++) {
                const transcript = res[k].transcript.trim();
                if (!transcript) continue;
                console.log('[Voice] Transcript:', transcript);
                const cmd = parseMasterCommand(transcript);
                if (cmd) {
                    executeMasterCommand(cmd, transcript);
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
                if (heard) {
                    showVoiceToast(`🎤 ${t('voiceHeardAny')}: "${heard}" — ${t('voiceNoMatch')}`, 'no-match');
                }
            }
        }
    };
    rec.onerror = (e) => {
        console.warn('[Voice] Hata:', e.error);
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
            showVoiceToast('❌ ' + t('voiceDenied'), 'error');
            stopVoice();
        }
    };
    rec.onend = () => {
        console.log('[Voice] Oturum kapandı, voiceActive:', voiceActive);
        if (voiceActive) {
            setTimeout(() => {
                if (voiceActive) {
                    try { rec.start(); } catch (e) { console.warn('[Voice] Restart:', e); }
                }
            }, 250);
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
        showVoiceToast(`🎤 ${t('voiceListening')} — ${t('voiceHint')}`, 'ok');
    } catch (e) {
        console.warn('[Voice] Start hatası:', e);
        try {
            recognition.stop();
            setTimeout(() => {
                try { recognition.start(); voiceActive = true; updateVoiceBtn(); } catch(e2) {}
            }, 300);
        } catch (e2) {}
    }
}
function stopVoice() {
    voiceActive = false;
    if (recognition) { try { recognition.stop(); } catch (e) {} }
    updateVoiceBtn();
}
function updateVoiceBtn() {
    const btn = document.getElementById('voice-btn');
    const txt = document.getElementById('voice-text');
    if (!btn || !txt) return;
    if (voiceActive) {
        btn.classList.add('listening');
        btn.classList.remove('error');
        txt.textContent = '● ' + t('voiceListening');
    } else {
        btn.classList.remove('listening');
        txt.textContent = t('voiceStart');
    }
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

async function setLanguage(lang) {
    try { await db.collection('config').doc('language').set({ lang }, { merge: true }); } catch (e) {}
}
document.getElementById('lang-tr').onclick = () => setLanguage('tr');
document.getElementById('lang-en').onclick = () => setLanguage('en');

const voiceBtn = document.getElementById('voice-btn');
if (voiceBtn) {
    voiceBtn.onclick = () => {
        if (voiceActive) {
            stopVoice();
            showVoiceToast('🎤 ' + (currentLang === 'tr' ? 'Sesli denetim kapatıldı' : 'Voice control off'), 'ok');
        } else {
            startVoice();
        }
    };
}

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

// ==== OTOMATİK ATEŞLEME ====
// Bir roket ateşlendiğinde 15 saniye içinde diğerlerine dokunulmazsa kalan idle roketler otomatik ateşlenir
// SADECE BİR KEZ çalışır (tüm roketler sıfırlanınca yeniden aktif olur)
function startAutoLaunchTimer() {
    if (autoLaunchTimer) {
        clearTimeout(autoLaunchTimer);
        autoLaunchTimer = null;
    }
    if (autoLaunchCountdownInterval) {
        clearInterval(autoLaunchCountdownInterval);
        autoLaunchCountdownInterval = null;
    }
    
    let secondsLeft = Math.ceil(AUTO_LAUNCH_DELAY_MS / 1000);
    const initialSeconds = secondsLeft;
    
    updateAutoLaunchIndicator(secondsLeft, initialSeconds);
    
    autoLaunchCountdownInterval = setInterval(() => {
        secondsLeft--;
        if (secondsLeft > 0) {
            updateAutoLaunchIndicator(secondsLeft, initialSeconds);
        }
    }, 1000);
    
    autoLaunchTimer = setTimeout(async () => {
        autoLaunchTimer = null;
        if (autoLaunchCountdownInterval) {
            clearInterval(autoLaunchCountdownInterval);
            autoLaunchCountdownInterval = null;
        }
        hideAutoLaunchIndicator();
        await autoLaunchRemainingRockets();
    }, AUTO_LAUNCH_DELAY_MS);
}

function cancelAutoLaunchTimer(silent = false) {
    if (autoLaunchTimer) {
        clearTimeout(autoLaunchTimer);
        autoLaunchTimer = null;
    }
    if (autoLaunchCountdownInterval) {
        clearInterval(autoLaunchCountdownInterval);
        autoLaunchCountdownInterval = null;
    }
    hideAutoLaunchIndicator();
    if (!silent) {
        console.log('[AutoLaunch] Timer iptal edildi');
    }
}

// Durum kontrolü — her roket değişikliğinde çağrılır
function checkAutoLaunch() {
    let activeCount = 0;
    let idleCount = 0;
    
    for (let i = 0; i < rocketCount; i++) {
        const st = lastKnownStatuses[i];
        if (st === 'idle') idleCount++;
        else if (st) activeCount++;
    }
    
    // HEPİSİ IDLE → flag'i sıfırla (yeni tura hazır)
    if (idleCount === rocketCount) {
        autoLaunchFired = false;
        if (autoLaunchTimer) cancelAutoLaunchTimer(true);
        return;
    }
    
    // Hepsi aktif → timer'ı iptal et
    if (idleCount === 0) {
        if (autoLaunchTimer) cancelAutoLaunchTimer(true);
        return;
    }
    
    // Bu turda zaten otomatik ateşleme yapıldıysa → tekrar başlatma
    if (autoLaunchFired) {
        return;
    }
    
    // Timer zaten çalışıyorsa → sıfırlama, sadece bekle
    if (autoLaunchTimer) {
        return;
    }
    
    // En az 1 aktif, en az 1 idle var → timer başlat
    console.log(`[AutoLaunch] Timer başlatılıyor. Aktif: ${activeCount}, Idle: ${idleCount}`);
    startAutoLaunchTimer();
}

function updateAutoLaunchIndicator(secondsLeft, totalSeconds) {
    const el = document.getElementById('voice-toast');
    if (!el) return;
    el.textContent = `🤖 ${t('autoLaunchCountdown')}: ${secondsLeft}s`;
    el.className = 'voice-toast show';
    if (secondsLeft <= 3) {
        el.classList.add('error-toast');
    } else if (secondsLeft <= 7) {
        el.classList.add('not-matched');
    }
    clearTimeout(el._timeout);
    el._timeout = setTimeout(() => el.classList.remove('show'), 2000);
}
function hideAutoLaunchIndicator() {
    const el = document.getElementById('voice-toast');
    if (el) el.classList.remove('show');
}

// Kalan idle roketleri otomatik ateşle
async function autoLaunchRemainingRockets() {
    autoLaunchFired = true; // Bir kez tetiklendi olarak işaretle
    
    const idleRockets = [];
    for (let i = 0; i < rocketCount; i++) {
        if (lastKnownStatuses[i] === 'idle') idleRockets.push(i);
    }
    
    if (idleRockets.length === 0) {
        console.log('[AutoLaunch] Idle roket kalmadı, atlanıyor');
        return;
    }
    
    console.log(`[AutoLaunch] ${idleRockets.length} roket otomatik ateşleniyor:`, idleRockets);
    
    const gid = `auto_${Date.now()}`;
    const batch = db.batch();
    
    for (const i of idleRockets) {
        const ref = db.collection('rockets').doc(`rocket${i}`);
        batch.set(ref, {
            planet: ROCKETS[i].planet,
            name: ROCKETS[i].name,
            status: 'countdown',
            groupId: gid,
            countdownStart: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
    }
    
    try {
        await batch.commit();
        playSuccessSound();
        showVoiceToast(`🤖 ${idleRockets.length} ${t('autoLaunchFired')}`, 'ok');
    } catch (e) {
        console.warn('[AutoLaunch] Batch hatası:', e);
    }
}

// ==== FIRESTORE — TEK ROKET ====
async function startCountdown(id, groupId) {
    playClickSound();
    const gid = groupId || `single_${Date.now()}_${id}`;
    try {
        await db.collection('rockets').doc(`rocket${id}`).set({
            planet: ROCKETS[id].planet,
            name: ROCKETS[id].name,
            status: 'countdown',
            groupId: gid,
            countdownStart: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
    } catch (e) {
        console.warn('startCountdown hata:', e);
    }
}

async function stopRocket(id) {
    try {
        await db.collection('rockets').doc(`rocket${id}`).set({
            status: 'idle',
            launchTime: null
        }, { merge: true });
    } catch (e) {}
}

async function resetRocket(id) {
    playClickSound();
    await stopRocket(id);
}

// ==== FIRESTORE — TOPLU İŞLEMLER (BATCH) ====
async function launchAll() {
    playSuccessSound();
    cancelAutoLaunchTimer(true);
    autoLaunchFired = true; // Tümü ateşlendiği için otomatik tetiklemeyi kapat
    const gid = `group_${Date.now()}`;
    const batch = db.batch();

    for (let i = 0; i < rocketCount; i++) {
        const ref = db.collection('rockets').doc(`rocket${i}`);
        batch.set(ref, {
            planet: ROCKETS[i].planet,
            name: ROCKETS[i].name,
            status: 'countdown',
            groupId: gid,
            countdownStart: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
    }

    try {
        await batch.commit();
        console.log('[LaunchAll] 9 roket tek istekte yazıldı');
    } catch (e) {
        console.error('[LaunchAll] Batch başarısız, tek tek yazılıyor:', e);
        await Promise.all(
            Array.from({ length: rocketCount }, (_, i) =>
                db.collection('rockets').doc(`rocket${i}`).set({
                    planet: ROCKETS[i].planet,
                    name: ROCKETS[i].name,
                    status: 'countdown',
                    groupId: gid,
                    countdownStart: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true }).catch(() => {})
            )
        );
    }
}

async function stopAll() {
    playBeep(400, 0.2, 0.25);
    cancelAutoLaunchTimer(true);
    const batch = db.batch();
    for (let i = 0; i < rocketCount; i++) {
        const ref = db.collection('rockets').doc(`rocket${i}`);
        batch.set(ref, { status: 'idle', launchTime: null }, { merge: true });
    }
    try {
        await batch.commit();
    } catch (e) {
        await Promise.all(
            Array.from({ length: rocketCount }, (_, i) =>
                db.collection('rockets').doc(`rocket${i}`).set(
                    { status: 'idle', launchTime: null }, { merge: true }
                ).catch(() => {})
            )
        );
    }
}

async function resetAll() {
    playClickSound();
    cancelAutoLaunchTimer(true);
    autoLaunchFired = false; // Yeni tura hazırla
    await stopAll();
}

// ==== GERİ SAYIM (Master) — 5'ten başlar ====
const activeCountdowns = {};
function runCountdown(id) {
    if (activeCountdowns[id]) return;
    activeCountdowns[id] = true;
    let count = 5;
    playWarningSound();
    speak(LANG[currentLang].speech[0]);

    const tick = () => {
        if (count > 1) {
            count--;
            const speechIdx = 5 - count;
            if (speechIdx >= 0 && speechIdx < 5) {
                speak(LANG[currentLang].speech[speechIdx]);
            }
            playWarningSound();
            setTimeout(tick, 1000);
        } else {
            setTimeout(async () => {
                speak(LANG[currentLang].speech[5]);
                playLaunchSound();
                try {
                    await db.collection('rockets').doc(`rocket${id}`).set({
                        status: 'launching',
                        launchTime: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
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
        checkAutoLaunch();
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
    updateVoiceBtn();
    if (recognition) {
        try { recognition.lang = LANG[currentLang].speechLang; } catch (e) {}
    }
    if (initialized) createRocketTiles();
}
function listenToLanguage() {
    db.collection('config').doc('language').onSnapshot(doc => {
        if (doc.exists && doc.data().lang && doc.data().lang !== currentLang) {
            currentLang = doc.data().lang;
            applyLanguage();
        }
    });
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
    db.collection('config').doc('language').get().then(d => {
        if (d.exists && d.data().lang) currentLang = d.data().lang;
    }).catch(() => {}).finally(() => init());
}