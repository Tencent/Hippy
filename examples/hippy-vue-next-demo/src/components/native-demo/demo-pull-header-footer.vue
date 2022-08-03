<template>
  <div id="demo-pull-header-footer">
    <div class="toolbar">
      <button
        class="toolbar-btn"
        @click="scrollToNextPage"
      >
        <span>翻到下一页</span>
      </button>
      <button
        class="toolbar-btn"
        @click="scrollToBottom"
      >
        <span>翻动到底部</span>
      </button>
      <p class="toolbar-text">
        列表元素数量：{{ dataSource.length }}
      </p>
    </div>
    <ul
      id="list"
      ref="listRef"
      :numberOfRows="dataSource.length"
      @scroll="onScroll"
    >
      /** * 下拉组件 * * 事件： * idle: 滑动距离在 pull-header
      区域内触发一次，参数 contentOffset，滑动距离 * pulling: 滑动距离超出
      pull-header 后触发一次，参数 contentOffset，滑动距离 * refresh:
      滑动超出距离，松手后触发一次 */
      <pull-header
        ref="pullHeaderRef"
        class="ul-refresh"
        @idle="onHeaderIdle"
        @pulling="onHeaderPulling"
        @released="onHeaderReleased"
      >
        <p class="ul-refresh-text">
          {{ headerRefreshText }}
        </p>
      </pull-header>
      <li
        v-for="(ui, index) in dataSource"
        :key="index"
        class="item-style"
        :type="'row-' + ui.style"
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
      </li>
      /** * 上拉组件 * > 如果不需要显示加载情况，可以直接使用 ul 的 onEndReached
      实现一直加载 * * 事件： * idle: 滑动距离在 pull-footer
      区域内触发一次，参数 contentOffset，滑动距离 * pulling: 滑动距离超出
      pull-footer 后触发一次，参数 contentOffset，滑动距离 * released:
      滑动超出距离，松手后触发一次 */
      <pull-footer
        ref="pullFooterRef"
        class="pull-footer"
        @idle="onFooterIdle"
        @pulling="onFooterPulling"
        @released="onEndReached"
      >
        <p class="pull-footer-text">
          {{ footerRefreshText }}
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
const mockFetchData = async (): Promise<any> => new Promise((resolve) => {
  setTimeout(() => resolve(mockData), 800);
});

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
    const pullHeaderRef = ref(null);
    // pull footer 引用
    const pullFooterRef = ref(null);
    // 数据源
    const dataSource: Ref<any[]> = ref([...mockData]);
    // 是否正在加载
    let loadMoreDataFlag = false;
    let fetchingDataFlag = false;
    // 当前加载状态
    const loadingState = ref('');
    // 刷新文案
    const headerRefreshText = ref('继续下拉触发刷新');
    const footerRefreshText = ref('正在加载...');

    const onHeaderReleased = async () => {
      if (fetchingDataFlag) {
        return;
      }
      fetchingDataFlag = true;
      warn('onHeaderReleased');
      // 重新获取数据
      headerRefreshText.value = '刷新数据中，请稍等';
      dataSource.value = await mockFetchData();
      dataSource.value = dataSource.value.reverse();
      fetchingDataFlag = false;
      headerRefreshText.value = '2秒后收起';
      // 要主动调用collapsePullHeader关闭pullHeader，否则可能会导致released事件不能再次触发
      if (pullHeaderRef.value) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        pullHeaderRef.value.collapsePullHeader({ time: 2000 });
      }
    };

    /**
       * 滑动到列表最后，触发事件，可以加载下一页了
       *
       * @param evt
       */
    const onEndReached = async (evt) => {
      warn('endReached', evt);

      // 检查锁，如果在加载中，则直接返回，防止二次加载数据
      if (loadMoreDataFlag) {
        return;
      }
      loadMoreDataFlag = true;
      footerRefreshText.value = '加载更多...';
      // 获取数据
      const newData: any = await mockFetchData();

      if (newData.length === 0) {
        footerRefreshText.value = '没有更多数据';
      }
      dataSource.value = [...dataSource.value, ...newData];
      loadMoreDataFlag = false;

      // 要主动调用collapsePullHeader关闭pullFooter，否则可能会导致released事件不能再次触发
      if (pullFooterRef.value) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        pullFooterRef.value.collapsePullFooter();
      }
    };

    const onHeaderIdle = () => {};
    const onFooterIdle = () => {};
    const onFooterPulling = (evt) => {
      warn('onFooterPulling', evt);
    };
    const onHeaderPulling = (evt) => {
      if (fetchingDataFlag) {
        return;
      }
      warn('onHeaderPulling', evt.contentOffset);
      if (evt.contentOffset > 30) {
        headerRefreshText.value = '松手，即可触发刷新';
      } else {
        headerRefreshText.value = '继续下拉，触发刷新';
      }
    };

    const onScroll = (evt) => {
      evt.stopPropagation(); // 这个事件触发比较频繁，最好阻止一下冒泡。
      scrollPos.value = {
        top: evt.offsetY,
        left: evt.offsetX,
      };
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
      // *** loadMoreDataFlag 是加载锁，业务请照抄 ***
      // 因为 onEndReach 位于屏幕底部时会多次触发，
      // 所以需要加一个锁，当未加载完成时不进行二次加载
      loadMoreDataFlag = false;
      fetchingDataFlag = false;
      dataSource.value = [...mockData];

      // 启动时保存一下屏幕高度，一会儿算曝光时会用到
      $windowHeight = Native?.dimensions
        ? Native.dimensions.window.height
        : window.innerHeight;

      // 要主动调用collapsePullHeader关闭pullHeader，否则可能会导致released事件不能再次触发
      if (pullHeaderRef.value) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        pullHeaderRef.value.collapsePullHeader({ time: 2000 });
      }
    });

    return {
      loadingState,
      dataSource,
      headerRefreshText,
      footerRefreshText,
      listRef,
      pullHeaderRef,
      pullFooterRef,
      onEndReached,
      onHeaderReleased,
      onHeaderIdle,
      onHeaderPulling,
      onFooterIdle,
      onFooterPulling,
      onScroll,
      scrollToNextPage,
      scrollToBottom,
    };
  },
});
</script>

