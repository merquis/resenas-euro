// Módulo de gestión de idiomas
import { translations, languageFlags, languageCodes } from './translations.js';
import { CONFIG } from './config.js';

export class LanguageManager {
  constructor() {
    this.currentLanguage = CONFIG.defaultLanguage;
    this.dropdown = null;
    this.button = null;
    this.options = null;
    this.currentFlag = null;
    this.currentLang = null;
  }

  /**
   * Inicializa el gestor de idiomas
   */
  init() {
    this.cacheElements();
    this.setupEventListeners();
    this.initializeFlags();
    this.updateLanguage(this.currentLanguage);
  }

  /**
   * Cachea los elementos del DOM
   */
  cacheElements() {
    this.dropdown = document.getElementById('languageDropdown');
    this.button = document.getElementById('languageBtn');
    this.options = document.getElementById('languageOptions');
    this.currentFlag = document.getElementById('currentFlag');
    this.currentLang = document.getElementById('currentLang');
  }

  /**
   * Configura los event listeners
   */
  setupEventListeners() {
    // Toggle dropdown
    this.button.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleDropdown();
    });

    // Selección de idioma
    this.options.addEventListener('click', (e) => {
      const option = e.target.closest('.language-option');
      if (option) {
        const lang = option.dataset.lang;
        this.updateLanguage(lang);
        this.closeDropdown();
      }
    });

    // Cerrar dropdown al hacer clic fuera
    document.addEventListener('click', () => this.closeDropdown());
  }

  /**
   * Inicializa las banderas
   */
  initializeFlags() {
    document.querySelectorAll('.language-option .flag').forEach(flagEl => {
      const lang = flagEl.parentElement.dataset.lang;
      if (languageFlags[lang]) {
        flagEl.style.backgroundImage = `url('${languageFlags[lang]}')`;
      }
    });
  }

  /**
   * Actualiza el idioma de la aplicación
   * @param {string} lang - Código del idioma
   */
  updateLanguage(lang) {
    this.currentLanguage = lang;
    
    // Actualizar bandera y código
    this.currentFlag.style.backgroundImage = `url('${languageFlags[lang]}')`;
    this.currentLang.textContent = languageCodes[lang];

    // Actualizar opción activa
    document.querySelectorAll('.language-option').forEach(opt => {
      opt.classList.toggle('active', opt.dataset.lang === lang);
    });

    // Actualizar textos
    this.updateTexts(lang);

    // Actualizar atributo lang del documento
    document.documentElement.lang = lang;

    // Disparar evento personalizado
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
  }

  /**
   * Actualiza todos los textos de la página
   * @param {string} lang - Código del idioma
   */
  updateTexts(lang) {
    const trans = translations[lang];

    // Actualizar elementos con data-text
    document.querySelectorAll('[data-text]').forEach(el => {
      const key = el.dataset.text;
      if (trans[key]) {
        el.textContent = trans[key];
      }
    });

    // Actualizar placeholders
    document.querySelectorAll('[data-placeholder]').forEach(el => {
      const key = el.dataset.placeholder;
      if (trans[key]) {
        el.placeholder = trans[key];
      }
    });
  }

  /**
   * Obtiene la traducción actual
   * @param {string} key - Clave de traducción
   * @param {Object} vars - Variables para interpolación
   * @returns {string} Texto traducido
   */
  getTranslation(key, vars = {}) {
    let text = translations[this.currentLanguage][key] || key;
    for (const v in vars) {
      text = text.replace(new RegExp(`{{${v}}}`, 'g'), vars[v]);
    }
    return text;
  }

  /**
   * Obtiene los premios traducidos
   * @returns {Array} Array de premios
   */
  getTranslatedPrizes() {
    return translations[this.currentLanguage].prizes;
  }

  /**
   * Toggle del dropdown
   */
  toggleDropdown() {
    this.dropdown.classList.toggle('open');
  }

  /**
   * Cierra el dropdown
   */
  closeDropdown() {
    this.dropdown.classList.remove('open');
  }

  /**
   * Obtiene el idioma actual
   * @returns {string} Código del idioma actual
   */
  getCurrentLanguage() {
    return this.currentLanguage;
  }
}

// Exportar instancia singleton
export const languageManager = new LanguageManager();
