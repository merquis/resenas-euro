// Aplicación principal - REFACTORIZADA CON VIEW MANAGER
import { CONFIG } from './config.js';
import { languageManager } from './language.js';
import { ratingManager } from './rating.js';
import { formManager } from './form.js';
import { rouletteManager } from './roulette.js';
import { viewManager } from './viewManager.js';
import { formatPrizeCode, showElement, hideElement } from './utils.js';

class App {
  constructor() {
    this.codigoRecompensa = null;
    this.resenaBtn = null;
    this.googleTimerInterval = null;
    this.currentFormData = null; // Para guardar temporalmente los datos del formulario
    this.privacyPopup = null;
    this.closePrivacyPopupBtn = null;
    this.privacyPopupContent = null;
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
    this.privacyPopup = document.getElementById('privacyPopup');
    this.closePrivacyPopupBtn = document.getElementById('closePrivacyPopup');
    this.privacyPopupContent = document.getElementById('privacyPopupContent');
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

    // Listeners para el popup de privacidad
    document.body.addEventListener('click', (e) => {
      if (e.target.id === 'openPrivacyPopup') {
        e.preventDefault();
        this.showPrivacyPopup();
      }
    });
    this.closePrivacyPopupBtn.addEventListener('click', () => this.hidePrivacyPopup());
    this.privacyPopup.addEventListener('click', (e) => {
      if (e.target === this.privacyPopup) {
        this.hidePrivacyPopup();
      }
    });
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
    // Pausa de 1 segundo para que el usuario vea el premio en la ruleta
    setTimeout(() => {
      viewManager.hideOverlay('roulette');

      // Generamos el código internamente
      const randomPart = Math.random().toString().slice(2, 5); // Generamos 3 dígitos aleatorios
      const justTheCode = `EURO-${randomPart}${rating}`;
      
      // Mostramos el premio y el mensaje del email personalizado
      let prizeByEmailMessage = languageManager.getTranslation('prizeByEmail');
      const highlightedEmail = `<span class="highlight-email">${this.currentFormData.email}</span>`;
      prizeByEmailMessage = prizeByEmailMessage
        .replace('{{name}}', this.currentFormData.name)
        .replace('{{email}}', highlightedEmail)
        .replace(/\n/g, '<br>'); // Reemplazar saltos de línea con <br>
      
      const displayCode = `${prize}<br><span class="email-message">${prizeByEmailMessage}</span>`;
      this.codigoRecompensa.innerHTML = displayCode;

      // Ocultamos la sección de validez
      const expiryWarning = document.querySelector('.expiry-warning');
      if (expiryWarning) {
        hideElement(expiryWarning);
      }

      // Construimos y enviamos el payload a N8N
      const payload = {
        ...this.currentFormData,
        review: this.currentFormData.feedback,
        premio: prize,
        codigoPremio: justTheCode
      };
      delete payload.feedback;

      this.sendDataToN8N(payload);
      this.currentFormData = null;

      if (rating === 5) {
        showElement(this.resenaBtn);
        this.startGoogleTimer();
      }

    viewManager.showView('prize');
    }, 1000);
  }

  /**
   * Muestra el popup de política de privacidad
   */
  showPrivacyPopup() {
    const privacyText = languageManager.getTranslation('privacyPolicyFullText');
    this.privacyPopupContent.innerHTML = privacyText;
    this.privacyPopup.classList.remove('hidden');
  }

  /**
   * Oculta el popup de política de privacidad
   */
  hidePrivacyPopup() {
    this.privacyPopup.classList.add('hidden');
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
