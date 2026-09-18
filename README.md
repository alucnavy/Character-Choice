# Character Choice V3.3

Version orientée **images ciblées** : le jeu n'utilise plus Wikipedia comme moteur d'image automatique.

- chaque personnage peut avoir une URL d'image explicitement validée dans `images.json` ;
- quand une image n'est pas encore validée, l'application n'affiche pas une image aléatoire ou un cosplay : elle affiche un placeholder propre et un bouton de recherche Google Images ciblé ;
- les cartes utilisent un ratio portrait uniforme (4:5) et `object-fit: cover` ;
- le record absolu du joueur et son détenteur sont conservés ;
- l'anti-doublon des personnages reste actif.

### Images
Les deux fiches qui avaient posé problème dans la capture ont été traitées avec des recherches ciblées :
- Bucky Barnes → fiche Marvel ;
- Übel → visuel de personnage ciblé pour Frieren.

Pour une publication publique, vérifie les droits d'utilisation des visuels que tu ajoutes au catalogue.


### Images
La V3.3.1 réactive le chargement automatique des portraits via les pages exactes MediaWiki/Wikipedia lorsque le catalogue ne contient pas encore une image validée. Les anciennes images mises en cache par V3.2 sont également réutilisées. Le bouton « Chercher l’image » reste disponible pour une recherche Google Images ciblée.


## V3.5 — résolution d'images
Les images sont recherchées automatiquement par personnage. Priorité : item Wikidata du personnage + image P18, puis page Wikipédia exacte, puis recherche Wikipédia/Commons strictement filtrée sur le nom du personnage. Aucun bouton de recherche manuelle. Les visuels restent la propriété de leurs créateurs/ayants droit.


### V3.7
- En-tête du tournoi réellement fixe au défilement.
- Portraits affichés sans recadrage CSS forcé (`object-fit: contain`) pour préserver l'image entière fournie dans le catalogue local.
- Aucun changement au système de correspondance des images locales.


V4.9 : nouvelle bannière de titre visuelle, plus moderne et compacte. Fonctionnalités et dossier images conservés.


## V5.6 — Ajouter un personnage

Le catalogue est séparé dans `characters.js`. Pour un nouvel ajout, il suffit de modifier ce fichier puis d'ajouter l'image dans `images/`.

### Fiche à ajouter

```js
{ name: "Nom du personnage", universe: "Nom de l’œuvre", media: "Films", id: "c377", wiki: "Nom du personnage" }
```

- Utilisez le prochain ID disponible (`c377`, puis `c378`, etc.).
- `media` peut être `Films`, `Séries`, `Manga / Anime`, `Comics`, `Romans / Littérature` ou `Dessin animé / Animation`.
- L'image doit reprendre l'ID et le nom : `images/c377_Nom_du_personnage.jpg`.
- Aucun changement dans `app.js` n'est nécessaire.
- L'anti-doublon, l'historique et les statistiques utilisent automatiquement le catalogue.
