(async () => {
  const { t, isFr: IS_FR, lang: LANG } = window.BipLang;
  const { DEFAULT_STATE_LOGO, MONTHS_EN, isObject, isV2, asText, safeLogoPath, frEtablissementFrom, normalizeConfig, normalizeEtablissement, renderCertificates, alignBaselines } = window.BipEn;

  const LOGO_TYPES = new Set(["image/png", "image/jpeg", "image/gif", "image/svg+xml"]);
  const BIP_KEY = "bip-nom";
  const ETAB_KEY = "bip-etablissement";
  const ORDRE_KEY = "bip-ordre-langues";
  const LISTE_HELP_LU_KEY = "bip-liste-help-lu";
  const AIDE_VISITE_KEY = "bip-aide-visite";

  const form = document.querySelector("#config-form");
  const titleField = document.querySelector("#activity-title");
  const hostField = document.querySelector("#host");
  const cityField = document.querySelector("#city");
  const logoField = document.querySelector("#logo");
  const stateLogoField = document.querySelector("#stateLogo");
  const legalField = document.querySelector("#legalRepresentative");
  const titreFrField = document.querySelector("#titreFr");
  const titreEnField = document.querySelector("#titreEn");
  const codeErasmusField = document.querySelector("#codeErasmus");
  const oidField = document.querySelector("#oid");
  const etablissementLogo = document.querySelector("#etablissement-logo");
  const etablissementStateLogo = document.querySelector("#etablissement-state-logo");
  const etablissementNom = document.querySelector("#etablissement-nom");
  const etablissementSignataire = document.querySelector("#etablissement-signataire");
  const etablissementCode = document.querySelector("#etablissement-code");
  const etablissementOid = document.querySelector("#etablissement-oid");
  const etablissementChamps = [...document.querySelectorAll("#etablissement [data-saisie]")].filter((champ) => {
    return champ.dataset.lang !== "fr" || IS_FR;
  });
  const etablissementModifier = document.querySelector("#etablissement-modifier");
  const listeField = document.querySelector("#liste");
  const listeAide = document.querySelector("#liste-aide");
  const listeHelpLu = document.querySelector("#liste-help-lu");
  const logoAide = document.querySelector("#logo-aide");
  const stateLogoAide = document.querySelector("#state-logo-aide");
  const personnesChamp = document.querySelector("#personnes-champ");
  const dateDebut = document.querySelector("#startDate");
  const dateFin = document.querySelector("#endDate");
  const dateVirtuelle = document.querySelector("#virtualDate");

  function isoAujourdhui() {
    if (globalThis.Temporal?.Now) {
      return Temporal.Now.plainDateISO().toString();
    }

    const maintenant = new Date();
    const yyyy = String(maintenant.getFullYear()).padStart(4, "0");
    const mm = String(maintenant.getMonth() + 1).padStart(2, "0");
    const dd = String(maintenant.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  const aujourdhui = isoAujourdhui();
  dateDebut.value = aujourdhui;
  dateFin.value = aujourdhui;
  const statut = document.querySelector("#statut");
  const vueConfigurer = document.querySelector("#vue-configurer");
  const vueGenerer = document.querySelector("#vue-generer");
  const certificats = document.querySelector("#certificats");
  const grille = document.querySelector("#grille");
  const collator = new Intl.Collator(LANG, { numeric: true, sensitivity: "base" });
  const columns = [
    ["familyName", t("colFamilyName")],
    ["givenName", t("colGivenName")],
    ["country", t("colCountry")],
    ["sendingInstitution", t("colSending")],
    ["role", t("colRole")],
  ];
  const localeNom = IS_FR ? "fr-FR" : "en-GB";

  function personCount(count) {
    return t("personCount", { count, plural: count > 1 ? "s" : "" });
  }

  function omitEmpty(obj) {
    const out = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value === "" || value === undefined) {
        continue;
      }
      out[key] = value;
    }
    return out;
  }

  function collectFrEtablissement() {
    if (!IS_FR) {
      return frEtablissementFrom(null);
    }

    return {
      legalRepresentative: legalField.value.trim(),
      titreFr: titreFrField.value.trim(),
      titreEn: titreEnField.value.trim(),
      delegation: form.delegation.checked,
      codeErasmus: codeErasmusField.value.trim(),
      oid: oidField.value.trim(),
    };
  }

  function applyFrToPayload(payload, fr) {
    if (fr.legalRepresentative) {
      payload.legalRepresentative = fr.legalRepresentative;
    }
    if (fr.titreFr) {
      payload.titreFr = fr.titreFr;
    }
    if (fr.titreEn) {
      payload.titreEn = fr.titreEn;
    }
    if (fr.delegation) {
      payload.delegation = true;
    } else if (IS_FR) {
      payload.delegation = false;
    }
    if (fr.codeErasmus) {
      payload.codeErasmus = fr.codeErasmus;
    }
    if (fr.oid) {
      payload.oid = fr.oid;
    }
  }

  function champsEtablissementObligatoires() {
    const champs = [hostField, cityField, logoField];
    if (IS_FR) {
      champs.push(legalField, titreFrField, titreEnField);
    }
    return champs;
  }

  function ouvrirSaisieEtablissement() {
    definirSaisieEtablissement(true);
    etablissementModifier.setAttribute("aria-expanded", "true");
    etablissementModifier.textContent = "";
    etablissementModifier.setAttribute("aria-label", t("close"));
  }

  let generateReady = false;

  function formatDateEn(iso) {
    if (!iso) {
      return null;
    }

    if (globalThis.Temporal?.PlainDate) {
      const plain = Temporal.PlainDate.from(iso);
      return plain.toLocaleString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }

    const parts = iso.split("-");
    if (parts.length !== 3) {
      return null;
    }

    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);
    if (!year || month < 1 || month > 12 || !day) {
      return null;
    }

    return `${day} ${MONTHS_EN[month - 1]} ${year}`;
  }

  function motEnCapitales(mot) {
    const lettres = [...mot].filter((caractere) => caractere.toLowerCase() !== caractere.toUpperCase());
    return lettres.length > 0 && lettres.every((caractere) => caractere === caractere.toUpperCase());
  }

  function splitNomPrenom(name) {
    const mots = name.split(/\s+/).filter(Boolean);
    let coupure = 0;
    while (coupure < mots.length && motEnCapitales(mots[coupure])) {
      coupure += 1;
    }
    if (coupure === 0) {
      coupure = 1;
    }
    return {
      familyName: mots.slice(0, coupure).join(" "),
      givenName: mots.slice(coupure).join(" "),
    };
  }

  function parseListe(text) {
    let teacher = false;
    const participants = [];

    for (const raw of text.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line) {
        continue;
      }

      const heading = line.toLowerCase();
      if (!line.includes(",") && /\b(?:teachers?|enseignant(?:e|es|s)?|professeurs?|profs?)\b/i.test(line)) {
        teacher = true;
        continue;
      }
      if (heading === "students") {
        teacher = false;
        continue;
      }

      const firstComma = line.indexOf(",");
      const name = (firstComma === -1 ? line : line.slice(0, firstComma)).trim();
      const rest = firstComma === -1 ? "" : line.slice(firstComma + 1).trim();
      const lastComma = rest.lastIndexOf(",");
      const sendingInstitution = (lastComma === -1 ? rest : rest.slice(0, lastComma)).trim();
      const country = lastComma === -1 ? "" : rest.slice(lastComma + 1).trim();
      const { familyName, givenName } = splitNomPrenom(name);
      if (!familyName) {
        continue;
      }

      participants.push({
        familyName,
        givenName,
        country,
        sendingInstitution,
        role: teacher ? "teacher" : "student",
      });
    }

    return participants;
  }

  function cellValue(input) {
    return input.value.trim();
  }

  function syncCell(input) {
    input.closest("td").dataset.value = cellValue(input);
  }

  function placeRow(tbody, row) {
    if (typeof tbody.moveBefore === "function") {
      tbody.moveBefore(row, null);
      return;
    }
    tbody.append(row);
  }

  function sortPersonnes(button) {
    const table = personnesChamp.querySelector("table");
    const th = button.closest("th");
    const direction = th.getAttribute("aria-sort") === "ascending" ? "descending" : "ascending";
    const factor = direction === "ascending" ? 1 : -1;

    for (const header of table.tHead.rows[0].cells) {
      header.removeAttribute("aria-sort");
    }
    th.setAttribute("aria-sort", direction);

    const rows = [...table.tBodies[0].rows].sort((a, b) => {
      const left = a.cells[th.cellIndex].dataset.value ?? "";
      const right = b.cells[th.cellIndex].dataset.value ?? "";
      return factor * collator.compare(left, right);
    });

    for (const row of rows) {
      placeRow(table.tBodies[0], row);
    }

    statut.textContent = t("sortedBy", {
      label: button.textContent.trim(),
      direction: t(direction === "ascending" ? "ascending" : "descending"),
      count: rows.length,
      plural: rows.length > 1 ? "s" : "",
    });
  }

  function renderPersonnes(participants) {
    if (participants.length === 0) {
      personnesChamp.querySelector(".personnes")?.remove();
      statut.textContent = t("noOne");
      return;
    }

    const table = document.createElement("table");
    const caption = document.createElement("caption");
    caption.id = "personnes-caption";
    caption.textContent = t("peopleLegend");

    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");
    for (const [key, label] of columns) {
      const th = document.createElement("th");
      th.scope = "col";
      th.id = `col-${key}`;
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      th.append(button);
      headRow.append(th);
    }
    thead.append(headRow);

    const tbody = document.createElement("tbody");
    participants.forEach((personne, index) => {
      const row = document.createElement("tr");
      row.dataset.ordre = String(index);
      const values = [
        [personne.familyName, true, "text"],
        [personne.givenName, true, "text"],
        [personne.country, false, "text"],
        [personne.sendingInstitution, false, "text"],
        [personne.role === "teacher", false, "role"],
      ];

      values.forEach(([value, required, type], column) => {
        const td = document.createElement("td");
        const [key] = columns[column];
        if (type === "role") {
          const role = document.createElement("button");
          role.type = "button";
          role.className = "role";
          role.id = `${key}-${index}`;
          role.setAttribute("aria-pressed", String(value));
          role.textContent = value ? t("roleTeach") : t("roleStud");
          td.dataset.value = value ? t("roleTeach") : t("roleStud");
          td.append(role);
        } else {
          const input = document.createElement("input");
          input.id = `${key}-${index}`;
          input.name = `${key}-${index}`;
          input.type = "text";
          input.value = value || "";
          input.required = required;
          input.autocomplete = "off";
          input.spellcheck = false;
          input.setAttribute("aria-labelledby", `col-${key}`);
          td.dataset.value = cellValue(input);
          td.append(input);
        }
        row.append(td);
      });
      tbody.append(row);
    });

    table.append(caption, thead, tbody);
    const figure = document.createElement("figure");
    figure.className = "personnes";
    figure.append(table);
    personnesChamp.querySelector(".personnes")?.remove();
    personnesChamp.append(figure);
    sortPersonnes(headRow.cells[0].querySelector("button"));
    statut.textContent = personCount(participants.length);
  }

  function lignePersonne(personne) {
    const identite = [personne.familyName, personne.givenName].filter(Boolean).join(" ");
    if (personne.country) {
      return `${identite}, ${personne.sendingInstitution || ""}, ${personne.country}`;
    }
    if (personne.sendingInstitution) {
      return `${identite}, ${personne.sendingInstitution}`;
    }
    return identite;
  }

  function texteDepuisTableau() {
    const rows = [...personnesChamp.querySelectorAll("tbody tr")].sort(
      (a, b) => Number(a.dataset.ordre) - Number(b.dataset.ordre),
    );
    const lines = [];
    let teacher = false;

    for (const row of rows) {
      const familyName = row.querySelector('input[name^="familyName-"]').value.trim();
      const givenName = row.querySelector('input[name^="givenName-"]').value.trim();
      const country = row.querySelector('input[name^="country-"]').value.trim();
      const sendingInstitution = row.querySelector('input[name^="sendingInstitution-"]').value.trim();
      const student = row.querySelector("button.role").getAttribute("aria-pressed") !== "true";
      if (student === teacher) {
        lines.push(student ? "Students" : "Teachers");
        teacher = !student;
      }
      lines.push(lignePersonne({
        familyName,
        givenName,
        country,
        sendingInstitution,
      }));
    }

    return lines.join("\n");
  }

  function ecrireListe() {
    const texte = texteDepuisTableau();
    if (listeField.value !== texte) {
      listeField.value = texte;
    }
  }

  function trierPersonnes(participants) {
    return participants.sort((a, b) => {
      const ecoleA = a.sendingInstitution || "";
      const ecoleB = b.sendingInstitution || "";
      if (Boolean(ecoleA) !== Boolean(ecoleB)) {
        return ecoleA ? -1 : 1;
      }
      const parEcole = collator.compare(ecoleA, ecoleB);
      if (parEcole) {
        return parEcole;
      }
      if (a.role !== b.role) {
        return a.role === "teacher" ? -1 : 1;
      }
      const parNom = collator.compare(a.familyName, b.familyName);
      if (parNom) {
        return parNom;
      }
      return collator.compare(a.givenName, b.givenName);
    });
  }

  function collectPersonnes() {
    return [...personnesChamp.querySelectorAll("tbody tr")].map((row) => {
      const familyName = row.querySelector('input[name^="familyName-"]').value.trim();
      const givenName = row.querySelector('input[name^="givenName-"]').value.trim();
      const country = row.querySelector('input[name^="country-"]').value.trim();
      const sendingInstitution = row.querySelector('input[name^="sendingInstitution-"]').value.trim();
      const student = row.querySelector("button.role").getAttribute("aria-pressed") !== "true";

      return {
        familyName: familyName.toLocaleUpperCase(localeNom),
        givenName: givenName.toLocaleLowerCase(localeNom).replace(/\p{L}+/gu, (mot) => {
          const lettres = [...mot];
          const premiere = lettres.shift() || "";
          return premiere.toLocaleUpperCase(localeNom) + lettres.join("");
        }),
        country: country || null,
        sendingInstitution: sendingInstitution || null,
        role: student ? "student" : "teacher",
      };
    });
  }

  function markValidity(champ, message) {
    champ.setCustomValidity(message);
    champ.setAttribute("aria-invalid", message ? "true" : "false");
  }

  function clearValidity(champ) {
    markValidity(champ, "");
  }

  function lireStockage(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function ecrireStockage(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      // ignore
    }
  }

  function ouvrirListeAide() {
    if (listeAide) {
      listeAide.open = true;
    }
  }

  function appliquerAides(reinitialiser) {
    if (reinitialiser) {
      try {
        localStorage.removeItem(LISTE_HELP_LU_KEY);
        localStorage.removeItem(AIDE_VISITE_KEY);
      } catch (error) {
        // ignore
      }
    }

    const dejaVisite = lireStockage(AIDE_VISITE_KEY) === "1";
    if (logoAide) {
      logoAide.open = !dejaVisite;
    }
    if (stateLogoAide) {
      stateLogoAide.open = !dejaVisite;
    }

    const lu = lireStockage(LISTE_HELP_LU_KEY) === "1";
    if (listeHelpLu) {
      listeHelpLu.checked = lu;
    }
    if (listeAide) {
      listeAide.open = !lu;
    }

    ecrireStockage(AIDE_VISITE_KEY, "1");
  }

  function validateDates() {
    if (dateDebut.value && dateFin.value && dateFin.value < dateDebut.value) {
      markValidity(dateFin, t("endBeforeStart"));
      return;
    }

    clearValidity(dateFin);
  }

  function validatePersonnes() {
    const participants = collectPersonnes();
    if (participants.length === 0) {
      markValidity(listeField, t("pasteSomeone"));
      return;
    }

    clearValidity(listeField);
  }

  function logoFileAllowed(file) {
    return LOGO_TYPES.has(file.type) || /\.(png|jpe?g|gif|svg)$/i.test(file.name);
  }

  function bindLogoUpload(field, fileInput, button) {
    async function uploadLogoFile(file) {
      if (!file) {
        return;
      }

      if (!logoFileAllowed(file)) {
        markValidity(field, t("logoFormats"));
        field.reportValidity();
        return;
      }

      const body = new FormData();
      body.append("logo", file, file.name);
      button.disabled = true;
      statut.textContent = t("uploading", { name: file.name });

      try {
        const response = await fetch("upload.php", { method: "POST", body });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || t("uploadRefused"));
        }
        field.value = payload.path;
        field.dispatchEvent(new Event("input"));
        clearValidity(field);
        statut.textContent = t("fileSaved", { name: file.name, path: payload.path });
      } catch (error) {
        const message = error instanceof Error ? error.message : t("uploadFailed");
        markValidity(field, message);
        field.reportValidity();
        statut.textContent = message;
      } finally {
        button.disabled = false;
      }
    }

    button.addEventListener("click", () => {
      fileInput.click();
    });

    fileInput.addEventListener("change", () => {
      uploadLogoFile(fileInput.files?.[0]);
      fileInput.value = "";
    });

    field.addEventListener("input", () => {
      clearValidity(field);
    });

    const zone = field.closest("[data-saisie]") || field;

    function carriesFiles(event) {
      return event.dataTransfer?.types?.includes("Files");
    }

    zone.addEventListener("dragenter", (event) => {
      if (!carriesFiles(event)) {
        return;
      }
      event.preventDefault();
      zone.classList.add("is-drop");
    });

    zone.addEventListener("dragover", (event) => {
      if (!carriesFiles(event)) {
        return;
      }
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
      zone.classList.add("is-drop");
    });

    zone.addEventListener("dragleave", (event) => {
      if (event.relatedTarget instanceof Node && zone.contains(event.relatedTarget)) {
        return;
      }
      zone.classList.remove("is-drop");
    });

    zone.addEventListener("drop", (event) => {
      if (!carriesFiles(event)) {
        return;
      }
      event.preventDefault();
      zone.classList.remove("is-drop");
      uploadLogoFile(event.dataTransfer?.files?.[0]);
    });
  }

  bindLogoUpload(logoField, document.querySelector("#logo-file"), document.querySelector("#logo-file-button"));
  bindLogoUpload(stateLogoField, document.querySelector("#state-logo-file"), document.querySelector("#state-logo-file-button"));

  function buildPayload() {
    const payload = {
      version: "v2",
      title: titleField.value.trim(),
      ects: form.ectsZero.checked ? null : (form.format.checked ? 1 : 3),
      bip: !form.format.checked,
      startDate: formatDateEn(dateDebut.value),
      endDate: formatDateEn(dateFin.value),
      virtualDate: formatDateEn(dateVirtuelle.value),
      host: hostField.value.trim(),
      city: cityField.value.trim(),
      logo: logoField.value.trim(),
      stateLogo: safeLogoPath(stateLogoField.value, DEFAULT_STATE_LOGO),
      participants: trierPersonnes(collectPersonnes()),
    };
    if (IS_FR) {
      applyFrToPayload(payload, collectFrEtablissement());
    }
    return omitEmpty(payload);
  }

  function slugBip(name) {
    const slug = name
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return slug || "workshop";
  }

  function fileStamp(date) {
    const pad = (value) => String(value).padStart(2, "0");

    return [
      date.getFullYear(),
      pad(date.getMonth() + 1),
      pad(date.getDate()),
      "-",
      pad(date.getHours()),
      pad(date.getMinutes()),
      pad(date.getSeconds()),
    ].join("");
  }

  function configFilename(title, date) {
    return `BIP-${slugBip(title)}-config-${fileStamp(date)}.json`;
  }

  function remettreJson(text, filename) {
    const url = URL.createObjectURL(new Blob([text], { type: "application/octet-stream" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    return new Promise((resolve) => {
      window.setTimeout(() => {
        link.remove();
        URL.revokeObjectURL(url);
        resolve();
      }, 1500);
    });
  }

  function isoFromStoredDate(brut) {
    if (!brut) {
      return "";
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(brut)) {
      return brut;
    }
    const parties = String(brut).match(/^(\d{1,2}) ([A-Za-z]+) (\d{4})$/);
    const mois = parties ? MONTHS_EN.findIndex((nom) => nom.toLowerCase() === parties[2].toLowerCase()) : -1;
    return mois < 0 ? "" : `${parties[3]}-${String(mois + 1).padStart(2, "0")}-${String(parties[1]).padStart(2, "0")}`;
  }

  function remplirSiVide(champ, valeur) {
    if (!champ || champ.value.trim()) {
      return;
    }
    const text = typeof valeur === "string" ? valeur.trim() : "";
    if (text) {
      champ.value = text;
    }
  }

  function applyConfigToForm(data) {
    titleField.value = data.title || "";
    stockerBip();
    const signataireDeja = Boolean(legalField?.value.trim());
    remplirSiVide(hostField, data.host);
    remplirSiVide(cityField, data.city);
    remplirSiVide(logoField, data.logo);
    if (!stateLogoField.value.trim()) {
      stateLogoField.value = data.stateLogo || DEFAULT_STATE_LOGO;
    }
    const fr = frEtablissementFrom(data);
    remplirSiVide(legalField, fr.legalRepresentative);
    remplirSiVide(titreFrField, fr.titreFr);
    remplirSiVide(titreEnField, fr.titreEn);
    if (!signataireDeja && form.delegation) {
      form.delegation.checked = fr.delegation;
    }
    remplirSiVide(codeErasmusField, fr.codeErasmus);
    remplirSiVide(oidField, fr.oid);
    stockerEtablissement();
    form.format.checked = data.bip === false;
    form.format.dispatchEvent(new Event("change"));
    form.ectsZero.checked = data.ects === null || data.ects === 0;
    dateDebut.value = isoFromStoredDate(data.startDate);
    dateFin.value = isoFromStoredDate(data.endDate);
    dateVirtuelle.value = isoFromStoredDate(data.virtualDate);

    const lignes = [];
    let teacher = false;
    for (const personne of data.participants) {
      const student = personne.role !== "teacher";
      if (student === teacher) {
        lignes.push(student ? "Students" : "Teachers");
        teacher = !student;
      }
      lignes.push(lignePersonne(personne));
    }

    listeField.value = lignes.join("\n");
    clearValidity(listeField);
    listeField.dispatchEvent(new Event("input"));
  }

  function readListeFile(file) {
    if (!file) {
      return;
    }

    const json = file.type === "application/json" || /\.json$/i.test(file.name);
    const texte = file.type === "text/plain" || /\.txt$/i.test(file.name);
      if (!json && !texte) {
      markValidity(listeField, t("dropTxtOrJson"));
      listeField.reportValidity();
      ouvrirListeAide();
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const contenu = String(reader.result);
      if (!json) {
        listeField.value = contenu;
        clearValidity(listeField);
        listeField.dispatchEvent(new Event("input"));
        return;
      }

      let data;
      try {
        data = normalizeConfig(JSON.parse(contenu));
      } catch (error) {
        const message = error instanceof Error ? error.message : t("unreadableJson");
        markValidity(listeField, message);
        listeField.reportValidity();
        ouvrirListeAide();
        return;
      }

      applyConfigToForm(data);
      const nombre = data.participants.length;
      statut.textContent = t("reloadedJson", { count: nombre, plural: nombre > 1 ? "s" : "" });
    });
    reader.addEventListener("error", () => {
      markValidity(listeField, t("fileUnreadable"));
      listeField.reportValidity();
      ouvrirListeAide();
    });
    reader.readAsText(file);
  }

  personnesChamp.addEventListener("click", (event) => {
    const role = event.target.closest("button.role");
    if (role && personnesChamp.contains(role)) {
      const prof = role.getAttribute("aria-pressed") !== "true";
      role.setAttribute("aria-pressed", String(prof));
      role.textContent = prof ? t("roleTeach") : t("roleStud");
      role.closest("td").dataset.value = prof ? t("roleTeach") : t("roleStud");
      ecrireListe();
      return;
    }
    const button = event.target.closest("thead button");
    if (!button || !personnesChamp.contains(button)) {
      return;
    }
    sortPersonnes(button);
  });

  personnesChamp.addEventListener("input", (event) => {
    if (event.target instanceof HTMLInputElement) {
      syncCell(event.target);
      ecrireListe();
    }
  });

  listeField.addEventListener("input", () => {
    renderPersonnes(parseListe(listeField.value));
    validatePersonnes();
  });

  listeField.addEventListener("dragover", (event) => {
    event.preventDefault();
    listeField.classList.add("is-drop");
  });

  listeField.addEventListener("dragleave", () => {
    listeField.classList.remove("is-drop");
  });

  listeField.addEventListener("drop", (event) => {
    event.preventDefault();
    listeField.classList.remove("is-drop");
    readListeFile(event.dataTransfer?.files?.[0]);
  });

  function definirSaisieEtablissement(ouvert) {
    for (const champ of etablissementChamps) {
      champ.hidden = !ouvert;
    }
  }

  function saisieEtablissementFermee() {
    return etablissementChamps.every((champ) => champ.hidden);
  }

  function afficherEtablissement() {
    const host = hostField.value.trim();
    const city = cityField.value.trim();
    const logo = logoField.value.trim();
    const stateLogo = stateLogoField.value.trim() || DEFAULT_STATE_LOGO;
    etablissementNom.textContent = [host, city].filter(Boolean).join(", ");
    const signataire = IS_FR ? legalField.value.trim() : "";
    const code = IS_FR ? codeErasmusField.value.trim() : "";
    const identifiant = IS_FR ? oidField.value.trim() : "";
    if (etablissementSignataire) {
      etablissementSignataire.textContent = signataire;
      etablissementSignataire.hidden = !signataire;
    }
    if (etablissementCode) {
      etablissementCode.textContent = code ? `Code Erasmus ${code}` : "";
      etablissementCode.hidden = !code;
    }
    if (etablissementOid) {
      etablissementOid.textContent = identifiant ? `OID ${identifiant}` : "";
      etablissementOid.hidden = !identifiant;
    }
    if (logo) {
      etablissementLogo.src = logo;
      etablissementLogo.alt = host;
      etablissementLogo.hidden = false;
    } else {
      etablissementLogo.removeAttribute("src");
      etablissementLogo.alt = "";
      etablissementLogo.hidden = true;
    }
    if (stateLogo) {
      etablissementStateLogo.src = stateLogo;
      etablissementStateLogo.alt = stateLogo === DEFAULT_STATE_LOGO ? t("frenchRepublic") : t("logoAlt");
      etablissementStateLogo.hidden = false;
    } else {
      etablissementStateLogo.removeAttribute("src");
      etablissementStateLogo.alt = "";
      etablissementStateLogo.hidden = true;
    }
  }

  function lireBipStocke() {
    try {
      const raw = localStorage.getItem(BIP_KEY);
      if (!raw) {
        return "";
      }
      try {
        const parsed = JSON.parse(raw);
        if (isObject(parsed)) {
          const title = asText(parsed.title) || (typeof parsed.bip === "string" ? parsed.bip.trim() : "");
          if (!isV2(parsed)) {
            localStorage.setItem(BIP_KEY, JSON.stringify({ version: "v2", title }));
          }
          return title;
        }
      } catch {
        localStorage.setItem(BIP_KEY, JSON.stringify({ version: "v2", title: raw }));
        return raw;
      }
      localStorage.setItem(BIP_KEY, JSON.stringify({ version: "v2", title: "" }));
      return "";
    } catch (error) {
      return "";
    }
  }

  function stockerBip() {
    try {
      localStorage.setItem(BIP_KEY, JSON.stringify({
        version: "v2",
        title: titleField.value.trim(),
      }));
      return true;
    } catch (error) {
      statut.textContent = t("saveTitleRefused");
      return false;
    }
  }

  function stockerEtablissement(extraFr) {
    afficherEtablissement();
    try {
      const payload = {
        version: "v2",
        host: hostField.value.trim(),
        city: cityField.value.trim(),
        logo: logoField.value.trim(),
        stateLogo: safeLogoPath(stateLogoField.value, DEFAULT_STATE_LOGO),
      };
      let precedent = {};
      try {
        precedent = JSON.parse(localStorage.getItem(ETAB_KEY) || "{}") || {};
      } catch {
        precedent = {};
      }
      let fr;
      if (IS_FR) {
        fr = collectFrEtablissement();
      } else {
        fr = frEtablissementFrom(precedent);
        if (extraFr) {
          const incoming = frEtablissementFrom(extraFr);
          for (const key of ["legalRepresentative", "titreFr", "titreEn", "codeErasmus", "oid"]) {
            if (incoming[key]) {
              fr[key] = incoming[key];
            }
          }
          if (incoming.delegation) {
            fr.delegation = true;
          }
        }
      }
      applyFrToPayload(payload, fr);
      localStorage.setItem(ETAB_KEY, JSON.stringify(omitEmpty(payload)));
      return true;
    } catch (error) {
      statut.textContent = t("saveHostRefused");
      return false;
    }
  }

  function definirVueCourante(configurer) {
    vueConfigurer.setAttribute("aria-pressed", String(configurer));
    vueGenerer.setAttribute("aria-pressed", String(!configurer));
    if (configurer) {
      vueConfigurer.setAttribute("aria-disabled", "true");
      vueGenerer.removeAttribute("aria-disabled");
    } else {
      vueGenerer.setAttribute("aria-disabled", "true");
      vueConfigurer.removeAttribute("aria-disabled");
    }
  }

  function vueInactive(bouton) {
    return bouton.getAttribute("aria-disabled") === "true";
  }

  function afficherConfigure() {
    document.body.dataset.doc = "config";
    document.body.classList.remove("is-grille");
    form.hidden = false;
    form.removeAttribute("inert");
    certificats.hidden = true;
    grille.hidden = true;
    definirVueCourante(true);
  }

  function afficherGenerate() {
    document.body.dataset.doc = "certificat";
    document.body.classList.add("is-grille");
    form.hidden = true;
    form.inert = true;
    certificats.hidden = false;
    grille.hidden = false;
    grille.setAttribute("aria-pressed", "true");
    definirVueCourante(false);
    document.fonts.ready.then(() => {
      requestAnimationFrame(() => alignBaselines(certificats));
    });
  }

  const reset = new URLSearchParams(window.location.search).has("reset");
  try {
    sessionStorage.removeItem("bip-certificat-config");
    localStorage.removeItem(ORDRE_KEY);
  } catch (error) {
    // ignore
  }
  if (reset) {
    localStorage.removeItem(ETAB_KEY);
    localStorage.removeItem(BIP_KEY);
    localStorage.removeItem(LISTE_HELP_LU_KEY);
    localStorage.removeItem(AIDE_VISITE_KEY);
    const url = new URL(window.location.href);
    url.searchParams.delete("reset");
    history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  try {
    const stocke = JSON.parse(localStorage.getItem(ETAB_KEY) || "null");
    if (stocke) {
      const etab = normalizeEtablissement(stocke);
      hostField.value = etab.host;
      cityField.value = etab.city || "";
      logoField.value = etab.logo;
      stateLogoField.value = etab.stateLogo;
      if (legalField) {
        legalField.value = etab.legalRepresentative;
      }
      if (titreFrField) {
        titreFrField.value = etab.titreFr;
      }
      if (titreEnField) {
        titreEnField.value = etab.titreEn;
      }
      if (form.delegation) {
        form.delegation.checked = etab.delegation;
      }
      if (codeErasmusField) {
        codeErasmusField.value = etab.codeErasmus;
      }
      if (oidField) {
        oidField.value = etab.oid;
      }
      if (!isV2(stocke) || stocke.city === "undefined" || (!("city" in stocke) && !("ville" in stocke))) {
        stockerEtablissement();
      }
    } else {
      stateLogoField.value = DEFAULT_STATE_LOGO;
    }
  } catch (error) {
    localStorage.removeItem(ETAB_KEY);
    stateLogoField.value = DEFAULT_STATE_LOGO;
  }
  titleField.value = lireBipStocke();
  afficherEtablissement();
  etablissementModifier.setAttribute("aria-controls", etablissementChamps.map((champ) => champ.id).filter(Boolean).join(" "));
  if (IS_FR) {
    legalField.required = true;
    titreFrField.required = true;
    titreEnField.required = true;
  }
  if (champsEtablissementObligatoires().some((champ) => !champ.value.trim())) {
    ouvrirSaisieEtablissement();
  }

  const champsEtablissementSaisie = [hostField, cityField, logoField, stateLogoField];
  if (IS_FR) {
    champsEtablissementSaisie.push(legalField, titreFrField, titreEnField, codeErasmusField, oidField);
  }
  for (const champ of champsEtablissementSaisie) {
    champ.addEventListener("input", () => {
      clearValidity(champ);
      stockerEtablissement();
    });
  }
  if (IS_FR && form.delegation) {
    form.delegation.addEventListener("change", () => {
      stockerEtablissement();
    });
  }

  etablissementModifier.addEventListener("click", () => {
    const ouvrir = saisieEtablissementFermee();
    definirSaisieEtablissement(ouvrir);
    etablissementModifier.setAttribute("aria-expanded", String(ouvrir));
    etablissementModifier.textContent = ouvrir ? "" : t("edit");
    if (ouvrir) {
      etablissementModifier.setAttribute("aria-label", t("close"));
      return;
    }

    etablissementModifier.removeAttribute("aria-label");
    if (stockerEtablissement()) {
      statut.textContent = t("savedBrowser");
    }
  });

  titleField.addEventListener("input", () => {
    clearValidity(titleField);
    stockerBip();
  });

  form.format.addEventListener("change", () => {
    const workshop = form.format.checked;
    form.ectsZero.checked = false;
    document.querySelector("#activity-title-kind").textContent = t(workshop ? "workshopName" : "bipName");
    document.querySelector("#ects-auto-label").textContent = t(workshop ? "ects1" : "ects3");
  });

  form.format.checked = false;
  form.ectsZero.checked = false;
  form.format.dispatchEvent(new Event("change"));

  dateDebut.addEventListener("change", validateDates);
  dateFin.addEventListener("change", validateDates);

  function focusInvalid() {
    const invalide = form.querySelector(":invalid");
    if (invalide) {
      const bloc = invalide.closest("[data-saisie]");
      if (bloc?.hidden) {
        ouvrirSaisieEtablissement();
      }
      invalide.scrollIntoView({ block: "center" });
      invalide.focus();
      statut.textContent = invalide.validationMessage;
    }
  }

  async function generer() {
    markValidity(titleField, titleField.value.trim() ? "" : t("enterName"));
    const messagesEtablissement = [
      [hostField, t("enterHost")],
      [cityField, t("enterCity")],
      [logoField, t("enterLogo")],
    ];
    if (IS_FR) {
      messagesEtablissement.push(
        [legalField, t("enterSignatory")],
        [titreFrField, t("enterTitreFr")],
        [titreEnField, t("enterTitreEn")],
      );
    }
    for (const [champ, message] of messagesEtablissement) {
      markValidity(champ, champ.value.trim() ? "" : message);
    }
    if (champsEtablissementObligatoires().some((champ) => !champ.value.trim())) {
      ouvrirSaisieEtablissement();
    }
    if (!stateLogoField.value.trim()) {
      stateLogoField.value = DEFAULT_STATE_LOGO;
      stockerEtablissement();
    }
    validateDates();
    validatePersonnes();

    if (!form.reportValidity()) {
      generateReady = false;
      afficherConfigure();
      focusInvalid();
      return;
    }

    vueGenerer.disabled = true;
    const data = buildPayload();
    const filename = configFilename(data.title, new Date());
    await remettreJson(`${JSON.stringify(data, null, 2)}\n`, filename);
    renderCertificates(certificats, data);
    generateReady = true;
    afficherGenerate();
    statut.textContent = t("generated", {
      count: data.participants.length,
      plural: data.participants.length > 1 ? "s" : "",
      title: data.title,
    });
    vueGenerer.disabled = false;
  }

  vueConfigurer.addEventListener("click", () => {
    if (vueInactive(vueConfigurer)) {
      return;
    }
    afficherConfigure();
  });

  vueGenerer.addEventListener("click", (event) => {
    if (vueInactive(vueGenerer) || document.body.dataset.doc === "certificat") {
      event.preventDefault();
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (vueInactive(vueGenerer) || document.body.dataset.doc === "certificat") {
      return;
    }
    generer();
  });

  grille.addEventListener("click", () => {
    const visible = document.body.classList.toggle("is-grille");
    grille.setAttribute("aria-pressed", visible ? "true" : "false");
  });

  window.addEventListener("beforeprint", () => {
    if (certificats.querySelector("article")) {
      document.body.dataset.doc = "certificat";
      form.hidden = true;
      certificats.hidden = false;
      alignBaselines(certificats);
    }
  });
  window.addEventListener("afterprint", () => {
    if (vueGenerer.getAttribute("aria-pressed") === "true") {
      afficherGenerate();
      return;
    }
    afficherConfigure();
  });

  if (listeHelpLu) {
    listeHelpLu.addEventListener("change", () => {
      ecrireStockage(LISTE_HELP_LU_KEY, listeHelpLu.checked ? "1" : "0");
      if (listeAide) {
        listeAide.open = !listeHelpLu.checked;
      }
    });
  }

  appliquerAides(reset);
  renderPersonnes(parseListe(listeField.value));
  if (reset) {
    statut.textContent = t("memoryCleared");
  }
})();
