document.addEventListener('DOMContentLoaded', () => {
  /* -------------------- Translations -------------------- */
  const translations = {
    es: {
      title: '¡Elige tu sorpresa!',
      subtitle: 'Antes, por favor valora tu experiencia con nosotros',
      confirmRating: 'Confirmar valoración',
      rewardCode: 'Código de recompensa',
      finishReview: 'Finaliza tu reseña para poder canjearlo',
      improveQuestion: 'Gracias, ¿cómo podríamos mejorar?',
      namePlaceholder: 'Tu nombre',
      emailPlaceholder: 'Tu email',
      feedbackPlaceholder: 'Escribe tu opinión',
      submitBtn: 'Enviar',
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
      subtitle: 'Before that, please rate your experience',
      confirmRating: 'Confirm rating',
      rewardCode: 'Reward code',
      finishReview: 'Finish your review to redeem it',
      improveQuestion: 'Thanks, how can we improve?',
      namePlaceholder: 'Your name',
      emailPlaceholder: 'Your email',
      feedbackPlaceholder: 'Write your feedback',
      submitBtn: 'Send',
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
      subtitle: 'Bitte bewerte zuerst deine Erfahrung',
      confirmRating: 'Bewertung bestätigen',
      rewardCode: 'Belohnungscode',
      finishReview: 'Schließe deine Bewertung ab, um ihn einzulösen',
      improveQuestion: 'Danke, wie können wir uns verbessern?',
      namePlaceholder: 'Dein Name',
      emailPlaceholder: 'Deine E-Mail',
      feedbackPlaceholder: 'Schreibe dein Feedback',
      submitBtn: 'Senden',
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
      subtitle: 'Avant cela, veuillez évaluer votre expérience',
      confirmRating: 'Confirmer la note',
      rewardCode: 'Code de récompense',
      finishReview: 'Terminez votre avis pour pouvoir l\'échanger',
      improveQuestion: 'Merci, comment pouvons-nous nous améliorer?',
      namePlaceholder: 'Votre nom',
      emailPlaceholder: 'Votre email',
      feedbackPlaceholder: 'Écrivez votre avis',
      submitBtn: 'Envoyer',
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

  const languageFlags = { es: '🇪🇸', en: '🇬🇧', de: '🇩🇪', fr: '🇫🇷' };
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
  const resenaBtn         = document.getElementById('resenaBtn');

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
    currentFlag.textContent = languageFlags[lang];
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
      btnText.textContent = `${selectedValue} ${
        selectedValue === 1 ? translations[lang].star : translations[lang].stars}`;
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
      updateLanguage(opt.dataset.lang);
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
    if (!ratingLocked) updateStars(0);
  });
  ratingContainer.addEventListener('click', e => {
    if (ratingLocked) return;
    if (e.target.classList.contains('star')) {
      selectedValue = parseInt(e.target.dataset.value);
      updateStars(selectedValue);
      btnText.textContent = `${selectedValue} ${
        selectedValue === 1 ? translations[currentLanguage].star : translations[currentLanguage].stars}`;
      show(valorarBtnContainer);
    }
  });

  /* -------------------- Confirm rating -------------------- */
  valorarBtn.addEventListener('click', () => {
    if (ratingLocked || !selectedValue) return;
    ratingLocked = true;
    stars.forEach(s => s.classList.add('locked'));
    valorarBtn.disabled = true;

    // Generate reward code
    const randomDigits = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const code = `EURO-${randomDigits}${selectedValue}`;
    codigoRecompensa.textContent = code;
    show(codigoContainer);

    if (selectedValue <= 3) {
      show(formulario);
    } else {
      show(resenaBtn);
    }
  });

  /* -------------------- Feedback form -------------------- */
  feedbackForm.addEventListener('submit', e => {
    e.preventDefault();
    alert(translations[currentLanguage].thankYou);
    hide(formulario);
    show(resenaBtn);
  });

  /* -------------------- Google review -------------------- */
  window.goToReview = function () {
    window.open('https://search.google.com/local/writereview?placeid=ChIJbTuh2nOiagwR7wVm8-DJOZg', '_blank');
  };

  /* -------------------- Init -------------------- */
  updateLanguage('es');
});
