<template>
  <div
    id="div-demo"
    @scroll="onOuterScroll"
  >
    <div>
      <div v-if="Vue.Native.Platform !== 'ios'">
        <label>水波纹效果: </label>
        <div :style="{ ...imgRectangle, ...imgRectangleExtra}">
          <demo-ripple-div
            :position-y="offsetY"
            :wrapper-style="imgRectangle"
            :native-background-android="{ borderless: true, color: '#666666' }"
          >
            <p :style="{ color: 'white', maxWidth: 200 }">
              外层背景图，内层无边框水波纹，受外层影响始终有边框
            </p>
          </demo-ripple-div>
        </div>
        <demo-ripple-div
          :position-y="offsetY"
          :wrapper-style="circleRipple"
          :native-background-android="{ borderless: true, color: '#666666', rippleRadius: 100 }"
        >
          <p :style="{ color: 'black', textAlign: 'center' }">
            无边框圆形水波纹
          </p>
        </demo-ripple-div>
        <demo-ripple-div
          :position-y="offsetY"
          :wrapper-style="squareRipple"
          :native-background-android="{ borderless: false, color: '#666666' }"
        >
          <p :style="{ color: '#fff' }">
            带背景色水波纹
          </p>
        </demo-ripple-div>
      </div>
      <label>背景图效果:</label>
      <div
        :style="demo1Style"
        :accessible="true"
        aria-label="背景图"
        :aria-disabled="false"
        :aria-selected="true"
        :aria-checked="false"
        :aria-expanded="false"
        :aria-busy="true"
        role="image"
        :aria-valuemax="10"
        :aria-valuemin="1"
        :aria-valuenow="5"
        aria-valuetext="middle"
      >
        <p class="div-demo-1-text">
          Hippy 背景图展示
        </p>
      </div>
      <label>渐变色效果:</label>
      <div class="div-demo-1-1">
        <p class="div-demo-1-text">
          Hippy 背景渐变色展示
        </p>
      </div>
      <label>Transform</label>
      <div class="div-demo-transform">
        <p class="div-demo-transform-text">
          Transform
        </p>
      </div>
      <label>水平滚动:</label>
      <div
        ref="demo-2"
        class="div-demo-2"
        :bounces="true"
        :scrollEnabled="true"
        :pagingEnabled="false"
        :showsHorizontalScrollIndicator="false"
        @scroll="onScroll"
        @momentumScrollBegin="onMomentumScrollBegin"
        @momentumScrollEnd="onMomentumScrollEnd"
        @scrollBeginDrag="onScrollBeginDrag"
        @scrollEndDrag="onScrollEndDrag"
      >
        <!-- div 带着 overflow 属性的，只能有一个子节点，否则终端会崩溃 -->
        <div class="display-flex flex-row">
          <p class="text-block">
            A
          </p>
          <p class="text-block">
            B
          </p>
          <p class="text-block">
            C
          </p>
          <p class="text-block">
            D
          </p>
          <p class="text-block">
            E
          </p>
        </div>
      </div>
      <label>垂直滚动:</label>
      <div
        class="div-demo-3"
        :showsVerticalScrollIndicator="false"
      >
        <div class="display-flex flex-column">
          <p class="text-block">
            A
          </p>
          <p class="text-block">
            B
          </p>
          <p class="text-block">
            C
          </p>
          <p class="text-block">
            D
          </p>
          <p class="text-block">
            E
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import defaultImage from '../../assets/defaultSource.jpg';
import DemoRippleDiv from './demo-ripple-div.vue';

export default {
  components: {
    'demo-ripple-div': DemoRippleDiv,
  },
  data() {
    /**
     * demo1 needs to use variable base64 DefaultImage，so inline style mode is a must.
     * if image path is remote address, declaration style class .div-demo-1 can be used.
     */
    return {
      Vue,
      offsetY: 0,
      demo1Style: {
        display: 'flex',
        height: '40px',
        width: '200px',
        /**
         *  inline style 'backgroundImage': `url(${DefaultImage})` with 'url()' syntax only supported above 2.6.1.
         *  declaration css style supports 'background-image': `url('https://xxxx')` format and remote address only.
         */
        backgroundImage: `${defaultImage}`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '10px',
        marginBottom: '10px',
      },
      imgRectangle: {
        width: '260px',
        height: '56px',
        alignItems: 'center',
        justifyContent: 'center',
      },
      imgRectangleExtra: {
        marginTop: '20px',
        backgroundImage: `${defaultImage}`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      },
      circleRipple: {
        marginTop: '30px',
        width: '150px',
        height: '56px',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: '3px',
        borderColor: '#40b883',
      },
      squareRipple: {
        marginBottom: '20px',
        alignItems: 'center',
        justifyContent: 'center',
        width: '150px',
        height: '150px',
        backgroundColor: '#40b883',
        marginTop: '30px',
        borderRadius: '12px',
        overflow: 'hidden',
      },
    };
  },
  mounted() {
    this.demon2 = this.$refs['demo-2'];
    setTimeout(() => {
      this.demon2.scrollTo(50, 0, 1000);
    }, 1000);
  },
  methods: {
    onOuterScroll(e) {
      this.offsetY = e.offsetY;
    },
    onScroll(e) {
      console.log('onScroll', e);
    },
    onMomentumScrollBegin(e) {
      console.log('onMomentumScrollBegin', e);
    },
    onMomentumScrollEnd(e) {
      console.log('onMomentumScrollEnd', e);
    },
    onScrollBeginDrag(e) {
      console.log('onScrollBeginDrag', e);
    },
    onScrollEndDrag(e) {
      console.log('onScrollEndDrag', e);
    },
  },
};
</script>

<style scoped>

  #div-demo {
    flex: 1;
    overflow-y: scroll;
    margin: 7px;
  }

  .display-flex {
    display: flex;
  }

  .flex-row {
    flex-direction: row;
  }

  .flex-column {
    flex-direction: column;
  }

  .text-block {
    width: 100px;
    height: 100px;
    line-height: 100px;
    border-style: solid;
    border-width: 1px;
    border-color: #40b883;
    font-size: 80px;
    margin: 20px;
    color: #40b883;
    text-align: center;
  }

  /* background-image path can only use remote address */
  /*.div-demo-1 {*/
  /*  display: flex;*/
  /*  height: 40px;*/
  /*  background-image: url('https://user-images.githubusercontent.com/12878546/148737148-d0b227cb-69c8-4b21-bf92-739fb0c3f3aa.png');*/
  /*  background-repeat: no-repeat;*/
  /*}*/

  .div-demo-1-1 {
    display: flex;
    height: 40px;
    width: 200px;
    background-image: linear-gradient(30deg, blue 10%, yellow 40%, red 50%);
    border-width: 2px;
    border-color: black;
    border-radius: 2px;
    justify-content: center;
    align-items: center;
    margin-top: 10px;
    margin-bottom: 10px;
  }

  .div-demo-1-text {
    color: white;
  }

  .div-demo-2 {
    overflow-x: scroll;
    margin: 10px;
    flex-direction: row;
  }

  .div-demo-3 {
    width: 150px;
    overflow-y: scroll;
    margin: 10px;
    height: 320px;
  }

  .div-demo-transform {
    background-color: #40b883;
    transform: rotate(30deg) scale(.5);
    width: 120px;
    height: 120px;
  }

  .div-demo-transform-text {
    line-height: 120px;
    height: 120px;
    width: 120px;
    text-align: center;
  }
</style>
