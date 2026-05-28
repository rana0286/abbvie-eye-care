import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

function toggleMenu(nav, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
}

export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-expanded', 'false');
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  // Identify sections: brand, sections (main nav), tools (utility bar)
  const classes = ['brand', 'sections', 'tools'];
  const divSections = [...nav.children].filter((child) => child.tagName === 'DIV');
  classes.forEach((c, i) => {
    if (divSections[i]) divSections[i].classList.add(`nav-${c}`);
  });

  // If tools not found as div, wrap standalone UL
  if (!nav.querySelector('.nav-tools')) {
    const utilUl = [...nav.children].find(
      (el) => (el.tagName === 'UL' || el.tagName === 'DIV')
        && !el.classList.contains('nav-brand')
        && !el.classList.contains('nav-sections')
        && el.querySelector('a[href*="request-a-rep"], a[href*="facebook"]'),
    );
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

  // Brand: clean up button classes
  const navBrand = nav.querySelector('.nav-brand');
  if (navBrand) {
    const brandLink = navBrand.querySelector('.button');
    if (brandLink) {
      brandLink.className = '';
      brandLink.closest('.button-container').className = '';
    }
  }

  // Main nav: unwrap links from <p>, add nav-drop class
  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((li) => {
      const p = li.querySelector(':scope > p');
      if (p && p.querySelector('a')) {
        li.insertBefore(p.querySelector('a'), p);
        p.remove();
      }
      if (li.querySelector('ul')) {
        li.classList.add('nav-drop');
      }
    });
  }

  // Utility bar: mark special links
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

  // Hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav));
  nav.prepend(hamburger);

  // Set initial state
  toggleMenu(nav, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
