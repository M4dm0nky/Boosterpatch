// ============================================================
// 10. ETH PANEL
// ============================================================
function initEthDatabase() {
  state.ethDatabase = [];
  const groups = ['A', 'B', 'C', 'US'];
  groups.forEach(g => {
    for (let p = 1; p <= 4; p++) {
      state.ethDatabase.push({
        id: 'eth_' + g.toLowerCase() + '_' + p,
        group: 'ETH ' + g,
        port: p
      });
    }
  });
}

function renderEthPanel() {
  const panel = document.getElementById('ethPanel');
  const existing = panel.querySelectorAll('.eth-entry, .eth-group-label');
  existing.forEach(el => el.remove());

  const usedEthIds = new Set(
    state.devices.flatMap(d => d.connections.outputs.map(o => o.ethId).filter(Boolean))
  );

  let lastGroup = '';
  state.ethDatabase.forEach(eth => {
    if (eth.group !== lastGroup) {
      lastGroup = eth.group;
      const groupEl = document.createElement('div');
      groupEl.className = 'eth-group-label';
      groupEl.textContent = eth.group;
      panel.appendChild(groupEl);
    }
    const isConnected = usedEthIds.has(eth.id);
    const entry = document.createElement('div');
    entry.className = 'eth-entry' + (isConnected ? ' connected' : '');
    entry.draggable = !isConnected;
    entry.dataset.ethId = eth.id;
    entry.title = isConnected ? 'Bereits verbunden' : 'Auf Output ziehen um zu verbinden';

    if (!isConnected) {
      entry.addEventListener('dragstart', e => {
        e.dataTransfer.setData('ethId', eth.id);
        e.dataTransfer.effectAllowed = 'link';
      });
    }

    const label = document.createElement('span');
    label.textContent = eth.group + ' / ' + eth.port;
    entry.appendChild(label);
    panel.appendChild(entry);
  });
}

function connectEthToOutput(deviceId, connId, ethId) {
  const device = getDevice(deviceId);
  if (!device) return;
  const conn = device.connections.outputs.find(c => c.id === connId);
  if (!conn) return;
  conn.ethId = ethId;
  conn.active = true;
  markModified();
  updateConnDisplay(deviceId, 'output', conn);
  syncConnLed(deviceId, 'output', connId);
  renderPatchTable();
  renderEthPanel();
  const eth = state.ethDatabase.find(e => e.id === ethId);
  if (eth) showToast('Output verbunden: ' + eth.group + ' / ' + eth.port, 'success', 1800);
}

// ============================================================
// 11. UNIVERSE POPOVER
// ============================================================
let _univCtx = null;

function openUnivPopover(deviceId, type, connId, anchorEl) {
  const device = getDevice(deviceId);
  if (!device) return;
  const conns = type === 'input' ? device.connections.inputs : device.connections.outputs;
  const conn = conns.find(c => c.id === connId);
  if (!conn) return;

  _univCtx = { deviceId, type, connId };

  const pop  = document.getElementById('univPopover');
  const input = document.getElementById('univInput');
  input.value = conn.universe || 1;

  // Kurz einblenden um Größe zu messen, dann positionieren
  pop.style.visibility = 'hidden';
  pop.style.display = 'flex';

  const rect = anchorEl.getBoundingClientRect();
  const pw = pop.offsetWidth;
  const ph = pop.offsetHeight;
  let left = rect.left + rect.width / 2 - pw / 2;
  let top  = rect.bottom + 8;
  if (left + pw > window.innerWidth  - 10) left = window.innerWidth  - pw - 10;
  if (left < 10) left = 10;
  if (top  + ph > window.innerHeight - 10) top  = rect.top - ph - 8;
  pop.style.left = left + 'px';
  pop.style.top  = top  + 'px';
  pop.style.visibility = '';

  input.focus();
  input.select();

  setTimeout(() => document.addEventListener('mousedown', _univOutsideDown), 10);
}

function _univOutsideDown(e) {
  const pop = document.getElementById('univPopover');
  if (!pop.contains(e.target)) confirmUnivPopover();
}

function closeUnivPopover() {
  document.getElementById('univPopover').style.display = 'none';
  document.removeEventListener('mousedown', _univOutsideDown);
  _univCtx = null;
}

function confirmUnivPopover() {
  if (!_univCtx) return;
  const { deviceId, type, connId } = _univCtx;
  const val = Math.max(1, Math.min(999, parseInt(document.getElementById('univInput').value) || 1));
  closeUnivPopover();
  savePtEdit(deviceId, type, connId, 'universe', String(val));
  renderPatchTable();
}

