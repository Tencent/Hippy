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

import type { App } from '@vue/runtime-core';
import { h } from '@vue/runtime-core';

import { registerHippyTag } from '../runtime/component';
import { Native } from '../runtime/native';

/**
 *  register pull down to refresh component
 *
 *  @param vueApp - vue instance
 */
export function registerUlRefresh(vueApp: App): void {
  const hippyRefreshWrapperTag = 'hi-ul-refresh-wrapper';
  const hippyRefreshItemTag = 'hi-refresh-wrapper-item';

  registerHippyTag(hippyRefreshWrapperTag, {
    name: 'RefreshWrapper',
  });

  registerHippyTag(hippyRefreshItemTag, {
    name: 'RefreshWrapperItemView',
  });

  // register UlRefreshWrapper component
  vueApp.component('UlRefreshWrapper', {
    props: {
      bounceTime: {
        type: Number,
        defaultValue: 100,
      },
    },
    methods: {
      /**
       * call the native interface to trigger the refresh logic
       */
      startRefresh() {
        Native.callUIFunction(this.$refs.refreshWrapper, 'startRefresh', null);
      },

      /**
       * refresh completed
       */
      refreshCompleted() {
        // FIXME: there is a spelling error in the native code, which needs to be corrected later
        Native.callUIFunction(
          this.$refs.refreshWrapper,
          'refreshComplected',
          null,
        );
      },
    },
    render() {
      return h(
        hippyRefreshWrapperTag,
        {
          ref: 'refreshWrapper',
        },
        this.$slots.default ? this.$slots.default() : null,
      );
    },
  });

  // register UlRefresh component
  vueApp.component('UlRefresh', {
    render() {
      const child = h(
        'div',
        null,
        this.$slots.default ? this.$slots.default() : null,
      );

      return h(
        hippyRefreshItemTag,
        {
          style: {
            position: 'absolute',
            left: 0,
            right: 0,
          },
        },
        child,
      );
    },
  });
}
