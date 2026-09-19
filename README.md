# ⚔️ Character Choice — Ultimate Multiverse Battle

Character Choice est un jeu de duel basé sur un principe simple :

> **Deux personnages s'affrontent. Lequel préférez-vous ?**

À chaque combat, deux personnages sont présentés et le joueur doit choisir son favori. Le personnage sélectionné devient alors le **champion** et continue son parcours face à de nouveaux adversaires.

Le jeu rassemble des personnages issus de nombreux univers : films, séries, jeux vidéo, animation, anime, littérature et bien plus encore.
De nouveaux personnages sont ajoutés régulièrement : Dernier ajout 19/09/26 -> Booster "Ultimate Villains" x16

---

## 🎮 Fonctionnalités

### ⚔️ Système de duel

- Deux personnages s'affrontent à chaque tour.
- Le joueur choisit son personnage préféré.
- Le personnage choisi devient le champion.
- Un nouveau challenger est ensuite présenté.
- Les personnages déjà rencontrés sont gérés automatiquement afin d'éviter les doublons inutiles.

### 🏆 Système de tournoi

Le jeu conserve différentes informations au cours d'un tournoi :

- Nombre de combats joués
- Série de victoires actuelle
- Meilleure série
- Record absolu
- Nombre de personnages rencontrés
- Nombre de champions différents
- Progression du tournoi

---

## 📊 Statistiques

Character Choice possède un système de statistiques permettant de suivre l'évolution des parties.

### Statistiques de tournoi

Les statistiques liées aux parties permettent notamment de suivre :

- Les combats joués
- La série actuelle
- La meilleure série
- Le record absolu
- Les personnages rencontrés
- Les différents médias représentés

### ⚔️ Statistiques par personnage

Chaque personnage possède également ses propres statistiques permanentes :

| Personnage | Victoires | Défaites |
|------------|-----------|----------|
| Batman | 8 | 3 |
| Spider-Man | 5 | 4 |
| Mario | 3 | 6 |

Les victoires et défaites des personnages sont conservées indépendamment des tournois.

Il est donc possible de commencer un nouveau tournoi sans perdre les statistiques accumulées par les personnages.

---

## 🗑️ Réinitialisation

Les statistiques par personnage peuvent être réinitialisées grâce au bouton :

**Réinitialiser les statistiques des personnages**

Cette action remet uniquement les compteurs de victoires et de défaites des personnages à zéro.

Les autres données du jeu ne sont pas affectées.

---

## 📚 Base de personnages

Le jeu contient actuellement **400 personnages** provenant de différents univers.

Chaque personnage possède notamment :

- Un identifiant unique
- Un nom
- Une image
- Un média ou univers associé
- Ses statistiques de victoires
- Ses statistiques de défaites

La liste des personnages est centralisée dans :

```text
characters.js

