import { html, render } from 'lit-html';
import './cr-markdownish.js';
import './clipboard.js';

/**
 * A model managing keywords searches.
 * TODO: remembers previous searches (localstorage?).
 */
class KeywordsModel {
  constructor(index) {
    this.index = index;
    this.keys = Object.keys(index);
  }
  getMatches(searchString) {
    if (!searchString) {
      return [];
    }
    const str = searchString.toLowerCase();
    let useCache = false;
    if (this.prevKey_) {
      const occurredAt = str.indexOf(this.prevKey_);
      // An occurance at 0 means the previous key is contained in the new
      // search string.
      // We don't handle the case where the search is exactly the same;
      // we assume it cannot be the same because we're handling a 'change'
      // event. This logic should be updated if ever not handled by a 'change'
      // event.
      if (occurredAt === 0) {
        // Use the cached list of matching keys.
        useCache = true;
      }
    }
    let matches;
    if (useCache) {
      matches = this.prevMatches_.filter((key) => key.indexOf(str) !== -1);
    } else {
      const exactMatches = [];
      const wildcardMatches = [];
      this.keys.forEach((key) => {
        const matchIndex = key.indexOf(str);
        if (matchIndex === 0) {
          exactMatches.push(key);
        } else if (matchIndex !== -1) {
          wildcardMatches.push(key);
        }
      });
      matches = exactMatches.concat(wildcardMatches);
    }

    this.prevKey_ = str;
    this.prevMatches_ = matches;

    return matches.map((key) => this.index[key]);
  }
}

const TYPE_ENUM = {
  DOMAIN: '0',
  EVENT: '1',
  PARAM: '2',
  TYPE: '3',
  METHOD: '4',
};

const TYPE_LABEL_ENUM = {
  0: 'Domain',
  1: 'Event',
  2: 'Parameter',
  3: 'Type',
  4: 'Method',
};

const TYPE_ICON_ENUM = {
  0: '',
  1: 'image:wb-iridescent',
  2: 'icons:more-horiz',
  3: 'icons:code',
  4: 'icons:apps',
};

class CRSearchResults extends HTMLElement {
  constructor(baseUrl) {
    super();
    this.attachShadow({ mode: 'open' });

    this.baseUrl = baseUrl;
  }

  set searchString(searchString) {
    if (this.keywordsModel) this.matches = this.keywordsModel.getMatches(searchString);
    else {
      this.matches = [];
    }

    render(
      html`
        <style>
          :host {
            background: white;
            padding: 15px;
          }
          .results {
            box-shadow: var(--elevation-shadow);
            height: calc(100% - 25px);
            background-color: white;
            padding: 20px 0;
            overflow-y: auto;
          }
          .match-info {
            padding: 10px 20px;
            text-decoration: none;
            color: initial;
            display: block;
          }
          .match-info:hover,
          .match-info.selected {
            background-color: #e8f0ff;
          }
          .match-label {
            font-size: 1.4em;
            margin-bottom: 5px;
          }
          .match-label .label {
            display: flex;
            justify-content: space-between;
          }
          .match-label .type {
            font-size: 0.7em;
          }
        </style>
        <div class="results">
          ${this.matches.map((match) => {
            const { keyword, pageReferences } = match;
            const { type, description, href, domainHref } = pageReferences[0];

            let fullUrl = this.baseUrl + domainHref;

            if (href) {
              fullUrl += href;
            }

            return html`
              <a role="menuitem" class="match-info" href="${fullUrl}" @click=${this.click}>
                <div class="match-label">
                  <div class="label">
                    <span>${keyword}</span>
                    <span class="type">${TYPE_LABEL_ENUM[type]}</span>
                  </div>
                </div>
                <div class="match-description">
                  <cr-markdownish markdown="${description || ''}"></cr-markdownish>
                </div>
              </a>
            `;
          })}
        </div>
      `,
      this.shadowRoot,
      {
        eventContext: this,
      },
    );
  }

  click(event) {
    this.navigate(event.currentTarget);
  }

  get results() {
    return this.shadowRoot.querySelectorAll('a');
  }

  get selectedResult() {
    return this.results[this._selected];
  }

  focusSelectedResult() {
    if (this.selectedResult) {
      this.selectedResult.classList.add('selected');
      this.selectedResult.scrollIntoView({ block: 'center' });
    }
  }

