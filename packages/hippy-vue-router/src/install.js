/* eslint-disable no-cond-assign */
/* eslint-disable no-multi-assign */
/* eslint-disable no-underscore-dangle */

import { setVue, getVue } from '@vue/util/index';
import View from './components/view';
import Link from './components/link';

function install(Vue) {
  if (install.installed && getVue() === Vue) return;
  install.installed = true;

  setVue(Vue);

  const isDef = v => v !== undefined;

  const registerInstance = (vm, callVal) => {
    let i = vm.$options._parentVnode;
    if (isDef(i) && isDef(i = i.data) && isDef(i = i.registerRouteInstance)) {
      i(vm, callVal);
    }
  };

  Vue.mixin({
    beforeCreate() {
      if (isDef(this.$options.router)) {
        this._routerRoot = this;
        this._router = this.$options.router;
        this._router.init(this, Vue);
        Vue.util.defineReactive(this, '_route', this._router.history.current);
      } else {
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this;
      }
      registerInstance(this, this);
    },
    destroyed() {
      registerInstance(this);
    },
  });

  Object.defineProperty(Vue.prototype, '$router', {
    get() { return this._routerRoot._router; },
  });

  Object.defineProperty(Vue.prototype, '$route', {
    get() { return this._routerRoot._route; },
  });

  Vue.component('RouterView', View);
  Vue.component('RouterLink', Link);

  const strats = Vue.config.optionMergeStrategies;
  // use the same hook merging strategy for route hooks
  strats.beforeRouteEnter = strats.beforeRouteLeave = strats.beforeRouteUpdate = strats.created;
}

export default install;
