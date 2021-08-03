<template>
  <div id="demo-waterfall">
    <ul-refresh-wrapper
      ref="header"
      style="flex:1;"
      @refresh="onRefresh"
    >
      <ul-refresh class="refresh-header">
        <p class="refresh-text">
          {{ refreshText }}
        </p>
      </ul-refresh>
      <waterfall
        ref="gridView"
        :column-spacing="columnSpacing"
        :contain-banner-view="isIos"
        :contain-pull-footer="true"
        :inter-item-spacing="interItemSpacing"
        :number-of-columns="numberOfColumns"
        :preload-item-number="0"
        :style="{flex: 1}"
        @endReached="onEndReached"
        @scroll="onScroll"
      >
        <div
          v-if="isIos"
          class="banner-view"
          :type="1"
        >
          <span>BannerView</span>
        </div>
        <waterfall-item
          v-for="(ui, index) in dataSource"
          :key="index"
          :style="{width: itemWidth}"
          :type="'item_' + ui.style"
          @click="() => onItemClick(index)"
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
        <pull-footer>
          <div class="pull-footer">
            <span style="color: white; text-align: center; height: 40px; line-height: 40px">{{ loadingState }}</span>
          </div>
        </pull-footer>
      </waterfall>
    </ul-refresh-wrapper>
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
      loadingState: '正在加载...',
      isLoading: false,
      isIos: Vue.Native.Platform.OS === 'ios',
    };
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
      return { top: 0, left: 0, bottom: 0, right: 0 };
    },
  },
  mounted() {
    setTimeout(() => {
      this.$refs.gridView.scrollToContentOffset({
        yOffset: 400,
        animated: true,
      });
    }, 3000);
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
        }, 1000);
      });
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
      if (this.isLoading) {
        return;
      }

      this.isLoading = true;
      this.loadingState = '正在加载...';

      const newData = await this.mockFetchData();
      if (!newData) {
        this.loadingState = '没有更多数据';
        this.isLoading = false;
        return;
      }
      this.dataSource = [...dataSource, ...newData];
      this.isLoading = false;
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
