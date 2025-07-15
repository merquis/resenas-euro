// Módulo de gestión de vistas
import { showElement, hideElement } from './utils.js';

class ViewManager {
  constructor() {
    this.mainViews = {};
    this.overlays = {};
  }

  /**
   * Inicializa el gestor de vistas
   */
  init() {
    // Vistas que se intercambian en el contenedor principal
    this.mainViews = {
      rating: document.querySelector('#rating-view'),
      form: document.querySelector('#formulario'),
      prize: document.querySelector('#codigoContainer')
    };

    // Vistas que se superponen a todo
    this.overlays = {
      roulette: document.querySelector('.roulette-screen')
    };

    // Ocultar todas las vistas al inicio para un estado limpio
    Object.values(this.mainViews).forEach(view => view && hideElement(view));
    Object.values(this.overlays).forEach(view => view && hideElement(view));
  }

  /**
   * Muestra una vista principal, ocultando las demás
   * @param {string} viewName - Nombre de la vista a mostrar
   */
  showView(viewName) {
    if (!this.mainViews[viewName]) {
      console.error(`La vista principal "${viewName}" no existe.`);
      return;
    }

    // Ocultar todas las vistas principales
    for (const view of Object.values(this.mainViews)) {
      if (view) hideElement(view);
    }

    // Mostrar la vista solicitada
    showElement(this.mainViews[viewName]);
  }

  /**
   * Muestra un overlay
   * @param {string} overlayName - Nombre del overlay a mostrar
   */
  showOverlay(overlayName) {
    if (this.overlays[overlayName]) {
      showElement(this.overlays[overlayName]);
    }
  }

  /**
   * Oculta un overlay
   * @param {string} overlayName - Nombre del overlay a ocultar
   */
  hideOverlay(overlayName) {
    if (this.overlays[overlayName]) {
      hideElement(this.overlays[overlayName]);
    }
  }
}

export const viewManager = new ViewManager();
