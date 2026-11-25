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

  /* ---- Contact Form with Real Backend Submission ---- */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      // Client-side validation
      const required = contactForm.querySelectorAll('[required]');
      let valid = true;
      required.forEach(field => {
        if (!field.value.trim()) {
          field.style.borderColor = '#E53E3E';
          valid = false;
          field.addEventListener('input', () => { field.style.borderColor = ''; }, { once: true });
        }
      });

      const phoneField = contactForm.querySelector('input[name="phone"]');
      if (phoneField && phoneField.value.trim().length < 8) {
        phoneField.style.borderColor = '#E53E3E';
        valid = false;
      }

      if (!valid) return;

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnHtml = submitBtn ? submitBtn.innerHTML : 'Send Enquiry';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span style="display:inline-block;animation:spin 1s linear infinite;margin-right:8px;">⏳</span> Sending...';
      }

      const formData = {
        name: (contactForm.querySelector('input[name="name"]') || {}).value || '',
        businessName: (contactForm.querySelector('input[name="business"]') || {}).value || '',
        phone: (contactForm.querySelector('input[name="phone"]') || {}).value || '',
        email: (contactForm.querySelector('input[name="email"]') || {}).value || '',
        productRequirement: (contactForm.querySelector('select[name="product"]') || {}).value || '',
        quantity: (contactForm.querySelector('input[name="quantity"]') || {}).value || '',
        manufacturingModel: (contactForm.querySelector('select[name="model"]') || {}).value || '',
        message: (contactForm.querySelector('textarea[name="message"]') || {}).value || ''
      };

      try {
        const apiFetch = window.AYUSH_CONFIG ? window.AYUSH_CONFIG.apiFetch : fetch;
        const endpoint = window.AYUSH_CONFIG ? '/enquiries' : '/api/v1/enquiries';

        const result = await apiFetch(endpoint, {
          method: 'POST',
          body: JSON.stringify(formData)
        });

        if (result && result.success) {
          const formFields = contactForm.querySelector('.form-fields');
          const successMsg = document.getElementById('formSuccess') || contactForm.querySelector('.form-success');
          if (formFields && successMsg) {
            formFields.style.display = 'none';
            successMsg.style.display = 'block';
            const enquiryRef = (result.data && result.data.enquiryNumber) || result.enquiryId;
            if (enquiryRef) {
              const idEl = successMsg.querySelector('.enquiry-id-badge');
              if (idEl) {
                idEl.textContent = 'Reference ID: ' + enquiryRef;
              } else {
                const badge = document.createElement('div');
                badge.className = 'enquiry-id-badge';
                badge.style.cssText = 'margin-top:12px;padding:6px 14px;background:#0A1628;color:#F0C060;display:inline-block;border-radius:6px;font-size:0.85rem;font-weight:600;letter-spacing:0.05em;';
                badge.textContent = 'Reference ID: ' + enquiryRef;
                successMsg.appendChild(badge);
              }
            }
          }
        } else {
          alert(result.message || (result.errors && result.errors.join('\n')) || 'Failed to submit enquiry. Please try again.');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHtml;
          }
        }
      } catch (err) {
        console.warn('Backend enquiry submission failed, using client fallback:', err);
        alert(err.message || 'Submission failed. Please connect with us directly on WhatsApp (+91 7524890613).');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
      }
    });
  }

  /* ---- WhatsApp Float Button ---- */
  const waBtn = document.querySelector('.whatsapp-float-btn');
  if (waBtn) {
    waBtn.addEventListener('click', function () {
      const phone   = '917524890613';
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
