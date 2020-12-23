import registerAnimation from './animation';
import registerDialog from './dialog';
import registerListRefresh from './ul-refresh';
import registerSwiper from './swiper';

/**
 * Register the Animation component only
 */
const AnimationComponent = {
  install(Vue) {
    registerAnimation(Vue);
  },
};

/**
 * Register the modal component only.
 */
const DialogComponent = {
  install(Vue) {
    registerDialog(Vue);
  },
};

/**
 * Register the ul refresh wrapper and refresh component.
 */
const ListRefreshComponent = {
  install(Vue) {
    registerListRefresh(Vue);
  },
};

/**
 * Register the swiper component.
 */
const SwiperComponent = {
  install(Vue) {
    registerSwiper(Vue);
  },
};

/**
 * Register all of native components
 */
const HippyVueNativeComponents = {
  install(Vue) {
    registerAnimation(Vue);
    registerDialog(Vue);
    registerListRefresh(Vue);
    registerSwiper(Vue);
  },
};

export default HippyVueNativeComponents;
// Export specific component for TreeSharking.
export {
  AnimationComponent,
  DialogComponent,
  ListRefreshComponent,
  SwiperComponent,
};
