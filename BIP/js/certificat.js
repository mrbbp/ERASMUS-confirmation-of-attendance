(() => {
  // Pays du programme Erasmus+ en 2026. GB et CH restent hors table.
  const PAYS_EN = {
    AT: "Austria",
    BE: "Belgium",
    BG: "Bulgaria",
    HR: "Croatia",
    CY: "Cyprus",
    CZ: "Czechia",
    DK: "Denmark",
    EE: "Estonia",
    FI: "Finland",
    FR: "France",
    DE: "Germany",
    GR: "Greece",
    EL: "Greece",
    HU: "Hungary",
    IE: "Ireland",
    IT: "Italy",
    LV: "Latvia",
    LT: "Lithuania",
    LU: "Luxembourg",
    MT: "Malta",
    NL: "Netherlands",
    PL: "Poland",
    PT: "Portugal",
    RO: "Romania",
    SK: "Slovakia",
    SI: "Slovenia",
    ES: "Spain",
    SE: "Sweden",
    IS: "Iceland",
    LI: "Liechtenstein",
    NO: "Norway",
    MK: "North Macedonia",
    RS: "Serbia",
    TR: "Türkiye",
  };

  const PAYS_FR = {
    AT: "Autriche",
    BE: "Belgique",
    BG: "Bulgarie",
    HR: "Croatie",
    CY: "Chypre",
    CZ: "Tchéquie",
    DK: "Danemark",
    EE: "Estonie",
    FI: "Finlande",
    FR: "France",
    DE: "Allemagne",
    GR: "Grèce",
    EL: "Grèce",
    HU: "Hongrie",
    IE: "Irlande",
    IT: "Italie",
    LV: "Lettonie",
    LT: "Lituanie",
    LU: "Luxembourg",
    MT: "Malte",
    NL: "Pays-Bas",
    PL: "Pologne",
    PT: "Portugal",
    RO: "Roumanie",
    SK: "Slovaquie",
    SI: "Slovénie",
    ES: "Espagne",
    SE: "Suède",
    IS: "Islande",
    LI: "Liechtenstein",
    NO: "Norvège",
    MK: "Macédoine du Nord",
    RS: "Serbie",
    TR: "Turquie",
  };

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

  const MONTHS_EN_SHORT = [
    "Jan.",
    "Feb.",
    "Mar.",
    "Apr.",
    "May",
    "June",
    "July",
    "Aug.",
    "Sept.",
    "Oct.",
    "Nov.",
    "Dec.",
  ];

  const MONTH_INDEX = Object.fromEntries(
    MONTHS_EN.flatMap((name, index) => {
      const short = MONTHS_EN_SHORT[index].replace(/\.$/, "").toLowerCase();
      return [
        [name.toLowerCase(), index + 1],
        [short, index + 1],
        [`${short}.`, index + 1],
      ];
    }),
  );

  const ORDRE_RECTO = "recto-verso";
  const ORDRE_FIN = "vf-fin";
  const ORDRE_KEY = "bip-ordre-langues";
  const form = document.querySelector("#json-form");
  const ordreLangues = document.querySelector("#ordre-langues");
  let configChargee = null;
  const jsonFile = document.querySelector("#json-file");
  const statut = document.querySelector("#statut");
  const main = document.querySelector("#certificats");
  const genererPdf = document.querySelector("#generer-pdf");
  const vide = document.querySelector("#vide");
  const modele = document.querySelector("#modele-certificat");

  function isObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  function asText(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function asDate(value) {
    if (value == null) {
      return null;
    }

    const text = asText(value);
    return text || null;
  }

  function pad2(value) {
    return String(value).padStart(2, "0");
  }

  function ordinalEn(day) {
    const teen = day % 100;
    if (teen >= 11 && teen <= 13) {
      return `${day}th`;
    }

    switch (day % 10) {
      case 1:
        return `${day}st`;
      case 2:
        return `${day}nd`;
      case 3:
        return `${day}rd`;
      default:
        return `${day}th`;
    }
  }

  function toIsoDate(plain) {
    return `${plain.year}-${pad2(plain.month)}-${pad2(plain.day)}`;
  }

  function formatOrdinalShortEn(plain) {
    return `${ordinalEn(plain.day)} ${MONTHS_EN_SHORT[plain.month - 1]} ${plain.year}`;
  }

  const MONTHS_FR_SHORT = [
    "janv.",
    "févr.",
    "mars",
    "avr.",
    "mai",
    "juin",
    "juil.",
    "août",
    "sept.",
    "oct.",
    "nov.",
    "déc.",
  ];

  function formatShortFr(plain) {
    const day = plain.day === 1 ? "1er" : String(plain.day);
    return `${day} ${MONTHS_FR_SHORT[plain.month - 1]} ${plain.year}`;
  }

  function fromParts(year, month, day) {
    if (!year || month < 1 || month > 12 || day < 1 || day > 31) {
      return null;
    }

    if (globalThis.Temporal?.PlainDate) {
      try {
        return Temporal.PlainDate.from({ year, month, day });
      } catch {
        return null;
      }
    }

    return { year, month, day };
  }

  function parsePlainDate(value) {
    const text = asDate(value);
    if (!text) {
      return null;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      if (globalThis.Temporal?.PlainDate) {
        try {
          return Temporal.PlainDate.from(text);
        } catch {
          return null;
        }
      }

      const [year, month, day] = text.split("-").map(Number);
      if (!year || month < 1 || month > 12 || day < 1 || day > 31) {
        return null;
      }

      return { year, month, day };
    }

    const dayFirst = text.match(/^(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z.]+)\s+(\d{4})$/);
    if (dayFirst) {
      return fromParts(
        Number(dayFirst[3]),
        MONTH_INDEX[dayFirst[2].toLowerCase()],
        Number(dayFirst[1]),
      );
    }

    const monthFirst = text.match(/^([A-Za-z.]+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})$/);
    if (monthFirst) {
      return fromParts(
        Number(monthFirst[3]),
        MONTH_INDEX[monthFirst[1].toLowerCase()],
        Number(monthFirst[2]),
      );
    }

    return null;
  }

  function todayPlain() {
    if (globalThis.Temporal?.Now?.plainDateISO) {
      return Temporal.Now.plainDateISO();
    }

    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
    };
  }

  function fillTime(node, selector, value, lang) {
    const el = node.querySelector(selector);
    if (!el) {
      return;
    }

    const plain = parsePlainDate(value);
    if (plain) {
      el.dateTime = toIsoDate(plain);
      el.textContent = lang === "fr" ? formatShortFr(plain) : formatOrdinalShortEn(plain);
      return;
    }

    el.removeAttribute("datetime");
    el.textContent = asText(value);
  }

  function safeLogoPath(path) {
    const text = asText(path);
    if (!text || text.includes("..") || text.startsWith("/") || /^[a-z]+:/i.test(text)) {
      return "medias/logo_breq.svg";
    }

    return text;
  }

  function paysNom(code, lang) {
    if (!code) {
      return "";
    }

    const table = lang === "fr" ? PAYS_FR : PAYS_EN;
    return table[code.toUpperCase()] || "";
  }

  function fillAffiliation(article, personne, lang) {
    const prefix = personne.role === "enseignant"
      ? (lang === "fr" ? "enseignant accompagnateur de" : "accompanying teacher of")
      : (lang === "fr" ? "étudiant de" : "student of");
    const school = personne.etablissementEnvoi || "";
    const country = paysNom(personne.pays, lang);
    const schoolNode = article.querySelector(".etablissement-envoi");
    const countryNode = article.querySelector(".pays-en");

    fill(article, ".role-prefix", prefix);

    if (schoolNode) {
      if (school) {
        schoolNode.textContent = school;
      } else {
        schoolNode.remove();
      }
    }

    if (countryNode) {
      if (country) {
        countryNode.textContent = school ? `, ${country}` : country;
      } else {
        countryNode.remove();
      }
    }
  }

  function normalizePersonne(raw) {
    if (!isObject(raw)) {
      return null;
    }

    const nom = asText(raw.nom);
    if (!nom) {
      return null;
    }

    return {
      nom,
      prenom: asText(raw.prenom),
      pays: asText(raw.pays) || null,
      etablissementEnvoi: asText(raw.etablissementEnvoi) || null,
      role: raw.role === "enseignant" ? "enseignant" : "etudiant",
    };
  }

  function normalizeConfig(raw) {
    if (!isObject(raw) || !Array.isArray(raw.personnes)) {
      throw new Error("JSON invalide : objet avec un tableau personnes attendu.");
    }

    const personnes = raw.personnes.map(normalizePersonne).filter(Boolean);
    if (!personnes.length) {
      throw new Error("Aucune personne dans le JSON.");
    }

    let ects = null;
    if (raw.ects === undefined) {
      ects = 3;
    } else if (Number(raw.ects) > 0) {
      ects = Number(raw.ects);
    }

    return {
      bip: asText(raw.bip),
      ects,
      mentionBip: raw.mentionBip !== false,
      dateDebut: asDate(raw.dateDebut),
      dateFin: asDate(raw.dateFin),
      dateVirtuelle: asDate(raw.dateVirtuelle),
      lycee: asText(raw.lycee),
      logoLycee: safeLogoPath(raw.logoLycee),
      proviseur: asText(raw.proviseur),
      codeErasmus: asText(raw.codeErasmus),
      oid: asText(raw.oid),
      personnes,
    };
  }

  function ordreDepuisJson(raw) {
    if (!isObject(raw)) {
      return null;
    }
    if (raw.ordreLangues === ORDRE_FIN || raw.ordreLangues === ORDRE_RECTO) {
      return raw.ordreLangues;
    }
    return null;
  }

  function stockerOrdre(valeur) {
    const ordre = valeur === ORDRE_FIN ? ORDRE_FIN : ORDRE_RECTO;
    ordreLangues.checked = ordre === ORDRE_FIN;
    try {
      localStorage.setItem(ORDRE_KEY, ordre);
    } catch (error) {
      statut.textContent = "Le navigateur refuse d’enregistrer l’ordre des langues.";
    }
  }

  function ordreCourant() {
    return ordreLangues.checked ? ORDRE_FIN : ORDRE_RECTO;
  }

  function fill(node, selector, text) {
    const el = node.querySelector(selector);
    if (el) {
      el.textContent = text;
    }
  }

  function fillAll(node, selector, text) {
    node.querySelectorAll(selector).forEach((el) => {
      el.textContent = text;
    });
  }

  function applyFrancais(article) {
    fill(article, "h2", "pour archive");
    article.querySelector(".corps")?.setAttribute("aria-label", "pour archive");
    fill(article, ".intro", "Nous confirmons que");
    fill(article, ".lieu-avant", "au ");
    fill(article, ".lieu-apres", ", Rennes, France");
    fill(article, ".periode-avant", "du ");
    fill(article, ".periode-entre", " au ");
    fill(article, ".ects-avant", "Le nombre de crédits attribués est de ");
    fill(article, ".ects-entre", " et la formation a été ");
    fill(article, ".acheve", "suivie avec succès");
    fill(article, ".virtuelle-avant", "La composante virtuelle a eu lieu le ");
    article.querySelector(".signataire")?.remove();
    article.querySelector(".codes")?.remove();
    const zones = article.querySelectorAll(".zone");
    zones[0]?.setAttribute("aria-label", "Cachet de l’établissement");
    zones[1]?.setAttribute("aria-label", "Signature");
    const republique = article.querySelector("img[src$='logo_republique-francaise.svg']");
    if (republique) {
      republique.alt = "République française";
    }
    const ue = article.querySelector(".logo-ue");
    if (ue) {
      ue.alt = "Union européenne";
    }
  }

  function renderCertificat(data, personne, lang) {
    const article = modele.content.firstElementChild.cloneNode(true);
    const logo = article.querySelector(".logo-lycee");
    const ects = article.querySelector(".ects");
    const virtuelle = article.querySelector(".virtuelle");
    const francais = lang === "fr";

    article.lang = francais ? "fr" : "en";
    if (francais) {
      applyFrancais(article);
    }

    logo.src = data.logoLycee;
    logo.alt = data.lycee || (francais ? "Établissement d’accueil" : "Host school");

    const today = todayPlain();
    fillTime(article, ".date-jour", toIsoDate(today), lang);

    fill(article, ".prenom", personne.prenom);
    fill(article, ".patronyme", personne.nom);
    fillAffiliation(article, personne, lang);
    fill(article, ".participation", francais
      ? (data.mentionBip ? "a participé au workshop Erasmus+ BIP" : "a participé au workshop Erasmus+")
      : (data.mentionBip ? "has participated in the Erasmus+ BIP workshop" : "has participated in the Erasmus+ workshop"));
    fill(article, ".bip", data.bip);
    fillAll(article, ".etablissement", data.lycee);
    fillTime(article, ".date-debut", data.dateDebut, lang);
    fillTime(article, ".date-fin", data.dateFin, lang);
    if (!francais) {
      fill(article, ".proviseur", data.proviseur);
      fill(article, ".code-erasmus", data.codeErasmus);
      fill(article, ".oid", data.oid);
      if (!data.codeErasmus && !data.oid) {
        article.querySelector(".codes")?.remove();
      }
    }

    if (personne.role === "etudiant" && data.ects) {
      fill(article, ".ects-valeur", `${data.ects} ECTS`);
    } else {
      ects.remove();
    }

    if (data.dateVirtuelle) {
      fillTime(article, ".date-virtuelle", data.dateVirtuelle, lang);
    } else {
      virtuelle.remove();
    }

    const nom = [personne.prenom, personne.nom].filter(Boolean).join(" ");
    const titre = francais ? "pour archive" : "Confirmation of attendance";
    article.setAttribute("aria-label", `${titre} — ${nom}`);

    return article;
  }

  // Colle chaque baseline sur le filet suivant. Pas = line-height du labeur.
  function alignBaselines() {
    const articles = main.querySelectorAll("article");
    if (!articles.length) {
      return;
    }

    const step = parseFloat(getComputedStyle(articles[0]).lineHeight);
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    if (!step || !rem) {
      return;
    }

    articles.forEach((article) => {
      const articleStyle = getComputedStyle(article);
      const origin = article.getBoundingClientRect().top + (parseFloat(articleStyle.borderTopWidth) || 0);
      const footer = article.querySelector(":scope > footer");
      const blocks = [...article.querySelectorAll("h2, p")].filter((block) => !footer?.contains(block));

      const nom = article.querySelector(".nom");
      const prenom = nom?.querySelector(".prenom");
      const patronyme = nom?.querySelector(".patronyme");
      if (nom && prenom && patronyme) {
        patronyme.style.display = "";
        patronyme.style.marginTop = "";
        nom.style.marginBottom = "";
        if (patronyme.offsetTop > prenom.offsetTop + 1) {
          patronyme.style.display = "block";
          patronyme.style.marginTop = `${-step / rem}rem`;
          nom.style.marginBottom = `${step / rem}rem`;
        }
      }

      const baselineOf = (block) => {
        const probe = document.createElement("span");
        probe.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
        block.append(probe);
        const y = probe.getBoundingClientRect().top;
        probe.remove();
        return y;
      };

      const shiftToNextLine = (y) => {
        let remainder = (y - origin) % step;
        if (remainder < 0) {
          remainder += step;
        }
        if (Math.min(remainder, step - remainder) <= 0.75) {
          return 0;
        }
        return (step - remainder) / rem;
      };

      blocks.forEach((block) => {
        block.style.marginTop = "0px";
      });
      blocks.forEach((block) => {
        const shift = shiftToNextLine(baselineOf(block));
        if (shift) {
          block.style.marginTop = `${shift}rem`;
        }
      });

      const corps = article.querySelector(".corps");
      const intro = corps?.querySelector("p");
      const nudge = (block, steps) => {
        if (!block) {
          return;
        }
        const current = parseFloat(block.style.marginTop) || 0;
        block.style.marginTop = `${current + steps * step / rem}rem`;
      };
      nudge(intro, -1);
      nudge(article.querySelector(".nom"), -1);

      if (!footer) {
        return;
      }
      footer.style.transform = "none";
      const anchor = footer.querySelector("p");
      if (!anchor) {
        return;
      }
      const shift = shiftToNextLine(baselineOf(anchor));
      if (shift) {
        footer.style.transform = `translateY(${shift}rem)`;
      }
    });
  }

  function render(data) {
    configChargee = data;
    const fragment = document.createDocumentFragment();
    const fin = ordreCourant() === ORDRE_FIN;
    if (fin) {
      data.personnes.forEach((personne) => {
        fragment.append(renderCertificat(data, personne, "en"));
      });
      data.personnes.forEach((personne) => {
        fragment.append(renderCertificat(data, personne, "fr"));
      });
    } else {
      data.personnes.forEach((personne) => {
        fragment.append(renderCertificat(data, personne, "en"));
        fragment.append(renderCertificat(data, personne, "fr"));
      });
    }

    main.replaceChildren(fragment);
    genererPdf.hidden = depuisConfig;
    document.title = `Confirmation of attendance — ${data.bip}`;
    const n = data.personnes.length;
    const ordre = fin
      ? "Versions françaises en fin de document."
      : "Anglais au recto, français au verso.";
    statut.textContent = `${n} personne${n > 1 ? "s" : ""} — ${data.bip}. ${ordre}`;
    document.fonts.ready.then(alignBaselines);
  }

  function showEmpty(message) {
    configChargee = null;
    const p = vide.cloneNode(true);
    p.id = "vide";
    p.textContent = message;
    main.replaceChildren(p);
    genererPdf.hidden = true;
    document.title = "Confirmation of attendance";
  }

  function readJsonFile(file) {
    if (!file) {
      return;
    }

    const namedJson = file.type === "application/json" || /\.json$/i.test(file.name);
    if (!namedJson) {
      jsonFile.setCustomValidity("Choisissez un fichier JSON.");
      jsonFile.reportValidity();
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const data = normalizeConfig(parsed);
        const ordre = ordreDepuisJson(parsed);
        if (ordre) {
          stockerOrdre(ordre);
        }
        jsonFile.setCustomValidity("");
        render(data);
      } catch (error) {
        const message = error instanceof Error ? error.message : "JSON illisible.";
        jsonFile.setCustomValidity(message);
        jsonFile.reportValidity();
        showEmpty(message);
        statut.textContent = message;
      }
    });
    reader.addEventListener("error", () => {
      const message = "Lecture du fichier impossible.";
      jsonFile.setCustomValidity(message);
      jsonFile.reportValidity();
      statut.textContent = message;
    });
    reader.readAsText(file);
  }

  genererPdf.addEventListener("click", () => {
    window.print();
  });

  jsonFile.addEventListener("change", () => {
    jsonFile.setCustomValidity("");
    readJsonFile(jsonFile.files?.[0]);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    readJsonFile(jsonFile.files?.[0]);
  });

  form.addEventListener("dragover", (event) => {
    event.preventDefault();
    form.classList.add("is-drop");
  });

  form.addEventListener("dragleave", () => {
    form.classList.remove("is-drop");
  });

  form.addEventListener("drop", (event) => {
    event.preventDefault();
    form.classList.remove("is-drop");
    const file = event.dataTransfer?.files?.[0];
    if (!file) {
      return;
    }

    const transfer = new DataTransfer();
    transfer.items.add(file);
    jsonFile.files = transfer.files;
    jsonFile.setCustomValidity("");
    readJsonFile(file);
  });

  try {
    ordreLangues.checked = localStorage.getItem(ORDRE_KEY) === ORDRE_FIN;
  } catch (error) {
    ordreLangues.checked = false;
  }

  ordreLangues.addEventListener("change", () => {
    stockerOrdre(ordreCourant());
    if (configChargee) {
      render(configChargee);
    }
  });

  const parametres = new URLSearchParams(window.location.search);
  if (parametres.has("reset")) {
    sessionStorage.removeItem("bip-certificat-config");
  }
  const depuisConfig = !parametres.has("reset") && parametres.get("depuis") === "config";
  if (!depuisConfig) {
    sessionStorage.removeItem("bip-certificat-config");
  }
  if (depuisConfig) {
    form.hidden = true;
    const memorise = sessionStorage.getItem("bip-certificat-config");
    if (memorise) {
      try {
        const parsed = JSON.parse(memorise);
        const ordre = ordreDepuisJson(parsed);
        if (ordre) {
          stockerOrdre(ordre);
        }
        render(normalizeConfig(parsed));
      } catch (error) {
        const message = error instanceof Error ? error.message : "JSON illisible.";
        form.hidden = false;
        showEmpty(message);
        statut.textContent = message;
      }
    } else {
      form.hidden = false;
      showEmpty("Aucune liste enregistrée dans cet onglet.");
      statut.textContent = "Aucune liste enregistrée dans cet onglet.";
    }
  }

  window.addEventListener("beforeprint", alignBaselines);
  window.addEventListener("afterprint", alignBaselines);

  const grille = document.querySelector("#grille");
  grille.addEventListener("click", () => {
    const visible = document.body.classList.toggle("is-grille");
    grille.setAttribute("aria-pressed", visible ? "true" : "false");
  });
})();
