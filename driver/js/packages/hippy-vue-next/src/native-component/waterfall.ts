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
import type { App } from '@vue/runtime-core';
import { h } from '@vue/runtime-core';

import type { CommonMapParams } from '../types';
import { registerElement } from '../runtime/component';
import type { EventsUnionType } from '../runtime/event/hippy-event';
import { Native } from '../runtime/native';
import { getEventRedirects } from '../util';

/**
 * register water fall component
 *
 * @param vueApp - vue instance
 */
export function registerWaterfall(vueApp: App): void {
  const hippyWaterfallTag = 'hi-waterfall';
  const hippyWaterfallItemTag = 'hi-waterfall-item';

  registerElement(hippyWaterfallTag, {
    component: {
      name: 'WaterfallView',
      processEventData(
        evtData: EventsUnionType,
        nativeEventParams: CommonMapParams,
      ) {
        const { handler: event, __evt: nativeEventName } = evtData;

        switch (nativeEventName) {
          case 'onExposureReport':
            event.exposureInfo = nativeEventParams.exposureInfo;
            break;
          case 'onScroll': {
            /**
             * scroll event parameters
             *
             * @param startEdgePos - Scrolled offset of List top edge
             * @param endEdgePos - Scrolled offset of List end edge
             * @param firstVisibleRowIndex - Index of the first list item at current visible screen
             * @param lastVisibleRowIndex - Index of the last list item at current visible screen
             * @param visibleRowFrames - Frame info of current screen visible items
             *        visibleRowFrames[].x - Current item's horizontal offset relative to ListView
             *        visibleRowFrames[].y - Current item's vertical offset relative to ListView
             *        visibleRowFrames[].width - Current item's width
             *        visibleRowFrames[].height - Current item's height
             */
            const {
              startEdgePos,
              endEdgePos,
              firstVisibleRowIndex,
              lastVisibleRowIndex,
              visibleRowFrames,
            } = nativeEventParams;
            Object.assign(event, {
              startEdgePos,
              endEdgePos,
              firstVisibleRowIndex,
              lastVisibleRowIndex,
              visibleRowFrames,
            });
            break;
          }
          default:
        }
        return event;
      },
    },
  });

  registerElement(hippyWaterfallItemTag, {
    component: {
      name: 'WaterfallItem',
    },
  });

  vueApp.component('Waterfall', {
    props: {
      // the number of waterfall flow columns, the default is 2
      numberOfColumns: {
        type: Number,
        default: 2,
      },

      // inner content padding
      contentInset: {
        type: Object,
        default: () => ({ top: 0, left: 0, bottom: 0, right: 0 }),
      },

      // horizontal space between columns
      columnSpacing: {
        type: Number,
        default: 0,
      },

      // vertical spacing between items
      interItemSpacing: {
        type: Number,
        default: 0,
      },

      // the number of items preloaded in advance before sliding to the bottom of the waterfall
      preloadItemNumber: {
        type: Number,
        default: 0,
      },

      // whether to include a bannerView, there can only be one bannerView, Android does not currently support
      containBannerView: {
        type: Boolean,
        default: false,
      },

      // whether to include pull-header;
      // Android does not currently support it, you can use the ul-refresh component instead
      containPullHeader: {
        type: Boolean,
        default: false,
      },

      // whether to include pull-footer
      containPullFooter: {
        type: Boolean,
        default: false,
      },
    },
    methods: {
      /**
       * call native method
       *
       * @param action - method name
       * @param params - params
       */
      call(action: string, params: CommonMapParams) {
        Native.callUIFunction(this.$refs.waterfall, action, params);
      },

      /**
       * start refresh
       */
      startRefresh() {
        this.call('startRefresh');
      },

      /**
       * specify type to refresh
       *
       * @param type - refresh type
       */
      startRefreshWithType(type: string) {
        this.call('startRefreshWithType', [type]);
      },

      /**
       * call exposure report
       */
      callExposureReport() {
        this.call('callExposureReport', []);
      },

      /**
       * scroll to the specified index
       *
       * @param index - index value to scroll to
       * @param animated - determine if animation is required
       */
      scrollToIndex({
        index = 0,
        animated = true,
      }: {
        index: number;
        animated: boolean;
      }): void {
        this.call('scrollToIndex', [index, index, animated]);
      },

      /**
       * scroll to the specified offset
       *
       * @param xOffset - x Offset
       * @param yOffset - y Offset
       * @param animated - determine if animation is required
       */
      scrollToContentOffset({
        xOffset = 0,
        yOffset = 0,
        animated = true,
      }: {
        xOffset: number;
        yOffset: number;
        animated: boolean;
      }) {
        this.call('scrollToContentOffset', [xOffset, yOffset, animated]);
      },

      /**
       * load more waterfall elements
       */
      startLoadMore() {
        this.call('startLoadMore');
      },
    },
    render() {
      const on = getEventRedirects.call(this, [
        'headerReleased',
        'headerPulling',
        'endReached',
        'exposureReport',
        'initialListReady',
        'scroll',
      ]);

      return h(
        hippyWaterfallTag,
        {
          ...on,
          ref: 'waterfall',
          numberOfColumns: this.numberOfColumns,
          contentInset: this.contentInset,
          columnSpacing: this.columnSpacing,
          interItemSpacing: this.interItemSpacing,
          preloadItemNumber: this.preloadItemNumber,
          containBannerView: this.containBannerView,
          containPullHeader: this.containPullHeader,
          containPullFooter: this.containPullFooter,
        },
        this.$slots.default ? this.$slots.default() : null,
      );
    },
  });

  vueApp.component('WaterfallItem', {
    props: {
      type: {
        type: [String, Number],
        default: '',
      },
      fullSpan: {
        type: Boolean,
        default: false,
      },
    },
    render() {
      return h(
        hippyWaterfallItemTag,
        {
          type: this.type,
          fullSpan: this.fullSpan,
        },
        this.$slots.default ? this.$slots.default() : null,
      );
    },
  });
}
