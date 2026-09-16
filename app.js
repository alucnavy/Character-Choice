const CHARACTERS = [
  ["Louise Banks","Premier Contact","Film"],
  ["Lyra Belacqua","À la croisée des mondes","Roman / série"],
  ["Donna Noble","Doctor Who","Série"],
  ["Clara Oswald","Doctor Who","Série"],
  ["Rose Tyler","Doctor Who","Série"],
  ["Seven of Nine","Star Trek: Voyager","Série"],
  ["Kathryn Janeway","Star Trek: Voyager","Série"],
  ["Kira Nerys","Star Trek: Deep Space Nine","Série"],
  ["Faith Lehane","Buffy contre les vampires","Série"],
  ["Cordelia Chase","Buffy / Angel","Série"],
  ["Nancy Downs","The Craft","Film"],
  ["Bonnie Bennett","The Vampire Diaries","Série"],
  ["Caroline Forbes","The Vampire Diaries","Série"],
  ["Eve Polastri","Killing Eve","Série"],
  ["Claire Underwood","House of Cards","Série"],
  ["Leslie Knope","Parks and Recreation","Série"],
  ["Peggy Olson","Mad Men","Série"],
  ["Joan Holloway","Mad Men","Série"],
  ["Daria Morgendorffer","Daria","Dessin animé"],
  ["Diane Nguyen","BoJack Horseman","Dessin animé"],
  ["Shego","Kim Possible","Dessin animé"],
  ["Toph Beifong","Avatar : Le dernier maître de l'air","Dessin animé"],
  ["Princess Bubblegum","Adventure Time","Dessin animé"],
  ["Garnet","Steven Universe","Dessin animé"],
  ["Pearl","Steven Universe","Dessin animé"],
  ["Adora","She-Ra","Dessin animé"],
  ["Catra","She-Ra","Dessin animé"],
  ["Velma","Scooby-Doo","Dessin animé"],
  ["Daphne Blake","Scooby-Doo","Dessin animé"],
  ["Jessica Rabbit","Qui veut la peau de Roger Rabbit ?","Film"],
  ["Belle","La Belle et la Bête","Film / animation"],
  ["Tiana","La Princesse et la Grenouille","Film / animation"],
  ["Rapunzel","Raiponce","Film / animation"],
  ["Elsa","La Reine des neiges","Film / animation"],
  ["Anna","La Reine des neiges","Film / animation"],
  ["Arwen","Le Seigneur des anneaux","Roman / film"],
  ["Ygritte","Game of Thrones","Série"],
  ["Yara Greyjoy","Game of Thrones","Série"],
  ["Astrid","Dragons","Film / animation"],
  ["Kida","Atlantide, l'empire perdu","Film / animation"],
  ["Lucy Pevensie","Le Monde de Narnia","Roman / film"],
  ["Susan Pevensie","Le Monde de Narnia","Roman / film"],
  ["Mabel Pines","Gravity Falls","Dessin animé"],
  ["Jane Eyre","Jane Eyre","Roman"],
  ["Elizabeth Bennet","Orgueil et Préjugés","Roman / film"],
  ["Fantine","Les Misérables","Roman"],
  ["June Osborne","The Handmaid's Tale","Roman / série"],
  ["Lorelai Gilmore","Gilmore Girls","Série"],
  ["Rory Gilmore","Gilmore Girls","Série"],
  ["Sarah Jane Smith","Doctor Who","Série"],
  ["Amy Wong","Futurama","Dessin animé"],
  ["April Ludgate","Parks and Recreation","Série"],
  ["Liz Lemon","30 Rock","Série"],
  ["Jessica Drew","Marvel","Comics"],
  ["Kate Bishop","Marvel","Comics / série"],
  ["Kamala Khan","Marvel","Comics / série"],
  ["Rogue","Marvel","Comics"],
  ["Storm","Marvel","Comics"],
  ["Zatanna","DC","Comics"],
  ["Black Canary","DC","Comics"],
  ["Lois Lane","DC","Comics"],
  ["Barbara Gordon","DC","Comics"],
  ["Mera","DC","Comics"],
  ["Starfire","DC","Comics"],
  ["She-Hulk","Marvel","Comics / série"],
  ["Aeon Flux","Æon Flux","Animation"],
  ["Gwen Tennyson","Ben 10","Dessin animé"],
  ["Mai","Avatar : Le dernier maître de l'air","Dessin animé"],
  ["Ty Lee","Avatar : Le dernier maître de l'air","Dessin animé"]
].map((c,i)=>({id:i+1,name:c[0],universe:c[1],media:c[2]}));

const KEY = "character-choice-v1-corrige";
const RECORD = {wins:97,name:"Death",universe:"The Sandman",media:"Série — Netflix"};

