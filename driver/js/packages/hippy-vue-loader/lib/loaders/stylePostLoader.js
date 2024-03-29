const qs = require('querystring');
const { compileStyle } = require('@vue/component-compiler-utils');

// This is a post loader that handles scoped CSS transforms.
// Injected right before css-loader by the global pitcher (../pitch.js)
// for any <style scoped> selection requests initiated from within vue files.
module.exports = function (source, inMap) {
  const query = qs.parse(this.resourceQuery.slice(1));
  const { code, map, errors } = compileStyle({
    source,
    filename: this.resourcePath,
    id: `data-v-${query.id}`,
    postcssPlugins: [...(() => {
      const query = qs.parse(this.resourceQuery.slice(1));
      const { id, scoped } = query;
      if (!scoped) return [];
      return [require('postcss-class-prefix')(`v${id}.`)];
    })()],
    map: inMap,
    scoped: false,
    trim: true,
  });

  if (errors.length) {
    this.callback(errors[0]);
  } else {
    this.callback(null, code, map);
  }
};
