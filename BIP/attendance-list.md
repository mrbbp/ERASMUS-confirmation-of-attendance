# Attendance list

Plain-text file, UTF-8, one person per line. Drop it on the “List to paste” field of `config.html`, or paste its contents.

Order: **family name, given name, sending institution, country**.

```text
FAMILY NAME given name, Sending institution, COUNTRY
```

Family name and given name sit in the first field. Words entirely in capitals form the family name. The first word that is not all caps opens the given name, including a compound given name. `DE LA FONTAINE Jules` yields family name `DE LA FONTAINE` and given name `Jules`. If no word is in capitals, the first word is the family name. A line entirely in capitals does not split off a given name. Institution and country follow, separated by commas. Country is the ISO code of an Erasmus+ programme country in 2026: the 27 member states, `IS`, `LI`, `NO`, `MK`, `RS`, `TR`. Greece is `GR` or `EL`. The United Kingdom and Switzerland are not yet in the list.

```text
MOREAU Camille, École supérieure d'art et de design de Reims, FR
BERGSTRÖM Linnea, Konstfack — University of Arts, Crafts and Design, SE
```

## Minimum

**Family name and given name are enough.**

```text
ALVES Duarte
```

Institution and country are then empty. A line with an institution but no country is valid:

```text
ALVES Duarte, Faculdade de Belas-Artes da Universidade de Lisboa
```

A single word is read as a family name, with an empty given name. That line is not useful: the certificate prints the given name.

## Role

With no heading, every person is a student.

A line with no comma that contains `teacher`, `enseignant`, `prof` or `professeur` creates nobody. The following lines are teachers, until a `Students` line.

```text
Students
ROSSI Giulia, Accademia di Belle Arti di Brera, IT

Enseignants
VAN DIJK Noor, Gerrit Rietveld Academie, NL
```

`Accompanying teachers`, `Profs` and `Professeurs` have the same effect. Case is ignored.

Empty lines are ignored.
