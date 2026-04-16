'use strict';

const APP_VERSION = 'v0.9.3';

// ============================================================
// SKIN CATALOG
// ============================================================
const SKIN_CATALOG = [
  {
    id: 'standard',
    label: 'Standard',
    description: 'Generischer DMX Booster',
    models: null
  },
  {
    id: 'swisson',
    label: 'Swisson XSP',
    description: 'Swisson DMX Splitter/Booster',
    models: [
      { id: 'XSP-5R',    label: 'XSP-5R',    connector: '5-Pin XLR', inputs: 2, outputs: 5  },
      { id: 'XSP-3R',    label: 'XSP-3R',    connector: '3-Pin XLR', inputs: 2, outputs: 5  },
      { id: 'XSP-5R-5R', label: 'XSP-5R-5R', connector: '5-Pin XLR', inputs: 2, outputs: 10 },
      { id: 'XSP-3R-3R', label: 'XSP-3R-3R', connector: '3-Pin XLR', inputs: 2, outputs: 10 }
    ]
  },
  {
    id: 'obsidian',
    label: 'Obsidian NETRON',
    description: 'Obsidian Control NETRON Serie',
    models: [
      { id: 'RDM-6XL',  label: 'RDM 6XL',  connector: '5-Pin XLR',     inputs: 1, outputs: 6  },
      { id: 'RDM6-IP',  label: 'RDM6 IP',  connector: '5-Pin XLR IP66', inputs: 1, outputs: 6  },
      { id: 'DMX-10-5', label: 'DMX 10-5', connector: '5-Pin XLR',      inputs: 2, outputs: 10 },
      { id: 'DMX10-53', label: 'DMX10-53', connector: '5+3-Pin XLR',    inputs: 2, outputs: 10 }
    ]
  },
  {
    id: 'major',
    label: 'Major',
    description: 'Major DMX Booster',
    models: [
      { id: 'DMX-Booster-12', label: 'DMX Booster', connector: '5-Pin XLR', inputs: 1, outputs: 12 }
    ]
  }
];

// ============================================================
// 1. STATE
// ============================================================
const state = {
  planId: null,
  projectName: 'Unbenannt',
  projectCreated: false,
  created: null,
  modified: false,
  devices: [],
  logos: { planer: '', band: '', booking: '' },
  ethDatabase: [],
  fixtureDatabase: []
};

// ============================================================
// 2. UTILITIES
// ============================================================
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function markModified() {
  state.modified = true;
  document.getElementById('modifiedIndicator').classList.add('visible');
  scheduleAutoSave();
}

function markSaved() {
  state.modified = false;
  document.getElementById('modifiedIndicator').classList.remove('visible');
}

function updateProjectDisplay() {
  const el = document.getElementById('projectNameDisplay');
  el.textContent = state.projectName || 'Kein Projekt';
  document.title = (state.projectName || 'BOOSTERPATCH') + ' — BOOSTERPATCH';
}

function showToast(msg, type = 'info', duration = 2800) {
  const c = document.getElementById('toastContainer');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => {
    t.classList.add('out');
    setTimeout(() => t.remove(), 300);
  }, duration);
}

function escHtml(str) {
  return (str || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
