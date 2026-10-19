// Career Agent: fixed phone and logo, four original persona screens.
const thumbnailMotion = matchMedia('(min-width: 761px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
document.querySelectorAll('.cover-agent').forEach(cover => {
  const link = cover.closest('a');
  const strip = cover.querySelector('.persona-strip');
  let automaticPlayed = false, running = false, generation = 0, animations = [];
  const reset = () => {
    generation++;
    animations.forEach(a => a.cancel());
    animations = [];
    running = false;
    cover.classList.remove('is-playing');
    cover.dataset.motionState = 'static';
    if (strip) strip.style.transform = '';
  };
  async function play() {
    if (running || !thumbnailMotion.matches) return;
    running = true;
    const token = ++generation;
    await Promise.all([...cover.querySelectorAll('img')].map(img => img.decode().catch(() => {})));
    if (token !== generation || !thumbnailMotion.matches) return;
    cover.classList.add('is-playing');
    cover.dataset.motionState = 'playing';
    cover.dataset.playCount = String(Number(cover.dataset.playCount || 0) + 1);
    strip.style.transform = 'translateX(0)';
    animations = [strip.animate([
      {transform:'translateX(0)',offset:0}, {transform:'translateX(0)',offset:.18},
      {transform:'translateX(-25%)',offset:.26}, {transform:'translateX(-25%)',offset:.44},
      {transform:'translateX(-50%)',offset:.52}, {transform:'translateX(-50%)',offset:.70},
      {transform:'translateX(-75%)',offset:.78}, {transform:'translateX(-75%)',offset:1}
    ], {duration:4800,easing:'linear',fill:'forwards'})];
    await Promise.all(animations.map(a => a.finished.catch(() => {})));
    if (token !== generation) return;
    if (strip) strip.style.transform = 'translateX(-75%)';
    animations.forEach(a => a.cancel());
    animations = [];
    cover.classList.remove('is-playing');
    cover.dataset.motionState = 'complete';
    running = false;
  }
  link.addEventListener('pointerenter', play);
  link.addEventListener('focus', play);
  const observer = new IntersectionObserver(entries => {
    if (!automaticPlayed && thumbnailMotion.matches && entries.some(e => e.intersectionRatio >= .65)) {
      automaticPlayed = true;
      observer.disconnect();
      play();
    }
  }, {threshold:.65});
  observer.observe(cover);
  thumbnailMotion.addEventListener('change', () => {
    if (!thumbnailMotion.matches) reset();
  });
});
