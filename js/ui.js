// ============================================================
// 3. MODALS
// ============================================================
function openModal(id) {
  document.getElementById(id).classList.add('open');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
    clearSelectedConnectors();
  }
});

// ============================================================
// 4. TAB SYSTEM
// ============================================================
function switchTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

  if (tabName === 'patch') {
    document.getElementById('tabBtnPatch').classList.add('active');
    document.getElementById('tabPatch').classList.add('active');
  } else if (tabName === 'fixtures') {
    document.getElementById('tabBtnFixtures').classList.add('active');
    document.getElementById('tabFixtures').classList.add('active');
    renderFixtureTab();
  } else {
    document.getElementById('tabBtnDetails').classList.add('active');
    document.getElementById('tabDetails').classList.add('active');
    renderSchematicTable();
  }
}
