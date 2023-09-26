<template>
  <div id="demo-swiper">
    <div class="toolbar">
      <button
        class="toolbar-btn"
        @click="scrollToPrevPage"
      >
        <span>翻到上一页</span>
      </button>
      <button
        class="toolbar-btn"
        @click="scrollToNextPage"
      >
        <span>翻到下一页</span>
      </button>
      <p class="toolbar-text">
        当前第 {{ currentSlideNum + 1 }} 页
      </p>
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
        :style="{ backgroundColor: 4278222848 + 100 * n }"
      >
        <p>I'm Slide {{ n + 1 }}</p>
      </swiper-slide>
    </swiper>
    <!-- A Demo of dots -->
    <div id="swiper-dots">
      <div
        v-for="n in dataSource"
        :key="n"
        class="dot"
        :class="{ hightlight: currentSlideNum === n }"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/runtime-core';

const max = 7;

export default defineComponent({
  setup() {
    // current state
    const state = ref('idle');
    // the index of the currently displayed slide
    const currentSlide = ref(2);
    /**
     * Because the communication performance of the Android is limited,
     * if the dropped event is clicked quickly, it will be triggered multiple times,
     * causes a push-pull effect similar to a drawer.
     * So here is a separate variable to save the value currently being displayed,
     * to distinguish it from the value of currentSlide
     */
    const currentSlideNum = ref(2);

    /**
       * scroll to next page
       */
    const scrollToNextPage = () => {
      console.log('scroll next', currentSlide.value, currentSlideNum.value);
      if (currentSlide.value < max) {
        currentSlide.value = currentSlideNum.value + 1;
      } else {
        currentSlide.value = 0;
      }
    };

    /**
       * scroll to previous page
       */
    const scrollToPrevPage = () => {
      console.log('scroll prev', currentSlide.value, currentSlideNum.value);
      if (currentSlide.value === 0) {
        currentSlide.value = max - 1;
      } else {
        currentSlide.value = currentSlideNum.value - 1;
      }
    };

    /**
       * dragging
       *
       * @param evt
       */
    const onDragging = (evt) => {
      /**
       * FIXME: There is a bug in this event on Android,
       * scrolling back nextSlide is still the current index, scrolling forward is normal
       */
      /* eslint-disable-next-line no-console */
      console.log(
        'Current offset is',
        evt.offset,
        'and will into slide',
        evt.nextSlide + 1,
      );
    };
    const onDropped = (evt) => {
      console.log('onDropped', evt);
      // update current page number
      currentSlideNum.value = evt.currentSlide;
    };
    const onStateChanged = (evt) => {
      console.log('onStateChanged', evt);
      // update state
      state.value = evt.state;
    };

    return {
      /**
       * If it is dynamically loaded data, it is recommended to add v-if to the <swiper>
       *   to judge that the data is loaded before rendering.
       */
      dataSource: new Array(max).fill(0)
        .map((n, i) => i),
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

#demo-swiper .dot.hightlight {
  background-color: limegreen;
}
</style>
