# ERASMUS confirmation de présence

[English](README.md)

Outil en ligne pour générer des confirmations de présence de Blended Intensive Programmes (BIP) ou d’ateliers Erasmus sans BIP. Les fichiers Word illisibles ne sont pas une option.

L’outil tient en deux pages. L’héberger sur un serveur (`https://`). L’envoi d’un logo ne fonctionne pas en `file://`.

## Langue

Le HTML est en anglais. Une couche française s’applique quand la langue active est le français.

1. Dans `js/langue.js`, `FORCE_LANG` : `"en"` ou `"fr"` l’emporte. Vide : le navigateur décide.
2. Sinon `?lang=en` ou `?lang=fr` force cette visite seulement. Rien n’est mémorisé. Les autres visiteurs ne changent pas.
3. Sinon un navigateur dont la langue commence par `fr` ouvre l’interface française. Tout le reste reste en anglais.

`document.documentElement.lang` et les champs `type="date"` suivent la langue active.

## Anglais (défaut)

Le certificat est en anglais seulement : une page A4 par personne. Le pied de page est une seule ligne : stamp and signature. Police : **Source Sans 3**, ligne de base 1,375 rem (labeur 1 rem / 1,375 rem, titre 2 rem / 2,75 rem, nom 3 rem / 4,125 rem). Ni code Erasmus, ni OID, ni responsable légal à l’écran ou sur la page. La langue de l’interface fixe police et grille de tous les A4.

## Français

Les mêmes adresses (`index.html`, `config.html`, `certificat.html`). Deux pages A4 par personne, recto anglais puis verso français. Le titre du verso est **pour conformité**. Pas de ligne « cachet et signature » sur le verso. Les deux pages utilisent **Marianne** et la grille internat 1,5 rem (labeur 1 rem / 1,5 rem, titre 2 rem / 3 rem, nom 3 rem / 4,5 rem). La ligne « stamp and signature » reste sur le recto anglais seulement. Signataire et codes, s’ils sont remplis, s’impriment sur les deux pages.

Le bloc établissement ajoute un seul nom de signataire, les fonctions du responsable légal (français avec article, anglais sans), un interrupteur « signature par délégation », et un code Erasmus / OID facultatifs (annexe KA131). Les codes vides sont omis du JSON et de la page. Les codes imprimés sont en italique, comme « stamp and signature ».

Délégation décochée : `Camille Martin, director of …` / `Camille Martin, directrice du …`. Délégation cochée : `For the director and by delegation, Alex Martin` / `Pour la directrice et par délégation, Alex Martin`. Le nom imprimé est toujours celui du champ signataire.

## Configuration (`config.html`)

La première fois, renseigner le logo d’État, l’établissement d’accueil, le lieu et son logo. Un emblème d’État est à côté ; par défaut la marque de la République française, remplaçable. Ces chemins sont gardés dans ce navigateur et dans le JSON téléchargé.

Coller ensuite la liste des personnes (étudiants et enseignants accompagnateurs), avec établissement d’envoi et pays facultatifs. Un tableau se reconstruit à la saisie. Le rôle (étudiant / enseignant) se règle sur chaque ligne. Les étudiants reçoivent des ECTS ; les enseignants sont enregistrés comme accompagnateurs, sans crédits.

**Configurer** et **Générer** basculent les panneaux. Le bouton de la vue courante est grisé, inactif ; l’autre est l’action. La page s’ouvre sur le formulaire. **Générer** valide, télécharge un JSON horodaté (`version` : `v2`), puis affiche les pages A4 sur la même page. **Configurer** ramène alors le formulaire. **Grille** montre ou cache les filets de ligne de base. L’impression depuis cette vue masque le formulaire et les boutons.

On peut déposer une liste `.txt` ou un JSON déjà exporté sur le champ liste. Le JSON recharge le titre, les dates et les personnes. Les champs établissement déjà saisis restent en place ; les vides prennent la valeur du JSON. Les anciens fichiers internat (`lycee`, `personnes`, `nom`, `prenom`, `proviseur`, `oid`) s’ouvrent encore.

À l’enregistrement, le JSON classe par établissement, enseignants puis étudiants, puis par nom. Les clés vides sont omises, pas écrites comme chaînes vides.

## Certificats (`certificat.html`)

Cette page n’imprime qu’un JSON déjà existant. Elle s’ouvre sur un seul champ : déposer le fichier, ou cliquer pour le choisir. Après un fichier valide, les pages A4 apparaissent en dessous ; le champ reste pour en charger un autre. **Grille** demeure. L’impression masque le champ et le bouton.

Imprimer avec **Commande/Contrôle + P** pour obtenir un PDF, puis faire signer les pages.

Régler le type d’activité (**BIP** ou **Workshop**) ; les ECTS sont ajoutés sur les certificats étudiants (3 ou 1).

La mise en page utilise une grille de ligne de base pour caler le texte. Les filets bleus ne s’impriment pas. L’alignement des bas de ligne suit le travail de [Julie Blanc](https://julie-blanc.fr/) pour [paged.js](https://pagedjs.org/).

L’interface (formulaires, boutons, aide) utilise **Source Sans 3** (variable, version 3.052), SIL Open Font License, fournie dans `fonts/source-sans/`. En anglais, les A4 restent en Source Sans 3. L’interface française passe les A4 en Marianne (`fonts/marianne/`) et la grille internat.

- Déposer des listes ou un JSON déjà exporté sur la page de configuration.
- Trier le tableau à l’écran par pays, établissement, nom ou rôle. Ce tri ne réordonne pas le JSON ; le fichier suit l’ordre d’enregistrement ci-dessus.

Aucune suite bureautique à installer. Formats ouverts.

Vibecodé par [écb](mailto:ecb@dnmd.lv) (avec Grok sur Cursor).
