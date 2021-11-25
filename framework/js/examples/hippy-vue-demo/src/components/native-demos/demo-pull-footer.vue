<template>
  <div id="demo-pull-footer">
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

    <!-- numberOfRows is necessary by iOS first screen rendering -->
    <ul
      id="list"
      ref="list"
      :numberOfRows="dataSource.length"
      @scroll="onScroll"
    >
      <li
        v-for="(ui, index) in dataSource"
        :key="index"
        :type="'row-' + ui.style"
      >
        <style-one
          v-if="ui.style == 1"
          :item-bean="ui.itemBean"
        />
        <style-two
          v-if="ui.style == 2"
          :item-bean="ui.itemBean"
        />
        <style-five
          v-if="ui.style == 5"
          :item-bean="ui.itemBean"
        />
      </li>
      /**
      * 上拉组件
      *   > 如果不需要显示加载情况，可以直接使用 ul 的 onEndReached 实现一直加载
      *
      * 属性：
      *   sticky: 上拉后保持显示，在执行 collapsePullFooter 后收起
      *
      * 事件：
      *   idle: 滑动距离在 pull-footer 区域内触发一次，参数 contentOffset，滑动距离
      *   pulling: 滑动距离超出 pull-footer 后触发一次，参数 contentOffset，滑动距离
      *   refresh: 滑动超出距离，松手后触发一次
      */
      <pull-footer
        ref="pullFooter"
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

<script>
import Vue from 'vue';
import mockData from '../list-items/mock';
import '../list-items';

const STYLE_LOADING = 100;
const MAX_FETCH_TIMES = 50;
const REFRESH_TEXT = '继续上拉后松手，将会加载更多';

export default {
  data() {
    return {
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
    if (Vue.Native) {
      this.$windowHeight = Vue.Native.Dimensions.window.height;
    } else {
      this.$windowHeight = window.innerHeight;
    }
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
        }, 3000);
      });
    },
    onIdle() {
      this.refreshText = REFRESH_TEXT;
    },
    onPulling() {
      this.refreshText = '松手即可加载更多';
    },
    async onEndReached() {
      const { dataSource } = this;
      // 检查锁，如果在加载中，则直接返回，防止二次加载数据
      if (this.isLoading) {
        return;
      }

      this.isLoading = true;

      const newData = await this.mockFetchData();
      if (!newData) {
        this.isLoading = false;
        return;
      }

      this.dataSource = [...dataSource, ...newData];
      this.isLoading = false;
      this.$refs.pullFooter.collapsePullFooter();
    },
    onScroll(evt) {
      evt.stopPropagation(); // 这个事件触发比较频繁，最好阻止一下冒泡。
      this.scrollPos = {
        top: evt.offsetY,
        left: evt.offsetX,
      };
    },
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
