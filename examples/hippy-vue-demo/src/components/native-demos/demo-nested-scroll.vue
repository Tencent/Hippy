<template>
  <div
    id="demo-wrap"
    scrollEventThrottle="50"
    @layout="onlayout"
    @scroll="onscroll"
  >
    <div id="demo-content">
      <div id="banner">
        <p :style="{ height: bannerHeight, 'font-size': bannerHeight, }">
          Banner
        </p>
      </div>
      <div id="tabs">
        <p
          v-for="n in 2"
          :key="('tab' + n)"
          :class="(currentSlide === n - 1) ? 'selected' : ''"
          @click="ontabclick(n)"
        >
          tab {{ n }}
        </p>
      </div>
      <swiper
        id="swiper"
        ref="swiper"
        need-animation
        :current="currentSlide"
        :style="{ height: layoutHeight - 80 }"
        @dropped="ondropped"
      >
        <!-- slides -->
        <swiper-slide key="slide1">
          <ul nestedScrollTopPriority="parent">
            <li
              v-for="n in 30"
              :key="('item' + n)"
              :class="(n % 2) ? 'item-even' : 'item-odd'"
            >
              <p>Item {{ n }}</p>
            </li>
          </ul>
        </swiper-slide>
        <swiper-slide key="slide2">
          <div style="flex: 1; justify-content: space-around">
            <p style="text-align: center">
              I'm Slide 2
            </p>
          </div>
        </swiper-slide>
      </swiper>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      layoutHeight: 0,
      bannerHeight: 80,
      currentSlide: 0,
    };
  },
  methods: {
    onlayout(e) {
      this.layoutHeight = e.height;
    },
    onscroll(e) {
      this.bannerHeight = Math.min(150 - e.offsetY, 80);
    },
    ontabclick(i) {
      console.log('onclick', i);
      this.currentSlide = i - 1;
    },
    ondropped(e) {
      this.currentSlide = e.currentSlide;
    },
  },
};
</script>

<style scoped>
#demo-wrap {
    overflow-y: scroll;
    flex: 1;
}

#demo-content {
    flex-direction: column;
}

#banner {
    background-image: url(https://user-images.githubusercontent.com/12878546/148736102-7cd9525b-aceb-41c6-a905-d3156219ef16.png);
    background-size: cover;
    height: 150;
    justify-content: flex-end;
}

#banner p {
    color: coral;
    text-align: center;
}

#tabs {
    flex-direction: row;
    height: 30;
}

#tabs p {
    flex: 1;
    text-align: center;
    background-color: #eee;
}

#tabs .selected {
    background-color: white;
    color: #40b883;
}

.item-even {
    height: 40;
}

.item-even p {
    line-height: 40;
    font-size: 25;
    text-align: center;
}

.item-odd {
    height: 40;
    background-color: gray;
}

.item-odd p {
    line-height: 40;
    color: white;
    font-size: 25;
    text-align: center;
}
</style>
