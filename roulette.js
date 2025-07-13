document.addEventListener('DOMContentLoaded', () => {
  /* ====== Selectores de la ruleta ====== */
  const wheel            = document.getElementById('rouletteWheel');      // contenedor con posición relativa
  const colorLayer       = document.getElementById('rouletteColorLayer'); // capa de slices (position: absolute 0,0)
  const textLayer        = document.getElementById('rouletteTextLayer');  // capa de textos  (position: absolute 0,0)
  const spinBtn          = document.getElementById('spinBtn');
  const rouletteContainer= document.getElementById('rouletteContainer');

  const codigoContainer  = document.getElementById('codigoContainer');
  const codigoRecompensa = document.getElementById('codigoRecompensa');
  const resenaBtn        = document.getElementById('resenaBtn');

  /* ====== Datos de premios / colores ====== */
  const prizes = ['Postre','Café','Mojito','Cono Helado','Chupito','Refresco','Cerveza','Tapa'];
  const colors = ['#e67e22','#e74c3c','#2980b9','#8e44ad','#27ae60','#f1c40f','#3498db','#9b59b6'];
  const N           = prizes.length;          // 8
  const sliceAngle  = 360 / N;                // 45°

  /* ====== Estado ====== */
  let isSpinning   = false;
  let currentRating= 0;

  /* --------------------------------------------------
   *  Construir la ruleta con slices idénticos
   * -------------------------------------------------- */
  function createWheel () {
    // Limpia por si volvemos a llamarla
    colorLayer.innerHTML = '';
    textLayer.innerHTML  = '';

    const R       = wheel.offsetWidth / 2;    // radio (ya que es cuadrada)
    const cx      = R;                        // centro absoluto
    const cy      = R;
    const theta   = 2 * Math.PI / N;          // ángulo en radianes (≈0.785)

    prizes.forEach((label, i) => {
      /* ----- S L I C E  (color) ------ */
      const slice = document.createElement('div');
      slice.classList.add('roulette-section');
      // estilo vía custom properties
      slice.style.setProperty('--slice-color', colors[i]);
      slice.style.setProperty('--rotation',  `${i * sliceAngle}deg`);
      slice.style.setProperty('--skew',      `${90 - sliceAngle}deg`);
      colorLayer.appendChild(slice);

      /* ----- T E X T O  centrado en bisectriz ------ */
      const textDiv = document.createElement('div');
      textDiv.classList.add('roulette-text');
      textDiv.textContent = label;

      // bisectriz
      const phi     = -Math.PI/2 + (i + 0.5) * theta;   // radianes
      const rText   = 0.65 * R;                         // 65 % del radio
      const x       = cx + rText * Math.cos(phi);
      const y       = cy + rText * Math.sin(phi);
      const angleDeg= phi * 180 / Math.PI;              // a grados

      textDiv.style.left      = `${x}px`;
      textDiv.style.top       = `${y}px`;
      textDiv.style.transform = `translate(-50%,-50%) rotate(${angleDeg}deg)`;
      textLayer.appendChild(textDiv);
    });
  }

  /* --------------------------------------------------
   *  Animación de giro
   * -------------------------------------------------- */
  function spinWheel () {
    if (isSpinning) return;
    isSpinning = true;

    const randomSpins      = Math.floor(Math.random()*5) + 5;   // 5-9 giros completos
    const prizeIndex       = Math.floor(Math.random()*N);
    const prizeAngle       = prizeIndex * sliceAngle;
    const totalRotation    = randomSpins*360 + prizeAngle;
    const centeredRotation = totalRotation - sliceAngle/2;      // punta apunta al centro del slice

    wheel.style.transition = 'transform 4.3s cubic-bezier(.17,.67,.17,1)'; // suave
    wheel.style.transform  = `rotate(${centeredRotation}deg)`;

    // Espera a que termine la transición (≈4300 ms)
    setTimeout(() => {
      isSpinning = false;
      hideRoulette();

      /* ---------- Código premio ---------- */
      const randomDigits = Math.floor(Math.random()*1000).toString().padStart(3,'0');
      const code         = `EURO-${randomDigits}${currentRating}`;
      codigoRecompensa.textContent = `${prizes[prizeIndex]} | ${code}`;
      show(codigoContainer);

      if (currentRating === 5) show(resenaBtn);

    }, 4500);
  }

  /* -------------------------------------------------- helpers -------------------------------------------------- */
  const show  = el => { el.classList.remove('hidden'); el.classList.add('fade-in'); };
  const hideRoulette = () => rouletteContainer.classList.remove('visible');
  window.showRoulette = (rating) => { currentRating = rating; rouletteContainer.classList.add('visible'); };

  spinBtn.addEventListener('click', spinWheel);

  /* === inicializa === */
  createWheel();           // dibuja una vez al cargar
  window.addEventListener('resize', createWheel); // redibuja si cambias tamaño
});