document.addEventListener('DOMContentLoaded', () => {
  const wheel            = document.getElementById('rouletteWheel');
  const textLayer        = document.getElementById('rouletteTextLayer');
  const spinBtn          = document.getElementById('spinBtn');
  const rouletteContainer= document.getElementById('rouletteContainer');
  const container        = document.querySelector('.container');
  const rouletteScreen   = document.querySelector('.roulette-screen');
  const codigoContainer  = document.getElementById('codigoContainer');
  const codigoRecompensa = document.getElementById('codigoRecompensa');
  const resenaBtn        = document.getElementById('resenaBtn');

  let prizes       = [];
  let N            = 0;
  let sliceAngle   = 0;
  let isSpinning   = false;
  let currentRating= 0;

  /* ---------------------- Helpers ---------------------- */
  const show = el => { if(el) { el.classList.remove('hidden'); el.classList.add('fade-in'); } };
  const hide = el => { if(el) { el.classList.add('hidden');   el.classList.remove('fade-in'); } };

  /* ---------------------- Crea SOLO la capa de textos ---------------------- */
  function createWheelTexts () {
    prizes = window.getTranslatedPrizes();
    N = prizes.length;
    sliceAngle = 360 / N;

    textLayer.innerHTML = '';
    const R  = wheel.offsetWidth / 2;
    const cx = R, cy = R;
    const θ  = 2*Math.PI / N;

    prizes.forEach((label, i) => {
      const textDiv = document.createElement('div');
      textDiv.classList.add('roulette-text');
      textDiv.textContent = label;

      const φ = -Math.PI/2 + (i+0.5)*θ;
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

    const randomSpins   = Math.floor(Math.random()*5)+5;
    const prizeIndex    = Math.floor(Math.random()*N);
    const targetIndex   = (prizeIndex - 2 + N) % N;

    const rotation = 270 - (targetIndex * sliceAngle) - (sliceAngle / 2);
    const totalRotation = (randomSpins * 360) + rotation;

    wheel.style.transition = 'transform 4.3s cubic-bezier(.17,.67,.17,1)';
    wheel.style.transform  = `rotate(${totalRotation}deg)`;

    setTimeout(() => {
      isSpinning = false;
      hide(rouletteScreen);
      
      const header = container.querySelector('.header');
      const ratingSection = container.querySelector('.rating-section');
      hide(ratingSection);
      hide(document.getElementById('formulario'));

      const title = header.querySelector('h1');
      const subtitle = header.querySelector('p');
      title.innerHTML = `<span class="emoji">🎉</span> <span>¡Enhorabuena!</span>`;
      subtitle.textContent = 'Aquí tienes tu premio. ¡Que lo disfrutes!';

      const randomDigits = Math.random().toString().slice(2,5);
      const finalPrize = window.getTranslatedPrizes()[prizeIndex];
      codigoRecompensa.textContent = `${finalPrize} | EURO-${randomDigits}${currentRating}`;
      show(codigoContainer);
      if (currentRating === 5) show(resenaBtn);
      
      show(container);
    }, 4500);
  }

  window.showRoulette = rating => {
    currentRating = rating;
    createWheelTexts();
  };

  document.getElementById('languageOptions').addEventListener('click', () => {
    if (!rouletteScreen.classList.contains('hidden')) {
      createWheelTexts();
    }
  });

  spinBtn.addEventListener('click', spinWheel);
  window.addEventListener('resize', createWheelTexts);
});
