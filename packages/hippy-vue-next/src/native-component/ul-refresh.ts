import type { App } from '@vue/runtime-core';
import { h } from '@vue/runtime-core';

import { registerHippyTag } from '../runtime/component';
import { Native } from '../runtime/native';

/**
 *  将native的可下拉刷新组件注册为vue3的component
 *
 *  @param vueApp - vue app 实例
 */
export function registerUlRefresh(vueApp: App): void {
  const hippyRefreshWrapperTag = 'hi-ul-refresh-wrapper';
  const hippyRefreshItemTag = 'hi-refresh-wrapper-item';

  // 将refresh-wrapper的tag注册为hi-ul-refresh-wrapper的hippy的element
  registerHippyTag(hippyRefreshWrapperTag, {
    name: 'RefreshWrapper',
  });

  // 将refresh-wrapper-item的tag注册为hi-ul-refresh-wrapper-item的hippy的element
  registerHippyTag(hippyRefreshItemTag, {
    name: 'RefreshWrapperItemView',
  });

  // 注册UlRefreshWrapper组件
  vueApp.component('UlRefreshWrapper', {
    props: {
      bounceTime: {
        type: Number,
        defaultValue: 100,
      },
    },
    methods: {
      /**
       * 调用native接口触发刷新逻辑
       */
      startRefresh() {
        Native.callUIFunction(this.$refs.refreshWrapper, 'startRefresh', null);
      },

      /**
       * 刷新完成之后调用
       */
      refreshCompleted() {
        // FIXME: 这里终端有个拼写错误，后续需要修正
        Native.callUIFunction(
          this.$refs.refreshWrapper,
          'refreshComplected',
          null,
        );
      },
    },
    render() {
      // Vue2中事件不会转换，需要自行处理，如@refresh="xxx"，需要转成onRefresh并存放到vue实例的
      // on属性中。Vue3拍平了属性，直接在$attrs中有onRefresh即可
      return h(
        hippyRefreshWrapperTag,
        {
          ref: 'refreshWrapper',
        },
        this.$slots.default ? this.$slots.default() : null,
      );
    },
  });

  // 注册UlRefresh组件
  vueApp.component('UlRefresh', {
    render() {
      const child = h(
        'div',
        null,
        this.$slots.default ? this.$slots.default() : null,
      );

      return h(
        hippyRefreshItemTag,
        {
          style: {
            position: 'absolute',
            left: 0,
            right: 0,
          },
        },
        child,
      );
    },
  });
}
