/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
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

  Vue.component('Swiper', {
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
      setSlide(slideIndex) {
        Vue.Native.callUIFunction(this.$refs.swiper, 'setPage', [slideIndex]);
      },
      setSlideWithoutAnimation(slideIndex) {
        Vue.Native.callUIFunction(this.$refs.swiper, 'setPageWithoutAnimation', [slideIndex]);
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
        attrs: {
          initialPage: this.$initialSlide,
        },
      }, this.$slots.default);
    },
  });
}

export default registerSwiper;
