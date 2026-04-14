// ============================================================
// 5. NEW DEVICE MODAL (single)
// ============================================================
function openNewDeviceModal() {
  document.getElementById('newDeviceName').value = '';
  document.getElementById('input1').checked = true;
  document.getElementById('outputCount').value = '8';
  // Reset skin picker to Standard
  selectSkin('standard');
  updatePreview();
  openModal('newDeviceModal');
  setTimeout(() => document.getElementById('newDeviceName').focus(), 100);
}

function selectSkin(skinId) {
  // Update tile selection
  document.querySelectorAll('.skin-tile').forEach(t => {
    t.classList.toggle('selected', t.dataset.skin === skinId);
  });

  const modelSelect = document.getElementById('swissonModelSelect');
  const inputRadios  = document.querySelectorAll('input[name="inputCount"]');
  const outputSelect = document.getElementById('outputCount');

  if (skinId === 'swisson') {
    modelSelect.style.display = 'block';
    applySwissonModel(modelSelect.value);
  } else {
    modelSelect.style.display = 'none';
    // Restore editable
    inputRadios.forEach(r => r.disabled = false);
    outputSelect.disabled = false;
    document.getElementById('input1').checked = true;
    outputSelect.value = '8';
    updatePreview();
  }
}

function applySwissonModel(modelId) {
  const swissonEntry = SKIN_CATALOG.find(s => s.id === 'swisson');
  const model = swissonEntry && swissonEntry.models.find(m => m.id === modelId);
  if (!model) return;

  // Lock inputs/outputs to model specs
  const inputRadios  = document.querySelectorAll('input[name="inputCount"]');
  const outputSelect = document.getElementById('outputCount');

  inputRadios.forEach(r => {
    r.checked  = (parseInt(r.value) === model.inputs);
    r.disabled = true;
  });
  outputSelect.value    = String(model.outputs);
  outputSelect.disabled = true;

  // Auto-fill name if still empty or previously set by a model
  const nameEl = document.getElementById('newDeviceName');
  const isDefaultOrModel = !nameEl.value || SKIN_CATALOG.find(s => s.id === 'swisson')?.models.some(m => nameEl.value === m.id);
  if (isDefaultOrModel) nameEl.value = modelId;

  updatePreview();
}

function updatePreview() {
  const inputs = parseInt(document.querySelector('input[name="inputCount"]:checked').value);
  const outputs = parseInt(document.getElementById('outputCount').value);
  const preview = document.getElementById('devicePreview');

  let html = '<div class="preview-rack">';
  html += '<div>';
  html += '<div class="preview-label" style="margin-bottom:4px">INPUT</div>';
  html += '<div class="preview-conn-row">';
  for (let i = 0; i < inputs; i++) {
    html += '<div class="preview-xlr input-type" title="IN ' + (i+1) + '"></div>';
  }
  html += '</div></div>';
  html += '<div class="preview-arrow">→</div>';
  html += '<div>';
  html += '<div class="preview-label" style="margin-bottom:4px">OUTPUT (' + outputs + ')</div>';
  html += '<div class="preview-conn-row">';
  for (let i = 0; i < outputs; i++) {
    html += '<div class="preview-xlr" title="OUT ' + (i+1) + '"></div>';
  }
  html += '</div></div>';
  html += '</div>';
  preview.innerHTML = html;
}

function confirmNewDevice() {
  const name = document.getElementById('newDeviceName').value.trim();
  if (!name) {
    showToast('Bitte einen Gerätenamen eingeben.', 'warning');
    document.getElementById('newDeviceName').focus();
    return;
  }
  const inputs  = parseInt(document.querySelector('input[name="inputCount"]:checked').value);
  const outputs = parseInt(document.getElementById('outputCount').value);

  // Read skin selection
  const selectedTile = document.querySelector('.skin-tile.selected');
  const skinId = selectedTile ? selectedTile.dataset.skin : 'standard';
  let options = { skin: skinId };

  if (skinId === 'swisson') {
    const modelId = document.getElementById('swissonModelSelect').value;
    const swissonEntry = SKIN_CATALOG.find(s => s.id === 'swisson');
    const model = swissonEntry && swissonEntry.models.find(m => m.id === modelId);
    options.skinModel     = modelId;
    options.connectorType = model ? model.connector : null;
  }

  createDevice(name, inputs, outputs, options);
  closeModal('newDeviceModal');
  showToast('Gerät "' + name + '" angelegt.', 'success');
}

