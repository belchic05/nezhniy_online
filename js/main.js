// Main interactions
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Mobile menu
const nav = document.getElementById('nav');
if (nav){
  const btn = nav.querySelector('.nav-toggle');
  const list = nav.querySelector('.nav-list');
  btn?.addEventListener('click', () => {
    const open = list.style.display === 'flex';
    list.style.display = open ? 'none' : 'flex';
    btn.setAttribute('aria-expanded', String(!open));
  });
}

// Tabs
document.querySelectorAll('[data-tabs]').forEach(wrapper => {
  const buttons = wrapper.querySelectorAll('.tab-btn');
  const panels = wrapper.querySelectorAll('.tab-panel');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const id = btn.dataset.tab;
      panels.forEach(p => p.classList.toggle('active', p.id === id));
    });
  });
});
