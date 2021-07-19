<template>
  <div class="set-native-props-demo">
    <label>setNativeProps实现拖动效果</label>
    <div class="native-demo-1-drag"
         :style="{width: this.screenWidth}"
         @touchstart="onTouchDown1"
         @touchmove="onTouchMove1">
      <div ref='demo-1-point' class="native-demo-1-point"></div>
    </div>
    <div class="splitter"></div>
    <label>普通渲染实现拖动效果</label>
    <div class="native-demo-2-drag"
         :style="{width: this.screenWidth}"
         @touchstart="onTouchDown2"
         @touchmove="onTouchMove2">
      <div ref='demo-2-point' class="native-demo-2-point" :style="{left: demon2Left + 'px'}"></div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';

export default {
  methods: {
    onTouchDown1(evt) {
      evt.stopPropagation();
      const position = evt.touches[0].clientX - 40;
      /* eslint-disable-next-line no-console */
      console.log('touchdown x', position, this.screenWidth);
      this.demon1Point.setNativeProps({
        style: {
          left: position,
        },
      });
    },
    onTouchMove1(evt) {
      evt.stopPropagation();
      const position = evt.touches[0].clientX - 40;
      /* eslint-disable-next-line no-console */
      console.log('touchmove x', position, this.screenWidth);
      this.demon1Point.setNativeProps({
        style: {
          left: position,
        },
      });
    },
    onTouchDown2(evt) {
      evt.stopPropagation();
      this.demon2Left = evt.touches[0].clientX - 40;
      /* eslint-disable-next-line no-console */
      console.log('touchdown x', this.demon2Left, this.screenWidth);
    },
    onTouchMove2(evt) {
      evt.stopPropagation();
      this.demon2Left = evt.touches[0].clientX - 40;
      /* eslint-disable-next-line no-console */
      console.log('touchmove x', this.demon2Left, this.screenWidth);
    },
  },
  data() {
    return {
      demon2Left: 0,
      screenWidth: 0,
    };
  },
  mounted() {
    this.screenWidth = Vue.Native.Dimensions.screen.width;
    this.demon1Point = this.$refs['demo-1-point'];
  },
};
</script>

<style scope>
  .set-native-props-demo {
    display: flex;
    align-items: center;
    position: relative;
  }
  .native-demo-1-drag {
    height: 80px;
    background-color: #4c9afa;
    position: relative;
    marginTop: 10px
  }
  .native-demo-1-point {
    height: 80px;
    width: 80px;
    color: #ff0000;
    background-color: #ff0000;
    position: absolute;
    left: 0;
  }
  .native-demo-2-drag {
    height: 80px;
    background-color: #4c9afa;
    position: relative;
    marginTop: 10px;
  }
  .native-demo-2-point {
    height: 80px;
    width: 80px;
    color: #ff0000;
    background-color: #ff0000;
    position: absolute;
    left: 0;
  }
  .splitter{
    marginTop: 50px;
  }
</style>
