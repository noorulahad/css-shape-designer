// ══════════════════════════════════════════
// CONSTANTS & STATE
// ══════════════════════════════════════════
const BP_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#06b6d4', '#ec4899', '#f97316', '#8b5cf6', '#14b8a6'];
let selectedSwatchColor = BP_COLORS[1];

let S = {
    bps: [{ id: 'default', name: 'Default', maxWidth: null, color: BP_COLORS[0], points: [] }],
    activeBP: 'default',
    mode: 'add',
    shapeType: 'clip-path',
    selPt: null,
    history: [],
    cw: 440, ch: 300,
    animate: false,
    activeRTab: 'code'
};

// DOM refs
const canvasWrap = document.getElementById('canvas-wrap');
const shapePrev = document.getElementById('shape-preview');
const svgOl = document.getElementById('svg-ol');
const interact = document.getElementById('interact');
const outline = document.getElementById('shape-outline');
const ptsG = document.getElementById('pts-g');
const linesG = document.getElementById('lines-g');
const miniPrev = document.getElementById('mini-prev');

// ══════════════════════════════════════════
// INIT
// ══════════════════════════════════════════
function init() {
    buildSwatches();
    resizeCanvas();
    renderBPTabs();
    renderRuler();
    renderPointsList();
    renderCanvas();
    updateCode();
    setupInteraction();
}

function resizeCanvas() {
    S.cw = parseInt(document.getElementById('cw').value) || 440;
    S.ch = parseInt(document.getElementById('ch').value) || 300;
    canvasWrap.style.width = S.cw + 'px';
    canvasWrap.style.height = S.ch + 'px';
    renderCanvas();
}

// ══════════════════════════════════════════
// BREAKPOINT TABS — THE MAIN FEATURE
// ══════════════════════════════════════════
function renderBPTabs() {
    const container = document.getElementById('bp-tabs-container');
    container.innerHTML = '';

    S.bps.forEach(bp => {
        const ptCount = bp.points.length;
        const isActive = bp.id === S.activeBP;

        const tab = document.createElement('div');
        tab.className = 'bp-tab' + (isActive ? ' active' : '');
        tab.style.setProperty('--bp-color', bp.color);

        tab.innerHTML = `
      <div class="bp-color-bar" style="background:${bp.color}"></div>
      <div class="bp-tab-content">
        <div class="bp-tab-name">${bp.name}</div>
        <div class="bp-tab-meta">
          <span class="bp-tab-width">${bp.maxWidth ? '@' + bp.maxWidth + 'px' : 'base'}</span>
          <span class="bp-tab-pts ${ptCount > 0 ? 'has-pts' : ''}">${ptCount} pt${ptCount !== 1 ? 's' : ''}</span>
        </div>
      </div>
      ${bp.id !== 'default' ? `<button class="bp-tab-del" onclick="deleteBP(event,'${bp.id}')">×</button>` : ''}
    `;
        tab.addEventListener('click', () => activateBP(bp.id));
        container.appendChild(tab);
    });

    // Update canvas border color
    const activeBPObj = getActiveBP();
    canvasWrap.style.setProperty('--bp-color', activeBPObj.color);
    document.getElementById('sb-bp').textContent = activeBPObj.name;
}

function renderRuler() {
    const track = document.getElementById('ruler-track');
    track.innerHTML = '';
    const total = 1440;
    // Draw segments for each non-default BP sorted by maxWidth
    const bps = S.bps.filter(b => b.maxWidth).sort((a, b) => a.maxWidth - b.maxWidth);
    bps.forEach((bp, i) => {
        const prev = i > 0 ? bps[i - 1].maxWidth : 0;
        const left = (prev / total) * 100;
        const width = ((bp.maxWidth - prev) / total) * 100;
        const seg = document.createElement('div');
        seg.className = 'ruler-segment';
        seg.style.left = left + '%';
        seg.style.width = Math.min(width, 100 - left) + '%';
        seg.style.background = bp.color;
        // Label
        const tip = document.createElement('div');
        tip.className = 'ruler-tip';
        tip.style.left = (left + Math.min(width, 100 - left) / 2) + '%';
        tip.textContent = bp.maxWidth + 'px';
        seg.appendChild(tip);
        track.appendChild(seg);
    });
}

function activateBP(id) {
    S.activeBP = id;
    S.selPt = null;
    renderBPTabs();
    renderCanvas();
    renderPointsList();
    updateCode();
    renderRespBlocks();
}

