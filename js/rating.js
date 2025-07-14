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
    this.initializeFaceElement();
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
        this.updateStars(value, true); // true indica que es hover
      }
    });

    // Mouse leave del contenedor (mejor que mouseout)
    this.container.addEventListener('mouseleave', () => {
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
   * @param {boolean} isHover - Si es un hover temporal
   */
  updateStars(value, isHover = false) {
    this.stars.forEach(star => {
      const starValue = parseInt(star.dataset.value);
      const shouldBeActive = starValue <= value;
      
      if (shouldBeActive) {
        star.classList.add('active');
      } else {
        star.classList.remove('active');
      }
    });
    
    // Mostrar cara correspondiente solo si no es hover o si no hay selección
    if (!isHover || this.selectedValue === 0) {
      this.showFaceForRating(value);
    }
  }

  /**
   * Muestra la cara correspondiente a la valoración
   * @param {number} value - Valor de la valoración
   */
  showFaceForRating(value) {
    let face = '';
    switch (value) {
      case 0:
        face = '🤔'; // Cara pensativa/interrogación para estado inicial
        break;
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
        face = '🤔';
    }
    
    // Actualizar el elemento de la cara
    let faceElement = document.getElementById('rating-face');
    if (faceElement) {
      faceElement.textContent = face;
    }
  }

  /**
   * Selecciona una valoración
   * @param {number} value - Valor seleccionado
   */
  selectRating(value) {
    this.selectedValue = value;
    this.updateStars(value);
    this.updateButtonText();
    
    // Mostrar el botón cuando se seleccionen estrellas
    showElement(this.confirmButtonContainer);
  }
  
  /**
   * Inicializa el elemento de la cara
   */
  initializeFaceElement() {
    // Crear el elemento de la cara si no existe
    let faceElement = document.getElementById('rating-face');
    if (!faceElement) {
      faceElement = document.createElement('span');
      faceElement.id = 'rating-face';
      faceElement.className = 'rating-face';
      // Insertar después de las estrellas
      const starsContainer = document.getElementById('rating');
      starsContainer.appendChild(faceElement);
    }
    // Mostrar cara inicial
    this.showFaceForRating(0);
  }

  /**
   * Actualiza el texto del botón de confirmación
   */
  updateButtonText() {
    if (this.selectedValue > 0) {
      const text = languageManager.getTranslation('rateWithStars', { count: this.selectedValue });
      this.buttonText.textContent = text;
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
    hideElement(this.confirmButtonContainer);
  }
}

// Exportar instancia singleton
export const ratingManager = new RatingManager();
