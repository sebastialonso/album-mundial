const USERS = [
  'Alice', 'Bruno', 'Carlos', 'Diana', 'Eduardo',
  'Fatima', 'Gabriel', 'Helena', 'Ivan', 'Julia',
  'Kevin', 'Laura', 'Manuel', 'Nina', 'Oscar',
  'Paula', 'Rafael', 'Sofia', 'Tomas', 'Valentina',
];

const TEAM_FLAGS = {
  MEX: 'mx',  RSA: 'za',     KOR: 'kr', CZE: 'cz', CAN: 'ca',
  BIH: 'ba',  QAT: 'qa',     SUI: 'ch', BRA: 'br', HAI: 'ht',
  MAR: 'ma',  SCO: 'gb-sct', USA: 'us', PAR: 'py', AUS: 'au',
  TUR: 'tr',  GER: 'de',     CUW: 'cw', CIV: 'ci', ECU: 'ec',
  NED: 'nl',  JPN: 'jp',     SWE: 'se', TUN: 'tn', BEL: 'be',
  EGY: 'eg',  IRN: 'ir',     NZL: 'nz', ESP: 'es', CPV: 'cv',
  KSA: 'sa',  URU: 'uy',     FRA: 'fr', SEN: 'sn', IRQ: 'iq',
  NOR: 'no',  ARG: 'ar',     ALG: 'dz', AUT: 'at', JOR: 'jo',
  POR: 'pt',  COD: 'cd',     UZB: 'uz', COL: 'co', ENG: 'gb-eng',
  CRO: 'hr',  GHA: 'gh',     PAN: 'pa',
};

let currentUser = USERS[0];
let editorSelection = {}; // { [code]: qty } for catalog | { [code]: true } for missing
let editorMode = null;    // 'catalog' | 'missing'

// --- Storage ---

function getCatalog(user) {
  const raw = localStorage.getItem(`catalog_${user}`);
  return raw ? JSON.parse(raw) : null;
}

function saveCatalog(user, data) {
  const nonZero = Object.fromEntries(Object.entries(data).filter(([, v]) => v > 0));
  if (Object.keys(nonZero).length === 0) {
    localStorage.removeItem(`catalog_${user}`);
  } else {
    localStorage.setItem(`catalog_${user}`, JSON.stringify(nonZero));
  }
}

function getMissing(user) {
  const raw = localStorage.getItem(`missing_${user}`);
  return raw ? JSON.parse(raw) : null;
}

function saveMissing(user, codes) {
  if (codes.length === 0) {
    localStorage.removeItem(`missing_${user}`);
  } else {
    localStorage.setItem(`missing_${user}`, JSON.stringify(codes));
  }
}

// --- Set operations ---

function extraSet(catalog) {
  return new Set(Object.keys(catalog).filter(code => catalog[code] >= 2));
}

// --- Grid helpers ---

function flagUrl(stickerCode) {
  const m = stickerCode.match(/^([A-Z]+)/);
  const iso = m ? TEAM_FLAGS[m[1]] : null;
  return iso ? `https://flagcdn.com/w80/${iso}.png` : null;
}

function cellVisual(sticker) {
  const url = flagUrl(sticker.code);
  if (url) {
    return `<img src="${url}" alt="${sticker.section}" loading="lazy">`;
  }
  const isMuseum = sticker.section === 'FIFA Museum';
  return `<div class="tile ${isMuseum ? 'tile-museum' : 'tile-intro'}">${isMuseum ? 'Museum' : 'WC26'}</div>`;
}

function renderGrid() {
  return STICKERS.map(s => {
    const val = editorSelection[s.code];
    const isSelected = editorMode === 'catalog' ? val > 0 : !!val;
    const qtyBadge = isSelected && editorMode === 'catalog'
      ? `<div class="cell-qty">${val}</div>` : '';
    return `
      <div class="sticker-cell${isSelected ? ' selected' : ''}"
        data-code="${s.code.toLowerCase()}"
        data-section="${s.section.toLowerCase()}"
        data-name="${s.name.toLowerCase()}"
        onclick="handleCellClick('${s.code}')">
        <div class="cell-visual">${cellVisual(s)}</div>
        <div class="cell-code">${s.code}</div>
        ${qtyBadge}
      </div>`;
  }).join('');
}

function refreshSelectionPanel() {
  const items = Object.entries(editorSelection).filter(([, v]) => editorMode === 'catalog' ? v > 0 : v);
  const count = items.length;

  let html = `<div class="panel-header">Seleccionadas <span class="panel-count">${count}</span></div>`;

  if (count === 0) {
    html += `<div class="panel-empty">Haz clic en las cartas para agregarlas</div>`;
  } else if (editorMode === 'catalog') {
    html += `<div class="panel-list">${items.map(([code, qty]) => `
      <div class="panel-item" data-code="${code}">
        <span class="panel-code">${code}</span>
        <input type="number" min="1" max="99" value="${qty}"
          class="panel-qty" onchange="updateQty('${code}', this.value)">
      </div>`).join('')}</div>`;
  } else {
    html += `<div class="panel-list">${items.map(([code]) => `
      <div class="panel-item">
        <span class="panel-code">${code}</span>
      </div>`).join('')}</div>`;
  }

  document.getElementById('selection-panel').innerHTML = html;
}

