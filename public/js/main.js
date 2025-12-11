document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const toggle = document.querySelector('.theme-toggle');

  if (toggle) {
    toggle.addEventListener('click', () => {
      if (body.classList.contains('theme-dark')) {
        body.classList.remove('theme-dark');
        body.classList.add('theme-light');
      } else {
        body.classList.remove('theme-light');
        body.classList.add('theme-dark');
      }
    });
  }
});