function univStep(delta) {
  const input = document.getElementById('univInput');
  const reel  = document.getElementById('univReel');
  let v = (parseInt(input.value) || 1) + delta;
  if (v < 1) v = 1;
  if (v > 999) v = 999;
  input.value = v;
  // Snap-Animation: kurz entfernen dann wieder setzen (reflow erzwingen)
  reel.classList.remove('snap-up', 'snap-down');
  void reel.offsetWidth;
  reel.classList.add(delta > 0 ? 'snap-up' : 'snap-down');
}

function univInputKey(e) {
  if (e.key === 'Enter')     { e.preventDefault(); confirmUnivPopover(); }
  if (e.key === 'Escape')    closeUnivPopover();
  if (e.key === 'ArrowUp')   { e.preventDefault(); univStep(1);  }
  if (e.key === 'ArrowDown') { e.preventDefault(); univStep(-1); }
}

function univClampInput() {
  const input = document.getElementById('univInput');
  let v = parseInt(input.value);
  if (isNaN(v)) return;
  if (v < 1)   input.value = 1;
  if (v > 999) input.value = 999;
}

// ============================================================
// 12. PATCH TABLE
// ============================================================
function renderPatchTable() {
  const tbody = document.getElementById('patchTableBody');
  tbody.innerHTML = '';
  let total = 0;

  state.devices.forEach(device => {
    device.connections.inputs.forEach(conn => {
      total++;
      const tr = document.createElement('tr');
      tr.id = 'ptrow_' + device.id + '_input_' + conn.id;
      tr.innerHTML = `
        <td class="pt-device">${escHtml(device.name)}</td>
        <td><span class="pt-type-in">IN</span></td>
        <td class="pt-num">${conn.id}</td>
        <td><span class="pt-led ${conn.active ? 'active' : ''}" title="Klick zum Umschalten"
            onclick="toggleLedFromTable('${device.id}','input',${conn.id})"></span></td>
        <td>${buildPtEditable(device.id,'input',conn.id,'label',conn.label,'Label…')}</td>
        <td>${buildPtEditable(device.id,'input',conn.id,'universe',conn.universe,'1')}</td>
        <td><span class="pt-dash">—</span></td>
        <td><span class="pt-dash">—</span></td>
        <td>${buildPtEditable(device.id,'input',conn.id,'notes',conn.notes,'Notizen…')}</td>
      `;
      tbody.appendChild(tr);
    });

    device.connections.outputs.forEach(conn => {
      total++;
      const eth = conn.ethId ? state.ethDatabase.find(e => e.id === conn.ethId) : null;
      const ethDisplay = eth
        ? `<span class="pt-eth">${escHtml(eth.group + ' / ' + eth.port)}</span>`
        : `<span class="pt-eth-empty">—</span>`;

      const tr = document.createElement('tr');
      tr.id = 'ptrow_' + device.id + '_output_' + conn.id;
      tr.innerHTML = `
        <td class="pt-device">${escHtml(device.name)}</td>
        <td><span class="pt-type-out">OUT</span></td>
        <td class="pt-num">${conn.id}</td>
        <td><span class="pt-led ${conn.active ? 'active' : ''}" title="Klick zum Umschalten"
            onclick="toggleLedFromTable('${device.id}','output',${conn.id})"></span></td>
        <td>${buildPtEditable(device.id,'output',conn.id,'label',conn.label,'Label…')}</td>
        <td>${buildPtEditable(device.id,'output',conn.id,'universe',conn.universe,'1')}</td>
        <td>${buildPtEditable(device.id,'output',conn.id,'startChannel',conn.startChannel,'1')}</td>
        <td>${ethDisplay}</td>
        <td>${buildPtEditable(device.id,'output',conn.id,'notes',conn.notes,'Notizen…')}</td>
      `;
      tbody.appendChild(tr);
    });
  });

  document.getElementById('patchCount').textContent = total + ' Verbindungen';

  tbody.querySelectorAll('.pt-editable').forEach(el => {
    el.addEventListener('blur', () => {
      const {devId, type, connId, field} = el.dataset;
      savePtEdit(devId, type, parseInt(connId), field, el.textContent.trim());
    });
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); el.blur(); }
    });
  });
}

function buildPtEditable(devId, type, connId, field, value, placeholder) {
  const isEmpty = !value && value !== 0;
  const display = isEmpty ? placeholder : value;
  return `<span class="pt-editable${isEmpty ? ' empty' : ''}"
    contenteditable="true"
    data-dev-id="${devId}" data-type="${type}" data-conn-id="${connId}" data-field="${field}"
    >${escHtml(String(display))}</span>`;
}

