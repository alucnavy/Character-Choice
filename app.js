
let IMAGE_CATALOG = {};
const STORAGE_KEY = "characterChoiceV35";
const BEST_KEY = "characterChoiceV35Best";
const BEST_HOLDER_KEY = "characterChoiceV35BestHolder";

const $ = id => document.getElementById(id);
const state = loadState();

function getImageCandidates(character) {
  const rawName = String(character?.name || "").trim();
  const id = String(character?.id ?? "").trim();

  const normalize = (value) => value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();

  const variants = [
    rawName,
    rawName.replace(/[-–—]/g, " "),
    rawName.replace(/\([^)]*\)/g, "").trim()
  ];

  const slugs = [...new Set(variants.map(normalize).filter(Boolean))];
  const candidates = [];

  for (const slug of slugs) candidates.push(`images/${id}_${slug}.jpg`);
  for (const slug of slugs) candidates.push(`images/${slug}.jpg`);

  return [...new Set(candidates)];
}

function getImagePath(character) {
  return getImageCandidates(character)[0] || "";
}


function loadCharacterImage(img, character) {
  const candidates = getImageCandidates(character);
  let index = 0;

  const tryNext = () => {
    if (index >= candidates.length) {
      img.removeAttribute("src");
      img.alt = `Visuel introuvable pour ${character?.name || "ce personnage"}`;
      const parent = img.parentElement;
      if (parent) {
        parent.classList.add("image-missing");
        parent.setAttribute("data-image-status", "missing");
      }
      return;
    }

    const candidate = candidates[index++];
    img.onerror = tryNext;
    img.onload = () => {
      const parent = img.parentElement;
      if (parent) {
        parent.classList.remove("image-missing");
        parent.classList.add("image-found");
        parent.setAttribute("data-image-status", "found");
      }
    };
    img.src = candidate;
  };

  tryNext();
}


function slug(text) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
}

function initials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0,2).map(x => x[0]).join("").toUpperCase();
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  localStorage.setItem(BEST_KEY, String(state.bestRecord || 0));
  localStorage.setItem(BEST_HOLDER_KEY, state.bestRecordHolder || "");
}

function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (raw && raw.championId && raw.challengerId && Array.isArray(raw.usedIds)) {
      if (!Object.prototype.hasOwnProperty.call(raw, "lastSnapshot")) raw.lastSnapshot = null;
      if (!Array.isArray(raw.history)) raw.history = [];
      if (!Number.isFinite(Number(raw.bestRecord))) raw.bestRecord = 0;
      if (typeof raw.bestRecordHolder !== "string") raw.bestRecordHolder = "";
      return raw;
    }
  } catch(e) {}
  return createNewState();
}

function createNewState() {
  const ids = CHARACTERS.map(c => c.id);
  const championId = ids[Math.floor(Math.random()*ids.length)];
  const usedIds = [championId];
  let challengerId = pickUnused(usedIds);
  return {
    combat: 1,
    streak: 0,
    bestRecord: Number(localStorage.getItem(BEST_KEY) || 0),
    bestRecordHolder: localStorage.getItem(BEST_HOLDER_KEY) || "",
    championId,
    challengerId,
    usedIds,
    history: [],
    lastSnapshot: null
  };
}

function pickUnused(usedIds) {
  const available = CHARACTERS.filter(c => !usedIds.includes(c.id));
  if (!available.length) return null;
  return available[Math.floor(Math.random()*available.length)].id;
}

function getChar(id) { return CHARACTERS.find(c => c.id === id); }

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}

function getBestRecordFromHistory() {
  let best = 0, holder = "";
  let current = 0, previousWinner = null;
  for (const h of (Array.isArray(state.history) ? state.history : [])) {
    const winner = h && h.winner ? String(h.winner) : "";
    if (winner && winner === previousWinner) current += 1;
    else current = winner ? 1 : 0;
    if (current > best) {
      best = current;
      holder = winner;
    }
    previousWinner = winner || null;
  }
  return {best, holder};
}

function syncBestRecord() {
  const derived = getBestRecordFromHistory();
  const storedBest = Number(state.bestRecord || 0);
  if (derived.best > storedBest) {
    state.bestRecord = derived.best;
    state.bestRecordHolder = derived.holder;
  } else if (!state.bestRecordHolder && storedBest > 0) {
    state.bestRecordHolder = derived.holder || "";
  }
}

