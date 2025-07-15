// Aplicación principal - REFACTORIZADA CON VIEW MANAGER
import { CONFIG } from './config.js';
import { languageManager } from './language.js';
import { ratingManager } from './rating.js';
import { formManager } from './form.js';
import { rouletteManager } from './roulette.js';
import { viewManager } from './viewManager.js';
import { formatPrizeCode, showElement } from './utils.js';

class App {
  constructor() {
    this.codigoRecompensa = null;
    this.resenaBtn = null;
    this.googleTimerInterval = null;
  }

  /**
   * Inicializa la aplicación
   */
  init() {
    this.cacheElements();
    this.initializeModules();
    this.setupEventListeners();
    
    // Mostrar la vista inicial
    viewManager.showView('initial');
  }

  /**
   * Cachea los elementos principales del DOM
   */
  cacheElements() {
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
    viewManager.init();

    // Configurar callbacks
    formManager.setOnSubmit((formData) => this.handleFormSubmit(formData));
    rouletteManager.setOnSpinComplete((prize, rating) => this.handleSpinComplete(prize, rating));
  }

  /**
   * Configura los event listeners principales
   */
  setupEventListeners() {
    window.addEventListener('ratingConfirmed', (e) => {
      this.handleRatingConfirmed(e.detail.rating);
    });

    window.goToReview = () => {
      window.open(CONFIG.googleReviewUrl, '_blank');
      this.showSuccessMessage();
    };
  }

  /**
   * Maneja la confirmación de la valoración
   * @param {number} rating - Valoración seleccionada
   */
  handleRatingConfirmed(rating) {
    formManager.prepare(rating); // Prepara el formulario (lógica interna)
    viewManager.showView('form'); // Cambia a la vista del formulario
  }

  /**
   * Envía los datos del formulario a n8n en segundo plano
   * @param {object} payload - Datos completos a enviar
   */
  async sendDataToN8N(payload) {
    try {
      await fetch(CONFIG.n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('Error al enviar los datos a n8n:', error);
    }
  }

  /**
   * Maneja el envío del formulario
   * @param {object} formData - Datos básicos del formulario
   */
  handleFormSubmit(formData) {
    const rating = ratingManager.getRating();
    const payload = {
      ...formData,
      review: formData.feedback,
      rating: rating,
      lang: languageManager.getCurrentLanguage(),
      timestamp: new Date().toISOString()
    };
    delete payload.feedback;

    this.sendDataToN8N(payload);
    
    rouletteManager.prepare(rating);
    viewManager.showOverlay('roulette');
  }

  /**
   * Maneja la finalización del giro de la ruleta
   * @param {string} prize - Premio ganado
   * @param {number} rating - Valoración del usuario
   */
  handleSpinComplete(prize, rating) {
    viewManager.hideOverlay('roulette');

    const prizeCode = formatPrizeCode(prize, rating);
    this.codigoRecompensa.innerHTML = prizeCode;

    if (rating === 5) {
      showElement(this.resenaBtn);
      this.startGoogleTimer();
    }

    viewManager.showView('prize');
  }

  /**
   * Inicia el timer de Google
   */
  startGoogleTimer() {
    const googleTimerEl = document.getElementById('googleTimer');
    let timeLeft = 30 * 60; // 30 minutos en segundos

    this.googleTimerInterval = setInterval(() => {
      if (googleTimerEl) {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        googleTimerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 60) { // Resaltar en el último minuto
          googleTimerEl.style.color = '#ff0000';
        }
        
        timeLeft--;
        
        if (timeLeft < 0) {
          clearInterval(this.googleTimerInterval);
          googleTimerEl.textContent = '¡EXPIRADO!';
        }
      }
    }, 1000);
  }

  /**
   * Muestra mensaje de éxito
   */
  showSuccessMessage() {
    if (this.googleTimerInterval) {
      clearInterval(this.googleTimerInterval);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
  window.app = app;
});
