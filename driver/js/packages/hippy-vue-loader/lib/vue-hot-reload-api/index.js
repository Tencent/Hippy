/**
 * modify base on https://github.com/vuejs/vue-hot-reload-api/blob/v2.3.4/src/index.js
 */
let Vue; // late bind
let version;
const map = Object.create(null);
if (typeof global !== 'undefined') {
  global.__VUE_HOT_MAP__ = map;
}
let installed = false;
let initHookName = 'beforeCreate';

exports.install = (vue) => {
  if (installed) return;
  installed = true;

  Vue = vue.__esModule ? vue.default : vue;
  version = Vue.version.split('.').map(Number);

  // compat with < 2.0.0-alpha.7
  if (Vue.config._lifecycleHooks.indexOf('init') > -1) {
    initHookName = 'init';
  }

  exports.compatible = version[0] >= 2;
  if (!exports.compatible) {
    console.warn('[HMR] You are using a version of vue-hot-reload-api that is '
        + 'only compatible with Vue.js core ^2.0.0.');
    return;
  }
};

/**
 * Create a record for a hot module, which keeps track of its constructor
 * and instances
 *
 * @param {String} id
 * @param {Object} options
 */

exports.createRecord = (id, options) => {
  if (map[id]) return;

  let Ctor = null;
  if (typeof options === 'function') {
    Ctor = options;
    options = Ctor.options;
  }
  makeOptionsHot(id, options);
  map[id] = {
    Ctor,
    options,
    instances: [],
  };
};

/**
 * Check if module is recorded
 *
 * @param {String} id
 */

exports.isRecorded = id => typeof map[id] !== 'undefined';

/**
 * Make a Component options object hot.
 *
 * @param {String} id
 * @param {Object} options
 */

function makeOptionsHot(id, options) {
  if (options.functional) {
    const { render } = options;
    options.render = (h, ctx) => {
      const { instances } = map[id];
      if (ctx && instances.indexOf(ctx.parent) < 0) {
        instances.push(ctx.parent);
      }
      return render(h, ctx);
    };
  } else {
    injectHook(options, initHookName, function () {
      const record = map[id];
      if (!record.Ctor) {
        record.Ctor = this.constructor;
      }
      record.instances.push(this);
    });
    injectHook(options, 'beforeDestroy', function () {
      const { instances } = map[id];
      instances.splice(instances.indexOf(this), 1);
    });
  }
}

/**
 * Inject a hook to a hot reloadable component so that
 * we can keep track of it.
 *
 * @param {Object} options
 * @param {String} name
 * @param {Function} hook
 */

function injectHook(options, name, hook) {
  const existing = options[name];
  options[name] = existing
    ? Array.isArray(existing) ? existing.concat(hook) : [existing, hook]
    : [hook];
}

function tryWrap(fn) {
  return (id, arg) => {
    try {
      fn(id, arg);
    } catch (e) {
      console.error(e);
      console.warn('Something went wrong during Vue component hot-reload. Full reload required.');
    }
  };
}

function updateOptions(oldOptions, newOptions) {
  for (const key in oldOptions) {
    if (!(key in newOptions)) {
      delete oldOptions[key];
    }
  }
  for (const key in newOptions) {
    oldOptions[key] = newOptions[key];
  }
}

exports.repaint = tryWrap((id) => {
  const record = map[id];
  if (record.instances) {
    record.instances.slice().forEach((instance) => {
      // invoke renderToNativeWithChildren to apply hmr style
      setTimeout(() => {
        instance.$el && instance.$el.repaintWithChildren();
      }, 200);
    });
  }
});

