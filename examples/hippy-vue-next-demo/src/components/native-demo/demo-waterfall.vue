<template>
  <div id="demo-waterfall">
    <!-- 注意：本组件需要Hippy SDK 2.9.0+ -->
    <ul-refresh-wrapper ref="headerRef" style="flex: 1" @refresh="onRefresh">
      <ul-refresh class="refresh-header">
        <p class="refresh-text">
          {{ refreshText }}
        </p>
      </ul-refresh>
      <waterfall
        ref="waterfallRef"
        :content-inset="contentInset"
        :column-spacing="columnSpacing"
        :contain-banner-view="isIos"
        :contain-pull-footer="true"
        :inter-item-spacing="interItemSpacing"
        :number-of-columns="numberOfColumns"
        :preload-item-number="0"
        :style="{ flex: 1 }"
        @endReached="onEndReached"
        @scroll="onScroll"
      >
        <div v-if="isIos" class="banner-view" :type="1">
          <span>BannerView</span>
        </div>
        <waterfall-item
          v-for="(ui, index) in dataSource"
          :key="index"
          :style="{ width: itemWidth }"
          :type="ui.style"
          @click.stop="() => onClickItem(index)"
        >
          <style-one v-if="ui.style === 1" :item-bean="ui.itemBean" />
          <style-two v-if="ui.style === 2" :item-bean="ui.itemBean" />
          <style-five v-if="ui.style === 5" :item-bean="ui.itemBean" />
        </waterfall-item>
        <pull-footer>
          <div class="pull-footer">
            <span
              style="
                color: white;
                text-align: center;
                height: 40px;
                line-height: 40px;
              "
              >{{ loadingState }}</span
            >
          </div>
        </pull-footer>
      </waterfall>
    </ul-refresh-wrapper>
  </div>
</template>

<script lang="ts">
  import { Native } from '@hippy/vue-next';
  import type { Ref } from '@vue/runtime-core';
  import { defineComponent, ref, computed } from '@vue/runtime-core';

  import { warn } from '../../util';
  import mockData from '../list-items/mock';
  import StyleOne from '../list-items/style1.vue';
  import StyleTwo from '../list-items/style2.vue';
  import StyleFive from '../list-items/style5.vue';

  const STYLE_LOADING = 100;
  const MAX_FETCH_TIMES = 50;
  // 当前请求的次数
  let fetchTimes = 0;
  // 每列之前的水平间距
  const columnSpacing = 6;
  // item 间的垂直间距
  const interItemSpacing = 6;
  // 瀑布流列数量
  const numberOfColumns = 2;
  // 内容缩进
  const contentInset = { top: 0, left: 5, bottom: 0, right: 5 };

  /**
   * mock fetch 数据
   */
  const mockFetchData = async (): Promise<NeedToTyped> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        fetchTimes += 1;
        if (fetchTimes >= MAX_FETCH_TIMES) {
          return resolve([]);
        }
        return resolve([...mockData, ...mockData]);
      }, 600);
    });
  };

  /**
   * 滚动监听事件
   *
   * @param evt
   */
  const onScroll = (evt) => {
    warn('waterfall onScroll', evt);
  };

  export default defineComponent({
    components: {
      StyleOne,
      StyleTwo,
      StyleFive,
    },
    setup() {
      // 数据源
      const dataSource: Ref<NeedToTyped[]> = ref([
        ...mockData,
        ...mockData,
        ...mockData,
        ...mockData,
      ]);
      // 是否正在加载
      let isLoading = false;
      // 是否正在刷新
      const isRefreshing = ref(false);
      // 加载状态文案
      const loadingState = ref('正在加载...');
      // 刷新文案
      const refreshText = computed(() =>
        isRefreshing.value ? '正在刷新' : '下拉刷新',
      );
      // 瀑布流引用
      const waterfallRef = ref(null);
      // header 引用
      const headerRef = ref(null);
      // 元素宽度
      const itemWidth = computed(() => {
        const screenWidth = Native.dimensions.screen.width;
        const width = screenWidth - contentInset.left - contentInset.right;
        return (
          (width - (numberOfColumns - 1) * columnSpacing) / numberOfColumns
        );
      });

      // 刷新事件回调
      const onRefresh = async () => {
        // 重新获取数据
        isRefreshing.value = true;
        const data = await mockFetchData();
        isRefreshing.value = false;
        // 赋值
        dataSource.value = data.reverse();
        if (headerRef.value) {
          // 通知刷新完成
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          headerRef.value.refreshCompleted();
        }
      };

      // 滑动到底部事件
      const onEndReached = async () => {
        // 检查锁，如果在加载中，则直接返回，防止二次加载数据
        if (isLoading) {
          return;
        }

        isLoading = true;
        loadingState.value = '正在加载...';

        const newData = await mockFetchData();
        if (!newData) {
          loadingState.value = '没有更多数据';
          isLoading = false;
          return;
        }
        // 附加更多数据
        dataSource.value = [...dataSource.value, ...newData];
        isLoading = false;
      };

      /**
       * 点击 item 元素事件
       */
      const onClickItem = (index) => {
        if (waterfallRef.value) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          waterfallRef.value.scrollToIndex({ index, animation: true });
        }
      };

      return {
        dataSource,
        isRefreshing,
        refreshText,
        STYLE_LOADING,

        isIos: Native.isIOS(),
        loadingState,
        headerRef,
        waterfallRef,

        contentInset,
        columnSpacing,
        interItemSpacing,
        numberOfColumns,
        itemWidth,
        onScroll,
        onRefresh,
        onEndReached,
        onClickItem,
      };
    },
  });
</script>

<style>
  #demo-waterfall {
    flex: 1;
  }

  #demo-waterfall .refresh-header {
    background-color: green;
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

  #demo-waterfall .list-view-item {
    background-color: #eeeeee;
  }

  #demo-waterfall .article-title {
    font-size: 12px;
    line-height: 16px;
    color: #242424;
  }

  #demo-waterfall .normal-text {
    font-size: 10px;
    color: #aaa;
    align-self: center;
  }

  #demo-waterfall .image {
    flex: 1;
    height: 120px;
    resize: both;
  }

  #demo-waterfall .style-one-image-container {
    flex-direction: row;
    justify-content: center;
    margin-top: 8px;
    flex: 1;
  }

  #demo-waterfall .style-one-image {
    height: 60px;
  }

  #demo-waterfall .style-two {
    flex-direction: row;
    justify-content: space-between;
  }

  #demo-waterfall .style-two-left-container {
    flex: 1;
    flex-direction: column;
    justify-content: center;
    margin-right: 8px;
  }

  #demo-waterfall .style-two-image-container {
    flex: 1;
  }

  #demo-waterfall .style-two-image {
    height: 80px;
  }

  #demo-waterfall .refresh {
    background-color: green;
  }

  #demo-waterfall .pull-footer {
    flex: 1;
    height: 40px;
    background-color: green;
    justify-content: center;
    align-items: center;
  }
</style>
