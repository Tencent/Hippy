import Vue from 'vue';
import demoVueNative from './demo-vue-native.vue';
import demoAnimation from './demo-animation.vue';
import demoDialog from './demo-dialog.vue';
import demoSwiper from './demo-swiper.vue';
import demoSwiperExtension from './demo-swiper-extension.vue';
import demoPullHeader from './demo-pull-header.vue';
import demoPullFooter from './demo-pull-footer.vue';
import demoSetNativeProps from '../demos/demo-set-native-props.vue';

const demos = {};

if (Vue.Native) {
  Object.assign(demos, {
    demoVueNative: {
      name: 'Vue.Native 属性',
      component: demoVueNative,
    },
    demoAnimation: {
      name: 'animation 动画组件',
      component: demoAnimation,
    },
    demoModal: {
      name: 'dialog 弹窗组件',
      component: demoDialog,
    },
    demoSwiper: {
      name: 'swiper 组件',
      component: demoSwiper,
    },
    demoLoopSwiper: {
      name: 'swiper 组件扩展',
      component: demoSwiperExtension,
    },
    demoPullHeader: {
      name: 'pull-header 下拉组件',
      component: demoPullHeader,
    },
    demoPullFooter: {
      name: 'pull-footer 上拉组件',
      component: demoPullFooter,
    },
    demoSetNativeProps: {
      name: 'setNativeProps',
      component: demoSetNativeProps,
    },
  });
}

export default demos;
