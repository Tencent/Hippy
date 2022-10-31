// import * as components from './components';
// import * as modules from './modules';
import * as components from './spec';
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
  for (const key in components) {
    off.push({
      path: `/${getKebabCase2(key)}`,
      name: `/${getKebabCase2(key)}`,
      component: components[key],
    });
  }
}());
console.log(off,components);
export default off;
