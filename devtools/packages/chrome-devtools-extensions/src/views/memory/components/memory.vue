<template>
  <div class="memory-wrapper">
    <el-container class="memory-panel">
      <el-header class="memory-header" style="padding: 20px; height: unset">
        <el-row class="row-bg" justify="end" type="flex">
          <el-button-group size="mini">
            <el-button v-if="isLoadingSnapshot" :loading="true" size="mini" type="primary">
              snapshot读取中...
            </el-button>
            <el-button :loading="isRecording" icon="el-icon-check" size="mini" type="primary" @click="startRecord">
              采集
            </el-button>
            <el-button icon="el-icon-close" size="mini" type="primary" @click="stopCollectMemory"> 停止 </el-button>
            <el-button icon="el-icon-delete" size="mini" type="primary" @click="clearDatas"> 清理 </el-button>
          </el-button-group>
        </el-row>
      </el-header>
      <el-main class="memory-main">
        <div ref="memoryChartContainer" class="memory-chart-container" />
        <div>
          <h3 style="text-align: left">
            {{ selectedTime ? `${selectedTime}的内存快照：` : '请点击图表选择时刻查看内存快照' }}
          </h3>
          <memory-snapshot-table v-if="selectedTime" :source="snapshotTable" class="memory-snapshop-table" />
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import * as echarts from 'echarts';
import { fetchHeapCache, getHeapMeta } from '@chrome-devtools-extensions/api';
import dayjs from 'dayjs';
import { isDarkMode } from '@chrome-devtools-extensions/utils/dark-mode';
import MemorySnapshotTable from './memory-snapshot-table.vue';
import * as MemoryData from './memory-data';

let memoryChart: echarts.ECharts;
let option: echarts.EChartsOption;
let timer: NodeJS.Timeout;
let i = 0;
let clickParams: MemoryData.IMemoryChartPointerClickParams;
const heapDataList = Array(100);

