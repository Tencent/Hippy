/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable no-param-reassign */
import type { NeedToTyped } from '@hippy-shared/index';
import type { App } from '@vue/runtime-core';
import { h } from '@vue/runtime-core';

import { registerHippyTag } from '../runtime/component';
import type { EventsUnionType } from '../runtime/event/hippy-event';
import { Native } from '../runtime/native';
import { getEventRedirects } from '../util';

/**
 * register swiper component
 *
 * @param vueApp - vue instance
 */
export function registerSwiper(vueApp: App): void {
  // register swiper tag
  registerHippyTag('hi-swiper', {
    name: 'ViewPager',
    processEventData(
      evtData: EventsUnionType,
      nativeEventParams: { [key: string]: NeedToTyped },
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

  // register swiper item tag
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

  // register Vue Swiper component
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

  // register Vue SwiperSlide component
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
