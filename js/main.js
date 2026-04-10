// ============================================================
// INIT
// ============================================================
document.getElementById('appVersionDisplay').textContent = APP_VERSION;

const _rackResizeObs = new ResizeObserver(() => updateRackScale());
_rackResizeObs.observe(document.getElementById('devicesContainer'));
renderEthPanel();
loadLogosLocal();
updateProjectDisplay();

renderSidebarPlanList();

// Try to restore most recent plan from localStorage
(async () => {
  const loaded = tryLoadMostRecentPlan();
  if (!loaded) updateEmptyState();
  updatePreview();

  // Try to restore FileHandle from IndexedDB
  const handle = await loadFileHandleFromIDB();
  if (handle) {
    try {
      const perm = await handle.queryPermission({ mode: 'readwrite' });
      if (perm === 'granted' || perm === 'prompt') {
        currentFileHandle = handle;
        currentFileName = handle.name;
      }
    } catch(e) {}
  }

  scheduleAutoSave();
})();
