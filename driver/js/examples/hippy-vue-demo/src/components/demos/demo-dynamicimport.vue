<template>
  <div
    id="demo-dynamicimport"
    @click="onAsyncComponentLoad"
  >
    <div class="import-btn">
      <p>点我异步加载</p>
    </div>
    <div
      v-if="loaded"
      class="async-com-wrapper"
    >
      <AsyncComponentFromLocal class="async-component-outer-local" />
      <AsyncComponentFromHttp />
    </div>
  </div>
</template>

<script>
export default {
  components: {
    /**
     *  在支持动态加载的终端版本，可添加 magic comment 'webpackMode: "lazy"'，也可以不加，默认采用lazy模式;
     *
     *  在不支持动态加载的终端版本，必须显示添加 'webpackMode: "eager"'，
     *  或配置 LimitChunkCountPlugin 的 maxChunks 为 1 阻止分包;
     *
     *  目前动态加载同时支持本地和远程两种模式，参考如下：
     */

    /**
     *  本地加载参考 AsyncComponentFromLocal,
     *  webpackChunkName 可写可不写，当需要加载本地chunk时，不能配置全局 publicPath
     *  import 出错时需在catch里做对应的降级方案
     */
    AsyncComponentFromLocal: () => import(/* webpackMode: "lazy", webpackChunkName: "asyncComponentFromLocal" */'./dynamicImport/async-component-local.vue').then(res => res).catch(err => console.error('import async local component error', err)),

    /**
     *  远程加载参考 AsyncComponentFromHttp，需显式指定chunk远程地址 customChunkPath，和chunk名称 webpackChunkName
     *  customChunkPath 会在运行时替换全局配置的publicPath
     *  import 出错时需在catch里做对应的降级方案
     */
    AsyncComponentFromHttp: process.env.NODE_ENV === 'development' ? () => import(/* webpackMode: "lazy", webpackChunkName: "asyncComponentFromHttp" */'./dynamicImport/async-component-http.vue').then(res => res).catch(err => console.error('import async remote component error', err)) : () => import(/* webpackMode: "lazy",customChunkPath: "https://raw.githubusercontent.com/sohotz/Hippy/main/driver/js/static/hippy-vue/", webpackChunkName: "asyncComponentFromHttp" */'./dynamicImport/async-component-http.vue').then(res => res).catch(err => console.error('import async remote component error', err)),
  },
  data() {
    return {
      loaded: false,
    };
  },
  methods: {
    onAsyncComponentLoad() {
      this.loaded = true;
    },
  },
};
</script>

<style scoped>
.async-component-outer-local {
  height: 200px;
  width: 300px;
}
#demo-dynamicimport {
    flex: 1;
    display: flex;
    align-items: center;
    flex-direction: column;
    background-color: white;
}
.import-btn {
  margin-top: 20px;
  width: 130px;
  height: 40px;
  text-align: center;
  background-color: #40b883;
  flex-direction: row;
  border-radius: 5px;
  justify-content: center;
}
.import-btn p{
  color: black;
  text-align: center;
  height: 40px;
  line-height: 40px;
}
.async-com-wrapper {
  margin-top: 20px;
}
</style>
