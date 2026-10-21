// Run with jsdom available: node tests/i18n.test.cjs
const { JSDOM } = require('jsdom');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const languages = ['de', 'en', 'fr', 'es'];
const pages = ['index.html', 'performance/index.html', 'mobile/index.html', 'phone/index.html', 'watch/index.html', 'light/index.html', 'keepersync/index.html', 'impressum.html', 'datenschutz.html', 'terms.html', 'cookies.html', 'light/privacy.html', 'keepersync/datenschutz.html'];
function load(page, language, blockedStorage = false, hash = '') {
  const dom = new JSDOM(fs.readFileSync(path.join(root, page), 'utf8'), { url: `https://coderapp.app/${page}${hash}`, runScripts: 'outside-only' });
  const { window } = dom;
  Object.defineProperty(window.navigator, 'language', { value: language });
  if (blockedStorage) Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage disabled'); } });
  else window.localStorage.setItem('coder-language', language);
  for (const script of window.document.querySelectorAll('script[src]')) {
    const source = script.getAttribute('src');
    if (/^https?:/.test(source)) continue;
    const filename = source.startsWith('/') ? path.join(root, source) : path.resolve(root, path.dirname(page), source);
    vm.runInContext(fs.readFileSync(filename, 'utf8'), dom.getInternalVMContext(), { filename });
  }
  return dom;
}
let cases = 0;
for (const page of pages) {
  for (const blocked of [false, true]) {
    const dom = load(page, 'fr', blocked);
    const { document } = dom.window;
    assert.equal(document.documentElement.lang, 'fr', `${page}: initial language`);
    for (const lang of languages) {
      const button = document.querySelector(`[data-lang="${lang}"], [data-legal-lang="${lang}"]`);
      assert.ok(button, `${page}: missing ${lang} switch`);
      button.click();
      assert.equal(document.documentElement.lang, lang, page);
      assert.equal(button.getAttribute('aria-pressed'), 'true', page);
      const dict = vm.runInContext(`typeof translations !== 'undefined' ? translations['${lang}'] : legalSharedTranslations['${lang}']`, dom.getInternalVMContext());
      for (const el of document.querySelectorAll('[data-i18n], [data-legal-i18n]')) {
        const key = el.dataset.i18n || el.dataset.legalI18n;
        assert.ok(dict[key], `${page}/${lang}: missing ${key}`);
        assert.equal(el.textContent, dict[key], `${page}/${lang}/${key}`);
      }
      for (const el of document.querySelectorAll('[data-i18n-attr], [data-legal-i18n-attr]')) {
        for (const pair of (el.dataset.i18nAttr || el.dataset.legalI18nAttr).split(',')) {
          const [attr, key] = pair.split(':').map(v => v.trim());
          assert.ok(dict[key], `${page}/${lang}: missing attribute ${key}`);
          assert.equal(el.getAttribute(attr), dict[key]);
        }
      }
      const sections = [...document.querySelectorAll('[data-legal-section]')];
      if (sections.length) {
        assert.equal(sections.length, 4, page);
        const visible = sections.filter(el => !el.hidden);
        assert.equal(visible.length, 1, page);
        assert.equal(visible[0].lang, lang, page);
        assert.equal(document.title, `${visible[0].querySelector('h1').textContent} | Coder`);
      } else {
        assert.equal(document.title, dict[document.body.dataset.pageTitleKey]);
        assert.equal(document.querySelector('meta[name="description"]').content, dict[document.body.dataset.metaDescriptionKey]);
      }
      cases++;
    }
    dom.window.close();
  }
}
for (const page of ['light/privacy.html', 'keepersync/datenschutz.html']) {
  const dom = load(page, 'de', false, '#en');
  assert.equal(dom.window.document.documentElement.lang, 'en');
  dom.window.document.querySelector('[data-legal-lang="es"]').click();
  assert.equal(dom.window.location.hash, '#es');
  dom.window.close();
}
console.log(`PASS: ${pages.length} pages × 4 languages × normal/blocked storage = ${cases} language checks; privacy deep links verified.`);
