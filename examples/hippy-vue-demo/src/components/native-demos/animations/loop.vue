<template>
  <div>
    <animation
      ref="animationLoop"
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

<script>
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

export default {
  props: {
    playing: Boolean,
    direction: {
      validator(value) {
        return ['horizon', 'vertical'].indexOf(value) > -1;
      },
    },
    onRef: Function,
  },
  data() {
    let loopActions;
    switch (this.$props.direction) {
      case 'horizon':
        loopActions = horizonAnimation;
        break;
      case 'vertical':
        loopActions = verticalAnimation;
        break;
      default:
        throw new Error('direction must be defined in props');
    }
    return {
      loopActions,
    };
  },
  watch: {
    direction(to) {
      switch (to) {
        case 'horizon':
          this.loopActions = horizonAnimation;
          break;
        case 'vertical':
          this.loopActions = verticalAnimation;
          break;
        default:
      }
    },
  },
  mounted() {
    if (this.$props.onRef) {
      this.$props.onRef(this.$refs.animationLoop);
    }
  },
  beforeDestroy() {
    this.$refs.animationLoop.destroy();
  },
};
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
