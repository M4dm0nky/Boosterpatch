// ============================================================
// 7. RENDERING — DEVICE CARDS
// ============================================================
const CONN_W    = 71;  // actual xlr-connector width (seg-display: 4×13 + 3×3 + 2×5)
const CONN_GAP  = 10;  // gap between connectors in connectors-row
const RACK_BASE = 113; // 2 ears (56) + face-padding (24) + input-section separators (33)

function updateRackScale() {
  const container = document.getElementById('devicesContainer');
  const naturalW = parseInt(container.style.getPropertyValue('--device-natural-w')) || 0;
  if (!naturalW) return;
  const availW = container.clientWidth - 32;
  if (availW <= 0) return;
  const scale = availW / naturalW;
  container.style.setProperty('--rack-scale', scale);
}

function renderAllDevices() {
  const container = document.getElementById('devicesContainer');
  container.innerHTML = '';

  if (state.devices.length === 0) {
    const hint = document.createElement('div');
    hint.style.cssText = 'padding:40px 20px;color:var(--text-secondary);font-family:var(--font-mono);font-size:11px;letter-spacing:1px;opacity:0.7;';
    hint.textContent = '← Klick auf ⊕ NEU um Booster anzulegen';
    container.appendChild(hint);
    return;
  }

  const maxOutputs = 12;
  const maxInputs  = 2;
  const inputsW  = maxInputs  * CONN_W + Math.max(maxInputs  - 1, 0) * CONN_GAP;
  const outputsW = maxOutputs * CONN_W + Math.max(maxOutputs - 1, 0) * CONN_GAP;
  const minW = RACK_BASE + inputsW + outputsW + 14;
  container.style.setProperty('--device-min-w', minW + 'px');
  container.style.setProperty('--device-natural-w', minW + 'px');
  updateRackScale();

  state.devices.forEach(d => container.appendChild(buildDeviceCard(d)));
}

function buildDeviceCard(device) {
  const card = document.createElement('div');
  card.className = 'device-card';
  card.dataset.deviceId = device.id;

  const rackUnit = document.createElement('div');
  rackUnit.className = 'rack-unit';

  rackUnit.appendChild(buildEar());

  const face = document.createElement('div');
  face.className = 'rack-face';

  // Top bar
  const topbar = document.createElement('div');
  topbar.className = 'rack-topbar';

  const nameEl = document.createElement('div');
  nameEl.className = 'device-name-label';
  nameEl.textContent = device.name;
  nameEl.title = 'Doppelklick zum Umbenennen';
  nameEl.ondblclick = () => startRenameDevice(device.id, nameEl);

  const brand = document.createElement('div');
  brand.className = 'brand-label';
  brand.textContent = 'DMX BOOSTER · ' + device.inputs + 'IN/' + device.outputs + 'OUT';

  const controls = document.createElement('div');
  controls.className = 'rack-controls';

  const dupeBtn = document.createElement('button');
  dupeBtn.className = 'rack-ctrl-btn';
  dupeBtn.textContent = 'Duplizieren';
  dupeBtn.onclick = () => duplicateDevice(device.id);

  const delBtn = document.createElement('button');
  delBtn.className = 'rack-ctrl-btn delete';
  delBtn.textContent = '✕ Löschen';
  delBtn.onclick = () => deleteDevice(device.id);

  controls.appendChild(dupeBtn);
  controls.appendChild(delBtn);
  topbar.appendChild(nameEl);
  topbar.appendChild(brand);
  topbar.appendChild(controls);
  face.appendChild(topbar);

  // Connectors area
  const connArea = document.createElement('div');
  connArea.className = 'rack-connectors';

  // Inputs section
  const inputSec = document.createElement('div');
  inputSec.className = 'connector-section inputs';
  const inputLabel = document.createElement('div');
  inputLabel.className = 'section-label';
  inputLabel.textContent = 'INPUT';
  inputSec.appendChild(inputLabel);
  const inputRow = document.createElement('div');
  inputRow.className = 'connectors-row';
  device.connections.inputs.forEach(conn => {
    inputRow.appendChild(buildXLRConnector(device.id, 'input', conn));
  });
  inputSec.appendChild(inputRow);
  connArea.appendChild(inputSec);

  // Outputs section
  const outputSec = document.createElement('div');
  outputSec.className = 'connector-section outputs';
  const outputLabel = document.createElement('div');
  outputLabel.className = 'section-label';
  outputLabel.textContent = 'OUTPUT';
  outputSec.appendChild(outputLabel);
  const outputRow = document.createElement('div');
  outputRow.className = 'connectors-row';
  device.connections.outputs.forEach(conn => {
    outputRow.appendChild(buildXLRConnector(device.id, 'output', conn));
  });
  outputSec.appendChild(outputRow);
  connArea.appendChild(outputSec);

  face.appendChild(connArea);
  rackUnit.appendChild(face);
  rackUnit.appendChild(buildEar(true));
  card.appendChild(rackUnit);

  return card;
}

