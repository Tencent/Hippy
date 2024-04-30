<template>
  <div>
    <animation
      ref="animationView"
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
import { defineComponent, onMounted, ref } from '@vue/runtime-core';

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
    onRef: {
      type: Function,
      default: () => {},
    },
  },
  setup(props) {
    const animationView = ref(null);

    onMounted(() => {
      if (props.onRef) {
        props.onRef(animationView.value);
      }
    });

    return {
      animationView,
      loopActions: horizonAnimation,
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