function showAddBP() { document.getElementById('bp-modal').classList.add('open'); document.getElementById('bpNameIn').focus(); }
function hideAddBP() { document.getElementById('bp-modal').classList.remove('open'); }

function buildSwatches() {
    const row = document.getElementById('swatch-row');
    row.innerHTML = '';
    BP_COLORS.forEach((c, i) => {
        const s = document.createElement('div');
        s.className = 'swatch' + (i === 1 ? ' sel' : '');
        s.style.background = c;
        s.onclick = () => {
            row.querySelectorAll('.swatch').forEach(x => x.classList.remove('sel'));
            s.classList.add('sel');
            selectedSwatchColor = c;
        };
        row.appendChild(s);
    });
    selectedSwatchColor = BP_COLORS[1];
}

function confirmAddBP() {
    const name = document.getElementById('bpNameIn').value.trim() || ('BP' + (S.bps.length));
    const maxWidth = parseInt(document.getElementById('bpWidthIn').value) || null;
    const id = 'bp' + Date.now();
    // copy default points as starting shape
    const pts = JSON.parse(JSON.stringify(S.bps[0].points));
    S.bps.push({ id, name, maxWidth, color: selectedSwatchColor, points: pts });
    S.bps.sort((a, b) => {
        if (a.maxWidth === null) return -1;
        if (b.maxWidth === null) return 1;
        return b.maxWidth - a.maxWidth;
    });
    hideAddBP();
    document.getElementById('bpNameIn').value = '';
    document.getElementById('bpWidthIn').value = '';
    buildSwatches();
    activateBP(id);
    renderRuler();
}

function deleteBP(e, id) {
    e.stopPropagation();
    S.bps = S.bps.filter(b => b.id !== id);
    if (S.activeBP === id) activateBP('default');
    else { renderBPTabs(); renderRuler(); updateCode(); renderRespBlocks(); }
}

function getActiveBP() { return S.bps.find(b => b.id === S.activeBP); }
function getPoints() { return getActiveBP().points; }

// ══════════════════════════════════════════
// POINTS
// ══════════════════════════════════════════
function addPoint(x, y) {
    saveHist();
    const px = Math.round((x / S.cw) * 10000) / 100;
    const py = Math.round((y / S.ch) * 10000) / 100;
    getPoints().push({ x: px, y: py });
    refresh();
}

function movePoint(i, x, y) {
    const p = getPoints()[i];
    p.x = Math.round(Math.max(0, Math.min(100, (x / S.cw) * 100)) * 100) / 100;
    p.y = Math.round(Math.max(0, Math.min(100, (y / S.ch) * 100)) * 100) / 100;
    refresh();
    updatePtEditor();
}

function deletePoint(i) {
    saveHist();
    getPoints().splice(i, 1);
    if (S.selPt >= getPoints().length) S.selPt = null;
    refresh();
}

function clearPoints() { saveHist(); getActiveBP().points = []; S.selPt = null; refresh(); }

function mirrorH() { saveHist(); getPoints().forEach(p => p.x = Math.round((100 - p.x) * 100) / 100); refresh(); }
function mirrorV() { saveHist(); getPoints().forEach(p => p.y = Math.round((100 - p.y) * 100) / 100); refresh(); }

function refresh() {
    renderCanvas();
    renderPointsList();
    updateCode();
    renderBPTabs(); // update point count badges
}

// ══════════════════════════════════════════
// CANVAS RENDER
// ══════════════════════════════════════════
function renderCanvas() {
    const pts = getPoints();
    ptsG.innerHTML = '';
    linesG.innerHTML = '';

    // Outline polygon
    if (pts.length >= 2) {
        const poly = pts.map(p => `${p.x * S.cw / 100},${p.y * S.ch / 100}`).join(' ');
        outline.setAttribute('points', poly);
        outline.style.display = '';
        // Closing dashed line
        const cl = pts.map(p => `${p.x * S.cw / 100},${p.y * S.ch / 100}`);
        cl.push(cl[0]);
        const oline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        oline.setAttribute('points', cl.join(' '));
        oline.setAttribute('fill', 'none');
        oline.setAttribute('stroke', 'rgba(99,102,241,0.15)');
        oline.setAttribute('stroke-width', '1');
        linesG.appendChild(oline);
    } else {
        outline.style.display = 'none';
    }

    // Point labels + drag handles
    pts.forEach((p, i) => {
        const cx = p.x * S.cw / 100;
        const cy = p.y * S.ch / 100;
        const color = getActiveBP().color;

        // Number badge
        const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        txt.setAttribute('x', cx + 10); txt.setAttribute('y', cy - 6);
        txt.setAttribute('fill', 'rgba(255,255,255,0.45)');
        txt.setAttribute('font-size', '9');
        txt.setAttribute('font-family', 'JetBrains Mono, monospace');
        txt.textContent = i + 1;
        linesG.appendChild(txt);

        // Drag dot (DOM element for easy interaction)
        const dot = document.createElement('div');
        dot.className = 'dpt' + (S.selPt === i ? ' sel' : '');
        dot.style.left = cx + 'px';
        dot.style.top = cy + 'px';
        dot.style.borderColor = color;
        if (S.selPt === i) dot.style.background = color;
        dot.dataset.idx = i;
        ptsG.appendChild(dot);
    });

    applyClipPath();
    document.getElementById('sb-pts').textContent = pts.length;
    document.getElementById('pt-count').textContent = pts.length;
}

