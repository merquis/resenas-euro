// Módulo de gestión de valoraciones - OPTIMIZADO PARA 5 ESTRELLAS
import { showElement, hideElement } from './utils.js';
import { languageManager } from './language.js';

export class RatingManager {
  constructor() {
    this.selectedValue = 0; // SIN PRESELECCIÓN
    this.isLocked = false;
    this.stars = null;
    this.container = null;
    this.confirmButton = null;
    this.confirmButtonContainer = null;
    this.buttonText = null;
    this.clickCount = 0;
  }

  /**
   * Inicializa el gestor de valoraciones
   */
  init() {
    this.cacheElements();
    this.setupEventListeners();
  }

  /**
   * Cachea los elementos del DOM
   */
  cacheElements() {
    this.stars = document.querySelectorAll('.star');
    this.container = document.getElementById('rating');
    this.confirmButton = document.getElementById('valorarBtn');
    this.confirmButtonContainer = document.getElementById('valorarBtnContainer');
    this.buttonText = document.getElementById('btnText');
  }


  /**
   * Configura los event listeners
   */
  setupEventListeners() {
    // Hover sobre las estrellas - hacer más difícil cambiar de 5
    this.container.addEventListener('mouseover', (e) => {
      if (this.isLocked) return;
      if (e.target.classList.contains('star')) {
        const value = parseInt(e.target.dataset.value);
        
        // Si están en 5 estrellas, hacer más difícil cambiar
        if (this.selectedValue === 5 && value < 5) {
          // Vibrar visualmente para disuadir
          this.container.style.animation = 'shake 0.3s';
          setTimeout(() => {
            this.container.style.animation = '';
          }, 300);
          
          // Solo actualizar después de varios intentos
          this.clickCount++;
          if (this.clickCount < 2) {
            return;
          }
        }
        
        this.updateStars(value);
      }
    });

    // Mouse out del contenedor
    this.container.addEventListener('mouseout', () => {
      if (!this.isLocked) {
        this.updateStars(this.selectedValue);
      }
    });

    // Click en las estrellas
    this.container.addEventListener('click', (e) => {
      if (this.isLocked) return;
      if (e.target.classList.contains('star')) {
        const value = parseInt(e.target.dataset.value);
        
        // Si intentan bajar de 5 estrellas
        if (this.selectedValue === 5 && value < 5) {
          // Primer intento - mostrar mensaje persuasivo
          if (this.clickCount === 0) {
            this.showPersuasiveMessage();
            this.clickCount++;
            return;
          }
          
          // Segundo intento - confirmar
          if (this.clickCount === 1) {
            const confirm = window.confirm(
              '😢 ¿Realmente no te gustó tu experiencia?\n\n' +
              '⭐ Las 5 estrellas nos ayudan a mejorar\n' +
              '🎁 Y te garantizan los MEJORES premios\n\n' +
              '¿Seguro que quieres cambiar tu valoración?'
            );
            
            if (!confirm) {
              return;
            }
            this.clickCount++;
          }
        }
        
        this.selectRating(value);
      }
    });

    // Confirmar valoración
    this.confirmButton.addEventListener('click', () => {
      // Si es menos de 5, último intento de persuasión
      if (this.selectedValue < 5) {
        const upgrade = window.confirm(
          '🎁 ¡ESPERA! Oferta especial:\n\n' +
          '⭐⭐⭐⭐⭐ Con 5 estrellas obtienes:\n' +
          '✅ Acceso a premios EXCLUSIVOS\n' +
          '✅ Sorteo de CENA GRATIS\n' +
          '✅ Descuentos VIP\n\n' +
          '¿Quieres cambiar a 5 estrellas y obtener MEJORES premios?'
        );
        
        if (upgrade) {
          this.selectRating(5);
          return;
        }
      }
      
      this.confirmRating();
    });

    // Escuchar cambios de idioma
    window.addEventListener('languageChanged', () => {
      this.updateButtonText();
    });
  }

