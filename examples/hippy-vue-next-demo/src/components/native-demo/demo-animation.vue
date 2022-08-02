<template>
  <ul id="animation-demo">
    <li>
      <label>控制动画</label>
      <div class="toolbar">
        <button class="toolbar-btn" @click="toggleLoopPlaying">
          <span v-if="loopPlaying">暂停</span>
          <span v-else>播放</span>
        </button>
        <button class="toolbar-btn" @click="toggleDirection">
          <span v-if="direction === 'horizon'">切换为纵向</span>
          <span v-else>切换为横向</span>
        </button>
      </div>
      <div class="animation-wrapper">
        <loop :playing="loopPlaying" :direction="direction" :on-ref="onRef">
          <p>I'm a looping animation</p>
        </loop>
      </div>
    </li>
    <li>
      <div class="animation-label" />
      <label>点赞笑脸动画:</label>
      <div class="toolbar">
        <button class="toolbar-btn" @click="voteUp">
          <span>点赞 👍</span>
        </button>
        <button class="toolbar-btn" @click="voteDown">
          <span>踩 👎</span>
        </button>
      </div>
      <div class="vote-face-container center">
        <component
          :is="voteComponent"
          class="vote-icon"
          :is-changed="isChanged"
        />
      </div>
    </li>
    <li>
      <div class="animation-label" />
      <label>渐变色动画</label>
      <div class="toolbar">
        <button class="toolbar-btn" @click="toggleColorPlaying">
          <span v-if="colorPlaying">暂停</span>
          <span v-else>播放</span>
        </button>
      </div>
      <div>
        <color-component :playing="colorPlaying">
          <p>背景色渐变</p>
        </color-component>
      </div>
    </li>
    <li>
      <div class="animation-label" />
      <label>贝塞尔曲线动画</label>
      <div class="toolbar">
        <button class="toolbar-btn" @click="toggleCubicPlaying">
          <span v-if="cubicPlaying">暂停</span>
          <span v-else>播放</span>
        </button>
      </div>
      <div>
        <cubic-bezier :playing="cubicPlaying">
          <p>cubic-bezier(.45,2.84,.38,.5)</p>
        </cubic-bezier>
      </div>
    </li>
  </ul>
</template>

<script lang="ts">
  /**
   * 动画参数以及默认参数，如果默认值不改就不用填
   *
   * playing 参数：
   *   true                      // 运行动画
   *   false                     // 暂停动画
   *
   * actions 参数：
   *   valueType: undefined,     // 动画的开始和结束值的单位类型，默认为空，代表动画起止值的类型。可以不设，或者设为 rad、deg、color
   *   delay: 0,                 // 动画延迟开始的时间，单位为毫秒
   *   startValue: 0,            // 动画开始时的值
   *   toValue: 0,               // 动画结束时候的值
   *   duration: 0,              // 动画运行时间
   *   direction: 'center',      // 动画运行方向
   *   timingFunction: 'linear', // 动画插值器类型，可选 linear、ease-in、ease-out、ease-in-out、ease_bezier、cubic-bezier(最低支持版本 2.9.0)
   *   repeatCount: 0,           // 动画的重复次数，0为不重复，-1 为一直重复不停，如果在数组中，整个动画的重复次数以第一个动画的值为准
   *
   * actions替换后，需手动start动画
   *
   */

  import { defineComponent, ref, type Ref } from '@vue/runtime-core';

  import colorComponent from './animations/color-change.vue';
  import CubicBezier from './animations/cubic-bezier.vue';
  import Loop from './animations/loop.vue';
  import VoteDown from './animations/vote-down.vue';
  import VoteUp from './animations/vote-up.vue';

  export default defineComponent({
    components: {
      Loop,
      colorComponent,
      CubicBezier,
    },
    setup() {
      const loopPlaying = ref(true);
      const colorPlaying = ref(true);
      const cubicPlaying = ref(true);
      const direction = ref('horizon');
      const isChanged = ref(true);
      const animationRef = ref(null);
      const voteComponent: Ref = ref(VoteUp);

      const onRef = (eleRef) => {
        animationRef.value = eleRef;
      };
      const voteDown = () => {
        voteComponent.value = VoteDown;
        // toggle isChanged to change actions
        isChanged.value = !isChanged.value;
      };
      const voteUp = () => {
        voteComponent.value = VoteUp;
      };

      const toggleLoopPlaying = () => {
        loopPlaying.value = !loopPlaying.value;
      };
      const toggleColorPlaying = () => {
        colorPlaying.value = !colorPlaying.value;
      };
      const toggleCubicPlaying = () => {
        cubicPlaying.value = !cubicPlaying.value;
      };
      const toggleDirection = () => {
        /**
         *  actions替换后会自动新建animation，需稍作延迟手动start animation播放
         *  也可以通过 playing = false => 替换actions => playing = true 启动animation播放,
         *  例:
         *  this.loopPlaying = false;
         *  this.direction = this.direction === 'horizon' ? 'vertical' : 'horizon';
         *  setTimeout(() => {
         *    this.loopPlaying = true;
         *  }, 20);
         *
         */
        direction.value =
          direction.value === 'horizon' ? 'vertical' : 'horizon';
        setTimeout(() => {
          if (animationRef.value) {
            // 注意这里需要告诉终端刷新已经结束了，否则会一直卡着。
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            animationRef.value.start();
          }
        }, 20);
      };

      return {
        loopPlaying,
        colorPlaying,
        cubicPlaying,
        direction,
        voteComponent,
        colorComponent,
        isChanged,
        animationRef,
        voteUp,
        voteDown,
        onRef,
        toggleLoopPlaying,
        toggleColorPlaying,
        toggleCubicPlaying,
        toggleDirection,
      };
    },
  });
</script>

<style>
  #animation-demo {
    overflow: scroll;
  }

  #animation-demo .vote-icon {
    width: 50px;
    height: 50px;
    margin-right: 10px;
    align-items: center;
    justify-content: center;
  }

  #animation-demo .vote-face-container {
    height: 60px;
  }

  .animation-wrapper {
    height: 150px;
  }

  .animation-label {
    margin-top: 10px;
  }
</style>
