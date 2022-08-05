<template>
  <div
    id="demo-dynamicimport"
    @click.stop="onClickLoadAsyncComponent"
  >
    <div class="import-btn">
      <p>点我异步加载</p>
    </div>
    <div
      v-if="loaded"
      class="async-com-wrapper"
    >
      <AsyncComponentFromLocal />
      <AsyncComponentFromHttp />
    </div>
    <router-view class="feature-content" />
  </div>
</template>

<script lang="ts">
import {
  defineAsyncComponent,
  defineComponent,
  ref,
} from '@vue/runtime-core';

export default defineComponent({
  components: {
    /**
     *  In versions that support dynamic loading, you can add magic comment 'webpackMode: "lazy"'
     *  It can also be omitted, the default mode is lazy.
     *
     *  In versions that do not support dynamic loading, 'webpackMode: "eager"' must be added explicitly.
     *  Or configure the maxChunks of LimitChunkCountPlugin to 1 to prevent subcontracting.
     *
     *  Currently, dynamic loading supports both local and remote modes, refer to the following：
     */

    /**
     *  Local loading reference AsyncComponentFromLocal.
     *  Writable or not, when local chunk needs to be loaded, global publicPath cannot be configured.
     *  When an import error occurs, the corresponding downgrade plan needs to be done in the catch.
     */

    AsyncComponentFromLocal: defineAsyncComponent(async () => import(/* webpackMode: "lazy", webpackChunkName: "asyncComponentFromLocal" */ './dynamic-import/dynamic-import-local.vue')),
    /**
     *  Remote Loading Reference AsyncComponentFromHttp,
     *  need to explicitly specify the chunk remote address, customChunkPath, chunk name and webpackChunkName.
     *  customChunkPath will replace the globally configured publicPath at runtime.
     *  When an import error occurs, the corresponding downgrade plan needs to be done in the catch.
     */
    AsyncComponentFromHttp: defineAsyncComponent(async () => (process.env.NODE_ENV === 'development'
      ? import(/* webpackMode: "lazy", webpackChunkName: "asyncComponentFromHttp" */ './dynamic-import/dynamic-import-http.vue')
      : import(/* webpackMode: "lazy",customChunkPath: "https://raw.githubusercontent.com/Tencent/Hippy/master/static/hippy-vue-next/", webpackChunkName: "asyncComponentFromHttp" */ './dynamic-import/dynamic-import-http.vue'))),
  },
  setup() {
    const loaded = ref(false);

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
