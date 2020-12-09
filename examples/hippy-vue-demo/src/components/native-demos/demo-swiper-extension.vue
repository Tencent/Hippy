<template>
  <div id="demo-swiper">
    <div class="toolbar">
      <button class="toolbar-btn" @click="scrollToPrevPage">
        <span>翻到上一页</span>
      </button>
      <button class="toolbar-btn" @click="scrollToNextPage">
        <span>翻到下一页</span>
      </button>
      <p class="toolbar-text">当前第 {{ currentSlideNum + 1 }} 页，</p>
      <p class="toolbar-text">滚屏状态：{{ state }}</p>
    </div>
    <!--
      swiper 组件参数
      @param {Number} currentSlide 当前页面，也可以直接修改它改变当前页码，默认 0
      @param {Boolean} needAnimation 是否需要动画，如果切换时不要动画可以设置为 :needAnimation="false"，默认为 true
      @param {Boolean} loop 是否需要循环滚动。默认为false。
      @param {Function} dragging 当拖拽时执行回调，参数是个 Event，包含 offset 拖拽偏移值和 nextSlide 将进入的页码
      @param {Function} dropped 结束拖拽时回调，参数是个 Event，包含 currentSlide 最后选择的页码
    -->
    <swiper
      id="swiper"
      ref="swiper"
      needAnimation
      :current="currentSlide"
      :loop="loop"
      :pageSize="pageSize"
      :middlePageOffset="middlePageOffset"
      @dragging="onDragging"
      @dropped="onDropped"
      @stateChanged="onStateChanged">
      <!-- slides -->
      <swiper-slide
        v-for="n in dataSource"
        :key="n"
        :style="{backgroundColor: 4278222848 + 100 * n}"
      >
        <p>I'm Slide {{ n + 1 }}</p>
      </swiper-slide>
    </swiper>
    <!-- 一个放小点的范例 -->
    <div id="swiper-dots">
      <div
        class="dot"
        v-for="n in dataSource"
        :key="n"
        :class="{hightlight: currentSlideNum === n}"
      />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 假数据，7 是页数，页数初始化成功后不可更改。
      // 所以如果是动态加载的数据，建议再 <swiper> 上加上 v-if 判断数据加载完成之后再进行渲染。
      dataSource: (new Array(7)).fill(0).map((n, i) => i),

      // 初始化时 swiper 显示第几个 slide，通过改变它可以改变 swiper 的显示 slide
      // IMPORTANT: 需要注意一点，数据驱动可能会因为 Vue 的内部机制导致性能比较差。
      //            这时候可以给 swiper 加一个 ref，然后用 this.$refs.setSlide(currentSlide)
      //            或者不带动画的 this.$refs.setSlideWithoutAnimation(currentSlide)
      //            来切换页面，性能会好很多。
      currentSlide: 2,

      // 因为 Android 终端的通讯性能限制，导致如果快速点击时 dropped 事件会发很多次，导致 swiper-slider 发生推拉抽屉的现象
      // 所以这里单独做个变量，保存当前正在显示的值，跟 currentSlide 的值做个区分，避免推拉现象。
      currentSlideNum: 2,
      // 实际的页码数
      exactCurrentSlideNum: 2,

      // 设置默认滚屏状态
      state: 'idle',
      // swiper的页数一旦初始化后无法修改，而loop功能基于倍数修改页数来实现
      // 故初始化时就需要确定是否需要循环滚动功能，如果在运行中修改了loop则需要重建Swiper
      loop: true,
      // 用于指定每个page相对于屏幕宽度的百分比（取值范围：0.0~1.0）
      pageSize: 0.75,
      // 用于指定每个page相对于屏幕左边缘的偏移量
      middlePageOffset: 25.0,
    };
  },
  mounted() {
    this.$maxSlideIndex = this.$refs.swiper.$el.childNodes.length - 1;
  },
  methods: {
    scrollToNextPage() {
      this.currentSlide = this.exactCurrentSlideNum + 1;
    },
    scrollToPrevPage() {
      this.currentSlide = this.exactCurrentSlideNum - 1;
    },
    onDragging(evt) {
      // FIXME: Android 该事件存在 bug，往后翻 nextSlide 依然是当前的 index，往前翻正常。
      // Android端的滚动事件与iOS端不同，向后翻页时nextSlide先不变，而是offset递增;
      // 在offset增加的1.0时进位，此时nextSlide+1，offset变为0，翻页完成。
      // 向前翻页时，offset先向nextSlide借位变为1.0，此时nextSlide-1，随着滚动offset递减
      // 在offset递减到0.0时，翻页完成。
      /* eslint-disable-next-line no-console */
      console.log('Current offset is', evt.offset, 'and will into slide', evt.nextSlide + 1);
    },
    onDropped(evt) {
      // 更细当前页码
      this.currentSlideNum = evt.currentSlide % 7;
      this.exactCurrentSlideNum = evt.currentSlide;
      console.log('===>onDropped:', evt, evt.currentSlide);
    },
    onStateChanged(evt) {
      // 更新当前滚屏状态
      this.state = evt.state;
    },
  },
};
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
  background-color: limegreen
}
</style>