document.getElementById('newDeviceName').addEventListener('keydown', e => {
  if (e.key === 'Enter') confirmNewDevice();
});

// ============================================================
// 6. DEVICE CRUD
// ============================================================
function createDevice(name, inputCount, outputCount, options = {}) {
  const device = {
    id: generateUUID(),
    name,
    inputs: inputCount,
    outputs: outputCount,
    skin:          options.skin          || 'standard',
    skinModel:     options.skinModel     || null,
    connectorType: options.connectorType || null,
    connections: {
      inputs:  Array.from({length: inputCount},  (_, i) => ({
        id: i+1, universe: null, label: '', notes: '', active: false
      })),
      outputs: Array.from({length: outputCount}, (_, i) => ({
        id: i+1, universe: 1, startChannel: 1, label: '', notes: '', active: false, ethId: null, routeToInput: 1
      }))
    }
  };
  state.devices.push(device);
  markModified();
  renderAllDevices();
  renderPatchTable();
  updateEmptyState();
  return device;
}

function deleteDevice(id) {
  if (!confirm('Gerät wirklich löschen?')) return;
  state.devices = state.devices.filter(d => d.id !== id);
  markModified();
  renderAllDevices();
  renderPatchTable();
  updateEmptyState();
  showToast('Gerät gelöscht.', 'warning');
}

function getDevice(id) {
  return state.devices.find(d => d.id === id);
}

function updateEmptyState() {
  const empty = document.getElementById('emptyState');
  const tabs  = document.getElementById('appTabs');
  const showApp = state.projectCreated || state.devices.length > 0;
  empty.style.display = showApp ? 'none' : 'flex';
  if (showApp) {
    tabs.classList.add('visible');
  } else {
    tabs.classList.remove('visible');
  }
}

// ============================================================
// 14. PROJECT MANAGEMENT
// ============================================================
function newProject() {
  if (state.modified && state.devices.length > 0) {
    if (!confirm('Ungespeicherte Änderungen gehen verloren. Neues Projekt erstellen?')) return;
  }
  const today = new Date().toISOString().slice(0, 10);
  document.getElementById('newProjectDateInput').value = today;
  document.getElementById('newProjectNameInput').value = '';
  document.getElementById('npNameField').classList.remove('has-error');
  openModal('newProjectModal');
  setTimeout(() => document.getElementById('newProjectNameInput').focus(), 100);
}

function confirmNewProject() {
  const name = document.getElementById('newProjectNameInput').value.trim();
  if (!name) {
    document.getElementById('npNameField').classList.add('has-error');
    document.getElementById('newProjectNameInput').focus();
    return;
  }
  document.getElementById('npNameField').classList.remove('has-error');

  const dateVal = document.getElementById('newProjectDateInput').value;
  state.projectName = name;
  state.created = dateVal ? new Date(dateVal).toISOString() : new Date().toISOString();
  state.projectCreated = true;
  state.devices = [];

  // Update plan index entry name
  if (state.planId) {
    const idx = getPlanIndex();
    const entry = idx.find(p => p.id === state.planId);
    if (entry) { entry.name = name; setPlanIndex(idx); }
    savePlanToLS();
  }

  markSaved();
  updateProjectDisplay();
  renderAllDevices();
  renderPatchTable();
  updateEmptyState();
  renderSidebarPlanList();
  closeModal('newProjectModal');

  setTimeout(() => openBoosterSetupModal(), 150);
}

document.getElementById('newProjectNameInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') confirmNewProject();
});

