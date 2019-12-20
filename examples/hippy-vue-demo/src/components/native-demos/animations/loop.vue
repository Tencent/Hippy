<template>
  <div>
    <animation :playing="playing" :actions="loopActions" class="loop-red">
      <div class="loop-blue">
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
      toValue: 300,
      duration: 2000,
      repeatCount: -1,
    },
  },
};

export default {
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
  props: {
    playing: Boolean,
    direction: {
      validator(value) {
        return ['horizon', 'vertical'].indexOf(value) > -1;
      },
    },
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
};
</script>

<style scope>
  .loop-red {
    justify-content: center;
    align-items: center;
    background-color: red;
    width: 200px;
    height: 80px;
  }

  .loop-blue {
    justify-content: center;
    align-items: center;
    background-color: blue;
    width: 160px;
    height: 50px;
  }
</style>
