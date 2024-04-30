<template>
  <div>
    <animation
      ref="animationView"
      :playing="playing"
      :actions="colorActions"
      class="color-green"
      @actionsDidUpdate="actionsDidUpdate"
    >
      <div class="color-white">
        <slot />
      </div>
    </animation>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, type Ref, onMounted, nextTick } from '@vue/runtime-core';
import { type AnimationInstance } from '@hippy/vue-next';
import { IS_SSR_MODE } from '../../../env';

const backgroundColorAnimation = {
  backgroundColor: [
    {
      startValue: '#40b883',
      toValue: 'yellow',
      valueType: 'color', // Color animation needs to explicitly specify valueType as color
      duration: 1000,
      delay: 0,
      mode: 'timing',
      timingFunction: 'linear',
    },
    {
      startValue: 'yellow',
      toValue: '#40b883',
      duration: 1000,
      valueType: 'color', // Color animation needs to explicitly specify valueType as color
      delay: 0,
      mode: 'timing',
      timingFunction: 'linear',
      repeatCount: -1, // 'loop' string supported above 2.12.2
    },
  ],
};

export default defineComponent({
  props: {
    playing: Boolean,
    onRef: {
      type: Function,
      default: () => {},
    },
  },
  setup() {
    const animationView: Ref<null | AnimationInstance> = ref(null);
    const colorActions: Ref = ref({});

    if (!IS_SSR_MODE) {
      colorActions.value = backgroundColorAnimation;
    }

    const actionsDidUpdate = () => {
      // pay attention pls, animate operate should execute
      // after dom render finished
      nextTick().then(() => {
        console.log('color-change actions updated & startAnimation');
        if (animationView.value) {
          animationView.value.start();
        }
      });
    };

    onMounted(async () => {
      if (IS_SSR_MODE) {
        colorActions.value = {};
        await nextTick();
        colorActions.value = backgroundColorAnimation;
      }
    });

    return {
      animationView,
      colorActions,
      actionsDidUpdate,
    };
  },
});
</script>

<style>
.color-green {
  margin-top: 10px;
  justify-content: center;
  align-items: center;
  background-color: #40b883;
  width: 200px;
  height: 80px;
  margin-left: 5px;
}

.color-white {
  justify-content: center;
  align-items: center;
  background-color: white;
  width: 100px;
  height: 35px;
}
</style>
