<template>
  <div class="button-demo">
    <label class="button-label">按钮和状态绑定</label>
    <button
      :class="{ 'is-active': isClicked, 'is-pressing': isPressing }"
      class="button-demo-1"
      @touchstart.stop="onTouchBtnStart"
      @touchmove.stop="onTouchBtnMove"
      @touchend.stop="onTouchBtnEnd"
      @click="onClickView"
    >
      <span
        v-if="isClicked"
        class="button-text"
      >视图已经被点击了，再点一下恢复</span>
      <span
        v-else
        class="button-text"
      >视图尚未点击</span>
    </button>
    <img
      v-show="isClicked"
      alt="demo1-image"
      src="https://user-images.githubusercontent.com/12878546/148737148-d0b227cb-69c8-4b21-bf92-739fb0c3f3aa.png"
      class="button-demo-1-image"
    >
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onActivated,
  onDeactivated,
  ref,
} from '@vue/runtime-core';

export default defineComponent({
  setup() {
    const isClicked = ref(false);
    const isPressing = ref(false);
    const isOnceClicked = ref(false);

    onActivated(() => {
      console.log(`${Date.now()}-button-activated`);
    });

    onDeactivated(() => {
      console.log(`${Date.now()}-button-Deactivated`);
    });

    // click to change status
    const onClickView = () => {
      isClicked.value = !isClicked.value;
    };
    // click to change status
    const onClickViewOnce = () => {
      isOnceClicked.value = !isOnceClicked.value;
    };
    const onTouchBtnStart = (evt: Event) => {
      console.log('onBtnTouchDown', evt);
    };
    const onTouchBtnMove = (evt: Event) => {
      console.log('onBtnTouchMove', evt);
    };
    const onTouchBtnEnd = (evt: Event) => {
      console.log('onBtnTouchEnd', evt);
    };

    return {
      isClicked,
      isPressing,
      isOnceClicked,
      onClickView,
      onTouchBtnStart,
      onTouchBtnMove,
      onTouchBtnEnd,
      onClickViewOnce,
    };
  },
});
</script>

<style scoped>
.button-label {
  width: 220px;
  height: 50px;
  margin-top: 20px;
  text-align: center;
  line-height: 50px;
  margin-bottom: 20px;
}
.button-demo {
  display: flex;
  align-items: center;
  flex-direction: column;
}

.button-demo-1 {
  height: 64px;
  width: 240px;
  border-style: solid;
  border-color: #40b883;
  border-width: 2px;
  border-radius: 10px;
  align-items: center;
}

.button-demo-1 .button-text {
  line-height: 56px;
  text-align: center;
}

.button-demo-1-image {
  width: 216px;
  height: 58px;
  background-color: #40b883;
  margin-top: 20px;
}

/*.button-demo-1.is-active {*/
/*  color: white;*/
/*  background-color: cornflowerblue;*/
/*}*/

/*.button-demo-1.is-pressing {*/
/*  color: white;*/
/*  background-color: blue;*/
/*}*/
</style>
