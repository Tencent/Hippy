<template>
  <div id="demo-list">
    <div class="toolbar">
      <button class="toolbar-btn" @click="scrollToNextPage">
        <span>翻到下一页</span>
      </button>
      <button class="toolbar-btn" @click="scrollToBottom">
        <span>翻动到底部</span>
      </button>
      <p class="toolbar-text">列表元素数量：{{ dataSource.length }}</p>
    </div>

    <!-- ul 的下拉刷新需要裹到 ul-refresh-wrapper 组件里，注意它也要全屏样式 -->
    <ul-refresh-wrapper ref="refreshWrapper" class="fullscreen" @refresh="onRefresh">
      <!-- 下拉刷新组件，可以嵌入图片 -->
      <ul-refresh class="ul-refresh">
        <p class="ul-refresh-text">{{ refreshText }}</p>
      </ul-refresh>
      <!-- numberOfRows is necessary by iOS first screen rendering -->
      <ul
        id="list"
        ref="list"
        @endReached="onEndReached"
        @scroll="onScroll"
        :numberOfRows="dataSource.length"
      >
        <li
          v-for="(ui, index) in dataSource"
          :key="index"
          :type="'row-' + ui.style"
          @layout="onItemLayout"
        >
            <style-one v-if="ui.style == 1" :itemBean="ui.itemBean" />
            <style-two v-if="ui.style == 2" :itemBean="ui.itemBean" />
            <style-five v-if="ui.style == 5" :itemBean="ui.itemBean" />
        </li>
       </ul>
    </ul-refresh-wrapper>
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

const heightOfComponents = {};

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

    // 启动时保存一下屏幕高度，一会儿算曝光时会用到
    if (Vue.Native) {
      this.$windowHeight = Vue.Native.Dimensions.window.height;
    } else {
      this.$windowHeight = window.innerHeight;
    }

    // 初始化时曝光，因为子元素加载需要时间，建议延迟 500 毫秒后执行
    setTimeout(() => this.exposureReport(0), 500);
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
    async onRefresh() {
      // 重新获取数据
      this.refreshText = '刷新数据中，请稍等3秒，完成后将自动收起';
      const dataSource = await this.mockFetchData();
      await (new Promise(resolve => setTimeout(() => resolve(), 3000)));
      this.refreshText = REFRESH_TEXT;
      this.dataSource = dataSource.reverse();
      // 注意这里需要告诉终端刷新已经结束了，否则会一直卡着。
      this.$refs.refreshWrapper.refreshCompleted();
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
    // 需要说明的是，Web 端的 overflow: scroll，滚屏时并不会触发 scroll 消息，这个方法仅针对 Native.
    onScroll(evt) {
      evt.stopPropagation(); // 这个事件触发比较频繁，最好阻止一下冒泡。
      this.scrollPos = {
        top: evt.offsetY,
        left: evt.offsetX,
      };
      // 初始化时曝光上报
      this.exposureReport(evt.offsetY);
    },
    onItemLayout(evt) {
      // 保存一下 ListItemView 尺寸的高度
      heightOfComponents[evt.target.index] = evt.top;
    },
    /**
     * 曝光上报
     * @param {number} screenTop 屏幕高度
     */
    exposureReport(screenTop) {
      // 获取可视范围内的组件
      const componentsInWindow = Object.keys(heightOfComponents).filter(
        (index) => {
          const height = heightOfComponents[index];
          return (
            screenTop <= height && screenTop + this.$windowHeight >= height
          );
        },
      );
      // 其实没有上报，只是把界面上正在曝光的组件列出来了。
      // 同时曝光锁还得业务自己做。
      console.log('Exposuring components:', componentsInWindow);
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
#demo-list {
  flex: 1;
  padding: 12px;
}

#demo-list #loading {
  font-size: 11px;
  color: #aaa;
  align-self: center;
}

#demo-list #toolbar {
  display: flex;
  height: 40px;
  flex-direction: row;
}

#demo-list .ul-refresh {
  flex: 1;
  background-color: green;
}

#demo-list .ul-refresh-text {
  flex: 1;
  color: white;
  height: 60px;
  line-height: 60px;
  text-align: center;
}

#demo-list #list {
  flex: 1;
  background-color: white;
}

#demo-list .article-title {
  font-size: 17px;
  line-height: 24px;
  color: #242424;
}

#demo-list .normal-text {
  font-size: 11px;
  color: #aaa;
  align-self: center;
}

#demo-list .image {
  flex: 1;
  height: 160px;
  resize-mode: cover;
}

#demo-list .style-one-image-container {
  flex-direction: row;
  justify-content: center;
  margin-top: 8px;
  flex: 1;
}

#demo-list .style-one-image {
  height: 120px;
}

#demo-list .style-two {
  flex-direction: row;
  justify-content: space-between;
}

#demo-list .style-two-left-container {
  flex: 1;
  flex-direction: column;
  justify-content: center;
  margin-right: 8px;
}

#demo-list .style-two-image-container {
  flex: 1;
}

#demo-list .style-two-image {
  height: 140px;
}
</style>
