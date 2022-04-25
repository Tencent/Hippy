<template>
  <div
    v-show="isShow"
    ref="toop-tip"
    class="wrap"
    :style="{
      userSelect: 'none',
      position: 'absolute',
      backgroundColor: 'white',
      fontSize: 10,
      fontFamily: ' Lucida Grande',
      padding: '2px 4px',
      boxShadow: '3px 3px 5px rgba(0,0,0,0.4)',
      left: `${tooltipX}px`,
      top: `${tooltipY}px`,
    }"
  >
    {{ text }}
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { TOOLTIP_OFFSET } from './constants';

export default defineComponent({
  props: {
    text: {
      type: String,
      default: '',
    },
    mouse: {
      type: Object,
      default: () => ({
        posX: 0,
        posY: 0,
      }),
    },
    isShow: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    tooltipX(): number {
      return this.mouse.posX + TOOLTIP_OFFSET;
    },
    tooltipY(): number {
      return this.mouse.posY + TOOLTIP_OFFSET;
    },
  },
});
</script>
