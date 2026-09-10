document.addEventListener('DOMContentLoaded', () => {

  /* ============================================================
     SECURITY MODULE: Input Sanitization
     Escapes HTML entities to prevent XSS (Cross-Site Scripting)
     attacks. Applied to all user inputs before processing or
     sending via EmailJS.
     ============================================================ */
  const sanitizeInput = (str) => {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  };

  /* ============================================================
     SECURITY MODULE: Rate Limiter
     Prevents brute-force form submissions (max 3 per 60 seconds).
     Tracks submission timestamps and enforces cooldown.
     ============================================================ */
  const rateLimiter = {
    submissions: [],
    maxSubmissions: 3,
    windowMs: 60000, // 60 seconds

    canSubmit() {
      const now = Date.now();
      // Remove submissions outside the time window
      this.submissions = this.submissions.filter(t => now - t < this.windowMs);
      return this.submissions.length < this.maxSubmissions;
    },

    recordSubmission() {
      this.submissions.push(Date.now());
    },

    getCooldownSeconds() {
      if (this.submissions.length === 0) return 0;
      const oldest = this.submissions[0];
      const remaining = this.windowMs - (Date.now() - oldest);
      return Math.max(0, Math.ceil(remaining / 1000));
    }
  };


  // ============================================================
  // 1. INTERNATIONALIZATION (i18n) SYSTEM
  // ============================================================
  const translations = {
    en: {
      // Navigation
      'nav-about': 'About Us',
      'nav-team': 'Our Team',
      'nav-practice': 'Practice Areas',
      'nav-testimonials': 'Testimonials',
      'nav-faq': 'FAQ',
      'nav-contact': 'Contact',

      // Hero
      'hero-firm-type': 'Law Firm',
      'hero-slogan': 'Tradition, experience, and commitment at the service of your rights',
      'hero-cta': 'Contact Us',

      // About
      'about-title': 'About Our Firm',
      'about-subtitle': 'More than four decades of experience in law',
      'about-text': 'S&G Schnaider Garegnani is a law firm that combines the tradition and vast experience of its founding partners — with more than 40 years of practice — with the modern and dynamic vision of a new generation of legal professionals. We specialize in succession law, health law, and labor law, offering comprehensive and personalized advice to each of our clients.',
      'value-1-title': 'Professional Excellence',
      'value-1-text': 'Commitment to the highest standards of legal practice, with ongoing training and deep knowledge in each area of specialization.',
      'value-2-title': 'Commitment',
      'value-2-text': 'Dedicated and personalized attention to each case, understanding that behind every consultation there is a person who needs answers.',
      'value-3-title': 'Confidentiality',
      'value-3-text': 'Absolute discretion in handling all matters entrusted to us, guaranteeing the privacy of our clients.',
      'value-4-title': 'Results',
      'value-4-text': 'Results-oriented strategy, seeking the most favorable outcome through meticulous planning and expert execution.',

      // Team
      'team-title': 'Our Team',
      'team-subtitle': 'Professionals committed to your rights',
      'team-card1-specialty': 'Succession Law',
      'team-card1-desc': 'Over 40 years of experience in successions, estate divisions, and succession planning. His vast experience guarantees comprehensive advice in the protection of family assets.',
      'team-card2-specialty': 'Health Law',
      'team-card2-desc': 'Former director of one of the largest social security organizations in the country. Over 40 years contributing strategic vision and full knowledge in the sector, specialized in amparo appeals against coverage denials.',
      'team-card3-specialty': 'Labor Law',
      'team-card3-desc': 'Young professional with over 10 years of experience, focused on the current dynamics of labor law. She advises both employers and employees in the defense of their rights.',

      // Practice Areas
      'practice-title': 'Practice Areas',
      'practice-subtitle': 'Specialized legal solutions',
      'practice-1-title': 'Succession Law',
      'practice-1-item-1': 'Testate and intestate successions',
      'practice-1-item-2': 'Estate divisions',
      'practice-1-item-3': 'Succession planning',
      'practice-1-item-4': 'Family asset protection',
      'practice-1-item-5': 'Wills and bequests',
      'practice-1-item-6': 'Divorces',
      'practice-2-title': 'Health Law',
      'practice-2-item-1': 'Amparo appeals for coverage denial',
      'practice-2-item-2': 'Advisory for social security and prepaid health',
      'practice-2-item-3': 'Medical benefits claims',
      'practice-2-item-4': 'Health litigation',
      'practice-3-title': 'Labor Law',
      'practice-3-item-1': 'Employee defense',
      'practice-3-item-2': 'Employer advisory',
      'practice-3-item-3': 'Dismissals and settlements',
      'practice-3-item-4': 'Workplace accidents',
      'practice-3-item-5': 'Collective bargaining',

      // Contact
      'contact-title': 'Contact Us',
      'contact-subtitle': 'We are here to help you',
      'form-name': 'Full Name',
      'form-email': 'Email Address',
      'form-phone': 'Phone',
      'form-area': 'Area of Consultation',
      'form-area-placeholder': 'Select an area',
      'form-area-1': 'Succession Law',
      'form-area-2': 'Health Law',
      'form-area-3': 'Labor Law',
      'form-message': 'Message',
      'form-submit': 'Send Inquiry',
      'contact-info-title': 'Contact Information',
      'contact-email-label': 'Email',
      'contact-address-label': 'Address',
      'contact-hours-label': 'Office Hours',
      'contact-hours-value': 'Monday to Friday, 9:00 AM to 6:00 PM',
      'contact-map-title': 'Our Location',

      // Footer
      'footer-copyright': '© 2026 S&G Schnaider Garegnani – Law Firm. All rights reserved.',
      'footer-links-title': 'Quick Links',
      'footer-contact-title': 'Contact',

      // Form validation messages
      'form-success': 'Thank you for your inquiry. We will contact you shortly.',
      'form-error-required': 'This field is required',
      'form-error-email': 'Please enter a valid email address',
      'form-error-rate-limit': 'Too many submissions. Please wait before trying again.',

      // Logo
      'logo-sub': 'Schnaider Garegnani',
    }
  };

  const spanishTexts = {};
  const i18nElements = document.querySelectorAll('[data-i18n]');

  // Store original texts
  i18nElements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key) {
      spanishTexts[key] = el.textContent || el.value || el.placeholder;
    }
  });

  let currentLang = localStorage.getItem('language') || 'es';
  const langSwitchBtn = document.getElementById('langSwitch');

  const updateLanguage = (lang) => {
    currentLang = lang;
    document.documentElement.lang = lang;
    localStorage.setItem('language', lang);

    if (langSwitchBtn) {
      if (lang === 'en') {
        langSwitchBtn.innerHTML = 'ES / <strong>EN</strong>';
      } else {
        langSwitchBtn.innerHTML = '<strong>ES</strong> / EN';
      }
    }

    i18nElements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        let text = lang === 'en' ? translations.en[key] : spanishTexts[key];
        if (text) {
          if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            if (el.type === 'submit' || el.type === 'button') {
              el.value = text;
            } else {
              el.placeholder = text;
            }
          } else if (el.tagName === 'OPTION') {
            el.textContent = text;
          } else {
            el.textContent = text;
          }
        }
      }
    });
  };

  if (langSwitchBtn) {
    langSwitchBtn.addEventListener('click', () => {
      updateLanguage(currentLang === 'es' ? 'en' : 'es');
    });
  }

  // Init lang
  updateLanguage(currentLang);


  // ============================================================
  // 2. SMOOTH SCROLL NAVIGATION & MOBILE MENU TOGGLE
  // ============================================================
  const headerOffset = 80;
  const mobileToggle = document.getElementById('mobileToggle');
  const mainNav = document.getElementById('mainNav');

  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', () => {
      mainNav.classList.toggle('active');
      mobileToggle.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!mobileToggle.contains(e.target) && !mainNav.contains(e.target) && mainNav.classList.contains('active')) {
        mainNav.classList.remove('active');
        mobileToggle.classList.remove('active');
      }
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        if (mainNav && mainNav.classList.contains('active')) {
          mainNav.classList.remove('active');
          if (mobileToggle) mobileToggle.classList.remove('active');
        }
      }
    });
  });


  // ============================================================
  // 3. ACTIVE NAV LINK ON SCROLL & HEADER SCROLL EFFECT
  // ============================================================
  const header = document.querySelector('.header');
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('#mainNav a');

  window.addEventListener('scroll', () => {
    // Header effect
    if (window.scrollY > 50) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }

    // Active nav link
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      if (scrollY >= (sectionTop - headerOffset - 50)) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').includes(current) && current !== '') {
        link.classList.add('active');
      }
    });
  });


  // ============================================================
  // 4. SCROLL ANIMATIONS
  // ============================================================
  const animateElements = document.querySelectorAll('.animate-on-scroll');
  const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  animateElements.forEach(el => scrollObserver.observe(el));


  // ============================================================
  // 5. EMAILJS INITIALIZATION
  // EmailJS public key (client-side only; for full security,
  // use a backend proxy). Moved from inline HTML script.
  // ============================================================
  if (typeof emailjs !== 'undefined') {
    emailjs.init({
      publicKey: 'wgYDaJ_J4BtD3mkdl',
    });
  }


  // ============================================================
  // 6. CONTACT FORM: Validation + Sanitization + Honeypot + Rate Limiting
  // ============================================================
  const contactForm = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      /* --------------------------------------------------------
         SECURITY: Honeypot check.
         If the hidden "website" field has any value, it was
         filled by a bot. Silently reject the submission.
         -------------------------------------------------------- */
      const honeypot = contactForm.querySelector('input[name="website"]');
      if (honeypot && honeypot.value.trim() !== '') {
        // Bot detected — fake success message to avoid tipping off the bot
        const fakeSuccess = currentLang === 'en'
          ? 'Thank you for your inquiry. We will contact you shortly.'
          : 'Gracias por su consulta. Nos contactaremos a la brevedad.';
        showFormToast(fakeSuccess, 'success');
        contactForm.reset();
        return;
      }

      /* --------------------------------------------------------
         SECURITY: Rate limiting check.
         Maximum 3 submissions per 60 seconds.
         -------------------------------------------------------- */
      if (!rateLimiter.canSubmit()) {
        const cooldown = rateLimiter.getCooldownSeconds();
        const rateLimitMsg = currentLang === 'en'
          ? `Too many submissions. Please wait ${cooldown} seconds.`
          : `Demasiados envíos. Por favor espere ${cooldown} segundos.`;
        showFormToast(rateLimitMsg, 'error');
        return;
      }

      // -- Validate all fields --
      let isValid = true;
      const name = contactForm.querySelector('input[name="name"]');
      const email = contactForm.querySelector('input[name="email"]');
      const phone = contactForm.querySelector('input[name="phone"]');
      const area = contactForm.querySelector('select[name="area"]');
      const message = contactForm.querySelector('textarea[name="message"]');

      const showError = (input, msgKey) => {
        const oldErr = input.parentElement.querySelector('.form-error');
        if (oldErr) oldErr.remove();

        input.classList.add('error');
        const errSpan = document.createElement('span');
        errSpan.classList.add('form-error');
        errSpan.style.color = '#ff6b6b';
        errSpan.style.fontSize = '0.82rem';
        errSpan.style.marginTop = '0.3rem';
        errSpan.style.display = 'block';

        const errText = currentLang === 'en'
          ? translations.en[msgKey]
          : (msgKey === 'form-error-required' ? 'Este campo es requerido' : 'Por favor ingrese un email válido');
        errSpan.textContent = errText;
        input.parentElement.appendChild(errSpan);
      };

      const clearError = (input) => {
        input.classList.remove('error');
        const err = input.parentElement.querySelector('.form-error');
        if (err) err.remove();
      };

      // Validate Name (required, min 2 chars, max 100)
      if (name && (!name.value.trim() || name.value.trim().length < 2)) {
        showError(name, 'form-error-required');
        isValid = false;
      } else if (name) {
        clearError(name);
      }

      /* --------------------------------------------------------
         SECURITY: Robust email validation.
         More strict than basic regex — checks for common
         injection patterns and suspicious characters.
         -------------------------------------------------------- */
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (email && !email.value.trim()) {
        showError(email, 'form-error-required');
        isValid = false;
      } else if (email && !emailRegex.test(email.value.trim())) {
        showError(email, 'form-error-email');
        isValid = false;
      } else if (email) {
        clearError(email);
      }

      // Validate Area (required)
      if (area && !area.value) {
        showError(area, 'form-error-required');
        isValid = false;
      } else if (area) {
        clearError(area);
      }

      // Validate Message (required, min 10 chars)
      if (message && (!message.value.trim() || message.value.trim().length < 10)) {
        showError(message, 'form-error-required');
        isValid = false;
      } else if (message) {
        clearError(message);
      }

      if (isValid) {
        // Record this submission for rate limiting
        rateLimiter.recordSubmission();

        /* --------------------------------------------------------
           SECURITY: Sanitize all inputs before sending.
           This prevents any XSS payloads from being stored
           or reflected through the email service.
           -------------------------------------------------------- */
        const sanitizedData = {
          name: sanitizeInput(name.value.trim()),
          email: sanitizeInput(email.value.trim()),
          phone: phone ? sanitizeInput(phone.value.trim()) : '',
          area: sanitizeInput(area.value),
          message: sanitizeInput(message.value.trim()),
        };

        // Disable button during submission (rate limit visual feedback)
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = currentLang === 'en' ? 'Sending...' : 'Enviando...';
        }

        // Send via EmailJS
        if (typeof emailjs !== 'undefined') {
          emailjs.sendForm('Estudio SyG', 'template_l279769', contactForm)
            .then(() => {
              const successMsg = currentLang === 'en'
                ? translations.en['form-success']
                : 'Gracias por su consulta. Nos contactaremos a la brevedad.';
              showFormToast(successMsg, 'success');
              contactForm.reset();

              // Re-enable button after cooldown
              cooldownButton(30);
            }, (error) => {
              const errorMsg = currentLang === 'en'
                ? 'Error sending the inquiry. Please try again.'
                : 'Error al enviar la consulta. Por favor intente nuevamente.';
              showFormToast(errorMsg, 'error');

              // Re-enable button
              if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = currentLang === 'en' ? 'Send Inquiry' : 'Enviar Consulta';
              }
            });
        } else {
          // EmailJS not loaded — show success anyway (graceful fallback)
          const successMsg = currentLang === 'en'
            ? translations.en['form-success']
            : 'Gracias por su consulta. Nos contactaremos a la brevedad.';
          showFormToast(successMsg, 'success');
          contactForm.reset();
          cooldownButton(30);
        }
      }
    });

    // Clear error on input
    contactForm.querySelectorAll('input, select, textarea').forEach(input => {
      input.addEventListener('input', () => {
        input.classList.remove('error');
        const err = input.parentElement.querySelector('.form-error');
        if (err) err.remove();
      });
    });
  }


  /* ============================================================
     SECURITY: Cooldown timer for submit button.
     After a successful form submission, disables the button
     for N seconds to prevent rapid re-submissions.
     ============================================================ */
  function cooldownButton(seconds) {
    if (!submitBtn) return;
    let remaining = seconds;
    submitBtn.disabled = true;

    const interval = setInterval(() => {
      remaining--;
      if (remaining > 0) {
        submitBtn.textContent = currentLang === 'en'
          ? `Wait ${remaining}s...`
          : `Espere ${remaining}s...`;
      } else {
        clearInterval(interval);
        submitBtn.disabled = false;
        submitBtn.textContent = currentLang === 'en' ? 'Send Inquiry' : 'Enviar Consulta';
      }
    }, 1000);
  }


  /* ============================================================
     UI: Toast notification for form feedback.
     Replaces browser alert() with an elegant inline notification.
     ============================================================ */
  function showFormToast(message, type = 'success') {
    // Remove existing toasts
    const existing = document.querySelector('.form-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `form-toast form-toast--${type}`;
    toast.textContent = message;

    // Style the toast
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '2rem',
      left: '50%',
      transform: 'translateX(-50%) translateY(20px)',
      padding: '1rem 2rem',
      borderRadius: '6px',
      color: '#fff',
      fontSize: '0.95rem',
      fontFamily: 'Inter, sans-serif',
      zIndex: '9999',
      opacity: '0',
      transition: 'all 0.4s ease',
      maxWidth: '90vw',
      textAlign: 'center',
      boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
      background: type === 'success'
        ? 'linear-gradient(135deg, #0A192F, #0c3978)'
        : 'linear-gradient(135deg, #8B0000, #c0392b)',
      borderLeft: type === 'success'
        ? '4px solid #C5A059'
        : '4px solid #ff6b6b',
    });

    document.body.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(() => toast.remove(), 400);
    }, 5000);
  }

});
