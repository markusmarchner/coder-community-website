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

const supportedLegalLanguages = ["de", "en", "fr", "es"];

function storedLegalLanguage() {
  const stored = localStorage.getItem("coder-language");
  if (supportedLegalLanguages.includes(stored)) return stored;
  const browser = navigator.language?.slice(0, 2);
  return supportedLegalLanguages.includes(browser) ? browser : "de";
}

function applyLegalLanguage(language) {
  const lang = supportedLegalLanguages.includes(language) ? language : "de";
  localStorage.setItem("coder-language", lang);
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

  document.querySelectorAll("[data-legal-lang]").forEach((button) => {
    button.classList.toggle("active", button.dataset.legalLang === lang);
  });
}

document.querySelectorAll("[data-legal-lang]").forEach((button) => {
  button.addEventListener("click", () => applyLegalLanguage(button.dataset.legalLang));
});

applyLegalLanguage(storedLegalLanguage());
