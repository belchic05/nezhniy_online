// Speakers dataset (9 confirmed)
const SPEAKERS = [
  { id:1, name:'Анна Лебедева', title:'Маркетолог', link:'#', img:'images/speakers/speaker1.jpg' },
  { id:2, name:'Ольга Соколова', title:'Психолог', link:'#', img:'images/speakers/speaker2.jpg' },
  { id:3, name:'Мария Власова', title:'Предприниматель', link:'#', img:'images/speakers/speaker3.jpg' },
  { id:4, name:'Екатерина Орлова', title:'Коуч', link:'#', img:'images/speakers/speaker4.jpg' },
  { id:5, name:'Наталья Кузнецова', title:'Финансовый советник', link:'#', img:'images/speakers/speaker5.jpg' },
  { id:6, name:'Софья Миронова', title:'HR-эксперт', link:'#', img:'images/speakers/speaker6.jpg' },
  { id:7, name:'Виктория Арсеньева', title:'PR-эксперт', link:'#', img:'images/speakers/speaker7.jpg' },
  { id:8, name:'Дарья Павлова', title:'Стилист', link:'#', img:'images/speakers/speaker8.jpg' },
  { id:9, name:'Алиса Громова', title:'Нутрициолог', link:'#', img:'images/speakers/speaker9.jpg' },
];

function renderSpeakers(list){
  const grid = document.getElementById('speakers-grid');
  if (!grid) return;
  grid.innerHTML = list.map(s => `
    <article class="card speaker-card">
      <img src="${s.img}" alt="${s.name}">
      <div class="content">
        <h3 class="highlight">${s.name}</h3>
        <p>${s.title}</p>
        <a href="${s.link}" target="_blank" rel="noopener">Перейти к ресурсам →</a>
      </div>
    </article>
  `).join('');
}

function highlightMatches(name, query){
  if (!query) return name;
  const idx = name.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return name;
  const before = name.slice(0, idx);
  const match = name.slice(idx, idx + query.length);
  const after  = name.slice(idx + query.length);
  return `${before}<mark>${match}</mark>${after}`;
}

function applySearch(){
  const input = document.getElementById('speaker-search');
  if (!input) return renderSpeakers(SPEAKERS);
  const q = input.value.trim();
  const list = SPEAKERS
    .map(s => ({...s, nameHL: highlightMatches(s.name, q)}))
    .filter(s => s.name.toLowerCase().includes(q.toLowerCase()));
  const grid = document.getElementById('speakers-grid');
  grid.innerHTML = list.map(s => `
    <article class="card speaker-card">
      <img src="${s.img}" alt="${s.name}">
      <div class="content">
        <h3 class="highlight">${s.nameHL || s.name}</h3>
        <p>${s.title}</p>
        <a href="${s.link}" target="_blank" rel="noopener">Перейти к ресурсам →</a>
      </div>
    </article>
  `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  renderSpeakers(SPEAKERS);
  const input = document.getElementById('speaker-search');
  input?.addEventListener('input', applySearch);
});