function savePtEdit(devId, type, connId, field, value) {
  const device = getDevice(devId);
  if (!device) return;
  const conns = type === 'input' ? device.connections.inputs : device.connections.outputs;
  const conn = conns.find(c => c.id === connId);
  if (!conn) return;

  const numFields = ['universe','startChannel'];
  conn[field] = numFields.includes(field) ? (parseInt(value) || 1) : value;
  markModified();

  if (field === 'label') {
    const xlrEl = document.getElementById('xlr_' + devId + '_' + type + '_' + connId);
    if (xlrEl) {
      const lbl = xlrEl.querySelector('.xlr-label');
      if (lbl) {
        lbl.textContent = value || '—';
        lbl.style.color = value ? 'var(--text-mono)' : 'var(--text-secondary)';
      }
    }
  }
  if (field === 'universe') {
    updateConnDisplay(devId, type, conn);
    if (type === 'input') {
      conn.active = !!(parseInt(value) > 0);
      syncConnLed(devId, type, parseInt(connId));
    }
  }
}

// --- Retro lamp sync helpers ---
function applyLampOn(el) {
  el.style.animationDelay = `-${(performance.now() % 2800) / 1000}s`;
  el.classList.add('on');
}
function removeLampOn(el) {
  el.classList.remove('on');
  el.style.animationDelay = '';
}

function syncConnLed(deviceId, type, connId) {
  const device = getDevice(deviceId);
  if (!device) return;
  const conns = type === 'input' ? device.connections.inputs : device.connections.outputs;
  const conn = conns.find(c => c.id === connId);
  if (!conn) return;
  const xlrEl = document.getElementById('xlr_' + deviceId + '_' + type + '_' + connId);
  if (xlrEl) {
    const led = xlrEl.querySelector('.xlr-led');
    if (led) {
      // xlr-led nutzt .active (eigene CSS-Klasse), nicht .on
      if (conn.active) {
        led.className = 'xlr-led active';
        led.style.animationDelay = `-${(performance.now() % 2800) / 1000}s`;
      } else {
        led.className = 'xlr-led';
        led.style.animationDelay = '';
      }
    }
  }
  if (type === 'input') {
    const inputLamp = document.getElementById('input_lamp_' + deviceId + '_' + connId);
    if (inputLamp) {
      if (conn.active) applyLampOn(inputLamp);
      else removeLampOn(inputLamp);
    }
    syncRoutingBtnsForInput(deviceId, connId);
  }
  const rowEl = document.getElementById('ptrow_' + deviceId + '_' + type + '_' + connId);
  if (rowEl) {
    const ptLed = rowEl.querySelector('.pt-led');
    if (ptLed) ptLed.className = 'pt-led' + (conn.active ? ' active' : '');
  }
}

function toggleLedFromTable(deviceId, type, connId) {
  const device = getDevice(deviceId);
  if (!device) return;
  const conns = type === 'input' ? device.connections.inputs : device.connections.outputs;
  const conn = conns.find(c => c.id === connId);
  if (!conn) return;
  conn.active = !conn.active;
  markModified();
  syncConnLed(deviceId, type, connId);
}

function setOutputRoute(deviceId, connId, inputNum) {
  const device = getDevice(deviceId);
  if (!device) return;
  const conn = device.connections.outputs.find(c => c.id === connId);
  if (!conn) return;
  conn.routeToInput = inputNum;
  markModified();
  [1, 2].forEach(inNum => {
    const btn = document.getElementById('routebtn_' + deviceId + '_' + connId + '_' + inNum);
    if (!btn) return;
    const isSelected = inNum === inputNum;
    const inputActive = device.connections.inputs.find(i => i.id === inNum)?.active;
    if (isSelected && inputActive) applyLampOn(btn);
    else removeLampOn(btn);
  });
}

function syncRoutingBtnsForInput(deviceId, inputId) {
  const device = getDevice(deviceId);
  if (!device) return;
  const inputActive = device.connections.inputs.find(i => i.id === inputId)?.active;
  device.connections.outputs.forEach(out => {
    const btn = document.getElementById('routebtn_' + deviceId + '_' + out.id + '_' + inputId);
    if (!btn) return;
    const isSelected = (out.routeToInput ?? 1) === inputId;
    if (isSelected && inputActive) applyLampOn(btn);
    else removeLampOn(btn);
  });
}
