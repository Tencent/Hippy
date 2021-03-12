/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */

import { getVue, isFunction } from '@vue/util/index';
import runQueue from '../util/async';
import { warn, isError } from '../util/warn';
import { START, isSameRoute } from '../util/route';
import {
  flatten,
  flatMapComponents,
  resolveAsyncComponents,
} from '../util/resolve-components';

function normalizeBase(base) {
  // make sure there's the starting slash
  if (base.charAt(0) !== '/') {
    base = `/${base}`;
  }
  // remove trailing slash
  return base.replace(/\/$/, '');
}

function resolveQueue(
  current,
  next,
) {
  let i;
  const max = Math.max(current.length, next.length);
  for (i = 0; i < max; i += 1) {
    if (current[i] !== next[i]) {
      break;
    }
  }
  return {
    updated: next.slice(0, i),
    activated: next.slice(i),
    deactivated: current.slice(i),
  };
}

function extractGuard(def, key) {
  if (typeof def !== 'function') {
    // extend now so that global mixins are applied.
    const Vue = getVue();
    def = Vue.extend(def);
  }
  return def.options[key];
}

function extractGuards(records, name, bind, reverse) {
  const guards = flatMapComponents(records, (def, instance, match, key) => {
    const guard = extractGuard(def, name);
    if (!guard) {
      return null;
    }
    return Array.isArray(guard)
      ? guard.map(g => bind(g, instance, match, key))
      : bind(guard, instance, match, key);
  });
  return flatten(reverse ? guards.reverse() : guards);
}

function bindGuard(guard, instance) {
  if (!instance) {
    return null;
  }
  return function boundRouteGuard(...args) {
    return guard.apply(instance, args);
  };
}

function extractLeaveGuards(deactivated) {
  return extractGuards(deactivated, 'beforeRouteLeave', bindGuard, true);
}

function extractUpdateHooks(updated) {
  return extractGuards(updated, 'beforeRouteUpdate', bindGuard);
}

function poll(
  cb, // somehow flow cannot infer this is a function
  instances,
  key,
  isValid,
) {
  if (
    instances[key]
    && !instances[key]._isBeingDestroyed // do not reuse being destroyed instance
  ) {
    cb(instances[key]);
  } else if (isValid()) {
    setTimeout(() => {
      poll(cb, instances, key, isValid);
    }, 16);
  }
}

function bindEnterGuard(
  guard,
  match,
  key,
  cbs,
  isValid,
) {
  return function routeEnterGuard(to, from, next) {
    return guard(to, from, (cb) => {
      next(cb);
      if (typeof cb === 'function') {
        cbs.push(() => {
          // #750
          // if a router-view is wrapped with an out-in transition,
          // the instance may not have been registered at this time.
          // we will need to poll for registration until current route
          // is no longer valid.
          poll(cb, match.instances, key, isValid);
        });
      }
    });
  };
}

function extractEnterGuards(activated, cbs, isValid) {
  return extractGuards(activated, 'beforeRouteEnter', (guard, _, match, key) => bindEnterGuard(guard, match, key, cbs, isValid));
}

class HippyHistory {
  constructor(router, base = '/') {
    this.router = router;
    this.base = normalizeBase(base);
    // start with a route object that stands for "nowhere"
    this.current = START;
    this.pending = null;
    this.ready = false;
    this.readyCbs = [];
    this.readyErrorCbs = [];
    this.errorCbs = [];

    const defaultRoute = this.router.match('/', this.current);
    if (!defaultRoute) {
      throw new Error('Root router path with / is required');
    }
    this.stack = [defaultRoute];
    this.index = 0;
  }

  push(location, onComplete, onAbort) {
    this.transitionTo(location, (route) => {
      this.stack = this.stack.slice(0, this.index + 1).concat(route);
      this.index += 1;
      if (isFunction(onComplete)) {
        onComplete(route);
      }
    }, onAbort);
  }

  replace(location, onComplete, onAbort) {
    this.transitionTo(location, (route) => {
      this.stack = this.stack.slice(0, this.index).concat(route);
      if (isFunction(onComplete)) {
        onComplete(route);
      }
    }, onAbort);
  }

  go(n) {
    const targetIndex = this.index + n;
    if (targetIndex < 0 || targetIndex >= this.stack.length) {
      return;
    }
    const route = this.stack[targetIndex];
    this.confirmTransition(route, () => {
      this.index = targetIndex;
      this.updateRoute(route);
      this.stack = this.stack.slice(0, targetIndex + 1);
    });
  }

