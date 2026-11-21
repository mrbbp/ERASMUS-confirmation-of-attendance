# Host institution

The host fields are not stored on the server. Each browser keeps them (key `bip-etablissement`). The downloaded JSON carries them. `certificat.html` prints them from that JSON.

The form works over `file://` for these fields. Uploading a logo needs PHP.

## Fields

| Field | Role |
| --- | --- |
| `version` | Always `"v2"` on write. Missing or any other value is an older file: it is read, never rewritten as-is. |
| `host` | Host institution name, printed after “at”. Older files: `lycee`. |
| `city` | City, printed after the host name. Replaces the former hardcoded Rennes. Older files: `ville`. |
| `logo` | Relative path to the institution logo, from the page. Example: `medias/logo_breq.svg` or `logo.php?f=` followed by the random name. No absolute URL, no `..`. Older files: `logoLycee`. |
| `stateLogo` | Relative path to the state emblem. Default: `medias/logo_republique-francaise.svg`. Missing or invalid: the same file. Alt text is “French Republic” for that file, “Logo” for a replacement. |

## French-only keys

These keys appear in the interface only when the active language is French. English mode does not show them, does not require them, and does not write them. A file that already contains them is still read. In `localStorage` (`bip-etablissement`) they are kept if they were entered in French, so an English rewrite of v2 does not erase them.

| Field | Role |
| --- | --- |
| `legalRepresentative` | Signatory’s name, required in French. Printed on both pages, with or without delegation. Older files: `proviseur`. |
| `titreFr` | Legal representative’s function in French, with the article (`la directrice`, `le directeur`). Required in French. Missing at print: `le responsable légal`. The article carries gender; there is no masculine/feminine menu. |
| `titreEn` | Same function in English, without article (`director`, `headteacher`). Required in French. Empty at print: `legal representative`. |
| `delegation` | `true` prints “For the … and by delegation, [name]” / “Pour … et par délégation, [name]”. The switch adds no extra field. `false` or absent: `[name], [title] of [host]`. |
| `codeErasmus` | Optional, KA131 annex. Printed in italic if filled. Empty: omitted from the JSON and from the page. |
| `oid` | Same rule as `codeErasmus`. |

Neither code is `required`. No validation message asks for them. The host summary shows the signatory’s name, then the code or OID only when filled.

## Other JSON keys

| Field | Role |
| --- | --- |
| `title` | Activity title. Older files: `bip` as a string. |
| `bip` | Boolean. `true` prints “Erasmus+ BIP workshop”. `false` prints “Erasmus+ workshop”. Older files: `mentionBip`. |
| `ects` | Number of credits, or `null` / `0` to omit the line. |
| `startDate` / `endDate` / `virtualDate` | Dates as English strings or ISO. Older files: `dateDebut` / `dateFin` / `dateVirtuelle`. The French verso prints a short French date (`1er nov. 2026`). |
| `participants` | Array of people. Older files: `personnes`. |
| `familyName` / `givenName` | Name parts. Older files: `nom` / `prenom`. |
| `sendingInstitution` | Sending institution. Older files: `etablissementEnvoi`. |
| `country` | ISO country code. Older files: `pays`. |
| `role` | `student` or `teacher`. Older files: `etudiant` / `enseignant`. |

Empty keys are omitted on write, not stored as empty strings. `ordreLangues` is ignored.

## Browser memory

Typing or closing the host block saves `host`, `city`, `logo` and `stateLogo` in this browser, with `"version": "v2"`. In French it also saves the French-only keys (codes only if filled). Another machine that opens the same page does not receive them.

On load, if `bip-etablissement` or `bip-nom` is not v2, it is rewritten immediately (new keys, default `stateLogo`). The key `bip-ordre-langues` is deleted, as is `sessionStorage` `bip-certificat-config`.

`config.html?reset` clears this memory. The parameter is then removed from the address. `?lang=` is kept.

A dropped JSON reloads the activity (title, dates, people). It does not replace or empty a host field that already has a value in the form. Empty host fields still take the JSON value, then the block is saved in this browser.

## Uploaded logo

The file is encrypted (AES-256-GCM) then stored in `upload/` under a random name. The returned address, `logo.php?f=…&k=…`, contains the key. It is kept in the JSON and in this browser. Without that key, the file on the server is unreadable. The folder also refuses direct HTTP access on Apache (`upload/.htaccess`). Logos shipped in `medias/` stay public.
