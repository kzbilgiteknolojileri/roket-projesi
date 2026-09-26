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

function createRocketCards() {
    for (let i = 0; i < rocketCount; i++) {
        const card = document.createElement('div');
        card.className = 'rocket-card idle';
        card.id = `rocket-card-${i}`;

        const info = document.createElement('div');
        info.className = 'rocket-info';
        info.innerHTML = `<span class="rocket-name">Roket ${i + 1}</span><span class="rocket-planet">${planets[i].name}</span>`;

        const rightSide = document.createElement('div');
        rightSide.style.cssText = 'display:flex; align-items:center; gap:10px;';

        const status = document.createElement('span');
        status.className = 'rocket-status idle';
        status.id = `status-${i}`;
        status.textContent = 'Bekliyor';

        const btn = document.createElement('button');
        btn.className = 'launch-btn';
        btn.id = `launch-btn-${i}`;
        btn.textContent = 'Ateşle';
        btn.onclick = () => launchRocket(i);

        rightSide.append(status, btn);
        card.append(info, rightSide);
        controlsContainer.appendChild(card);
    }
}

async function launchRocket(id) {
    const docRef = db.collection('rockets').doc(`rocket${id}`);
    const doc = await docRef.get();
    if (doc.exists && doc.data().status === 'idle') {
        await docRef.update({
            status: 'launching',
            launchTime: firebase.firestore.FieldValue.serverTimestamp()
        });
    }
}

async function launchAll() {
    for (let i = 0; i < rocketCount; i++) await launchRocket(i);
}

function listenToRockets() {
    db.collection('rockets').onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
            const data = change.doc.data();
            const id = parseInt(change.doc.id.replace('rocket', ''));
            updateRocketUI(id, data.status);
        });
    });
}

function updateRocketUI(id, status) {
    const card = document.getElementById(`rocket-card-${id}`);
    const statusEl = document.getElementById(`status-${id}`);
    const btn = document.getElementById(`launch-btn-${id}`);
    if (!card || !statusEl || !btn) return;

    card.className = `rocket-card ${status}`;
    statusEl.className = `rocket-status ${status}`;

    if (status === 'idle') { statusEl.textContent = 'Bekliyor'; btn.disabled = false; }
    else if (status === 'launching') { statusEl.textContent = 'Ateşlendi'; btn.disabled = true; }
    else if (status === 'launched') { statusEl.textContent = 'Tamamlandı'; btn.disabled = true; }
}

function init() {
    createRocketCards();
    launchAllBtn.onclick = launchAll;
    listenToRockets();

    // Firestore'da roket dokümanlarını oluştur
    for (let i = 0; i < rocketCount; i++) {
        const docRef = db.collection('rockets').doc(`rocket${i}`);
        docRef.get().then(doc => {
            if (!doc.exists) docRef.set({ planet: planets[i].name, status: 'idle', launchTime: null });
        });
    }
}

init();