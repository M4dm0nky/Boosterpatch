// ============================================================
// 13. FILE I/O
// ============================================================
function triggerLoad() {
  if (state.modified && state.devices.length > 0) {
    if (!confirm('Ungespeicherte Änderungen gehen verloren. Trotzdem öffnen?')) return;
  }
  document.getElementById('fileInput').click();
}

function handleFileLoad(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      loadProjectData(data);
      showToast('Projekt geladen: ' + (data.projectName || file.name), 'success');
    } catch {
      showToast('Fehler beim Laden der Datei.', 'error');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

function loadProjectData(data) {
  if (!data || !Array.isArray(data.devices)) {
    showToast('Ungültiges Projektformat.', 'error');
    return;
  }
  state.projectName = data.projectName || 'Unbenannt';
  state.created = data.created || new Date().toISOString();
  state.projectCreated = true;
  state.devices = data.devices || [];
  // Ensure ethId and routeToInput fields exist on outputs (backward compat)
  state.devices.forEach(d => d.connections.outputs.forEach(o => {
    if (o.ethId === undefined) o.ethId = null;
    if (o.routeToInput === undefined) o.routeToInput = 1;
  }));
  if (data.logos) {
    logos.planer  = data.logos.planer  || '';
    logos.band    = data.logos.band    || '';
    logos.booking = data.logos.booking || '';
    applyAllLogos();
    saveLogosLocal();
  }
  markSaved();
  updateProjectDisplay();
  renderAllDevices();
  renderPatchTable();
  updateEmptyState();
}

function importDevices() {
  document.getElementById('importInput').click();
}

function handleImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!Array.isArray(data.devices)) throw new Error();
      data.devices.forEach(d => {
        d.id = generateUUID();
        d.connections.outputs.forEach(o => { if (o.ethId === undefined) o.ethId = null; if (o.routeToInput === undefined) o.routeToInput = 1; });
        state.devices.push(d);
      });
      markModified();
      renderAllDevices();
      renderPatchTable();
      updateEmptyState();
      showToast(data.devices.length + ' Gerät(e) importiert.', 'success');
    } catch {
      showToast('Import fehlgeschlagen.', 'error');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

function exportPrint() {
  window.print();
}

// ============================================================
// 16. LOGO MANAGEMENT
// ============================================================
const LOGOS_KEY = 'boosterpatch-logos';
const logos = { planer: '', band: '', booking: '' };

function handleLogoUpload(type, input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    logos[type] = e.target.result;
    applyLogoToHeader(type);
    updateLogoPreviews();
    saveLogosLocal();
    markModified();
    showToast('Logo gesetzt.', 'success');
  };
  reader.readAsDataURL(file);
  input.value = '';
}

function removeLogo(type) {
  logos[type] = '';
  applyLogoToHeader(type);
  updateLogoPreviews();
  saveLogosLocal();
  markModified();
  showToast('Logo entfernt.', 'info');
}

function applyLogoToHeader(type) {
  if (type === 'planer') {
    const area = document.getElementById('areaPlaner');
    if (!area) return;
    area.innerHTML = '';
    if (logos.planer) {
      const img = document.createElement('img');
      img.src = logos.planer; img.className = 'logo-planer';
      img.title = 'Logo ändern'; img.onclick = () => document.getElementById('inLogoPlaner').click();
      area.appendChild(img);
    }
  } else if (type === 'band') {
    const area = document.getElementById('areaBand');
    if (!area) return;
    const existing = area.querySelector('.logo-band');
    if (existing) existing.remove();
    if (logos.band) {
      const img = document.createElement('img');
      img.src = logos.band; img.className = 'logo-band';
      img.title = 'Logo ändern'; img.onclick = () => document.getElementById('inLogoBand').click();
      area.insertBefore(img, area.firstChild);
    }
  } else if (type === 'booking') {
    const area = document.getElementById('areaBooking');
    if (!area) return;
    area.innerHTML = '';
    if (logos.booking) {
      const img = document.createElement('img');
      img.src = logos.booking; img.className = 'logo-booking';
      img.title = 'Logo ändern'; img.onclick = () => document.getElementById('inLogoBooking').click();
      area.appendChild(img);
    }
  }
}

