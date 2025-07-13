// Aplicación principal
import { CONFIG } from './config.js';
import { languageManager } from './language.js';
import { ratingManager } from './rating.js';
import { formManager } from './form.js';
import { rouletteManager } from './roulette.js';
import { showElement, hideElement, formatPrizeCode } from './utils.js';

class App {
  constructor() {
    this.container = null;
    this.header = null;
    this.ratingSection = null;
    this.codigoContainer = null;
    this.codigoRecompensa = null;
    this.resenaBtn = null;
  }

  /**
   * Inicializa la aplicación
   */
  init() {
    this.cacheElements();
    this.initializeModules();
    this.setupEventListeners();
  }

  /**
   * Cachea los elementos principales del DOM
   */
  cacheElements() {
    this.container = document.querySelector('.container');
    this.header = this.container.querySelector('.header');
    this.ratingSection = this.container.querySelector('.rating-section');
    this.codigoContainer = document.getElementById('codigoContainer');
    this.codigoRecompensa = document.getElementById('codigoRecompensa');
    this.resenaBtn = document.getElementById('resenaBtn');
  }

  /**
   * Inicializa todos los módulos
   */
  initializeModules() {
    languageManager.init();
    ratingManager.init();
    formManager.init();
    rouletteManager.init();

    // Configurar callbacks
    formManager.setOnSubmit(() => this.handleFormSubmit());
    rouletteManager.setOnSpinComplete((prize, rating) => this.handleSpinComplete(prize, rating));
  }

  /**
   * Configura los event listeners principales
   */
  setupEventListeners() {
    // Escuchar cuando se confirma la valoración
    window.addEventListener('ratingConfirmed', (e) => {
      this.handleRatingConfirmed(e.detail.rating);
    });

    // Función global para abrir Google Reviews
    window.goToReview = () => {
      window.open(CONFIG.googleReviewUrl, '_blank');
    };
  }

  /**
   * Maneja la confirmación de la valoración
   * @param {number} rating - Valoración seleccionada
   */
  handleRatingConfirmed(rating) {
    formManager.show(rating);
  }

  /**
   * Maneja el envío del formulario
   */
  handleFormSubmit() {
    const rating = ratingManager.getRating();
    hideElement(this.container);
    rouletteManager.show(rating);
  }

  /**
   * Maneja la finalización del giro de la ruleta
   * @param {string} prize - Premio ganado
   * @param {number} rating - Valoración del usuario
   */
  handleSpinComplete(prize, rating) {
    // Ocultar la ruleta
    rouletteManager.hide();

    // Actualizar el header con el mensaje de felicitación
    const title = this.header.querySelector('h1');
    const subtitle = this.header.querySelector('p');
    
    title.innerHTML = `<span class="emoji">🎉</span> <span>${languageManager.getTranslation('congratulations')}</span>`;
    subtitle.textContent = languageManager.getTranslation('enjoyPrize');

    // Ocultar secciones no necesarias
    hideElement(this.ratingSection);
    hideElement(formManager.formSection);

    // Generar y mostrar el código de premio
    const prizeCode = formatPrizeCode(prize, rating);
    this.codigoRecompensa.textContent = prizeCode;
    showElement(this.codigoContainer);

    // Si la valoración fue de 5 estrellas, mostrar botón de Google Reviews
    if (rating === 5) {
      showElement(this.resenaBtn);
    }

    // Mostrar el contenedor principal nuevamente
    showElement(this.container);
  }

  /**
   * Resetea la aplicación a su estado inicial
   */
  reset() {
    // Resetear todos los módulos
    ratingManager.reset();
    formManager.reset();
    rouletteManager.reset();

    // Resetear el header
    const title = this.header.querySelector('h1');
    const subtitle = this.header.querySelector('p');
    
    title.innerHTML = `<span class="emoji">🎁</span> <span data-text="title">${languageManager.getTranslation('title')}</span>`;
    subtitle.innerHTML = `<span data-text="subtitle">${languageManager.getTranslation('subtitle')}</span>`;

    // Mostrar/ocultar secciones
    showElement(this.ratingSection);
    hideElement(this.codigoContainer);
    hideElement(this.resenaBtn);
    hideElement(formManager.formSection);
  }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
  
  // Exponer la instancia globalmente para debugging (opcional)
  window.app = app;
});
