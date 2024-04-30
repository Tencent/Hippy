<template>
  <div>
    <animation
      ref="animationRef"
      :actions="animations.face"
      class="vote-face"
      playing
      @start="animationStart"
      @end="animationEnd"
      @repeat="animationRepeat"
      @cancel="animationCancel"
    />
    <animation
      tag="img"
      class="vote-down-face"
      playing
      :props="{ src: imgs.downVoteFace }"
      :actions="animations.downVoteFace"
    />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  watch,
  ref,
  type Ref,
  toRefs,
} from '@vue/runtime-core';
import { type AnimationInstance } from '@hippy/vue-next';
import downVoteFace from './down-vote-face.png';


const face1 = {
  transform: {
    scale: [
      {
        startValue: 1,
        toValue: 1.2,
        duration: 250,
        timingFunction: 'linear',
      },
      {
        startValue: 1.2,
        toValue: 1,
        duration: 250,
        delay: 750,
        timingFunction: 'linear',
      },
    ],
  },
};
const face2 = {
  transform: {
    translateX: [
      {
        startValue: 10,
        toValue: 1,
        duration: 250,
        timingFunction: 'linear',
      },
      {
        startValue: 1,
        toValue: 10,
        duration: 250,
        delay: 750,
        timingFunction: 'linear',
        repeatCount: -1,
      },
    ],
  },
};

export default defineComponent({
  props: {
    isChanged: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const animationRef: Ref<null | AnimationInstance> = ref(null);
    const animations: Ref = ref({
      face: face1,
      downVoteFace: {
        left: [
          {
            startValue: 16,
            toValue: 10,
            delay: 250,
            duration: 125,
          },
          {
            startValue: 10,
            toValue: 24,
            duration: 250,
          },
          {
            startValue: 24,
            toValue: 10,
            duration: 250,
          },
          {
            startValue: 10,
            toValue: 16,
            duration: 125,
          },
        ],
        transform: {
          scale: [
            {
              startValue: 1,
              toValue: 1.3,
              duration: 250,
              timingFunction: 'linear',
            },
            {
              startValue: 1.3,
              toValue: 1,
              delay: 750,
              duration: 250,
              timingFunction: 'linear',
            },
          ],
        },
      },
    });
    const { isChanged } = toRefs(props);

    const animationStart = () => {
      console.log('animation-start callback');
    };
    const animationEnd = () => {
      console.log('animation-end callback');
    };
    const animationRepeat = () => {
      console.log('animation-repeat callback');
    };
    const animationCancel = () => {
      console.log('animation-cancel callback');
    };

    watch(isChanged, (to, from) => {
      if (!from && to) {
        console.log('changed to face2');
        animations.value.face = face2;
      } else if (from && !to) {
        console.log('changed to face1');
        animations.value.face = face1;
      }
      /**
       * After the actions are switched, start the animation manually.
       * Since the creation of animation requires communication with the terminal,
       * delay 10ms to ensure that the animation has been created
       */
      setTimeout(() => {
        if (animationRef.value) {
          animationRef.value.start();
        }
      }, 10);
    });

    return {
      animationRef,
      imgs: {
        downVoteFace,
      },
      animations,
      animationStart,
      animationEnd,
      animationRepeat,
      animationCancel,
    };
  },
});
</script>

<style scoped>
.vote-face {
  width: 40px;
  height: 40px;
  background-color: #ffdb00;
  border-color: #e9b156;
  border-width: 1px;
  border-style: solid;
  border-radius: 20px;
}

.vote-down-face {
  position: absolute;
  top: 15px;
  left: 16px;
  width: 18px;
  height: 18px;
  resize-mode: stretch;
}
</style>
