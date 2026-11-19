# Liste de présence

Fichier texte, UTF-8, une personne par ligne. Le déposer sur le champ « Liste à coller » de `config.html`, ou coller son contenu.

Ordre : **nom, prénom, établissement d’envoi, pays**.

```text
NOM Prénom, Établissement d’envoi, PAYS
```

Le nom et le prénom sont dans le premier champ. Les mots entièrement en capitales forment le nom. Le premier mot qui ne l’est pas ouvre le prénom, y compris un prénom composé. `DE LA FONTAINE Jules` donne le nom `DE LA FONTAINE` et le prénom `Jules`. Si aucun mot n’est en capitales, le premier mot est le nom. Une ligne entièrement en capitales ne sépare pas le prénom. L’établissement et le pays suivent, séparés par des virgules. Le pays est le code ISO d’un pays du programme Erasmus+ en 2026 : les 27 États membres, `IS`, `LI`, `NO`, `MK`, `RS`, `TR`. La Grèce s’écrit `GR` ou `EL`. Le Royaume-Uni et la Suisse ne sont pas encore dans la liste.

```text
KINDBEITER Luce-Elia, Lycée Bréquigny - Rennes, FR
CZUJESZOWA Julia, UWM Olsztyn, PL
```

## Minimum

**Nom et prénom suffisent.**

```text
PELLOIS Tom
```

L’établissement et le pays sont alors vides. Une ligne avec l’établissement mais sans pays est valable :

```text
PELLOIS Tom, Lycée Bréquigny - Rennes
```

Un seul mot est lu comme un nom, avec un prénom vide. Ce n’est pas une ligne utile : le certificat imprime le prénom.

## Rôle

Sans titre, chaque personne est étudiante.

Une ligne sans virgule qui contient `teacher`, `enseignant`, `prof` ou `professeur` ne crée personne. Les lignes suivantes sont des enseignants, jusqu’à une ligne `Students`.

```text
Students
DENOUAL Martin, Lycée Bréquigny - Rennes, FR

Enseignants
PIOTROWICZ Marcin, UWM Olsztyn, PL
```

`Accompanying teachers`, `Profs` et `Professeurs` ont le même effet. La casse est ignorée.

Les lignes vides sont ignorées.
