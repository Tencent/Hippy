<template>
  <div id="demo-dynamicimport" v-on:click="onAsyncComponentLoad">
    <label>点我异步加载</label>
    <div v-if="loaded">
        <AsyncComponent></AsyncComponent>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loaded: false,
    };
  },
  methods: {
    onAsyncComponentLoad() {
      console.log('load async component');
      this.loaded = true;
    },
  },
  components: {
    // 在已经支持动态加载的终端版本，可以加 /* webpackMode: "lazy" */，也可以不加，默认就是lazy模式；
    // 在不支持动态加载的终端版本，可以添加 /* webpackMode: "eager" */ 不进行分包
    AsyncComponent: () => import(/* webpackMode: "lazy" */ './dynamicImport/async-component.vue'),
  },
};
</script>

<style>
#demo-dynamicimport {
    display: flex;
    align-items: center;
    flex-direction: column;
}
</style>
