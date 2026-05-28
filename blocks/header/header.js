import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');

  if (navSections) {
    navSections.querySelectorAll('.nav-drop').forEach((drop) => {
      drop.setAttribute('aria-expanded', 'false');
    });
  }
}

export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  const divSections = [...nav.children].filter((child) => child.tagName === 'DIV');
  classes.forEach((c, i) => {
    if (divSections[i]) divSections[i].classList.add(`nav-${c}`);
  });

  // If tools section not found as a div, look for a standalone ul with utility links
  if (!nav.querySelector('.nav-tools')) {
    const allUls = [...nav.children].filter((child) => child.tagName === 'UL' || (child.tagName === 'DIV' && !child.classList.contains('nav-brand') && !child.classList.contains('nav-sections')));
    const utilUl = allUls.find((el) => el.querySelector('a[href*="request-a-rep"], a[href*="facebook"]'));
    if (utilUl) {
      const toolsDiv = document.createElement('div');
      toolsDiv.classList.add('nav-tools');
      const wrapper = document.createElement('div');
      wrapper.classList.add('default-content-wrapper');
      wrapper.append(utilUl);
      toolsDiv.append(wrapper);
      nav.append(toolsDiv);
    }
  }

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      // Unwrap <a> from <p> — move link directly under <li>
      const p = navSection.querySelector(':scope > p');
      if (p && p.querySelector('a')) {
        const link = p.querySelector('a');
        navSection.insertBefore(link, p);
        p.remove();
      }

      if (navSection.querySelector('ul')) {
        navSection.classList.add('nav-drop');
        navSection.setAttribute('aria-expanded', 'false');
      }
      // Mobile: toggle on click
      navSection.addEventListener('click', () => {
        if (!isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
  }

  // Mark utility bar links
  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    const repLink = navTools.querySelector('a[href*="request-a-rep"]');
    if (repLink) repLink.classList.add('nav-rep-button');
    const fbLink = navTools.querySelector('a[href*="facebook"]');
    if (fbLink) fbLink.classList.add('nav-social-icon', 'nav-social-fb');
    const igLink = navTools.querySelector('a[href*="instagram"]');
    if (igLink) igLink.classList.add('nav-social-icon', 'nav-social-ig');
    const piLink = navTools.querySelector('a[href*="prescribing"]');
    if (piLink) piLink.classList.add('nav-separator');
    const contactLink = navTools.querySelector('a[href*="contact"]');
    if (contactLink) contactLink.classList.add('nav-separator');
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
