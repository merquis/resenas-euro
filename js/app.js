// Aplicación principal - REFACTORIZADA
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
    this.watchingInterval = null;
  }

  /**
   * Inicializa la aplicación
   */
  init() {
    this.cacheElements();
    this.initializeModules();
    this.setupEventListeners();
    this.startWatchingCounter();
    this.setupPrizesToday();
    
    // Mostrar la vista inicial
    viewManager.showView('rating');
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
   * Configura premios de hoy
   */
  setupPrizesToday() {
    const prizesTodayEl = document.getElementById('prizesToday');
    if (prizesTodayEl) {
      const basePrizes = Math.floor(Math.random() * 10) + 5;
      prizesTodayEl.textContent = basePrizes;
    }
  }

  /**
   * Contador de personas viendo
   */
  startWatchingCounter() {
    const watchingEl = document.getElementById('watchingCount');
    let watchingCount = Math.floor(Math.random() * 5) + 5;
    
    this.watchingInterval = setInterval(() => {
      const change = Math.floor(Math.random() * 3) - 1;
      watchingCount = Math.max(5, Math.min(10, watchingCount + change));
      if (watchingEl) watchingEl.textContent = watchingCount;
    }, 3000);
  }

  /**
   * Maneja la confirmación de la valoración
   * @param {number} rating - Valoración seleccionada
   */
  handleRatingConfirmed(rating) {
    formManager.show(rating); // Prepara el formulario (lógica interna)
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
    
    rouletteManager.prepare(rating); // Prepara la ruleta
    viewManager.showView('roulette'); // Muestra la ruleta
  }

  /**
   * Maneja la finalización del giro de la ruleta
   * @param {string} prize - Premio ganado
   * @param {number} rating - Valoración del usuario
   */
  handleSpinComplete(prize, rating) {
    const prizeCode = formatPrizeCode(prize, rating);
    this.codigoRecompensa.textContent = prizeCode;

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
    let timeLeft = 30;

    this.googleTimerInterval = setInterval(() => {
      if (googleTimerEl) {
        googleTimerEl.textContent = `00:${timeLeft.toString().padStart(2, '0')}`;
        if (timeLeft <= 10) {
          googleTimerEl.style.color = '#ff0000';
          googleTimerEl.style.animation = 'timerPulse 0.5s infinite';
        }
        timeLeft--;
        if (timeLeft < 0) {
          clearInterval(this.googleTimerInterval);
          googleTimerEl.textContent = '¡EXPIRANDO!';
        }
      }
    }, 1000);
  }

  /**
   * Muestra mensaje de éxito
   */
  showSuccessMessage() {
    clearInterval(this.googleTimerInterval);
    clearInterval(this.watchingInterval);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
  window.app = app;
});
