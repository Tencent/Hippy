/* eslint-disable no-param-reassign */
import type { App } from '@vue/runtime-core';
import { h } from '@vue/runtime-core';

import { registerHippyTag } from '../runtime/component';
import type { EventsUnionType } from '../runtime/event/hippy-event';
import { Native } from '../runtime/native';
import { getEventRedirects } from '../util';

/**
 * 注册swiper组件
 *
 * @param vueApp - vue app 实例
 */
export function registerSwiper(vueApp: App): void {
  // 注册swiper tag
  registerHippyTag('hi-swiper', {
    name: 'ViewPager',
    processEventData(
      evtData: EventsUnionType,
      nativeEventParams: { [key: string]: any },
    ) {
      const { handler: event, __evt: nativeEventName } = evtData;

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
  });

  // 注册swiper item tag
  registerHippyTag('swiper-slide', {
    name: 'ViewPagerItem',
    defaultNativeStyle: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
  });

  // 注册Vue Swiper组件
  vueApp.component('Swiper', {
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
    watch: {
      current(to) {
        if (this.$props.needAnimation) {
          this.setSlide(to);
        } else {
          this.setSlideWithoutAnimation(to);
        }
      },
    },
    beforeMount() {
      this.$initialSlide = this.$props.current;
    },
    methods: {
      setSlide(slideIndex: number) {
        Native.callUIFunction(this.$refs.swiper, 'setPage', [slideIndex]);
      },
      setSlideWithoutAnimation(slideIndex: number) {
        Native.callUIFunction(this.$refs.swiper, 'setPageWithoutAnimation', [
          slideIndex,
        ]);
      },
    },
    render() {
      // 事件转发，对于dropped等给vue绑定的事件，同时也转发给pageSelected这种native的实际名称
      const on = getEventRedirects.call(this, [
        ['dropped', 'pageSelected'],
        ['dragging', 'pageScroll'],
        ['stateChanged', 'pageScrollStateChanged'],
      ]);

      return h(
        'hi-swiper',
        {
          ...on,
          ref: 'swiper',
          initialPage: this.$initialSlide,
          ...this.props,
        },
        this.$slots.default ? this.$slots.default() : null,
      );
    },
  });

  // 注册Vue SwiperSlide组件
  vueApp.component('SwiperSlide', {
    render() {
      return h(
        'swiper-slide',
        {},
        this.$slots.default ? this.$slots.default() : null,
      );
    },
  });
}
