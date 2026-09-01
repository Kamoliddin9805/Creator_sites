const menuToggle = document.querySelector('.menu-toggle');
const navs = document.querySelectorAll('.nav');

if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    const opened = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!opened));
    menuToggle.textContent = opened ? '☰' : '×';
    navs.forEach(nav => nav.classList.toggle('open', !opened));
  });
}

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth <= 1000 && menuToggle) {
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.textContent = '☰';
      navs.forEach(nav => nav.classList.remove('open'));
    }
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const projectForm = document.getElementById('projectForm');
if (projectForm) {
  projectForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const status = projectForm.querySelector('.form-status');
    const name = new FormData(projectForm).get('name') || 'Mijoz';
    status.textContent = `${name}, so‘rovingiz qabul qilindi. Keyingi bosqichda forma Telegram yoki CRM bilan ulanadi.`;
    projectForm.reset();
  });
}
