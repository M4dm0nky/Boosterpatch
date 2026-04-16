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
      // Register as new plan entry if not already tracked
      const idx = getPlanIndex();
      let id = state.planId;
      const existing = id && idx.find(p => p.id === id);
      if (!existing) {
        id = generateUUID();
        idx.unshift({ id, name: data.projectName || file.name, modified: data.modified || new Date().toISOString() });
        setPlanIndex(idx);
      }
      state.planId = id;
      loadProjectData(data);
      savePlanToLS();
      renderSidebarPlanList();
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
  // planId is managed separately — don't overwrite it from file data
  state.projectName = data.projectName || 'Unbenannt';
  state.created = data.created || new Date().toISOString();
  state.projectCreated = true;
  state.devices = data.devices || [];
  state.fixtureDatabase = data.fixtureDatabase || [];
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
  updateFixtureDbStatus();
  renderFixtureTab();
  renderEthPanel();
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
  if (state.devices.length === 0) {
    showToast('Keine Geräte vorhanden.', 'warning');
    return;
  }

  const maxOuts  = state.devices.reduce((m, d) => Math.max(m, d.connections.outputs.length), 0);
  const cols     = Math.min(maxOuts, 12);
  const hasIn2   = state.devices.some(d => d.inputs > 1);
  const dateStr  = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const projName = escHtml(state.projectName || 'Unbenannt');

  // ── Logos ────────────────────────────────────────────────────
  const lbPlaner  = logos.planer  ? `<img src="${logos.planer}"  style="height:52px;max-width:150px;object-fit:contain;object-position:left center;">` : '';
  const lbBand    = logos.band    ? `<img src="${logos.band}"    style="height:48px;max-width:130px;object-fit:contain;margin-right:10px;">` : '';
  const lbBooking = logos.booking ? `<img src="${logos.booking}" style="height:52px;max-width:150px;object-fit:contain;object-position:right center;">` : '';

  // ── Table header ────────────────────────────────────────────
  let thead = `<tr>
    <th class="th-name">BOOSTER</th>
    <th class="th-in">IN 1</th>
    ${hasIn2 ? '<th class="th-in">IN 2</th>' : ''}
    ${Array.from({length: cols}, (_, i) => `<th class="th-out">${i + 1}</th>`).join('')}
  </tr>`;

  // ── Table rows ───────────────────────────────────────────────
  let rows = '';
  state.devices.forEach((dev, idx) => {
    const in1 = dev.connections.inputs[0];
    const in2 = dev.connections.inputs[1];
    const u1  = in1 && in1.universe ? 'U' + String(in1.universe).padStart(3, '0') : '—';
    const u2  = in2 && in2.universe ? 'U' + String(in2.universe).padStart(3, '0') : '—';
    const stripe = idx % 2 === 0 ? '' : ' odd';

    rows += `<tr class="brow${stripe}">
      <td class="td-name">${escHtml(dev.name)}</td>
      <td class="td-in${in1 && in1.universe ? ' val' : ''}">${u1}</td>
      ${hasIn2 ? `<td class="td-in${in2 && in2.universe ? ' val' : ''}">${u2}</td>` : ''}`;

    for (let p = 0; p < cols; p++) {
      const out = dev.connections.outputs[p];
      const lbl = out && out.label ? escHtml(out.label) : '';
      if (!out) {
        rows += `<td class="td-out na">&nbsp;</td>`;
      } else if (lbl) {
        rows += `<td class="td-out act">${lbl}</td>`;
      } else {
        rows += `<td class="td-out">—</td>`;
      }
    }
    rows += '</tr>';
  });

  // ── colgroup ─────────────────────────────────────────────────
  const outCols = Array.from({length: cols}, () => `<col class="col-out">`).join('');
  const inCols  = hasIn2 ? '<col class="col-in"><col class="col-in">' : '<col class="col-in">';

  const html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<title>BOOSTERPATCH — ${projName}</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'Courier New', Courier, monospace;
  font-size: 9pt;
  color: #111;
  background: #fff;
}

