function registerUlRefresh(Vue) {
  Vue.registerElement('hi-ul-refresh-wrapper', {
    component: {
      name: 'RefreshWrapper',
    },
  });

  Vue.registerElement('hi-refresh-wrapper-item', {
    component: {
      name: 'RefreshWrapperItemView',
    },
  });

  Vue.component('ul-refresh-wrapper', {
    inheritAttrs: false,
    props: {
      bounceTime: {
        type: Number,
        defaultValue: 100,
      },
    },
    methods: {
      onRefresh(evt) {
        this.$emit('refresh', evt);
      },
      startRefresh() {
        Vue.Native.callUIFunction(this.$refs.refreshWrapper, 'startRefresh', null);
      },
      refreshCompleted() {
        // FIXME: Here's a typo mistake `refreshComplected` in native sdk.
        Vue.Native.callUIFunction(this.$refs.refreshWrapper, 'refreshComplected', null);
      },
    },
    template: `
      <hi-ul-refresh-wrapper ref="refreshWrapper" @refresh="onRefresh">
        <slot />
      </hi-ul-refresh-wrapper>
    `,
  });

  Vue.component('ul-refresh', {
    inheritAttrs: false,
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