function updateStats() {
  syncBestRecord();

  const setText = (id, value) => {
    const el = $(id);
    if (el) el.textContent = String(value);
  };

  setText("combatNumber", state.combat);
  setText("streak", state.streak);
  setText("bestRecord", `${state.bestRecord} ${state.bestRecord === 1 ? "VICTOIRE" : "VICTOIRES"}`);
  setText("bestRecordHolderInline", state.bestRecordHolder || "—");

  // Partie actuelle : toujours calculée directement depuis l'état courant.
  setText("used", state.usedIds.length);
  setText("played", state.history.length);
  setText("pool", CHARACTERS.length);
  setText("remaining", Math.max(0, CHARACTERS.length - state.usedIds.length));

  const progress = CHARACTERS.length
    ? Math.min(100, Math.round((state.usedIds.length / CHARACTERS.length) * 100))
    : 0;
  setText("progressPercent", `${progress}%`);
  const bar = $("progressBar");
  if (bar) bar.style.width = `${progress}%`;

  const undo = $("undoBtn");
  if (undo) undo.disabled = !state.lastSnapshot;
}

async function loadPortrait(character, el) {
  el.className = "portrait loading";
  el.innerHTML = "<span>Chargement du visuel…</span>";
  el.dataset.characterId = character.id;

  // V4.8 corrigée :
  // les fichiers du dossier images peuvent avoir conservé la casse et les
  // tirets du nom du personnage. On essaie donc plusieurs conventions.
  const raw = String(character.name || "").trim();
  const id = String(character.id || "").trim();

  const stripAccents = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const noApostrophe = (s) => s.replace(/['’]/g, "");
  const clean = (s) => noApostrophe(stripAccents(s));

  const variants = [
    raw,
    clean(raw),
    raw.replace(/[-–—]/g, "_"),
    clean(raw).replace(/[-–—]/g, "_"),
    raw.replace(/\s+/g, "_"),
    clean(raw).replace(/\s+/g, "_"),
    raw.replace(/[^A-Za-zÀ-ÿ0-9_-]+/g, "_"),
    clean(raw).replace(/[^A-Za-z0-9_-]+/g, "_")
  ];

  const names = [...new Set(variants.map(v => v.replace(/^_+|_+$/g, "")).filter(Boolean))];

  const candidates = [];
  for (const name of names) {
    for (const ext of [".jpg", ".jpeg", ".JPG", ".JPEG"]) {
      candidates.push(`images/${id}_${name}${ext}`);
    }
  }

  // Dernier filet : certains fichiers peuvent avoir été enregistrés sans ID.
  for (const name of names) {
    for (const ext of [".jpg", ".jpeg", ".JPG", ".JPEG"]) {
      candidates.push(`images/${name}${ext}`);
    }
  }

  const uniqueCandidates = [...new Set(candidates)];

  const tryCandidate = (index) => {
    if (index >= uniqueCandidates.length) {
      el.className = "portrait unavailable";
      el.innerHTML = `<span>Visuel introuvable pour ${character.name}</span>`;
      return;
    }

    const src = uniqueCandidates[index];
    const img = new Image();
    img.alt = character.name;
    img.loading = "eager";
    img.decoding = "async";

    img.onload = () => {
      if ((img.naturalWidth || 0) < 150 || (img.naturalHeight || 0) < 150) {
        tryCandidate(index + 1);
        return;
      }
      setImage(el, src, character, () => tryCandidate(index + 1), "catalogue local /images");
    };

    img.onerror = () => tryCandidate(index + 1);
    img.src = src;
  };

  tryCandidate(0);
}
function setImage(el, src, character, onError, source = "") {
  el.className = "portrait";
  el.innerHTML = "";
  const img = document.createElement("img");
  img.alt = character.name;
  img.loading = "eager";
  img.decoding = "async";
  img.referrerPolicy = "no-referrer";
  img.src = src;
  img.title = `${character.name} — visuel externe. Droits © à leurs créateurs / ayants droit. Source : ${source}`;
  img.onerror = () => {
    localStorage.removeItem("ccimg-v35:" + character.id);
    if (onError) onError();
    else el.innerHTML = "<span>Visuel indisponible</span>";
  };
  el.appendChild(img);
}

function renderCard(prefix, character) {
  $(prefix+"Name").textContent = character.name;
  $(prefix+"Universe").textContent = character.universe;
  $(prefix+"Media").textContent = character.media;
  const p = $(prefix+"Portrait");
  p.dataset.characterId = character.id;
  loadPortrait(character, p);
}

function render() {
  const champ = getChar(state.championId);
  const challenger = getChar(state.challengerId);
  if (!champ || !challenger) return;
  renderCard("champion", champ);
  renderCard("challenger", challenger);
  $("championStreak").textContent = state.streak;
  updateStats();
}

function choose(winnerId) {
  const champ = getChar(state.championId);
  const challenger = getChar(state.challengerId);
  const winner = getChar(winnerId);
  if (!champ || !challenger || !winner) return;

  state.lastSnapshot = JSON.parse(JSON.stringify({
    combat: state.combat,
    streak: state.streak,
    championId: state.championId,
    challengerId: state.challengerId,
    usedIds: state.usedIds,
    history: state.history,
    bestRecord: state.bestRecord,
    bestRecordHolder: state.bestRecordHolder
  }));

  state.history.push({
    combat: state.combat,
    championBefore: champ.name,
    challenger: challenger.name,
    universe: winner.universe,
    media: winner.media,
    winner: winner.name
  });

  if (winnerId === state.championId) {
    state.streak += 1;
  } else {
    state.championId = winnerId;
    state.streak = 1;
  }

  if (state.streak > state.bestRecord) {
    state.bestRecord = state.streak;
    state.bestRecordHolder = winner.name;
  }

  if (state.usedIds.length >= CHARACTERS.length) {
    state.challengerId = null;
    save();
    render();
    toast("🎉 Le pool entier a été parcouru !");
    return;
  }

  state.combat += 1;
  state.challengerId = pickUnused(state.usedIds);
  if (state.challengerId) state.usedIds.push(state.challengerId);

  syncBestRecord();
  save();
  render();
  updateStats();
  flashWinner(winnerId === champ.id ? "championCard" : "challengerCard");
}

function renderHistory() {
  const box = $("historyList");
  const query = ($("historySearch")?.value || "").trim().toLowerCase();
  if (!state.history.length) {
    box.innerHTML = '<div class="history-row"><span>—</span><span>Aucun combat enregistré.</span></div>';
    return;
  }
  const filtered = [...state.history].reverse().filter(h => {
    if (!query) return true;
    return [h.championBefore, h.challenger, h.winner, h.universe, h.media].some(v => String(v).toLowerCase().includes(query));
  });
  if (!filtered.length) {
    box.innerHTML = '<div class="history-row"><span>—</span><span>Aucun résultat.</span></div>';
    return;
  }
  box.innerHTML = filtered.map(h => `
    <div class="history-row">
      <div>#${h.combat}</div>
      <div><span>Champion :</span> ${escapeHtml(h.championBefore)}</div>
      <div><span>Challenger :</span> ${escapeHtml(h.challenger)}</div>
      <div class="winner">🏆 ${escapeHtml(h.winner)}</div>
    </div>
  `).join("");
}

function exportCSV() {
  const rows = [["Combat","Champion avant","Adversaire","Univers","Média","Gagnant"], ...state.history.map(h => [h.combat,h.championBefore,h.challenger,h.universe,h.media,h.winner])];
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(";")).join("\n");
  const blob = new Blob(["\ufeff"+csv], {type:"text/csv;charset=utf-8"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `character-choice-historique-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function toast(message) {
  const el = $("toast");
  el.textContent = message;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 1800);
}

$("undoBtn").addEventListener("click", () => {
  if (!state.lastSnapshot) return;
  const snap = state.lastSnapshot;
  state.combat = snap.combat;
  state.streak = snap.streak;
  state.championId = snap.championId;
  state.challengerId = snap.challengerId;
  state.usedIds = snap.usedIds;
  state.history = snap.history;
  state.bestRecord = snap.bestRecord;
  state.bestRecordHolder = snap.bestRecordHolder;
  state.lastSnapshot = null;
  save();
  render();
  toast("↩️ Dernier combat annulé");
});

function flashWinner(cardId) {
  const el = $(cardId);
  el.classList.remove("winner-flash");
  void el.offsetWidth;
  el.classList.add("winner-flash");
  setTimeout(() => el.classList.remove("winner-flash"), 500);
}

$("chooseChampion").addEventListener("click", e => { e.stopPropagation(); choose(state.championId); });
$("chooseChallenger").addEventListener("click", e => { e.stopPropagation(); choose(state.challengerId); });
$("championCard").addEventListener("click", () => choose(state.championId));
$("challengerCard").addEventListener("click", () => choose(state.challengerId));
$("exportBtn").addEventListener("click", exportCSV);
$("resetBtn").addEventListener("click", () => {
  if (confirm("Commencer un nouveau tournoi ? Le record absolu du joueur sera conservé.")) {
    const best = Number(localStorage.getItem(BEST_KEY) || state.bestRecord || 0);
    const holder = localStorage.getItem(BEST_HOLDER_KEY) || state.bestRecordHolder || "";
    Object.assign(state, createNewState(), {bestRecord: best, bestRecordHolder: holder, lastSnapshot: null});
    save();
    fetch("images.json").then(r => r.ok ? r.json() : {}).then(data => { IMAGE_CATALOG = data || {}; render(); }).catch(() => render());
    toast("🔄 Nouveau tournoi lancé !");
  }
});

fetch("images.json").then(r => r.ok ? r.json() : {}).then(data => { IMAGE_CATALOG = data || {}; render(); }).catch(() => render());
