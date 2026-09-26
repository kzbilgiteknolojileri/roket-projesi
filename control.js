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

const rocketCount = 9;
const controlsContainer = document.getElementById('rocket-controls');
const launchAllBtn = document.getElementById('launch-all');
const resetAllBtn = document.getElementById('reset-all');

// ---- Ses motoru ----
let audioCtx = null;
function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
}

function playBeep(frequency = 800, duration = 0.15) {
    try {
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = frequency;
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
    } catch (e) { console.warn('Ses hatası:', e); }
}

function playLaunchSound() {
    try {
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(60, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 2.5);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 2.5);
    } catch (e) { console.warn('Ses hatası:', e); }
}

// ---- Arayüz oluşturma ----
function createRocketCards() {
    for (let i = 0; i < rocketCount; i++) {
        const card = document.createElement('div');
        card.className = 'rocket-card idle';
        card.id = `rocket-card-${i}`;

        const info = document.createElement('div');
        info.className = 'rocket-info';
        info.innerHTML = `<span class="rocket-name">Roket ${i + 1}</span><span class="rocket-planet">${planets[i].name}</span>`;

        const actions = document.createElement('div');
        actions.className = 'rocket-actions';

        const status = document.createElement('span');
        status.className = 'rocket-status idle';
        status.id = `status-${i}`;
        status.textContent = 'Bekliyor';

        const launchBtn = document.createElement('button');
        launchBtn.className = 'launch-btn';
        launchBtn.id = `launch-btn-${i}`;
        launchBtn.textContent = 'Ateşle';
        launchBtn.onclick = () => startCountdown(i);

        const resetBtn = document.createElement('button');
        resetBtn.className = 'reset-btn';
        resetBtn.id = `reset-btn-${i}`;
        resetBtn.textContent = 'Sıfırla';
        resetBtn.onclick = () => resetRocket(i);

        actions.append(status, launchBtn, resetBtn);
        card.append(info, actions);
        controlsContainer.appendChild(card);
    }
}

// ---- Firestore işlemleri ----
async function startCountdown(id) {
    const docRef = db.collection('rockets').doc(`rocket${id}`);
    const doc = await docRef.get();
    if (!doc.exists) return;
    const data = doc.data();
    if (data.status === 'idle' || data.status === 'launched') {
        await docRef.update({
            status: 'countdown',
            countdownStart: firebase.firestore.FieldValue.serverTimestamp()
        });
    }
}

async function resetRocket(id) {
    const docRef = db.collection('rockets').doc(`rocket${id}`);
    await docRef.update({
        status: 'idle',
        launchTime: null
    });
}

async function launchAll() {
    for (let i = 0; i < rocketCount; i++) {
        const docRef = db.collection('rockets').doc(`rocket${i}`);
        const doc = await docRef.get();
        if (doc.exists) {
            const data = doc.data();
            if (data.status === 'idle' || data.status === 'launched') {
                await docRef.update({
                    status: 'countdown',
                    countdownStart: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        }
    }
}

async function resetAll() {
    for (let i = 0; i < rocketCount; i++) {
        await resetRocket(i);
    }
}

// ---- Geri sayım yönetimi ----
const activeCountdowns = {};

function runCountdown(id) {
    if (activeCountdowns[id]) return; // zaten çalışıyor
    let count = 3;
    playBeep(600, 0.2);
    activeCountdowns[id] = true;

    const tick = () => {
        if (count > 1) {
            count--;
            playBeep(600, 0.2);
            setTimeout(tick, 1000);
        } else {
            // Geri sayım bitti -> launching
            setTimeout(async () => {
                playLaunchSound();
                const docRef = db.collection('rockets').doc(`rocket${id}`);
                await docRef.update({
                    status: 'launching',
                    launchTime: firebase.firestore.FieldValue.serverTimestamp()
                });
                delete activeCountdowns[id];
            }, 1000);
        }
    };
    setTimeout(tick, 1000);
}

// ---- Firestore dinleyicisi ----
function listenToRockets() {
    db.collection('rockets').onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
            const data = change.doc.data();
            const id = parseInt(change.doc.id.replace('rocket', ''));
            updateRocketUI(id, data.status);
            if (data.status === 'countdown') runCountdown(id);
        });
    });
}

function updateRocketUI(id, status) {
    const card = document.getElementById(`rocket-card-${id}`);
    const statusEl = document.getElementById(`status-${id}`);
    const launchBtn = document.getElementById(`launch-btn-${id}`);
    const resetBtn = document.getElementById(`reset-btn-${id}`);
    if (!card || !statusEl || !launchBtn || !resetBtn) return;

    card.className = `rocket-card ${status}`;
    statusEl.className = `rocket-status ${status}`;

    if (status === 'idle') {
        statusEl.textContent = 'Bekliyor';
        launchBtn.disabled = false;
        resetBtn.disabled = true;
    } else if (status === 'countdown') {
        statusEl.textContent = 'Geri Sayım';
        launchBtn.disabled = true;
        resetBtn.disabled = false;
    } else if (status === 'launching') {
        statusEl.textContent = 'Ateşlendi';
        launchBtn.disabled = true;
        resetBtn.disabled = false;
    } else if (status === 'launched') {
        statusEl.textContent = 'Tamamlandı';
        launchBtn.disabled = false;
        resetBtn.disabled = false;
    }
}

// ---- Başlatma ----
function init() {
    createRocketCards();
    launchAllBtn.onclick = launchAll;
    resetAllBtn.onclick = resetAll;
    listenToRockets();

    for (let i = 0; i < rocketCount; i++) {
        const docRef = db.collection('rockets').doc(`rocket${i}`);
        docRef.get().then(doc => {
            if (!doc.exists) {
                docRef.set({ planet: planets[i].name, status: 'idle', launchTime: null });
            }
        });
    }
}

init();