function applyClipPath() {
    const pts = getPoints();
    if (pts.length < 3) {
        shapePrev.style.clipPath = 'none';
        miniPrev.style.clipPath = 'none';
        return;
    }
    const poly = `polygon(${pts.map(p => `${p.x}% ${p.y}%`).join(', ')})`;
    const tr = S.animate ? 'clip-path 0.5s cubic-bezier(0.4,0,0.2,1)' : '';
    shapePrev.style.clipPath = poly;
    shapePrev.style.transition = tr;
    miniPrev.style.clipPath = poly;
    miniPrev.style.transition = tr;
}

function updateFill() {
    const c1 = document.getElementById('color1').value;
    const c2 = document.getElementById('color2').value;
    const a = document.getElementById('gradAngle').value;
    const g = `linear-gradient(${a}deg,${c1},${c2})`;
    shapePrev.style.background = g;
    miniPrev.style.background = g;
}

// ══════════════════════════════════════════
// POINTS LIST
// ══════════════════════════════════════════
function renderPointsList() {
    const el = document.getElementById('pts-list');
    const pts = getPoints();
    if (!pts.length) { el.innerHTML = '<div class="empty-pts">Click canvas to add points</div>'; return; }
    el.innerHTML = '';
    pts.forEach((p, i) => {
        const row = document.createElement('div');
        row.className = 'pt-row' + (S.selPt === i ? ' sel' : '');
        row.innerHTML = `
      <span class="pt-num">${i + 1}</span>
      <span class="pt-coord">${p.x}%, ${p.y}%</span>
      <button class="pt-del-btn" onclick="deletePoint(${i})">×</button>
    `;
        row.addEventListener('click', (e) => { if (!e.target.classList.contains('pt-del-btn')) { selectPt(i); } });
        el.appendChild(row);
    });
}

function selectPt(i) {
    S.selPt = i;
    renderCanvas();
    renderPointsList();
    updatePtEditor();
}

function updatePtEditor() {
    if (S.selPt !== null && S.selPt < getPoints().length) {
        const p = getPoints()[S.selPt];
        document.getElementById('px-inp').value = p.x;
        document.getElementById('py-inp').value = p.y;
    }
}

function updateSelPoint() {
    if (S.selPt === null) return;
    const x = parseFloat(document.getElementById('px-inp').value) || 0;
    const y = parseFloat(document.getElementById('py-inp').value) || 0;
    const pts = getPoints();
    pts[S.selPt].x = Math.round(Math.max(0, Math.min(100, x)) * 100) / 100;
    pts[S.selPt].y = Math.round(Math.max(0, Math.min(100, y)) * 100) / 100;
    renderCanvas(); renderPointsList(); updateCode();
}

// ══════════════════════════════════════════
// INTERACTION
// ══════════════════════════════════════════
function setupInteraction() {
    let dragging = false, dragIdx = null, moved = false;

    canvasWrap.addEventListener('mousedown', (e) => {
        const dot = e.target.closest('.dpt');
        if (dot) {
            if (S.mode === 'delete') { deletePoint(parseInt(dot.dataset.idx)); return; }
            dragging = true; dragIdx = parseInt(dot.dataset.idx); moved = false;
            saveHist();
            dot.classList.add('active');
            e.preventDefault(); e.stopPropagation();
            selectPt(dragIdx);
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (dragging && dragIdx !== null) {
            moved = true;
            const r = canvasWrap.getBoundingClientRect();
            movePoint(dragIdx, Math.max(0, Math.min(S.cw, e.clientX - r.left)), Math.max(0, Math.min(S.ch, e.clientY - r.top)));
        }
        const r = canvasWrap.getBoundingClientRect();
        const mx = e.clientX - r.left, my = e.clientY - r.top;
        if (mx >= 0 && mx <= S.cw && my >= 0 && my <= S.ch) {
            document.getElementById('sb-xy').textContent = Math.round((mx / S.cw) * 100) + '%, ' + Math.round((my / S.ch) * 100) + '%';
        }
    });

    document.addEventListener('mouseup', () => {
        dragging = false; dragIdx = null;
        document.querySelectorAll('.dpt').forEach(d => d.classList.remove('active'));
    });

    interact.addEventListener('click', (e) => {
        if (moved) { moved = false; return; }
        if (S.mode !== 'add') return;
        const r = canvasWrap.getBoundingClientRect();
        addPoint(e.clientX - r.left, e.clientY - r.top);
    });

    interact.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const t = e.touches[0], r = canvasWrap.getBoundingClientRect();
        if (S.mode === 'add') addPoint(t.clientX - r.left, t.clientY - r.top);
    }, { passive: false });
}

