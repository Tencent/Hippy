<template>
  <div id="demo-dynamicimport" @click.stop="onClickLoadAsyncComponent">
    <div class="import-btn">
      <p>点我异步加载</p>
    </div>
    <div v-if="loaded" class="async-com-wrapper">
      <AsyncComponentFromLocal />
      <AsyncComponentFromHttp />
    </div>
    <router-view class="feature-content" />
  </div>
</template>

<script>
  import {
    defineAsyncComponent,
    defineComponent,
    ref,
  } from '@vue/runtime-core';

  export default defineComponent({
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

      AsyncComponentFromLocal: defineAsyncComponent(async () =>
        import(
          /* webpackMode: "lazy", webpackChunkName: "asyncComponentFromLocal" */ './dynamic-import/dynamic-import-local.vue'
        ),
      ),

      /**
       *  远程加载参考 AsyncComponentFromHttp，需显式指定chunk远程地址 customChunkPath，和chunk名称 webpackChunkName
       *  customChunkPath 会在运行时替换全局配置的publicPath
       *  import 出错时需在catch里做对应的降级方案
       */
      AsyncComponentFromHttp: defineAsyncComponent(async () =>
        import(
          /* webpackMode: "lazy",customChunkPath: "https://qc.vip.qq.com/", webpackChunkName: "asyncComponentFromHttp" */ './dynamic-import/dynamic-import-http.vue'
        ),
      ),
    },
    setup() {
      const loaded = ref(false);

      /**
       * 点击加载异步组件
       */
      const onClickLoadAsyncComponent = () => {
        loaded.value = true;
      };

      return {
        loaded,
        onClickLoadAsyncComponent,
      };
    },
  });
</script>

<style>
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
  .import-btn p {
    color: black;
    text-align: center;
    height: 40px;
    line-height: 40px;
  }
  .async-com-wrapper {
    margintop: 20px;
  }

  .feature-content {
    background-color: #fff;
  }
</style>
