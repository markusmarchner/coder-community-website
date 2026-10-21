// Native details provides click, touch and keyboard support without a menu widget.
document.querySelectorAll('.nav-dropdown').forEach((dropdown) => {
  const summary = dropdown.querySelector('summary');
  let openedByHover = false;
  summary.addEventListener('click', (event) => {
    if (openedByHover && dropdown.open) event.preventDefault();
    openedByHover = false;
  });
  dropdown.addEventListener('pointerenter', (event) => {
    if (event.pointerType === 'mouse' && matchMedia('(hover: hover)').matches()) { openedByHover = !dropdown.open; dropdown.open = true; }
  });
  dropdown.addEventListener('pointerleave', () => {
    if (!dropdown.contains(document.activeElement)) dropdown.open = false;
  });
  dropdown.addEventListener('focusout', (event) => {
    if (!dropdown.contains(event.relatedTarget)) dropdown.open = false;
  });
  document.addEventListener('click', (event) => {
    if (!dropdown.contains(event.target)) dropdown.open = false;
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && dropdown.open) {
      dropdown.open = false;
      summary.focus();
    }
  });
});
document.querySelectorAll('.main-nav a').forEach((link) => {
  if (link.pathname === location.pathname && !link.hash) {
    link.setAttribute('aria-current', 'page');
    link.closest('.nav-dropdown')?.classList.add('has-current-page');
  }
});
