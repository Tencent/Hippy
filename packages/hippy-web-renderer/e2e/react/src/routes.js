// import * as components from './components';
// import * as modules from './modules';
import * as text from './spec/text';
const off = [
];
function getKebabCase2(str) {
  let temp = str.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
  if (temp.slice(0, 1) === '-') {
    temp = temp.slice(1);
  }
  return temp;
}
(function () {
  for (const key in text) {
    off.push({
      path: `/${getKebabCase2(key)}`,
      name: `/${getKebabCase2(key)}`,
      component: text[key],
    });
  }
}());
export default off;
