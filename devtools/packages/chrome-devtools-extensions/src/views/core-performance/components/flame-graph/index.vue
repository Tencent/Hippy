<template>
  <div>
    <mini-show
      ref="minishow"
      :render-trace="renderTrace"
      :render-trace-map="renderTraceMap"
      :center="center"
      :vertical-offset="verticalOffset"
      :zoom="zoom"
      :min-zoom="minZoom"
      :extent="extent"
      :viewport-width="viewportWidth"
      :viewport-height="viewportHeight"
      :start-time="startTime"
      :on-state-change="handleStateChange"
      @onStateChange="handleStateChange"
    />
    <time-line ref="timeline" :viewport-width="viewportWidth" :zoom="zoom" :center="center" :extent="extent" />
    <div
      :style="{
        cursor: isDragging ? 'grabbing' : 'grab',
        position: 'relative',
      }"
    >
      <canvas-render
        ref="canvasrender"
        :render-trace="renderTrace"
        :render-trace-map="renderTraceMap"
        :is-dragging="isDragging"
        :is-drag-moved="isDragMoved"
        :selection="selection"
        :hovered="hovered"
        :center="center"
        :vertical-offset="verticalOffset"
        :zoom="zoom"
        :min-zoom="minZoom"
        :viewport-width="viewportWidth"
        :viewport-height="viewportHeight"
        :start-time="startTime"
        :on-state-change="handleStateChange"
        @onStateChange="handleStateChange"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, PropType } from 'vue';
import MiniShow from './mini-show.vue';
import CanvasRender from './canvas-render.vue';
import TimeLine from './time-line.vue';
import { PX_PER_MS } from './constants';
import { getClampedZoom, geClampedCenter } from './canvas-utils';
import FlameGraph from './index';

export default defineComponent({
  components: {
    MiniShow,
    CanvasRender,
    TimeLine,
  },
  props: {
    startTime: {
      type: Number,
      default: 0,
    },
    endTime: {
      type: Number,
      default: 0,
    },
    renderTrace: {
      type: Array as PropType<FlameGraph.RenderTrace[]>,
      default: () => [],
    },
    renderTraceMap: {
      type: Map as PropType<FlameGraph.RenderTraceMap>,
      default: () => new Map(),
    },
    viewportWidth: {
      type: Number,
      default: 0,
    },
    viewportHeight: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      isDragging: false,
      isDragMoved: false,
      selection: null,
      hovered: { measure: '' },
      center: 0,
      zoom: 0.2,
      minZoom: 1,
      verticalOffset: 0,
      extent: {
        startOffset: 0,
        endOffset: 0,
        size: 1,
      },
    };
  },
  methods: {
    init() {
      this.extent = this.getExtents();
      this.center = this.getInitialCenter();
      this.minZoom = this.getMinZoom();

      (this.$refs.minishow as typeof MiniShow).init();
      (this.$refs.timeline as typeof TimeLine).init();
      (this.$refs.canvasrender as typeof CanvasRender).init();
    },
    getInitialCenter() {
      return this.extent.startOffset + this.viewportWidth / PX_PER_MS / 2;
    },
    getExtents() {
      const { renderTrace } = this;
      const { startTime, endTime } = this;

      if (renderTrace.length >= 0 && startTime && endTime)
        return {
          startOffset: startTime,
          endOffset: endTime,
          size: endTime - startTime,
        };

      const startOffset = this.startTime ?? (renderTrace[0].measure?.startTime || 0);

      const lastTrace =
        renderTrace.length > 0
          ? renderTrace[renderTrace.length - 1]
          : {
              measure: {
                startTime: 0,
                duration: 0,
              },
            };
      const endOffset = this.endTime ?? (lastTrace.measure.startTime || 0) + (lastTrace.measure.duration || 0);
      return {
        startOffset,
        endOffset,
        size: endOffset - startOffset,
      };
    },
    handleStateChange(changeState: Record<string, unknown>) {
      Object.keys(changeState).forEach((key) => {
        if (key === 'zoom' && typeof changeState.zoom === 'number') {
          this.zoom = getClampedZoom(this.getMinZoom(), changeState.zoom);
        } else if (key === 'center' && typeof changeState.center === 'number') {
          const { startOffset, endOffset } = this.extent;
          this.center = geClampedCenter(startOffset, endOffset, changeState.center);
        } else this[key] = changeState[key];
      });
    },
    getMinZoom() {
      const { size } = this.extent;
      return this.viewportWidth / size;
    },
  },
});
</script>