// ══════════════════════════════════════════
// MODE
// ══════════════════════════════════════════
function setMode(m) {
    S.mode = m;
    ['tcAdd', 'tcMove', 'tcDel'].forEach(id => document.getElementById(id)?.classList.remove('active'));
    ({ add: 'tcAdd', move: 'tcMove', delete: 'tcDel' }[m] && document.getElementById({ add: 'tcAdd', move: 'tcMove', delete: 'tcDel' }[m])?.classList.add('active'));
    const lbl = { add: 'Add Point', move: 'Move Point', delete: 'Delete Point' };
    document.getElementById('sb-mode').textContent = lbl[m];
    interact.style.cursor = m === 'add' ? 'crosshair' : m === 'move' ? 'default' : 'not-allowed';
}

// ══════════════════════════════════════════
// RIGHT PANEL TABS
// ══════════════════════════════════════════
function setRTab(name, btn) {
    S.activeRTab = name;
    document.querySelectorAll('.r-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    ['code', 'responsive', 'edit'].forEach(t => {
        const el = document.getElementById('rtab-' + t);
        if (el) el.style.display = t === name ? '' : 'none';
    });
    if (name === 'responsive') renderRespBlocks();
    if (name === 'edit') updatePtEditor();
}

// ══════════════════════════════════════════
// CODE GENERATION
// ══════════════════════════════════════════
function generateCSS(pts) {
    if (pts.length < 3) return '/* Need at least 3 points */';
    const poly = pts.map(p => `${p.x}% ${p.y}%`).join(',\n    ');
    if (S.shapeType === 'clip-path') return `.element {\n  clip-path: polygon(\n    ${poly}\n  );\n}`;
    return `polygon(\n  ${poly}\n)`;
}

function updateCode() {
    document.getElementById('css-out').textContent = generateCSS(getPoints());
}

function renderRespBlocks() {
    const el = document.getElementById('resp-blocks');
    el.innerHTML = '';
    const sorted = [...S.bps].sort((a, b) => {
        if (a.maxWidth === null) return -1;
        if (b.maxWidth === null) return 1;
        return a.maxWidth - b.maxWidth;
    });
    sorted.forEach(bp => {
        if (bp.points.length < 3) return;
        const poly = bp.points.map(p => `${p.x}% ${p.y}%`).join(', ');
        const css = bp.maxWidth
            ? `@media (max-width: ${bp.maxWidth}px) {\n  .element {\n    clip-path: polygon(${poly});\n  }\n}`
            : `.element {\n  clip-path: polygon(${poly});\n}`;

        const div = document.createElement('div');
        div.className = 'resp-bp-block';
        div.innerHTML = `
      <div class="resp-bp-hdr">
        <div class="resp-bp-dot" style="background:${bp.color}"></div>
        <span class="resp-bp-name">${bp.name}</span>
        <span class="resp-bp-tag">${bp.maxWidth ? '@' + bp.maxWidth + 'px' : 'base'}</span>
        <span class="resp-bp-tag" style="margin-left:auto">${bp.points.length} pts</span>
      </div>
      <pre class="resp-code">${escHtml(css)}</pre>
    `;
        el.appendChild(div);
    });
    if (!el.innerHTML) el.innerHTML = '<div style="font-size:11px;color:var(--text3);padding:8px 0">Add points to breakpoints to see code here.</div>';
}

