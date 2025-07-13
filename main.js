document.addEventListener('DOMContentLoaded', () => {
  /* -------------------- Translations -------------------- */
  const translations = {
    es: {
      title: '¡Tu opinión tiene premio!',
      subtitle: 'Antes de tu sorpresa, ¿qué tal fue tu experiencia? Ayúdanos a mejorar valorando con las estrellas.',
      rouletteTitle: '¡A por tu premio!',
      rouletteSubtitle: 'Gira la ruleta para descubrir tu recompensa.',
      confirm: 'Confirmar',
      confirmRating: 'Confirmar valoración',
      rewardCode: 'Código de recompensa',
      finishReview: 'Finaliza tu reseña para poder canjearlo',
      improveQuestion: 'Gracias, ¿cómo podríamos mejorar?',
      namePlaceholder: 'Tu nombre',
      emailPlaceholder: 'Tu email',
      feedbackPlaceholder: 'Escribe tu opinión',
      submitBtn: 'Enviar',
      continueBtn: 'Continuar',
      googleReviewTitle: '¡Gracias! Ahora puedes dejarnos tu reseña en Google:',
      googleBtn: 'Ir a Google',
      googleReviewBtn: 'Dejar reseña en Google',
      spinBtn: 'Girar la ruleta',
      star: 'Estrella',
      stars: 'Estrellas',
      prizes: ['Postre','Café','Mojito','Cono Helado','Chupito','Refresco','Cerveza','Tapa']
    },
    en: {
      title: 'Your opinion has a prize!',
      subtitle: 'Before your reward, how was your experience? Help us improve by rating with the stars.',
      rouletteTitle: 'Go for your prize!',
      rouletteSubtitle: 'Spin the wheel to discover your reward.',
      confirm: 'Confirm',
      confirmRating: 'Confirm rating',
      rewardCode: 'Reward code',
      finishReview: 'Finish your review to redeem it',
      improveQuestion: 'Thanks, how can we improve?',
      namePlaceholder: 'Your name',
      emailPlaceholder: 'Your email',
      feedbackPlaceholder: 'Write your feedback',
      submitBtn: 'Send',
      continueBtn: 'Continue',
      googleReviewTitle: 'Thanks! Now you can leave us your Google review:',
      googleBtn: 'Go to Google',
      googleReviewBtn: 'Leave Google review',
      spinBtn: 'Spin the wheel',
      star: 'Star',
      stars: 'Stars',
      prizes: ['Dessert','Coffee','Mojito','Ice Cream Cone','Shot','Soft Drink','Beer','Tapa']
    },
    de: {
      title: 'Deine Meinung hat einen Preis!',
      subtitle: 'Wie war deine Erfahrung, bevor du deine Belohnung erhältst? Hilf uns, uns zu verbessern, indem du mit den Sternen bewertest.',
      rouletteTitle: 'Hol dir deinen Preis!',
      rouletteSubtitle: 'Drehe das Rad, um deine Belohnung zu entdecken.',
      confirm: 'Bestätigen',
      confirmRating: 'Bewertung bestätigen',
      rewardCode: 'Belohnungscode',
      finishReview: 'Schließe deine Bewertung ab, um ihn einzulösen',
      improveQuestion: 'Danke, wie können wir uns verbessern?',
      namePlaceholder: 'Dein Name',
      emailPlaceholder: 'Deine E-Mail',
      feedbackPlaceholder: 'Schreibe dein Feedback',
      submitBtn: 'Senden',
      continueBtn: 'Weiter',
      googleReviewTitle: 'Danke! Jetzt kannst du uns eine Google-Bewertung hinterlassen:',
      googleBtn: 'Zu Google',
      googleReviewBtn: 'Google-Bewertung hinterlassen',
      spinBtn: 'Dreh das Rad',
      star: 'Stern',
      stars: 'Sterne',
      prizes: ['Dessert','Kaffee','Mojito','Eistüte','Kurzer','Erfrischungsgetränk','Bier','Tapa']
    },
    fr: {
      title: 'Votre avis a un prix!',
      subtitle: 'Avant votre récompense, comment s\'est passée votre expérience ? Aidez-nous à nous améliorer en notant avec les étoiles.',
      rouletteTitle: 'Allez chercher votre prix!',
      rouletteSubtitle: 'Tournez la roue pour découvrir votre récompense.',
      confirm: 'Confirmer',
      confirmRating: 'Confirmer la note',
      rewardCode: 'Code de récompense',
      finishReview: 'Terminez votre avis pour pouvoir l\'échanger',
      improveQuestion: 'Merci, comment pouvons-nous nous améliorer?',
      namePlaceholder: 'Votre nom',
      emailPlaceholder: 'Votre email',
      feedbackPlaceholder: 'Écrivez votre avis',
      submitBtn: 'Envoyer',
      continueBtn: 'Continuer',
      googleReviewTitle: 'Merci! Maintenant vous pouvez nous laisser votre avis Google:',
      googleBtn: 'Aller à Google',
      googleReviewBtn: 'Laisser un avis Google',
      spinBtn: 'Tourner la roue',
      star: 'Étoile',
      stars: 'Étoiles',
      prizes: ['Dessert','Café','Mojito','Cornet de glace','Shot','Boisson gazeuse','Bière','Tapa']
    }
  };

  window.getTranslatedPrizes = () => translations[currentLanguage].prizes;

  const languageFlags = {
    es: 'https://flagcdn.com/w20/es.png',
    en: 'https://flagcdn.com/w20/gb.png',
    de: 'https://flagcdn.com/w20/de.png',
    fr: 'https://flagcdn.com/w20/fr.png'
  };
  const languageCodes = { es: 'ES', en: 'EN', de: 'DE', fr: 'FR' };

  /* -------------------- DOM -------------------- */
  const container         = document.querySelector('.container');
  const header            = container.querySelector('.header');
  const ratingSection     = container.querySelector('.rating-section');
  const stars             = document.querySelectorAll('.star');
  const ratingContainer   = document.getElementById('rating');
  const valorarBtnContainer = document.getElementById('valorarBtnContainer');
  const valorarBtn        = document.getElementById('valorarBtn');
  const btnText           = document.getElementById('btnText');
  const codigoContainer   = document.getElementById('codigoContainer');
  const codigoRecompensa  = document.getElementById('codigoRecompensa');
  const formulario        = document.getElementById('formulario');
  const feedbackForm      = document.getElementById('feedbackForm');
  const feedbackGroup     = document.getElementById('feedback-group');
  const feedbackTextarea  = feedbackGroup.querySelector('textarea');
  const submitBtn         = document.getElementById('submitText');
  const resenaBtn         = document.getElementById('resenaBtn');
  const rouletteContainer = document.getElementById('rouletteContainer');
  const spinBtn           = document.getElementById('spinBtn');
  const rouletteScreen    = document.querySelector('.roulette-screen');

  const languageDropdown  = document.getElementById('languageDropdown');
  const languageBtn       = document.getElementById('languageBtn');
  const currentFlag       = document.getElementById('currentFlag');
  const currentLang       = document.getElementById('currentLang');
  const languageOptions   = document.getElementById('languageOptions');

  /* -------------------- State -------------------- */
  let currentLanguage = 'es';
  let selectedValue   = 0;
  let ratingLocked    = false;

  /* -------------------- Helpers -------------------- */
  const show  = el => { if(el) { el.classList.remove('hidden'); el.classList.add('fade-in'); } };
  const hide  = el => { if(el) { el.classList.add('hidden');   el.classList.remove('fade-in'); } };

  function updateStars(val) {
    stars.forEach(s => {
      s.classList.toggle('active', parseInt(s.dataset.value) <= val);
    });
  }

  function updateLanguage(lang) {
    currentLanguage = lang;
    currentFlag.style.backgroundImage = `url('${languageFlags[lang]}')`;
    currentLang.textContent = languageCodes[lang];

    document.querySelectorAll('.language-option').forEach(opt => {
      opt.classList.toggle('active', opt.dataset.lang === lang);
    });

    document.querySelectorAll('[data-text]').forEach(el => {
      el.textContent = translations[lang][el.dataset.text] || el.textContent;
    });
    document.querySelectorAll('[data-placeholder]').forEach(el => {
      el.placeholder = translations[lang][el.dataset.placeholder];
    });

    if (selectedValue) {
      btnText.textContent = `${translations[lang].confirm} ${selectedValue} ${
        selectedValue === 1
          ? translations[lang].star
          : translations[lang].stars
      }`;
    }

    if (!formulario.classList.contains('hidden')) {
      if (feedbackTextarea.required) {
        submitBtn.textContent = translations[lang].submitBtn;
      } else {
        submitBtn.textContent = translations[lang].continueBtn;
      }
    }
    spinBtn.textContent = translations[lang].spinBtn;

    document.documentElement.lang = lang;
  }

  /* -------------------- Language dropdown -------------------- */
  languageBtn.addEventListener('click', e => {
    e.stopPropagation();
    languageDropdown.classList.toggle('open');
  });
  languageOptions.addEventListener('click', e => {
    const opt = e.target.closest('.language-option');
    if (opt) {
      const lang = opt.dataset.lang;
      updateLanguage(lang);
      languageDropdown.classList.remove('open');
    }
  });
  document.addEventListener('click', () => languageDropdown.classList.remove('open'));

  /* -------------------- Rating interactions -------------------- */
  ratingContainer.addEventListener('mouseover', e => {
    if (ratingLocked) return;
    if (e.target.classList.contains('star')) {
      updateStars(parseInt(e.target.dataset.value));
    }
  });
  ratingContainer.addEventListener('mouseout', () => {
    if (!ratingLocked) updateStars(selectedValue);
  });
  ratingContainer.addEventListener('click', e => {
    if (ratingLocked) return;
    if (e.target.classList.contains('star')) {
      selectedValue = parseInt(e.target.dataset.value);
      updateStars(selectedValue);
      btnText.textContent = `${translations[currentLanguage].confirm} ${selectedValue} ${
        selectedValue === 1
          ? translations[currentLanguage].star
          : translations[currentLanguage].stars
      }`;
      show(valorarBtnContainer);
    }
  });

  /* -------------------- Confirm rating -------------------- */
  valorarBtn.addEventListener('click', () => {
    if (ratingLocked || !selectedValue) return;
    ratingLocked = true;
    stars.forEach(s => s.classList.add('locked'));
    valorarBtn.disabled = true;

    show(formulario);
    if (selectedValue < 5) {
      show(feedbackGroup);
      feedbackTextarea.required = true;
      submitBtn.textContent = translations[currentLanguage].submitBtn;
    } else {
      hide(feedbackGroup);
      feedbackTextarea.required = false;
      submitBtn.textContent = translations[currentLanguage].continueBtn;
    }
    hide(valorarBtnContainer);
  });

  /* -------------------- Feedback form -------------------- */
  feedbackForm.addEventListener('submit', e => {
    e.preventDefault();
    hide(container);
    show(rouletteScreen);
    window.showRoulette(selectedValue);
  });

  /* -------------------- Google review -------------------- */
  window.goToReview = function () {
    window.open('https://search.google.com/local/writereview?placeid=ChIJbTuh2nOiagwR7wVm8-DJOZg', '_blank');
  };

  /* -------------------- Init -------------------- */
  document.querySelectorAll('.language-option .flag').forEach(flagEl => {
    const lang = flagEl.parentElement.dataset.lang;
    if (languageFlags[lang]) {
      flagEl.style.backgroundImage = `url('${languageFlags[lang]}')`;
    }
  });

  updateLanguage('es');
});
