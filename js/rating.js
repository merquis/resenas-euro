// Módulo de gestión de valoraciones - LIBRE Y NEUTRAL
import { showElement, hideElement } from './utils.js';
import { languageManager } from './language.js';

export class RatingManager {
  constructor() {
    this.selectedValue = 0;
    this.isLocked = false;
    this.stars = null;
    this.container = null;
    this.confirmButton = null;
    this.confirmButtonContainer = null;
    this.buttonText = null;
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
    // Hover sobre las estrellas
    this.container.addEventListener('mouseover', (e) => {
      if (this.isLocked) return;
      if (e.target.classList.contains('star')) {
        const value = parseInt(e.target.dataset.value);
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
        this.selectRating(value);
      }
    });

    // Confirmar valoración
    this.confirmButton.addEventListener('click', () => {
      this.confirmRating();
    });

    // Escuchar cambios de idioma
    window.addEventListener('languageChanged', () => {
      this.updateButtonText();
    });
  }

  /**
   * Actualiza el estado visual de las estrellas
   * @param {number} value - Valor de la valoración
   */
  updateStars(value) {
    this.stars.forEach(star => {
      const starValue = parseInt(star.dataset.value);
      star.classList.toggle('active', starValue <= value);
    });
  }

  /**
   * Selecciona una valoración
   * @param {number} value - Valor seleccionado
   */
  selectRating(value) {
    this.selectedValue = value;
    this.updateStars(value);
    
    // Confirmar automáticamente la valoración
    this.confirmRating();
  }

  /**
   * Actualiza el texto del botón de confirmación
   */
  updateButtonText() {
    if (this.selectedValue > 0) {
      let face = '';
      
      // Progresión de caras según las estrellas
      switch (this.selectedValue) {
        case 1:
          face = '😞'; // Cara triste/decepcionada
          break;
        case 2:
          face = '😕'; // Cara preocupada/insatisfecha
          break;
        case 3:
          face = '😐'; // Cara neutra/indiferente
          break;
        case 4:
          face = '🙂'; // Cara ligeramente contenta
          break;
        case 5:
          face = '😊'; // Cara feliz
          break;
        default:
          face = '😐';
      }
      
      const baseText = languageManager.getTranslation('confirmRating');
      this.buttonText.textContent = `VALORAR CON ${this.selectedValue} ESTRELLAS ${face}`;
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
    this.selectedValue = 0;
    this.isLocked = false;
    this.updateStars(0);
    this.stars.forEach(star => star.classList.remove('locked'));
    this.confirmButton.disabled = false;
  }
}

// Exportar instancia singleton
export const ratingManager = new RatingManager();
