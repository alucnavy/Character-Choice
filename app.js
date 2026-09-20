
let IMAGE_CATALOG = {};
const STORAGE_KEY = "characterChoiceV35";
const BEST_KEY = "characterChoiceV35Best";
const BEST_HOLDER_KEY = "characterChoiceV35BestHolder";
const BEST_RESET_KEY = "characterChoiceV35BestReset";
const CHARACTER_STATS_KEY = "characterChoiceV35CharacterStats";

const $ = id => document.getElementById(id);
const state = loadState();
let combatAnimating = false;

function getImageCandidates(character) {
  const raw = String(character?.name || "").trim();
  const id = String(character?.id ?? "").trim();

  const stripAccents = (value) => String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const clean = (value) => stripAccents(value).replace(/[\'’]/g, "");
  const normalize = (value) => clean(value)
    .replace(/&/g, "and")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();

  // Nouveau système : images nommées uniquement avec l'ID.
  // Exemple : images/c417.jpg
  const candidates = [];
  if (id) {
    for (const ext of [".jpg", ".jpeg", ".JPG", ".JPEG"]) {
      candidates.push(`images/${id}${ext}`);
    }
  }

  // Ancien système conservé intégralement : casse, espaces, underscores,
  // accents et variantes historiques des noms de fichiers.
  const variants = [
    raw,
    clean(raw),
    raw.replace(/[-–—]/g, "_"),
    clean(raw).replace(/[-–—]/g, "_"),
    raw.replace(/[-–—]/g, " "),
    clean(raw).replace(/[-–—]/g, " "),
    raw.replace(/\s+/g, "_"),
    clean(raw).replace(/\s+/g, "_"),
    raw.replace(/[^A-Za-zÀ-ÿ0-9_-]+/g, "_"),
    clean(raw).replace(/[^A-Za-z0-9_-]+/g, "_"),
    raw.replace(/[^A-Za-zÀ-ÿ0-9_-]+/g, " "),
    clean(raw).replace(/[^A-Za-z0-9_-]+/g, " ")
  ];

  const names = [...new Set(variants
    .map(v => v.replace(/^_+|_+$/g, "").trim())
    .filter(Boolean))];

  if (id) {
    for (const name of names) {
      for (const ext of [".jpg", ".jpeg", ".JPG", ".JPEG"]) {
        candidates.push(`images/${id}_${name}${ext}`);
      }
    }
  }

  // Compatibilité avec les anciens fichiers sans ID.
  for (const name of names) {
    for (const ext of [".jpg", ".jpeg", ".JPG", ".JPEG"]) {
      candidates.push(`images/${name}${ext}`);
    }
  }

  // Variante minuscule pour les fichiers comme c404_voldemort.jpg.
  for (const name of names) {
    const lower = name.toLowerCase();
    for (const ext of [".jpg", ".jpeg", ".JPG", ".JPEG"]) {
      if (id) candidates.push(`images/${id}_${lower}${ext}`);
      candidates.push(`images/${lower}${ext}`);
    }
  }

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

function loadCharacterStats() {
  try {
    const raw = JSON.parse(localStorage.getItem(CHARACTER_STATS_KEY) || "{}");
    return raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  } catch (e) {
    return {};
  }
}

let characterStats = loadCharacterStats();

function saveCharacterStats() {
  localStorage.setItem(CHARACTER_STATS_KEY, JSON.stringify(characterStats));
}

function updateCharacterStats(winner, loser) {
  if (!winner || !loser) return;

  const ensure = (character) => {
    const id = String(character.id);
    if (!characterStats[id] || typeof characterStats[id] !== "object") {
      characterStats[id] = { name: character.name, wins: 0, losses: 0 };
    }
    characterStats[id].name = character.name;
    characterStats[id].wins = Math.max(0, Number(characterStats[id].wins) || 0);
    characterStats[id].losses = Math.max(0, Number(characterStats[id].losses) || 0);
    return characterStats[id];
  };

  ensure(winner).wins += 1;
  ensure(loser).losses += 1;
  saveCharacterStats();
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
  if (localStorage.getItem(BEST_RESET_KEY) === "1") return;
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

  const candidates = getImageCandidates(character);
  const tryCandidate = (index) => {
    if (index >= candidates.length) {
      el.className = "portrait unavailable";
      el.innerHTML = `<span>Visuel introuvable pour ${character.name}</span>`;
      return;
    }

    const src = candidates[index];
    const img = new Image();
    img.alt = character.name;
    img.loading = "eager";
    img.decoding = "async";
    img.onload = () => setImage(el, src, character, () => tryCandidate(index + 1), "catalogue local /images");
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

async function choose(winnerId) {
  if (combatAnimating) return;
  const champ = getChar(state.championId);
  const challenger = getChar(state.challengerId);
  const winner = getChar(winnerId);
  if (!champ || !challenger || !winner) return;

  combatAnimating = true;
  const winnerCardId = winnerId === state.championId ? "championCard" : "challengerCard";
  const loserCardId = winnerId === state.championId ? "challengerCard" : "championCard";
  const winnerCard = $(winnerCardId);
  const loserCard = $(loserCardId);
  clearCombatAnimationClasses();
  document.body.classList.add("combat-in-progress");
  winnerCard?.classList.add("combat-winner");
  loserCard?.classList.add("combat-loser");
  await wait(220);

  state.lastSnapshot = JSON.parse(JSON.stringify({combat:state.combat,streak:state.streak,championId:state.championId,challengerId:state.challengerId,usedIds:state.usedIds,history:state.history,bestRecord:state.bestRecord,bestRecordHolder:state.bestRecordHolder,characterStats:JSON.parse(JSON.stringify(characterStats))}));
  const loser = winnerId === state.championId ? challenger : champ;
  state.history.push({combat:state.combat,championBefore:champ.name,challenger:challenger.name,universe:winner.universe,media:winner.media,winner:winner.name});
  updateCharacterStats(winner, loser);

  if (winnerId === state.championId) state.streak += 1;
  else { state.championId = winnerId; state.streak = 1; }
  if (state.streak > state.bestRecord) {
    state.bestRecord = state.streak;
    state.bestRecordHolder = winner.name;
    localStorage.removeItem(BEST_RESET_KEY);
  }

  if (state.usedIds.length >= CHARACTERS.length) {
    state.challengerId = null; save(); document.body.classList.remove("combat-in-progress"); clearCombatAnimationClasses(); render(); updateStats(); combatAnimating=false; toast("🎉 Le pool entier a été parcouru !"); return;
  }

  state.combat += 1;
  const nextChallengerId = pickUnused(state.usedIds);
  state.challengerId = nextChallengerId || null;
  if (nextChallengerId) state.usedIds.push(nextChallengerId);
  syncBestRecord(); save();

  document.body.classList.remove("combat-in-progress");
  clearCombatAnimationClasses();
  render(); updateStats();
  const newChampionCard = $("championCard");
  newChampionCard?.classList.add("champion-arrival");
  setTimeout(() => newChampionCard?.classList.remove("champion-arrival"), 420);
  combatAnimating = false;
}

function clearCombatAnimationClasses() {
  $("championCard")?.classList.remove("combat-winner", "combat-loser", "champion-arrival");
  $("challengerCard")?.classList.remove("combat-winner", "combat-loser", "champion-arrival");
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
  if (snap.characterStats && typeof snap.characterStats === "object") {
    characterStats = snap.characterStats;
    saveCharacterStats();
  }
  state.lastSnapshot = null;
  save();
  render();
  toast("↩️ Dernier combat annulé");
});

function flashWinner(cardId) {
  const el = $(cardId);
  if (!el) return;
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
    render();
    updateStats();
    toast("🔄 Nouveau tournoi lancé !");
  }
});

const resetBestRecordBtn = $("resetBestRecordBtn");
if (resetBestRecordBtn) {
  resetBestRecordBtn.addEventListener("click", () => {
    if (!confirm("Remettre le record absolu à zéro ? L’historique et le tournoi actuel seront conservés.")) return;
    state.bestRecord = 0;
    state.bestRecordHolder = "";
    localStorage.setItem(BEST_RESET_KEY, "1");
    save();
    updateStats();
    toast("🏆 Record absolu remis à zéro");
  });
}

// Affiche immédiatement le premier combat au chargement de la page.
render();
