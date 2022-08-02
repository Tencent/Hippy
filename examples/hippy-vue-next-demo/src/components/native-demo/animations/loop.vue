<template>
  <div>
    <animation
      ref="animationLoopRef"
      :playing="playing"
      :actions="loopActions"
      class="loop-green"
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
    type Ref,
  } from '@vue/runtime-core';

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
      onRef: {
        type: Function,
        default: () => {},
      },
    },
    setup(props) {
      const { direction } = toRefs(props);
      const loopActions: Ref = ref('');
      const animationLoopRef = ref(null);

      watch(
        direction,
        (newVal) => {
          switch (newVal) {
            case 'horizon':
              loopActions.value = horizonAnimation;
              break;
            case 'vertical':
              loopActions.value = verticalAnimation;
              break;
            default:
              throw new Error('direction must be defined in props');
          }
        },
        {
          immediate: true,
        },
      );

      onMounted(() => {
        if (props.onRef) {
          props.onRef(animationLoopRef.value);
        }
      });

      return {
        loopActions,
        animationLoopRef,
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
