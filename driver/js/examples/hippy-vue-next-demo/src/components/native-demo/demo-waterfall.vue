<template>
  <div id="demo-waterfall">
    <waterfall
      ref="gridView"
      :content-inset="contentInset"
      :column-spacing="columnSpacing"
      :contain-banner-view="true"
      :contain-pull-footer="true"
      :inter-item-spacing="interItemSpacing"
      :number-of-columns="numberOfColumns"
      :preload-item-number="4"
      :style="{flex: 1}"
      @endReached="onEndReached"
      @scroll="onScroll"
    >
      <pull-header
        ref="pullHeader"
        class="ul-refresh"
        @idle="onHeaderIdle"
        @pulling="onHeaderPulling"
        @released="onHeaderReleased"
      >
        <p class="ul-refresh-text">
          {{ headerRefreshText }}
        </p>
      </pull-header>
      <div
        v-if="isIos"
        class="banner-view"
      >
        <span>BannerView</span>
      </div>
      <waterfall-item
        v-else
        :full-span="true"
        class="banner-view"
      >
        <span>BannerView</span>
      </waterfall-item>
      <waterfall-item
        v-for="(ui, index) in dataSource"
        :key="index"
        :style="{width: itemWidth}"
        :type="ui.style"
        @click.stop="() => onClickItem(index)"
      >
        <style-one
          v-if="ui.style === 1"
          :item-bean="ui.itemBean"
        />
        <style-two
          v-if="ui.style === 2"
          :item-bean="ui.itemBean"
        />
        <style-five
          v-if="ui.style === 5"
          :item-bean="ui.itemBean"
        />
      </waterfall-item>
      <pull-footer
        ref="pullFooter"
        class="pull-footer"
        @idle="onFooterIdle"
        @pulling="onFooterPulling"
        @released="onEndReached"
      >
        <p class="pull-footer-text">
          {{ footerRefreshText }}
        </p>
      </pull-footer>
    </waterfall>
  </div>
</template>

<script lang="ts">
import { Native } from '@hippy/vue-next';
import type { Ref } from '@vue/runtime-core';
import { defineComponent, ref, computed } from '@vue/runtime-core';

import mockData from '../list-items/mock';
import StyleOne from '../list-items/style1.vue';
import StyleTwo from '../list-items/style2.vue';
import StyleFive from '../list-items/style5.vue';

const STYLE_LOADING = 100;
const MAX_FETCH_TIMES = 50;
// number of current requests
let fetchTimes = 0;
// horizontal space between columns
const columnSpacing = 6;
// vertical spacing between items
const interItemSpacing = 6;
// the number of waterfall flow columns, the default is 2
const numberOfColumns = 2;
// inner content padding
const contentInset = { top: 0, left: 5, bottom: 0, right: 5 };
const isIos = Native.Platform === 'ios';

const mockFetchData = async (): Promise<any> => new Promise((resolve) => {
  setTimeout(() => {
    fetchTimes += 1;
    if (fetchTimes >= MAX_FETCH_TIMES) {
      return resolve([]);
    }
    return resolve([...mockData, ...mockData]);
  }, 600);
});

