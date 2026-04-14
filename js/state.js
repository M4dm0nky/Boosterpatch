'use strict';

const APP_VERSION = 'v0.9.0';

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
      { id: 'XSP-5R',    label: 'XSP-5R',    connector: '5-Pin XLR', inputs: 1, outputs: 5  },
      { id: 'XSP-3R',    label: 'XSP-3R',    connector: '3-Pin XLR', inputs: 1, outputs: 5  },
      { id: 'XSP-5R-5R', label: 'XSP-5R-5R', connector: '5-Pin XLR', inputs: 1, outputs: 10 },
      { id: 'XSP-3R-3R', label: 'XSP-3R-3R', connector: '3-Pin XLR', inputs: 1, outputs: 10 }
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
