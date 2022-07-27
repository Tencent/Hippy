/* eslint-disable no-param-reassign */
import type { App } from '@vue/runtime-core';
import { h } from '@vue/runtime-core';

import type { CommonMapParams } from '../../global';
import { registerHippyTag } from '../runtime/component';
import type { EventsUnionType } from '../runtime/event/hippy-event';
import { Native } from '../runtime/native';
import { getEventRedirects } from '../util';

/**
 * 注册瀑布流的native组件
 *
 * @param vueApp - vue app 实例
 */
export function registerWaterfall(vueApp: App): void {
  const hippyWaterfallTag = 'hi-waterfall';
  const hippyWaterfallItemTag = 'hi-waterfall-item';

  // 注册瀑布流组件
  registerHippyTag(hippyWaterfallTag, {
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
  });

  // 注册瀑布流组件item
  registerHippyTag(hippyWaterfallItemTag, {
    name: 'WaterfallItem',
  });

  // 注册
  vueApp.component('Waterfall', {
    props: {
      // 瀑布流列数量，默认为2
      numberOfColumns: {
        type: Number,
        default: 2,
      },

      // 内容缩进
      contentInsert: {
        type: Object,
        default: () => ({ top: 0, left: 0, bottom: 0, right: 0 }),
      },

      // 瀑布流每列之前的水平间距
      columnSpacing: {
        type: Number,
        default: 0,
      },

      // item间的水平间距
      interItemSpacing: {
        type: Number,
        default: 0,
      },

      // 滑动到瀑布流底部前提前预加载的item数量
      preloadItemNumber: {
        type: Number,
        default: 0,
      },

      // 是否包含bannerView，只能有一个，且Android暂不支持
      containBannerView: {
        type: Boolean,
        default: false,
      },

      // 是否包含pull-header，android暂不支持
      containPullHeader: {
        type: Boolean,
        default: false,
      },

      // 是否包含pull-footer
      containPullFooter: {
        type: Boolean,
        default: false,
      },
    },
    methods: {
      /**
       * 调用native的方法
       *
       * @param action - native的方法名
       * @param params - 调用参数
       */
      call(action: string, params: CommonMapParams) {
        Native.callUIFunction(this.$refs.waterfall, action, params);
      },

      /**
       * 开始刷新
       */
      startRefresh() {
        this.call('startRefresh');
      },

      /**
       * 指定type进行startRefresh
       *
       * @param type - 刷新类型
       */
      startRefreshWithType(type: string) {
        this.call('startRefreshWithType', [type]);
      },

      /**
       * 调用曝光上报
       */
      callExposureReport() {
        this.call('callExposureReport', []);
      },

      /**
       * 滚动到指定index
       *
       * @param index - 滚动到的索引值
       * @param animated - 是否需要动画
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
       * 滚动到指定偏移量
       *
       * @param xOffset - x方向偏移量
       * @param yOffset - y方向偏移量
       * @param animated - 是否需要动画
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
       * 开始加载更多瀑布流元素
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
          contentInsert: this.contentInsert,
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
    },
    render() {
      return h(
        hippyWaterfallItemTag,
        {
          on: {
            ...this.$listeners,
          },
          type: this.type,
        },
        this.$slots.default ? this.$slots.default() : null,
      );
    },
  });
}
