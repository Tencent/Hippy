<template>
  <div
    id="demo-pull-header-footer"
    specital-attr="pull-header-footer"
  >
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
      ref="list"
      :numberOfRows="dataSource.length"
      :rowShouldSticky="true"
      @scroll="onScroll"
    >
      /**
      * 下拉组件
      *
      * 事件：
      *   idle: 滑动距离在 pull-header 区域内触发一次，参数 contentOffset，滑动距离
      *   pulling: 滑动距离超出 pull-header 后触发一次，参数 contentOffset，滑动距离
      *   refresh: 滑动超出距离，松手后触发一次
      */
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
      <li
        v-for="(ui, index) in dataSource"
        :key="index"
        class="item-style"
        :type="'row-' + ui.style"
        :sticky="index === 0"
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
      /**
      * 上拉组件
      *   > 如果不需要显示加载情况，可以直接使用 ul 的 onEndReached 实现一直加载
      *
      * 事件：
      *   idle: 滑动距离在 pull-footer 区域内触发一次，参数 contentOffset，滑动距离
      *   pulling: 滑动距离超出 pull-footer 后触发一次，参数 contentOffset，滑动距离
      *   released: 滑动超出距离，松手后触发一次
      */
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
    </ul>
  </div>
</template>

<script lang="ts">
import { Native, type HippyListElement } from '@hippy/vue-next';
import type { Ref } from '@vue/runtime-core';
import { defineComponent, onMounted, ref } from '@vue/runtime-core';

import mockData from '../list-items/mock';
import StyleOne from '../list-items/style1.vue';
import StyleTwo from '../list-items/style2.vue';
import StyleFive from '../list-items/style5.vue';

// Viewport height
let $windowHeight = 0;
// current scroll position
const scrollPos = ref({
  top: 0,
  left: 0,
});

