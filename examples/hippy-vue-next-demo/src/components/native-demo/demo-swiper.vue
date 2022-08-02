<template>
  <div id="demo-swiper">
    <div class="toolbar">
      <button class="toolbar-btn" @click="scrollToPrevPage">
        <span>翻到上一页</span>
      </button>
      <button class="toolbar-btn" @click="scrollToNextPage">
        <span>翻到下一页</span>
      </button>
      <p class="toolbar-text">当前第 {{ currentSlideNum + 1 }} 页</p>
    </div>
    <!--
      swiper 组件参数
      @param {Number} currentSlide 当前页面，也可以直接修改它改变当前页码，默认 0
      @param {Boolean} needAnimation 是否需要动画，如果切换时不要动画可以设置为 :needAnimation="false"，默认为 true
      @param {Function} dragging 当拖拽时执行回调，参数是个 Event，包含 offset 拖拽偏移值和 nextSlide 将进入的页码
      @param {Function} dropped 结束拖拽时回调，参数是个 Event，包含 currentSlide 最后选择的页码
    -->
    <swiper
      id="swiper"
      ref="swiper"
      need-animation
      :current="currentSlide"
      @dragging="onDragging"
      @dropped="onDropped"
      @stateChanged="onStateChanged"
    >
      <!-- slides -->
      <swiper-slide
        v-for="n in dataSource"
        :key="n"
        :style="{ backgroundColor: 4278222848 + 100 }"
      >
        <p>I'm Slide {{ n + 1 }}</p>
      </swiper-slide>
    </swiper>
    <!-- 一个放小点的范例 -->
    <div id="swiper-dots">
      <div
        v-for="n in dataSource"
        :key="n"
        class="dot"
        :class="{ highlight: currentSlideNum === n }"
      />
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref } from '@vue/runtime-core';

  import { warn } from '../../util';

  const max = 7;

  export default defineComponent({
    setup() {
      // 当前状态
      const state = ref('idle');
      // 当前展示的 slide 的索引
      const currentSlide = ref(2);
      // 因为 Android 终端的通讯性能限制，导致如果快速点击时 dropped 事件会发很多次，导致 swiper-slider 发生推拉抽屉的现象
      // 所以这里单独做个变量，保存当前正在显示的值，跟 currentSlide 的值做个区分，避免推拉现象。
      const currentSlideNum = ref(2);

      /**
       * 滚至下一页
       */
      const scrollToNextPage = () => {
        warn('scroll next', currentSlide.value, currentSlideNum.value);
        if (currentSlide.value < max) {
          currentSlide.value = currentSlideNum.value + 1;
        } else {
          currentSlide.value = 0;
        }
      };

      /**
       * 滚至上一页
       */
      const scrollToPrevPage = () => {
        warn('scroll prev', currentSlide.value, currentSlideNum.value);
        if (currentSlide.value === 0) {
          currentSlide.value = max - 1;
        } else {
          currentSlide.value = currentSlideNum.value - 1;
        }
      };

      /**
       * 拖动
       *
       * @param evt
       */
      const onDragging = (evt) => {
        // FIXME: Android 该事件存在 bug，往后翻 nextSlide 依然是当前的 index，往前翻正常。
        /* eslint-disable-next-line no-console */
        warn(
          'Current offset is',
          evt.offset,
          'and will into slide',
          evt.nextSlide + 1,
        );
      };
      const onDropped = (evt) => {
        warn('onDropped', evt);
        // 更细当前页码
        currentSlideNum.value = evt.currentSlide;
      };
      const onStateChanged = (evt) => {
        warn('onStateChanged', evt);
        // 更新当前滚屏状态
        state.value = evt.state;
      };

      return {
        // 假数据，7 是页数，页数初始化成功后不可更改。
        // 所以如果是动态加载的数据，建议再 <swiper> 上加上 v-if 判断数据加载完成之后再进行渲染。
        dataSource: new Array(max).fill(0).map((n, i) => i),
        currentSlide,
        currentSlideNum,
        state,
        scrollToNextPage,
        scrollToPrevPage,
        onDragging,
        onDropped,
        onStateChanged,
      };
    },
  });
</script>

<style>
  #demo-swiper {
    flex: 1;
  }

  #demo-swiper #swiper {
    flex: 1;
    height: 400px;
  }

  #demo-swiper #swiper-dots {
    flex-direction: row;
    align-items: center;
    justify-content: center;
    height: 40px;
  }

  #demo-swiper .dot {
    width: 10px;
    height: 10px;
    border-radius: 5px;
    background-color: darkgray;
    margin-left: 5px;
    margin-right: 5px;
  }

  #demo-swiper .dot.highlight {
    background-color: limegreen;
  }
</style>