let state = load();

function load(){
  try{
    const saved = JSON.parse(localStorage.getItem(KEY));
    if(saved && saved.champion && Array.isArray(saved.used) && Array.isArray(saved.history)) return saved;
  }catch(e){}
  const first = pickRandom(CHARACTERS);
  return {combat:1, streak:0, champion:first, championWins:0, used:[first.id], history:[]};
}

function save(){ localStorage.setItem(KEY, JSON.stringify(state)); }

function pickRandom(list){
  return list[Math.floor(Math.random()*list.length)];
}

function available(){
  return CHARACTERS.filter(c=>!state.used.includes(c.id));
}

function challenger(){
  const a = available();
  return a.length ? pickRandom(a) : null;
}

function cardHTML(c, side){
  return `
    <div class="card-number">${side==="left" ? "CHAMPION" : "NOUVEAU CHALLENGER"}</div>
    <h3>${escapeHTML(c.name)}</h3>
    <div class="universe">${escapeHTML(c.universe)}</div>
    <span class="media">${escapeHTML(c.media)}</span>
    <button class="choose" data-id="${c.id}">🏆 Je choisis ${escapeHTML(c.name)}</button>
  `;
}

let currentChallenger = null;

function render(){
  currentChallenger = challenger();
  document.getElementById("combatNumber").textContent = state.combat;
  document.getElementById("streak").textContent = state.streak;
  document.getElementById("championName").textContent = state.champion.name;
  document.getElementById("championMeta").textContent = `${state.champion.universe} • ${state.champion.media}`;
  document.getElementById("championWins").textContent = state.championWins;

  document.getElementById("leftCard").innerHTML = cardHTML(state.champion,"left");
  document.getElementById("leftCard").classList.add("champion-side");

  const right = document.getElementById("rightCard");
  if(currentChallenger){
    right.innerHTML = cardHTML(currentChallenger,"right");
  }else{
    right.innerHTML = `<div class="card-number">FIN DU ROSTER</div><h3>🏆 Tu as parcouru tous les personnages</h3><p class="universe">Appuie sur « Recommencer » pour une nouvelle partie.</p>`;
  }
  bindChoices();
  renderHistory();
}

function bindChoices(){
  document.querySelectorAll(".choose").forEach(btn=>{
    btn.addEventListener("click",()=>choose(Number(btn.dataset.id)));
  });
}

function choose(id){
  if(!currentChallenger || id!==state.champion.id && id!==currentChallenger.id) return;
  const winner = id===state.champion.id ? state.champion : currentChallenger;
  const loser = winner.id===state.champion.id ? currentChallenger : state.champion;

  state.history.push({
    combat:state.combat,
    championBefore:state.champion.name,
    challenger:currentChallenger.name,
    universe:currentChallenger.universe,
    media:currentChallenger.media,
    winner:winner.name
  });

  if(winner.id===state.champion.id){
    state.championWins += 1;
    state.streak += 1;
  }else{
    state.champion = winner;
    state.championWins = 1;
    state.streak = 1;
  }

  state.used.push(currentChallenger.id);
  state.combat += 1;
  save();
  render();
  window.scrollTo({top:0,behavior:"smooth"});
}

function renderHistory(){
  const box=document.getElementById("historyRows");
  document.getElementById("historyCount").textContent=`${state.history.length} combat${state.history.length>1?"s":""}`;
  if(!state.history.length){
    box.innerHTML=`<div style="color:#777789;padding:12px 0">Aucun combat terminé.</div>`;
    return;
  }
  box.innerHTML=state.history.slice().reverse().map(r=>`
    <div class="row">
      <div>#${r.combat}</div>
      <div>${escapeHTML(r.championBefore)}</div>
      <div>${escapeHTML(r.challenger)}</div>
      <div class="win">→ ${escapeHTML(r.winner)}</div>
    </div>
  `).join("");
}

function reset(){
  if(!confirm("Recommencer la partie ? L'historique local sera effacé.")) return;
  localStorage.removeItem(KEY);
  state=load();
  render();
}

function exportCSV(){
  const rows=[["Combat","Champion avant","Adversaire","Univers","Média","Gagnant"],...state.history.map(r=>[r.combat,r.championBefore,r.challenger,r.universe,r.media,r.winner])];
  const csv=rows.map(row=>row.map(v=>`"${String(v).replaceAll('"','""')}"`).join(";")).join("\n");
  const blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="historique-character-choice.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

function escapeHTML(s){
  return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}

document.getElementById("resetBtn").addEventListener("click",reset);
document.getElementById("exportBtn").addEventListener("click",exportCSV);
render();