function buildEar(right = false) {
  const ear = document.createElement('div');
  ear.className = 'rack-ear' + (right ? ' right' : '');
  ear.appendChild(buildScrew());
  ear.appendChild(buildScrew());
  return ear;
}

function buildScrew() {
  const s = document.createElement('div');
  s.className = 'rack-screw';
  return s;
}

function buildXLRConnector(deviceId, type, conn) {
  const wrap = document.createElement('div');
  wrap.className = 'xlr-connector ' + type;
  wrap.id = 'xlr_' + deviceId + '_' + type + '_' + conn.id;
  wrap.title = (type === 'input' ? 'IN ' : 'OUT ') + conn.id + (conn.label ? ' — ' + conn.label : '');
  // Drag & Drop for output connectors
  if (type === 'output') {
    wrap.addEventListener('dragover', e => {
      e.preventDefault();
      wrap.classList.add('drag-over');
    });
    wrap.addEventListener('dragleave', () => wrap.classList.remove('drag-over'));
    wrap.addEventListener('drop', e => {
      e.preventDefault();
      wrap.classList.remove('drag-over');
      const ethId = e.dataTransfer.getData('ethId');
      if (ethId) connectEthToOutput(deviceId, conn.id, ethId);
    });
    wrap.addEventListener('contextmenu', e => {
      e.preventDefault();
      const device = getDevice(deviceId);
      if (!device) return;
      const c = device.connections.outputs.find(x => x.id === conn.id);
      if (c && c.ethId) {
        c.ethId = null;
        c.active = false;
        markModified();
        updateConnDisplay(deviceId, 'output', c);
        syncConnLed(deviceId, 'output', c.id);
        renderPatchTable();
        renderEthPanel();
        showToast('Verbindung getrennt.', 'info', 1500);
      }
    });
  }

  // 7-Segment Display above connector — Klick öffnet Universe-Popover
  const dispText = getConnDisplayText(conn, type);
  const dispEl = buildSegDisplay(dispText);
  dispEl.id = 'disp_' + deviceId + '_' + type + '_' + conn.id;
  dispEl.style.cursor = 'pointer';
  dispEl.title = 'Universum bearbeiten';
  dispEl.addEventListener('click', e => {
    e.stopPropagation();
    openUnivPopover(deviceId, type, conn.id, dispEl);
  });
  wrap.appendChild(dispEl);

  // Body
  const body = document.createElement('div');
  body.className = 'xlr-body';

  const led = document.createElement('div');
  if (conn.active) {
    led.className = 'xlr-led active';
    led.style.animationDelay = `-${(performance.now() % 2800) / 1000}s`;
  } else {
    led.className = 'xlr-led';
  }
  body.appendChild(led);

  const inner = document.createElement('div');
  inner.className = 'xlr-inner';
  const pins = document.createElement('div');
  pins.className = 'xlr-pins';
  for (let i = 0; i < 5; i++) {
    const pin = document.createElement('div');
    pin.className = 'xlr-pin';
    pins.appendChild(pin);
  }
  inner.appendChild(pins);
  body.appendChild(inner);
  wrap.appendChild(body);

  const num = document.createElement('div');
  num.className = 'xlr-num';
  num.textContent = (type === 'input' ? 'IN' : 'OUT') + ' ' + conn.id;
  wrap.appendChild(num);

  const lbl = document.createElement('div');
  lbl.className = 'xlr-label';
  lbl.textContent = conn.label || '—';
  lbl.style.color = conn.label ? 'var(--text-mono)' : 'var(--text-secondary)';
  wrap.appendChild(lbl);

  // --- Input status lamp (orange = IN1, blue = IN2) — pulsiert nicht ---
  if (type === 'input') {
    const lamp = document.createElement('div');
    lamp.className = 'retro-lamp input-status-lamp ' + (conn.id === 1 ? 'lamp-in1' : 'lamp-in2');
    lamp.id = 'input_lamp_' + deviceId + '_' + conn.id;
    if (conn.active) applyLampOn(lamp);
    wrap.appendChild(lamp);
  }

  // --- Output routing selector buttons (IN1 / IN2) ---
  if (type === 'output') {
    const device = getDevice(deviceId);
    const routeBtns = document.createElement('div');
    routeBtns.className = 'output-route-btns';
    routeBtns.id = 'routebtns_' + deviceId + '_' + conn.id;
    [1, 2].forEach(inNum => {
      const housing = document.createElement('div');
      housing.className = 'lamp-btn-housing';
      housing.title = 'Route → IN ' + inNum;
      housing.addEventListener('click', e => {
        e.stopPropagation();
        setOutputRoute(deviceId, conn.id, inNum);
      });

      const btn = document.createElement('div');
      btn.className = 'retro-lamp retro-lamp-btn lamp-in' + inNum;
      btn.id = 'routebtn_' + deviceId + '_' + conn.id + '_' + inNum;
      const isSelected = (conn.routeToInput ?? 1) === inNum;
      const inputActive = device && device.connections.inputs.find(i => i.id === inNum)?.active;
      if (isSelected && inputActive) applyLampOn(btn);

      housing.appendChild(btn);
      routeBtns.appendChild(housing);
    });
    wrap.appendChild(routeBtns);
  }

  return wrap;
}

