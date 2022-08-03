import DemoSetNativeProps from '../demo/demo-set-native-props.vue';

import NativeAnimation from './demo-animation.vue';
import NativeDialog from './demo-dialog.vue';
import NativeDemo from './demo-native.vue';
import NativePullHeaderFooter from './demo-pull-header-footer.vue';
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
  demoPullHeaderFooter: {
    name: 'Pull Header & Footer 组件',
    component: NativePullHeaderFooter,
  },
  demoSwiper: {
    name: 'Swiper 组件',
    component: NativeSwiper,
  },
  demoWaterfall: {
    name: 'Waterfall 组件',
    component: NativeWaterfall,
  },
  demoSetNativeProps: {
    name: 'setNativeProps',
    component: DemoSetNativeProps,
  },
};

export default nativeDemos;
