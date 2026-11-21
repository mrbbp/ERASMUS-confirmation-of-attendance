(() => {
  const { t, isFr: IS_FR } = window.BipLang;
  const DEFAULT_STATE_LOGO = "medias/logo_republique-francaise.svg";
  const DEFAULT_HOST_LOGO = "medias/logo_breq.svg";
  const DROP_HINT = t("dropJson");
  const TITRE_EN_DEFAUT = "legal representative";
  const TITRE_FR_DEFAUT = "le responsable légal";

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

  function isObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  function asText(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function asCity(raw) {
    if (!isObject(raw)) {
      return "";
    }
    const city = asText(raw.city) || asText(raw.ville);
    return city === "undefined" ? "" : city;
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

  function safeLogoPath(path, fallback) {
    const text = asText(path);
    if (!text || text.includes("..") || text.startsWith("/") || /^[a-z]+:/i.test(text)) {
      return fallback;
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

  function fillAffiliation(article, personne, lang) {
    const prefix = personne.role === "teacher"
      ? (lang === "fr" ? "enseignant accompagnateur de" : "accompanying teacher of")
      : (lang === "fr" ? "étudiant de" : "student of");
    const school = personne.sendingInstitution || "";
    const country = paysNom(personne.country, lang);
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

  function titreFrSansArticle(titre) {
    return titre.replace(/^(?:l[ea]|l['’])\s+/i, "").replace(/^l['’]/i, "");
  }

  function titreEnAvecThe(titre) {
    return /^the\s/i.test(titre) ? titre : `the ${titre}`;
  }

  function fillCodes(article, data, lang) {
    const codes = article.querySelector(".codes");
    if (!codes) {
      return;
    }

    const erasmus = asText(data.codeErasmus);
    const oid = asText(data.oid);
    const erasmusLine = codes.querySelector(".code-erasmus-ligne");
    const oidLine = codes.querySelector(".oid-ligne");
    const br = codes.querySelector("br");

    if (erasmus) {
      fill(codes, ".code-erasmus", erasmus);
      fill(codes, ".code-label", lang === "fr" ? "Code Erasmus " : "Erasmus code ");
    } else {
      erasmusLine?.remove();
      br?.remove();
    }

    if (oid) {
      fill(codes, ".oid", oid);
    } else {
      oidLine?.remove();
      br?.remove();
    }

    if (!erasmus && !oid) {
      codes.remove();
    }
  }

  function fillSignataire(article, data, lang) {
    const signataire = article.querySelector(".signataire");
    const codes = article.querySelector(".codes");

    if (!IS_FR) {
      signataire?.remove();
      codes?.remove();
      return;
    }

    const nom = asText(data.legalRepresentative);
    const host = asText(data.host);
    const titreEn = asText(data.titreEn) || TITRE_EN_DEFAUT;
    const titreFr = asText(data.titreFr) || TITRE_FR_DEFAUT;

    if (!signataire) {
      fillCodes(article, data, lang);
      return;
    }

    if (data.delegation) {
      signataire.classList.add("delegation");
      signataire.textContent = lang === "fr"
        ? `Pour ${titreFr} et par délégation, ${nom}`
        : `For ${titreEnAvecThe(titreEn)} and by delegation, ${nom}`;
    } else if (lang === "fr") {
      signataire.textContent = `${nom}, ${titreFrSansArticle(titreFr)} du ${host}`;
    } else {
      signataire.textContent = `${nom}, ${titreEn} of ${host}`;
    }

    fillCodes(article, data, lang);
  }

  function applyFrancais(article, data) {
    fill(article, "h2", "pour conformité");
    article.querySelector(".cachet")?.remove();
    article.querySelector(".corps")?.setAttribute("aria-label", "pour conformité");
    fill(article, ".intro", "Nous confirmons que");
    fill(article, ".lieu-avant", "au ");
    fill(article, ".periode-avant", "du ");
    fill(article, ".periode-entre", " au ");
    fill(article, ".ects-avant", "Le nombre de crédits attribués est de ");
    fill(article, ".ects-entre", " et la formation a été ");
    fill(article, ".acheve", "suivie avec succès");
    fill(article, ".virtuelle-avant", "La composante virtuelle a eu lieu le ");
    const city = asText(data.city);
    fill(article, ".lieu-apres", city ? `, ${city}, France` : ", France");
    const zones = article.querySelectorAll(".zone");
    zones[0]?.setAttribute("aria-label", "Cachet de l’établissement");
    zones[1]?.setAttribute("aria-label", "Signature");
    const etat = article.querySelector(".logo-etat");
    if (etat) {
      etat.alt = "République française";
    }
    const ue = article.querySelector(".logo-ue");
    if (ue) {
      ue.alt = "Union européenne";
    }
  }

  function normalizePersonne(raw) {
    if (!isObject(raw)) {
      return null;
    }

    const familyName = asText(raw.familyName) || asText(raw.nom);
    if (!familyName) {
      return null;
    }

    const role = asText(raw.role);
    const teacher = role === "teacher" || role === "enseignant";

    return {
      familyName,
      givenName: asText(raw.givenName) || asText(raw.prenom),
      country: asText(raw.country) || asText(raw.pays) || null,
      sendingInstitution: asText(raw.sendingInstitution) || asText(raw.etablissementEnvoi) || null,
      role: teacher ? "teacher" : "student",
    };
  }

  function asTitle(raw) {
    if (typeof raw.title === "string") {
      return raw.title.trim();
    }
    if (typeof raw.bip === "string") {
      return raw.bip.trim();
    }
    return "";
  }

  function asBipMention(raw) {
    if (typeof raw.bip === "boolean") {
      return raw.bip;
    }
    return raw.mentionBip !== false;
  }

  function frEtablissementFrom(raw) {
    if (!isObject(raw)) {
      return {
        legalRepresentative: "",
        titreFr: "",
        titreEn: "",
        delegation: false,
        codeErasmus: "",
        oid: "",
      };
    }

    return {
      legalRepresentative: asText(raw.legalRepresentative) || asText(raw.proviseur),
      titreFr: asText(raw.titreFr),
      titreEn: asText(raw.titreEn),
      delegation: raw.delegation === true,
      codeErasmus: asText(raw.codeErasmus),
      oid: asText(raw.oid),
    };
  }

  function normalizeConfig(raw) {
    if (!isObject(raw)) {
      throw new Error(t("invalidJson"));
    }

    const source = Array.isArray(raw.participants)
      ? raw.participants
      : Array.isArray(raw.personnes)
        ? raw.personnes
        : null;
    if (!source) {
      throw new Error(t("invalidJson"));
    }

    const participants = source.map(normalizePersonne).filter(Boolean);
    if (!participants.length) {
      throw new Error(t("noParticipants"));
    }

    let ects = null;
    if (raw.ects === undefined) {
      ects = 3;
    } else if (Number(raw.ects) > 0) {
      ects = Number(raw.ects);
    }

    return {
      version: "v2",
      title: asTitle(raw),
      ects,
      bip: asBipMention(raw),
      startDate: asDate(raw.startDate) || asDate(raw.dateDebut),
      endDate: asDate(raw.endDate) || asDate(raw.dateFin),
      virtualDate: asDate(raw.virtualDate) || asDate(raw.dateVirtuelle),
      host: asText(raw.host) || asText(raw.lycee),
      city: asCity(raw),
      logo: safeLogoPath(raw.logo || raw.logoLycee, DEFAULT_HOST_LOGO),
      stateLogo: safeLogoPath(raw.stateLogo, DEFAULT_STATE_LOGO),
      ...frEtablissementFrom(raw),
      participants,
    };
  }

  function isV2(raw) {
    return isObject(raw) && raw.version === "v2";
  }

  function normalizeEtablissement(raw) {
    if (!isObject(raw)) {
      return {
        version: "v2",
        host: "",
        city: "",
        logo: "",
        stateLogo: DEFAULT_STATE_LOGO,
        ...frEtablissementFrom(null),
      };
    }

    return {
      version: "v2",
      host: asText(raw.host) || asText(raw.lycee),
      city: asCity(raw),
      logo: asText(raw.logo) || asText(raw.logoLycee),
      stateLogo: safeLogoPath(raw.stateLogo, DEFAULT_STATE_LOGO),
      ...frEtablissementFrom(raw),
    };
  }

  function renderCertificat(modele, data, personne, lang) {
    const article = modele.content.firstElementChild.cloneNode(true);
    const logo = article.querySelector(".logo-lycee");
    const stateLogo = article.querySelector(".logo-etat");
    const ects = article.querySelector(".ects");
    const virtuelle = article.querySelector(".virtuelle");
    const francais = lang === "fr";

    article.lang = francais ? "fr" : "en";
    if (francais) {
      applyFrancais(article, data);
    }

    const hostLogo = safeLogoPath(data.logo, DEFAULT_HOST_LOGO);
    const republic = safeLogoPath(data.stateLogo, DEFAULT_STATE_LOGO);

    if (logo) {
      logo.src = hostLogo;
      logo.alt = data.host || (francais ? "Établissement d’accueil" : "Host HEI");
    }

    if (stateLogo) {
      stateLogo.src = republic;
      if (!francais) {
        stateLogo.alt = republic === DEFAULT_STATE_LOGO ? "French Republic" : "Logo";
      } else if (republic !== DEFAULT_STATE_LOGO) {
        stateLogo.alt = "Logo";
      }
    }

    fillTime(article, ".date-jour", toIsoDate(todayPlain()), lang);
    fill(article, ".prenom", personne.givenName);
    fill(article, ".patronyme", personne.familyName);
    fillAffiliation(article, personne, lang);
    fill(article, ".participation", francais
      ? (data.bip ? "a participé au workshop Erasmus+ BIP" : "a participé au workshop Erasmus+")
      : (data.bip
        ? "has participated in the Erasmus+ BIP workshop"
        : "has participated in the Erasmus+ workshop"));
    fill(article, ".bip", data.title);
    fillAll(article, ".etablissement", data.host);
    if (!francais) {
      fill(article, ".ville-date", data.city ? `, ${data.city}` : "");
      fill(article, ".lieu-apres", data.city ? `, ${data.city}, France` : ", France");
    } else {
      fill(article, ".ville-date", data.city ? `, ${data.city}` : "");
    }
    fillTime(article, ".date-debut", data.startDate, lang);
    fillTime(article, ".date-fin", data.endDate, lang);
    fillSignataire(article, data, lang);

    if (personne.role === "student" && data.ects) {
      fill(article, ".ects-valeur", `${data.ects} ECTS`);
    } else {
      ects?.remove();
    }

    if (data.virtualDate) {
      fillTime(article, ".date-virtuelle", data.virtualDate, lang);
    } else {
      virtuelle?.remove();
    }

    const nom = [personne.givenName, personne.familyName].filter(Boolean).join(" ");
    const titre = francais ? "pour conformité" : "Confirmation of attendance";
    article.setAttribute("aria-label", `${titre} — ${nom}`);

    return article;
  }

  function alignBaselines(container) {
    const articles = container.querySelectorAll("article");
    if (!articles.length) {
      return;
    }

    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    if (!rem) {
      return;
    }

    articles.forEach((article) => {
      const articleStyle = getComputedStyle(article);
      const step = parseFloat(articleStyle.lineHeight);
      if (!step) {
        return;
      }
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

  function renderCertificates(container, data) {
    const modele = document.querySelector("#modele-certificat");
    if (!modele || !container) {
      return;
    }

    const fragment = document.createDocumentFragment();
    data.participants.forEach((personne) => {
      fragment.append(renderCertificat(modele, data, personne, "en"));
      if (IS_FR) {
        fragment.append(renderCertificat(modele, data, personne, "fr"));
      }
    });

    container.replaceChildren(fragment);
    container.hidden = false;
    document.title = data.title
      ? t("certTitleNamed", { title: data.title })
      : t("certTitle");
    document.fonts.ready.then(() => {
      requestAnimationFrame(() => alignBaselines(container));
    });
  }

  window.BipEn = {
    DEFAULT_STATE_LOGO,
    DEFAULT_HOST_LOGO,
    MONTHS_EN,
    isObject,
    isV2,
    asText,
    safeLogoPath,
    frEtablissementFrom,
    normalizeConfig,
    normalizeEtablissement,
    renderCertificates,
    alignBaselines,
  };

  const form = document.querySelector("#json-form");
  if (!form) {
    return;
  }

  const jsonFile = document.querySelector("#json-file");
  const dropZone = document.querySelector("#json-drop-zone");
  const dropText = document.querySelector("#json-drop-text");
  const main = document.querySelector("#certificats");
  const grille = document.querySelector("#grille");

  function setDropMessage(message, isError) {
    if (dropText) {
      dropText.textContent = message;
    }
    dropZone?.classList.toggle("is-error", Boolean(isError));
    if (jsonFile) {
      jsonFile.setCustomValidity(isError ? message : "");
      jsonFile.setAttribute("aria-invalid", isError ? "true" : "false");
    }
  }

  function readJsonFile(file) {
    if (!file) {
      return;
    }

    const namedJson = file.type === "application/json" || /\.json$/i.test(file.name);
    if (!namedJson) {
      setDropMessage(t("chooseJson"), true);
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const data = normalizeConfig(parsed);
        setDropMessage(DROP_HINT, false);
        renderCertificates(main, data);
      } catch (error) {
        const message = error instanceof Error ? error.message : t("unreadableJson");
        setDropMessage(message, true);
        main.replaceChildren();
        document.title = t("certTitle");
      }
    });
    reader.addEventListener("error", () => {
      setDropMessage(t("fileUnreadable"), true);
    });
    reader.readAsText(file);
  }

  jsonFile.addEventListener("change", () => {
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
    readJsonFile(file);
  });

  window.addEventListener("beforeprint", () => alignBaselines(main));
  window.addEventListener("afterprint", () => alignBaselines(main));

  grille?.addEventListener("click", () => {
    const visible = document.body.classList.toggle("is-grille");
    grille.setAttribute("aria-pressed", visible ? "true" : "false");
  });
})();
