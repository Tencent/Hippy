<template>
  <div>
    <animation
      ref="animationLoop"
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
import {
  defineComponent,
  toRefs,
  watch,
  ref,
  onMounted,
  type Ref, nextTick,
} from '@vue/runtime-core';
import { type AnimationInstance } from '@hippy/vue-next';
import { IS_SSR_MODE } from '../../../env';

const horizonAnimation = {
  transform: {
    translateX: {
      startValue: 0,
      toValue: 200,
      duration: 2000,
      repeatCount: -1,
    },
  },
};

const verticalAnimation = {
  transform: {
    translateY: {
      startValue: 0,
      toValue: 50,
      duration: 2000,
      repeatCount: -1,
    },
  },
};

export default defineComponent({
  props: {
    playing: Boolean,
    direction: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const { direction } = toRefs(props);
    const loopActions: Ref = ref({});
    const animationLoop: Ref<null | AnimationInstance> = ref(null);

    const setActions = (direction: string) => {
      switch (direction) {
        case 'horizon':
          loopActions.value = horizonAnimation;
          break;
        case 'vertical':
          loopActions.value = verticalAnimation;
          break;
        default:
          throw new Error('direction must be defined in props');
      }
    };

    watch(
      direction,
      (newVal) => {
        setActions(newVal);
      },
      {
        immediate: true,
      },
    );

    const actionsDidUpdate = () => {
      // pay attention pls, animate operate should execute
      // after dom render finished
      nextTick().then(() => {
        console.log('loop actions updated & startAnimation');
        if (animationLoop.value) {
          animationLoop.value.start();
        }
      });
    };

    onMounted(async () => {
      if (IS_SSR_MODE) {
        // ssr mode should update action to start animation
        loopActions.value = {};
        await nextTick();
        setActions(props.direction);
      }
    });

    return {
      loopActions,
      animationLoop,
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
