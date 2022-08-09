<template>
  <div id="demo-list">
    <ul
      id="list"
      ref="list"
      :style="horizontal && { height: 50, flex: 0 }"
      :horizontal="horizontal"
      :exposureEventEnabled="true"
      :delText="delText"
      :editable="true"
      :bounces="true"
      :rowShouldSticky="true"
      :overScrollEnabled="true"
      :scrollEventThrottle="1000"
      @endReached="onEndReached"
      @delete="onDelete"
      @scroll="onScroll"
    >
      <li
        v-for="(ui, index) in dataSource"
        :key="`${index}_${ui.style}`"
        :class="horizontal && 'item-horizontal-style'"
        :type="ui.style"
        :sticky="index === 1"
        @appear="onAppear(index)"
        @disappear="onDisappear(index)"
        @willAppear="onWillAppear(index)"
        @willDisappear="onWillDisappear(index)"
      >
        <div
          v-if="ui.style === 1"
          class="container"
        >
          <div class="item-container">
            <p :numberOfLines="1">
              {{ `${index}: Style 1 UI` }}
            </p>
          </div>
        </div>
        <div
          v-else-if="ui.style === 2"
          class="container"
        >
          <div class="item-container">
            <p :numberOfLines="1">
              {{ `${index}: Style 2 UI` }}
            </p>
          </div>
        </div>
        <div
          v-else-if="ui.style === 5"
          class="container"
        >
          <div class="item-container">
            <p :numberOfLines="1">
              {{ `${index}: Style 5 UI` }}
            </p>
          </div>
        </div>
        <div
          v-else
          class="container"
        >
          <div class="item-container">
            <p id="loading">
              {{ loadingState }}
            </p>
          </div>
        </div>
        <div
          v-if="index !== dataSource.length - 1"
          class="separator-line"
        />
      </li>
    </ul>
    <div
      v-if="Vue.Native.Platform === 'android'"
      :style="{
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 67,
        height: 67,
        borderRadius: 30,
        boxShadowOpacity: 0.6,
        boxShadowRadius: 5,
        boxShadowOffsetX: 3,
        boxShadowOffsetY: 3,
        boxShadowColor: '#40b883' }"
      @click="changeDirection"
    >
      <div
        :style="{
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: '#40b883',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }"
      >
        <p :style="{color: 'white' }">
          切换方向
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';

const STYLE_LOADING = 100;
const mockDataArray = [
  { style: 1 },
  { style: 2 },
  { style: 5 },
  { style: 1 },
  { style: 2 },
  { style: 5 },
  { style: 1 },
  { style: 2 },
  { style: 5 },
  { style: 1 },
  { style: 2 },
  { style: 5 },
  { style: 1 },
  { style: 2 },
  { style: 5 },
  { style: 1 },
  { style: 2 },
  { style: 5 },
  { style: 1 },
  { style: 2 },
  { style: 5 },
  { style: 1 },
  { style: 2 },
  { style: 5 },
  { style: 1 },
  { style: 2 },
  { style: 5 },
  { style: 1 },
  { style: 2 },
  { style: 5 },
];

export default {
  data() {
    return {
      Vue,
      loadingState: 'Loading now...',
      dataSource: [],
      delText: 'Delete',
      horizontal: undefined,
    };
  },
  mounted() {
    // onEndReach 位于屏幕底部时会多次触发，
    // 所以需要加一个锁，当未加载完成时不进行二次加载
    this.isLoading = false;
    this.dataSource = mockDataArray;
  },
  methods: {
    changeDirection() {
      this.horizontal = this.horizontal === undefined ? true : undefined;
    },
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
        setTimeout(() => resolve(mockDataArray), 600);
      });
    },
    onDelete(event) {
      this.dataSource.splice(event.index, 1);
    },
    async onEndReached() {
      const { dataSource, isLoading } = this;
      if (isLoading) {
        return;
      }
      this.isLoading = true;
      this.dataSource = dataSource.concat([{ style: STYLE_LOADING }]);
      const newData = await this.mockFetchData();
      this.dataSource = dataSource.concat(newData);
      this.isLoading = false;
    },
    onScroll(event) {
      console.log('onScroll', event.offsetY);
      if (event.offsetY <= 0) {
        if (!this.topReached) {
          this.topReached = true;
          console.log('onTopReached');
        }
      } else {
        this.topReached = false;
      }
    },
  },
};
</script>

<style scoped>
  #demo-list {
    collapsable: false;
    flex: 1;
  }
  #demo-list #loading {
    font-size: 11px;
    color: #aaa;
    align-self: center;
  }

  #demo-list .container {
    background-color: #fff;
    collapsable: false;
  }

  #demo-list .item-container {
    padding: 12px;
  }

  #demo-list .separator-line {
    margin-left: 12px;
    margin-right: 12px;
    height: 1px;
    background-color: #e5e5e5;
  }

  /* configure li style if horizontal ul is set*/
  #demo-list .item-horizontal-style {
    height: 50px;
    width: 100px;
  }
</style>