/* ── Header — 3-Spalten wie Personalplan ── */
.ph {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 10px;
  border-bottom: 3px solid #1a1f2e;
  padding-bottom: 10px;
  margin-bottom: 14px;
}
.ph-left  { display: flex; align-items: center; justify-content: flex-start; }
.ph-center {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-align: center;
}
.ph-right { display: flex; align-items: center; justify-content: flex-end; gap: 10px; }

.ph-title {
  font-size: 24pt;
  font-weight: 900;
  letter-spacing: 5px;
  color: #1a1f2e;
  text-transform: uppercase;
  line-height: 1;
}
.ph-sub {
  font-size: 7pt;
  color: #666;
  letter-spacing: .12em;
  text-transform: uppercase;
  margin-top: 4px;
}
.ph-meta {
  text-align: right;
  font-size: 7.5pt;
  color: #555;
  line-height: 1.7;
}

/* ── Table ── */
table { width: 100%; border-collapse: collapse; table-layout: fixed; }
col.col-name { width: 15%; }
col.col-in   { width: 6.5%; }

thead tr { background: #1a1f2e; }
th {
  color: #fff;
  padding: 6px 6px;
  font-size: 8pt;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .07em;
  text-align: center;
  border: 1px solid #2a2f3e;
  white-space: nowrap;
  overflow: hidden;
}
.th-name { text-align: left; padding-left: 9px; }
.th-in   { background: #252a3e; }

.brow.odd { background: #f5f7fc; }

td {
  border: 1px solid #ccd;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.td-name {
  padding: 5px 9px;
  font-weight: 700;
  font-size: 8.5pt;
  color: #1a1f2e;
  border-right: 2px solid #1a1f2e;
  background: #f0f4ff;
}
.td-in {
  padding: 4px 5px;
  text-align: center;
  color: #aaa;
  font-size: 8pt;
  background: #fafafa;
}
.td-in.val {
  color: #1a5a8a;
  font-weight: 700;
  background: #eaf2ff;
}
.td-out {
  padding: 4px 5px;
  text-align: center;
  font-size: 7.5pt;
  color: #bbb;
}
.td-out.act {
  color: #1a4a1a;
  font-weight: 700;
  background: #eaf4ea;
  border-color: #c4dcc4;
}
.td-out.na {
  background: #f7f7f7;
  color: transparent;
}

/* ── Legend ── */
.legend {
  display: flex;
  gap: 18px;
  margin-top: 11px;
  padding-top: 8px;
  border-top: 1px solid #dde;
  font-size: 7pt;
  color: #777;
  flex-wrap: wrap;
}
.leg-item { display: flex; align-items: center; gap: 5px; }
.leg-dot  { width: 11px; height: 11px; border-radius: 2px; flex-shrink: 0; }

/* ── Footer ── */
.footer {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 6.5pt;
  color: #bbb;
  border-top: 1px solid #eee;
  padding-top: 6px;
}

@media print {
  @page { size: A4 landscape; margin: 10mm; }
}
</style>
</head>
<body>
<div class="ph">
  <div class="ph-left">${lbPlaner}</div>
  <div class="ph-center">
    ${lbBand}
    <div>
      <div class="ph-title">Boosterpatch</div>
      <div class="ph-sub">DMX Patch &nbsp;·&nbsp; ${projName}</div>
    </div>
  </div>
  <div class="ph-right">
    <div class="ph-meta">Gedruckt: ${dateStr}<br>${APP_VERSION}</div>
    ${lbBooking}
  </div>
</div>

<table>
  <colgroup>
    <col class="col-name">
    ${inCols}
    ${outCols}
  </colgroup>
  <thead>${thead}</thead>
  <tbody>${rows}</tbody>
</table>

<div class="legend">
  <span class="leg-item"><span class="leg-dot" style="background:#eaf4ea;border:1px solid #c4dcc4;"></span>Output belegt</span>
  <span class="leg-item"><span class="leg-dot" style="background:#eaf2ff;border:1px solid #b8d4f0;"></span>Input mit Universum</span>
  <span class="leg-item"><span class="leg-dot" style="background:#f0f4ff;border:1px solid #c8d4f0;"></span>Boostername</span>
  <span class="leg-item" style="color:#bbb;">— &nbsp;Output leer</span>
</div>

<div class="footer">
  <span>BOOSTERPATCH ${APP_VERSION} &nbsp;·&nbsp; ${projName}</span>
  <span>${dateStr}</span>
</div>

<script>window.onload = () => setTimeout(() => window.print(), 350);<\/script>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) { showToast('Popup blockiert — bitte Popups erlauben.', 'warning', 4000); return; }
  win.document.write(html);
  win.document.close();
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
    logos: { planer: logos.planer, band: logos.band, booking: logos.booking },
    fixtureDatabase: state.fixtureDatabase
  };
}

