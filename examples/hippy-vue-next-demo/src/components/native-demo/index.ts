import NativeAnimation from './demo-animation.vue';
import NativeDialog from './demo-dialog.vue';
import NativeDemo from './demo-native.vue';
import NativePullFooter from './demo-pull-footer.vue';
import NativePullHeader from './demo-pull-header.vue';
import NativeSwiper from './demo-swiper.vue';
import NativeWaterfall from './demo-waterfall.vue';

const nativeDemos = {
  demoAnimation: {
    name: 'Animation 组件',
    component: NativeAnimation,
  },
  demoDialog: {
    name: 'Dialog 组件',
    component: NativeDialog,
  },
  demoNative: {
    name: 'Native 支持能力列表',
    component: NativeDemo,
  },
  demoPullHeader: {
    name: 'Pull Header 组件',
    component: NativePullHeader,
  },
  demoPullFooter: {
    name: 'Pull Footer 组件',
    component: NativePullFooter,
  },
  demoSwiper: {
    name: 'Swiper 组件',
    component: NativeSwiper,
  },
  demoWaterfall: {
    name: 'Waterfall 组件',
    component: NativeWaterfall,
  },
};

export default nativeDemos;