function applyAllLogos() {
  ['planer', 'band', 'booking'].forEach(t => applyLogoToHeader(t));
}

function updateLogoPreviews() {
  ['planer', 'band', 'booking'].forEach(type => {
    const key = type.charAt(0).toUpperCase() + type.slice(1);
    const prev = document.getElementById('prev' + key);
    const rm   = document.getElementById('rm' + key);
    if (!prev) return;
    if (logos[type]) {
      prev.src = logos[type]; prev.style.display = 'block';
      rm.style.display = 'block';
    } else {
      prev.src = ''; prev.style.display = 'none';
      rm.style.display = 'none';
    }
  });
}

function saveLogosLocal() {
  try { localStorage.setItem(LOGOS_KEY, JSON.stringify(logos)); } catch (e) {}
}

function loadLogosLocal() {
  try {
    const raw = localStorage.getItem(LOGOS_KEY);
    if (raw) {
      const l = JSON.parse(raw);
      logos.planer  = l.planer  || '';
      logos.band    = l.band    || '';
      logos.booking = l.booking || '';
      applyAllLogos();
    }
  } catch (e) {}
}

function openLogosModal() {
  updateLogoPreviews();
  document.getElementById('logosModal').classList.add('open');
}

// ============================================================
// 17. STORAGE SYSTEM
// ============================================================

function buildSaveData() {
  return {
    appVersion: APP_VERSION,
    projectName: state.projectName,
    created: state.created || new Date().toISOString(),
    modified: new Date().toISOString(),
    devices: state.devices,
    logos: { planer: logos.planer, band: logos.band, booking: logos.booking }
  };
}

// --- localStorage auto-save ---
const LS_KEY = 'boosterpatch-state';
let lsAutoSaveTimer = null;

function scheduleAutoSave() {
  clearTimeout(lsAutoSaveTimer);
  lsAutoSaveTimer = setTimeout(autoSaveToLS, 2 * 60 * 1000);
}

function autoSaveToLS() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(buildSaveData()));
    showSaveIndicator('auto');
  } catch(e) {}
  scheduleAutoSave();
}

function tryLoadFromLS() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.devices)) return false;
    loadProjectData(data);
    return true;
  } catch(e) { return false; }
}

// --- Save indicator ---
let _saveIndTimer = null;
function showSaveIndicator(type) {
  const el = document.getElementById('modifiedIndicator');
  clearTimeout(_saveIndTimer);
  if (type === 'auto') {
    el.textContent = '✓ AUTO-GESPEICHERT';
    el.style.color = 'var(--accent-green)';
    el.classList.add('visible');
    _saveIndTimer = setTimeout(() => {
      el.style.color = '';
      if (!state.modified) el.classList.remove('visible');
      else { el.textContent = '● UNGESPEICHERT'; el.style.color = ''; }
    }, 3000);
  } else if (type === 'saved') {
    el.textContent = '✓ GESPEICHERT';
    el.style.color = 'var(--accent-green)';
    el.classList.add('visible');
    _saveIndTimer = setTimeout(() => {
      el.style.color = '';
      el.classList.remove('visible');
    }, 3000);
  }
}

// --- IndexedDB for FileHandle ---
const IDB_NAME = 'boosterpatch-db';
const IDB_STORE = 'filehandles';
const IDB_KEY = 'current';

function openIDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = e => e.target.result.createObjectStore(IDB_STORE);
    req.onsuccess = e => resolve(e.target.result);
    req.onerror = () => reject();
  });
}

async function saveFileHandleToIDB(handle) {
  try {
    const db = await openIDB();
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(handle, IDB_KEY);
  } catch(e) {}
}

async function loadFileHandleFromIDB() {
  try {
    const db = await openIDB();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).get(IDB_KEY);
      req.onsuccess = e => resolve(e.target.result || null);
      req.onerror = () => resolve(null);
    });
  } catch(e) { return null; }
}

async function clearFileHandleFromIDB() {
  try {
    const db = await openIDB();
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).delete(IDB_KEY);
  } catch(e) {}
}

// --- Current FileHandle ---
let currentFileHandle = null;
let currentFileName = '';

