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
