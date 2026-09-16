# Character Choice — V3.2

Version V3.2 du tournoi.

## Nouveautés
- portraits déterministes : la recherche ne se fait plus par recherche vague ; le site demande l’image principale de la page encyclopédique exacte du personnage, d’abord sur Wikipédia français puis anglais ;
- cache local des portraits déjà chargés ;
- interface nettoyée : les détails techniques sur l’anti-doublon et la récupération des images ne sont plus affichés ;
- anti-doublon conservé en arrière-plan ;
- record absolu du joueur conservé ;
- historique et export CSV conservés.

## Déploiement
Téléverser `index.html`, `style.css`, `app.js`, `.nojekyll` et `README.md` à la racine du dépôt GitHub Pages, puis committer sur `main`.


### V3.2 — catalogue d’images individualisé
Chaque personnage possède une entrée dédiée dans `images.json` avec sa page source et un champ `imageUrl` prévu pour une image validée manuellement. Le jeu ne fait plus de recherche générique par nom. Le record absolu du joueur conserve aussi le nom du personnage détenteur du record.
