// Módulo de gestión del formulario
import { showElement, hideElement, isValidEmail } from './utils.js';
import { languageManager } from './language.js';
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
    this.privacyPolicyCheckbox = null;
    this.privacyPolicyLabel = null;
    this.privacyLink = null;
    this.onSubmitCallback = null;
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
    this.privacyPolicyCheckbox = document.getElementById('privacyPolicy');
    this.privacyPolicyLabel = document.getElementById('privacyPolicyLabel');
    this.privacyLink = document.getElementById('openPrivacyPopup');
    
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
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    this.emailInput.addEventListener('blur', () => {
      this.validateEmail();
    });

    window.addEventListener('languageChanged', () => {
      this.updateButtonText();
      this.updatePrivacyPolicyLabel();
    });
  }

  /**
   * Prepara el formulario según la valoración
   * @param {number} rating - Valoración del usuario
   */
  prepare(rating) {
    this.updatePrivacyPolicyLabel();
    if (rating < 5) {
      showElement(this.feedbackGroup);
      this.feedbackTextarea.required = true;
      this.submitButton.textContent = languageManager.getTranslation('submitBtn');
    } else {
      hideElement(this.feedbackGroup);
      this.feedbackTextarea.required = false;
      this.submitButton.textContent = languageManager.getTranslation('continueBtn');
    }
  }

  /**
   * Actualiza el texto del label de la política de privacidad
   */
  updatePrivacyPolicyLabel() {
    const labelText = languageManager.getTranslation('privacyPolicy');
    const linkText = languageManager.getTranslation('privacyLinkText');
    this.privacyPolicyLabel.textContent = labelText;
    this.privacyLink.textContent = linkText;
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
    if (!this.validateForm()) {
      return;
    }

    // Verificación de email duplicado
    try {
      const email = this.emailInput.value.trim().toLowerCase();
      const response = await fetch(CONFIG.n8nVerifyEmailUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor de verificación');
      }

      const result = await response.json();

      // La respuesta de n8n es un objeto directo.
      if (result && result.existe === true) {
        this.showError(this.emailInput, 'Este correo electrónico ya ha sido utilizado');
        return; // Detiene el envío del formulario
      }
      if (result && result.valid === false) {
        this.showError(this.emailInput, 'Email no válido. Introduzca uno nuevo.');
        return; // Detiene el envío del formulario
      }
    } catch (error) {
      console.error('Error al verificar el email:', error);
      // Mostramos un error genérico y detenemos el envío si la verificación falla.
      this.showError(this.emailInput, 'No se pudo verificar el email. Inténtalo de nuevo.');
      return;
    }


    if (this.onSubmitCallback) {
      this.onSubmitCallback(this.getFormData());
    }
  }

  /**
   * Valida todo el formulario
   * @returns {boolean} True si es válido
   */
  validateForm() {
    let isValid = true;

    if (this.nameInput.value.trim() === '') {
      this.showError(this.nameInput, 'Este campo es obligatorio');
      isValid = false;
    } else {
      this.hideError(this.nameInput);
    }

    if (!this.validateEmail()) {
      isValid = false;
    }

    if (this.feedbackTextarea.required && this.feedbackTextarea.value.trim() === '') {
      this.showError(this.feedbackTextarea, 'Este campo es obligatorio');
      isValid = false;
    } else {
      this.hideError(this.feedbackTextarea);
    }

    if (!this.privacyPolicyCheckbox.checked) {
      this.showError(this.privacyPolicyCheckbox, 'Debes aceptar la política de privacidad');
      isValid = false;
    } else {
      this.hideError(this.privacyPolicyCheckbox);
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
  }

  /**
   * Obtiene los datos del formulario
   * @returns {Object} Datos del formulario
   */
  getFormData() {
    return {
      name: this.nameInput.value.trim(),
      email: this.emailInput.value.trim().toLowerCase(),
      feedback: this.feedbackTextarea.value.trim()
    };
  }
}

export const formManager = new FormManager();
