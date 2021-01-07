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
