
(async function(){
  const res = await fetch('data/speakers.json');
  const data = await res.json();
  const grid = document.getElementById('speakers-grid');
  const input = document.getElementById('speaker-search');

  function render(items){
    grid.innerHTML='';
    items.forEach(s => {
      const card = document.createElement('article');
      card.className='card';
      card.innerHTML = `
        <img class="img" src="${s.photo}" alt="Фото: ${s.name}" loading="lazy" onerror="this.removeAttribute('onerror');this.src='assets/img/og.png'">
        <h3>${s.name}</h3>
        <p>${s.role}</p>
        <div>${(s.tags||[]).map(t=>`<span class="badge">${t}</span>`).join(' ')}</div>
        <p>${s.bio||''}</p>
        <p>${s.links?.site?'<a href="'+s.links.site+'">Сайт</a>':''}
           ${s.links?.tg? ' · <a href="'+s.links.tg+'">TG</a>':''}
           ${s.links?.vk? ' · <a href="'+s.links.vk+'">VK</a>':''}
           ${s.links?.yt? ' · <a href="'+s.links.yt+'">YouTube</a>':''}</p>`;
      grid.appendChild(card);
    });
  }

  function simpleFuse(items, opts){
    const keys = opts.keys || [];
    return {
      search(q){
        q = (q||'').toLowerCase().trim();
        if (!q) return items.map(it=>({ item: it, score: 0 }));
        return items.map(it=>{
          const hay = keys.map(k => {
            const v = k.split('.').reduce((o,kk)=>o?.[kk], it);
            return Array.isArray(v) ? v.join(' ') : (v||'');
          }).join(' ').toLowerCase();
          const idx = hay.indexOf(q);
          return { item: it, score: idx === -1 ? 1 : Math.min(0.99, 0.01 * idx) };
        }).filter(r => r.score < 1).sort((a,b)=>a.score-b.score);
      }
    }
  }

  const fuse = window.Fuse ? new window.Fuse(data, { keys:['name','role','bio','tags'] }) : simpleFuse(data, { keys:['name','role','bio','tags'] });

  input.addEventListener('input', () => {
    const q = input.value;
    const results = fuse.search(q).map(r => r.item);
    render(results);
  });

  render(data);
})();