// --- Multi-plan localStorage ---
const BP_INDEX_KEY = 'bp-plans-index';
const BP_PLAN_PRE  = 'bp-plan-';
const LS_KEY       = 'boosterpatch-state'; // legacy key for migration

function getPlanIndex() {
  try {
    const raw = localStorage.getItem(BP_INDEX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch(e) { return []; }
}

function setPlanIndex(index) {
  try { localStorage.setItem(BP_INDEX_KEY, JSON.stringify(index)); } catch(e) {}
}

function savePlanToLS() {
  if (!state.planId) return;
  const data = buildSaveData();
  try {
    localStorage.setItem(BP_PLAN_PRE + state.planId, JSON.stringify(data));
    const idx = getPlanIndex();
    const entry = idx.find(p => p.id === state.planId);
    if (entry) {
      entry.name = state.projectName;
      entry.modified = data.modified;
      setPlanIndex(idx);
    }
  } catch(e) {}
}

function createNewPlan() {
  if (state.modified && state.devices.length > 0) {
    if (!confirm('Ungespeicherte Änderungen gehen verloren. Neuen Plan erstellen?')) return;
  }
  if (state.planId) savePlanToLS();

  const id = generateUUID();
  const idx = getPlanIndex();
  idx.unshift({ id, name: 'Neuer Plan', modified: new Date().toISOString() });
  setPlanIndex(idx);

  state.planId = id;
  state.projectName = 'Neuer Plan';
  state.projectCreated = false;
  state.created = new Date().toISOString();
  state.modified = false;
  state.devices = [];
  state.fixtureDatabase = [];

  renderSidebarPlanList();
  renderAllDevices();
  renderPatchTable();
  updateEmptyState();
  updateProjectDisplay();
  markSaved();

  // Open project modal to name it
  const today = new Date().toISOString().slice(0, 10);
  document.getElementById('newProjectDateInput').value = today;
  document.getElementById('newProjectNameInput').value = '';
  document.getElementById('npNameField').classList.remove('has-error');
  openModal('newProjectModal');
  setTimeout(() => document.getElementById('newProjectNameInput').focus(), 100);
}

function loadPlanById(id) {
  if (id === state.planId) return;
  if (state.planId) savePlanToLS();
  try {
    const raw = localStorage.getItem(BP_PLAN_PRE + id);
    if (!raw) { showToast('Plan nicht gefunden.', 'error'); return; }
    const data = JSON.parse(raw);
    state.planId = id;
    loadProjectData(data);
    renderSidebarPlanList();
    showToast('Plan geladen: ' + state.projectName, 'success', 1500);
  } catch(e) {
    showToast('Fehler beim Laden.', 'error');
  }
}

function deletePlan(id) {
  const idx = getPlanIndex();
  const plan = idx.find(p => p.id === id);
  if (!plan) return;
  if (!confirm('Plan "' + plan.name + '" löschen?')) return;
  setPlanIndex(idx.filter(p => p.id !== id));
  try { localStorage.removeItem(BP_PLAN_PRE + id); } catch(e) {}

  if (state.planId === id) {
    const remaining = getPlanIndex();
    if (remaining.length > 0) {
      state.planId = null;
      loadPlanById(remaining[0].id);
    } else {
      state.planId = null;
      state.projectName = 'Kein Projekt';
      state.projectCreated = false;
      state.devices = [];
      state.modified = false;
      renderAllDevices();
      renderPatchTable();
      updateEmptyState();
      updateProjectDisplay();
    }
  }
  renderSidebarPlanList();
}

function startPlanRename(id) {
  const item = document.querySelector('.sb-plan-item[data-plan-id="' + id + '"]');
  if (!item) return;
  const nameEl = item.querySelector('.sb-plan-name');
  if (!nameEl) return;
  const idx = getPlanIndex();
  const plan = idx.find(p => p.id === id);
  if (!plan) return;

  const input = document.createElement('input');
  input.className = 'sb-plan-rename-input';
  input.value = plan.name;
  nameEl.replaceWith(input);
  input.focus();
  input.select();

  function finish() {
    const newName = input.value.trim() || plan.name;
    plan.name = newName;
    setPlanIndex(idx);
    if (state.planId === id) {
      state.projectName = newName;
      updateProjectDisplay();
    }
    renderSidebarPlanList();
  }
  input.addEventListener('blur', finish);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
    if (e.key === 'Escape') { input.value = plan.name; input.blur(); }
  });
}

