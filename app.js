const PROJECTS = [
  { name: "SENTINAL Workplace AI", domain: "Computer Vision", records: 12500, latency: 185, score: 97.4, color: "#38bdf8" },
  { name: "Real-Time Fraud Shield", domain: "ML / FinTech", records: 84000, latency: 42, score: 95.8, color: "#a78bfa" },
  { name: "Enterprise Sales Pulse", domain: "BI Dashboard", records: 52000, latency: 110, score: 98.2, color: "#34d399" },
  { name: "DocuSense NLP Extractor", domain: "NLP / LLM", records: 19400, latency: 230, score: 94.1, color: "#fbbf24" },
  { name: "Retail Churn Predictor", domain: "Predictive BI", records: 31000, latency: 65, score: 93.6, color: "#f472b6" }
];

const AGENTS = [
  { id: "copy", name: "Copy", color: "#38bdf8" },
  { id: "tagger", name: "DomainBot", color: "#a78bfa" },
  { id: "data", name: "DataPull", color: "#34d399" },
  { id: "bench", name: "Bench", color: "#fbbf24" },
  { id: "eval", name: "EvalML", color: "#f472b6" },
  { id: "claude", name: "Claude", color: "#fb923c" },
  { id: "pixel", name: "Pixel", color: "#2dd4bf" },
  { id: "codex", name: "Codex", color: "#818cf8" }
];

const sleep = ms => new Promise(r => setTimeout(r, ms));
let runToken = 0;

function initUI() {
  const toolbar = document.getElementById("agentToolbar");
  toolbar.innerHTML = AGENTS.map(a =>
    `<span class="agent-pill" id="pill-${a.id}" style="background:${a.color}">${a.name}</span>`
  ).join("");

  const tbody = document.getElementById("sheetBody");
  tbody.innerHTML = PROJECTS.map((p, idx) => {
    const r = idx + 2;
    const impact = ((p.score / (p.latency / 100))).toFixed(1);
    return `
      <tr>
        <td class="row-num">${r}</td>
        <td data-cell="A${r}" data-f="${p.name}"><span class="v">${p.name}</span></td>
        <td data-cell="B${r}" data-f="${p.domain}"><span class="v">${p.domain}</span></td>
        <td data-cell="C${r}" data-f="${p.records}"><span class="v">${p.records.toLocaleString()}</span></td>
        <td data-cell="D${r}" data-f="${p.latency}"><span class="v">${p.latency} ms</span></td>
        <td data-cell="E${r}" data-f="${p.score}"><span class="v">${p.score}%</span></td>
        <td data-cell="F${r}" data-f="=ROUND(E${r}/(D${r}/100), 1)"><span class="v">${impact}</span></td>
      </tr>
    `;
  }).join("") + `
    <tr class="totals-row">
      <td class="row-num">7</td>
      <td data-cell="A7" data-f="TOTAL / AVG"><span class="v">TOTAL / AVG</span></td>
      <td data-cell="B7" data-f="5 Projects"><span class="v">5 Projects</span></td>
      <td data-cell="C7" data-f="=SUM(C2:C6)"><span class="v">198,900</span></td>
      <td data-cell="D7" data-f="=AVERAGE(D2:D6)"><span class="v">126.4 ms</span></td>
      <td data-cell="E7" data-f="=AVERAGE(E2:E6)"><span class="v">95.8%</span></td>
      <td data-cell="F7" data-f="=AVERAGE(F2:F6)"><span class="v">107.1</span></td>
    </tr>
  `;

  const layer = document.getElementById("cursorLayer");
  layer.innerHTML = AGENTS.map(a => `
    <div class="agent-cursor" id="cur-${a.id}" style="opacity:0">
      <svg width="16" height="16" viewBox="0 0 16 16"><path d="M0 0L14 6L8 8L6 14Z" fill="${a.color}"/></svg>
      <span class="agent-tag" style="background:${a.color}">${a.name}</span>
    </div>
  `).join("");

  document.querySelectorAll("td[data-cell]").forEach(td => {
    td.addEventListener("click", () => {
      document.getElementById("cellRef").textContent = td.dataset.cell;
      document.getElementById("formulaInput").value = td.dataset.f;
    });
  });
}

