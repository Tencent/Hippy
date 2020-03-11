/* eslint-disable no-param-reassign */

import { getEventRedirector } from './utils';

function registerSwiper(Vue) {
  Vue.registerElement('hi-swiper', {
    component: {
      name: 'ViewPager',
      processEventData(event, nativeEventName, nativeEventParams) {
        switch (nativeEventName) {
          case 'onPageSelected':
            event.currentSlide = nativeEventParams.position;
            break;
          case 'onPageScroll':
            event.nextSlide = nativeEventParams.position;
            event.offset = nativeEventParams.offset;
            break;
          case 'onPageScrollStateChanged':
            event.state = nativeEventParams.pageScrollState;
            break;
          default:
        }
        return event;
      },
    },
  });

  Vue.registerElement('swiper-slide', {
    component: {
      name: 'ViewPagerItem',
      defaultNativeStyle: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    },
  });

  Vue.component('swiper', {
    inheritAttrs: false,
    props: {
      current: {
        type: Number,
        defaultValue: 0,
      },
      needAnimation: {
        type: Boolean,
        defaultValue: true,
      },
    },
    beforeMount() {
      this.$initialSlide = this.$props.current;
    },
    methods: {
      setSlide(slideIndex) {
        Vue.Native.callUIFunction(this.$refs.swiper, 'setPage', [slideIndex]);
      },
      setSlideWithoutAnimation(slideIndex) {
        Vue.Native.callUIFunction(this.$refs.swiper, 'setPageWithoutAnimation', [slideIndex]);
      },
      // On dragging
      onPageScroll(evt) {
        this.$emit('dragging', evt);
      },
      // On dropped finished dragging.
      onPageSelected(evt) {
        this.$emit('dropped', evt);
      },
      // On page scroll state changed.
      onPageScrollStateChanged(evt) {
        this.$emit('stateChanged', evt);
      },
    },
    watch: {
      current(to) {
        if (this.$props.needAnimation) {
          this.setSlide(to);
        } else {
          this.setSlideWithoutAnimation(to);
        }
      },
    },
    render(h) {
      const on = getEventRedirector.call(this, [
        ['dropped', 'pageSelected'],
        ['dragging', 'pageScroll'],
        ['stateChanged', 'pageScrollStateChanged'],
      ]);
      return h('hi-swiper', {
        on,
        ref: 'swiper',
        props: {
          initialPage: this.$initialSlide,
        },
      }, this.$slots.default);
    },
  });
}

export default registerSwiper;
