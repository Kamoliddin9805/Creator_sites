// Keep the main stylesheet fresh after deployments and apply the expanded services grid safely.
document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
  try {
    const url = new URL(link.href, window.location.href);
    if (url.pathname.endsWith('/styles.css')) {
      url.searchParams.set('v', '20260903-2');
      link.href = url.toString();
    }
  } catch (_) {}
});

const serviceGridFix = document.createElement('style');
serviceGridFix.setAttribute('data-fabs-service-grid-fix', 'true');
serviceGridFix.textContent = `
  .service-grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
  .service-grid article,
  .service-grid article:not(:first-child) {
    padding: 28px 20px;
    border-right: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
  }
  .service-grid article:nth-child(5n) {
    border-right: 0;
  }
  .service-grid article:nth-last-child(-n + 5) {
    border-bottom: 0;
  }

  @media (max-width: 1000px) {
    .service-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .service-grid article,
    .service-grid article:not(:first-child) {
      padding: 24px 18px;
      border-right: 1px solid var(--line);
      border-bottom: 1px solid var(--line);
    }
    .service-grid article:nth-child(2n) {
      border-right: 0;
    }
    .service-grid article:nth-last-child(-n + 2) {
      border-bottom: 0;
    }
  }

  @media (max-width: 700px) {
    .service-grid {
      grid-template-columns: 1fr;
    }
    .service-grid article,
    .service-grid article:not(:first-child) {
      padding: 22px 0;
      border-right: 0;
      border-bottom: 1px solid var(--line);
    }
    .service-grid article:last-child {
      border-bottom: 0;
    }
  }
`;
document.head.appendChild(serviceGridFix);

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