// ============================================================
// 8. RENAME / DUPLICATE
// ============================================================
function startRenameDevice(deviceId, nameEl) {
  const device = getDevice(deviceId);
  if (!device) return;
  const input = document.createElement('input');
  input.className = 'device-name-input';
  input.value = device.name;
  nameEl.replaceWith(input);
  input.focus();
  input.select();

  function finish() {
    const newName = input.value.trim() || device.name;
    device.name = newName;
    markModified();
    const card = document.querySelector('[data-device-id="' + deviceId + '"]');
    if (card) card.replaceWith(buildDeviceCard(device));
    renderPatchTable();
  }
  input.addEventListener('blur', finish);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') finish(); });
}

function duplicateDevice(id) {
  const src = getDevice(id);
  if (!src) return;
  const copy = JSON.parse(JSON.stringify(src));
  copy.id = generateUUID();
  copy.name = src.name + ' (Kopie)';
  copy.connections.outputs.forEach(o => { o.active = false; o.ethId = null; });
  state.devices.push(copy);
  markModified();
  renderAllDevices();
  renderPatchTable();
  showToast('Gerät dupliziert.', 'success');
}

// ============================================================
// 9. 7-SEGMENT DISPLAY
// ============================================================
// Segment order: a, b, c, d, e, f, g
// a=top, b=top-right, c=bottom-right, d=bottom, e=bottom-left, f=top-left, g=middle
const SEG_MAP = {
  '0':[1,1,1,1,1,1,0], '1':[0,1,1,0,0,0,0], '2':[1,1,0,1,1,0,1],
  '3':[1,1,1,1,0,0,1], '4':[0,1,1,0,0,1,1], '5':[1,0,1,1,0,1,1],
  '6':[1,0,1,1,1,1,1], '7':[1,1,1,0,0,0,0], '8':[1,1,1,1,1,1,1],
  '9':[1,1,1,1,0,1,1],
  'A':[1,1,1,0,1,1,1], 'B':[0,0,1,1,1,1,1], 'C':[1,0,0,1,1,1,0],
  'D':[0,1,1,1,1,0,1], 'E':[1,0,0,1,1,1,1], 'F':[1,0,0,0,1,1,1],
  'G':[1,0,1,1,1,1,0], 'H':[0,1,1,0,1,1,1], 'I':[0,0,0,0,1,1,0],
  'J':[0,1,1,1,0,0,0], 'L':[0,0,0,1,1,1,0], 'O':[1,1,1,1,1,1,0],
  'P':[1,1,0,0,1,1,1], 'R':[0,0,0,0,1,0,1], 'S':[1,0,1,1,0,1,1],
  'T':[0,0,0,1,1,1,1], 'U':[0,1,1,1,1,1,0], 'V':[0,1,1,1,1,1,0],
  '-':[0,0,0,0,0,0,1], ' ':[0,0,0,0,0,0,0], '/':[0,1,0,0,1,0,1],
  '.':[0,0,0,1,0,0,0], '[':[1,0,0,1,1,1,0], ']':[1,1,1,1,0,0,0],
};

function buildSegDisplay(text) {
  const disp = document.createElement('div');
  disp.className = 'seg-display';
  const str = (text || '    ').slice(0, 4).padEnd(4, ' ');
  for (let i = 0; i < 4; i++) {
    const ch = str[i].toUpperCase();
    const digit = document.createElement('div');
    digit.className = 'seg-digit';
    const pattern = SEG_MAP[ch] || SEG_MAP[' '];
    ['a','b','c','d','e','f','g'].forEach((s, j) => {
      const seg = document.createElement('div');
      seg.className = 'seg seg-' + s + (pattern[j] ? ' on' : '');
      digit.appendChild(seg);
    });
    disp.appendChild(digit);
  }
  return disp;
}

function getConnDisplayText(conn, type) {
  if (type === 'input') {
    if (!conn.universe) return '    ';
    return 'U' + String(conn.universe).padStart(3, ' ');
  } else {
    if (conn.ethId) {
      const eth = state.ethDatabase.find(e => e.id === conn.ethId);
      if (eth) {
        const g = eth.group.replace('ETH ', '').slice(0, 2);
        const p = String(eth.port).slice(0, 1);
        return g.padEnd(2, ' ') + ' ' + p;
      }
    }
    return '----';
  }
}

function updateConnDisplay(deviceId, type, conn) {
  const dispEl = document.getElementById('disp_' + deviceId + '_' + type + '_' + conn.id);
  if (!dispEl) return;
  const text = getConnDisplayText(conn, type);
  const str = text.slice(0, 4).padEnd(4, ' ');
  const digits = dispEl.querySelectorAll('.seg-digit');
  digits.forEach((digit, i) => {
    const ch = str[i].toUpperCase();
    const pattern = SEG_MAP[ch] || SEG_MAP[' '];
    const segs = digit.querySelectorAll('.seg');
    segs.forEach((seg, j) => {
      if (pattern[j]) seg.classList.add('on');
      else seg.classList.remove('on');
    });
  });
}