  getCurrentLocation() {
    const current = this.stack[this.stack.length - 1];
    return current ? current.fullPath : '/';
  }

  ensureURL() {
    // noop
  }

  listen(cb) {
    this.cb = cb;
  }

  onReady(cb, errorCb) {
    if (this.ready) {
      cb();
    } else {
      this.readyCbs.push(cb);
      if (errorCb) {
        this.readyErrorCbs.push(errorCb);
      }
    }
  }

  onError(errorCb) {
    this.errorCbs.push(errorCb);
  }

  transitionTo(location, onComplete, onAbort) {
    const route = this.router.match(location, this.current);
    this.confirmTransition(route, () => {
      this.updateRoute(route);
      if (isFunction(onComplete)) {
        onComplete(route);
      }
      this.ensureURL();

      // fire ready cbs once
      if (!this.ready) {
        this.ready = true;
        this.readyCbs.forEach((cb) => {
          cb(route);
        });
      }
    }, (err) => {
      if (onAbort) {
        onAbort(err);
      }
      if (err && !this.ready) {
        this.ready = true;
        this.readyErrorCbs.forEach((cb) => {
          cb(err);
        });
      }
    });
  }

  confirmTransition(route, onComplete, onAbort) {
    const { current } = this;
    const abort = (err) => {
      if (isError(err)) {
        if (this.errorCbs.length) {
          this.errorCbs.forEach((cb) => {
            cb(err);
          });
        } else {
          warn(false, 'uncaught error during route navigation:');
        }
      }
      if (isFunction(onAbort)) {
        onAbort(err);
      }
    };
      // in the case the route map has been dynamically appended to
    if (isSameRoute(route, current) && route.matched.length === current.matched.length) {
      this.ensureURL();
      return abort();
    }

    const {
      updated,
      deactivated,
      activated,
    } = resolveQueue(this.current.matched, route.matched);

    const queue = [].concat(
      // in-component leave guards
      extractLeaveGuards(deactivated),
      // global before hooks
      this.router.beforeHooks,
      // in-component update hooks
      extractUpdateHooks(updated),
      // in-config enter guards
      activated.map(m => m.beforeEnter),
      // async components
      resolveAsyncComponents(activated),
    );

    this.pending = route;
    const iterator = (hook, next) => {
      if (this.pending !== route) {
        return abort();
      }
      try {
        return hook(route, current, (to) => {
          if (to === false || isError(to)) {
            // next(false) -> abort navigation, ensure current URL
            this.ensureURL(true);
            abort(to);
          } else if (
            typeof to === 'string'
            || (typeof to === 'object' && (
              typeof to.path === 'string'
              || typeof to.name === 'string'
            ))
          ) {
            // next('/') or next({ path: '/' }) -> redirect
            abort();
            if (typeof to === 'object' && to.replace) {
              this.replace(to);
            } else {
              this.push(to);
            }
          } else {
            // confirm transition and pass on the value
            next(to);
          }
        });
      } catch (e) {
        return abort(e);
      }
    };

    return runQueue(queue, iterator, () => {
      const postEnterCbs = [];
      const isValid = () => this.current === route;
      // wait until async components are resolved before
      // extracting in-component enter guards
      const enterGuards = extractEnterGuards(activated, postEnterCbs, isValid);
      const q = enterGuards.concat(this.router.resolveHooks);
      runQueue(q, iterator, () => {
        if (this.pending !== route) {
          return abort();
        }
        this.pending = null;
        onComplete(route);
        if (!this.router.app) {
          return null;
        }
        return this.router.app.$nextTick(() => {
          postEnterCbs.forEach((cb) => {
            cb();
          });
        });
      });
    });
  }

  updateRoute(route) {
    const prev = this.current;
    this.current = route;
    if (isFunction(this.cb)) {
      this.cb(route);
    }
    this.router.afterHooks.forEach((hook) => {
      if (isFunction(hook)) {
        hook(route, prev);
      }
    });
  }

  hardwareBackPress() {
    if (this.stack.length > 1) {
      return this.go(-1);
    }
    const { matched } = this.stack[0];
    if (matched.length) {
      const { components, instances } = matched[0];
      if (components && components.default && isFunction(components.default.beforeAppExit)) {
        return components.default.beforeAppExit.call(instances.default, this.exitApp);
      }
    }
    return this.exitApp();
  }

  exitApp() {
    const Vue = getVue();
    // The method is only able to trigger by pressing hardware back button.
    Vue.Native.callNative('DeviceEventModule', 'invokeDefaultBackPressHandler');
  }
}

export default HippyHistory;
