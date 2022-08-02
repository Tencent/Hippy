<template>
  <div id="demo-pull-footer">
    <div class="toolbar">
      <button class="toolbar-btn" @click="scrollToNextPage">
        <span>翻到下一页</span>
      </button>
      <button class="toolbar-btn" @click="scrollToBottom">
        <span>翻动到底部</span>
      </button>
      <p class="toolbar-text">列表元素数量：{{ dataSource.length }}</p>
    </div>

    <!-- numberOfRows is necessary by iOS first screen rendering -->
    <ul
      id="list"
      ref="listRef"
      :numberOfRows="dataSource.length"
      :preloadItemNumber="4"
      :scrollEventThrottle="200"
      @scroll="onScroll"
    >
      <li
        v-for="(ui, index) in dataSource"
        :key="index"
        :type="'row-' + ui.style"
      >
        <style-one v-if="ui.style === 1" :item-bean="ui.itemBean" />
        <style-two v-if="ui.style === 2" :item-bean="ui.itemBean" />
        <style-five v-if="ui.style === 5" :item-bean="ui.itemBean" />
      </li>
      /** * 上拉组件 * > 如果不需要显示加载情况，可以直接使用 ul 的 onEndReached
      实现一直加载 * * 属性： * sticky: 上拉后保持显示，在执行
      collapsePullFooter 后收起 * * 事件： * idle: 滑动距离在 pull-footer
      区域内触发一次，参数 contentOffset，滑动距离 * pulling: 滑动距离超出
      pull-footer 后触发一次，参数 contentOffset，滑动距离 * refresh:
      滑动超出距离，松手后触发一次 */
      <pull-footer
        ref="pullFooterRef"
        class="pull-footer"
        :sticky="true"
        @idle="onIdle"
        @pulling="onPulling"
        @released="onEndReached"
      >
        <p class="pull-footer-text">
          {{ refreshText }}
        </p>
      </pull-footer>
    </ul>
  </div>
</template>

