// eslint-disable-next-line import/no-extraneous-dependencies
const micromatch = require('micromatch');
module.exports = (allFiles) => {
  const codeFiles = micromatch(allFiles, ['**/packages/**/*.{js,ts,tsx,vue}', '**/examples/hippy-react-demo/**/*.{js,jsx}', '**/examples/hippy-vue-demo/**/*.{js,vue}', '**/scripts/**/*.js', '**/core/js/**/*.js']);
  console.log('js codeFiles lint match length', codeFiles.length);
  return [`eslint --fix ${codeFiles.join(' ')}`];
};
