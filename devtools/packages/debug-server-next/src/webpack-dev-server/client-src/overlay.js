// The error overlay is inspired (and mostly copied) from Create React App (https://github.com/facebookincubator/create-react-app)
// They, in turn, got inspired by webpack-hot-middleware (https://github.com/glenjamin/webpack-hot-middleware).

// Successful compilation.
function hide() {}

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
        ? ` in ${moduleName ? `${moduleName}${file ? ` (${file})` : ''}` : file}${loc ? ` ${loc}` : ''}`
        : ''
    }`;
    body += item.message || '';
  }

  return { header, body };
}

// Compilation with errors (e.g. syntax error or missing modules).
function show() {}

export { formatProblem, show, hide };
