<template>
  <div>
    <animation
      ref="animationView"
      :playing="playing"
      :actions="loopActions"
      class="loop-green"
      @actionsDidUpdate="actionsDidUpdate"
    >
      <div class="loop-white">
        <slot />
      </div>
    </animation>
  </div>
</template>

<script lang="ts">
import { defineComponent, nextTick, onMounted, ref, type Ref } from '@vue/runtime-core';
import { type AnimationInstance } from '@hippy/vue-next';
import { IS_SSR_MODE } from '../../../env';

const horizonAnimation = {
  transform: {
    translateX: [
      {
        startValue: 50,
        toValue: 150,
        duration: 1000,
        timingFunction: 'cubic-bezier(  0.45,2.84, 000.38,.5)',
      },
      {
        startValue: 150,
        toValue: 50,
        duration: 1000,
        repeatCount: -1,
        timingFunction: 'cubic-bezier(  0.45,2.84, 000.38,.5)',
      },
    ],
  },
};

export default defineComponent({
  props: {
    playing: Boolean,
  },
  setup() {
    const animationView: Ref<null | AnimationInstance> = ref(null);
    const loopActions: Ref = ref({});

    if (!IS_SSR_MODE) {
      loopActions.value = horizonAnimation;
    }

    const actionsDidUpdate = () => {
      // pay attention pls, animate operate should execute
      // after dom render finished
      nextTick().then(() => {
        console.log('cubic-bezier actions updated & startAnimation');
        if (animationView.value) {
          animationView.value.start();
        }
      });
    };

    onMounted(async () => {
      if (IS_SSR_MODE) {
        // ssr mode should update action to start animation
        loopActions.value = {};
        await nextTick();
        loopActions.value = horizonAnimation;
      }
    });

    return {
      animationView,
      loopActions,
      actionsDidUpdate,
    };
  },
});
</script>

<style scoped>
.loop-green {
  margin-top: 10px;
  justify-content: center;
  align-items: center;
  background-color: #40b883;
  width: 200px;
  height: 80px;
}

.loop-white {
  justify-content: center;
  align-items: center;
  background-color: white;
  width: 160px;
  height: 50px;
}
</style>
