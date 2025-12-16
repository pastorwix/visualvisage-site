(function() {
  const toggle = document.querySelector('.offcanvas-toggle');
  const overlay = document.getElementById('offcanvasOverlay');
  const panel = document.getElementById('offcanvasNav');
  const closeBtn = panel ? panel.querySelector('.offcanvas-close') : null;

  if (toggle && overlay && panel && closeBtn) {
    const openNav = () => {
      overlay.classList.add('open');
      panel.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      panel.setAttribute('aria-hidden', 'false');
    };
    const closeNav = () => {
      overlay.classList.remove('open');
      panel.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      panel.setAttribute('aria-hidden', 'true');
    };

    toggle.addEventListener('click', () => {
      const isOpen = panel.classList.contains('open');
      isOpen ? closeNav() : openNav();
    });
    closeBtn.addEventListener('click', closeNav);
    overlay.addEventListener('click', closeNav);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeNav();
    });
  } else {
    // Fallback for legacy nav-toggle/global-nav-links
    document.querySelectorAll('.nav-toggle').forEach((btn) => {
      const targetId = btn.getAttribute('aria-controls');
      const menu = document.getElementById(targetId);
      if (!menu) return;
      btn.addEventListener('click', () => {
        const isOpen = menu.classList.toggle('open');
        btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
    });
  }
})();