async function writeToFileHandle(handle) {
  const json = JSON.stringify(buildSaveData(), null, 2);
  const writable = await handle.createWritable();
  await writable.write(json);
  await writable.close();
  currentFileHandle = handle;
  currentFileName = handle.name;
  await saveFileHandleToIDB(handle);
  markSaved();
  showSaveIndicator('saved');
}

// --- File auto-save interval (2 min) ---
setInterval(async () => {
  if (!currentFileHandle) return;
  try {
    const perm = await currentFileHandle.queryPermission({ mode: 'readwrite' });
    if (perm === 'granted') {
      const json = JSON.stringify(buildSaveData(), null, 2);
      const writable = await currentFileHandle.createWritable();
      await writable.write(json);
      await writable.close();
      showSaveIndicator('auto');
    }
  } catch(e) {}
}, 2 * 60 * 1000);

// --- Save dialog ---
function saveProjectDialog() {
  if (state.devices.length === 0 && !state.projectCreated) {
    showToast('Kein Projekt zum Speichern.', 'warning');
    return;
  }
  const body = document.getElementById('saveModalBody');
  body.innerHTML = '';

  if (currentFileHandle) {
    const opt1 = document.createElement('div');
    opt1.className = 'save-option';
    opt1.innerHTML = `<div class="save-option-icon">💾</div>
      <div class="save-option-text">
        <strong>IN AKTUELLE DATEI</strong>
        <span>${currentFileName}</span>
      </div>`;
    opt1.onclick = async () => {
      closeModal('saveModal');
      try { await writeToFileHandle(currentFileHandle); }
      catch(e) { showToast('Fehler beim Speichern.', 'error'); }
    };
    body.appendChild(opt1);
  }

  const opt2 = document.createElement('div');
  opt2.className = 'save-option';
  opt2.innerHTML = `<div class="save-option-icon">↓</div>
    <div class="save-option-text">
      <strong>${currentFileHandle ? 'SPEICHERN ALS …' : 'NEUE DATEI ANLEGEN'}</strong>
      <span>Datei-Speicherort wählen</span>
    </div>`;
  opt2.onclick = () => { closeModal('saveModal'); saveProjectAs(); };
  body.appendChild(opt2);

  if (!window.showSaveFilePicker) {
    const opt3 = document.createElement('div');
    opt3.className = 'save-option';
    opt3.innerHTML = `<div class="save-option-icon">⬇</div>
      <div class="save-option-text">
        <strong>HERUNTERLADEN</strong>
        <span>JSON-Datei in Downloads-Ordner</span>
      </div>`;
    opt3.onclick = () => { closeModal('saveModal'); downloadJSON(); };
    body.appendChild(opt3);
  }

  openModal('saveModal');
}

async function saveProjectAs() {
  if (!window.showSaveFilePicker) { downloadJSON(); return; }
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: (state.projectName || 'boosterpatch').replace(/[^a-z0-9äöüß_\- ]/gi, '_') + '.json',
      types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }]
    });
    await writeToFileHandle(handle);
    showToast('Gespeichert: ' + handle.name, 'success');
  } catch(e) {
    if (e.name !== 'AbortError') showToast('Fehler beim Speichern.', 'error');
  }
}

function downloadJSON() {
  const blob = new Blob([JSON.stringify(buildSaveData(), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = (state.projectName || 'boosterpatch').replace(/[^a-z0-9äöüß_\- ]/gi, '_') + '.json';
  a.click();
  URL.revokeObjectURL(url);
  markSaved();
  showToast('Datei heruntergeladen.', 'success');
}

// --- Sidebar device list ---
function renderSidebarDeviceList() {
  const list = document.getElementById('sidebarDeviceList');
  if (!list) return;
  list.innerHTML = '';
  state.devices.forEach(d => {
    const item = document.createElement('div');
    item.className = 'sb-device-item';
    item.innerHTML = `<span class="sb-device-name">${d.name}</span>
      <span class="sb-device-badge">${d.outputs}OUT</span>`;
    item.onclick = () => scrollToDevice(d.id);
    list.appendChild(item);
  });
}

function scrollToDevice(id) {
  const card = document.querySelector('[data-device-id="' + id + '"]');
  if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
