function registerUlRefresh(Vue) {
  Vue.registerElement('ul-refresh-wrapper', {
    component: {
      name: 'RefreshWrapper',
      defaultNativeProps: {
        bounceTime: 100,
      },
    },
  });

  Vue.registerElement('hi-refresh-wrapper-item', {
    component: {
      name: 'RefreshWrapperItemView',
    },
  });

  Vue.component('ul-refresh', {
    inheritAttrs: false,
    methods: {
      startRefresh() {
        Vue.Native.callUIFunction(this, 'startRefresh', null);
      },
      refreshComplected() {
        Vue.Native.callUIFunction(this, 'refreshComplected', null);
      },
    },
    template: `
      <hi-refresh-wrapper-item :style="{position: 'absolute', left: 0, right: 0}">
        <div>
          <slot />
        </div>
      </hi-refresh-wrapper-item>
    `,
  });
}

export default registerUlRefresh;
