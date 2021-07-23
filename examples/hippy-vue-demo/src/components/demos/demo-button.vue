<template>
  <div class="button-demo">
    <label class="button-label">按钮和状态绑定</label>
    <button v-bind:class="{ 'is-active': isClicked, 'is-pressing': isPressing }"
      class="button-demo-1"
      @touchstart="onTouchBtnStart"
      @touchmove="onTouchBtnMove"
      @touchend="onTouchBtnEnd"
      @click="clickView">
      <span v-if="isClicked" class="button-text">视图已经被点击了，再点一下恢复</span>
      <span v-else class="button-text">视图尚未点击</span>
    </button>
    <img v-show="isClicked" src="http://mat1.gtimg.com/www/qq2018/imgs/qq_logo_2018x2.png" class="button-demo-1-image" />
  </div>
</template>

<script>
export default {
  methods: {
    clickView() {
      this.isClicked = !this.isClicked;
    },
    // button touch event is supported after hippy-vue 2.6.2
    onTouchBtnStart(evt) {
      console.log('onBtnTouchDown', evt);
      evt.stopPropagation();
    },
    // button touch event is supported after hippy-vue 2.6.2
    onTouchBtnMove(evt) {
      console.log('onBtnTouchMove', evt);
      evt.stopPropagation();
      console.log(evt);
    },
    // button touch event is supported after hippy-vue 2.6.2
    onTouchBtnEnd(evt) {
      console.log('onBtnTouchEnd', evt);
      evt.stopPropagation();
      console.log(evt);
    },
  },
  data() {
    return {
      isClicked: false,
      isPressing: false,
    };
  },
};
</script>

<style scope>
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

  .button-demo-1.is-active {
    color: white;
    background-color: cornflowerblue;
  }

  .button-demo-1.is-pressing {
    color: white;
    background-color: blue;
  }
</style>
