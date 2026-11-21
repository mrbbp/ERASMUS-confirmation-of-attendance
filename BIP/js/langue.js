(() => {
  const FORCE_LANG = ""; // "en" ou "fr". Vide : le navigateur décide.

  function detectLang() {
    const force = FORCE_LANG.trim().toLowerCase();
    if (force === "en" || force === "fr") {
      return force;
    }

    try {
      const query = new URLSearchParams(window.location.search).get("lang");
      if (query === "en" || query === "fr") {
        return query;
      }
    } catch {
      // ignore
    }

    const nav = String(navigator.language || "").toLowerCase();
    return nav.startsWith("fr") ? "fr" : "en";
  }

  const LANG = detectLang();
  const IS_FR = LANG === "fr";

  document.documentElement.lang = LANG;

  const FR = {
    indexTitle: "BIP — confirmation de présence",
    indexLede: "Préparez la liste, puis composez les confirmations de présence.",
    navTools: "Outils",
    navConfig: "Configuration",
    navConfigDesc: " — liste, dates, logos, fichier JSON.",
    navCert: "Certificats",
    navCertDesc: " — deux pages A4 par personne depuis un JSON.",
    configTitle: "Configuration du certificat",
    configLedeBefore: "Génère un JSON horodaté",
    configLedeAfter: "pour les confirmations de présence.",
    grid: "Grille",
    hostLegend: "Établissement d’accueil",
    hostUsage: "Enregistré dans ce navigateur. Repris sur les certificats.",
    edit: "Modifier",
    close: "Fermer",
    stateLogo: "Logo d’État",
    loadFile: "Charger un fichier",
    help: "Aide",
    logoHelp: "Chemin relatif, bouton fichier, ou dépôt. PNG, SVG, JPEG, GIF. Chiffré dans upload/ ; l’adresse contient la clé.",
    hostLabel: "Établissement d’accueil",
    cityLabel: "Ville",
    institutionLogo: "Logo de l’établissement",
    requiredAbbr: "obligatoire",
    titleLegend: "Titre",
    bipName: "Nom du BIP",
    workshopName: "Nom du workshop",
    datesLegend: "Dates",
    startLabel: "Début",
    endLabel: "Fin",
    virtualLabel: "Composante virtuelle",
    virtualHelp: "Laisser vide s’il n’y a pas de composante virtuelle.",
    peopleLegend: "Personnes à certifier",
    listLabel: "Liste à coller",
    helpEntry: "Saisie",
    helpEntry1: "Une ligne égale une personne.",
    helpEntry2: "Déposez un fichier .txt, ou un JSON déjà généré.",
    helpEntry3: "Le tableau et la liste se réécrivent l’un l’autre.",
    helpOrder: "Ordre",
    helpOrder1: "NOM prénom, établissement d’envoi, pays.",
    helpOrder2: "Les capitales forment le nom (DE LA FONTAINE Jules).",
    helpOrder3: "Établissement et pays sont facultatifs. Le pays est un code ISO Erasmus+.",
    helpOrder4: "À l’enregistrement, le JSON classe par établissement, enseignants, puis étudiants.",
    helpRole: "Rôle",
    helpRole1: "Par défaut : étudiant. Une ligne Teachers / Students bascule les noms suivants.",
    helpRole2: "Dans le tableau, un clic passe de Étud. à Prof.",
    helpRead: "J’ai déjà lu ceci",
    listPlaceholder: "NOM prénom, établissement (facultatif), pays (facultatif)",
    configure: "Configurer",
    generate: "Générer",
    certificates: "Certificats",
    dropJson: "Déposez un fichier JSON ici, ou cliquez pour en choisir un.",
    frenchRepublic: "République française",
    europeanUnion: "Union européenne",
    colFamilyName: "Nom",
    colGivenName: "Prénom",
    colCountry: "Pays",
    colSending: "Établissement d’envoi",
    colRole: "Rôle",
    roleTeach: "Prof.",
    roleStud: "Étud.",
    ects3: "3 ECTS",
    ects1: "1 ECTS",
    noOne: "Aucune personne. Collez une liste.",
    sortedBy: "Tri par {label}, {direction}, {count} personne{plural}.",
    ascending: "croissant",
    descending: "décroissant",
    personCount: "{count} personne{plural}",
    endBeforeStart: "La date de fin doit être égale ou postérieure à la date de début.",
    pasteSomeone: "Collez au moins une personne, une par ligne.",
    logoFormats: "Formats acceptés : PNG, SVG, JPEG, GIF.",
    uploading: "Envoi de {name}…",
    uploadRefused: "Envoi refusé.",
    fileSaved: "{name} enregistré : {path}",
    uploadFailed: "Envoi impossible.",
    dropTxtOrJson: "Déposez un fichier .txt ou un JSON de configuration.",
    unreadableJson: "JSON illisible.",
    reloadedJson: "{count} personne{plural} rechargée{plural} depuis le JSON.",
    fileUnreadable: "Lecture du fichier impossible.",
    saveTitleRefused: "Ce navigateur refuse d’enregistrer le nom de l’activité.",
    saveHostRefused: "Ce navigateur refuse d’enregistrer l’établissement d’accueil.",
    savedBrowser: "Enregistré dans ce navigateur.",
    enterName: "Indiquez le nom.",
    enterHost: "Indiquez l’établissement d’accueil.",
    enterCity: "Indiquez la ville.",
    enterLogo: "Indiquez le chemin du logo.",
    enterSignatory: "Indiquez le nom du signataire.",
    enterTitreFr: "Indiquez la fonction du responsable légal.",
    enterTitreEn: "Indiquez la fonction en anglais.",
    generated: "{count} personne{plural} — {title}.",
    memoryCleared: "La mémoire de ce navigateur a été effacée.",
    invalidJson: "JSON invalide : un objet avec un tableau participants est requis.",
    noParticipants: "Aucun participant dans le JSON.",
    chooseJson: "Choisissez un fichier JSON.",
    certTitle: "Confirmation de présence",
    certTitleNamed: "Confirmation de présence — {title}",
    hostHei: "Établissement d’accueil",
    logoAlt: "Logo",
    teacherOf: "enseignant·e accompagnateur·rice de",
    studentOf: "étudiant·e de",
    participatedBip: "a participé au workshop Erasmus+ BIP",
    participatedWorkshop: "a participé au workshop Erasmus+",
    stamp: "cachet et signature",
    archive: "pour conformité",
    weConfirm: "Nous confirmons que",
    atFr: "au ",
    fromFr: "du ",
    toFr: " au ",
    ectsAvant: "Le nombre de crédits attribués est de ",
    ectsEntre: " et la formation a été ",
    acheve: "suivie avec succès",
    virtuelleAvant: "La composante virtuelle a eu lieu le ",
    codeErasmusLabel: "Code Erasmus ",
    oidLabel: "OID ",
  };

  const EN = {
    indexTitle: "BIP — confirmation of attendance",
    indexLede: "Prepare the list, then compose the confirmations of attendance.",
    navTools: "Tools",
    navConfig: "Configuration",
    navConfigDesc: " — list, dates, logos, JSON file.",
    navCert: "Certificates",
    navCertDesc: " — one A4 page per person from a JSON file.",
    configTitle: "Certificate setup",
    configLedeBefore: "Downloads a timestamped JSON file",
    configLedeAfter: "for confirmations of attendance.",
    grid: "Grid",
    hostLegend: "Host institution",
    hostUsage: "Saved in this browser. Reused on the certificates.",
    edit: "Edit",
    close: "Close",
    stateLogo: "State logo",
    loadFile: "Load a file",
    help: "Help",
    logoHelp: "Relative path, file button, or drop. PNG, SVG, JPEG, GIF. Encrypted in upload/; the address holds the key.",
    hostLabel: "Host institution name",
    cityLabel: "City",
    institutionLogo: "Institution logo",
    requiredAbbr: "required",
    titleLegend: "Title",
    bipName: "BIP name",
    workshopName: "Workshop name",
    datesLegend: "Dates",
    startLabel: "Start",
    endLabel: "End",
    virtualLabel: "Virtual component",
    virtualHelp: "Leave empty if there is no virtual component.",
    peopleLegend: "People to certify",
    listLabel: "List to paste",
    helpEntry: "Entry",
    helpEntry1: "One line equals one person.",
    helpEntry2: "Drop a .txt file, or a JSON already generated.",
    helpEntry3: "The table and the list rewrite each other.",
    helpOrder: "Order",
    helpOrder1: "FAMILY NAME given name, sending institution, country.",
    helpOrder2: "Capitals form the family name (DE LA FONTAINE Jules).",
    helpOrder3: "Institution and country are optional. Country is an Erasmus+ ISO code.",
    helpOrder4: "On save, the JSON sorts by institution, teachers, then students.",
    helpRole: "Role",
    helpRole1: "Default: student. A Teachers / Students line switches the following names.",
    helpRole2: "In the table, a click toggles Stud. / Teach.",
    helpRead: "I’ve already read this",
    listPlaceholder: "FAMILY NAME given name, institution (optional), country (optional)",
    configure: "Configure",
    generate: "Generate",
    certificates: "Certificates",
    dropJson: "Drop a JSON file here, or click to choose one.",
    frenchRepublic: "French Republic",
    europeanUnion: "European Union",
    colFamilyName: "Family name",
    colGivenName: "Given name",
    colCountry: "Country",
    colSending: "Sending institution",
    colRole: "Role",
    roleTeach: "Teach.",
    roleStud: "Stud.",
    ects3: "3 ECTS",
    ects1: "1 ECTS",
    noOne: "No one yet. Paste a list.",
    sortedBy: "Sorted by {label}, {direction}, {count} person{plural}.",
    ascending: "ascending",
    descending: "descending",
    personCount: "{count} person{plural}",
    endBeforeStart: "The end date must be on or after the start date.",
    pasteSomeone: "Paste at least one person, one per line.",
    logoFormats: "Accepted formats: PNG, SVG, JPEG, GIF.",
    uploading: "Uploading {name}…",
    uploadRefused: "Upload refused.",
    fileSaved: "{name} saved: {path}",
    uploadFailed: "Upload failed.",
    dropTxtOrJson: "Drop a .txt file or a configuration JSON.",
    unreadableJson: "Unreadable JSON.",
    reloadedJson: "{count} person{plural} reloaded from the JSON.",
    fileUnreadable: "The file could not be read.",
    saveTitleRefused: "This browser refused to save the activity name.",
    saveHostRefused: "This browser refused to save the host institution.",
    savedBrowser: "Saved in this browser.",
    enterName: "Enter the name.",
    enterHost: "Enter the host institution.",
    enterCity: "Enter the city.",
    enterLogo: "Enter the logo path.",
    enterSignatory: "Enter the signatory’s name.",
    enterTitreFr: "Enter the legal representative’s title.",
    enterTitreEn: "Enter the title in English.",
    generated: "{count} person{plural} — {title}.",
    memoryCleared: "This browser’s memory has been cleared.",
    invalidJson: "Invalid JSON: an object with a participants array is required.",
    noParticipants: "No participants in the JSON.",
    chooseJson: "Choose a JSON file.",
    certTitle: "Confirmation of attendance",
    certTitleNamed: "Confirmation of attendance — {title}",
    hostHei: "Host HEI",
    logoAlt: "Logo",
    teacherOf: "accompanying teacher of",
    studentOf: "student of",
    participatedBip: "has participated in the Erasmus+ BIP workshop",
    participatedWorkshop: "has participated in the Erasmus+ workshop",
    stamp: "stamp and signature",
    archive: "pour conformité",
    weConfirm: "Nous confirmons que",
    atFr: "au ",
    fromFr: "du ",
    toFr: " au ",
    ectsAvant: "Le nombre de crédits attribués est de ",
    ectsEntre: " et la formation a été ",
    acheve: "suivie avec succès",
    virtuelleAvant: "La composante virtuelle a eu lieu le ",
    codeErasmusLabel: "Erasmus code ",
    oidLabel: "OID ",
  };

  const TABLE = IS_FR ? { ...EN, ...FR } : EN;

  function t(key, vars) {
    let text = TABLE[key] ?? EN[key] ?? key;
    if (vars) {
      for (const [name, value] of Object.entries(vars)) {
        text = text.replaceAll(`{${name}}`, String(value));
      }
    }
    return text;
  }

  function applyAttr(el, attr, key) {
    const value = t(key);
    if (attr === "text") {
      el.textContent = value;
      return;
    }
    el.setAttribute(attr, value);
  }

  function applyDom() {
    if (IS_FR) {
      document.querySelectorAll("[data-i18n]").forEach((el) => {
        if (el.closest("template")) {
          return;
        }
        applyAttr(el, "text", el.getAttribute("data-i18n"));
      });
      document.querySelectorAll("[data-i18n-title]").forEach((el) => {
        if (el.closest("template")) {
          return;
        }
        applyAttr(el, "title", el.getAttribute("data-i18n-title"));
      });
      document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
        if (el.closest("template")) {
          return;
        }
        applyAttr(el, "placeholder", el.getAttribute("data-i18n-placeholder"));
      });
      document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
        if (el.closest("template")) {
          return;
        }
        applyAttr(el, "aria-label", el.getAttribute("data-i18n-aria-label"));
      });
      document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
        if (el.closest("template")) {
          return;
        }
        applyAttr(el, "alt", el.getAttribute("data-i18n-alt"));
      });

      const titleKey = document.body?.dataset.i18nTitle;
      if (titleKey) {
        document.title = t(titleKey);
      }
    }

    document.querySelectorAll('input[type="date"]').forEach((champ) => {
      champ.lang = LANG;
    });

    document.querySelectorAll("[data-lang='fr']").forEach((el) => {
      if (IS_FR) {
        return;
      }
      el.hidden = true;
      el.querySelectorAll("input, textarea, select, button").forEach((control) => {
        control.disabled = true;
        control.required = false;
      });
    });
  }

  applyDom();

  window.BipLang = {
    FORCE_LANG,
    lang: LANG,
    isFr: IS_FR,
    t,
  };
})();
