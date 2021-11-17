/* eslint-disable no-nested-ternary */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */

import { isFunction } from '@vue/util/index';
import install from './install';
import normalizeLocation from './util/location';
import createMatcher from './create-matcher';
import HippyHistory from './history/hippy';
import { START } from './util/route';
import { assert } from './util/warn';
import { cleanPath } from './util/path';

function registerHook(list, fn) {
  list.push(fn);
  return () => {
    const i = list.indexOf(fn);
    if (i > -1) list.splice(i, 1);
  };
}

function createHref(base, fullPath) {
  return base ? cleanPath(`${base}/${fullPath}`) : fullPath;
}

class VueRouter {
  constructor(options = {}) {
    this.app = null;
    this.apps = [];
    this.options = options;
    this.beforeHooks = [];
    this.resolveHooks = [];
    this.afterHooks = [];
    this.matcher = createMatcher(options.routes || [], this);

    // Running in Hippy
    if (global.__GLOBAL__ && global.__GLOBAL__.appRegister) {
      this.history = new HippyHistory(this, options.base);
    } else {
      throw new Error('Hippy-Vue-Router can\t work without Native environment');
    }
  }

  match(raw, current, redirectedFrom) {
    return this.matcher.match(raw, current, redirectedFrom);
  }

  get currentRoute() {
    return this.history && this.history.current;
  }

  init(app, Vue) {
    if (process.env.NODE_ENV !== 'production') {
      assert(
        install.installed,
        'not installed. Make sure to call `Vue.use(VueRouter)` before creating root instance.',
      );
    }

    this.apps.push(app);

    // main app already initialized.
    if (this.app) {
      return;
    }

    this.app = app;

    const { history } = this;

    if (history instanceof HippyHistory) {
      history.transitionTo(history.getCurrentLocation());
    }

    history.listen((route) => {
      this.apps.forEach((a) => {
        a._route = route;
      });
    });


    if (Vue.Native.Platform === 'android' && isFunction(history.hardwareBackPress) && !this.options.disableAutoBack) {
      // Enable hardware back event.
      // FIXME: DeviceEventModule initialize a bit later, can't callNative immediately
      setTimeout(() => Vue.Native.callNative('DeviceEventModule', 'setListenBackPress', true), 300);

      // Listen the hardware back event and redirect to history.
      app.$on('hardwareBackPress', () => history.hardwareBackPress());
    }
  }

  beforeEach(fn) {
    return registerHook(this.beforeHooks, fn);
  }

  beforeResolve(fn) {
    return registerHook(this.resolveHooks, fn);
  }

  afterEach(fn) {
    return registerHook(this.afterHooks, fn);
  }

  onReady(cb, errorCb) {
    this.history.onReady(cb, errorCb);
  }

  onError(errorCb) {
    this.history.onError(errorCb);
  }

  push(location, onComplete, onAbort) {
    this.history.push(location, onComplete, onAbort);
  }

  replace(location, onComplete, onAbort) {
    this.history.replace(location, onComplete, onAbort);
  }

  go(n) {
    this.history.go(n);
  }

  back() {
    this.go(-1);
  }

  forward() {
    this.go(1);
  }

  getMatchedComponents(to) {
    const route = to
      ? to.matched
        ? to
        : this.resolve(to).route
      : this.currentRoute;
    if (!route) {
      return [];
    }
    return route.matched.map(m => Object.keys(m.components).map(key => m.components[key]));
  }

  resolve(to, current, append) {
    const location = normalizeLocation(
      to,
      current || this.history.current,
      append,
      this,
    );
    const route = this.match(location, current);
    const fullPath = route.redirectedFrom || route.fullPath;
    const { base } = this.history;
    const href = createHref(base, fullPath);
    return {
      location,
      route,
      href,
      // for backwards compat
      normalizedTo: location,
      resolved: route,
    };
  }

  addRoutes(routes) {
    this.matcher.addRoutes(routes);
    if (this.history.current !== START) {
      this.history.transitionTo(this.history.getCurrentLocation());
    }
  }
}

VueRouter.install = install;
VueRouter.version = '__VERSION__';

export default VueRouter;