function generateAllResp() {
    const parts = [];
    const sorted = [...S.bps].sort((a, b) => { if (a.maxWidth === null) return -1; if (b.maxWidth === null) return 1; return a.maxWidth - b.maxWidth; });
    sorted.forEach(bp => {
        if (bp.points.length < 3) return;
        const poly = bp.points.map(p => `${p.x}% ${p.y}%`).join(', ');
        if (bp.maxWidth) parts.push(`/* ${bp.name} */\n@media (max-width: ${bp.maxWidth}px) {\n  .element {\n    clip-path: polygon(${poly});\n  }\n}`);
        else parts.push(`/* ${bp.name} (base) */\n.element {\n  clip-path: polygon(${poly});\n}`);
    });
    return parts.join('\n\n') || '/* No breakpoints with 3+ points */';
}

function escHtml(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

async function copyCode(id, btn) {
    const text = document.getElementById(id)?.textContent || '';
    try { await navigator.clipboard.writeText(text); } catch (e) { fallbackCopy(text); }
    btn.textContent = '✓ Copied'; btn.classList.add('ok');
    setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('ok'); }, 2000);
}

async function copyAllResp(btn) {
    const text = generateAllResp();
    try { await navigator.clipboard.writeText(text); } catch (e) { fallbackCopy(text); }
    btn.textContent = '✓ Copied!';
    setTimeout(() => { btn.textContent = '⬇ Copy All Responsive CSS'; }, 2000);
}

function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); ta.remove();
}

// ══════════════════════════════════════════
// SHAPE TYPE
// ══════════════════════════════════════════
function setShapeType(t) {
    S.shapeType = t;
    document.getElementById('typeClip').classList.toggle('active', t === 'clip-path');
    document.getElementById('typePolygon').classList.toggle('active', t === 'polygon');
    updateCode();
}

// ══════════════════════════════════════════
// PRESETS
// ══════════════════════════════════════════
const PRESETS = {
    rectangle: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }],
    diamond: [{ x: 50, y: 0 }, { x: 100, y: 50 }, { x: 50, y: 100 }, { x: 0, y: 50 }],
    pentagon: [{ x: 50, y: 0 }, { x: 100, y: 38 }, { x: 81, y: 100 }, { x: 19, y: 100 }, { x: 0, y: 38 }],
    hexagon: [{ x: 50, y: 0 }, { x: 100, y: 25 }, { x: 100, y: 75 }, { x: 50, y: 100 }, { x: 0, y: 75 }, { x: 0, y: 25 }],
    arrow: [{ x: 0, y: 20 }, { x: 60, y: 20 }, { x: 60, y: 0 }, { x: 100, y: 50 }, { x: 60, y: 100 }, { x: 60, y: 80 }, { x: 0, y: 80 }],
    chevron: [{ x: 0, y: 0 }, { x: 75, y: 0 }, { x: 100, y: 50 }, { x: 75, y: 100 }, { x: 0, y: 100 }, { x: 25, y: 50 }],
    star: (() => { const p = []; for (let i = 0; i < 10; i++) { const a = (i * 36 - 90) * Math.PI / 180, r = i % 2 === 0 ? 50 : 22; p.push({ x: Math.round((50 + r * Math.cos(a)) * 100) / 100, y: Math.round((50 + r * Math.sin(a)) * 100) / 100 }); } return p; })(),
    card: [{ x: 0, y: 0 }, { x: 85, y: 0 }, { x: 100, y: 15 }, { x: 100, y: 100 }, { x: 0, y: 100 }],
    ribbon: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 90, y: 50 }, { x: 100, y: 100 }, { x: 0, y: 100 }, { x: 10, y: 50 }]
};

function applyPreset(n) {
    if (!PRESETS[n]) return;
    saveHist();
    getActiveBP().points = JSON.parse(JSON.stringify(PRESETS[n]));
    S.selPt = null; refresh();
}

// ══════════════════════════════════════════
// HISTORY
// ══════════════════════════════════════════
function saveHist() {
    S.history.push(JSON.parse(JSON.stringify(S.bps)));
    if (S.history.length > 30) S.history.shift();
}
function undoLast() {
    if (!S.history.length) return;
    S.bps = S.history.pop();
    renderBPTabs(); renderCanvas(); renderPointsList(); updateCode(); renderRuler();
}

// ══════════════════════════════════════════
// TOGGLES
// ══════════════════════════════════════════
function toggleAnim() { S.animate = document.getElementById('animToggle').checked; applyClipPath(); }
function toggleGrid() { document.getElementById('grid-rect').style.display = document.getElementById('gridToggle').checked ? '' : 'none'; }

// ══════════════════════════════════════════
// START
// ══════════════════════════════════════════
init();
applyPreset('card');