function clearAll() {
  if (state.devices.length === 0) return;
  if (!confirm('Alle Geräte löschen?')) return;
  state.devices = [];
  markModified();
  renderAllDevices();
  renderPatchTable();
  showToast('Alle Geräte gelöscht.', 'warning');
}

function openProjectNameModal() {
  document.getElementById('projectNameInput').value = state.projectName;
  openModal('projectModal');
  setTimeout(() => {
    const inp = document.getElementById('projectNameInput');
    inp.focus(); inp.select();
  }, 100);
}

function confirmProjectName() {
  const name = document.getElementById('projectNameInput').value.trim();
  if (name) {
    state.projectName = name;
    markModified();
    updateProjectDisplay();
  }
  closeModal('projectModal');
}

document.getElementById('projectNameInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') confirmProjectName();
});

// ============================================================
// 15. BOOSTER SETUP MODAL (2-Step Wizard)
// ============================================================
function openBoosterSetupModal() {
  document.getElementById('bsStep1').style.display = 'flex';
  document.getElementById('bsStep2').style.display = 'none';
  document.getElementById('bsCount').value = '1';
  document.getElementById('bsBackBtn').style.display = 'none';
  document.getElementById('bsActionBtn').textContent = 'Weiter →';
  document.getElementById('bsActionBtn').onclick = bsNext;
  document.getElementById('bsModalTitle').textContent = 'BOOSTER ANLEGEN';
  openModal('boosterSetupModal');
  setTimeout(() => document.getElementById('bsCount').focus(), 100);
}

