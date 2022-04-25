<template>
  <div class="performance-wrapper">
    <el-header style="padding: 20px">
      <el-row class="row-bg" justify="end" type="flex">
        <el-button-group size="mini">
          <el-button type="primary" :disabled="isStartBtnDisabled" icon="el-icon-check" size="mini" @click="start">
            开始
          </el-button>
          <el-button type="primary" :disabled="isEndBtnDisabled" icon="el-icon-close" size="mini" @click="stop">
            结束
          </el-button>
          <el-button type="primary" :disabled="isClearBtnDisabled" icon="el-icon-delete" size="mini" @click="clear">
            清空
          </el-button>
          <el-button
            type="primary"
            :disabled="isClearBtnDisabled"
            icon="el-icon-download"
            size="mini"
            @click="exportData"
          >
            导出
          </el-button>
        </el-button-group>
      </el-row>
    </el-header>
    <div class="tip">
      <div v-show="isInitState" class="init main-text">
        请点击 “开始” 按钮开始收集性能数据，点击 “结束” 按钮结束收集
        <div class="sub-tip accent-text">
          由于记录的是实时性能数据，在点击“开始”后的数据收集时间内，请确保页面有进行“渲染”或者触发了一些“JS
          事件”，否则收集到的数据可能为空
        </div>
      </div>
      <div v-show="isCollectingState" class="collecting main-text">
        <i class="el-icon-loading" style="font-size: 18px" /> 数据收集中......
      </div>
      <div v-show="isAnalysingState" class="analysing main-text">
        <i class="el-icon-loading" style="font-size: 18px" /> 数据解析中......
      </div>
    </div>
    <div v-if="isCollectedState" style="margin: 10px 15px">
      <h4 class="main-text">帧率统计：</h4>
      <performance-chart ref="chartRef" :option="option" class="charts" />
      <h4 class="main-text">Core 堆栈数据</h4>
      <flame-graph
        ref="coreFlamegraphRef"
        :end-time="endTime"
        :start-time="startTime"
        :render-trace="renderCoreTrace"
        :render-trace-map="renderCoreTraceMap"
        :viewport-height="viewportHeight"
        :viewport-width="viewportWidth"
        class="flame-graph"
      />
      <h4 class="main-text">JS 堆栈数据</h4>
      <flame-graph
        ref="v8flamegraphRef"
        :end-time="isIOS && renderV8Trace.length ? 0 : endTime"
        :start-time="isIOS && renderV8Trace.length ? 0 : startTime"
        :render-trace="renderV8Trace"
        :render-trace-map="renderV8TraceMap"
        :viewport-height="viewportHeight"
        :viewport-width="viewportWidth"
        class="flame-graph"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, nextTick, toRefs, ref, Ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import lodashThrottle from 'lodash.throttle';
import cloneDeep from 'lodash.clonedeep';
import { getWSUrlParam } from '@chrome-devtools-extensions/utils';
import { DevicePlatform, OperatState } from '@chrome-devtools-extensions/@types/enum';
import { addTraceDataCollectedListener, removeTraceDataCollectedListener } from '@chrome-devtools-extensions/api';
import PerformanceChart from './components/performance-chart.vue';
import FlameGraph from './components/flame-graph/index.vue';
import { echartOption } from './chart-option';
import { EVENT_MAP as STORE_EVENT_MAP } from './store';
import '@chrome-devtools-extensions/views/index.scss';

const isFixed = true;
const chartHeight = 200;
const headerHeight = 30;
const offsetLeft = 50;
const offsetRight = 50;
const height = isFixed ? 400 : window.innerHeight - chartHeight - headerHeight;
const width = window.innerWidth - (offsetLeft + offsetRight);
const isIOS = getWSUrlParam('platform') === DevicePlatform.IOS;

