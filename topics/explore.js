(() => {
  const root = document.querySelector('.topic-index');
  const form = document.querySelector('#topic-filters');
  const status = document.querySelector('#topic-result-count');
  if (!root || !form || !status) return;
  const entries = [...root.querySelectorAll('.topic-group li[data-explore-item]')];
  const controls = Object.fromEntries(['search','group','type','sort'].map(k => [k, form.elements[k]]));
  const initial = entries.map((el, index) => ({el,index,date:el.dataset.issueDate || '',text:el.dataset.searchText.toLocaleLowerCase('ko')}));
  for (const control of Object.values(controls)) control.disabled = false;
  const update = () => {
    const query = controls.search.value.trim().toLocaleLowerCase('ko');
    const group = controls.group.value, type = controls.type.value;
    const visible = initial.filter(x => (!query || x.text.includes(query)) && (!group || x.el.dataset.topicGroup === group) && (!type || x.el.dataset.articleType === type));
    visible.sort((a,b) => {
      if (!a.date && b.date) return 1;
      if (a.date && !b.date) return -1;
      if (a.date && b.date && a.date !== b.date) return (controls.sort.value === 'oldest' ? 1 : -1) * a.date.localeCompare(b.date);
      return a.index - b.index;
    });
    for (const x of initial) x.el.hidden = true;
    for (const x of visible) { x.el.hidden = false; x.el.parentElement.append(x.el); }
    for (const section of root.querySelectorAll('.topic-group')) {
      const count = section.querySelectorAll('li[data-explore-item]:not([hidden])').length;
      section.hidden = count === 0 && (group !== '' || query !== '' || type !== '');
    }
    status.textContent = visible.length ? `${visible.length}편을 찾았습니다.` : '조건에 맞는 글이 없습니다.';
  };
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  form.addEventListener('reset', () => requestAnimationFrame(update));
  update();
  const arrive = () => {
    const question = new URLSearchParams(location.search).get('question');
    const target = [...root.querySelectorAll('[data-legacy-question]')].find(node => node.dataset.legacyQuestion === question);
    if (!target) return;
    const group = target.closest('.topic-group');
    if (group) group.classList.add('is-visible');
    target.setAttribute('tabindex','-1');
    target.focus({preventScroll:true});
    const style = document.documentElement.style;
    const previous = style.scrollBehavior;
    style.scrollBehavior = 'auto';
    window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY);
    style.scrollBehavior = previous;
  };
  if (document.readyState === 'complete') arrive();
  else addEventListener('load', arrive, {once:true});
  addEventListener('popstate', arrive);
})();
