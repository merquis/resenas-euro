// Módulo de gestión de vistas
import { showElement, hideElement } from './utils.js';

class ViewManager {
  constructor() {
    this.views = {};
    this.currentView = null;
  }

  /**
   * Inicializa el gestor de vistas
   */
  init() {
    // Cachear todas las vistas principales
    this.views = {
      rating: document.querySelector('.rating-section'),
      form: document.querySelector('#formulario'),
      roulette: document.querySelector('.roulette-screen'),
      prize: document.querySelector('#codigoContainer')
    };

    // Ocultar todas las vistas al inicio
    Object.values(this.views).forEach(view => {
      if (view) hideElement(view);
    });
  }

  /**
   * Muestra una vista específica y oculta las demás
   * @param {string} viewName - Nombre de la vista a mostrar ('rating', 'form', 'roulette', 'prize')
   */
  showView(viewName) {
    if (!this.views[viewName]) {
      console.error(`La vista "${viewName}" no existe.`);
      return;
    }

    // Ocultar la vista actual si existe
    if (this.currentView && this.views[this.currentView]) {
      hideElement(this.views[this.currentView]);
    }

    // Mostrar la nueva vista
    showElement(this.views[viewName]);
    this.currentView = viewName;
  }
}

export const viewManager = new ViewManager();
