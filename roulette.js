document.addEventListener('DOMContentLoaded', () => {
  const wheel            = document.getElementById('rouletteWheel');
  const textLayer        = document.getElementById('rouletteTextLayer');
  const spinBtn          = document.getElementById('spinBtn');
  const rouletteContainer= document.getElementById('rouletteContainer');
  const codigoContainer  = document.getElementById('codigoContainer');
  const codigoRecompensa = document.getElementById('codigoRecompensa');
  const resenaBtn        = document.getElementById('resenaBtn');
  const container        = document.querySelector('.container');
  const rouletteScreen   = document.querySelector('.roulette-screen');

  let prizes       = [];
  let N            = 0;
  let sliceAngle   = 0;
  let isSpinning   = false;
  let currentRating= 0;

  /* ---------------------- Crea SOLO la capa de textos ---------------------- */
  function createWheelTexts () {
    prizes = window.getTranslatedPrizes();
    N = prizes.length;
    sliceAngle = 360 / N;

    textLayer.innerHTML = '';               // limpia
    const R  = wheel.offsetWidth / 2;       // radio
    const cx = R, cy = R;
    const θ  = 2*Math.PI / N;

    prizes.forEach((label, i) => {
      const textDiv = document.createElement('div');
      textDiv.classList.add('roulette-text');
      textDiv.textContent = label;

      const φ = -Math.PI/2 + (i+0.5)*θ;     // bisectriz
      const rText = 0.65*R;
      const x = cx + rText*Math.cos(φ);
      const y = cy + rText*Math.sin(φ);

      textDiv.style.left      = `${x}px`;
      textDiv.style.top       = `${y}px`;
      textDiv.style.transform = `translate(-50%,-50%) rotate(${φ*180/Math.PI}deg)`;
      textLayer.appendChild(textDiv);
    });
  }

  /* ---------------------- Animar giro ---------------------- */
  function spinWheel () {
    if (isSpinning) return;
    isSpinning = true;
    spinBtn.disabled = true;
    hide(spinBtn);

    const randomSpins   = Math.floor(Math.random()*5)+5;   // 5-9 giros
    const prizeIndex    = Math.floor(Math.random()*N);
    // Se ha observado un desfase de 2 sectores. Corregimos el índice de destino.
    const targetIndex   = (prizeIndex - 2 + N) % N;

    // El puntero está en la parte superior (270 grados).
    // Calculamos la rotación necesaria para que el medio del sector del premio
    // se alinee con el puntero, usando el índice corregido.
    const rotation = 270 - (targetIndex * sliceAngle) - (sliceAngle / 2);
    const totalRotation = (randomSpins * 360) + rotation;

    wheel.style.transition = 'transform 4.3s cubic-bezier(.17,.67,.17,1)';
    wheel.style.transform  = `rotate(${totalRotation}deg)`;

    setTimeout(() => {
      isSpinning = false;
      hide(rouletteScreen);
      show(container);

      // Ocultamos las partes que no queremos ver en la pantalla final
      hide(document.querySelector('.rating-section'));
      hide(document.getElementById('formulario'));

      // Cambiamos el header para el mensaje final
      const header = container.querySelector('.header');
      const title = header.querySelector('h1');
      const subtitle = header.querySelector('p');
      title.innerHTML = `<span class="emoji">🎉</span> <span>¡Enhorabuena!</span>`;
      subtitle.textContent = 'Aquí tienes tu premio. ¡Que lo disfrutes!';


      const randomDigits = Math.random().toString().slice(2,5); // 3 dígitos
      const finalPrize = window.getTranslatedPrizes()[prizeIndex];
      codigoRecompensa.textContent = `${finalPrize} | EURO-${randomDigits}${currentRating}`;
      show(codigoContainer);
      if (currentRating === 5) show(resenaBtn);
    }, 4500);
  }

  /* ---------------------- Helpers ---------------------- */
  const show = el => { el.classList.remove('hidden'); el.classList.add('fade-in'); };
  const hide = el => { el.classList.add('hidden');   el.classList.remove('fade-in'); };
  window.showRoulette = rating => {
    currentRating = rating;
    createWheelTexts();
  };

  // Redibuja la ruleta si cambia el idioma mientras está visible
  document.getElementById('languageOptions').addEventListener('click', () => {
    if (!rouletteContainer.classList.contains('hidden')) {
      createWheelTexts();
    }
  });

  spinBtn.addEventListener('click', spinWheel);
  window.addEventListener('resize', createWheelTexts);  // redibuja en resize
});
