/* eslint-disable no-param-reassign */
import { getEventRedirector } from './utils';

function registerWaterfall(Vue) {
  Vue.registerElement('hi-waterfall', {
    component: {
      name: 'WaterfallView',
      processEventData(event, nativeEventName, nativeEventParams) {
        switch (nativeEventName) {
          case 'onExposureReport':
            event.exposureInfo = nativeEventParams.exposureInfo;
            break;
          case 'onScroll': {
            /**
             * scroll event parameters
             *
             * @param {number} startEdgePos - Scrolled offset of List top edge
             * @param {number} endEdgePos - Scrolled offset of List end edge
             * @param {number} firstVisibleRowIndex - Index of the first list item at current visible screen
             * @param {number} lastVisibleRowIndex - Index of the last list item at current visible screen
             * @param {Object[]} visibleRowFrames - Frame info of current screen visible items
             * @param {number} visibleRowFrames[].x - Current item's horizontal offset relative to ListView
             * @param {number} visibleRowFrames[].y - Current item's vertical offset relative to ListView
             * @param {number} visibleRowFrames[].width - Current item's width
             * @param {number} visibleRowFrames[].height - Current item's height
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
  Vue.registerElement('hi-waterfall-item', {
    component: {
      name: 'WaterfallItem',
    },
  });
  Vue.component('Waterfall', {
    inheritAttrs: false,
    props: {
      numberOfColumns: {
        type: Number,
        default: 2,
      },
      contentInset: {
        type: Object,
        default: () => ({ top: 0, left: 0, bottom: 0, right: 0 }),
      },
      columnSpacing: {
        type: Number,
        default: 0,
      },
      interItemSpacing: {
        type: Number,
        default: 0,
      },
      preloadItemNumber: {
        type: Number,
        default: 0,
      },
      containBannerView: {
        type: Boolean,
        default: false,
      },
      containPullHeader: {
        type: Boolean,
        default: false,
      },
      containPullFooter: {
        type: Boolean,
        default: false,
      },
    },
    methods: {
      // call native methods
      call(action, params) {
        Vue.Native.callUIFunction(this.$refs.waterfall, action, params);
      },
      onScroll(evt) {
        this.$emit('scroll', evt);
      },
      onEndReached() {
        this.$emit('endReached');
      },
      onHeaderReleased() {
        this.$emit('headerReleased');
      },
      onHeaderPulling() {
        this.$emit('headerPulling');
      },
      onInitialListReady() {
        this.$emit('initialListReady');
      },
      // TODO onExposureReport is not supported yet
      onExposureReport(evt) {
        this.$emit('exposureReport', evt);
      },
      startRefresh() {
        this.call('startRefresh');
      },
      /** @param {number} type 1.same as startRefresh */
      startRefreshWithType(type) {
        this.call('startRefreshWithType', [type]);
      },
      callExposureReport() {
        this.call('callExposureReport', []);
      },
      /**
       * Scrolls to a given index of item, either immediately, with a smooth animation.
       *
       * @param {Object} scrollToIndex params
       * @param {number} scrollToIndex.index - Scroll to specific index.
       * @param {boolean} scrollToIndex.animated - With smooth animation. By default is true.
       */
      scrollToIndex({ index = 0, animated = true }) {
        if (typeof index !== 'number' || typeof animated !== 'boolean') {
          return;
        }
        this.call('scrollToIndex', [index, index, animated]);
      },
      /**
       * Scrolls to a given x, y offset, either immediately, with a smooth animation.
       *
       * @param {Object} scrollToContentOffset params
       * @param {number} scrollToContentOffset.xOffset - Scroll to horizon offset X.
       * @param {number} scrollToContentOffset.yOffset - Scroll To vertical offset Y.
       * @param {boolean} scrollToContentOffset.animated - With smooth animation. By default is true.
       */
      scrollToContentOffset({ xOffset = 0, yOffset = 0, animated = true }) {
        if (typeof xOffset !== 'number' || typeof yOffset !== 'number' || typeof animated !== 'boolean') {
          return;
        }
        this.call('scrollToContentOffset', [xOffset, yOffset, animated]);
      },
      /**
       * start to load more waterfall items
       */
      startLoadMore() {
        this.call('startLoadMore');
      },
    },
    render(h) {
      const on = getEventRedirector.call(this, [
        'endReached',
        'exposureReport',
        'initialListReady',
        'scroll',
      ]);
      return h(
        'hi-waterfall',
        {
          on,
          ref: 'waterfall',
          attrs: {
            numberOfColumns: this.numberOfColumns,
            contentInset: this.contentInset,
            columnSpacing: this.columnSpacing,
            interItemSpacing: this.interItemSpacing,
            preloadItemNumber: this.preloadItemNumber,
            containBannerView: this.containBannerView,
            containPullHeader: this.containPullHeader,
            containPullFooter: this.containPullFooter,
          },
        },
        this.$slots.default,
      );
    },
  });
  Vue.component('WaterfallItem', {
    inheritAttrs: false,
    props: {
      type: {
        type: [String, Number],
        default: '',
      },
    },
    render(h) {
      return h(
        'hi-waterfall-item',
        {
          on: { ...this.$listeners },
          attrs: {
            type: this.type,
          },
        },
        this.$slots.default,
      );
    },
  });
}

export default registerWaterfall;

