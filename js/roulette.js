// Módulo de la ruleta
import { CONFIG, ROULETTE_COLORS } from './config.js';
import { languageManager } from './language.js';
import { showElement, hideElement, getRandomNumber, formatPrizeCode } from './utils.js';

export class RouletteManager {
  constructor() {
    this.wheel = null;
    this.textLayer = null;
    this.spinButton = null;
    this.container = null;
    this.rouletteScreen = null;
    this.prizes = [];
    this.sliceAngle = 0;
    this.isSpinning = false;
    this.currentRating = 0;
    this.onSpinComplete = null;
  }

  /**
   * Inicializa el gestor de la ruleta
   */
  init() {
    this.cacheElements();
    this.setupEventListeners();
    this.createWheel();
  }

  /**
   * Cachea los elementos del DOM
   */
  cacheElements() {
    this.wheel = document.getElementById('rouletteWheel');
    this.textLayer = document.getElementById('rouletteTextLayer');
    this.spinButton = document.getElementById('spinBtn');
    this.container = document.getElementById('rouletteContainer');
    this.rouletteScreen = document.querySelector('.roulette-screen');
  }

  /**
   * Configura los event listeners
   */
  setupEventListeners() {
    // Botón de girar
    this.spinButton.addEventListener('click', () => this.spin());

    // Actualizar textos cuando cambie el idioma
    window.addEventListener('languageChanged', () => {
      this.updateTexts();
      this.updateSpinButtonText();
    });

    // Redimensionar la ruleta cuando cambie el tamaño de la ventana
    window.addEventListener('resize', () => this.createWheelTexts());
  }

  /**
   * Crea la ruleta completa
   */
  createWheel() {
    this.createWheelTexts();
    this.updateSpinButtonText();
  }

  /**
   * Crea los textos de la ruleta
   */
  createWheelTexts() {
    this.prizes = languageManager.getTranslatedPrizes();
    const N = this.prizes.length;
    this.sliceAngle = 360 / N;

    // Limpiar textos anteriores
    this.textLayer.innerHTML = '';

    // Calcular posiciones
    const R = this.wheel.offsetWidth / 2;
    const cx = R;
    const cy = R;
    const angleStep = (2 * Math.PI) / N;

    this.prizes.forEach((label, i) => {
      const textDiv = document.createElement('div');
      textDiv.classList.add('roulette-text');
      textDiv.textContent = label;

      // Calcular ángulo para el centro de cada segmento
      const angle = -Math.PI / 2 + (i + 0.5) * angleStep;
      const textRadius = 0.65 * R;
      const x = cx + textRadius * Math.cos(angle);
      const y = cy + textRadius * Math.sin(angle);

      // Calcular la rotación del texto en grados
      // Añadir 90 grados para que el texto esté horizontal
      const rotationDeg = (angle * 180 / Math.PI) + 90;

      // Posicionar y rotar el texto
      textDiv.style.left = `${x}px`;
      textDiv.style.top = `${y}px`;
      textDiv.style.transform = `translate(-50%, -50%) rotate(${rotationDeg}deg)`;

      this.textLayer.appendChild(textDiv);
    });
  }

  /**
   * Actualiza los textos de la ruleta
   */
  updateTexts() {
    if (!this.rouletteScreen.classList.contains('hidden')) {
      this.createWheelTexts();
    }
  }

  /**
   * Actualiza el texto del botón de girar
   */
  updateSpinButtonText() {
    this.spinButton.textContent = languageManager.getTranslation('spinBtn');
  }

  /**
   * Muestra la ruleta
   * @param {number} rating - Valoración del usuario
   */
  show(rating) {
    this.currentRating = rating;
    this.createWheelTexts();
    showElement(this.rouletteScreen);
  }

  /**
   * Gira la ruleta
   */
  spin() {
    if (this.isSpinning) return;

    this.isSpinning = true;
    this.spinButton.disabled = true;

    // Calcular resultado aleatorio
    const N = this.prizes.length;
    const randomSpins = getRandomNumber(CONFIG.roulette.minSpins, CONFIG.roulette.maxSpins);
    const prizeIndex = Math.floor(Math.random() * N);
    
    // Ajustar el índice para que la flecha apunte al premio correcto
    // La flecha está en la parte superior (270°), así que ajustamos
    const targetIndex = (prizeIndex - 2 + N) % N;
    
    // Calcular rotación final
    const rotation = 270 - (targetIndex * this.sliceAngle) - (this.sliceAngle / 2);
    const totalRotation = (randomSpins * 360) + rotation;

    // Aplicar animación
    this.wheel.style.transition = `transform ${CONFIG.roulette.spinDuration}ms ${CONFIG.roulette.easing}`;
    this.wheel.style.transform = `rotate(${totalRotation}deg)`;

    // Manejar el final del giro
    setTimeout(() => {
      this.isSpinning = false;
      const prize = this.prizes[prizeIndex];
      
      if (this.onSpinComplete) {
        this.onSpinComplete(prize, this.currentRating);
      }
    }, CONFIG.roulette.spinDuration + 200);
  }

  /**
   * Establece el callback para cuando termine el giro
   * @param {Function} callback - Función a ejecutar
   */
  setOnSpinComplete(callback) {
    this.onSpinComplete = callback;
  }

  /**
   * Oculta la ruleta
   */
  hide() {
    hideElement(this.rouletteScreen);
  }

  /**
   * Resetea el estado de la ruleta
   */
  reset() {
    this.isSpinning = false;
    this.spinButton.disabled = false;
    this.wheel.style.transform = 'rotate(0deg)';
    this.wheel.style.transition = 'none';
  }
}

// Exportar instancia singleton
export const rouletteManager = new RouletteManager();
