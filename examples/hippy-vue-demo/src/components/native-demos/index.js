import Vue from 'vue';
import demoVueNative from './demo-vue-native.vue';
import demoAnimation from './demo-animation.vue';
import demoDialog from './demo-dialog.vue';
import demoSwiper from './demo-swiper.vue';
import demoPullHeader from './demo-pull-header.vue';
import demoPullFooter from './demo-pull-footer.vue';

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
    demoPullHeader: {
      name: 'pull-header 下拉组件',
      component: demoPullHeader,
    },
    demoPullFooter: {
      name: 'pull-footer 上拉组件',
      component: demoPullFooter,
    },
  });
}

export default demos;
