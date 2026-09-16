# Character Choice — V3

Version du tournoi avec :
- 376 personnages dans le pool V3 après exclusion des personnages déjà connus dans le tournoi précédent ;
- anti-doublon par partie ;
- champion permanent et challenger inédit ;
- record absolu du joueur conservé entre les parties ;
- historique + export CSV ;
- portraits chargés dynamiquement depuis Wikipédia/Wikimedia Commons ;
- fallback visuel si aucune image n'est disponible ;
- GitHub Pages compatible.

## Déploiement
Placer `index.html`, `style.css`, `app.js` et `.nojekyll` à la racine du dépôt, puis utiliser GitHub Pages sur `main / (root)`.

Les images sont récupérées à l'exécution depuis Wikipédia. Leur disponibilité dépend de Wikipédia et de la présence d'une image pour le personnage.
