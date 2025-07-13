document.addEventListener('DOMContentLoaded', () => {
  const wheel = document.getElementById('rouletteWheel');
  const colorLayer = document.getElementById('rouletteColorLayer');
  const textLayer = document.getElementById('rouletteTextLayer');
  const spinBtn = document.getElementById('spinBtn');
  const rouletteContainer = document.getElementById('rouletteContainer');
  const codigoContainer   = document.getElementById('codigoContainer');
  const codigoRecompensa  = document.getElementById('codigoRecompensa');
  const resenaBtn         = document.getElementById('resenaBtn');

  const prizes = ['Chupito', 'Cono Helado', 'Mojito', 'Café', 'Postre', 'Refresco'];
  const colors = ['#e67e22', '#e74c3c', '#2980b9', '#8e44ad', '#27ae60', '#f1c40f'];
  const numPrizes = prizes.length;
  const sliceAngle = 360 / numPrizes;

  let isSpinning = false;
  let currentRating = 0;

  function createWheel() {
    const wheelRadius = wheel.offsetWidth / 2;

    prizes.forEach((prize, i) => {
      // Create color slice
      const colorSlice = document.createElement('div');
      colorSlice.classList.add('roulette-section');
      const rotation = sliceAngle * i;
      colorSlice.style.setProperty('--slice-color', colors[i]);
      colorSlice.style.setProperty('--rotation', `${rotation}deg`);
      colorLayer.appendChild(colorSlice);

      // Create text element
      const textDiv = document.createElement('div');
      textDiv.classList.add('roulette-text');
      textDiv.textContent = prize;
      
      const textAngle = rotation + (sliceAngle / 2);
      const textRadius = wheelRadius * 0.6; // 60% from center
      
      const x = Math.cos(textAngle * Math.PI / 180) * textRadius;
      const y = Math.sin(textAngle * Math.PI / 180) * textRadius;

      textDiv.style.left = `${wheelRadius + x}px`;
      textDiv.style.top = `${wheelRadius + y}px`;
      textDiv.style.transform = `translate(-50%, -50%) rotate(${textAngle + 90}deg)`;

      textLayer.appendChild(textDiv);
    });
  }

  function spinWheel() {
    if (isSpinning) return;
    isSpinning = true;

    const randomSpins = Math.floor(Math.random() * 5) + 5; // 5 to 9 full spins
    const randomPrizeIndex = Math.floor(Math.random() * numPrizes);
    const prizeAngle = randomPrizeIndex * sliceAngle;
    const totalRotation = (randomSpins * 360) + prizeAngle;

    // Center the pointer in the middle of the slice
    const centeredRotation = totalRotation - (sliceAngle / 2);

    wheel.style.transform = `rotate(${centeredRotation}deg)`;

    setTimeout(() => {
      const winningPrize = prizes[randomPrizeIndex];
      isSpinning = false;
      hideRoulette();
      
      // Generate and show reward code
      const randomDigits = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const code = `EURO-${randomDigits}${currentRating}`;
      codigoRecompensa.textContent = `${winningPrize} | ${code}`;
      show(codigoContainer);

      // If rating was 5 stars, show Google review button
      if (currentRating === 5) {
        show(resenaBtn);
      }

    }, 4500); // A bit longer than the CSS transition
  }

  function showRoulette(rating) {
    currentRating = rating;
    rouletteContainer.classList.add('visible');
  }

  function hideRoulette() {
    rouletteContainer.classList.remove('visible');
  }

  spinBtn.addEventListener('click', spinWheel);

  // Expose functions to be called from main.js
  window.showRoulette = showRoulette;

  // Helpers from main.js that we need here
  const show = el => { el.classList.remove('hidden'); el.classList.add('fade-in'); };

  createWheel();
});
