'use strict';

// ============================================================
// 9b. FIXTURE DATABASE — TXT Import & Popover
// ============================================================

function importFixtureTxt() {
  document.getElementById('fixtureTxtInput').click();
}

function handleFixtureTxtImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const fixtures = parseTxtToFixtures(e.target.result);
    if (fixtures === null) {
      showToast('Dateiformat ungültig — Spalten "Fixture", "Typ" und "Line" nicht gefunden.', 'error');
      return;
    }
    state.fixtureDatabase = fixtures;
    markModified();
    updateFixtureDbStatus();
    renderAllDevices();
    renderPatchTable();
    showToast(fixtures.length + ' Fixtures importiert.', 'success');
  };
  reader.readAsText(file, 'utf-8');
  event.target.value = '';
}

function parseTxtToFixtures(text) {
  // Normalize line endings
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  if (lines.length < 2) return [];

  const header = lines[0].split('\t');
  const idxFixture = header.findIndex(h => h.trim().toLowerCase() === 'fixture');
  const idxTyp     = header.findIndex(h => h.trim().toLowerCase() === 'typ');
  const idxLine    = header.findIndex(h => h.trim().toLowerCase() === 'line');

  if (idxFixture === -1 || idxTyp === -1 || idxLine === -1) return null;

  const result = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split('\t');
    if (cols.length < Math.max(idxFixture, idxTyp, idxLine) + 1) continue;

    const fixtureId = cols[idxFixture].trim();
    const type      = cols[idxTyp].trim();
    const line      = cols[idxLine].trim();

    // Skip empty rows and NullPunkt entries
    if (!fixtureId || !line) continue;
    if (type.toLowerCase() === 'nullpunkt') continue;

    result.push({ fixtureId, type, line });
  }
  return result;
}

function getFixturesForLine(lineId) {
  if (!lineId) return [];
  const key = lineId.trim().toLowerCase();
  return state.fixtureDatabase.filter(f => f.line.trim().toLowerCase() === key);
}

function updateFixtureDbStatus() {
  const el = document.getElementById('fixtureDbStatus');
  if (!el) return;
  const count = state.fixtureDatabase.length;
  if (count === 0) {
    el.textContent = 'Keine Daten';
    el.style.color = 'var(--text-secondary)';
  } else {
    el.textContent = count + ' Fixtures geladen';
    el.style.color = 'var(--accent-green)';
  }
}

// ============================================================
// FIXTURE POPOVER
// ============================================================
let _fixCtx = null;

function openFixturePopover(lineId, anchorEl) {
  if (state.fixtureDatabase.length === 0) {
    showToast('Noch keine Fixture-Datei importiert.', 'warning', 2000);
    return;
  }
  if (!lineId) {
    showToast('Kein Label gesetzt — Label entspricht der Linen-Bezeichnung (z.B. LK Z/4).', 'warning', 2500);
    return;
  }

  _fixCtx = { lineId };
  const fixtures = getFixturesForLine(lineId);

  const pop      = document.getElementById('fixturePopover');
  const lineEl   = document.getElementById('fixPopLineLabel');
  const listEl   = document.getElementById('fixPopList');

  lineEl.textContent = lineId;
  listEl.innerHTML = '';

  if (fixtures.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'fix-pop-empty';
    empty.textContent = 'Keine Fixtures auf dieser Line.';
    listEl.appendChild(empty);
  } else {
    fixtures.forEach(f => {
      const item = document.createElement('div');
      item.className = 'fix-pop-item';
      item.innerHTML =
        '<span class="fix-pop-id">' + escHtml(f.fixtureId) + '</span>' +
        '<span class="fix-pop-type">' + escHtml(f.type) + '</span>';
      listEl.appendChild(item);
    });
  }

  // Position below anchor element
  pop.style.visibility = 'hidden';
  pop.style.display = 'block';

  const rect = anchorEl.getBoundingClientRect();
  const pw   = pop.offsetWidth;
  const ph   = pop.offsetHeight;
  let left   = rect.left + rect.width / 2 - pw / 2;
  let top    = rect.bottom + 8;
  if (left + pw > window.innerWidth  - 10) left = window.innerWidth  - pw - 10;
  if (left < 10) left = 10;
  if (top  + ph > window.innerHeight - 10) top  = rect.top - ph - 8;
  pop.style.left       = left + 'px';
  pop.style.top        = top  + 'px';
  pop.style.visibility = '';

  setTimeout(() => document.addEventListener('mousedown', _fixOutsideDown), 10);
}

function _fixOutsideDown(e) {
  const pop = document.getElementById('fixturePopover');
  if (!pop.contains(e.target)) closeFixturePopover();
}

function closeFixturePopover() {
  const pop = document.getElementById('fixturePopover');
  if (pop) pop.style.display = 'none';
  document.removeEventListener('mousedown', _fixOutsideDown);
  _fixCtx = null;
}
