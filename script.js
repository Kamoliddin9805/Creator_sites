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
  projectForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const status = projectForm.querySelector('.form-status');
    const submitButton = projectForm.querySelector('button[type="submit"]');
    const formData = new FormData(projectForm);

    const payload = {
      name: String(formData.get('name') || '').trim(),
      phone: String(formData.get('phone') || '').trim(),
      type: String(formData.get('type') || '').trim()
    };

    if (!payload.name || !payload.phone) {
      status.textContent = 'Ism va telefon raqamini kiriting.';
      return;
    }

    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.textContent = 'Yuborilmoqda...';
    status.textContent = '';

    try {
      const response = await fetch('/api/send-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'So‘rovni yuborib bo‘lmadi');
      }

      status.textContent = `${payload.name}, so‘rovingiz yuborildi. Tez orada siz bilan bog‘lanamiz.`;
      projectForm.reset();
    } catch (error) {
      console.error('Telegram form error:', error);
      status.textContent = 'Xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.';
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = originalButtonText;
    }
  });
}
