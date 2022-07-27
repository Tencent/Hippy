import type { App } from '@vue/runtime-core';

import { registerAnimation } from './animation';
import { registerDialog } from './dialog';
import { registerPull } from './pulls';
import { registerSwiper } from './swiper';
import { registerUlRefresh } from './ul-refresh';
import { registerWaterfall } from './waterfall';

/**
 * 统一安装native组件
 */
export default {
  // 作为vue的插件进行安装
  install(vueApp: App): void {
    registerAnimation(vueApp);
    registerDialog();
    registerPull(vueApp);
    registerUlRefresh(vueApp);
    registerWaterfall(vueApp);
    registerSwiper(vueApp);
  },
};
