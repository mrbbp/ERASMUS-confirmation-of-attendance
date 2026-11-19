(async () => {
  const MONTHS_EN = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const LOGO_TYPES = new Set(["image/png", "image/jpeg", "image/gif", "image/svg+xml"]);

  const form = document.querySelector("#config-form");
  let codeErasmus = "";
  let oid = "";
  const logoField = document.querySelector("#logoLycee");
  const etablissementLogo = document.querySelector("#etablissement-logo");
  const etablissementNom = document.querySelector("#etablissement-nom");
  const etablissementProviseur = document.querySelector("#etablissement-proviseur");
  const etablissementCode = document.querySelector("#etablissement-code");
  const etablissementOid = document.querySelector("#etablissement-oid");
  const etablissementForm = document.querySelector("#etablissement-form");
  const etablissementModifier = document.querySelector("#etablissement-modifier");
  const logoFile = document.querySelector("#logo-file");
  const logoFileButton = document.querySelector("#logo-file-button");
  const listeField = document.querySelector("#liste");
  const personnesBox = document.querySelector("#personnes");
  const dateDebut = document.querySelector("#dateDebut");
  const dateFin = document.querySelector("#dateFin");
  const langueNavigateur = navigator.language || "fr";
  for (const champDate of [dateDebut, dateFin, document.querySelector("#dateVirtuelle")]) {
    champDate.lang = langueNavigateur;
  }
  const statut = document.querySelector("#statut");
  const submitButton = form.querySelector('button[type="submit"]');

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
      nom: mots.slice(0, coupure).join(" "),
      prenom: mots.slice(coupure).join(" "),
    };
  }

  function parseListe(text) {
    let enseignant = false;
    const personnes = [];

    for (const raw of text.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line) {
        continue;
      }

      const heading = line.toLowerCase();
      if (!line.includes(",") && /\b(?:teachers?|enseignant(?:e|es|s)?|professeurs?|profs?)\b/i.test(line)) {
        enseignant = true;
        continue;
      }
      if (heading === "students") {
        enseignant = false;
        continue;
      }

      const firstComma = line.indexOf(",");
      const name = (firstComma === -1 ? line : line.slice(0, firstComma)).trim();
      const rest = firstComma === -1 ? "" : line.slice(firstComma + 1).trim();
      const lastComma = rest.lastIndexOf(",");
      const etablissementEnvoi = (lastComma === -1 ? rest : rest.slice(0, lastComma)).trim();
      const pays = lastComma === -1 ? "" : rest.slice(lastComma + 1).trim();
      const { nom, prenom } = splitNomPrenom(name);
      if (!nom) {
        continue;
      }

      personnes.push({
        nom,
        prenom,
        pays,
        etablissementEnvoi,
        role: enseignant ? "enseignant" : "etudiant",
      });
    }

    return personnes;
  }

  const collator = new Intl.Collator("fr", { numeric: true, sensitivity: "base" });
  const columns = [
    ["nom", "Nom"],
    ["prenom", "Prénom"],
    ["pays", "Pays"],
    ["etablissement", "Établissement d’envoi"],
    ["role", "Rôle"],
  ];

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
    const table = personnesBox.querySelector("table");
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

    statut.textContent = `Tri par ${button.textContent.trim()}, ${direction === "ascending" ? "croissant" : "décroissant"}, ${rows.length} personne${rows.length > 1 ? "s" : ""}.`;
  }

  function renderPersonnes(personnes) {
    if (personnes.length === 0) {
      personnesBox.replaceChildren();
      personnesBox.hidden = true;
      statut.textContent = "Aucune personne. Collez une liste.";
      return;
    }

    const table = document.createElement("table");
    const caption = document.createElement("caption");
    caption.id = "personnes-caption";
    caption.textContent = "Personnes à certifier";

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
    personnes.forEach((personne, index) => {
      const row = document.createElement("tr");
      row.dataset.ordre = String(index);
      const values = [
        [personne.nom, true, "text"],
        [personne.prenom, true, "text"],
        [personne.pays, false, "text"],
        [personne.etablissementEnvoi, false, "text"],
        [personne.role === "enseignant", false, "role"],
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
          role.textContent = value ? "Prof." : "Étud.";
          td.dataset.value = value ? "Prof." : "Étud.";
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
    personnesBox.replaceChildren(table);
    personnesBox.hidden = false;
    sortPersonnes(headRow.cells[0].querySelector("button"));
    statut.textContent = `${personnes.length} personne${personnes.length > 1 ? "s" : ""}`;
  }

  function lignePersonne(personne) {
    const identite = [personne.nom, personne.prenom].filter(Boolean).join(" ");
    if (personne.pays) {
      return `${identite}, ${personne.etablissementEnvoi || ""}, ${personne.pays}`;
    }
    if (personne.etablissementEnvoi) {
      return `${identite}, ${personne.etablissementEnvoi}`;
    }
    return identite;
  }

  function texteDepuisTableau() {
    const rows = [...personnesBox.querySelectorAll("tbody tr")].sort(
      (a, b) => Number(a.dataset.ordre) - Number(b.dataset.ordre),
    );
    const lines = [];
    let enseignant = false;

    for (const row of rows) {
      const nom = row.querySelector('input[name^="nom-"]').value.trim();
      const prenom = row.querySelector('input[name^="prenom-"]').value.trim();
      const pays = row.querySelector('input[name^="pays-"]').value.trim();
      const etablissementEnvoi = row.querySelector('input[name^="etablissement-"]').value.trim();
      const etudiant = row.querySelector("button.role").getAttribute("aria-pressed") !== "true";
      if (etudiant === enseignant) {
        lines.push(etudiant ? "Students" : "Enseignants");
        enseignant = !etudiant;
      }
      lines.push(lignePersonne({
        nom,
        prenom,
        pays,
        etablissementEnvoi,
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

  function collectPersonnes() {
    return [...personnesBox.querySelectorAll("tbody tr")].map((row) => {
      const nom = row.querySelector('input[name^="nom-"]').value.trim();
      const prenom = row.querySelector('input[name^="prenom-"]').value.trim();
      const pays = row.querySelector('input[name^="pays-"]').value.trim();
      const etablissementEnvoi = row.querySelector('input[name^="etablissement-"]').value.trim();
      const etudiant = row.querySelector("button.role").getAttribute("aria-pressed") !== "true";

      return {
        nom: nom.toLocaleUpperCase("fr-FR"),
        prenom: prenom.toLocaleLowerCase("fr-FR").replace(/\p{L}+/gu, (mot) => {
          const lettres = [...mot];
          const premiere = lettres.shift() || "";
          return premiere.toLocaleUpperCase("fr-FR") + lettres.join("");
        }),
        pays: pays || null,
        etablissementEnvoi: etablissementEnvoi || null,
        role: etudiant ? "etudiant" : "enseignant",
      };
    });
  }

  function validateDates() {
    if (dateDebut.value && dateFin.value && dateFin.value < dateDebut.value) {
      dateFin.setCustomValidity("La date de fin doit être postérieure ou égale à la date de début.");
      return;
    }

    dateFin.setCustomValidity("");
  }

  function validatePersonnes() {
    const personnes = collectPersonnes();
    if (personnes.length === 0) {
      listeField.setCustomValidity("Collez au moins une personne, une par ligne.");
      return;
    }

    listeField.setCustomValidity("");
  }

  function logoFileAllowed(file) {
    return LOGO_TYPES.has(file.type) || /\.(png|jpe?g|gif|svg)$/i.test(file.name);
  }

  async function uploadLogoFile(file) {
    if (!file) {
      return;
    }

    if (!logoFileAllowed(file)) {
      logoField.setCustomValidity("Formats acceptés : PNG, SVG, JPEG, GIF.");
      logoField.reportValidity();
      return;
    }

    const body = new FormData();
    body.append("logo", file, file.name);
    logoFileButton.disabled = true;
    statut.textContent = `Envoi de ${file.name}…`;

    try {
      const response = await fetch("upload.php", { method: "POST", body });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Envoi refusé.");
      }
      logoField.value = payload.path;
      logoField.dispatchEvent(new Event("input"));
      logoField.setCustomValidity("");
      statut.textContent = `${file.name} enregistré : ${payload.path}`;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Envoi impossible.";
      logoField.setCustomValidity(message);
      logoField.reportValidity();
      statut.textContent = message;
    } finally {
      logoFileButton.disabled = false;
    }
  }

  function buildPayload() {
    return {
      bip: form.bip.value.trim(),
      ects: form.ectsZero.checked ? null : (form.format.checked ? 1 : 3),
      mentionBip: !form.format.checked,
      dateDebut: formatDateEn(dateDebut.value),
      dateFin: formatDateEn(dateFin.value),
      dateVirtuelle: formatDateEn(form.dateVirtuelle.value),
      lycee: form.lycee.value.trim(),
      logoLycee: form.logoLycee.value.trim(),
      proviseur: form.proviseur.value.trim(),
      codeErasmus: form.codeErasmus.value.trim(),
      oid: form.oid.value.trim(),
      personnes: collectPersonnes(),
    };
  }

  function slugBip(name) {
    const slug = name
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return slug || "atelier";
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

  function configFilename(bip, date) {
    return `BIP-${slugBip(bip)}-config-${fileStamp(date)}.json`;
  }

  function downloadJson(data, filename) {
    const blob = new Blob([`${JSON.stringify(data, null, 2)}\n`], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.hidden = true;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  logoFileButton.addEventListener("click", () => {
    logoFile.click();
  });

  logoFile.addEventListener("change", () => {
    uploadLogoFile(logoFile.files?.[0]);
    logoFile.value = "";
  });

  logoField.addEventListener("input", () => {
    logoField.setCustomValidity("");
  });

  logoField.addEventListener("dragover", (event) => {
    event.preventDefault();
    logoField.classList.add("is-drop");
  });

  logoField.addEventListener("dragleave", () => {
    logoField.classList.remove("is-drop");
  });

  logoField.addEventListener("drop", (event) => {
    event.preventDefault();
    logoField.classList.remove("is-drop");
    uploadLogoFile(event.dataTransfer?.files?.[0]);
  });

  function readListeFile(file) {
    if (!file) {
      return;
    }

    const json = file.type === "application/json" || /\.json$/i.test(file.name);
    const texte = file.type === "text/plain" || /\.txt$/i.test(file.name);
    if (!json && !texte) {
      listeField.setCustomValidity("Déposez un fichier .txt ou le JSON de configuration.");
      listeField.reportValidity();
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const contenu = String(reader.result);
      if (!json) {
        listeField.value = contenu;
        listeField.setCustomValidity("");
        listeField.dispatchEvent(new Event("input"));
        return;
      }

      let data;
      try {
        data = JSON.parse(contenu);
      } catch (error) {
        listeField.setCustomValidity("JSON illisible.");
        listeField.reportValidity();
        return;
      }
      if (!data || !Array.isArray(data.personnes)) {
        listeField.setCustomValidity("JSON invalide : tableau personnes attendu.");
        listeField.reportValidity();
        return;
      }

      if (data.bip) {
        form.bip.value = data.bip;
      }
      if (data.lycee) {
        form.lycee.value = data.lycee;
      }
      if (data.logoLycee) {
        form.logoLycee.value = data.logoLycee;
      }
      if (data.proviseur) {
        form.proviseur.value = data.proviseur;
      }
      if (typeof data.codeErasmus === "string") {
        codeErasmus = data.codeErasmus.trim();
        form.codeErasmus.value = codeErasmus;
      }
      if (typeof data.oid === "string") {
        oid = data.oid.trim();
        form.oid.value = oid;
      }
      stockerEtablissement();
      form.format.checked = data.mentionBip === false;
      form.format.dispatchEvent(new Event("change"));
      form.ectsZero.checked = data.ects === null || data.ects === 0;

      for (const [cle, input] of [
        ["dateDebut", dateDebut],
        ["dateFin", dateFin],
        ["dateVirtuelle", form.dateVirtuelle],
      ]) {
        const brut = data[cle];
        if (!brut) {
          input.value = "";
          continue;
        }
        if (/^\d{4}-\d{2}-\d{2}$/.test(brut)) {
          input.value = brut;
          continue;
        }
        const parties = String(brut).match(/^(\d{1,2}) ([A-Za-z]+) (\d{4})$/);
        const mois = parties ? MONTHS_EN.findIndex((nom) => nom.toLowerCase() === parties[2].toLowerCase()) : -1;
        input.value = mois < 0 ? "" : `${parties[3]}-${String(mois + 1).padStart(2, "0")}-${String(parties[1]).padStart(2, "0")}`;
      }

      const lignes = [];
      let enseignant = false;
      for (const personne of data.personnes) {
        if (!personne || !personne.nom) {
          continue;
        }
        const etudiant = personne.role !== "enseignant";
        if (etudiant === enseignant) {
          lignes.push(etudiant ? "Students" : "Enseignants");
          enseignant = !etudiant;
        }
        lignes.push(lignePersonne({
          nom: personne.nom,
          prenom: personne.prenom || "",
          etablissementEnvoi: personne.etablissementEnvoi || "",
          pays: personne.pays || "",
        }));
      }

      listeField.value = lignes.join("\n");
      listeField.setCustomValidity("");
      listeField.dispatchEvent(new Event("input"));
      const nombre = lignes.filter((ligne) => ligne !== "Students" && ligne !== "Enseignants").length;
      statut.textContent = `${nombre} personne${nombre > 1 ? "s" : ""} rechargée${nombre > 1 ? "s" : ""} depuis le JSON.`;
    });
    reader.addEventListener("error", () => {
      listeField.setCustomValidity("Lecture du fichier impossible.");
      listeField.reportValidity();
    });
    reader.readAsText(file);
  }

  personnesBox.addEventListener("click", (event) => {
    const role = event.target.closest("button.role");
    if (role && personnesBox.contains(role)) {
      const prof = role.getAttribute("aria-pressed") !== "true";
      role.setAttribute("aria-pressed", String(prof));
      role.textContent = prof ? "Prof." : "Étud.";
      role.closest("td").dataset.value = prof ? "Prof." : "Étud.";
      ecrireListe();
      return;
    }
    const button = event.target.closest("thead button");
    if (!button || !personnesBox.contains(button)) {
      return;
    }
    sortPersonnes(button);
  });

  personnesBox.addEventListener("input", (event) => {
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

  function afficherEtablissement() {
    const lycee = form.lycee.value.trim();
    const logo = form.logoLycee.value.trim();
    const proviseur = form.proviseur.value.trim();
    const code = form.codeErasmus.value.trim();
    const identifiant = form.oid.value.trim();
    etablissementNom.textContent = lycee;
    etablissementProviseur.textContent = proviseur;
    etablissementCode.textContent = code ? `Code Erasmus ${code}` : "";
    etablissementCode.hidden = !code;
    etablissementOid.textContent = identifiant ? `OID ${identifiant}` : "";
    etablissementOid.hidden = !identifiant;
    if (logo) {
      etablissementLogo.src = logo;
      etablissementLogo.alt = lycee;
      etablissementLogo.hidden = false;
    } else {
      etablissementLogo.removeAttribute("src");
      etablissementLogo.alt = "";
      etablissementLogo.hidden = true;
    }
  }

  function stockerEtablissement() {
    afficherEtablissement();
    codeErasmus = form.codeErasmus.value.trim();
    oid = form.oid.value.trim();
    try {
      localStorage.setItem("bip-etablissement", JSON.stringify({
        lycee: form.lycee.value.trim(),
        logoLycee: form.logoLycee.value.trim(),
        proviseur: form.proviseur.value.trim(),
        codeErasmus,
        oid,
      }));
      return true;
    } catch (error) {
      statut.textContent = "Le navigateur refuse d’enregistrer l’établissement.";
      return false;
    }
  }

  const reset = new URLSearchParams(window.location.search).has("reset");
  if (reset) {
    sessionStorage.removeItem("bip-certificat-config");
    localStorage.removeItem("bip-etablissement");
    const url = new URL(window.location.href);
    url.searchParams.delete("reset");
    history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  try {
    const stocke = JSON.parse(localStorage.getItem("bip-etablissement") || "null");
    if (stocke) {
      if (stocke.lycee) {
        form.lycee.value = stocke.lycee;
      }
      if (stocke.logoLycee) {
        form.logoLycee.value = stocke.logoLycee;
      }
      if (stocke.proviseur) {
        form.proviseur.value = stocke.proviseur;
      }
      if (typeof stocke.codeErasmus === "string") {
        codeErasmus = stocke.codeErasmus.trim();
      }
      if (typeof stocke.oid === "string") {
        oid = stocke.oid.trim();
      }
    }
  } catch (error) {
    localStorage.removeItem("bip-etablissement");
  }
  form.codeErasmus.value = codeErasmus;
  form.oid.value = oid;
  afficherEtablissement();
  if ([form.lycee, form.logoLycee, form.proviseur, form.codeErasmus, form.oid].some((champ) => !champ.value.trim())) {
    etablissementForm.hidden = false;
    etablissementModifier.setAttribute("aria-expanded", "true");
    etablissementModifier.textContent = "";
    etablissementModifier.setAttribute("aria-label", "Fermer");
  }

  for (const champ of [form.lycee, form.logoLycee, form.proviseur]) {
    champ.addEventListener("input", () => {
      champ.setCustomValidity("");
      stockerEtablissement();
    });
  }
  for (const champ of [form.codeErasmus, form.oid]) {
    champ.addEventListener("input", () => {
      champ.setCustomValidity("");
      stockerEtablissement();
    });
  }

  etablissementModifier.addEventListener("click", () => {
    const ouvrir = etablissementForm.hidden;
    etablissementForm.hidden = !ouvrir;
    etablissementModifier.setAttribute("aria-expanded", String(ouvrir));
    etablissementModifier.textContent = ouvrir ? "" : "Modifier";
    if (ouvrir) {
      etablissementModifier.setAttribute("aria-label", "Fermer");
      return;
    }

    etablissementModifier.removeAttribute("aria-label");
    form.codeErasmus.value = form.codeErasmus.value.trim();
    form.oid.value = form.oid.value.trim();
    if (stockerEtablissement()) {
      statut.textContent = "Enregistré dans ce navigateur.";
    }
  });

  form.bip.addEventListener("input", () => {
    form.bip.setCustomValidity("");
  });

  form.format.addEventListener("change", () => {
    const workshop = form.format.checked;
    form.ectsZero.checked = false;
    document.querySelector("#bip-label-texte").textContent = workshop ? "workshop" : "BIP";
    document.querySelector("#ects-auto-label").textContent = workshop ? "1 ECTS" : "3 ECTS";
  });

  form.format.checked = false;
  form.ectsZero.checked = false;
  form.format.dispatchEvent(new Event("change"));

  dateDebut.addEventListener("change", validateDates);
  dateFin.addEventListener("change", validateDates);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    form.bip.setCustomValidity(form.bip.value.trim() ? "" : "Indiquez le nom.");
    for (const [champ, message] of [
      [form.lycee, "Indiquez le lycée."],
      [form.logoLycee, "Indiquez le logo."],
      [form.proviseur, "Indiquez le proviseur."],
      [form.codeErasmus, "Indiquez le code Erasmus."],
      [form.oid, "Indiquez l’OID."],
    ]) {
      champ.setCustomValidity(champ.value.trim() ? "" : message);
    }
    if ([form.lycee, form.logoLycee, form.proviseur, form.codeErasmus, form.oid].some((champ) => !champ.value.trim())) {
      etablissementForm.hidden = false;
      etablissementModifier.setAttribute("aria-expanded", "true");
      etablissementModifier.textContent = "";
      etablissementModifier.setAttribute("aria-label", "Fermer");
    }
    validateDates();
    validatePersonnes();

    if (!form.reportValidity()) {
      form.querySelector(":invalid")?.focus();
      return;
    }

    submitButton.disabled = true;
    const data = buildPayload();
    const filename = configFilename(data.bip, new Date());
    downloadJson(data, filename);
    try {
      sessionStorage.setItem("bip-certificat-config", JSON.stringify(data));
    } catch (error) {
      statut.textContent = "Le navigateur refuse d’enregistrer la liste pour les certificats.";
      submitButton.disabled = false;
      return;
    }
    window.setTimeout(() => {
      window.location.assign("certificat.html?depuis=config");
    }, 400);
  });

  renderPersonnes(parseListe(listeField.value));
  if (reset) {
    statut.textContent = "La mémoire de ce navigateur est effacée.";
  }
})();
