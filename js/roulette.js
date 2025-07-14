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
    window.addEventListener('resize', () => {
      if (!this.rouletteScreen.classList.contains('hidden')) {
        this.createWheelTexts();
      }
    });
  }

  /**
   * Crea la ruleta completa
   */
  createWheel() {
    // No crear textos aquí, se crearán cuando se muestre la ruleta
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

    // Asegurarse de que la ruleta tenga dimensiones antes de calcular
    if (this.wheel.offsetWidth === 0) {
      // Si la ruleta no tiene dimensiones, esperar un poco y reintentar
      setTimeout(() => this.createWheelTexts(), 100);
      return;
    }

    // Calcular posiciones
    const R = this.wheel.offsetWidth / 2;
    const cx = R;
    const cy = R;

    this.prizes.forEach((label, i) => {
      const textDiv = document.createElement('div');
      textDiv.classList.add('roulette-text');
      textDiv.textContent = label;

      // Calcular el ángulo para cada segmento (en grados)
      // Empezamos desde arriba (-90 grados) y vamos en sentido horario
      const angleDeg = -90 + (i * this.sliceAngle) + (this.sliceAngle / 2);
      const angleRad = angleDeg * Math.PI / 180;

      // Posicionar el texto al 50% del radio para centrarlo mejor en el segmento
      const textRadius = 0.5 * R;
      const x = cx + textRadius * Math.cos(angleRad);
      const y = cy + textRadius * Math.sin(angleRad);

      // Rotar el texto 90 grados para que esté alineado con las líneas divisorias
      const textRotation = angleDeg;

      // Aplicar estilos de posición y rotación
      textDiv.style.position = 'absolute';
      textDiv.style.left = `${x}px`;
      textDiv.style.top = `${y}px`;
      textDiv.style.transform = `translate(-50%, -50%) rotate(${textRotation}deg)`;

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
    showElement(this.rouletteScreen);
    
    // Crear los textos después de que la ruleta sea visible
    // para asegurar que tenga dimensiones correctas
    setTimeout(() => {
      this.createWheelTexts();
    }, 50);
  }

  /**
   * Gira la ruleta con probabilidades controladas
   */
  spin() {
    if (this.isSpinning) return;

    this.isSpinning = true;
    this.spinButton.disabled = true;

    // Calcular resultado con probabilidades controladas
    const N = this.prizes.length;
    const randomSpins = getRandomNumber(CONFIG.roulette.minSpins, CONFIG.roulette.maxSpins);
    
    // Determinar el premio basado en probabilidades
    let prizeIndex;
    const random = Math.random();
    
    // Probabilidades ajustadas
    if (random < 0.001) {
      // 0.1% para CENA PARA 2 (índice 0)
      prizeIndex = 0;
    } else if (random < 0.002) {
      // 0.1% para 50€ DESCUENTO (índice 1)
      prizeIndex = 1;
    } else if (random < 0.012) {
      // 1% para BOTELLA VINO (índice 2)
      prizeIndex = 2;
    } else {
      // 98.8% para los otros 5 premios
      prizeIndex = Math.floor(Math.random() * 5) + 3;
    }
    
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
