/* eslint-disable no-param-reassign */
import { getEventRedirector } from './utils';

function registerWaterfall(Vue) {
  Vue.registerElement('hi-waterfall', {
    component: {
      name: 'WaterfallView',
      processEventData(event, nativeEventName, nativeEventParams) {
        switch (nativeEventName) {
          case 'onEndReached':
          case 'onInitialListReady':
            break;
          case 'onExposureReport':
            event.exposureInfo = nativeEventParams.exposureInfo;
            break;
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
  Vue.component('waterfall', {
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
      onEndReached() {
        this.$emit('onEndReached');
      },
      onHeaderReleased() {
        this.$emit('onHeaderReleased');
      },
      onHeaderPulling() {
        this.$emit('onHeaderPulling');
      },
      onInitialListReady() {
        this.$emit('onInitialListReady');
      },
      onExposureReport() {
        this.$emit('onExposureReport');
      },

      // native methods
      call(action, params) {
        Vue.Native.callUIFunction(this.$refs.waterfall, action, params);
      },
      startRefresh() {
        this.call('startRefresh');
      },
      /** @param {Number} type 1.same as startRefresh */
      startRefreshWithType(type) {
        this.call('startRefreshWithType', [type]);
      },
      callExposureReport() {
        this.call('callExposureReport', []);
      },
      scrollToIndex({ index, animation }) {
        this.call('scrollToIndex', [index, index, animation]);
      },
      scrollToContentOffset({ x, y, animation }) {
        this.call('scrollToContentOffset', [x, y, animation]);
      },
      startLoadMore() {
        this.call('startLoadMore');
      },
    },
    render(h) {
      const on = getEventRedirector.call(this, [
        ['onEndReached', 'endReached'],
        ['onExposureReport', 'exposureReport'],
        ['onInitialListReady', 'initialListReady'],
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
  Vue.component('waterfall-item', {
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

