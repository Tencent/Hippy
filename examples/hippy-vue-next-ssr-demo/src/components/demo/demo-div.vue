<template>
  <div
    id="div-demo"
    @scroll="onOuterScroll"
  >
    <div>
      <div v-if="!isIOS">
        <label>水波纹效果: </label>
        <div :style="{ ...imgRectangle, ...imgRectangleExtra }">
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
        ref="demo2"
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
        <div class="display-flex flex-row">
          <span class="text-block">A</span>
          <span class="text-block">B</span>
          <span class="text-block">C</span>
          <span class="text-block">D</span>
          <span class="text-block">E</span>
        </div>
      </div>
      <label>垂直滚动:</label>
      <div
        class="div-demo-3"
        :showsVerticalScrollIndicator="false"
      >
        <div class="display-flex flex-column">
          <span class="text-block">A</span>
          <span class="text-block">B</span>
          <span class="text-block">C</span>
          <span class="text-block">D</span>
          <span class="text-block">E</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { type HippyElement } from '@hippy/vue-next';
import {
  defineComponent,
  onActivated,
  onDeactivated,
  onMounted,
  ref,
} from '@vue/runtime-core';
import { isIOS } from '../../util';

import defaultImage from '../../assets/defaultSource.jpg';

import DemoRippleDiv from './demo-ripple-div.vue';

const onScroll = (e: Event) => {
  console.log('onScroll', e);
};
const onMomentumScrollBegin = (e: Event) => {
  console.log('onMomentumScrollBegin', e);
};
const onMomentumScrollEnd = (e: Event) => {
  console.log('onMomentumScrollEnd', e);
};
const onScrollBeginDrag = (e: Event) => {
  console.log('onScrollBeginDrag', e);
};
const onScrollEndDrag = (e: Event) => {
  console.log('onScrollEndDrag', e);
};

export default defineComponent({
  components: {
    DemoRippleDiv,
  },
  setup() {
    const offsetY = ref(0);
    const demo2 = ref(null);

    /**
     * outer scroll event
     * @param e
     */
    const onOuterScroll = (e) => {
      offsetY.value = e.offsetY;
    };

    onActivated(() => {
      console.log(`${Date.now()}-div-activated`);
    });

    onDeactivated(() => {
      console.log(`${Date.now()}-div-Deactivated`);
    });

    onMounted(() => {
      if (demo2.value) {
        (demo2.value as HippyElement).scrollTo(50, 0, 1000);
      }
    });

    /**
       * demo1 needs to use variable base64 DefaultImage，so inline style mode is a must.
       * if image path is remote address, declaration style class .div-demo-1 can be used.
       */
    return {
      demo2,
      demo1Style: {
        display: 'flex',
        height: '40px',
        width: '200px',
        /**
           *  inline style 'backgroundImage': `url(${DefaultImage})` with 'url()' syntax only supported above 2.6.1.
           *  declaration css style supports 'background-image': `url('https://xxxx')` format and remote address only.
           */
        backgroundImage: `${defaultImage}`,
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
        borderStyle: 'solid',
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
      offsetY,
      onScroll,
      onMomentumScrollBegin,
      onMomentumScrollEnd,
      onScrollBeginDrag,
      onScrollEndDrag,
      onOuterScroll,
      isIOS: isIOS(),
    };
  },
});
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
  border-style: solid;
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
