<template>
  <div class="wrap">
    <canvas
      ref="canvas"
      class="area"
      :style="{ width: `${viewportWidth}px`, height: `${14}px` }"
      :width="viewportWidth"
    />
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { getCanvasContext } from './canvas-utils';

export default defineComponent({
  props: {
    extent: {
      type: Object,
      default: () => ({
        startOffset: 0,
        endOffset: 0,
        size: 0,
      }),
    },
    center: {
      type: Number,
      default: 0,
    },
    zoom: {
      type: Number,
      default: 1,
    },
    viewportWidth: {
      type: Number,
      default: 0,
    },
  },
  watch: {
    center() {
      this.renderCanvasAtNextTick();
    },
    viewportWidth() {
      this.renderCanvasAtNextTick();
    },
  },
  methods: {
    init() {
      this.renderCanvas();
    },
    renderCanvasAtNextTick() {
      this.$nextTick(() => {
        this.renderCanvas();
      });
    },
    renderCanvas() {
      const canvas = this.$refs.canvas as HTMLCanvasElement;
      const ctx = getCanvasContext(canvas);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const { startOffset, size } = this.extent;
      const { zoom, center, viewportWidth } = this;

      const xOffset = 10;
      const yOffset = 10;
      const endTextXOffset = 30;
      const interval = 6;
      const metaCenter = (center - startOffset) / size;
      const metaWidth = viewportWidth / (size * zoom);
      const metaStart = metaCenter - metaWidth / 2;
      const metaEnd = metaCenter + metaWidth / 2;
      const start = Math.max(metaStart, 0) * size;
      const end = Math.min(metaEnd, 1) * size;
      const intervalDistanceInTimeText = (end - start) / interval;
      const intervalDistanceInPixel = Math.round(viewportWidth / interval);

      ctx.font = '10px Lucida Grande';
      ctx.fillStyle = '#666';
      ctx.fillText(`${Math.round(start)}`, 0, yOffset);
      for (let i = 1; i < interval; i++) {
        ctx.fillText(
          `${Math.round(start + intervalDistanceInTimeText * i)}`,
          0 + intervalDistanceInPixel * i - xOffset,
          yOffset,
        );
      }
      ctx.fillText(`${Math.round(end)}`, this.viewportWidth - endTextXOffset, yOffset);
    },
  },
});
</script>

<style scoped>
.wrap {
  margin-top: 6px;
}
</style>
