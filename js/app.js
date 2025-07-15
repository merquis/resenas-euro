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
    this.currentFormData = null; // Para guardar temporalmente los datos del formulario
  }

  /**
   * Inicializa la aplicación
   */
  init() {
    this.cacheElements();
    this.initializeModules();
    this.setupEventListeners();
    this.startWatchingCounter();
    
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
   * Contador de personas viendo
   */
  startWatchingCounter() {
    const watchingEl = document.getElementById('watchingCount');
    if (!watchingEl) return;

    let watchingCount = Math.floor(Math.random() * 5) + 1;
    watchingEl.textContent = watchingCount;

    this.watchingInterval = setInterval(() => {
      // Variar entre 1 y 5
      const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
      watchingCount = Math.max(1, Math.min(5, watchingCount + change));
      watchingEl.textContent = watchingCount;
    }, 3000);
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
    
    // Guardamos los datos del formulario y la valoración para usarlos después
    this.currentFormData = {
      ...formData,
      rating: rating,
      lang: languageManager.getCurrentLanguage(),
      timestamp: new Date().toISOString()
    };
    
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

    // Generamos el código y lo que se mostrará en la UI por separado
    const randomPart = Math.random().toString().slice(2, 5); // Generamos 3 dígitos aleatorios
    const justTheCode = `EURO-${randomPart}${rating}`;
    const displayCode = `${prize}<br>${justTheCode}`;

    this.codigoRecompensa.innerHTML = displayCode;

    // Ahora construimos el payload final con las claves correctas
    const payload = {
      ...this.currentFormData,
      review: this.currentFormData.feedback,
      premio: prize,
      codigoPremio: justTheCode
    };
    delete payload.feedback; // Eliminamos la clave original

    this.sendDataToN8N(payload);
    this.currentFormData = null; // Limpiamos los datos guardados

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
    if (this.watchingInterval) {
      clearInterval(this.watchingInterval);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
  window.app = app;
});
