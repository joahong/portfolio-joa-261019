// Native modal dialogs keep background content inert and keyboard focus inside.
(() => {
  if (!window.HTMLDialogElement || !HTMLDialogElement.prototype.showModal) return;
  let active = null;
  let opener = null;
  let saved = null;

  function release(dialog) {
    if (active !== dialog || !saved) return;
    Object.assign(document.body.style, saved.body);
    document.documentElement.style.overflow = saved.rootOverflow;
    window.scrollTo(saved.x, saved.y);
    opener?.focus({ preventScroll: true });
    active = null;
    opener = null;
    saved = null;
  }

  document.querySelectorAll('[data-tool-dialog]').forEach(link => {
    const dialog = document.getElementById(link.dataset.toolDialog);
    if (!(dialog instanceof HTMLDialogElement)) return;
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      if (active) return;
      opener = link;
      active = dialog;
      const body = document.body.style;
      saved = {
        x: scrollX, y: scrollY,
        rootOverflow: document.documentElement.style.overflow,
        body: { position: body.position, top: body.top, left: body.left, width: body.width, paddingRight: body.paddingRight }
      };
      const gutter = innerWidth - document.documentElement.clientWidth;
      const padding = parseFloat(getComputedStyle(document.body).paddingRight) || 0;
      Object.assign(body, { position: 'fixed', top: `-${saved.y}px`, left: `-${saved.x}px`, width: '100%', paddingRight: `${padding + gutter}px` });
      document.documentElement.style.overflow = 'hidden';
      try { dialog.showModal(); } catch { release(dialog); location.href = link.href; return; }
      dialog.scrollTop = 0;
      dialog.querySelector('h2').focus({ preventScroll: true });
      dialog.querySelectorAll('img').forEach(image => { image.loading = 'eager'; });
    });
  });

  document.querySelectorAll('.tool-dialog').forEach(dialog => {
    dialog.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const controls = [...dialog.querySelectorAll('a[href], button:not([disabled]), [tabindex="0"]')]
        .filter(control => control.getClientRects().length);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === first || !controls.includes(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    dialog.querySelectorAll('[data-dialog-close]').forEach(button => {
      button.addEventListener('click', () => dialog.close());
    });
    dialog.addEventListener('close', () => release(dialog));
    let startedOutside = false;
    const outside = event => {
      const rect = dialog.getBoundingClientRect();
      return event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom);
    };
    dialog.addEventListener('pointerdown', event => { startedOutside = outside(event); });
    dialog.addEventListener('click', event => {
      if (startedOutside && outside(event)) dialog.close();
      startedOutside = false;
    });
  });
})();