  /**
   * Muestra mensaje persuasivo
   */
  showPersuasiveMessage() {
    const message = document.createElement('div');
    message.className = 'persuasive-message';
    message.innerHTML = `
      <strong>💔 ¿Algo salió mal?</strong><br>
      ¡Queremos arreglarlo! Las 5 ⭐ nos motivan a mejorar<br>
      <small>Y te dan acceso a los MEJORES premios 🎁</small>
    `;
    
    message.style.cssText = `
      position: absolute;
      top: -80px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #e74c3c, #c0392b);
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.3);
      z-index: 1000;
      animation: slideDown 0.5s ease-out;
      white-space: nowrap;
      text-align: center;
      font-size: 14px;
    `;
    
    this.container.style.position = 'relative';
    this.container.appendChild(message);
    
    setTimeout(() => {
      message.remove();
    }, 4000);
  }

  /**
   * Actualiza el estado visual de las estrellas
   * @param {number} value - Valor de la valoración
   */
  updateStars(value) {
    this.stars.forEach(star => {
      const starValue = parseInt(star.dataset.value);
      star.classList.toggle('active', starValue <= value);
      
      // Hacer la 5ta estrella más atractiva
      if (starValue === 5) {
        if (value === 5) {
          star.style.transform = 'scale(1.3)';
          star.style.color = '#ffed4e';
          star.style.textShadow = '0 0 20px rgba(255, 215, 0, 0.8)';
        } else {
          star.style.transform = 'scale(1)';
          star.style.color = '#666';
          star.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.3)';
        }
      }
    });
  }

  /**
   * Selecciona una valoración
   * @param {number} value - Valor seleccionado
   */
  selectRating(value) {
    this.selectedValue = value;
    this.updateStars(value);
    this.updateButtonText();
    
    // Cambiar estilo del botón según la valoración
    if (value === 5) {
      this.confirmButton.className = 'confirmation-btn premium-btn pulse-strong';
      this.confirmButton.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
    } else {
      this.confirmButton.className = 'confirmation-btn';
      this.confirmButton.style.background = 'linear-gradient(135deg, #95a5a6, #7f8c8d)';
    }
  }

  /**
   * Actualiza el texto del botón de confirmación
   */
  updateButtonText() {
    if (this.selectedValue > 0) {
      if (this.selectedValue === 5) {
        this.buttonText.textContent = '🎁 ' + languageManager.getTranslation('confirmRating');
      } else {
        const confirm = languageManager.getTranslation('confirm');
        const star = languageManager.getTranslation('star');
        const stars = languageManager.getTranslation('stars');
        const unit = this.selectedValue === 1 ? star : stars;
        
        this.buttonText.textContent = `${confirm} ${this.selectedValue} ${unit} 😕`;
      }
    }
  }

  /**
   * Confirma la valoración
   */
  confirmRating() {
    if (this.isLocked || !this.selectedValue) return;

    this.isLocked = true;
    this.stars.forEach(star => star.classList.add('locked'));
    this.confirmButton.disabled = true;

    // Disparar evento de valoración confirmada
    window.dispatchEvent(new CustomEvent('ratingConfirmed', { 
      detail: { rating: this.selectedValue } 
    }));

    hideElement(this.confirmButtonContainer);
  }

  /**
   * Obtiene la valoración actual
   * @returns {number} Valoración seleccionada
   */
  getRating() {
    return this.selectedValue;
  }

  /**
   * Resetea el estado del rating
   */
  reset() {
    this.selectedValue = 0; // Sin preselección
    this.isLocked = false;
    this.clickCount = 0;
    this.updateStars(0);
    this.stars.forEach(star => star.classList.remove('locked'));
    this.confirmButton.disabled = false;
  }
}

// Exportar instancia singleton
export const ratingManager = new RatingManager();