<style>
  #demo-pull-header-footer {
    flex: 1;
    padding: 12px;
  }

  #demo-pull-header-footer #loading {
    font-size: 11px;
    color: #aaa;
    align-self: center;
    height: 30px;
    line-height: 30px;
  }

  #demo-pull-header-footer #toolbar {
    display: flex;
    height: 40px;
    flex-direction: row;
  }

  #demo-pull-header-footer .ul-refresh {
    background-color: #40b883;
  }

  #demo-pull-header-footer .ul-refresh-text {
    color: white;
    height: 50px;
    line-height: 50px;
    text-align: center;
  }

  #demo-pull-header-footer .pull-footer {
    background-color: #40b883;
    height: 40px;
  }

  #demo-pull-header-footer .pull-footer-text {
    color: white;
    line-height: 40px;
    text-align: center;
  }

  #demo-pull-header-footer #list {
    flex: 1;
    background-color: white;
  }

  #demo-pull-header-footer .article-title {
    font-size: 17px;
    line-height: 24px;
    color: #242424;
  }

  #demo-pull-header-footer .normal-text {
    font-size: 11px;
    color: #aaa;
    align-self: center;
  }

  #demo-pull-header-footer .image {
    flex: 1;
    height: 160px;
    resize-mode: cover;
  }

  #demo-pull-header-footer .style-one-image-container {
    flex-direction: row;
    justify-content: center;
    margin-top: 8px;
    flex: 1;
  }

  #demo-pull-header-footer .style-one-image {
    height: 120px;
  }

  #demo-pull-header-footer .style-two {
    flex-direction: row;
    justify-content: space-between;
  }

  #demo-pull-header-footer .style-two-left-container {
    flex: 1;
    flex-direction: column;
    justify-content: center;
    margin-right: 8px;
  }

  #demo-pull-header-footer .style-two-image-container {
    flex: 1;
  }

  #demo-pull-header-footer .style-two-image {
    height: 140px;
  }

  #demo-pull-header-footer .style-five-image-container {
    flex-direction: row;
    justify-content: center;
    margin-top: 8px;
    flex: 1;
  }

  #demo-pull-header-footer .item-style {
    background-color: white;
    padding-top: 12px;
    padding-bottom: 12px;
    border-bottom-width: 1px;
    border-bottom-color: #e5e5e5;
    border-style: solid;
  }
</style>
