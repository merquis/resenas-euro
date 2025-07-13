document.addEventListener('DOMContentLoaded', () => {
  const wheel            = document.getElementById('rouletteWheel');
  const textLayer        = document.getElementById('rouletteTextLayer');
  const spinBtn          = document.getElementById('spinBtn');
  const rouletteContainer= document.getElementById('rouletteContainer');
  const codigoContainer  = document.getElementById('codigoContainer');
  const codigoRecompensa = document.getElementById('codigoRecompensa');
  const resenaBtn        = document.getElementById('resenaBtn');

  const prizes = ['Postre','Café','Mojito','Cono Helado','Chupito','Refresco','Cerveza','Tapa'];
  const N          = prizes.length;        // 8
  const sliceAngle = 360 / N;              // 45°

  let isSpinning   = false;
  let currentRating= 0;

  /* ---------------------- Crea SOLO la capa de textos ---------------------- */
  function createWheelTexts () {
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

    const randomSpins   = Math.floor(Math.random()*5)+5;   // 5-9 giros
    const prizeIndex    = Math.floor(Math.random()*N);
    const totalRotation = randomSpins*360 + prizeIndex*sliceAngle - sliceAngle/2;

    wheel.style.transition = 'transform 4.3s cubic-bezier(.17,.67,.17,1)';
    wheel.style.transform  = `rotate(${totalRotation}deg)`;

    setTimeout(() => {
      isSpinning = false;
      rouletteContainer.classList.remove('visible');

      /* Código premio */
      const randomDigits = Math.random().toString().slice(2,5); // 3 dígitos
      codigoRecompensa.textContent = `${prizes[prizeIndex]} | EURO-${randomDigits}${currentRating}`;
      show(codigoContainer);
      if (currentRating === 5) show(resenaBtn);
    }, 4500);
  }

  /* ---------------------- Helpers ---------------------- */
  const show = el => { el.classList.remove('hidden'); el.classList.add('fade-in'); };
  window.showRoulette = rating => { currentRating = rating; rouletteContainer.classList.add('visible'); };

  spinBtn.addEventListener('click', spinWheel);
  createWheelTexts();
  window.addEventListener('resize', createWheelTexts);  // redibuja en resize
});
