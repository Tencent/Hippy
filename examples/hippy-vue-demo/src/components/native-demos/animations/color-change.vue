<template>
  <div>
    <animation :playing="playing" :actions="colorActions" class="color-green">
      <div class="color-white">
        <slot />
      </div>
    </animation>
  </div>
</template>

<script>

const backgroundColorAnimation = {
  backgroundColor: [
    {
      startValue: '#40b883',
      toValue: 'yellow',
      valueType: 'color', // 颜色动画需显式指定valueType为color
      duration: 1000,
      delay: 0,
      mode: 'timing',
      timingFunction: 'linear',
    },
    {
      startValue: 'yellow',
      toValue: '#40b883',
      duration: 1000,
      valueType: 'color', // 颜色动画需显式指定valueType为color
      delay: 0,
      mode: 'timing',
      timingFunction: 'linear',
      follow: true,
      repeatCount: -1,
    },
  ],
};

export default {
  data() {
    const colorActions = backgroundColorAnimation;
    return {
      colorActions,
    };
  },
  props: {
    playing: Boolean,
    onRef: Function,
  },
};
</script>

<style scope>
.color-green {
  margin-top: 10px;
  justify-content: center;
  align-items: center;
  background-color: #40b883;
  width: 200px;
  height: 80px;
}

.color-white {
  justify-content: center;
  align-items: center;
  background-color: white;
  width: 100px;
  height: 35px;
}
</style>