exports.rerender = tryWrap((id, options) => {
  const record = map[id];
  if (!options) {
    record.instances.slice().forEach((instance) => {
      instance.$forceUpdate();
    });
    return;
  }
  if (typeof options === 'function') {
    options = options.options;
  }
  if (record.Ctor) {
    record.Ctor.options.render = options.render;
    record.Ctor.options.staticRenderFns = options.staticRenderFns;
    record.instances.slice().forEach((instance) => {
      instance.$options.render = options.render;
      instance.$options.staticRenderFns = options.staticRenderFns;
      // reset static trees
      // pre 2.5, all static trees are cached together on the instance
      if (instance._staticTrees) {
        instance._staticTrees = [];
      }
      // 2.5.0
      if (Array.isArray(record.Ctor.options.cached)) {
        record.Ctor.options.cached = [];
      }
      // 2.5.3
      if (Array.isArray(instance.$options.cached)) {
        instance.$options.cached = [];
      }

      // post 2.5.4: v-once trees are cached on instance._staticTrees.
      // Pure static trees are cached on the staticRenderFns array
      // (both already reset above)

      // 2.6: temporarily mark rendered scoped slots as unstable so that
      // child components can be forced to update
      const restore = patchScopedSlots(instance);
      instance.$forceUpdate();
      instance.$nextTick(restore);
    });
  } else {
    // functional or no instance created yet
    record.options.render = options.render;
    record.options.staticRenderFns = options.staticRenderFns;

    // handle functional component re-render
    if (record.options.functional) {
      // rerender with full options
      if (Object.keys(options).length > 2) {
        updateOptions(record.options, options);
      } else {
        // template-only rerender.
        // need to inject the style injection code for CSS modules
        // to work properly.
        const injectStyles = record.options._injectStyles;
        if (injectStyles) {
          const { render } = options;
          record.options.render = (h, ctx) => {
            injectStyles.call(ctx);
            return render(h, ctx);
          };
        }
      }
      record.options._Ctor = null;
      // 2.5.3
      if (Array.isArray(record.options.cached)) {
        record.options.cached = [];
      }
      record.instances.slice().forEach((instance) => {
        instance.$forceUpdate();
      });
    }
  }
});

exports.reload = tryWrap((id, options) => {
  const record = map[id];
  if (options) {
    if (typeof options === 'function') {
      options = options.options;
    }
    makeOptionsHot(id, options);
    if (record.Ctor) {
      if (version[1] < 2) {
        // preserve pre 2.2 behavior for global mixin handling
        record.Ctor.extendOptions = options;
      }
      const newCtor = record.Ctor.super.extend(options);
      // prevent record.options._Ctor from being overwritten accidentally
      newCtor.options._Ctor = record.options._Ctor;
      record.Ctor.options = newCtor.options;
      record.Ctor.cid = newCtor.cid;
      record.Ctor.prototype = newCtor.prototype;
      if (newCtor.release) {
        // temporary global mixin strategy used in < 2.0.0-alpha.6
        newCtor.release();
      }
    } else {
      updateOptions(record.options, options);
    }
  }
  record.instances.slice().forEach((instance) => {
    // don't support component-level reload for root App component, fallback to reload
    const isAppComponent = instance.$parent && !instance.$parent.$parent;
    if(isAppComponent) {
      // need some delay, otherwise will trigger unexpected error
      setTimeout(() => {
        global.Hippy.bridge.callNative('DevMenu', 'reload')
      }, 500);
      return
    }
    if (instance.$vnode && instance.$vnode.context) {
      instance.$vnode.context.$forceUpdate();
    } else {
      console.warn('Root or manually mounted instance modified. Full reload required.');
    }
  });
});

// 2.6 optimizes template-compiled scoped slots and skips updates if child
// only uses scoped slots. We need to patch the scoped slots resolving helper
// to temporarily mark all scoped slots as unstable in order to force child
// updates.
function patchScopedSlots(instance) {
  if (!instance._u) return;
  // https://github.com/vuejs/vue/blob/dev/src/core/instance/render-helpers/resolve-scoped-slots.js
  const original = instance._u;
  instance._u = (slots) => {
    try {
      // 2.6.4 ~ 2.6.6
      return original(slots, true);
    } catch (e) {
      // 2.5 / >= 2.6.7
      return original(slots, null, true);
    }
  };
  return () => {
    instance._u = original;
  };
}
