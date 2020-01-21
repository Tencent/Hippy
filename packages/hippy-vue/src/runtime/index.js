/* eslint-disable import/no-unresolved */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */

import Vue from 'core/index';
import { defineComputed, proxy } from 'core/instance/state';
import { ASSET_TYPES } from 'shared/constants';
import { mountComponent } from 'core/instance/lifecycle';
import { compileToFunctions } from 'web/compiler/index';
import {
  warn,
  isPlainObject,
  mergeOptions,
  extend,
} from 'core/util/index';
import { once } from 'shared/util';
import { patch } from './patch';
import {
  registerBuiltinElements,
  registerElement,
  getElementMap,
  mustUseProp,
  isReservedTag,
  isUnknownElement,
} from '../elements';
import { setApp, isFunction, trace } from '../util';
import DocumentNode from '../renderer/document-node';
import { Event } from '../renderer/native/event';
import Native, { HippyRegister } from './native';
import * as iPhone from './iphone';
import * as platformDirectives from './directives';

const componentName = ['%c[Hippy-Vue process.env.HIPPY_VUE_VERSION]%c', 'color: #4fc08d; font-weight: bold', 'color: auto; font-weight: auto'];

// Install document
const documentNode = new DocumentNode();
Vue.$document = documentNode;
Vue.prototype.$document = documentNode;

// Install document and event classes
Vue.$Document = DocumentNode;
Vue.$Event = Event;

// Install platform specific utils
Vue.config.mustUseProp = mustUseProp;
Vue.config.isReservedTag = isReservedTag;
Vue.config.isUnknownElement = isUnknownElement;

Vue.compile = compileToFunctions;
Vue.registerElement = registerElement;

// Install platform runtime directives & components
extend(Vue.options.directives, platformDirectives);

// install platform patch function
Vue.prototype.__patch__ = patch;

// Override _init method for built-in elements register
// The method will execute after other middleware,
// because Vue.use() can be placed before new Vue().
// It should have a workaround in future.
const { _init: oldInit } = Vue.prototype;
Vue.prototype._init = function _init(options = {}) {
  oldInit.call(this, options);
  // Built-in elements registering execute one time.
  once(() => {
    const { disableBuiltinElements } = options;
    if (!(typeof disableBuiltinElements === 'boolean' && disableBuiltinElements)) {
      Vue.use(registerBuiltinElements);
    }
  })();
};

// Override $mount for attend the compiler.
Vue.prototype.$mount = function $mount(el, hydrating) {
  const options = this.$options;
  // resolve template/el and convert to render function
  if (!options.render) {
    const { template } = options;
    if (template && typeof template !== 'string') {
      warn(`invalid template option: ${template}`, this);
      return this;
    }

    if (template) {
      const { render, staticRenderFns } = compileToFunctions(
        template,
        {
          delimiters: options.delimiters,
          comments: options.comments,
        },
        this,
      );
      options.render = render;
      options.staticRenderFns = staticRenderFns;
    }
  }

  return mountComponent(this, el, hydrating);
};

/**
 * Register the Hippy-Vue app to Native.
 *
 * @param {function} callback - Callback after register completed.
 */
Vue.prototype.$start = function $start(callback) {
  setApp(this);
  let self = this;

  // register native components into Vue.
  getElementMap().forEach((entry) => {
    Vue.component(entry.meta.component.name, entry.meta.component);
  });

  HippyRegister.regist(this.$options.appName, (superProps) => {
    const { __instanceId__: rootViewId } = superProps;
    self.$options.$superProps = superProps;
    self.$options.rootViewId = rootViewId;

    trace(...componentName, 'Start', this.$options.appName, 'with rootViewId', rootViewId, superProps);

    if (self.$el) {
      self.$destroy();
      // FIXME: Seems memory leak for hippy.
      //        Because old instance should be destroyed.
      const AppConstructor = Vue.extend(self.$options);
      self = new AppConstructor(self.$options);
      setApp(self);
    }

    self.$mount();

    if (Native.Platform === 'ios') {
      const statusBar = iPhone.drawStatusBar(this.$options);
      if (statusBar) {
        if (!self.$el.childNodes.length) {
          self.$el.appendChild(statusBar);
        } else {
          self.$el.insertBefore(statusBar, self.$el.childNodes[0]);
        }
      }
    }

    if (isFunction(callback)) {
      callback(self, superProps);
    }
  });
};

// Override component and extend of avoid built-in component warning.
let cid = 1;

function initProps(Comp) {
  const { props } = Comp.options;
  Object.keys(props).forEach(key => proxy(Comp.prototype, '_props', key));
}

function initComputed(Comp) {
  const { computed } = Comp.options;
  Object.keys(computed).forEach(key => defineComputed(Comp.prototype, key, computed[key]));
}

Vue.component = function component(id, definition) {
  if (!definition) {
    return this.options.components[id];
  }
  if (isPlainObject(definition)) {
    definition.name = definition.name || id;
    definition = this.options._base.extend(definition);
  }
  this.options.components[id] = definition;
  return definition;
};

Vue.extend = function hippyExtend(extendOptions) {
  extendOptions = extendOptions || {};
  const Super = this;
  const SuperId = Super.cid;
  const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {});
  if (cachedCtors[SuperId]) {
    return cachedCtors[SuperId];
  }

  const name = extendOptions.name || Super.options.name;

  const Sub = function VueComponent(options) {
    this._init(options);
  };
  Sub.prototype = Object.create(Super.prototype);
  Sub.prototype.constructor = Sub;
  cid += 1;
  Sub.cid = cid;
  Sub.options = mergeOptions(Super.options, extendOptions);
  Sub.super = Super;

  // For props and computed properties, we define the proxy getters on
  // the Vue instances at extension time, on the extended prototype. This
  // avoids Object.defineProperty calls for each instance created.
  if (Sub.options.props) {
    initProps(Sub);
  }
  if (Sub.options.computed) {
    initComputed(Sub);
  }

  // allow further extension/mixin/plugin usage
  Sub.extend = Super.extend;
  Sub.mixin = Super.mixin;
  Sub.use = Super.use;

  // create asset registers, so extended classes
  // can have their private assets too.
  ASSET_TYPES.forEach((type) => {
    Sub[type] = Super[type];
  });
  // enable recursive self-lookup
  if (name) {
    Sub.options.components[name] = Sub;
  }

  // keep a reference to the super options at extension time.
  // later at instantiation we can check if Super's options have
  // been updated.
  Sub.superOptions = Super.options;
  Sub.extendOptions = extendOptions;
  Sub.sealedOptions = extend({}, Sub.options);

  // cache constructor
  cachedCtors[SuperId] = Sub;
  return Sub;
};

// Binding Native Properties
Vue.Native = Native;

export default Vue;
