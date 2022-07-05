<template>
  <div id="demo-list">
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
      :horizontal="undefined"
      :numberOfRows="dataSource.length"
      :exposureEventEnabled="true"
      :delText="delText"
      :editable="true"
      :bounces="true"
      :rowShouldSticky="true"
      :overScrollEnabled="true"
      @endReached="onEndReached"
      @scroll="onScroll"
      @delete="onDelete"
    >
      <li
        v-for="(ui, index) in dataSource"
        :key="index"
        class="item-style"
        :type="ui.style"
        :sticky="index === 1"
        @appear="onAppear(index)"
        @disappear="onDisappear(index)"
        @willAppear="onWillAppear(index)"
        @willDisappear="onWillDisappear(index)"
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
    </ul>
    <p
      v-show="loadingState"
      id="loading"
    >
      {{ loadingState }}
    </p>
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
      loadingState: '',
      dataSource: [],
      scrollPos: {
        top: 0,
        left: 0,
      },
      delText: 'Delete',
      Vue,
      STYLE_LOADING,
    };
  },
  mounted() {
    // onEndReach 位于屏幕底部时会多次触发，
    // 所以需要加一个锁，当未加载完成时不进行二次加载
    this.isLoading = false;
    this.dataSource = [...mockData];
    // 启动时保存一下屏幕高度，用于计算曝光
    if (Vue.Native) {
      this.$windowHeight = Vue.Native.Dimensions.window.height;
    } else {
      this.$windowHeight = window.innerHeight;
    }
  },
  methods: {
    // item完全曝光
    onAppear(index) {
      console.log('onAppear', index);
    },
    // item完全隐藏
    onDisappear(index) {
      console.log('onDisappear', index);
    },
    // item至少一个像素曝光
    onWillAppear(index) {
      console.log('onWillAppear', index);
    },
    // item至少一个像素隐藏
    onWillDisappear(index) {
      console.log('onWillDisappear', index);
    },
    mockFetchData() {
      return new Promise((resolve) => {
        setTimeout(() => {
          this.fetchTimes += 1;
          if (this.fetchTimes >= MAX_FETCH_TIMES) {
            return resolve(null);
          }
          return resolve(mockData);
        }, 800);
      });
    },
    onDelete(event) {
      this.dataSource.splice(event.index, 1);
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
      const top = scrollPos.top + this.$windowHeight - 200; // 假定内容区域为屏幕高度 - 200
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
  #demo-list {
    flex: 1;
    padding: 12px;
  }

  #demo-list #loading {
    font-size: 11px;
    color: #aaa;
    align-self: center;
    height: 30px;
    line-height: 30px;
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

  #demo-list .style-five-image-container {
    flex-direction: row;
    justify-content: center;
    margin-top: 8px;
    flex: 1;
  }

  #demo-list .item-style {
    background-color: white;
    padding-top: 12px;
    padding-bottom: 12px;
    border-bottom-width: 1px;
    border-bottom-color: #e5e5e5;
    border-style: solid;
    /*width: 100px;*/ /* configure li style if horizontal ul is set*/
  }
</style>