export default defineComponent({
  name: 'Performance',
  components: {
    FlameGraph,
    PerformanceChart,
  },
  setup() {
    const store = useStore();
    const {
      renderCoreTrace,
      renderCoreTraceMap,
      renderV8Trace,
      renderV8TraceMap,
      startTime,
      endTime,
      operatState,
      timelineEventsStr,
    } = toRefs(store.state);
    const {
      isStartBtnDisabled,
      isEndBtnDisabled,
      isClearBtnDisabled,
      isInitState,
      isCollectingState,
      isAnalysingState,
      isCollectedState,
    } = toRefs(store.getters);

    const viewportWidth = ref(width);
    const viewportHeight = ref(height);
    const chartRef = ref(null) as unknown as Ref<typeof PerformanceChart>;
    const coreFlamegraphRef = ref(null) as unknown as Ref<typeof FlameGraph>;
    const v8flamegraphRef = ref(null) as unknown as Ref<typeof FlameGraph>;
    onMounted(() => {
      window.onresize = lodashThrottle(
        () => {
          viewportWidth.value = window.innerWidth - (offsetLeft + offsetRight);
          if (chartRef) chartRef.value.resize();
        },
        400,
        { leading: true },
      );
    });

    const initVisualization = () => {
      store.commit(STORE_EVENT_MAP.mutations.SetOperateState, OperatState.Collected);
      nextTick(() => {
        chartRef.value.init();
        coreFlamegraphRef.value.init();
        v8flamegraphRef.value.init();
      });
    };
    return {
      renderCoreTrace,
      renderCoreTraceMap,
      renderV8Trace,
      renderV8TraceMap,
      startTime,
      endTime,
      operatState,
      timelineEventsStr,
      isStartBtnDisabled,
      isEndBtnDisabled,
      isClearBtnDisabled,
      isInitState,
      isCollectingState,
      isAnalysingState,
      isCollectedState,
      viewportWidth,
      viewportHeight,
      chartRef,
      coreFlamegraphRef,
      v8flamegraphRef,
      initVisualization,
    };
  },
  data() {
    return {
      option: echartOption,
      isIOS,
    };
  },
  created() {
    if (isIOS) {
      addTraceDataCollectedListener(this.onTraceDataCollected);
    }
  },
  beforeDestroy() {
    removeTraceDataCollectedListener(this.onTraceDataCollected);
  },
  methods: {
    onTraceDataCollected(error, json) {
      this.$store.dispatch(STORE_EVENT_MAP.actions.SetV8Trace, { error, json });
      this.initVisualization();
    },
    start() {
      this.$store.dispatch(STORE_EVENT_MAP.actions.Start);
    },
    stop() {
      this.$store.dispatch(STORE_EVENT_MAP.actions.End);
      this.$store.dispatch(STORE_EVENT_MAP.actions.GetFrameTimings).then((data) => {
        this.refreshChartData(data);
      });
      this.$store.dispatch(STORE_EVENT_MAP.actions.GetTimeline).then(() => {
        this.initVisualization();
      });
      if (!isIOS) {
        this.$store.dispatch(STORE_EVENT_MAP.actions.GetV8Trace).then(() => {
          this.initVisualization();
        });
      }
    },
    refreshChartData(data) {
      const { ui, raster, maxXAxis } = data;
      const newOption = cloneDeep(this.option);
      newOption.series[0].data = raster;
      newOption.series[1].data = ui;
      newOption.xAxis.max = maxXAxis;
      this.option = newOption;
    },
    clear() {
      this.refreshChartData([[], [], 0]);
      this.$store.dispatch(STORE_EVENT_MAP.actions.Clear);
      this.$store.commit(STORE_EVENT_MAP.mutations.SetOperateState, OperatState.Init);
    },
    exportData() {
      const dataStr = this.timelineEventsStr;
      const dataUri = `data:application/json;charset=utf-8,+ ${encodeURIComponent(dataStr)}`;
      const exportFileDefaultName = `tdf_devtools_events_${new Date().getTime()}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    },
  },
});
</script>

<style lang="scss" scoped>
.performance-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: scroll;
}
.charts {
  height: 200px;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
.flame-graph {
  padding: 0 20px;
  width: 100%;
  box-sizing: border-box;
}
.tip {
  position: absolute;
  left: 50%;
  top: 34%;
  width: 70%;
  transform: translate(-50%, 0);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 18px;
  .sub-tip {
    padding-top: 10px;
    font-size: 14px;
    color: #666;
    text-align: center;
  }
}
</style>