function handleCellClick(code) {
  const wasSelected = editorMode === 'catalog' ? editorSelection[code] > 0 : !!editorSelection[code];

  if (editorMode === 'catalog') {
    if (wasSelected) delete editorSelection[code];
    else editorSelection[code] = 1;
  } else {
    if (wasSelected) delete editorSelection[code];
    else editorSelection[code] = true;
  }

  const isSelected = editorMode === 'catalog' ? editorSelection[code] > 0 : !!editorSelection[code];

  // Update cell badge
  const cell = document.querySelector(`.sticker-cell[data-code="${code.toLowerCase()}"]`);
  if (cell) {
    cell.classList.toggle('selected', isSelected);
    let badge = cell.querySelector('.cell-qty');
    if (editorMode === 'catalog' && isSelected) {
      if (!badge) { badge = document.createElement('div'); badge.className = 'cell-qty'; cell.appendChild(badge); }
      badge.textContent = editorSelection[code];
    } else {
      badge?.remove();
    }
  }

  const count = Object.values(editorSelection).filter(v => v).length;

  if (isSelected) {
    // New item: prepend to the panel list, or full re-render if panel was empty
    const list = document.querySelector('.panel-list');
    if (list) {
      const item = document.createElement('div');
      item.className = 'panel-item';
      item.dataset.code = code;
      item.innerHTML = editorMode === 'catalog'
        ? `<span class="panel-code">${code}</span>
           <input type="number" min="1" max="99" value="1"
             class="panel-qty" onchange="updateQty('${code}', this.value)">`
        : `<span class="panel-code">${code}</span>`;
      list.prepend(item);
      document.querySelector('.panel-count').textContent = count;
    } else {
      refreshSelectionPanel();
    }
  } else {
    // Removed: surgically delete the row
    document.querySelector(`.panel-item[data-code="${code}"]`)?.remove();
    document.querySelector('.panel-count').textContent = count;
    // If list is now empty, swap in the empty-state message
    const list = document.querySelector('.panel-list');
    if (list && list.children.length === 0) refreshSelectionPanel();
  }
}

function updateQty(code, val) {
  const qty = parseInt(val) || 0;
  const cell = document.querySelector(`.sticker-cell[data-code="${code.toLowerCase()}"]`);

  if (qty <= 0) {
    delete editorSelection[code];
    if (cell) { cell.classList.remove('selected'); cell.querySelector('.cell-qty')?.remove(); }
    // Remove just this row and update the count — avoids full re-render and scroll reset
    document.querySelector(`.panel-item[data-code="${code}"]`)?.remove();
    const countEl = document.querySelector('.panel-count');
    if (countEl) countEl.textContent = Object.keys(editorSelection).filter(k => editorSelection[k] > 0).length;
  } else {
    editorSelection[code] = qty;
    if (cell) {
      let badge = cell.querySelector('.cell-qty');
      if (!badge) { badge = document.createElement('div'); badge.className = 'cell-qty'; cell.appendChild(badge); }
      badge.textContent = qty;
    }
    // Input already shows the new value in place — no panel re-render needed
  }
}

function filterGrid(term) {
  const lterm = term.toLowerCase();
  const cells = document.querySelectorAll('.sticker-cell');
  let visible = 0;
  cells.forEach(cell => {
    const match = !lterm
      || cell.dataset.code.includes(lterm)
      || cell.dataset.section.includes(lterm)
      || cell.dataset.name.includes(lterm);
    cell.style.display = match ? '' : 'none';
    if (match) visible++;
  });
  const el = document.getElementById('filter-count');
  if (el) el.textContent = `${visible} carta${visible !== 1 ? 's' : ''}`;
}

// --- Views ---

function showLanding() {
  editorMode = null;
  editorSelection = {};

  const catalog = getCatalog(currentUser);
  const missing = getMissing(currentUser);
  const ownedCount = catalog ? Object.values(catalog).filter(q => q >= 1).length : 0;
  const extraCount = catalog ? extraSet(catalog).size : 0;
  const missingCount = missing ? missing.length : 0;

  document.getElementById('main').innerHTML = `
    <div class="landing">
      <div class="card">
        <h2>Mi Álbum</h2>
        ${catalog
          ? `<p class="stat">${ownedCount} tengo &nbsp;&middot;&nbsp; ${extraCount} repetidas</p>`
          : `<p class="muted">Aún no tienes álbum</p>`}
        <button class="btn" onclick="showCatalogEditor()">
          ${catalog ? 'Actualizar Álbum' : 'Crear Álbum'}
        </button>
      </div>

      <div class="card">
        <h2>Mis Faltantes</h2>
        ${missing
          ? `<p class="stat">${missingCount} cartas faltantes</p>`
          : `<p class="muted">Aún no tienes lista de faltantes</p>`}
        <button class="btn" onclick="showMissingEditor()">
          ${missing ? 'Actualizar Faltantes' : 'Crear Lista de Faltantes'}
        </button>
      </div>

      <div class="card">
        <h2>Buscar Cartas</h2>
        ${missing
          ? `<p class="muted">Encuentra usuarios que tengan tus cartas faltantes</p>
             <button class="btn" onclick="showCoverage()">Buscar</button>`
          : `<p class="muted">Primero crea tu lista de faltantes</p>
             <button class="btn" disabled>Buscar</button>`}
      </div>
    </div>
  `;
}

