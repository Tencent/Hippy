const qs = require('querystring');
const RuleSet = require('webpack/lib/RuleSet');

const id = 'vue-loader-plugin';
const NS = 'vue-loader';

class VueLoaderPlugin {
  apply(compiler) {
    // add NS marker so that the loader can detect and report missing plugin
    if (compiler.hooks) {
      // webpack 4
      compiler.hooks.compilation.tap(id, (compilation) => {
        const { normalModuleLoader } = compilation.hooks;
        normalModuleLoader.tap(id, (loaderContext) => {
          loaderContext[NS] = true;
        });
      });
    } else {
      // webpack < 4
      compiler.plugin('compilation', (compilation) => {
        compilation.plugin('normal-module-loader', (loaderContext) => {
          loaderContext[NS] = true;
        });
      });
    }

    // use webpack's RuleSet utility to normalize user rules
    const rawRules = compiler.options.module.rules;
    const { rules } = new RuleSet(rawRules);

    // find the rule that applies to vue files
    let vueRuleIndex = rawRules.findIndex(createMatcher('foo.vue'));
    if (vueRuleIndex < 0) {
      vueRuleIndex = rawRules.findIndex(createMatcher('foo.vue.html'));
    }
    const vueRule = rules[vueRuleIndex];

    if (!vueRule) {
      throw new Error('[VueLoaderPlugin Error] No matching rule for .vue files found.\n'
        + 'Make sure there is at least one root-level rule that matches .vue or .vue.html files.');
    }

    if (vueRule.oneOf) {
      throw new Error('[VueLoaderPlugin Error] vue-loader 15 currently does not support vue rules with oneOf.');
    }

    // get the normalized "use" for vue files
    const vueUse = vueRule.use;
    // get vue-loader options
    const vueLoaderUseIndex = vueUse.findIndex(u => /^vue-loader|(\/|\\|@|-)vue-loader/.test(u.loader));

    if (vueLoaderUseIndex < 0) {
      throw new Error('[VueLoaderPlugin Error] No matching use for vue-loader is found.\n'
        + 'Make sure the rule matching .vue files include vue-loader in its use.');
    }

    // make sure vue-loader options has a known ident so that we can share
    // options by reference in the template-loader by using a ref query like
    // template-loader??vue-loader-options
    const vueLoaderUse = vueUse[vueLoaderUseIndex];
    vueLoaderUse.ident = 'vue-loader-options';
    vueLoaderUse.options = vueLoaderUse.options || {};

    // for each user rule (except the vue rule), create a cloned rule
    // that targets the corresponding language blocks in *.vue files.
    const clonedRules = rules
      .filter(r => r !== vueRule)
      .map(cloneRule);

    // global pitcher (responsible for injecting template compiler loader & CSS
    // post loader)
    const pitcher = {
      loader: require.resolve('./loaders/pitcher'),
      resourceQuery: (query) => {
        const parsed = qs.parse(query.slice(1));
        return parsed.vue != null;
      },
      options: {
        cacheDirectory: vueLoaderUse.options.cacheDirectory,
        cacheIdentifier: vueLoaderUse.options.cacheIdentifier,
      },
    };

    // replace original rules
    compiler.options.module.rules = [
      pitcher,
      ...clonedRules,
      ...rules,
    ];
  }
}

function createMatcher(fakeFile) {
  return (rule) => {
    // #1201 we need to skip the `include` check when locating the vue rule
    const clone = Object.assign({}, rule);
    delete clone.include;
    const normalized = RuleSet.normalizeRule(clone, {}, '');
    return (
      !rule.enforce
      && normalized.resource
      && normalized.resource(fakeFile)
    );
  };
}

function cloneRule(rule) {
  const { resource, resourceQuery } = rule;
  // Assuming `test` and `resourceQuery` tests are executed in series and
  // synchronously (which is true based on RuleSet's implementation), we can
  // save the current resource being matched from `test` so that we can access
  // it in `resourceQuery`. This ensures when we use the normalized rule's
  // resource check, include/exclude are matched correctly.
  let currentResource;
  const res = Object.assign({}, rule, {
    resource: {
      test: (resource) => {
        currentResource = resource;
        return true;
      },
    },
    resourceQuery: (query) => {
      const parsed = qs.parse(query.slice(1));
      if (parsed.vue == null) {
        return false;
      }
      if (resource && parsed.lang == null) {
        return false;
      }
      const fakeResourcePath = `${currentResource}.${parsed.lang}`;
      if (resource && !resource(fakeResourcePath)) {
        return false;
      }
      if (resourceQuery && !resourceQuery(query)) {
        return false;
      }
      return true;
    },
  });

  if (rule.rules) {
    res.rules = rule.rules.map(cloneRule);
  }

  if (rule.oneOf) {
    res.oneOf = rule.oneOf.map(cloneRule);
  }

  return res;
}

VueLoaderPlugin.NS = NS;
module.exports = VueLoaderPlugin;
