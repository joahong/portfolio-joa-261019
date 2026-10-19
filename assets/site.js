// Track section starts so long project sections remain active while reading.
const sectionLinks = Array.from(document.querySelectorAll('[data-section-link]'));
const siteHeader = document.querySelector('.site-header');
const readingSections = sectionLinks
  .map(link => document.getElementById(link.hash.slice(1)))
  .filter(Boolean);
let framePending = false;

function updateReadingPosition() {
  framePending = false;
  if (!readingSections.length) return;
  const readingLine = (siteHeader?.getBoundingClientRect().height || 80) + 24;
  let current = readingSections[0];
  for (const section of readingSections) {
    if (section.getBoundingClientRect().top <= readingLine + 1) current = section;
  }
  // The final short section can end before its heading reaches the reading line.
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
    current = readingSections[readingSections.length - 1];
  }
  sectionLinks.forEach(link => {
    if (link.hash === `#${current.id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}

function scheduleReadingPosition() {
  if (framePending) return;
  framePending = true;
  requestAnimationFrame(updateReadingPosition);
}

function updateHeaderOffset() {
  const offset = (siteHeader?.getBoundingClientRect().height || 80) + 24;
  document.documentElement.style.setProperty('--header-offset', `${offset}px`);
  scheduleReadingPosition();
}

if (siteHeader) {
  updateHeaderOffset();
  if ('ResizeObserver' in window) new ResizeObserver(updateHeaderOffset).observe(siteHeader);
  window.addEventListener('resize', updateHeaderOffset);
}
if (readingSections.length) {
  window.addEventListener('scroll', scheduleReadingPosition, { passive: true });
  window.addEventListener('hashchange', scheduleReadingPosition);
  window.addEventListener('pageshow', scheduleReadingPosition);
  document.addEventListener('load', scheduleReadingPosition, true);
  if (document.fonts?.ready) document.fonts.ready.then(scheduleReadingPosition);
  scheduleReadingPosition();
}
