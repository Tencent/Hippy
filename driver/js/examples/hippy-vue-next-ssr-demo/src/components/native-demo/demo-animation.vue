<template>
  <ul id="animation-demo">
    <li>
      <label>控制动画</label>
      <div class="toolbar">
        <button
          class="toolbar-btn"
          @click="toggleLoopPlaying"
        >
          <span v-if="loopPlaying">暂停</span>
          <span v-else>播放</span>
        </button>
        <button
          class="toolbar-btn"
          @click="toggleDirection"
        >
          <span v-if="direction === 'horizon'">切换为纵向</span>
          <span v-else>切换为横向</span>
        </button>
      </div>
      <div style="height: 150px">
        <loop
          :playing="loopPlaying"
          :direction="direction"
        >
          <p>I'm a looping animation</p>
        </loop>
      </div>
    </li>
    <li>
      <div style="margin-top: 10px" />
      <label>点赞笑脸动画:</label>
      <div class="toolbar">
        <button
          class="toolbar-btn"
          @click="voteUp"
        >
          <span>点赞 👍</span>
        </button>
        <button
          class="toolbar-btn"
          @click="voteDown"
        >
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
      <div style="margin-top: 10px" />
      <label>渐变色动画</label>
      <div class="toolbar">
        <button
          class="toolbar-btn"
          @click="toggleColorPlaying"
        >
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
      <div style="margin-top: 10px" />
      <label>贝塞尔曲线动画</label>
      <div class="toolbar">
        <button
          class="toolbar-btn"
          @click="toggleCubicPlaying"
        >
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
   * Animation parameters and their default values
   *
   * playing：
   *   true                      // play animation
   *   false                     // stop animation
   *
   * actions：
   *   valueType: undefined,     // unit type of startValue and toValue， can be set to rad, deg, color
   *   delay: 0,                 // the time the animation delay starts, in milliseconds
   *   startValue: 0,            // the value at the beginning of the animation
   *   toValue: 0,               // the value at the end of the animation
   *   duration: 0,              // animation runtime
   *   direction: 'center',      // animation running direction
   *   timingFunction: 'linear', // Optional values are: linear, ease-in, ease-out,
   *                             // ease-in-out, ease_bezier, cubic-bezier(minimum supported version 2.9.0)
   *   repeatCount: 0,           // number of repetitions of animation. 0: not repeating; -1: loop.
   *                             // the number is based on the value of the first animation.
   * After the actions are replaced, the animation needs to be started manually
   *
   */
import { defineComponent, ref, type Ref, shallowRef } from '@vue/runtime-core';

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
    const voteComponent: Ref = shallowRef(VoteUp);

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
      direction.value = direction.value === 'horizon' ? 'vertical' : 'horizon';
    };

    return {
      loopPlaying,
      colorPlaying,
      cubicPlaying,
      direction,
      voteComponent,
      colorComponent,
      isChanged,
      voteUp,
      voteDown,
      toggleLoopPlaying,
      toggleColorPlaying,
      toggleCubicPlaying,
      toggleDirection,
    };
  },
});
</script>

<style scoped>
#animation-demo {
  overflow: scroll;
  margin: 7px;
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
</style>
