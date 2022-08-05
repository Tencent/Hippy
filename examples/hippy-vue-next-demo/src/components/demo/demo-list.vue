<template>
  <div id="demo-list">
    <ul
      id="list"
      ref="listRef"
      :style="horizontal && { height: 50, flex: 0 }"
      :horizontal="horizontal"
      :exposureEventEnabled="true"
      :delText="delText"
      :editable="true"
      :bounces="true"
      :rowShouldSticky="true"
      :overScrollEnabled="true"
      @endReached="onEndReached"
      @delete="onDelete"
    >
      <li
        v-for="(ui, index) in dataSource"
        :key="index"
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
      v-if="isAndroid"
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
        boxShadowColor: '#40b883',
      }"
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
        <p :style="{ color: 'white' }">
          切换方向
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { type HippyEvent, Native } from '@hippy/vue-next';
import { defineComponent, ref, onMounted, type Ref } from '@vue/runtime-core';

import { warn } from '../../util';

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

/**
   * 获取 mock 数据
   */
const mockFetchData = async () => new Promise((resolve) => {
  setTimeout(() => resolve(mockDataArray), 600);
});

// item fully exposed
const onAppear = (index: number) => {
  warn('onAppear', index);
};
  // item is completely hidden
const onDisappear = (index: number) => {
  warn('onDisappear', index);
};
  // item at least one pixel exposure
const onWillAppear = (index: number) => {
  warn('onWillAppear', index);
};
  // item is hidden by at least one pixel
const onWillDisappear = (index: number) => {
  warn('onWillDisappear', index);
};

export default defineComponent({
  setup() {
    const loadingState = ref('');
    const dataSource: Ref<any[]> = ref([]);
    const listRef = ref(null);
    const horizontal = ref(false);
    const delText = 'Delete';
    let isLoading = false;

    /**
       * scroll to the end of the list, trigger the event, you can load the next page
       *
       * @param evt
       */
    const onEndReached = async (evt) => {
      warn('endReached', evt);

      if (isLoading) {
        return;
      }

      isLoading = true;
      loadingState.value = '正在加载...';
      // 获取数据
      const newData: any = await mockFetchData();
      dataSource.value = [...dataSource.value, ...newData];
      // 请求解锁
      isLoading = false;
    };

    /**
       * delete data
       */
    const onDelete = (event: HippyEvent) => {
      if (typeof event.index !== 'undefined') {
        dataSource.value.splice(event.index, 1);
      }
    };

    /**
       * change direction
       */
    const changeDirection = () => {
      horizontal.value = !horizontal.value;
    };

    onMounted(() => {
      /**
       * isLoading is a loading lock, just copy
       * onEndReach fires multiple times when at the bottom of the screen,
       * so a lock needs to be added, and secondary loading is not performed when the unloading is completed.
       */
      isLoading = false;
      dataSource.value = [...mockDataArray];
    });

    return {
      loadingState,
      dataSource,
      delText,
      listRef,
      STYLE_LOADING,
      horizontal,
      isAndroid: Native.isAndroid(),
      onAppear,
      onDelete,
      onDisappear,
      onEndReached,
      onWillAppear,
      onWillDisappear,
      changeDirection,
    };
  },
});
</script>

<style>
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
