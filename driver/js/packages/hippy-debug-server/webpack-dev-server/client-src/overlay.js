// The error overlay is inspired (and mostly copied) from Create React App (https://github.com/facebookincubator/create-react-app)
// They, in turn, got inspired by webpack-hot-middleware (https://github.com/glenjamin/webpack-hot-middleware).

import ansiHTML from 'ansi-html-community';
import { encode } from 'html-entities';

const colors = {
  reset: ['transparent', 'transparent'],
  black: '181818',
  red: 'E36049',
  green: 'B3CB74',
  yellow: 'FFD080',
  blue: '7CAFC2',
  magenta: '7FACCA',
  cyan: 'C3C2EF',
  lightgrey: 'EBE7E3',
  darkgrey: '6D7891',
};

let iframeContainerElement;
let containerElement;
let onLoadQueue = [];

ansiHTML.setColors(colors);

function createContainer() {
  iframeContainerElement = document.createElement('iframe');
  iframeContainerElement.id = 'webpack-dev-server-client-overlay';
  iframeContainerElement.src = 'about:blank';
  iframeContainerElement.style.position = 'fixed';
  iframeContainerElement.style.left = 0;
  iframeContainerElement.style.top = 0;
  iframeContainerElement.style.right = 0;
  iframeContainerElement.style.bottom = 0;
  iframeContainerElement.style.width = '100vw';
  iframeContainerElement.style.height = '100vh';
  iframeContainerElement.style.border = 'none';
  iframeContainerElement.style.zIndex = 9999999999;
  iframeContainerElement.onload = () => {
    containerElement = iframeContainerElement.contentDocument.createElement('div');
    containerElement.id = 'webpack-dev-server-client-overlay-div';
    containerElement.style.position = 'fixed';
    containerElement.style.boxSizing = 'border-box';
    containerElement.style.left = 0;
    containerElement.style.top = 0;
    containerElement.style.right = 0;
    containerElement.style.bottom = 0;
    containerElement.style.width = '100vw';
    containerElement.style.height = '100vh';
    containerElement.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
    containerElement.style.color = '#E8E8E8';
    containerElement.style.fontFamily = 'Menlo, Consolas, monospace';
    containerElement.style.fontSize = 'large';
    containerElement.style.padding = '2rem';
    containerElement.style.lineHeight = '1.2';
    containerElement.style.whiteSpace = 'pre-wrap';
    containerElement.style.overflow = 'auto';

    const headerElement = document.createElement('span');

    headerElement.innerText = 'Compiled with problems:';

    const closeButtonElement = document.createElement('button');

    closeButtonElement.innerText = 'X';
    closeButtonElement.style.background = 'transparent';
    closeButtonElement.style.border = 'none';
    closeButtonElement.style.fontSize = '20px';
    closeButtonElement.style.fontWeight = 'bold';
    closeButtonElement.style.color = 'white';
    closeButtonElement.style.cursor = 'pointer';
    closeButtonElement.style.cssFloat = 'right';
    closeButtonElement.style.styleFloat = 'right';
    closeButtonElement.addEventListener('click', () => {
      hide();
    });

    containerElement.appendChild(headerElement);
    containerElement.appendChild(closeButtonElement);
    containerElement.appendChild(document.createElement('br'));
    containerElement.appendChild(document.createElement('br'));

    iframeContainerElement.contentDocument.body.appendChild(containerElement);

    onLoadQueue.forEach((onLoad) => {
      onLoad(containerElement);
    });
    onLoadQueue = [];

    iframeContainerElement.onload = null;
  };

  document.body.appendChild(iframeContainerElement);
}

function ensureOverlayExists(callback) {
  if (containerElement) {
    // Everything is ready, call the callback right away.
    callback(containerElement);

    return;
  }

  onLoadQueue.push(callback);

  if (iframeContainerElement) {
    return;
  }

  createContainer();
}

// Successful compilation.
function hide() {
  if (!iframeContainerElement) {
    return;
  }

  // Clean up and reset internal state.
  document.body.removeChild(iframeContainerElement);

  iframeContainerElement = null;
  containerElement = null;
}

function formatProblem(type, item) {
  let header = type === 'warning' ? 'WARNING' : 'ERROR';
  let body = '';

  if (typeof item === 'string') {
    body += item;
  } else {
    const file = item.file || '';
    // eslint-disable-next-line no-nested-ternary
    const moduleName = item.moduleName
      ? item.moduleName.indexOf('!') !== -1
        ? `${item.moduleName.replace(/^(\s|\S)*!/, '')} (${item.moduleName})`
        : `${item.moduleName}`
      : '';
    const { loc } = item;

    header += `${
      moduleName || file
        ? ` in ${moduleName ? `${moduleName}${file ? ` (${file})` : ''}` : file}${
          loc ? ` ${loc}` : ''
        }`
        : ''
    }`;
    body += item.message || '';
  }

  return { header, body };
}

// Compilation with errors (e.g. syntax error or missing modules).
function show(type, messages) {
  ensureOverlayExists(() => {
    messages.forEach((message) => {
      const entryElement = document.createElement('div');
      const typeElement = document.createElement('span');
      const { header, body } = formatProblem(type, message);

      typeElement.innerText = header;
      typeElement.style.color = `#${colors.red}`;

      // Make it look similar to our terminal.
      const text = ansiHTML(encode(body));
      const messageTextNode = document.createElement('div');

      messageTextNode.innerHTML = text;

      entryElement.appendChild(typeElement);
      entryElement.appendChild(document.createElement('br'));
      entryElement.appendChild(document.createElement('br'));
      entryElement.appendChild(messageTextNode);
      entryElement.appendChild(document.createElement('br'));
      entryElement.appendChild(document.createElement('br'));

      containerElement.appendChild(entryElement);
    });
  });
}

export { formatProblem, show, hide };
