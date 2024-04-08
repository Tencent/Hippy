<template>
  <div id="demo-waterfall">
      <waterfall
        ref="gridView"
        :content-inset="contentInset"
        :column-spacing="columnSpacing"
        :contain-banner-view="isIos"
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
          :fullSpan="true",
          class="banner-view"
        >
          <span>BannerView</span>
        </waterfall-item>
        <waterfall-item
          v-for="(ui, index) in dataSource"
          :key="index"
          :style="{width: itemWidth}"
          :type="ui.style"
          @click.stop="() => onItemClick(index)"
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

<script>
import Vue from 'vue';
import mockData from '../list-items/mock';
import '../list-items';

const STYLE_LOADING = 100;
const MAX_FETCH_TIMES = 50;

export default {
  data() {
    return {
      dataSource: [...mockData, ...mockData, ...mockData, ...mockData],
      isRefreshing: false,
      Vue,
      STYLE_LOADING,
      headerRefreshText: '继续下拉触发刷新',
      footerRefreshText: '正在加载...',
      isLoading: false,
      isIos: Vue.Native.Platform === 'ios',
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
  computed: {
    refreshText() {
      return this.isRefreshing ? '正在刷新' : '下拉刷新';
    },
    itemWidth() {
      const screenWidth = Vue.Native.Dimensions.screen.width;
      const width = screenWidth - this.contentInset.left - this.contentInset.right;
      return (width - ((this.numberOfColumns - 1) * this.columnSpacing)) / this.numberOfColumns;
    },
    listMargin() {
      return 5;
    },
    columnSpacing() {
      return 6;
    },
    interItemSpacing() {
      return 6;
    },
    numberOfColumns() {
      return 2;
    },
    contentInset() {
      return { top: 0, left: 5, bottom: 0, right: 5 };
    },
  },
  methods: {
    mockFetchData() {
      return new Promise((resolve) => {
        setTimeout(() => {
          this.fetchTimes += 1;
          if (this.fetchTimes >= MAX_FETCH_TIMES) {
            return resolve([]);
          }
          return resolve([...mockData, ...mockData]);
        }, 600);
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
    async onHeaderReleased() {
      if (this.fetchingDataFlag) {
        return;
      }
      this.fetchingDataFlag = true;
      console.log('onHeaderReleased');
      this.headerRefreshText = '刷新数据中，请稍等';
      const dataSource = await this.mockFetchData();
      this.fetchingDataFlag = false;
      this.headerRefreshText = '2秒后收起';
      // 要主动调用collapsePullHeader关闭pullHeader，否则可能会导致released事件不能再次触发
      this.$refs.pullHeader.collapsePullHeader({ time: 2000 });
    },
    async onRefresh() {
      // 重新获取数据
      this.isRefreshing = true;
      const dataSource = await this.mockFetchData();
      this.isRefreshing = false;
      this.dataSource = dataSource.reverse();
      this.$refs.header.refreshCompleted();
    },
    onScroll(evt) {
      console.log('waterfall onScroll', evt);
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

    onItemClick(index) {
      this.$refs.gridView.scrollToIndex({ index, animation: true });
    },
  },
};
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
  background-color: #40b883;
}

</style>
