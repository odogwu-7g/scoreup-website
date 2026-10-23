/* Callback requests are submitted directly to FormSubmit; no browser storage is used. */

// Animate on entry without hiding content if JavaScript or motion is unavailable.
function setupScrollAnimations() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches || !('IntersectionObserver' in window) || !Element.prototype.animate) return;

  const activeAnimations = new Map();
  const targets = [...document.querySelectorAll('.hero-photo, .steps > h2, .step-list li, .about-section > *, .section-heading, .benefit-card, .process-section, .outcome-panel, .process-cta, .team-heading, .team-group')];
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const element = entry.target;
      observer.unobserve(element);
      // A focused link must stay visible when navigating with a keyboard.
      if (reducedMotion.matches || element.contains(document.activeElement)) continue;
      const animation = element.animate([
        { opacity: 0, transform: 'translateY(18px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 520, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
      activeAnimations.set(element, animation);
      animation.addEventListener('finish', () => activeAnimations.delete(element), { once: true });
      animation.addEventListener('cancel', () => activeAnimations.delete(element), { once: true });
    }
  }, { threshold: 0.12 });

  targets.forEach(element => observer.observe(element));
  document.addEventListener('focusin', event => {
    for (const [element, animation] of activeAnimations) {
      if (element.contains(event.target)) animation.cancel();
    }
  });
  reducedMotion.addEventListener('change', event => {
    if (!event.matches) return;
    observer.disconnect();
    for (const animation of activeAnimations.values()) animation.cancel();
    activeAnimations.clear();
  });
}

setupScrollAnimations();

const forms = document.querySelectorAll('[data-callback-form]');

function errorFor(input) {
  if (input.type === 'checkbox') return input.checked ? '' : 'Please confirm that you agree to be contacted.';
  const value = input.value.trim();
  if (input.required && !value) return 'Please complete this field.';
  if (!value) return '';
  if (input.hasAttribute('data-phone')) {
    const number = value.replace(/[\s()-]/g, '');
    if (!/^(?:0[1-9]\d{8}|\+27[1-9]\d{8})$/.test(number)) return 'Enter a South African number, e.g. 082 123 4567 or +27 82 123 4567.';
  }
  if (input.type === 'email' && input.validity.typeMismatch) return 'Enter a valid email address.';
  return '';
}

function showError(input, message) {
  const element = document.getElementById(`${input.id}-error`);
  if (!element) return;
  element.textContent = message;
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
  const existing = (input.getAttribute('aria-describedby') || '').split(' ').filter(Boolean).filter(id => id !== element.id);
  if (message) existing.push(element.id);
  if (existing.length) input.setAttribute('aria-describedby', existing.join(' '));
  else input.removeAttribute('aria-describedby');
}

for (const form of forms) {
  // Keep visitors on the domain they used, including Vercel previews and custom domains.
  if (location.protocol === 'https:' || location.protocol === 'http:') {
    form.elements.namedItem('_next').value = new URL('/thank-you.html', location.origin).href;
    form.elements.namedItem('_url').value = new URL('/', location.origin).href;
  }
  const controls = [...form.querySelectorAll('input:not([type=hidden]):not([name="_honey"])')];
  const submit = form.querySelector('[data-submit]');
  const result = form.querySelector('.form-result');
  let submitting = false;
  // Keep native validation as a fallback when JavaScript is unavailable.
  form.noValidate = true;
  for (const input of controls) {
    input.addEventListener('blur', () => { if (input.value || input.getAttribute('aria-invalid') === 'true') showError(input, errorFor(input)); });
    input.addEventListener(input.type === 'checkbox' ? 'change' : 'input', () => {
      if (input.getAttribute('aria-invalid') === 'true') showError(input, errorFor(input));
      if (!submitting) result.hidden = true;
    });
  }
  form.addEventListener('submit', event => {
    if (submitting) { event.preventDefault(); return; }
    let firstInvalid;
    for (const input of controls) {
      const message = errorFor(input);
      showError(input, message);
      if (message && !firstInvalid) firstInvalid = input;
    }
    if (firstInvalid) { event.preventDefault(); result.hidden = true; firstInvalid.focus(); return; }
    submitting = true;
    submit.disabled = true;
    submit.textContent = 'Sending…';
    form.setAttribute('aria-busy', 'true');
    result.textContent = 'Opening FormSubmit to complete your request. Please complete any spam check shown.';
    result.hidden = false;
    // Allow the native POST to proceed; FormSubmit handles its spam check and redirect.
  });
  window.addEventListener('pageshow', () => {
    submitting = false;
    submit.disabled = false;
    submit.textContent = 'Request a callback';
    form.removeAttribute('aria-busy');
    result.hidden = true;
  });
}

