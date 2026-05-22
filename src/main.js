let state = {
  mode: "absolute",
  rows: 5,
  cols: 6,
  firstX: -86,
  firstY: 41,
  firstZ: -29.1254,
  spacingX: 31.7,
  spacingY: -31.7,
  zMode: "fixed",
  zStep: 0,
  snake: false,
  includeHeader: true,
  decimalComma: false,
  separator: "space",
  precision: 4,
};

const root = document.getElementById("root");

function icon(name) {
  const paths = {
    grid: "M4 4h16v16H4z M4 10h16M4 16h16M10 4v16M16 4v16",
    download: "M12 3v12m0 0 4-4m-4 4-4-4M5 21h14",
    copy: "M8 8h11v11H8z M5 5h11v3H8v8H5z",
    refresh: "M20 7v5h-5M4 17v-5h5M18 10a6 6 0 0 0-10-3M6 14a6 6 0 0 0 10 3",
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name]}" /></svg>`;
}

function render() {
  root.innerHTML = `
    <main class="app">
      <section class="topbar">
        <div>
          <h1>SensoSCAN Coordinate Generator</h1>
          <p>Generate MMR grid coordinate files for Sensofar / SensoSCAN stage positions.</p>
        </div>
        <div class="actions">
          <button id="copyBtn">${icon("copy")}Copy</button>
          <button class="primary" id="downloadBtn">${icon("download")}Download</button>
        </div>
      </section>

      <section class="layout">
        <form class="panel" id="settings">
          <h2>${icon("grid")}Grid Setup</h2>
          <label>Export mode
            <select id="mode">
              <option value="absolute">Absolute positions from first point</option>
              <option value="relative">Relative centered grid</option>
            </select>
          </label>
          <div class="two">
            <label>Rows <input id="rows" type="number" min="1" max="50" step="1" /></label>
            <label>Columns <input id="cols" type="number" min="1" max="50" step="1" /></label>
          </div>
          <div class="three">
            <label>First X mm <input id="firstX" type="number" step="0.0001" /></label>
            <label>First Y mm <input id="firstY" type="number" step="0.0001" /></label>
            <label>First Z mm <input id="firstZ" type="number" step="0.0001" /></label>
          </div>
          <div class="two">
            <label>X step mm <input id="spacingX" type="number" step="0.0001" /></label>
            <label>Y step mm <input id="spacingY" type="number" step="0.0001" /></label>
          </div>
          <div class="two">
            <label>Z mode
              <select id="zMode">
                <option value="fixed">Fixed Z for all points</option>
                <option value="blank">Leave Z blank</option>
                <option value="row-step">Add Z step per row</option>
              </select>
            </label>
            <label>Z row step mm <input id="zStep" type="number" step="0.0001" /></label>
          </div>
          <label class="check"><input id="snake" type="checkbox" /> Snake order every other row</label>
          <label class="check"><input id="includeHeader" type="checkbox" /> Include SensoSCAN manual sections</label>
          <label class="check"><input id="decimalComma" type="checkbox" /> Use decimal comma</label>
          <div class="two">
            <label>Separator
              <select id="separator">
                <option value="space">Space</option>
                <option value="tab">Tab</option>
                <option value="semicolon">Semicolon</option>
                <option value="comma">Comma</option>
              </select>
            </label>
            <label>Decimals <input id="precision" type="number" min="0" max="8" step="1" /></label>
          </div>
          <button type="button" id="resetBtn">${icon("refresh")}Reset Example</button>
        </form>

        <section class="panel previewPanel">
          <h2>Preview</h2>
          <div id="gridPreview" class="gridPreview"></div>
          <div class="summary" id="summary"></div>
          <textarea id="output" spellcheck="false"></textarea>
        </section>
      </section>

      <section class="panel">
        <h2>Coordinate Table</h2>
        <div id="tableWrap"></div>
      </section>
    </main>
  `;

  bindControls();
  updateControls();
  updateOutput();
}

function bindControls() {
  for (const id of Object.keys(state)) {
    const el = document.getElementById(id);
    if (!el) continue;
    el.oninput = () => {
      readControls();
      updateOutput();
    };
    el.onchange = el.oninput;
  }
  document.getElementById("resetBtn").onclick = () => {
    state = { ...state, mode: "absolute", rows: 5, cols: 6, firstX: -86, firstY: 41, firstZ: -29.1254, spacingX: 31.7, spacingY: -31.7, zMode: "fixed", zStep: 0, snake: false, includeHeader: true, decimalComma: false, separator: "space", precision: 4 };
    updateControls();
    updateOutput();
  };
  document.getElementById("copyBtn").onclick = async () => {
    await navigator.clipboard.writeText(document.getElementById("output").value);
    flash("Copied coordinate file text.");
  };
  document.getElementById("downloadBtn").onclick = downloadFile;
}

