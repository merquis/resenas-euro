document.addEventListener('DOMContentLoaded', () => {
  /* -------------------- Translations -------------------- */
  const translations = {
    es: {
      title: '¡Elige tu sorpresa!',
      subtitle: 'Antes de tu sorpresa, ¿qué tal fue tu experiencia? Ayúdanos a mejorar valorando con las estrellas.',
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
      processing: 'Procesando...',
      sending: 'Enviando...',
      star: 'Estrella',
      stars: 'Estrellas',
      thankYou: 'Gracias por tu comentario. Lo tendremos en cuenta.'
    },
    en: {
      title: 'Pick your reward!',
      subtitle: 'Before your reward, how was your experience? Help us improve by rating with the stars.',
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
      processing: 'Processing...',
      sending: 'Sending...',
      star: 'Star',
      stars: 'Stars',
      thankYou: 'Thank you for your feedback. We will take it into account.'
    },
    de: {
      title: 'Wähle deine Belohnung!',
      subtitle: 'Wie war deine Erfahrung, bevor du deine Belohnung erhältst? Hilf uns, uns zu verbessern, indem du mit den Sternen bewertest.',
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
      processing: 'Verarbeitung...',
      sending: 'Senden...',
      star: 'Stern',
      stars: 'Sterne',
      thankYou: 'Vielen Dank für dein Feedback. Wir werden es berücksichtigen.'
    },
    fr: {
      title: 'Choisissez votre récompense!',
      subtitle: 'Avant votre récompense, comment s\'est passée votre expérience ? Aidez-nous à nous améliorer en notant avec les étoiles.',
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
      processing: 'Traitement...',
      sending: 'Envoi...',
      star: 'Étoile',
      stars: 'Étoiles',
      thankYou: 'Merci pour votre commentaire. Nous en tiendrons compte.'
    }
  };

  const languageFlags = {
    es: 'https://flagcdn.com/w20/es.png',
    en: 'https://flagcdn.com/w20/gb.png',
    de: 'https://flagcdn.com/w20/de.png',
    fr: 'https://flagcdn.com/w20/fr.png'
  };
  const languageCodes = { es: 'ES', en: 'EN', de: 'DE', fr: 'FR' };

  /* -------------------- DOM -------------------- */
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
  const container         = document.querySelector('.container');

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
  const show  = el => { el.classList.remove('hidden'); el.classList.add('fade-in'); };
  const hide  = el => { el.classList.add('hidden');   el.classList.remove('fade-in'); };

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
      el.textContent = translations[lang][el.dataset.text];
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
      // Update flag in the options list as well
      const optionFlag = opt.querySelector('.flag');
      if (optionFlag) {
        optionFlag.style.backgroundImage = `url('${languageFlags[lang]}')`;
      }
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
    show(rouletteContainer);
    window.showRoulette(selectedValue);
  });

  /* -------------------- Google review -------------------- */
  window.goToReview = function () {
    window.open('https://search.google.com/local/writereview?placeid=ChIJbTuh2nOiagwR7wVm8-DJOZg', '_blank');
  };

  /* -------------------- Init -------------------- */
  // Set initial flags in dropdown
  document.querySelectorAll('.language-option').forEach(opt => {
    const lang = opt.dataset.lang;
    const flagEl = opt.querySelector('.flag');
    if (flagEl && languageFlags[lang]) {
      flagEl.style.backgroundImage = `url('${languageFlags[lang]}')`;
    }
  });

  updateLanguage('es');
});
