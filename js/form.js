// Módulo de gestión del formulario
import { showElement, hideElement, isValidEmail } from './utils.js';
import { languageManager } from './language.js';
import { ratingManager } from './rating.js'; // Importar ratingManager
import { CONFIG } from './config.js';

export class FormManager {
  constructor() {
    this.form = null;
    this.formSection = null;
    this.feedbackGroup = null;
    this.feedbackTextarea = null;
    this.submitButton = null;
    this.nameInput = null;
    this.emailInput = null;
    this.onSubmitCallback = null;
    this.currentRating = 0;
  }

  /**
   * Inicializa el gestor del formulario
   */
  init() {
    this.cacheElements();
    this.setupEventListeners();
  }

  /**
   * Cachea los elementos del DOM
   */
  cacheElements() {
    this.form = document.getElementById('feedbackForm');
    this.formSection = document.getElementById('formulario');
    this.feedbackGroup = document.getElementById('feedback-group');
    this.feedbackTextarea = this.feedbackGroup.querySelector('textarea');
    this.submitButton = document.getElementById('submitText');
    
    // Obtener inputs por su placeholder
    const inputs = this.form.querySelectorAll('input');
    inputs.forEach(input => {
      if (input.dataset.placeholder === 'namePlaceholder') {
        this.nameInput = input;
      } else if (input.dataset.placeholder === 'emailPlaceholder') {
        this.emailInput = input;
      }
    });
  }

  /**
   * Configura los event listeners
   */
  setupEventListeners() {
    // Submit del formulario
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // Validación en tiempo real del email
    this.emailInput.addEventListener('blur', () => {
      this.validateEmail();
    });

    // Actualizar textos cuando cambie el idioma
    window.addEventListener('languageChanged', () => {
      this.updateButtonText();
    });
  }

  /**
   * Muestra el formulario según la valoración
   * @param {number} rating - Valoración del usuario
   */
  show(rating) {
    this.currentRating = rating;
    showElement(this.formSection);

    if (rating < 5) {
      // Para valoraciones bajas, mostrar campo de feedback
      showElement(this.feedbackGroup);
      this.feedbackTextarea.required = true;
      this.submitButton.textContent = languageManager.getTranslation('submitBtn');
    } else {
      // Para 5 estrellas, ocultar campo de feedback
      hideElement(this.feedbackGroup);
      this.feedbackTextarea.required = false;
      this.submitButton.textContent = languageManager.getTranslation('continueBtn');
    }
  }

  /**
   * Actualiza el texto del botón
   */
  updateButtonText() {
    if (!this.formSection.classList.contains('hidden')) {
      const key = this.feedbackTextarea.required ? 'submitBtn' : 'continueBtn';
      this.submitButton.textContent = languageManager.getTranslation(key);
    }
  }

  /**
   * Valida el email
   * @returns {boolean} True si es válido
   */
  validateEmail() {
    const email = this.emailInput.value.trim();
    const isValid = isValidEmail(email);

    if (!isValid && email !== '') {
      this.emailInput.classList.add('error');
      this.showError(this.emailInput, 'Email inválido');
    } else {
      this.emailInput.classList.remove('error');
      this.hideError(this.emailInput);
    }

    return isValid;
  }

  /**
   * Muestra un error en un campo
   * @param {HTMLElement} field - Campo con error
   * @param {string} message - Mensaje de error
   */
  showError(field, message) {
    // Remover error previo si existe
    this.hideError(field);

    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    field.parentElement.appendChild(errorDiv);
  }

  /**
   * Oculta el error de un campo
   * @param {HTMLElement} field - Campo
   */
  hideError(field) {
    const error = field.parentElement.querySelector('.field-error');
    if (error) {
      error.remove();
    }
  }

  /**
   * Maneja el envío del formulario
   */
  async handleSubmit() {
    // Validar campos
    if (!this.validateForm()) {
      return;
    }

    // Obtener la fecha y hora actual
    const now = new Date();
    const date = now.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    const time = now.toTimeString().split(' ')[0]; // Formato HH:MM:SS

    // Obtener datos del formulario
    const formData = {
      name: this.nameInput.value.trim(),
      email: this.emailInput.value.trim(),
      review: this.feedbackTextarea.value.trim(),
      rating: ratingManager.getRating(), // Obtener la valoración directamente del gestor de ratings
      lang: languageManager.getCurrentLanguage(),
      date: date,
      time: time
    };

    // Enviar datos a n8n
    try {
      await fetch(CONFIG.n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
    } catch (error) {
      console.error('Error al enviar los datos a n8n:', error);
      // Opcional: manejar el error, por ejemplo, mostrando un mensaje al usuario
    }

    // Ejecutar callback si existe
    if (this.onSubmitCallback) {
      this.onSubmitCallback(this.getFormData()); // Pasamos los datos originales sin lang
    }
  }

  /**
   * Valida todo el formulario
   * @returns {boolean} True si es válido
   */
  validateForm() {
    let isValid = true;

    // Validar nombre
    if (this.nameInput.value.trim() === '') {
      this.showError(this.nameInput, 'Este campo es obligatorio');
      isValid = false;
    } else {
      this.hideError(this.nameInput);
    }

    // Validar email
    if (!this.validateEmail()) {
      isValid = false;
    }

    // Validar feedback si es requerido
    if (this.feedbackTextarea.required && this.feedbackTextarea.value.trim() === '') {
      this.showError(this.feedbackTextarea, 'Este campo es obligatorio');
      isValid = false;
    } else {
      this.hideError(this.feedbackTextarea);
    }

    return isValid;
  }

  /**
   * Establece el callback para el submit
   * @param {Function} callback - Función a ejecutar
   */
  setOnSubmit(callback) {
    this.onSubmitCallback = callback;
  }

  /**
   * Resetea el formulario
   */
  reset() {
    this.form.reset();
    this.form.querySelectorAll('.field-error').forEach(error => error.remove());
    this.form.querySelectorAll('.error').forEach(field => field.classList.remove('error'));
    hideElement(this.formSection);
  }

  /**
   * Obtiene los datos del formulario
   * @returns {Object} Datos del formulario
   */
  getFormData() {
    return {
      name: this.nameInput.value.trim(),
      email: this.emailInput.value.trim(),
      feedback: this.feedbackTextarea.value.trim()
    };
  }
}

// Exportar instancia singleton
export const formManager = new FormManager();
