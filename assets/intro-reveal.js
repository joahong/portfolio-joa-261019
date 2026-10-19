// A single short introduction reveal; the text remains visible without JavaScript.
(() => {
  const paragraphs = [...document.querySelectorAll('.career-story > p')];
  const allowed = matchMedia('(min-width: 761px) and (prefers-reduced-motion: no-preference)');
  if (!paragraphs.length || !allowed.matches || !Element.prototype.animate) return;
  if (location.hash && !['#intro', '#top'].includes(location.hash)) return;
  const bounds = paragraphs[0].getBoundingClientRect();
  if (bounds.top >= innerHeight || bounds.bottom <= 0) return;
  const visitKey = 'portfolio-intro-revealed';
  try {
    if (sessionStorage.getItem(visitKey)) return;
    sessionStorage.setItem(visitKey, '1');
  } catch { /* Storage restrictions must not prevent reading. */ }
  const animations = paragraphs.map((paragraph, index) => paragraph.animate(
    [{ opacity: 0 }, { opacity: 1 }],
    { duration: 300, delay: index * 100, easing: 'ease-out', fill: 'backwards' }
  ));
  const stop = () => {
    animations.forEach(animation => animation.cancel());
    allowed.removeEventListener('change', onPreferenceChange);
    window.removeEventListener('beforeprint', stop);
  };
  const onPreferenceChange = () => { if (!allowed.matches) stop(); };
  allowed.addEventListener('change', onPreferenceChange);
  window.addEventListener('beforeprint', stop);
  Promise.all(animations.map(animation => animation.finished.catch(() => {}))).then(stop);
})();
