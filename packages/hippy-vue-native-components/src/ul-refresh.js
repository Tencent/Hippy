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

import { getEventRedirector } from './utils';

function registerUlRefresh(Vue) {
  Vue.registerElement('hi-ul-refresh-wrapper', {
    component: {
      name: 'RefreshWrapper',
      processEventData(event, nativeEventName, nativeEventParams) {
        switch (nativeEventName) {
          case 'onScroll': {
            event.offsetX = nativeEventParams.contentOffset.x;
            event.offsetY = nativeEventParams.contentOffset.y;
            break;
          }
          default:
        }
        return event;
      },
    },
  });

  Vue.registerElement('hi-refresh-wrapper-item', {
    component: {
      name: 'RefreshWrapperItemView',
    },
  });

  Vue.component('UlRefreshWrapper', {
    inheritAttrs: false,
    props: {
      bounceTime: {
        type: Number,
        defaultValue: 100,
      },
    },
    methods: {
      startRefresh() {
        Vue.Native.callUIFunction(this.$refs.refreshWrapper, 'startRefresh', null);
      },
      refreshCompleted() {
        // FIXME: Here's a typo mistake `refreshComplected` in native sdk.
        Vue.Native.callUIFunction(this.$refs.refreshWrapper, 'refreshComplected', null);
      },
    },
    render(h) {
      const on = getEventRedirector.call(this, [
        'refresh',
        'scroll',
      ]);
      return h('hi-ul-refresh-wrapper', {
        on,
        ref: 'refreshWrapper',
      }, this.$slots.default);
    },
  });

  Vue.component('UlRefresh', {
    inheritAttrs: false,
    template: `
      <hi-refresh-wrapper-item :style="{position: 'absolute', left: 0, right: 0}">
        <div>
          <slot />
        </div>
      </hi-refresh-wrapper-item>
    `,
  });
}

export default registerUlRefresh;
