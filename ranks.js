(() => {
  const CHARACTER_STATS_KEY = "characterChoiceV35CharacterStats";
  const ranks = [
    { min: 101, label: "Immortel du Multivers", className: "rank-immortel" },
    { min: 81, label: "Légende ultime", className: "rank-legende" },
    { min: 66, label: "Maître du Multivers", className: "rank-maitre" },
    { min: 51, label: "Vétéran", className: "rank-veteran" },
    { min: 41, label: "Champion", className: "rank-champion" },
    { min: 26, label: "Élite", className: "rank-elite" },
    { min: 11, label: "Combattant", className: "rank-combattant" },
    { min: 0, label: "Novice", className: "rank-novice" }
  ];

  function getStats() {
    try {
      const stats = JSON.parse(localStorage.getItem(CHARACTER_STATS_KEY) || "{}");
      return stats && typeof stats === "object" ? stats : {};
    } catch (_) {
      return {};
    }
  }

  function updateRank(element) {
    if (!element || element.querySelector(".character-rank")) return;

    const name = element.textContent.trim();
    if (!name || name === "—") return;

    const stats = getStats();
    const record = Object.values(stats).find(item => item && item.name === name);
    const wins = Math.max(0, Number(record?.wins) || 0);
    const rank = ranks.find(item => wins >= item.min);
    if (!rank) return;

    element.textContent = "";
    element.append(document.createTextNode(name));

    const rankNode = document.createElement("span");
    rankNode.className = `character-rank ${rank.className}`;
    rankNode.textContent = `— ${rank.label}`;
    rankNode.title = `${wins} victoire${wins === 1 ? "" : "s"}`;
    element.appendChild(rankNode);
  }

  function updateRanks() {
    updateRank(document.getElementById("championName"));
    updateRank(document.getElementById("challengerName"));
  }

  const observer = new MutationObserver(updateRanks);
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  updateRanks();
})();