function showCatalogEditor() {
  editorMode = 'catalog';
  editorSelection = { ...(getCatalog(currentUser) || {}) };
  renderEditor('Mi Álbum', 'Cant.', 'saveCatalogEditor()');
}

function showMissingEditor() {
  editorMode = 'missing';
  const saved = getMissing(currentUser) || [];
  editorSelection = Object.fromEntries(saved.map(c => [c, true]));
  renderEditor('Mis Faltantes', '¿Falta?', 'saveMissingEditor()');
}

function renderEditor(title, colLabel, saveAction) {
  document.getElementById('main').innerHTML = `
    <div class="editor">
      <div class="editor-header">
        <button class="btn-secondary" onclick="showLanding()">Volver</button>
        <h2>${title}</h2>
        <button class="btn" onclick="${saveAction}">Guardar</button>
      </div>
      <div class="editor-body">
        <div class="grid-side">
          <div class="filter-bar">
            <input id="filter" type="text" placeholder="Filtrar por código, equipo o nombre..."
              oninput="filterGrid(this.value)">
            <span id="filter-count" class="filter-count">${STICKERS.length} cartas</span>
          </div>
          <div class="sticker-grid" id="sticker-grid">${renderGrid()}</div>
        </div>
        <div class="selection-panel" id="selection-panel"></div>
      </div>
    </div>
  `;
  refreshSelectionPanel();
}

function saveCatalogEditor() {
  saveCatalog(currentUser, editorSelection);
  showLanding();
}

function saveMissingEditor() {
  saveMissing(currentUser, Object.keys(editorSelection).filter(k => editorSelection[k]));
  showLanding();
}

function showCoverage() {
  const myMissing = getMissing(currentUser);
  if (!myMissing || myMissing.length === 0) return showLanding();

  const myMissingSet = new Set(myMissing);

  const results = USERS
    .filter(u => u !== currentUser)
    .reduce((acc, user) => {
      const catalog = getCatalog(user);
      if (!catalog) return acc;
      const extras = extraSet(catalog);
      const covered = myMissing.filter(code => extras.has(code));
      if (covered.length === 0) return acc;
      const pct = Math.round(covered.length / myMissingSet.size * 100);
      acc.push({ user, covered, pct });
      return acc;
    }, [])
    .sort((a, b) => b.pct - a.pct);

  const rows = results.length === 0
    ? `<p class="empty-state">Ningún usuario tiene repetidas que coincidan con tus faltantes aún.</p>`
    : results.map(r => `
        <div class="coverage-row">
          <div class="coverage-meta">
            <span class="coverage-user">${r.user}</span>
            <span class="badge">${r.pct}%</span>
            <span class="muted">${r.covered.length} de ${myMissing.length} cartas</span>
            <a class="sotos-btn" href="https://sotos.app" target="_blank" rel="noopener noreferrer">
              <img src="https://sotos.app/logo.png" alt="Sotos" class="sotos-logo"
                onerror="this.style.display='none'">
              Comprar en Sotos
            </a>
          </div>
          <div class="chip-list">
            ${r.covered.map(code => `<span class="chip">${code}</span>`).join('')}
          </div>
        </div>`).join('');

  document.getElementById('main').innerHTML = `
    <div class="editor">
      <div class="editor-header">
        <button class="btn-secondary" onclick="showLanding()">Volver</button>
        <h2>Resultados</h2>
        <span class="muted">${myMissing.length} cartas en tu lista</span>
      </div>
      <div class="coverage-info">
        Acá verás qué usuarios quieren vender las cartas que te faltan. Puedes hacer la compra
        directamente de manera segura a través de Sotos, el marketplace más bakan de Chile.
      </div>
      <div class="coverage-body">${rows}</div>
    </div>
  `;
}

// --- Init ---

function init() {
  const selector = document.getElementById('user-selector');
  USERS.forEach(user => {
    const opt = document.createElement('option');
    opt.value = opt.textContent = user;
    selector.appendChild(opt);
  });
  selector.addEventListener('change', () => {
    currentUser = selector.value;
    showLanding();
  });
  showLanding();
}

document.addEventListener('DOMContentLoaded', init);
