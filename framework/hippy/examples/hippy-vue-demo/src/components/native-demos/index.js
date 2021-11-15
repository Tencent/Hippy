import Vue from 'vue';
import demoSetNativeProps from '../demos/demo-set-native-props.vue';
import demoVueNative from './demo-vue-native.vue';
import demoAnimation from './demo-animation.vue';
import demoDialog from './demo-dialog.vue';
import demoSwiper from './demo-swiper.vue';
import demoPullHeader from './demo-pull-header.vue';
import demoPullFooter from './demo-pull-footer.vue';
import demoWaterfall from './demo-waterfall.vue';

const demos = {};

if (Vue.Native) {
  Object.assign(demos, {
    demoVueNative: {
      name: 'Vue.Native 能力',
      component: demoVueNative,
    },
    demoAnimation: {
      name: '动画组件',
      component: demoAnimation,
    },
    demoModal: {
      name: '弹窗组件',
      component: demoDialog,
    },
    demoSwiper: {
      name: 'swiper 组件',
      component: demoSwiper,
    },
    demoPullHeader: {
      name: '下拉组件',
      component: demoPullHeader,
    },
    demoPullFooter: {
      name: '上拉组件',
      component: demoPullFooter,
    },
    demoWaterfall: {
      name: '瀑布流组件',
      component: demoWaterfall,
    },
    demoSetNativeProps: {
      name: 'setNativeProps',
      component: demoSetNativeProps,
    },
  });
}

export default demos;
