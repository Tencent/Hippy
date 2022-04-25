<template>
  <div class="wrap" :style="{ width: `${viewportWidth}px`, height: `${canvasHeight}px` }">
    <canvas
      ref="canvas"
      :style="{ width: `${viewportWidth}px`, height: `${canvasHeight}px` }"
      :width="viewportWidth"
      :height="canvasHeight"
      @mousedown="mouseDown"
      @mousemove="mouseMove"
      @mouseout="mouseOut"
    />
    <tool-tip :mouse="mouse" :is-show="tooltip.iShow" :text="tooltip.textContent || ''" />
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue';
import ToolTip from './tool-tip.vue';
import {
  BAR_HEIGHT,
  PX_PER_MS,
  CANVAS_DRAW_TEXT_MIN_PX,
  CANVAS_TEXT_PADDING_PX,
  SHOULD_CANVAS_USE_FLOAT_DIMENSIONS,
} from './constants';
import renderCache from './render-cache';
import { Layout, getLayout, isIntersectingWithPoint } from './render-utils';
import { getCanvasContext, getCanvasMousePosition, handleCanvsWheel } from './canvas-utils';
import FlameGraph from './index';

const toInt = SHOULD_CANVAS_USE_FLOAT_DIMENSIONS ? (x) => x : Math.floor;
const canvasRenderHeightMin = 80;
const canvasRenderHeightMax = 400;

