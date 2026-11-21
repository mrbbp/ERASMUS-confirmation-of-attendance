# ERASMUS confirmation of attendance

[Français](README.fr.md)

An online tool that generates confirmations of attendance for Blended Intensive Programmes (BIP) or plain Erasmus workshops. Ugly Word files are not an option.

The tool is two pages. Host it on a server (`https://`). The logo upload does not work over `file://`.

## Language

The HTML is English. A French overlay is applied when the active language is French.

1. In `js/langue.js`, `FORCE_LANG`: `"en"` or `"fr"` wins. Empty: the browser decides.
2. Otherwise `?lang=en` or `?lang=fr` forces that visit only. Nothing is stored. Other visitors are unchanged.
3. Otherwise a browser language that starts with `fr` opens the French interface. Everything else stays English.

`document.documentElement.lang` and the `type="date"` fields follow the active language.

## English (default)

The certificate is English only: one A4 page per person. The foot of the page is a single line: stamp and signature. Typeface: **Source Sans 3**, baseline 1.375 rem (body 1 rem / 1.375 rem, title 2 rem / 2.75 rem, name 3 rem / 4.125 rem). No Erasmus code, no OID, no legal representative on screen or on the page. The interface language sets typeface and grid for every A4.

## French

The same addresses (`index.html`, `config.html`, `certificat.html`). Two A4 pages per person, English recto then French verso. The verso title is **pour conformité**. There is no “stamp and signature” line on the verso. Both pages use **Marianne** and internat’s 1.5 rem grid (body 1 rem / 1.5 rem, title 2 rem / 3 rem, name 3 rem / 4.5 rem). The stamp line stays on the English recto only. Signatory and codes, when filled, print on both pages.

The host block adds a single signatory name, the legal representative’s titles (French with article, English without), a “signature by delegation” switch, and optional Erasmus code / OID (KA131 annex). Empty codes are omitted from the JSON and from the page. Printed codes are italic, like “stamp and signature”.

Delegation off: `Camille Martin, director of …` / `Camille Martin, directrice du …`. Delegation on: `For the director and by delegation, Alex Martin` / `Pour la directrice et par délégation, Alex Martin`. The printed name is always the signatory field.

## Configuration (`config.html`)

The first time, fill in the country logo, host institution, place and its logo. A state emblem sits next to it; it defaults to the French Republic mark and can be replaced. Those paths are stored in this browser and in the JSON you download.

Then paste the list of people (students and accompanying teachers), with optional sending institution and country. A table is rebuilt as you type. You can set the role (student / teacher) on each row. Students receive ECTS; teachers are recorded as accompanying, with no credits.

**Configure** and **Generate** switch panels. The button for the current view is grayed and does nothing; the other is the action. The page opens on the form. **Generate** validates, downloads a timestamped JSON (`version`: `v2`), then shows the A4 pages on the same page. **Configure** then brings the form back. **Grid** shows or hides the baseline lines. Printing from that view hides the form and the buttons.

You can drop a `.txt` list or a previously exported JSON onto the list field. The JSON reloads title, dates and people. Host fields already filled in the form stay as they are; empty ones take the JSON. Older internat files (`lycee`, `personnes`, `nom`, `prenom`, `proviseur`, `oid`) still open.

On save, the JSON sorts by institution, teachers then students, then by name. Empty keys are omitted, not written as empty strings.

## Certificates (`certificat.html`)

This page only prints a JSON that already exists. It opens on a single field: drop the file, or click the field to choose it. After a valid file, the A4 pages appear underneath; the field stays so you can load another. **Grid** remains. Printing hides the field and the button.

Print with **Command/Control + P** to get a PDF, then have the pages signed.

Set the activity type (**BIP** or **Workshop**); ECTS are added on student certificates (3 or 1).

The layout uses a baseline grid so the type sits on a structure. The blue lines are not printed. Baseline alignment follows [Julie Blanc](https://julie-blanc.fr/)’s work for [paged.js](https://pagedjs.org/).

The interface (forms, buttons, help) uses **Source Sans 3** (variable, version 3.052), SIL Open Font License, shipped in `fonts/source-sans/`. English A4 pages keep Source Sans 3. French interface switches the A4 pages to Marianne (`fonts/marianne/`) and internat’s grid.

- Drop lists or a previously exported JSON onto the configuration page.
- Sort the on-screen table by country, institution, name, or role. That sort does not reorder the JSON; the file uses the save order above.

No office suite to install. Open formats.

Vibecoded by [écb](mailto:ecb@dnmd.lv) (with Grok on Cursor).
