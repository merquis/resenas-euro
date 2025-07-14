// Aplicación principal - OPTIMIZADA PARA MÁXIMA CONVERSIÓN
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
    this.countdownInterval = null;
    this.googleTimerInterval = null;
    this.notificationInterval = null;
    this.watchingInterval = null;
    this.vipNumber = Math.floor(Math.random() * 500) + 1000;
    this.prizesToday = Math.floor(Math.random() * 50) + 100;
    this.watchingCount = Math.floor(Math.random() * 30) + 70;
  }

  /**
   * Inicializa la aplicación
   */
  init() {
    this.cacheElements();
    this.initializeModules();
    this.setupEventListeners();
    this.startUrgencyTimer();
    this.startFakeNotifications();
    this.startWatchingCounter();
    this.setupVIPNumber();
    this.setupPrizesToday();
    this.preSelectFiveStars();
    this.preventEasyExit();
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
      // Mostrar mensaje de éxito
      this.showSuccessMessage();
    };

    // Función global para manejar intento de salida
    window.handleExit = () => {
      const confirmExit = confirm(
        '⚠️ ¡ESPERA! ¿Estás seguro?\n\n' +
        '❌ Perderás tu PREMIO EXCLUSIVO para siempre\n' +
        '🎁 Este premio NO volverá a estar disponible\n\n' +
        '¿Realmente quieres perder tu regalo GRATIS?'
      );
      
      if (confirmExit) {
        const doubleConfirm = confirm(
          '😢 ¡Última oportunidad!\n\n' +
          'Tu premio de ' + this.getRandomBigPrize() + ' se perderá PARA SIEMPRE\n\n' +
          '¿Seguro que quieres irte sin tu regalo?'
        );
        
        if (doubleConfirm) {
          window.location.href = 'about:blank';
        }
      }
    };

    // Prevenir cierre accidental
    window.addEventListener('beforeunload', (e) => {
      if (!this.isCompleted) {
        e.preventDefault();
        e.returnValue = '¿Estás seguro de que quieres perder tu premio?';
      }
    });
  }

  /**
   * Pre-selecciona 5 estrellas
   */
  preSelectFiveStars() {
    // Las 5 estrellas ya están activas por defecto
    ratingManager.selectedValue = 5;
    
    // Mostrar el botón de confirmación inmediatamente
    const btnContainer = document.getElementById('valorarBtnContainer');
    const btnText = document.getElementById('btnText');
    btnText.textContent = languageManager.getTranslation('confirmRating');
  }

  /**
   * Configura el número VIP
   */
  setupVIPNumber() {
    const vipNumberEl = document.getElementById('vipNumber');
    if (vipNumberEl) {
      vipNumberEl.textContent = this.vipNumber;
    }
  }

  /**
   * Configura premios de hoy
   */
  setupPrizesToday() {
    const prizesTodayEl = document.getElementById('prizesToday');
    if (prizesTodayEl) {
      prizesTodayEl.textContent = this.prizesToday;
      // Incrementar ocasionalmente
      setInterval(() => {
        if (Math.random() > 0.7) {
          this.prizesToday++;
          prizesTodayEl.textContent = this.prizesToday;
        }
      }, 15000);
    }
  }

  /**
   * Inicia el timer de urgencia
   */
  startUrgencyTimer() {
    const countdownEl = document.getElementById('countdown');
    let timeLeft = 180; // 3 minutos

    this.countdownInterval = setInterval(() => {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      countdownEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      // Cambiar color cuando queda poco tiempo
      if (timeLeft <= 30) {
        countdownEl.style.color = '#ff0000';
        countdownEl.style.fontSize = '28px';
        
        // Parpadeo en los últimos 10 segundos
        if (timeLeft <= 10) {
          countdownEl.style.animation = 'urgentFlash 0.5s infinite';
        }
      }

      timeLeft--;

      if (timeLeft < 0) {
        clearInterval(this.countdownInterval);
        this.showTimeoutMessage();
      }
    }, 1000);
  }

  /**
   * Inicia las notificaciones falsas
   */
  startFakeNotifications() {
    const names = ['María G.', 'Carlos R.', 'Ana M.', 'Pedro S.', 'Laura F.', 'Diego T.', 'Sofia L.', 'Juan P.'];
    const prizes = ['POSTRE GRATIS', 'CAFÉ PREMIUM', 'MOJITO ESPECIAL', 'CERVEZA ARTESANA', 'TAPA GRATIS'];
    const cities = ['Valencia', 'Madrid', 'Barcelona', 'Sevilla', 'Málaga', 'Bilbao'];

    const showNotification = () => {
      const name = names[Math.floor(Math.random() * names.length)];
      const prize = prizes[Math.floor(Math.random() * prizes.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      const time = Math.floor(Math.random() * 5) + 1;

      const notification = document.createElement('div');
      notification.className = 'winner-notification';
      notification.innerHTML = `
        <strong>${name}</strong> de ${city}<br>
        ${languageManager.getTranslation('justWon')} <strong>${prize}</strong><br>
        hace ${time} minutos
      `;

      const container = document.getElementById('winnerNotifications');
      container.appendChild(notification);

      // Eliminar después de 5 segundos
      setTimeout(() => {
        notification.remove();
      }, 5000);
    };

    // Mostrar primera notificación rápido
    setTimeout(showNotification, 2000);

    // Luego cada 8-15 segundos
    this.notificationInterval = setInterval(() => {
      showNotification();
    }, Math.random() * 7000 + 8000);
  }

  /**
   * Contador de personas viendo
   */
  startWatchingCounter() {
    const watchingEl = document.getElementById('watchingCount');
    
    this.watchingInterval = setInterval(() => {
      // Variar entre 70-120
      const change = Math.floor(Math.random() * 10) - 5;
      this.watchingCount = Math.max(70, Math.min(120, this.watchingCount + change));
      watchingEl.textContent = this.watchingCount;
    }, 3000);
  }

  /**
   * Previene salida fácil
   */
  preventEasyExit() {
    // Deshabilitar clic derecho
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      alert('⚠️ ¡No puedes salir sin reclamar tu premio!');
    });

    // Detectar tecla ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        window.handleExit();
      }
    });
  }

  /**
   * Obtiene un premio grande aleatorio
   */
  getRandomBigPrize() {
    const bigPrizes = ['CENA GRATIS PARA 2', '50€ DE DESCUENTO', 'BOTELLA DE VINO PREMIUM'];
    return bigPrizes[Math.floor(Math.random() * bigPrizes.length)];
  }

  /**
   * Maneja la confirmación de la valoración
   * @param {number} rating - Valoración seleccionada
   */
  handleRatingConfirmed(rating) {
    // Si es menos de 5 estrellas, mostrar confirmshaming
    if (rating < 5) {
      const shameBtn = document.getElementById('shameBtn');
      showElement(shameBtn);
    }
    
    formManager.show(rating);
  }

  /**
   * Maneja el envío del formulario
   */
  handleFormSubmit() {
    const rating = ratingManager.getRating();
    
    // Guardar datos (aquí podrías enviarlos a un servidor)
    const formData = formManager.getFormData();
    console.log('Datos capturados:', formData);
    
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
    
    title.innerHTML = `<span class="emoji">🏆</span> <span>${languageManager.getTranslation('congratulations')}</span>`;
    subtitle.textContent = languageManager.getTranslation('enjoyPrize');

    // Ocultar secciones no necesarias
    hideElement(this.ratingSection);
    hideElement(formManager.formSection);

    // Generar y mostrar el código de premio
    const prizeCode = formatPrizeCode(prize, rating);
    this.codigoRecompensa.textContent = prizeCode;
    showElement(this.codigoContainer);

    // Si la valoración fue de 5 estrellas, mostrar botón de Google Reviews con timer
    if (rating === 5) {
      showElement(this.resenaBtn);
      this.startGoogleTimer();
    }

    // Mostrar el contenedor principal nuevamente
    showElement(this.container);
  }

  /**
   * Inicia el timer de Google
   */
  startGoogleTimer() {
    const googleTimerEl = document.getElementById('googleTimer');
    let timeLeft = 30;

    this.googleTimerInterval = setInterval(() => {
      googleTimerEl.textContent = `00:${timeLeft.toString().padStart(2, '0')}`;
      
      if (timeLeft <= 10) {
        googleTimerEl.style.color = '#ff0000';
        googleTimerEl.style.animation = 'timerPulse 0.5s infinite';
      }

      timeLeft--;

      if (timeLeft < 0) {
        clearInterval(this.googleTimerInterval);
        googleTimerEl.textContent = '¡EXPIRANDO!';
        googleTimerEl.style.fontSize = '36px';
      }
    }, 1000);
  }

  /**
   * Muestra mensaje de timeout
   */
  showTimeoutMessage() {
    alert(
      '⏰ ¡SE ACABÓ EL TIEMPO!\n\n' +
      'Tu premio exclusivo ha EXPIRADO 😢\n\n' +
      'Pero espera... ¡Tenemos una ÚLTIMA OPORTUNIDAD para ti!\n' +
      'Haz clic en OK para reclamar tu premio ahora mismo.'
    );
    
    // Reiniciar timer con 1 minuto extra
    this.startUrgencyTimer();
  }

  /**
   * Muestra mensaje de éxito
   */
  showSuccessMessage() {
    this.isCompleted = true;
    
    // Limpiar intervalos
    clearInterval(this.countdownInterval);
    clearInterval(this.googleTimerInterval);
    clearInterval(this.notificationInterval);
    clearInterval(this.watchingInterval);

    // Actualizar UI
    const urgencyTimer = document.getElementById('urgencyTimer');
    urgencyTimer.style.background = 'linear-gradient(90deg, #27ae60, #2ecc71)';
    urgencyTimer.innerHTML = '✅ ¡PREMIO ACTIVADO CON ÉXITO! - Válido 24 horas';
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
    
    title.innerHTML = `<span class="emoji">🎉</span> <span data-text="title">${languageManager.getTranslation('title')}</span>`;
    subtitle.innerHTML = `<span data-text="subtitle">${languageManager.getTranslation('subtitle')}</span>`;

    // Mostrar/ocultar secciones
    showElement(this.ratingSection);
    hideElement(this.codigoContainer);
    hideElement(this.resenaBtn);
    hideElement(formManager.formSection);

    // Reiniciar timers
    clearInterval(this.countdownInterval);
    clearInterval(this.googleTimerInterval);
    this.startUrgencyTimer();
  }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
  
  // Exponer la instancia globalmente para debugging (opcional)
  window.app = app;
});