function renderSidebarPlanList() {
  const list = document.getElementById('sidebarPlanList');
  if (!list) return;
  list.innerHTML = '';
  const idx = getPlanIndex();
  idx.forEach(plan => {
    const item = document.createElement('div');
    item.className = 'sb-plan-item' + (plan.id === state.planId ? ' active' : '');
    item.dataset.planId = plan.id;

    const nameEl = document.createElement('span');
    nameEl.className = 'sb-plan-name';
    nameEl.textContent = plan.name;

    const renameBtn = document.createElement('button');
    renameBtn.className = 'sb-plan-btn';
    renameBtn.title = 'Umbenennen';
    renameBtn.textContent = '✎';
    renameBtn.addEventListener('click', e => { e.stopPropagation(); startPlanRename(plan.id); });

    const delBtn = document.createElement('button');
    delBtn.className = 'sb-plan-btn danger';
    delBtn.title = 'Löschen';
    delBtn.textContent = '✕';
    delBtn.addEventListener('click', e => { e.stopPropagation(); deletePlan(plan.id); });

    item.appendChild(nameEl);
    item.appendChild(renameBtn);
    item.appendChild(delBtn);
    item.addEventListener('click', () => loadPlanById(plan.id));
    list.appendChild(item);
  });
}

// --- localStorage auto-save ---
let lsAutoSaveTimer = null;

function scheduleAutoSave() {
  clearTimeout(lsAutoSaveTimer);
  lsAutoSaveTimer = setTimeout(autoSaveToLS, 2 * 60 * 1000);
}

function autoSaveToLS() {
  savePlanToLS();
  showSaveIndicator('auto');
  scheduleAutoSave();
}

function tryLoadMostRecentPlan() {
  // Migration: if old single LS_KEY exists but no index yet, import it
  const idx = getPlanIndex();
  if (idx.length === 0) {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data && Array.isArray(data.devices)) {
          const id = generateUUID();
          const entry = { id, name: data.projectName || 'Importierter Plan', modified: data.modified || new Date().toISOString() };
          setPlanIndex([entry]);
          localStorage.setItem(BP_PLAN_PRE + id, raw);
          localStorage.removeItem(LS_KEY);
          state.planId = id;
          loadProjectData(data);
          renderSidebarPlanList();
          return true;
        }
      }
    } catch(e) {}
    return false;
  }

  // Load most recently modified plan (index is sorted by modified desc on save, but sort again to be safe)
  const sorted = [...idx].sort((a, b) => new Date(b.modified) - new Date(a.modified));
  const latest = sorted[0];
  try {
    const raw = localStorage.getItem(BP_PLAN_PRE + latest.id);
    if (!raw) return false;
    const data = JSON.parse(raw);
    state.planId = latest.id;
    loadProjectData(data);
    renderSidebarPlanList();
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
let _autoSaveInterval = setInterval(async () => {
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

