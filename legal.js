const legalSharedTranslations = {
  de: {
    back: "Zurück zur Startseite",
    languageAria: "Sprache auswählen",
    legalAria: "Rechtliches",
    imprint: "Impressum",
    privacy: "Datenschutz",
    terms: "Nutzungsbedingungen",
    cookies: "Cookies",
    officialGerman:
      "Hinweis: Die deutsche Fassung ist maßgeblich. Übersetzungen dienen der besseren Verständlichkeit.",
  },
  en: {
    back: "Back to homepage",
    languageAria: "Choose language",
    legalAria: "Legal links",
    imprint: "Imprint",
    privacy: "Privacy",
    terms: "Terms",
    cookies: "Cookies",
    officialGerman:
      "Note: The German version is authoritative. Translations are provided for convenience.",
  },
  fr: {
    back: "Retour à l’accueil",
    languageAria: "Choisir la langue",
    legalAria: "Liens juridiques",
    imprint: "Mentions légales",
    privacy: "Confidentialité",
    terms: "Conditions",
    cookies: "Cookies",
    officialGerman:
      "Remarque : la version allemande fait foi. Les traductions sont fournies à titre informatif.",
  },
  es: {
    back: "Volver al inicio",
    languageAria: "Elegir idioma",
    legalAria: "Enlaces legales",
    imprint: "Aviso legal",
    privacy: "Privacidad",
    terms: "Términos",
    cookies: "Cookies",
    officialGerman:
      "Nota: la versión alemana es la vinculante. Las traducciones se ofrecen para facilitar la comprensión.",
  },
};

const legalAppTranslations = {
  de: { backKeeper: "Zu KeeperSync Studio", backLight: "Zu Coder light", support: "Support", websitePrivacy: "Website-Datenschutz" },
  en: { backKeeper: "Back to KeeperSync Studio", backLight: "Back to Coder light", support: "Support", websitePrivacy: "Website privacy" },
  fr: { backKeeper: "Retour à KeeperSync Studio", backLight: "Retour à Coder light", support: "Assistance", websitePrivacy: "Confidentialité du site" },
  es: { backKeeper: "Volver a KeeperSync Studio", backLight: "Volver a Coder light", support: "Soporte", websitePrivacy: "Privacidad del sitio" },
};
Object.keys(legalAppTranslations).forEach((lang) => Object.assign(legalSharedTranslations[lang], legalAppTranslations[lang]));

const supportedLegalLanguages = ["de", "en", "fr", "es"];

function storedLegalLanguage() {
  const linkedLanguage = location.hash.slice(1);
  if (supportedLegalLanguages.includes(linkedLanguage) && document.getElementById(linkedLanguage)) return linkedLanguage;
  try {
    const stored = localStorage.getItem("coder-language");
    if (supportedLegalLanguages.includes(stored)) return stored;
  } catch { /* Optional preference storage. */ }
  const browser = navigator.language?.slice(0, 2).toLowerCase();
  return supportedLegalLanguages.includes(browser) ? browser : "de";
}

function applyLegalLanguage(language) {
  const lang = supportedLegalLanguages.includes(language) ? language : "de";
  try { localStorage.setItem("coder-language", lang); } catch { /* Optional preference storage. */ }
  document.documentElement.lang = lang;

  document.querySelectorAll("[data-legal-i18n]").forEach((element) => {
    const key = element.dataset.legalI18n;
    const text = legalSharedTranslations[lang]?.[key] || legalSharedTranslations.de[key];
    if (text) element.textContent = text;
  });

  document.querySelectorAll("[data-legal-i18n-attr]").forEach((element) => {
    element.dataset.legalI18nAttr.split(",").forEach((entry) => {
      const [attribute, key] = entry.split(":").map((value) => value.trim());
      const text = legalSharedTranslations[lang]?.[key] || legalSharedTranslations.de[key];
      if (attribute && text) element.setAttribute(attribute, text);
    });
  });

  document.querySelectorAll("[data-legal-section]").forEach((section) => {
    section.hidden = section.dataset.legalSection !== lang;
  });

  const activeSection = document.querySelector(`[data-legal-section="${lang}"]`);
  const heading = activeSection?.querySelector("h1");
  if (heading) document.title = `${heading.textContent} | Coder`;
  const description = document.querySelector('meta[name="description"]');
  if (description && activeSection?.dataset.description) description.content = activeSection.dataset.description;

  document.querySelectorAll("[data-legal-lang]").forEach((button) => {
    const active = button.dataset.legalLang === lang;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

document.querySelectorAll("[data-legal-lang]").forEach((button) => {
  button.addEventListener("click", () => {
    const lang = button.dataset.legalLang;
    if (supportedLegalLanguages.includes(location.hash.slice(1)) && document.getElementById(lang)) {
      history.replaceState(null, "", `#${lang}`);
    }
    applyLegalLanguage(lang);
  });
});

applyLegalLanguage(storedLegalLanguage());

window.addEventListener("hashchange", () => applyLegalLanguage(storedLegalLanguage()));
