export default function decorate(block) {
  const rows = [...block.children];
  const picture = block.querySelector('picture');

  if (!picture) {
    block.classList.add('no-image');
  }

  const content = document.createElement('div');
  content.className = 'hero-eyecare-content';

  rows.forEach((row) => {
    [...row.children].forEach((col) => {
      if (col.querySelector('picture')) return;
      [...col.children].forEach((el) => content.append(el));
    });
  });

  const heading = content.querySelector('h1, h2, h3');
  if (heading) {
    const paragraphs = content.querySelectorAll('p');
    paragraphs.forEach((p) => {
      // eslint-disable-next-line no-bitwise
      if (p.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING) {
        p.classList.add('hero-eyecare-tagline');
      } else {
        p.classList.add('hero-eyecare-description');
      }
    });
  }

  block.textContent = '';
  if (picture) block.append(picture);
  block.append(content);
}
