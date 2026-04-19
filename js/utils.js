// ============================================================
//  PCSHSCR Club Registration – Shared Utilities
// ============================================================

// ── Session Management ──────────────────────────────────────
const SESSION_KEY   = 'pcshscr_session';
const TIMEOUT_MS    = 30 * 60 * 1000; // 30 minutes
let _inactivityTimer = null;

function saveSession(role, data) {
  const session = { role, data, ts: Date.now() };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  resetInactivityTimer();
}

function getSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (Date.now() - s.ts > TIMEOUT_MS) { clearSession(); return null; }
    s.ts = Date.now();
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
    return s;
  } catch { return null; }
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
  if (_inactivityTimer) clearTimeout(_inactivityTimer);
}

function requireRole(role, redirectTo = 'index.html') {
  const s = getSession();
  if (!s || s.role !== role) { window.location.href = redirectTo; return null; }
  return s;
}

function resetInactivityTimer() {
  if (_inactivityTimer) clearTimeout(_inactivityTimer);
  _inactivityTimer = setTimeout(() => {
    clearSession();
    showToast('หมดเวลาใช้งาน กรุณาเข้าสู่ระบบใหม่', 'warning');
    setTimeout(() => window.location.href = 'index.html', 2000);
  }, TIMEOUT_MS);
}

// Reset timer on user activity
['click','keydown','mousemove','touchstart'].forEach(evt =>
  document.addEventListener(evt, () => { if (getSession()) resetInactivityTimer(); }, { passive: true })
);

// ── Toast Notifications ─────────────────────────────────────
function showToast(message, type = 'success', duration = 4000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('hide');
    toast.addEventListener('animationend', () => toast.remove());
  }, duration);
}

// ── Confirmation Modal ──────────────────────────────────────
function showConfirm({ title = 'ยืนยันการดำเนินการ', body = 'คุณยืนยันที่จะดำเนินการนี้ใช่หรือไม่?', confirmText = 'ยืนยัน', cancelText = 'ยกเลิก', type = 'warning' } = {}) {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    const icons = { warning: '⚠️', danger: '🗑️', success: '✅', info: 'ℹ️' };
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-icon">${icons[type] || '⚠️'}</div>
        <div class="modal-title">${title}</div>
        <div class="modal-body">${body}</div>
        <div class="modal-actions">
          <button class="btn btn-ghost" id="confirmCancel">${cancelText}</button>
          <button class="btn btn-primary" id="confirmOk">${confirmText}</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('open'));
    const close = val => { overlay.classList.remove('open'); setTimeout(() => overlay.remove(), 200); resolve(val); };
    overlay.querySelector('#confirmOk').onclick = () => close(true);
    overlay.querySelector('#confirmCancel').onclick = () => close(false);
    overlay.addEventListener('click', e => { if (e.target === overlay) close(false); });
  });
}

function showAlert({ title = 'แจ้งเตือน', body = '', icon = '✅', btnText = 'ตกลง' } = {}) {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-icon">${icon}</div>
        <div class="modal-title">${title}</div>
        <div class="modal-body">${body}</div>
        <div class="modal-actions">
          <button class="btn btn-primary" id="alertOk">${btnText}</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('open'));
    const close = () => { overlay.classList.remove('open'); setTimeout(() => overlay.remove(), 200); resolve(); };
    overlay.querySelector('#alertOk').onclick = close;
  });
}

// ── Hamburger / Drawer ──────────────────────────────────────
function initDrawer() {
  const btn     = document.getElementById('hamburgerBtn');
  const drawer  = document.getElementById('sideDrawer');
  const overlay = document.getElementById('drawerOverlay');
  if (!btn || !drawer || !overlay) return;
  const open  = () => { drawer.classList.add('open'); overlay.classList.add('open'); };
  const close = () => { drawer.classList.remove('open'); overlay.classList.remove('open'); };
  btn.addEventListener('click', open);
  overlay.addEventListener('click', close);
  document.querySelectorAll('.drawer-close').forEach(el => el.addEventListener('click', close));
}

// ── Audit Log ───────────────────────────────────────────────
async function writeAuditLog(action, targetCollection, targetId, details = {}) {
  try {
    const s = getSession();
    await db.collection(COL.AUDIT_LOG).add({
      actor:    s ? `${s.role}:${s.data?.id || s.data?.name || 'unknown'}` : 'anonymous',
      role:     s?.role || 'unknown',
      action,
      targetCollection,
      targetId,
      details,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch {}
}

// ── Pagination Helper ───────────────────────────────────────
function createPaginator(items, perPage = 25, renderFn) {
  let current = 1;
  const totalPages = () => Math.max(1, Math.ceil(items.length / perPage));
  const pageItems  = () => items.slice((current - 1) * perPage, current * perPage);

  function render(container, paginationEl) {
    renderFn(pageItems(), container);
    if (!paginationEl) return;
    const total = totalPages();
    paginationEl.innerHTML = '';
    const prev = btn('‹', current === 1, () => { current--; render(container, paginationEl); });
    paginationEl.appendChild(prev);
    for (let i = 1; i <= total; i++) {
      const b = btn(i, false, () => { current = i; render(container, paginationEl); });
      if (i === current) b.classList.add('active');
      paginationEl.appendChild(b);
    }
    const next = btn('›', current === total, () => { current++; render(container, paginationEl); });
    paginationEl.appendChild(next);
  }

  function btn(label, disabled, onClick) {
    const b = document.createElement('button');
    b.className = 'page-btn';
    b.textContent = label;
    b.disabled = disabled;
    b.addEventListener('click', onClick);
    return b;
  }

  return { render, setItems(newItems) { items = newItems; current = 1; } };
}

// ── Excel Export (requires SheetJS) ─────────────────────────
function exportToExcel(rows, headers, filename = 'export.xlsx') {
  if (typeof XLSX === 'undefined') { showToast('กรุณาโหลด SheetJS ก่อนใช้งาน', 'error'); return; }
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, filename);
}

// ── Utility Helpers ─────────────────────────────────────────
function formatDate(ts) {
  if (!ts) return '-';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' });
}

function gradeLabel(g) {
  const m = { 1:'ม.1',2:'ม.2',3:'ม.3',4:'ม.4',5:'ม.5',6:'ม.6' };
  return m[g] || `ม.${g}`;
}

function escHtml(str) {
  return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Round Status Checker (replaces server cron) ─────────────
async function refreshRoundStatus(roundId) {
  const doc = await db.collection(COL.ROUNDS).doc(roundId).get();
  if (!doc.exists) return;
  const d = doc.data();
  const now = Date.now();
  const isOpen = d.openAt?.toMillis() <= now && d.closeAt?.toMillis() >= now && d.teacherEditOpen;
  if (d.isOpen !== isOpen) {
    await db.collection(COL.ROUNDS).doc(roundId).update({ isOpen });
  }
}
