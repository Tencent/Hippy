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

<script>
import Vue from 'vue';
import mockData from '../list-items/mock';
import '../list-items';

export default {
  data() {
    return {
      headerRefreshText: '继续下拉触发刷新',
      footerRefreshText: '正在加载...',
      dataSource: [],
      scrollPos: {
        top: 0,
        left: 0,
      },
      Vue,
    };
  },
  mounted() {
    // *** loadMoreDataFlag 是加载锁，业务请照抄 ***
    // 因为 onEndReach 位于屏幕底部时会多次触发，
    // 所以需要加一个锁，当未加载完成时不进行二次加载
    this.loadMoreDataFlag = false;
    this.fetchingDataFlag = false;
    this.dataSource = [...mockData];
    if (Vue.Native) {
      this.$windowHeight = Vue.Native.Dimensions.window.height;
      console.log('Vue.Native.Dimensions.window', Vue.Native.Dimensions);
    } else {
      this.$windowHeight = window.innerHeight;
    }
    this.$refs.pullHeader.collapsePullHeader({ time: 2000 });
  },
  methods: {
    mockFetchData() {
      return new Promise((resolve) => {
        setTimeout(() => resolve(mockData), 800);
      });
    },
    onHeaderPulling(evt) {
      if (this.fetchingDataFlag) {
        return;
      }
      console.log('onHeaderPulling', evt.contentOffset);
      if (evt.contentOffset > 30) {
        this.headerRefreshText = '松手，即可触发刷新';
      } else {
        this.headerRefreshText = '继续下拉，触发刷新';
      }
    },
    onFooterPulling(evt) {
      console.log('onFooterPulling', evt);
    },
    onHeaderIdle() {},
    onFooterIdle() {},
    onScroll(evt) {
      evt.stopPropagation();
      this.scrollPos = {
        top: evt.offsetY,
        left: evt.offsetX,
      };
    },
    async onHeaderReleased() {
      if (this.fetchingDataFlag) {
        return;
      }
      this.fetchingDataFlag = true;
      console.log('onHeaderReleased');
      this.headerRefreshText = '刷新数据中，请稍等';
      const dataSource = await this.mockFetchData();
      this.dataSource = dataSource.reverse();
      this.fetchingDataFlag = false;
      this.headerRefreshText = '2秒后收起';
      // 要主动调用collapsePullHeader关闭pullHeader，否则可能会导致released事件不能再次触发
      this.$refs.pullHeader.collapsePullHeader({ time: 2000 });
    },
    async onEndReached() {
      const { dataSource } = this;
      // 检查锁，如果在加载中，则直接返回，防止二次加载数据
      if (this.loadMoreDataFlag) {
        return;
      }
      this.loadMoreDataFlag = true;
      this.footerRefreshText = '加载更多...';
      const newData = await this.mockFetchData();
      if (newData.length === 0) {
        this.footerRefreshText = '没有更多数据';
      }
      this.dataSource = [...dataSource, ...newData];
      this.loadMoreDataFlag = false;
      this.$refs.pullFooter.collapsePullFooter();
    },
    /**
     * 翻到下一页
     */
    scrollToNextPage() {
      // 因为布局问题，浏览器内 flex: 1 后也会超出窗口尺寸高度，所以这么滚是不行的。
      if (!Vue.Native) {
        alert('This method is only supported in Native environment.');
        return;
      }
      const { list } = this.$refs;
      const { scrollPos } = this;
      const top = scrollPos.top + this.$windowHeight - 200; // 偷懒假定内容区域为屏幕高度 - 200
      // CSSOM View standard - ScrollToOptions
      // https://www.w3.org/TR/cssom-view-1/#extensions-to-the-window-interface
      list.scrollTo({
        left: scrollPos.left,
        top,
      });
    },
    /**
     * 滚动到底部
     */
    scrollToBottom() {
      if (!Vue.Native) {
        alert('This method is only supported in Native environment.');
        return;
      }
      const { list } = this.$refs;
      list.scrollToIndex(0, list.childNodes.length - 1);
    },
  },
};
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

[specital-attr='pull-header-footer'] .article-title {
  font-size: 17px;
  line-height: 24px;
  color: #242424;
}

[specital-attr='pull-header-footer'] .normal-text {
  font-size: 11px;
  color: #aaa;
  align-self: center;
}

[specital-attr='pull-header-footer'] .image {
  flex: 1;
  height: 160px;
  resize-mode: cover;
}

[specital-attr='pull-header-footer'] .style-one-image-container {
  flex-direction: row;
  justify-content: center;
  margin-top: 8px;
  flex: 1;
}

[specital-attr='pull-header-footer'] .style-one-image {
  height: 120px;
}

[specital-attr='pull-header-footer'] .style-two {
  flex-direction: row;
  justify-content: space-between;
}

[specital-attr='pull-header-footer'] .style-two-left-container {
  flex: 1;
  flex-direction: column;
  justify-content: center;
  margin-right: 8px;
}

[specital-attr='pull-header-footer'] .style-two-image-container {
  flex: 1;
}

[specital-attr='pull-header-footer'] .style-two-image {
  height: 140px;
}

[specital-attr='pull-header-footer'] .style-five-image-container {
  flex-direction: row;
  justify-content: center;
  margin-top: 8px;
  flex: 1;
}

</style>