/**
   * mock fetch data
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
    const list = ref(null);
    const pullHeader = ref(null);
    const pullFooter = ref(null);
    const dataSource: Ref<any[]> = ref([...mockData]);

    let loadMoreDataFlag = false;
    let fetchingDataFlag = false;
    const loadingState = ref('');

    const headerRefreshText = ref('继续下拉触发刷新');
    const footerRefreshText = ref('正在加载...');

    const onHeaderReleased = async () => {
      if (fetchingDataFlag) {
        return;
      }
      fetchingDataFlag = true;
      console.log('onHeaderReleased');
      // retrieve data
      headerRefreshText.value = '刷新数据中，请稍等';
      dataSource.value = await mockFetchData();
      dataSource.value = dataSource.value.reverse();
      fetchingDataFlag = false;
      headerRefreshText.value = '2秒后收起';

      /**
       * You need to actively call collapsePullHeader to close the pullHeader,
       * otherwise the released event may not be triggered again
       */
      if (pullHeader.value) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        pullHeader.value.collapsePullHeader({ time: 2000 });
      }
    };

    /**
       * Swipe to the end of the list, trigger the event, you can load the next page
       *
       * @param evt
       */
    const onEndReached = async (evt) => {
      console.log('endReached', evt);

      /**
       * Check the lock, if it is loading,
       * return directly to prevent the data from being loaded twice
       */
      if (loadMoreDataFlag) {
        return;
      }
      loadMoreDataFlag = true;
      footerRefreshText.value = '加载更多...';
      const newData: any = await mockFetchData();

      if (newData.length === 0) {
        footerRefreshText.value = '没有更多数据';
      }
      dataSource.value = [...dataSource.value, ...newData];
      loadMoreDataFlag = false;

      /**
       * You need to actively call collapsePullHeader to close pullFooter,
       * otherwise the released event may not be triggered again
       */
      if (pullFooter.value) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        pullFooter.value.collapsePullFooter();
      }
    };

    const onHeaderIdle = () => {};
    const onFooterIdle = () => {};
    const onFooterPulling = (evt) => {
      console.log('onFooterPulling', evt);
    };
    const onHeaderPulling = (evt) => {
      if (fetchingDataFlag) {
        return;
      }
      console.log('onHeaderPulling', evt.contentOffset);
      if (evt.contentOffset > 30) {
        headerRefreshText.value = '松手，即可触发刷新';
      } else {
        headerRefreshText.value = '继续下拉，触发刷新';
      }
    };

    const onScroll = (evt) => {
      // This event is triggered more frequently, and it is best to prevent bubbling.
      evt.stopPropagation();
      scrollPos.value = {
        top: evt.offsetY,
        left: evt.offsetX,
      };
    };

    /**
       * scroll to next page
       */
    const scrollToNextPage = () => {
      if (!Native) {
        /* eslint-disable-next-line no-alert */
        alert('This method is only supported in Native environment.');
        return;
      }
      if (list.value) {
        const ul = list.value as HippyListElement;

        console.log('scroll to next page', list, scrollPos.value, $windowHeight);

        const top = scrollPos.value.top + $windowHeight - 200;
        // CSSOM View standard - ScrollToOptions
        // https://www.w3.org/TR/cssom-view-1/#extensions-to-the-window-interface
        ul.scrollTo({
          left: scrollPos.value.left,
          top,
          behavior: 'auto',
          duration: 200,
        });
      }
    };

    /**
       * scroll to bottom
       */
    const scrollToBottom = () => {
      if (!Native) {
        /* eslint-disable-next-line no-alert */
        alert('This method is only supported in Native environment.');
        return;
      }

      if (list.value) {
        const ul = list.value as HippyListElement;
        ul.scrollToIndex(0, ul.childNodes.length - 1);
      }
    };

    onMounted(() => {
      /**
       * loadMoreDataFlag is a load lock, please just copy.
       * Because onEndReach fires multiple times when it is at the bottom of the screen,
       * Therefore, a lock needs to be added, and secondary loading is not performed when the unloading is completed.
       */
      loadMoreDataFlag = false;
      fetchingDataFlag = false;
      dataSource.value = [...mockData];

      // Save the screen height, it will be used later when calculating the exposure
      $windowHeight = Native?.Dimensions
        ? Native.Dimensions.window.height
        : window.innerHeight;

      /**
       * You need to actively call collapsePullHeader to close the pullHeader,
       * otherwise the released event may not be triggered again
       */
      if (pullHeader.value) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        pullHeader.value.collapsePullHeader({ time: 2000 });
      }
    });

    return {
      loadingState,
      dataSource,
      headerRefreshText,
      footerRefreshText,
      list,
      pullHeader,
      pullFooter,
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

<style scoped>
#demo-pull-header-footer {
  flex: 1;
  padding: 12px;
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

#demo-pull-header-footer .item-style {
  background-color: white;
  padding-top: 12px;
  padding-bottom: 12px;
  border-bottom-width: 1px;
  border-bottom-color: #e5e5e5;
  border-style: solid;
}

[specital-attr='pull-header-footer'] :deep(.article-title) {
  font-size: 17px;
  line-height: 24px;
  color: #242424;
}

[specital-attr='pull-header-footer'] :deep(.normal-text) {
  font-size: 11px;
  color: #aaa;
  align-self: center;
}

[specital-attr='pull-header-footer'] :deep(.image) {
  flex: 1;
  height: 160px;
  resize-mode: cover;
}

[specital-attr='pull-header-footer'] :deep(.style-one-image-container) {
  flex-direction: row;
  justify-content: center;
  margin-top: 8px;
  flex: 1;
}

[specital-attr='pull-header-footer'] :deep(.style-one-image) {
  height: 120px;
}

[specital-attr='pull-header-footer'] :deep(.style-two) {
  flex-direction: row;
  justify-content: space-between;
}

[specital-attr='pull-header-footer'] :deep(.style-two-left-container) {
  flex: 1;
  flex-direction: column;
  justify-content: center;
  margin-right: 8px;
}

[specital-attr='pull-header-footer'] :deep(.style-two-image-container) {
  flex: 1;
}

[specital-attr='pull-header-footer'] :deep(.style-two-image) {
  height: 140px;
}

[specital-attr='pull-header-footer'] :deep(.style-five-image-container) {
  flex-direction: row;
  justify-content: center;
  margin-top: 8px;
  flex: 1;
}
</style>
