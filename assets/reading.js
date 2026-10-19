(() => {
  const rail = document.querySelector('.toc-rail');
  if (!rail) return;
  const links = [...document.querySelectorAll('.toc-rail a, .article-contents a')];
  const ids = [...new Set(links.map(link => link.hash.slice(1)))];
  const sections = ids.map(id => document.getElementById(id)).filter(Boolean);
  const header = document.querySelector('.site-header');
  let scheduled = false;
  function update() {
    scheduled = false;
    const line = (header?.getBoundingClientRect().height || 88) + 80;
    let current = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= line) current = section;
      else break;
    }
    links.forEach(link => {
      if (link.hash === '#' + current?.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function schedule() {
    if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('hashchange', schedule);
  window.addEventListener('pageshow', schedule);
  document.addEventListener('load', schedule, true);
  document.fonts?.ready.then(schedule);
  if ('ResizeObserver' in window && header) new ResizeObserver(schedule).observe(header);
  update();
})();