<script lang="ts">
  import { Native, type HippyListElement } from '@hippy/vue-next';
  import type { Ref } from '@vue/runtime-core';
  import { defineComponent, onMounted, ref } from '@vue/runtime-core';

  import { warn } from '../../util';
  import mockData from '../list-items/mock';
  import StyleOne from '../list-items/style1.vue';
  import StyleTwo from '../list-items/style2.vue';
  import StyleFive from '../list-items/style5.vue';

  const STYLE_LOADING = 100;
  const MAX_FETCH_TIMES = 50;
  const REFRESH_TEXT = '继续上拉后松手，将会加载更多';
  // 当前请求的次数
  let fetchTimes = 0;
  // 视窗高度
  let $windowHeight = 0;
  // 当前滚动位置
  const scrollPos = ref({
    top: 0,
    left: 0,
  });

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

  export default defineComponent({
    components: {
      StyleOne,
      StyleTwo,
      StyleFive,
    },
    setup() {
      // 列表引用
      const listRef = ref(null);
      // pull header 引用
      const pullFooterRef = ref(null);
      // 数据源
      const dataSource: Ref<NeedToTyped[]> = ref([...mockData]);
      // 是否正在加载
      let isLoading = false;
      // 刷新文案
      const refreshText = ref(REFRESH_TEXT);

      const onIdle = () => {
        refreshText.value = REFRESH_TEXT;
      };

      const onPulling = () => {
        refreshText.value = '松手即可加载更多';
      };

      const onScroll = (evt) => {
        evt.stopPropagation(); // 这个事件触发比较频繁，最好阻止一下冒泡。
        scrollPos.value = {
          top: evt.offsetY,
          left: evt.offsetX,
        };
      };

      // 滑动到底部事件
      const onEndReached = async () => {
        // 检查锁，如果在加载中，则直接返回，防止二次加载数据
        if (isLoading) {
          return;
        }

        isLoading = true;

        const newData = await mockFetchData();
        if (!newData) {
          isLoading = false;
          return;
        }
        // 附加更多数据
        dataSource.value = [...dataSource.value, ...newData];
        isLoading = false;

        if (pullFooterRef.value) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          pullFooterRef.value.collapsePullFooter();
        }
      };

      /**
       * 翻到下一页
       */
      const scrollToNextPage = () => {
        // 因为布局问题，浏览器内 flex: 1 后也会超出窗口尺寸高度，所以这么滚是不行的。
        if (!Native) {
          /* eslint-disable-next-line no-alert */
          alert('This method is only supported in Native environment.');
          return;
        }
        if (listRef.value) {
          const list = listRef.value as HippyListElement;

          warn('scroll to next page', list, scrollPos.value, $windowHeight);

          const top = scrollPos.value.top + $windowHeight - 200; // 偷懒假定内容区域为屏幕高度 - 200
          // CSSOM View standard - ScrollToOptions
          // https://www.w3.org/TR/cssom-view-1/#extensions-to-the-window-interface
          list.scrollTo({
            left: scrollPos.value.left,
            top,
            behavior: 'auto',
            duration: 200,
          }); // 其实 scrollPost.left 写 0 也可以。
        }
      };

      /**
       * 滚动到底部
       */
      const scrollToBottom = () => {
        if (!Native) {
          /* eslint-disable-next-line no-alert */
          alert('This method is only supported in Native environment.');
          return;
        }

        if (listRef.value) {
          const list = listRef.value as HippyListElement;
          list.scrollToIndex(0, list.childNodes.length - 1);
        }
      };

      onMounted(() => {
        // *** isLoading 是加载锁，业务请照抄 ***
        // 因为 onEndReach 位于屏幕底部时会多次触发，
        // 所以需要加一个锁，当未加载完成时不进行二次加载
        isLoading = false;
        dataSource.value = [...mockData];

        // 启动时保存一下屏幕高度，一会儿算曝光时会用到
        $windowHeight = Native?.dimensions
          ? Native.dimensions.window.height
          : window.innerHeight;
      });

      return {
        dataSource,
        refreshText,
        STYLE_LOADING,
        listRef,
        pullFooterRef,
        onEndReached,
        onIdle,
        onPulling,
        onScroll,
        scrollToNextPage,
        scrollToBottom,
      };
    },
  });
</script>

<style>
  #demo-pull-footer {
    flex: 1;
    padding: 12px;
  }

  #demo-pull-footer #loading {
    font-size: 11px;
    color: #aaa;
    align-self: center;
  }

  #demo-pull-footer #toolbar {
    display: flex;
    height: 40px;
    flex-direction: row;
  }

  #demo-pull-footer .pull-footer {
    background-color: green;
  }

  #demo-pull-footer .pull-footer-text {
    color: white;
    height: 60px;
    line-height: 60px;
    text-align: center;
  }

  #demo-pull-footer #list {
    flex: 1;
    background-color: white;
  }

  #demo-pull-footer .article-title {
    font-size: 17px;
    line-height: 24px;
    color: #242424;
  }

  #demo-pull-footer .normal-text {
    font-size: 11px;
    color: #aaa;
    align-self: center;
  }

  #demo-pull-footer .image {
    flex: 1;
    height: 160px;
    resize-mode: cover;
  }

  #demo-pull-footer .style-one-image-container {
    flex-direction: row;
    justify-content: center;
    margin-top: 8px;
    flex: 1;
  }

  #demo-pull-footer .style-one-image {
    height: 120px;
  }

  #demo-pull-footer .style-two {
    flex-direction: row;
    justify-content: space-between;
  }

  #demo-pull-footer .style-two-left-container {
    flex: 1;
    flex-direction: column;
    justify-content: center;
    margin-right: 8px;
  }

  #demo-pull-footer .style-two-image-container {
    flex: 1;
  }

  #demo-pull-footer .style-two-image {
    height: 140px;
  }
</style>
