// ============================================================
//  AYUSH CREATION — Main JavaScript
// ============================================================

(function () {
  'use strict';

  /* ---- Sticky Header ---- */
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 10);
  });

  /* ---- Mobile Menu ---- */
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileNav  = document.querySelector('.mobile-nav');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', open);
      const spans = menuToggle.querySelectorAll('span');
      if (open) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity   = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      }
    });

    // Close on nav link click
    mobileNav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      });
    });
  }

  /* ---- Active Nav Link ---- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ---- Scroll Reveal ---- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = el.dataset.revealDelay || 0;
          setTimeout(() => el.classList.add('revealed'), parseInt(delay));
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => io.observe(el));
  } else {
    // Fallback: show all
    revealEls.forEach(el => el.classList.add('revealed'));
  }

  /* ---- Scroll-to-top ---- */
  const scrollTopBtn = document.querySelector('.scroll-top');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
    });
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---- Accordion ---- */
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item  = trigger.closest('.accordion-item');
      const panel = item.querySelector('.accordion-panel');
      const inner = panel.querySelector('.accordion-panel-inner');
      const isOpen = item.classList.contains('open');

      // Close all siblings
      trigger.closest('.accordion').querySelectorAll('.accordion-item').forEach(sib => {
        const sibPanel = sib.querySelector('.accordion-panel');
        const sibInner = sib.querySelector('.accordion-panel-inner');
        sib.classList.remove('open');
        sibPanel.style.maxHeight = '0';
        sib.querySelector('.accordion-trigger').setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('open');
        panel.style.maxHeight = inner.scrollHeight + 'px';
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---- Contact Form ---- */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      // Basic client-side validation
      const required = contactForm.querySelectorAll('[required]');
      let valid = true;
      required.forEach(field => {
        if (!field.value.trim()) {
          field.style.borderColor = '#E53E3E';
          valid = false;
          field.addEventListener('input', () => { field.style.borderColor = ''; }, { once: true });
        }
      });
      if (!valid) return;

      // Show success state
      const formFields = contactForm.querySelector('.form-fields');
      const successMsg = contactForm.querySelector('.form-success');
      if (formFields && successMsg) {
        formFields.style.display = 'none';
        successMsg.style.display = 'block';
      }
    });
  }

  /* ---- WhatsApp Float tooltip on mobile ---- */
  const waBtn = document.querySelector('.whatsapp-float-btn');
  if (waBtn) {
    waBtn.addEventListener('click', function () {
      const phone   = '[WHATSAPP_PHONE_NUMBER]'; // Replace with actual number e.g. 919876543210
      const message = encodeURIComponent('Hello Ayush Creation, I would like to enquire about your garment manufacturing services.');
      window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    });
  }

  /* ---- Smooth internal anchor links ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top    = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ---- Process step hover highlight ---- */
  document.querySelectorAll('.process-step').forEach((step, i) => {
    step.addEventListener('mouseenter', () => step.classList.add('active'));
    step.addEventListener('mouseleave', () => step.classList.remove('active'));
  });

})();
