<template>
  <div id="demo-pull-header">
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
      ref="list"
      @endReached="onEndReached"
      :numberOfRows="dataSource.length"
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
        @idle="onIdle"
        @pulling="onPulling"
        @released="onRefresh"
      >
        <p class="ul-refresh-text">{{ refreshText }}</p>
      </pull-header>
      <li
        v-for="(ui, index) in dataSource"
        :key="index"
        :type="'row-' + ui.style"
      >
        <style-one v-if="ui.style == 1" :itemBean="ui.itemBean" />
        <style-two v-if="ui.style == 2" :itemBean="ui.itemBean" />
        <style-five v-if="ui.style == 5" :itemBean="ui.itemBean" />
      </li>
    </ul>
    <p id="loading" v-show="loadingState">{{ loadingState }}</p>
  </div>
</template>

<script>
import Vue from 'vue';
import mockData from '../list-items/mock';
import '../list-items';

const STYLE_LOADING = 100;
const MAX_FETCH_TIMES = 50;
const REFRESH_TEXT = '下拉后放开，将会刷新';

export default {
  data() {
    return {
      loadingState: '',
      refreshText: REFRESH_TEXT,
      dataSource: [],
      scrollPos: {
        top: 0,
        left: 0,
      },
      Vue,
      STYLE_LOADING,
    };
  },
  mounted() {
    // *** isLoading 是加载锁，业务请照抄 ***
    // 因为 onEndReach 位于屏幕底部时会多次触发，
    // 所以需要加一个锁，当未加载完成时不进行二次加载
    this.isLoading = false;
    this.dataSource = [...mockData];
  },
  methods: {
    mockFetchData() {
      return new Promise((resolve) => {
        setTimeout(() => {
          this.fetchTimes += 1;
          if (this.fetchTimes >= MAX_FETCH_TIMES) {
            return resolve(null);
          }
          return resolve(mockData);
        }, 300);
      });
    },
    onIdle() {
      this.refreshText = REFRESH_TEXT;
    },
    onPulling() {
      this.refreshText = '松手即可进行刷新';
    },
    async onRefresh() {
      // 重新获取数据
      this.refreshText = '刷新数据中，请稍等3秒，完成后将自动收起';
      const dataSource = await this.mockFetchData();
      await (new Promise(resolve => setTimeout(() => resolve(), 3000)));
      this.refreshText = REFRESH_TEXT;
      this.dataSource = dataSource.reverse();
      // 注意这里需要告诉终端刷新已经结束了，否则会一直卡着。
      this.$refs.pullHeader.collapsePullHeader();
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

      this.loadingState = '';
      this.dataSource = [...dataSource, ...newData];
      this.isLoading = false;
    },
    /**
     * 翻到下一页
     */
    scrollToNextPage() {
      // 因为布局问题，浏览器内 flex: 1 后也会超出窗口尺寸高度，所以这么滚是不行的。
      if (!Vue.Native) {
        /* eslint-disable-next-line no-alert */
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
      }); // 其实 scrollPost.left 写 0 也可以。
    },
    /**
     * 滚动到底部
     */
    scrollToBottom() {
      if (!Vue.Native) {
        /* eslint-disable-next-line no-alert */
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
#demo-pull-header {
  flex: 1;
  padding: 12px;
}

#demo-pull-header #loading {
  font-size: 11px;
  color: #aaa;
  align-self: center;
}

#demo-pull-header #toolbar {
  display: flex;
  height: 40px;
  flex-direction: row;
}

#demo-pull-header .ul-refresh {
  background-color: green;
}

#demo-pull-header .ul-refresh-text {
  color: white;
  height: 60px;
  line-height: 60px;
  text-align: center;
}

#demo-pull-header #list {
  flex: 1;
  background-color: white;
}

#demo-pull-header .article-title {
  font-size: 17px;
  line-height: 24px;
  color: #242424;
}

#demo-pull-header .normal-text {
  font-size: 11px;
  color: #aaa;
  align-self: center;
}

#demo-pull-header .image {
  flex: 1;
  height: 160px;
  resize-mode: cover;
}

#demo-pull-header .style-one-image-container {
  flex-direction: row;
  justify-content: center;
  margin-top: 8px;
  flex: 1;
}

#demo-pull-header .style-one-image {
  height: 120px;
}

#demo-pull-header .style-two {
  flex-direction: row;
  justify-content: space-between;
}

#demo-pull-header .style-two-left-container {
  flex: 1;
  flex-direction: column;
  justify-content: center;
  margin-right: 8px;
}

#demo-pull-header .style-two-image-container {
  flex: 1;
}

#demo-pull-header .style-two-image {
  height: 140px;
}
</style>
