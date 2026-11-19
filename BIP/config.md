# Établissement

Les cinq champs de l’établissement ne sont pas sur le serveur. Chaque navigateur les garde (clé `bip-etablissement`). Le JSON téléchargé les emporte. `certificat.html` les imprime depuis ce JSON.

La page de saisie fonctionne en `file://` pour ces champs. L’envoi d’un logo demande PHP.

## Champs

| Champ | Rôle |
| --- | --- |
| `lycee` | Nom du lycée, imprimé après « at » et « Headmaster of ». |
| `logoLycee` | Chemin relatif du logo, depuis la page. Exemple : `medias/logo.svg` ou `logo.php?f=` suivi du nom aléatoire. Pas d’adresse absolue, pas de `..`. |
| `proviseur` | Nom imprimé avant « Headmaster of ». |
| `codeErasmus` | Texte après « Erasmus code ». Exemple : `F GROLOU43`. |
| `oid` | Texte après « OID ». Exemple : `E1234567`. |

Les cinq champs sont des chaînes. `codeErasmus` et `oid` vides retirent la ligne du certificat.

## Mémoire du navigateur

Saisir ou fermer le bloc établissement enregistre les cinq champs dans ce navigateur. Un autre établissement qui ouvre la même page ne les reçoit pas.

`config.html?reset` efface cette mémoire et le `sessionStorage` (`bip-certificat-config`). Le paramètre est retiré de l’adresse ensuite. `certificat.html?reset` efface seulement le `sessionStorage`.

Un JSON déposé remplace les cinq champs, puis les enregistre dans ce navigateur.

## Logo déposé

Le fichier est chiffré (AES-256-GCM) puis enregistré dans `upload/` sous un nom aléatoire. L’adresse renvoyée, `logo.php?f=…&k=…`, contient la clé. Elle est gardée dans le JSON et dans ce navigateur. Sans cette clé, le fichier sur le serveur est illisible. Le dossier refuse en plus l’accès HTTP direct sur Apache (`upload/.htaccess`). Le logo livré dans `medias/` reste public.