  focusDown() {
    if (this._selected === undefined) {
      this._selected = 0;
    } else {
      if (this.selectedResult) {
        this.selectedResult.classList.remove('selected');
      }
      this._selected = Math.min(this._selected + 1, this.matches.length - 1);
    }

    this.focusSelectedResult();
  }

  focusUp() {
    if (this._selected === undefined) {
      return;
    }

    if (this.selectedResult) {
      this.selectedResult.classList.remove('selected');
    }
    this._selected = Math.max(this._selected - 1, 0);

    this.focusSelectedResult();
  }

  select() {
    if (this._selected === undefined || this.selectedResult === undefined) {
      return;
    }

    this.navigate(this.selectedResult);
  }

  navigate(element) {
    const oldURL = new URL(window.location.href);
    const newURL = new URL(element.href);
    window.location = newURL;

    if (oldURL.pathname === newURL.pathname) {
      window.location.reload(true);
    }
  }
}
customElements.define('cr-search-results', CRSearchResults);

customElements.define(
  'cr-search-control',
  class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });

      this.createMenu();
    }

    get baseUrl() {
      return this.getAttribute('base-url');
    }

    get protocolSearchIndexUrl() {
      return this.baseUrl + this.getAttribute('protocol-search-index');
    }

    get inputElement() {
      return this.shadowRoot.querySelector('input');
    }

    createMenu() {
      this.menuContainer = document.querySelector('main > section');
      this.menu = new CRSearchResults(this.baseUrl);
      this.menu.addEventListener('navigation', () => {
        this.menu.remove();
        this.inputElement.value = '';
        this.menuContainer.classList.remove('hidden');
      });

      fetch(this.protocolSearchIndexUrl)
        .then((response) => response.json())
        .then((value) => {
          this.menu.keywordsModel = new KeywordsModel(value);
        });
    }

    connectedCallback() {
      render(
        html`
          <style>
            input {
              border-style: none;
              background-color: transparent;
              width: 100%;
              max-width: 500px;
              font-size: 1.5em;
              color: var(--header-text-color);
              border-bottom-width: 1px;
              border-bottom-style: solid;
              border-bottom-color: var(--header-text-color);

              /* Float to the right */
              margin-left: auto;
            }
            input::placeholder {
              color: hsla(0, 0%, 100%, 0.5);
            }
            input:focus {
              transition: border-bottom-color 0.4s ease;
              border-bottom-color: #4bbda8;
              outline: none;
            }
          </style>
          <input placeholder="Start typing to search..." aria-label="Search" @keyup=${this.handleArrows} />
        `,
        this.shadowRoot,
        {
          eventContext: this,
        },
      );
    }

    handleArrows(event) {
      switch (event.code) {
        case 'ArrowDown':
          this.menu.focusDown();
          return;
        case 'ArrowUp':
          this.menu.focusUp();
          return;
        case 'Enter':
          event.preventDefault();
          this.menu.select();
          return;
      }

      if (event.code === 'Escape') {
        this.inputElement.value = '';
        this.inputElement.blur();
      }

      const textValue = this.inputElement.value;

      if (textValue === '') {
        this.menu.replaceWith(this.menuContainer);
        return;
      }

      if (!this.menu.connected) {
        this.menuContainer.replaceWith(this.menu);
      }

      this.menu.searchString = textValue;
    }
  },
);

const menuNavigationButton = document.querySelector('.menu-link');
const aside = document.querySelector('aside');
const mainSection = document.querySelector('main');
const asideCloseButton = document.querySelector('.aside-close-button');

document.addEventListener('keydown', (event) => {
  // Make sure that copy-pasting works
  if (event.metaKey || event.ctrlKey || event.altKey) {
    return;
  }
  // One of `a-z` or `A-Z`
  if (event.keyCode >= 65 && event.keyCode <= 90) {
    document.querySelector('cr-search-control').inputElement.focus();
  }
  // Escape key
  if (event.key === 'Escape' && aside.classList.contains('shown')) {
    aside.classList.remove('shown');
  }
});

menuNavigationButton.addEventListener('click', (event) => {
  // Don't trigger the click event on the main section
  event.stopPropagation();
  aside.addEventListener(
    'transitionend',
    () => {
      // Move focus into close button of drawer
      asideCloseButton.focus();
    },
    { once: true },
  );
  aside.classList.add('shown');
});
function closeAside() {
  if (!aside.classList.contains('shown')) {
    return;
  }
  aside.classList.remove('shown');
  menuNavigationButton.focus();
}
mainSection.addEventListener('click', closeAside);
asideCloseButton.addEventListener('click', closeAside);