export default defineComponent({
  components: {
    ToolTip,
  },
  props: {
    renderTrace: {
      type: Array as PropType<FlameGraph.RenderTrace[]>,
      default: () => [],
    },
    renderTraceMap: {
      type: Map as PropType<FlameGraph.RenderTraceMap>,
      default: () => new Map(),
    },
    selection: {
      type: Object,
      default: () => ({}),
    },
    hovered: {
      type: Object,
      default: () => ({ measure: '' }),
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
    isDragging: {
      type: Boolean,
      default: false,
    },
    isDragMoved: {
      type: Boolean,
      default: false,
    },
    verticalOffset: {
      type: Number,
      default: 0,
    },
    onStateChange: {
      type: Function,
    },
  },
  data() {
    return {
      canvas: {},
      mouse: {
        posX: 0,
        posY: 0,
      },
      renderedShapes: [] as [Layout, FlameGraph.RenderTrace][],
      canvasHeight: 0,
      tooltip: {
        iShow: false,
        textContent: '',
      },
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
      document.addEventListener('mouseup', this.mouseUp);
      this.canvas = this.$refs.canvas as HTMLCanvasElement;
      this.canvasHeight = this.getCanvasHeight();
      if (this.canvas instanceof HTMLCanvasElement) {
        this.canvas.addEventListener('wheel', this.handleWheel);
      }
      this.renderCanvas(this.canvas);
    },
    renderCanvasAtNextTick() {
      this.$nextTick(() => {
        this.renderCanvas(this.canvas);
      });
    },
    getCanvasHeight() {
      const height = BAR_HEIGHT * (renderCache.getMaxStackIndex(this.renderTrace) + 1);
      return Math.min(canvasRenderHeightMax, Math.max(height, canvasRenderHeightMin));
    },
    renderCanvas(canvas) {
      if (!(canvas instanceof HTMLCanvasElement)) return;
      const ctx = getCanvasContext(canvas);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const { renderTraceMap } = this;
      const groupOrder = Array.from(renderTraceMap.keys());

      // y position of every flame rect
      let startY = 0;

      for (const groupKey of groupOrder) {
        const traceGroup = renderTraceMap.get(groupKey);
        if (!traceGroup) continue;
        this.renderTraceGroup(ctx, traceGroup, startY + this.verticalOffset, groupKey);
        const maxStackIndex = renderCache.getMaxStackIndex(traceGroup);
        startY += (maxStackIndex + 1) * BAR_HEIGHT;
      }
    },
    renderTraceGroup(ctx, traceGroup, startY, groupKey) {
      if (!traceGroup.length) {
        return;
      }

      if (groupKey !== undefined) {
        this.renderKeyLine(groupKey, ctx, startY);
      }

      this.renderedShapes = [];

      for (const index in traceGroup) {
        const trace = traceGroup[index];

        const layout = getLayout(
          {
            center: this.center,
            zoom: this.zoom,
            viewportWidth: this.viewportWidth,
          },
          trace,
          startY,
        );

        const { width, height, x, y, isInView } = layout;

        if (!isInView) {
          continue;
        }

        ctx.fillStyle = renderCache.getTraceColorRGB(trace.measure);
        ctx.fillRect(toInt(x), toInt(y), toInt(width), toInt(height));
        this.renderTraceLabel(ctx, trace, layout);

        this.renderedShapes.push([layout, trace]);
      }
    },
    renderKeyLine(key, ctx, startY) {
      const offsetY = 10;
      ctx.font = 'italic 10px Lucida Grande';
      ctx.fillStyle = '#419e30';
      ctx.fillText(`Thread ${key}`, 0, startY + offsetY);

      if (startY > 0) {
        ctx.beginPath();
        ctx.setLineDash([5]);
        ctx.moveTo(0, startY);
        ctx.lineTo(this.viewportWidth, startY);
        ctx.closePath();

        ctx.lineWidth = 0.5;
        ctx.strokeStyle = '#c4ffd6';
        ctx.stroke();
      }
    },
    renderTraceLabel(ctx, trace, layout) {
      const label = trace.measure.name;
      const { x, y, width } = layout;
      if (width < CANVAS_DRAW_TEXT_MIN_PX) {
        return;
      }
      const textWidth = toInt(Math.max(width - CANVAS_TEXT_PADDING_PX, 0));
      ctx.font = '10px Lucida Grande';
      ctx.fillStyle = 'black';

      ctx.fillText(label, toInt(x + CANVAS_TEXT_PADDING_PX), toInt(y + BAR_HEIGHT / 2), textWidth);
    },
    mouseDown() {
      this.$emit('onStateChange', { isDragging: true, isDragMoved: false });
    },
    mouseMove(event) {
      const { canvasMouseX, canvasMouseY } = getCanvasMousePosition(event, this.canvas as HTMLCanvasElement);
      this.mouse.posX = canvasMouseX;
      this.mouse.posY = canvasMouseY;

      const { tooltip, isDragging, center, verticalOffset } = this;
      const hovered = this.getIntersectingTrace(event);
      if (hovered) {
        const { measure } = hovered;
        tooltip.textContent = `${measure.duration!.toFixed(1)}ms ${measure.name}`;
        tooltip.iShow = true;
      } else {
        tooltip.iShow = false;
      }

      if (isDragging) {
        const updatedCenter = center - event.movementX / PX_PER_MS / this.zoom;
        const updatedVerticalOffset = Math.min(0, verticalOffset + event.movementY);
        this.$emit('onStateChange', {
          verticalOffset: updatedVerticalOffset,
          center: updatedCenter,
          hovered,
          isDragMoved: true,
        });
      }
    },
    mouseOut() {
      this.tooltip.iShow = false;
    },
    mouseUp(event) {
      this.$emit('onStateChange', {
        isDragging: false,
        isDragMoved: false,
        selection: this.isDragMoved ? this.selection : this.getIntersectingTrace(event),
      });
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
    getIntersectingTrace(event) {
      const { canvasMouseX, canvasMouseY } = getCanvasMousePosition(event, this.canvas as HTMLCanvasElement);
      const intersectingTraces = this.renderedShapes.filter(([{ x, y, width, height }]) =>
        isIntersectingWithPoint({ x, y, width, height }, { x: canvasMouseX, y: canvasMouseY }),
      );
      if (intersectingTraces.length) {
        return intersectingTraces[0][1];
      }
      return null;
    },
  },
});
</script>

<style scoped>
.wrap {
  margin-top: 0;
  border-bottom: 1px dashed #eee;
  border-top: 1px dashed #eee;
}
</style>
