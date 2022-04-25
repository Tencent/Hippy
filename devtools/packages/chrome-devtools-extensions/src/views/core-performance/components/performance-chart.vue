<template>
  <div ref="chart" :style="style" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import * as echarts from 'echarts';
import { isDarkMode } from '@chrome-devtools-extensions/utils/dark-mode';
import EChartOption = echarts.EChartsOption;
import ECharts = echarts.ECharts;

let chart: ECharts;
export default defineComponent({
  name: 'PerformanceChart',
  props: {
    width: {
      type: String,
      default: '100%',
    },
    height: {
      type: String,
      default: '200px',
    },
    option: {
      type: Object,
      default: {},
    },
  },
  computed: {
    style(): Record<string, unknown> {
      const { height, width } = this;
      return {
        height,
        width,
      };
    },
  },
  watch: {
    option: {
      handler(newVal: EChartOption) {
        if (chart) {
          this.$nextTick(() => {
            if (newVal) {
              chart.setOption(newVal);
            }
          });
        } else {
          this.init();
        }
      },
      deep: true,
    },
  },
  methods: {
    init() {
      enum Theme {
        Dark = 'dark',
        Light = 'light',
      }
      if (chart) chart.dispose();
      const theme = isDarkMode() ? Theme.Dark : Theme.Light;
      chart = echarts.init(this.$refs.chart as HTMLCanvasElement, theme);
      chart.setOption(this.option);
      chart.on('click', (params) => {
        const pointInPixel = [params.offsetX, params.offsetY];
        if (chart.containPixel('grid', pointInPixel)) {
          const xIndex = chart.convertFromPixel({ seriesIndex: 0 }, [params.offsetX, params.offsetY])[0];
          this.$emit('selected-option', xIndex);
        }
      });
    },
    resize() {
      chart.resize();
    },
  },
});
</script>
