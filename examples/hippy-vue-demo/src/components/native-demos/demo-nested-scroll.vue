<template>
  <div
    id="demo-wrap"
    @layout="onLayout"
  >
    <div id="demo-content">
      <div id="banner" />
      <div id="tabs">
        <p
          v-for="n in 2"
          :key="('tab' + n)"
          :class="(currentSlide === n - 1) ? 'selected' : ''"
          @click="onTabClick(n)"
        >
          tab {{ n }} {{ n === 1 ? '(parent first)' : '(self first)' }}
        </p>
      </div>
      <swiper
        id="swiper"
        ref="swiper"
        need-animation
        :current="currentSlide"
        :style="{ height: layoutHeight - 80 }"
        @dropped="onDropped"
      >
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
          <ul nestedScrollTopPriority="self">
            <li
              v-for="n in 30"
              :key="('item' + n)"
              :class="(n % 2) ? 'item-even' : 'item-odd'"
            >
              <p>Item {{ n }}</p>
            </li>
          </ul>
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
      currentSlide: 0,
    };
  },
  methods: {
    onLayout(e) {
      this.layoutHeight = e.height;
    },
    onTabClick(i) {
      console.log('onclick', i);
      this.currentSlide = i - 1;
    },
    onDropped(e) {
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
    background-image: url('https://user-images.githubusercontent.com/12878546/148736102-7cd9525b-aceb-41c6-a905-d3156219ef16.png');
    background-size: cover;
    height: 150px;
    justify-content: flex-end;
}

#banner p {
    color: coral;
    text-align: center;
}

#tabs {
    flex-direction: row;
    height: 30px;
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
    height: 40px;
}

.item-even p {
    line-height: 40px;
    font-size: 20px;
    text-align: center;
}

.item-odd {
    height: 40px;
    background-color: gray;
}

.item-odd p {
    line-height: 40px;
    color: white;
    font-size: 20px;
    text-align: center;
}
</style>