function readControls() {
  state.mode = document.getElementById("mode").value;
  state.rows = clampInt(document.getElementById("rows").value, 1, 50);
  state.cols = clampInt(document.getElementById("cols").value, 1, 50);
  state.firstX = numberValue("firstX");
  state.firstY = numberValue("firstY");
  state.firstZ = numberValue("firstZ");
  state.spacingX = numberValue("spacingX");
  state.spacingY = numberValue("spacingY");
  state.zMode = document.getElementById("zMode").value;
  state.zStep = numberValue("zStep");
  state.snake = document.getElementById("snake").checked;
  state.includeHeader = document.getElementById("includeHeader").checked;
  state.decimalComma = document.getElementById("decimalComma").checked;
  state.separator = document.getElementById("separator").value;
  state.precision = clampInt(document.getElementById("precision").value, 0, 8);
}

function updateControls() {
  for (const [id, value] of Object.entries(state)) {
    const el = document.getElementById(id);
    if (!el) continue;
    if (el.type === "checkbox") el.checked = Boolean(value);
    else el.value = value;
  }
}

function numberValue(id) {
  const value = Number(document.getElementById(id).value);
  return Number.isFinite(value) ? value : 0;
}

function clampInt(value, min, max) {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function generateCoordinates() {
  const coords = [];
  const relativeX0 = -0.5 * (state.cols - 1) * Math.abs(state.spacingX);
  const relativeY0 = -0.5 * (state.rows - 1) * Math.abs(state.spacingY);
  for (let r = 0; r < state.rows; r++) {
    const columns = Array.from({ length: state.cols }, (_, i) => i);
    if (state.snake && r % 2) columns.reverse();
    for (const c of columns) {
      const x = state.mode === "relative" ? relativeX0 + c * Math.abs(state.spacingX) : state.firstX + c * state.spacingX;
      const y = state.mode === "relative" ? relativeY0 + r * Math.abs(state.spacingY) : state.firstY + r * state.spacingY;
      let z = null;
      if (state.zMode === "fixed") z = state.firstZ;
      if (state.zMode === "row-step") z = state.firstZ + r * state.zStep;
      coords.push({ index: coords.length + 1, row: r + 1, col: c + 1, x, y, z });
    }
  }
  return coords;
}

function formatNumber(value) {
  let text = value.toFixed(state.precision);
  if (state.decimalComma) text = text.replace(".", ",");
  return text;
}

function separator() {
  return { space: " ", tab: "\t", semicolon: ";", comma: "," }[state.separator] || " ";
}

function buildText(coords) {
  const sep = separator();
  const lines = [];
  if (state.includeHeader) {
    lines.push("[References]");
    lines.push("[Measures]");
  }
  for (const p of coords) {
    const row = [formatNumber(p.x), formatNumber(p.y)];
    if (p.z !== null) row.push(formatNumber(p.z));
    lines.push(row.join(sep));
  }
  return lines.join("\n") + "\n";
}

function updateOutput() {
  const coords = generateCoordinates();
  document.getElementById("output").value = buildText(coords);
  renderTable(coords);
  renderGrid(coords);
  const first = coords[0];
  const last = coords[coords.length - 1];
  document.getElementById("summary").textContent = `${coords.length} positions. First: X ${first.x.toFixed(4)}, Y ${first.y.toFixed(4)}, Z ${first.z === null ? "blank" : first.z.toFixed(4)}. Last: X ${last.x.toFixed(4)}, Y ${last.y.toFixed(4)}.`;
}

function renderGrid(coords) {
  const el = document.getElementById("gridPreview");
  el.style.gridTemplateColumns = `repeat(${state.cols}, minmax(26px, 1fr))`;
  const byCell = new Map(coords.map((p) => [`${p.row}-${p.col}`, p]));
  el.innerHTML = "";
  for (let r = 1; r <= state.rows; r++) {
    for (let c = 1; c <= state.cols; c++) {
      const p = byCell.get(`${r}-${c}`);
      const cell = document.createElement("div");
      cell.className = p.index === 1 ? "cell first" : "cell";
      cell.textContent = p.index;
      cell.title = `Row ${r}, Col ${c}: X ${p.x.toFixed(4)} mm, Y ${p.y.toFixed(4)} mm`;
      el.appendChild(cell);
    }
  }
}

function renderTable(coords) {
  document.getElementById("tableWrap").innerHTML = `
    <table>
      <thead><tr><th>#</th><th>Row</th><th>Col</th><th>X mm</th><th>Y mm</th><th>Z mm</th></tr></thead>
      <tbody>${coords.map((p) => `<tr><td>${p.index}</td><td>${p.row}</td><td>${p.col}</td><td>${p.x.toFixed(4)}</td><td>${p.y.toFixed(4)}</td><td>${p.z === null ? "" : p.z.toFixed(4)}</td></tr>`).join("")}</tbody>
    </table>
  `;
}

function downloadFile() {
  const text = document.getElementById("output").value;
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sensoscan_coordinates_${state.rows}x${state.cols}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function flash(text) {
  const summary = document.getElementById("summary");
  const previous = summary.textContent;
  summary.textContent = text;
  setTimeout(() => { summary.textContent = previous; }, 1400);
}

render();
