<template>
  <div class="set-native-props-demo">
    <label>setNativeProps实现拖动效果</label>
    <div
      class="native-demo-1-drag"
      :style="{ width: screenWidth }"
      @touchstart.stop="onTouchDown1"
      @touchmove.stop="onTouchMove1"
    >
      <div
        ref="demoOnePointRef"
        class="native-demo-1-point"
      />
    </div>
    <div class="splitter" />
    <label>普通渲染实现拖动效果</label>
    <div
      class="native-demo-2-drag"
      :style="{ width: screenWidth }"
      @touchstart.stop="onTouchDown2"
      @touchmove.stop="onTouchMove2"
    >
      <div
        class="native-demo-2-point"
        :style="{ left: demon2Left + 'px' }"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { type HippyElement } from '@hippy/vue-next';
import { defineComponent, ref } from '@vue/runtime-core';
import { getScreenSize } from '../../util';

export default defineComponent({
  setup() {
    const demoOnePointRef = ref(null);
    const demon2Left = ref(0);
    const screenWidth = ref(getScreenSize().width);

    const onTouchDown1 = (evt) => {
      const position = evt.touches[0].clientX - 40;
      console.log('touchdown x', position, screenWidth.value);
      if (demoOnePointRef.value) {
        (demoOnePointRef.value as HippyElement).setNativeProps({
          style: {
            left: position,
          },
        });
      }
    };
    const onTouchMove1 = (evt) => {
      const position = evt.touches[0].clientX - 40;
      console.log('touchmove x', position, screenWidth.value);
      if (demoOnePointRef.value) {
        (demoOnePointRef.value as HippyElement).setNativeProps({
          style: {
            left: position,
          },
        });
      }
    };
    const onTouchDown2 = (evt) => {
      demon2Left.value = evt.touches[0].clientX - 40;
      console.log('touchdown x', demon2Left.value, screenWidth.value);
    };
    const onTouchMove2 = (evt) => {
      demon2Left.value = evt.touches[0].clientX - 40;
      console.log('touchmove x', demon2Left.value, screenWidth.value);
    };

    return {
      demoOnePointRef,
      demon2Left,
      screenWidth,
      onTouchDown1,
      onTouchDown2,
      onTouchMove1,
      onTouchMove2,
    };
  },
});
</script>

<style scoped>
.set-native-props-demo {
  display: flex;
  align-items: center;
  position: relative;
}
.native-demo-1-drag {
  height: 80px;
  background-color: #40b883;
  position: relative;
  marginTop: 10px
}
.native-demo-1-point {
  height: 80px;
  width: 80px;
  color: #40ee94;
  background-color: #40ee94;
  position: absolute;
  left: 0;
}
.native-demo-2-drag {
  height: 80px;
  background-color: #40b883;
  position: relative;
  marginTop: 10px;
}
.native-demo-2-point {
  height: 80px;
  width: 80px;
  color: #40ee94;
  background-color: #40ee94;
  position: absolute;
  left: 0;
}
.splitter{
  marginTop: 50px;
}
</style>