export default defineComponent({
  components: { MemorySnapshotTable },
  data() {
    return {
      snapshotTable: [],
      // echarts data of x direction
      time: Array(100).fill(''),
      // echarts data of y direction
      coreData: Array(100),
      selectedTime: '',
      isRecording: false,
      isLoadingSnapshot: false,
      memoryExpandedArray: [MemoryData.CORE_MEMORY_STRING],
    };
  },
  watch: {
    '$store.state.device.list'(appConnect) {
      console.log('list', appConnect);
      this.onDeviceChange();
    },
    '$store.state.device.appConnect'(appConnect) {
      console.log('appConnect', appConnect);
      this.onAppStatusChange();
    },
  },
  mounted() {
    this.drawEChart();
  },
  destroyed() {
    console.log('memory page destroyed');
  },
  methods: {
    drawEChart() {
      const charts = this.$refs.memoryChartContainer as HTMLElement;
      if (charts !== null) {
        if (memoryChart) memoryChart.dispose();
        const theme = isDarkMode() ? 'dark' : '';
        memoryChart = echarts.init(charts, theme);
      }
      option = {
        dataZoom: [
          {
            filterMode: 'none',
            realtime: false,
            height: 25,
            start: 75,
            end: 100,
          },
        ],
        title: {},
        tooltip: {
          triggerOn: 'click',
          trigger: 'axis',
          enterable: true,
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#909399',
            },
          },
        },
        legend: {
          show: true,
          data: [MemoryData.CORE_MEMORY_STRING],
          icon: 'circle',
          textStyle: {
            fontSize: 14,
          },
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          axisPointer: {
            value: '',
            snap: true,
            lineStyle: {
              color: '#409EFF',
              width: 1,
            },
            label: {
              formatter: ((params: MemoryData.IMemoryChartPointerClickParams) =>
                this.onAxisPointerClick(params)) as any,
            },
            handle: {
              show: true,
              color: '#409EFF',
              icon: 'none',
            },
          },
          axisLabel: {
            interval: 1,
          },
          data: this.time,
        },
        yAxis: {
          type: 'value',
          scale: true,
          show: true,
          axisLabel: {
            formatter: '{value} M',
          },
        },
        series: [
          {
            name: MemoryData.CORE_MEMORY_STRING,
            type: 'line',
            // smooth: true,
            lineStyle: {
              width: 1,
            },
            symbol: 'none',
            // areaStyle: {},
            data: this.coreData,
            color: '#67C23A',
          },
        ],
      };
      memoryChart.setOption(option);
      memoryChart.getZr().on('click', () => {
        const { seriesData } = clickParams;
        if (clickParams.axisDimension === 'x') {
          this.selectedTime = (seriesData[0] as any).name;
          this.onValueClick(clickParams.value);
        } else if (clickParams.axisDimension === 'y') {
          this.onValueClick(seriesData[0].value);
        }
      });
      window.onresize = function () {
        memoryChart.resize();
      };
    },
    onAxisPointerClick(params: MemoryData.IMemoryChartPointerClickParams) {
      clickParams = params;
      return params.value;
    },
    addMemoryData(id, time: string, yValue: number) {
      this.time.push(time);
      this.time.shift();
      heapDataList.push({ id, time });
      heapDataList.shift();

      this.coreData.push(yValue);
      this.coreData.shift();

      this.updateEchartsData();
    },
    updateEchartsData() {
      memoryChart.setOption({
        xAxis: {
          data: this.time,
        },
        series: [
          {
            name: MemoryData.CORE_MEMORY_STRING,
            type: 'line',
            smooth: true,
            lineStyle: {
              width: 1,
            },
            symbol: 'none',
            data: this.coreData,
          },
        ],
      });
    },
    onValueClick(time: string) {
      memoryChart.setOption({
        xAxis: {
          axisPointer: {
            value: time,
          },
        },
      });
      this.loadTabData(time);
    },
    loadTabData(time: string) {
      this.fetchHeapMeta(time);
    },
    async fetchHeapMeta(time) {
      const item = heapDataList.find((v) => v && v.time === time);
      if (item) {
        const { id } = item;
        fetchHeapCache({ id }).then((res) => {
          this.snapshotTable = this.groupHeapMates(time, res.result.heapMetas) as any;
        });
      }
    },
    goToDetail() {
      return;
    },
    startRecord() {
      // this.openFile();
      timer = setInterval(this.doSendCoreRequest, 1000);
      this.isRecording = true;
    },
    stopCollectMemory() {
      clearInterval(timer);
      this.isRecording = false;
    },
    onReceivedMessage(id, rsp: MemoryData.IMemoryJsonData) {
      const sumByte = rsp.heapMetas.reduce(
        (accumulator: number, currentValue: MemoryData.IMemoryHeapMeta) =>
          accumulator + Number((currentValue as any).s || 0),
        0,
      );
      const memoryMSize = Number((sumByte / 1024 / 1024).toFixed(2));
      console.log(`onReceivedMessage core memorySize: ${memoryMSize}`);
      i = i + 1;
      const time = dayjs().format('HH:mm:ss');
      this.addMemoryData(id, time, memoryMSize);
    },
    doSendCoreRequest() {
      getHeapMeta().then((res) => {
        this.onReceivedMessage(res.id, res.result as MemoryData.IMemoryJsonData);
      });
    },
    groupHeapMates(rowKey: string, heapMetas: Array<MemoryData.IMemoryHeapMeta>): Array<MemoryData.MemoryTableMeta> {
      const groups = heapMetas
        .map((val) => (val as any).t)
        .reduce((acc: { [key: string]: Array<MemoryData.IMemoryHeapMeta> }, val, i) => {
          acc[val] = (acc[val] || []).concat(heapMetas[i]);
          return acc;
        }, {});

      const result = new Array<MemoryData.MemoryTableMeta>();
      let key: string;
      for (key in groups) {
        const value: Array<MemoryData.IMemoryHeapMeta> = groups[key];
        const size = value.reduce(
          (accumulator: number, currentValue: MemoryData.IMemoryHeapMeta) =>
            accumulator + Number((currentValue as any).s || 0),
          0,
        );
        const object: MemoryData.MemoryTableMeta = {
          size,
          count: value.length,
          type: key,
          detail: value,
          key: rowKey,
        };
        result.push(object);
      }
      return result;
    },
    clearDatas() {
      this.time = Array(100).fill('');
      this.coreData = Array(100);
      this.selectedTime = '';
      this.updateEchartsData();
      clearInterval(timer);
    },
    onMemoryExpandChanged(active: string) {
      console.log('onMemoryExpandChanged', active);
    },
    onDeviceChange() {
      console.log('[memory] onDeviceChange');
      this.stopCollectMemory();
    },
    onAppStatusChange() {
      console.log('[memory] onAppStatusChange');
      this.stopCollectMemory();
    },
  },
});
</script>

<style lang="scss" scoped>
.memory-wrapper {
  height: 100%;
}

.memory-header {
  font-family: PingFangSC-Medium;
  font-size: 14px;
  color: #999;
  text-align: center;
  line-height: 35px;
  flex: 0 0 35px;
}

.memory-main {
  // background-color: #fff;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
  padding-left: 10px;
  padding-right: 10px;
  width: 100%;
  flex: 1;
}

.memory-panel {
  display: flex;
  flex-direction: column;
  // background-color: #fff;
}

.memory-snapshop-table {
  background-color: transparent;
}

.memory-snapshop-table.el-table th,
.memory-snapshop-table.el-table tr {
  background-color: transparent;
}

.memory-chart-container {
  margin-top: 10px;
  margin-left: 0px;
  height: 300px;
  width: 90vw;
}

.el-tabs__item:hover {
  color: #f56c6c;
}

.el-tabs__item.is-active {
  color: #f56c6c;
}
</style>
