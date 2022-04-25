<template>
  <div>
    <div>
      <el-button icon="el-icon-check" round size="mini" type="danger" @click="start"> 采集 </el-button>
      <el-button icon="el-icon-close" round size="mini" type="danger" @click="end"> 停止 </el-button>
      <el-button icon="el-icon-delete" round size="mini" type="danger" @click="clear"> 清理 </el-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { getHeapMeta } from '@chrome-devtools-extensions/api';

let fetchHeapMetaInterval: NodeJS.Timer;

export default defineComponent({
  name: 'MemoryChart',
  components: {},
  data: () => ({
    isRecording: false,
  }),
  methods: {
    start() {
      this.isRecording = true;
      fetchHeapMetaInterval = setInterval(() => {
        this.getHeapMeta();
      }, 1000);
    },

    end() {
      this.isRecording = false;
      clearInterval(fetchHeapMetaInterval);
    },

    getHeapMeta() {
      return getHeapMeta().then((res) => {
        console.log('getHeapMeta res', res);
        return res;
      });
    },
  },
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
