import * as components from './spec';
const routes = [
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
    routes.push({
      path: `/${getKebabCase2(key)}`,
      name: `/${getKebabCase2(key)}`,
      component: components[key],
    });
  }
}());
export default routes;
