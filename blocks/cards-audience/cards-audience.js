export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-audience-card-image';
      } else {
        div.className = 'cards-audience-card-body';
      }
    });

    const link = li.querySelector('a');
    if (link) {
      const anchor = document.createElement('a');
      anchor.href = link.href;
      anchor.title = link.textContent || '';
      while (li.firstChild) anchor.append(li.firstChild);
      li.append(anchor);
    }

    ul.append(li);
  });
  block.textContent = '';
  block.append(ul);
}
