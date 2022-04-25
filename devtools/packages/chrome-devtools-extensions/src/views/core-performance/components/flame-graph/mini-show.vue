<template>
  <div class="wrap">
    <canvas
      ref="canvas"
      :style="{ width: `${viewportWidth}px`, height: `${canvasHeight}px` }"
      :width="viewportWidth"
      :height="canvasHeight"
      @mousedown="mouseDown"
      @mousemove="mouseMove"
      @mouseout="mouseOut"
      @click="click"
    />
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { getCanvasContext, getCanvasMousePosition, handleCanvsWheel } from './canvas-utils';
import renderCache from './render-cache';
import FlameGraph from './index';

const minShowHeight = 50;
const minBarHeight = 2;
const maxBarHeight = 6;

export default defineComponent({
  props: {
    renderTrace: {
      type: Array as PropType<FlameGraph.RenderTrace[]>,
      default: () => [],
    },
    renderTraceMap: {
      type: Map as PropType<FlameGraph.RenderTraceMap>,
      default: () => new Map(),
    },
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
    viewportWidth: {
      type: Number,
      default: 0,
    },
    zoom: {
      type: Number,
      default: 1,
    },
    minZoom: {
      type: Number,
      default: 1,
    },
    onStateChange: {
      type: Function,
      default: null,
    },
  },
  data() {
    return {
      canvas: {},
      mouse: {
        mouseX: 0,
        mouseY: 0,
        isMouseDown: false,
      },
      canvasHeight: 0,
      barHeight: 0,
    };
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
      this.canvas = this.$refs.canvas as HTMLCanvasElement;
      this.barHeight = this.getBarHeight();
      this.canvasHeight = this.getCanvasHeight();
      document.addEventListener('mouseup', this.mouseUp);
      if (this.canvas instanceof HTMLCanvasElement) {
        this.canvas.addEventListener('wheel', this.handleWheel);
      }
      this.renderCanvas();
    },
    renderCanvasAtNextTick() {
      this.$nextTick(() => {
        this.renderCanvas();
      });
    },
    getCanvasHeight() {
      const height = this.barHeight * (renderCache.getMaxStackIndex(this.renderTrace) + 1);
      return Math.max(height, minShowHeight);
    },
    getBarHeight() {
      const minBarCount = minShowHeight / maxBarHeight;
      const overHeightStackIndex = this.renderTrace.find((ele) => ele.stackIndex > minBarCount);
      return overHeightStackIndex === undefined ? maxBarHeight : minBarHeight;
    },
    renderCanvas() {
      const { canvas } = this.$refs;
      if (canvas instanceof HTMLCanvasElement) {
        const ctx = getCanvasContext(canvas);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const renderTraceMap = this.renderTraceMap || new Map();
        const groupOrder = Array.from(renderTraceMap.keys());

        let startY = 0;

        for (const group of groupOrder) {
          const traceGroup = renderTraceMap.get(group);
          if (!traceGroup) continue;
          this.renderTraceGroup(ctx, traceGroup, startY);
          const maxStackIndex = renderCache.getMaxStackIndex(traceGroup);
          startY += (maxStackIndex + 1) * this.barHeight;
        }

        this.renderMask(ctx, 0, startY);
      }
    },
    renderTraceGroup(ctx, traceGroup, startY) {
      if (!traceGroup.length) return;

      const { extent, viewportWidth, barHeight } = this;
      traceGroup.forEach((trace) => {
        const { measure, stackIndex } = trace;
        const width = Math.max((measure.duration / extent.size) * viewportWidth, 1);
        const x = ((measure.startTime - extent.startOffset) / extent.size) * viewportWidth;
        const y = stackIndex * barHeight + startY;
        ctx.fillStyle = renderCache.getTraceColorRGB(measure);
        ctx.fillRect(x, y, width, barHeight);
      });
    },
    renderMask(ctx, top, bottom) {
      const { center, extent, viewportWidth, zoom } = this;
      const { startOffset, size } = extent;
      const metaCenter = (center - startOffset) / extent.size;
      const metaWidth = viewportWidth / (size * zoom);
      const metaStart = metaCenter - metaWidth / 2;
      const metaEnd = metaCenter + metaWidth / 2;
      const shadeHeight = Math.max(bottom - top, minShowHeight);
      ctx.fillStyle = 'rgba(200, 200, 200, 0.2)';
      ctx.fillRect(0, top, Math.max(metaStart, 0) * viewportWidth, shadeHeight);
      ctx.fillRect(
        Math.min(metaEnd, 1) * viewportWidth,
        top,
        viewportWidth - Math.min(metaEnd, 1) * viewportWidth,
        shadeHeight,
      );
    },
    mouseDown() {
      this.mouse.isMouseDown = true;
    },
    mouseMove(event) {
      const { canvasMouseX, canvasMouseY } = this.getCanvasMousePosition(event);
      this.mouse.mouseX = canvasMouseX;
      this.mouse.mouseY = canvasMouseY;
      if (this.mouse.isMouseDown) {
        this.setCenterFromMousePosition(event);
      }
    },
    mouseUp() {
      this.mouse.isMouseDown = false;
    },
    mouseOut() {
      this.mouse.isMouseDown = false;
    },
    click(event) {
      this.setCenterFromMousePosition(event);
    },
    handleWheel(event) {
      handleCanvsWheel(event, this.canvas as HTMLCanvasElement, {
        viewportWidth: this.viewportWidth,
        center: this.center,
        zoom: this.zoom,
        minZoom: this.minZoom,
        onStateChange: this.onStateChange as ({ zoom, center }) => void,
      });
    },
    getCanvasMousePosition(event) {
      return getCanvasMousePosition(event, this.canvas as HTMLCanvasElement);
    },
    setCenterFromMousePosition(event) {
      const { canvasMouseX } = this.getCanvasMousePosition(event);
      const { size, startOffset } = this.extent;
      const updated = (canvasMouseX / this.viewportWidth) * size + startOffset;

      this.$emit('onStateChange', {
        center: updated,
      });
    },
  },
});
</script>