export default defineComponent({
  components: {
    StyleOne,
    StyleTwo,
    StyleFive,
  },
  setup() {
    // 数据源
    const dataSource: Ref<any[]> = ref([
      ...mockData,
      ...mockData,
      ...mockData,
      ...mockData,
    ]);

    let loadMoreDataFlag = false;
    let fetchingDataFlag = false;
    const isRefreshing = ref(false);
    const loadingState = ref('正在加载...');
    const pullHeader = ref(null);
    const pullFooter = ref(null);
    let headerRefreshText = '继续下拉触发刷新';
    let footerRefreshText = '正在加载...';
    const refreshText = computed(() => (isRefreshing.value ? '正在刷新' : '下拉刷新'));
    const gridView = ref(null);
    const header = ref(null);
    const itemWidth = computed(() => {
      const screenWidth = Native.Dimensions.screen.width;
      const width = screenWidth - contentInset.left - contentInset.right;
      return (
        (width - (numberOfColumns - 1) * columnSpacing) / numberOfColumns
      );
    });

    // refresh event callback
    const onRefresh = async () => {
      isRefreshing.value = true;
      const data = await mockFetchData();
      isRefreshing.value = false;
      dataSource.value = data.reverse();
      if (header.value) {
        // Notify refresh completed
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        header.value.refreshCompleted();
      }
    };

    const onHeaderPulling = (evt) => {
      if (fetchingDataFlag) {
        return;
      }
      console.log('onHeaderPulling', evt.contentOffset);
      if (evt.contentOffset > 30) {
        headerRefreshText = '松手，即可触发刷新';
      } else {
        headerRefreshText = '继续下拉，触发刷新';
      }
    };
    const onFooterPulling = (evt) => {
      console.log('onFooterPulling', evt);
    };
    const onHeaderIdle = () => {};
    const onFooterIdle = () => {};
    const onHeaderReleased =  async () => {
      if (fetchingDataFlag) {
        return;
      }
      fetchingDataFlag = true;
      console.log('onHeaderReleased');
      headerRefreshText = '刷新数据中，请稍等';
      fetchingDataFlag = false;
      headerRefreshText = '2秒后收起';
      // 要主动调用collapsePullHeader关闭pullHeader，否则可能会导致released事件不能再次触发
      if (pullHeader.value) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        pullHeader.value.collapsePullHeader({ time: 2000 });
      }
    };

    // scroll to bottom callback
    const onEndReached = async () => {
      console.log('end Reached');

      if (loadMoreDataFlag) {
        return;
      }

      loadMoreDataFlag = true;
      footerRefreshText = '加载更多...';

      const newData = await mockFetchData();
      if (newData.length === 0) {
        footerRefreshText = '没有更多数据';
      }

      dataSource.value = [...dataSource.value, ...newData];
      loadMoreDataFlag = false;
      if (pullFooter.value) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        pullFooter.value.collapsePullFooter();
      }
    };

    const onClickItem = (index) => {
      if (gridView.value) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        gridView.value.scrollToIndex({ index, animation: true });
      }
    };

    /**
       * scroll listener event
       *
       * @param evt
       */
    const onScroll = (evt) => {
      console.log('waterfall onScroll', evt);
    };

    return {
      dataSource,
      isRefreshing,
      refreshText,
      STYLE_LOADING,

      loadingState,
      header,
      gridView,

      contentInset,
      columnSpacing,
      interItemSpacing,
      numberOfColumns,
      itemWidth,
      onScroll,
      onRefresh,
      onEndReached,
      onClickItem,
      isIos,
      onHeaderPulling,
      onFooterPulling,
      onHeaderIdle,
      onFooterIdle,
      onHeaderReleased,
      headerRefreshText,
      footerRefreshText,
      loadMoreDataFlag,
      pullHeader,
      pullFooter,
    };
  },
});
</script>

<style scoped>
#demo-waterfall {
  flex: 1;
}

#demo-waterfall .ul-refresh {
  background-color: #40b883;
}

#demo-waterfall .ul-refresh-text {
  color: white;
  height: 50px;
  line-height: 50px;
  text-align: center;
}
#demo-waterfall .pull-footer {
  background-color: #40b883;
  height: 40px;
}
#demo-waterfall .pull-footer-text {
  color: white;
  line-height: 40px;
  text-align: center;
}

#demo-waterfall .refresh-text {
  height: 40px;
  line-height: 40px;
  text-align: center;
  color: white;
}

#demo-waterfall .banner-view {
  background-color: grey;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
}

#demo-waterfall .pull-footer {
  flex: 1;
  height: 40px;
  background-color: #40b883;
  justify-content: center;
  align-items: center;
}

#demo-waterfall :deep(.list-view-item) {
  background-color: #eeeeee;
}

#demo-waterfall :deep(.article-title) {
  font-size: 12px;
  line-height: 16px;
  color: #242424;
}

#demo-waterfall :deep(.normal-text) {
  font-size: 10px;
  color: #aaa;
  align-self: center;
}

#demo-waterfall :deep(.image) {
  flex: 1;
  height: 120px;
  resize: both;
}

#demo-waterfall :deep(.style-one-image-container) {
  flex-direction: row;
  justify-content: center;
  margin-top: 8px;
  flex: 1;
}

#demo-waterfall :deep(.style-one-image) {
  height: 60px;
}

#demo-waterfall :deep(.style-two) {
  flex-direction: row;
  justify-content: space-between;
}

#demo-waterfall :deep(.style-two-left-container) {
  flex: 1;
  flex-direction: column;
  justify-content: center;
  margin-right: 8px;
}

#demo-waterfall :deep(.style-two-image-container) {
  flex: 1;
}

#demo-waterfall :deep(.style-two-image) {
  height: 80px;
}

#demo-waterfall :deep(.refresh) {
  background-color: #40b883;
}
</style>
