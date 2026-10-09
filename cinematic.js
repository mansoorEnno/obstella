(() => {
  const slides = [...document.querySelectorAll('.module-slide')];
  const choices = [...document.querySelectorAll('[data-module-select]')];
  const stage = document.querySelector('.orbit-stage');
  const scene = document.querySelector('.orbit-scene');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const narrow = window.matchMedia('(max-width: 560px)');
  const captions = {
    dashboard: ['A clear view of your day.', 'Visits, income, occupied rooms and outstanding dues.'],
    visits: ['A smoother start to every visit.', 'Registration, consultation fees, lab tests and queue tokens.'],
    rooms: ['Every room. Every admission.', 'See availability across your blocks, floors and rooms.'],
    income: ['Know where the numbers stand.', 'Review hospital income by date, category or doctor.'],
    billing: ['From admission to final receipt.', 'Packages, discounts, payments and discharge billing.'],
    patients: ['A patient record that stays together.', 'Find visits, admissions, payments and balances in one place.']
  };
  let position = 0;
  let dragStart = null;
  let ignoreClick = false;
  let lastDragAt = 0;
  let horizontalWheel = 0;
  let lastWheelChange = 0;
  function render() {
    const current = ((position % slides.length) + slides.length) % slides.length;
    const radius = narrow.matches ? 340 : 600;
    scene.style.setProperty('--orbit-angle', `${-position * 360 / slides.length}deg`);
    scene.style.setProperty('--orbit-radius', `${radius}px`);
    slides.forEach((slide, index) => {
      const active = index === current;
      slide.style.transform = `translate(-50%, -50%) rotateY(${index * 360 / slides.length}deg) translateZ(${radius}px)`;
      slide.classList.toggle('is-active', active);
      slide.inert = !active;
      slide.tabIndex = active ? 0 : -1;
      slide.setAttribute('aria-hidden', String(!active));
    });
    choices.forEach((button, index) => button.setAttribute('aria-pressed', String(index === current)));
    const module = slides[current].dataset.module;
    document.querySelector('#module-number').textContent = `${String(current + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    document.querySelector('#module-title').textContent = captions[module][0];
    document.querySelector('#module-description').textContent = captions[module][1];
  }
  function change(delta) { position += delta; render(); }
  document.querySelector('#module-prev').addEventListener('click', () => change(-1));
  document.querySelector('#module-next').addEventListener('click', () => change(1));
  choices.forEach((button, index) => button.addEventListener('click', () => {
    const current = ((position % slides.length) + slides.length) % slides.length;
    let distance = index - current;
    if (distance > slides.length / 2) distance -= slides.length;
    if (distance < -slides.length / 2) distance += slides.length;
    change(distance);
  }));
  stage.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const focusedSlide = event.target.closest('.module-slide');
      if (focusedSlide) stage.focus();
      change(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  stage.addEventListener('wheel', event => {
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) * 1.2) return;
    event.preventDefault();
    horizontalWheel += event.deltaX;
    const now = performance.now();
    if (Math.abs(horizontalWheel) > 65 && now - lastWheelChange > 700) {
      change(horizontalWheel > 0 ? 1 : -1);
      horizontalWheel = 0;
      lastWheelChange = now;
    }
  }, { passive: false });
  stage.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    dragStart = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
    ignoreClick = false;
  });
  stage.addEventListener('pointermove', event => {
    if (dragStart && Math.abs(event.clientX - dragStart.x) > 12) stage.classList.add('is-dragging');
    if (!motion.matches && event.pointerType === 'mouse' && !dragStart) {
      const rect = stage.getBoundingClientRect();
      scene.style.setProperty('--tilt-y', `${((event.clientX - rect.left) / rect.width - .5) * 3}deg`);
      scene.style.setProperty('--tilt-x', `${-((event.clientY - rect.top) / rect.height - .5) * 2}deg`);
    }
  });
  window.addEventListener('pointerup', event => {
    if (!dragStart || event.pointerId !== dragStart.pointerId) return;
    const deltaX = event.clientX - dragStart.x;
    const deltaY = event.clientY - dragStart.y;
    ignoreClick = Math.abs(deltaX) > 12;
    if (ignoreClick) lastDragAt = performance.now();
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) change(deltaX < 0 ? 1 : -1);
    dragStart = null;
    stage.classList.remove('is-dragging');
  });
  stage.addEventListener('pointercancel', () => { dragStart = null; stage.classList.remove('is-dragging'); });
  stage.addEventListener('pointerleave', () => {
    scene.style.setProperty('--tilt-x', '0deg');
    scene.style.setProperty('--tilt-y', '0deg');
  });
  slides.forEach(slide => slide.addEventListener('click', () => {
    if (ignoreClick && performance.now() - lastDragAt < 350) { ignoreClick = false; return; }
    const image = slide.querySelector('img');
    document.querySelector('#dialog-title').textContent = slide.querySelector('.screen-chrome span:last-child').textContent;
    const dialogImage = document.querySelector('#dialog-image');
    dialogImage.src = image.src;
    dialogImage.alt = image.alt;
    document.querySelector('#screen-dialog').showModal();
  }));
  narrow.addEventListener('change', render);
  motion.addEventListener('change', () => {
    scene.style.setProperty('--tilt-x', '0deg');
    scene.style.setProperty('--tilt-y', '0deg');
  });
  render();
  scene.classList.add('is-ready');

  const form = document.querySelector('#demo-form');
  form.addEventListener('submit', () => {
    const name = document.querySelector('#demo-name').value.trim();
    const hospital = document.querySelector('#demo-hospital').value.trim();
    const interest = document.querySelector('#demo-interest').value;
    const lines = ['Hello, I would like a personal demo of Obstella.'];
    if (name) lines.push(`Name: ${name}`);
    if (hospital) lines.push(`Hospital or clinic: ${hospital}`);
    lines.push(`Interested in: ${interest}`);
    document.querySelector('#demo-message').value = lines.join('\n');
  });

  const revealElements = document.querySelectorAll('.cinematic-reveal');
  if ('IntersectionObserver' in window && !motion.matches) {
    document.documentElement.classList.add('motion-ready');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .12 });
    revealElements.forEach(element => observer.observe(element));
  }
  const visiblePhotos = new Set();
  const photos = [...document.querySelectorAll('.story-visual, .contact-visual')];
  let photoFrame = null;
  function updatePhotos() {
    photoFrame = null;
    if (motion.matches) return;
    const updates = [...visiblePhotos].map(photo => {
      const rect = photo.parentElement.getBoundingClientRect();
      const progress = (window.innerHeight / 2 - rect.top - rect.height / 2) / window.innerHeight;
      return [photo, `${Math.max(-18, Math.min(18, progress * 24))}px`];
    });
    updates.forEach(([photo, shift]) => photo.style.setProperty('--photo-shift', shift));
  }
  if ('IntersectionObserver' in window) {
    const photoObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.isIntersecting ? visiblePhotos.add(entry.target) : visiblePhotos.delete(entry.target));
      updatePhotos();
    });
    photos.forEach(photo => photoObserver.observe(photo));
    window.addEventListener('scroll', () => {
      if (!motion.matches && !photoFrame && visiblePhotos.size) photoFrame = requestAnimationFrame(updatePhotos);
    }, { passive: true });
  }
})();
