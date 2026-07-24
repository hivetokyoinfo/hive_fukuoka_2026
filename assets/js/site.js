const header = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
const mobileNav = document.querySelector('.mobile-nav');

const updateHeader = () => {
  if (!header) return;
  header.classList.toggle('is-scrolled', window.scrollY > 24);
};

const closeMenu = () => {
  if (!navToggle || !mobileNav || !header) return;
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', 'メニューを開く');
  mobileNav.classList.remove('is-open');
  header.classList.remove('menu-visible');
  document.body.classList.remove('menu-open');
};

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

if (navToggle && mobileNav && header) {
  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'メニューを開く' : 'メニューを閉じる');
    mobileNav.classList.toggle('is-open', !isOpen);
    header.classList.toggle('menu-visible', !isOpen);
    document.body.classList.toggle('menu-open', !isOpen);
  });

  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 820) closeMenu();
  });
}

const revealItems = document.querySelectorAll('.reveal');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -3% 0px', threshold: 0.06 },
  );

  revealItems.forEach((item) => observer.observe(item));
}

document.querySelectorAll('[data-video]').forEach((frame) => {
  const playButton = frame.querySelector('[data-video-play]');
  if (!playButton) return;

  playButton.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.src = 'https://player.vimeo.com/video/792859255?h=0&title=0&byline=0&portrait=0&autoplay=1';
    iframe.title = 'Hiveコンセプトムービー';
    iframe.allow = 'autoplay; fullscreen; picture-in-picture';
    frame.replaceChildren(iframe);
  });
});

const contactLinks = document.querySelectorAll('[data-contact-email]');

if (contactLinks.length) {
  const email = 'hive.fukuoka@gmail.com';
  const dialog = document.createElement('dialog');
  dialog.className = 'email-dialog';
  dialog.setAttribute('aria-labelledby', 'email-dialog-title');
  dialog.innerHTML = `
    <div class="email-dialog-inner">
      <form method="dialog">
        <button class="email-dialog-close" type="submit" aria-label="閉じる">×</button>
      </form>
      <span class="eyebrow">CONTACT</span>
      <h2 id="email-dialog-title">活動についてのお問い合わせ</h2>
      <p class="email-dialog-address">${email}</p>
      <div class="email-dialog-actions">
        <a class="button button--blue" href="mailto:${email}">メールを作成</a>
        <button class="button button--line" type="button" data-email-copy>メールアドレスをコピー</button>
      </div>
      <p class="email-dialog-status" role="status" aria-live="polite"></p>
    </div>
  `;
  document.body.append(dialog);

  const status = dialog.querySelector('.email-dialog-status');
  const copyButton = dialog.querySelector('[data-email-copy]');

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      const input = document.createElement('textarea');
      input.value = email;
      input.setAttribute('readonly', '');
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.append(input);
      input.select();
      document.execCommand('copy');
      input.remove();
    }

    status.textContent = 'メールアドレスをコピーしました。';
  };

  contactLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      if (typeof dialog.showModal !== 'function') return;
      event.preventDefault();
      status.textContent = '';
      dialog.showModal();
      document.body.classList.add('dialog-open');
    });
  });

  copyButton.addEventListener('click', copyEmail);

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
  });
}