function moveAgent(agentId, cellCoord) {
  const cur = document.getElementById(`cur-${agentId}`);
  const pill = document.getElementById(`pill-${agentId}`);
  const cell = document.querySelector(`td[data-cell="${cellCoord}"]`);
  if (!cur || !cell) return;
  pill.classList.add("active");
  cur.style.opacity = "1";
  cur.style.transform = `translate(${cell.offsetLeft + 24}px, ${cell.offsetTop + 14}px)`;
}

function hideAgent(agentId) {
  const cur = document.getElementById(`cur-${agentId}`);
  const pill = document.getElementById(`pill-${agentId}`);
  if (cur) cur.style.opacity = "0";
  if (pill) pill.classList.remove("active");
}

function revealCell(coord) {
  const cell = document.querySelector(`td[data-cell="${coord}"]`);
  if (cell) cell.dataset.on = "1";
}

async function fillColumn(agentId, col, delay, token) {
  for (let r = 2; r <= 6; r++) {
    if (token !== runToken) return;
    moveAgent(agentId, `${col}${r}`);
    await sleep(delay);
    revealCell(`${col}${r}`);
  }
  hideAgent(agentId);
}

async function runChoreography() {
  const token = ++runToken;
  initUI();
  const log = document.getElementById("activityLog");
  document.getElementById("chartBars").innerHTML = "";
  document.getElementById("chartTitle").textContent = "Awaiting Codex Agent...";

  log.textContent = "Copy, DomainBot, DataPull, Bench & EvalML populating columns in parallel...";
  await Promise.all([
    fillColumn("copy", "A", 180, token),
    fillColumn("tagger", "B", 210, token),
    fillColumn("data", "C", 240, token),
    fillColumn("bench", "D", 260, token),
    fillColumn("eval", "E", 280, token)
  ]);
  if (token !== runToken) return;

  log.textContent = "Claude dragging =ROUND(E2/(D2/100), 1) down F2:F6 | Pixel painting heatmap | Codex building chart...";
  await Promise.all([
    (async () => {
      document.getElementById("cellRef").textContent = "F2";
      document.getElementById("formulaInput").value = "=ROUND(E2/(D2/100), 1)";
      await fillColumn("claude", "F", 220, token);
    })(),
    (async () => {
      for (let r = 2; r <= 6; r++) {
        if (token !== runToken) return;
        moveAgent("pixel", `E${r}`);
        const cell = document.querySelector(`td[data-cell="E${r}"]`);
        const intensity = (PROJECTS[r - 2].score - 90) / 10;
        cell.style.background = `rgba(56, 189, 248, ${Math.max(0.12, intensity * 0.35)})`;
        await sleep(200);
      }
      hideAgent("pixel");
    })(),
    (async () => {
      moveAgent("codex", "E4");
      document.getElementById("chartTitle").textContent = "Model Accuracy Comparison (%)";
      const bars = document.getElementById("chartBars");
      bars.innerHTML = PROJECTS.map(p => `
        <div class="bar-row">
          <div class="bar-label"><span>${p.name}</span><span>${p.score}%</span></div>
          <div class="bar-track"><div class="bar-fill" data-w="${p.score}%" style="background:${p.color}"></div></div>
        </div>
      `).join("");
      await sleep(100);
      document.querySelectorAll(".bar-fill").forEach(el => el.style.width = el.dataset.w);
      await sleep(700);
      hideAgent("codex");
    })()
  ]);
  if (token !== runToken) return;

  log.textContent = "Calculating summary row (=SUM & =AVERAGE)...";
  for (const col of ["A", "B", "C", "D", "E", "F"]) {
    moveAgent("claude", `${col}7`);
    revealCell(`${col}7`);
    await sleep(140);
  }
  hideAgent("claude");
  log.textContent = "Done! Click any cell to inspect its live formula.";
}

document.getElementById("rebuildBtn").addEventListener("click", runChoreography);
document.getElementById("skipBtn").addEventListener("click", () => {
  ++runToken;
  AGENTS.forEach(a => hideAgent(a.id));
  document.querySelectorAll("td[data-cell]").forEach(td => td.dataset.on = "1");
  document.getElementById("chartTitle").textContent = "Model Accuracy Comparison (%)";
  document.getElementById("chartBars").innerHTML = PROJECTS.map(p => `
    <div class="bar-row">
      <div class="bar-label"><span>${p.name}</span><span>${p.score}%</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${p.score}%;background:${p.color}"></div></div>
    </div>
  `).join("");
  document.getElementById("activityLog").textContent = "Completed. Click any cell to inspect formulas.";
});

runChoreography();
