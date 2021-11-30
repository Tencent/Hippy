/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
import {
  registerBuiltinElements,
  registerElement,
  getElementMap,
  mustUseProp,
  isReservedTag,
  isUnknownElement,
} from '../elements';
import {
  getApp,
  setApp,
  isFunction,
  trace,
  setBeforeLoadStyle,
} from '../util';
import DocumentNode from '../renderer/document-node';
import { Event } from '../renderer/native/event';
import { patch } from './patch';
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
 * @param {function} afterCallback - Callback after register completed.
 * @param {function} beforeCallback - Callback before register completed.
 */
Vue.prototype.$start = function $start(afterCallback, beforeCallback) {
  setApp(this);

  // beforeLoadStyle is a hidden option for pre-process
  // the style declaration globally.
  if (isFunction(this.$options.beforeLoadStyle)) {
    setBeforeLoadStyle(this.$options.beforeLoadStyle);
  }

  // register native components into Vue.
  getElementMap().forEach((entry) => {
    Vue.component(entry.meta.component.name, entry.meta.component);
  });

  // Register the entry point into Hippy
  // The callback will be execute when Native trigger loadInstance
  // or runApplication event.
  HippyRegister.regist(this.$options.appName, (superProps) => {
    const { __instanceId__: rootViewId } = superProps;
    this.$options.$superProps = superProps;
    this.$options.rootViewId = rootViewId;
    trace(...componentName, 'Start', this.$options.appName, 'with rootViewId', rootViewId, superProps);
    // Destroy the old instance and set the new one when restart the app
    if (this.$el) {
      this.$destroy();
      const AppConstructor = Vue.extend(this.$options);
      const newApp = new AppConstructor(this.$options);
      setApp(newApp);
    }
    // Call the callback before $mount
    if (isFunction(beforeCallback)) {
      beforeCallback(this, superProps);
    }
    // Draw the app.
    this.$mount();
    // Draw the iPhone status bar background.
    // It should execute after $mount, otherwise this.$el will be undefined.
    if (Native.Platform === 'ios') {
      const statusBar = iPhone.drawStatusBar(this.$options);
      if (statusBar) {
        if (!this.$el.childNodes.length) {
          this.$el.appendChild(statusBar);
        } else {
          this.$el.insertBefore(statusBar, this.$el.childNodes[0]);
        }
      }
    }
    // Call the callback after $mount
    if (isFunction(afterCallback)) {
      afterCallback(this, superProps);
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

// Override component for avoid built-in component warning.
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

// Override extend for avoid built-in component warning.
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

Vue.getApp = getApp;

// Register the built-in elements
Vue.use(registerBuiltinElements);

export default Vue;