function bsNext() {
  const count = parseInt(document.getElementById('bsCount').value) || 1;
  if (count < 1 || count > 16) {
    showToast('Bitte 1–16 Booster eingeben.', 'warning');
    return;
  }
  const wrap = document.getElementById('bsTableWrap');
  wrap.innerHTML = '';

  const table = document.createElement('table');
  table.className = 'bs-setup-table';
  table.innerHTML = `<thead><tr>
    <th>#</th>
    <th>Gerät</th>
    <th>Name</th>
    <th>Inputs</th>
    <th>Outputs</th>
  </tr></thead>`;

  // Build Swisson model options string once
  const swissonEntry = SKIN_CATALOG.find(s => s.id === 'swisson');
  const swissonOptions = swissonEntry.models.map(m =>
    `<option value="${m.id}">${m.id} (${m.inputs}×${m.outputs}, ${m.connector})</option>`
  ).join('');

  const tbody = document.createElement('tbody');
  for (let i = 1; i <= count; i++) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="bs-num-cell">${i}</td>
      <td>
        <select id="bsSkin_${i}" class="bs-skin-select" onchange="bsSkinChanged(${i})">
          <option value="standard">— Standard —</option>
          ${swissonOptions}
        </select>
      </td>
      <td><input type="text" id="bsName_${i}" value="DMX Booster ${i}" maxlength="40"></td>
      <td>
        <div class="bs-radio-small">
          <label><input type="radio" name="bsIn_${i}" value="1" checked id="bsIn1_${i}">
            <div class="bs-radio-btn">1</div></label>
          <label><input type="radio" name="bsIn_${i}" value="2" id="bsIn2_${i}">
            <div class="bs-radio-btn">2</div></label>
        </div>
      </td>
      <td>
        <select id="bsOut_${i}">
          ${[4,5,6,7,8,9,10,11,12].map(n =>
            `<option value="${n}"${n===8?' selected':''}>${n} Ausgänge</option>`
          ).join('')}
        </select>
      </td>
    `;
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  wrap.appendChild(table);

  document.getElementById('bsStep1').style.display = 'none';
  document.getElementById('bsStep2').style.display = 'block';
  document.getElementById('bsBackBtn').style.display = 'inline-flex';
  document.getElementById('bsActionBtn').textContent = 'Erstellen ✓';
  document.getElementById('bsActionBtn').onclick = bsConfirm;
  document.getElementById('bsModalTitle').textContent = 'BOOSTER KONFIGURIEREN';
}

function bsBack() {
  document.getElementById('bsStep1').style.display = 'flex';
  document.getElementById('bsStep2').style.display = 'none';
  document.getElementById('bsBackBtn').style.display = 'none';
  document.getElementById('bsActionBtn').textContent = 'Weiter →';
  document.getElementById('bsActionBtn').onclick = bsNext;
  document.getElementById('bsModalTitle').textContent = 'BOOSTER ANLEGEN';
}

function bsSkinChanged(i) {
  const skinSel  = document.getElementById('bsSkin_' + i);
  const nameEl   = document.getElementById('bsName_' + i);
  const outSel   = document.getElementById('bsOut_' + i);
  const in1Radio = document.getElementById('bsIn1_' + i);
  const in2Radio = document.getElementById('bsIn2_' + i);
  const val      = skinSel.value;

  if (val === 'standard') {
    // Restore free editing
    in1Radio.disabled = false;
    in2Radio.disabled = false;
    outSel.disabled   = false;
    // Reset name only if it was a Swisson model name
    const swissonEntry = SKIN_CATALOG.find(s => s.id === 'swisson');
    if (swissonEntry.models.some(m => nameEl.value === m.id)) {
      nameEl.value = 'DMX Booster ' + i;
    }
  } else {
    // Swisson model selected — lock to model specs
    const swissonEntry = SKIN_CATALOG.find(s => s.id === 'swisson');
    const model = swissonEntry.models.find(m => m.id === val);
    if (!model) return;

    in1Radio.checked  = (model.inputs === 1);
    in2Radio.checked  = (model.inputs === 2);
    in1Radio.disabled = true;
    in2Radio.disabled = true;
    outSel.value      = String(model.outputs);
    outSel.disabled   = true;

    // Auto-fill name if still default or previous model name
    const isDefault = nameEl.value === ('DMX Booster ' + i)
      || swissonEntry.models.some(m => nameEl.value === m.id);
    if (isDefault) nameEl.value = model.id;
  }
}

function bsConfirm() {
  const count = parseInt(document.getElementById('bsCount').value) || 1;
  let created = 0;

  for (let i = 1; i <= count; i++) {
    const nameEl = document.getElementById('bsName_' + i);
    const outEl  = document.getElementById('bsOut_' + i);
    const inEl   = document.querySelector('input[name="bsIn_' + i + '"]:checked');
    if (!nameEl || !outEl || !inEl) continue;

    const name    = nameEl.value.trim() || ('DMX Booster ' + i);
    const inputs  = parseInt(inEl.value) || 1;
    const outputs = parseInt(outEl.value) || 8;

    // Read skin selection
    const skinSel  = document.getElementById('bsSkin_' + i);
    const skinVal  = skinSel ? skinSel.value : 'standard';
    const isSwisson = skinVal !== 'standard';

    let skin = 'standard', skinModel = null, connectorType = null;
    if (isSwisson) {
      const swissonEntry = SKIN_CATALOG.find(s => s.id === 'swisson');
      const model = swissonEntry && swissonEntry.models.find(m => m.id === skinVal);
      skin          = 'swisson';
      skinModel     = skinVal;
      connectorType = model ? model.connector : null;
    }

    const device = {
      id: generateUUID(),
      name,
      inputs,
      outputs,
      skin,
      skinModel,
      connectorType,
      connections: {
        inputs:  Array.from({length: inputs},  (_, j) => ({
          id: j+1, universe: null, label: '', notes: '', active: false
        })),
        outputs: Array.from({length: outputs}, (_, j) => ({
          id: j+1, universe: 1, startChannel: 1, label: '', notes: '', active: false, ethId: null, routeToInput: 1
        }))
      }
    };
    state.devices.push(device);
    created++;
  }

  if (created > 0) {
    markModified();
    renderAllDevices();
    renderPatchTable();
    updateEmptyState();
    switchTab('patch');
  }

  closeModal('boosterSetupModal');
  showToast(created + ' Booster angelegt.', 'success');
}
