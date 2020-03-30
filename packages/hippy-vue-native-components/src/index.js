import AnimationComponent from './animation';
import DialogComponent from './dialog';
import ListRefreshComponent from './ul-refresh';
import SwiperComponent from './swiper';
import PullsComponents from './pulls';

/**
 * Register all of native components
 */
const HippyVueNativeComponents = {
  install(Vue) {
    AnimationComponent(Vue);
    DialogComponent(Vue);
    ListRefreshComponent(Vue);
    SwiperComponent(Vue);
    PullsComponents(Vue);
  },
};

export default HippyVueNativeComponents;
// Export specific component for TreeSharking.
export {
  AnimationComponent,
  DialogComponent,
  ListRefreshComponent,
  SwiperComponent,
  PullsComponents,
};
