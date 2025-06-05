import Vue from 'vue';
import demoSetNativeProps from '../demos/demo-set-native-props.vue';
import demoVueNative from './demo-vue-native.vue';
import demoAnimation from './demo-animation.vue';
import demoDialog from './demo-dialog.vue';
import demoSwiper from './demo-swiper.vue';
import demoPullHeaderFooter from './demo-pull-header-footer.vue';
import demoWaterfall from './demo-waterfall.vue';
import demoNestedScroll from './demo-nested-scroll.vue';
import demoNativeScroll from './demo-native-scroll.vue';

const demos = {};

if (Vue.Native) {
  Object.assign(demos, {
    demoVueNative: {
      name: 'Vue.Native 能力',
      component: demoVueNative,
    },
    demoAnimation: {
      name: 'animation 组件',
      component: demoAnimation,
    },
    demoModal: {
      name: 'dialog 组件',
      component: demoDialog,
    },
    demoSwiper: {
      name: 'swiper 组件',
      component: demoSwiper,
    },
    demoPullHeaderFooter: {
      name: 'pull-header/footer 组件',
      component: demoPullHeaderFooter,
    },
    demoWaterfall: {
      name: 'waterfall 组件',
      component: demoWaterfall,
    },
    demoNestedScroll: {
      name: 'nested scroll 示例',
      component: demoNestedScroll,
    },
    demoSetNativeProps: {
      name: 'setNativeProps',
      component: demoSetNativeProps,
    },
  });
}

if (Vue.Native.Platform == 'ohos') {
  Object.assign(demos, {
    demoNativeScroll: {
      name: 'native scroll 示例',
      component: demoNativeScroll,
    },
  });
}

export default demos;
