function syncCommunityStats(winner, loser) {
  if (!window.db || !window.firestoreReady) return Promise.resolve();

  const db = window.db;
  const batch = db.batch();

  const winnerRef = db.collection("communityCharacterStats").doc(String(winner.id));
  const loserRef = db.collection("communityCharacterStats").doc(String(loser.id));

  batch.set(winnerRef, {
    id: String(winner.id),
    name: winner.name,
    wins: firebase.firestore.FieldValue.increment(1),
    losses: firebase.firestore.FieldValue.increment(0),
    fights: firebase.firestore.FieldValue.increment(1),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  batch.set(loserRef, {
    id: String(loser.id),
    name: loser.name,
    wins: firebase.firestore.FieldValue.increment(0),
    losses: firebase.firestore.FieldValue.increment(1),
    fights: firebase.firestore.FieldValue.increment(1),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  return batch.commit().catch(() => {});
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
  syncCommunityStats(winner, loser);
}
