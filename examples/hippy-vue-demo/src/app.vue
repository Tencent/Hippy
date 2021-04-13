<template>
  <div id="root">
    <div id="header">
      <img
        @click="goToHome"
        v-show="subtitle !== DEBUG_SUBTITLE"
        :src="imgs.backButtonImg" id="back-btn"
      />
      <label class="title">Hippy Vue 示例</label>
      <label class="title" @click="remoteDebug">{{ subtitle }}</label>
    </div>
    <keep-alive>
      <router-view class="feature-content"></router-view>
    </keep-alive>
  </div>
</template>

<script>
import Vue from 'vue';
/* eslint import/no-webpack-loader-syntax: off */
import backButtonImg from '!!url-loader?modules!./back-icon.png';

let DEBUG_SUBTITLE = '';
if (Vue.Native) {
  DEBUG_SUBTITLE = '本地调试';
}

export default {
  name: 'App',
  watch: {
    $route(to) {
      if (to.name === undefined) {
        this.subtitle = DEBUG_SUBTITLE;
        return;
      }
      this.subtitle = to.name;
    },
  },
  data() {
    return {
      imgs: {
        backButtonImg,
      },
      subtitle: DEBUG_SUBTITLE,
      DEBUG_SUBTITLE,
    };
  },
  methods: {
    goToHome() {
      this.$router.back();
    },
    remoteDebug() {
      if (this.subtitle !== DEBUG_SUBTITLE || !Vue.Native) {
        return;
      }
      Vue.Native.callNative('TestModule', 'debug', this.$options.parent.$options.rootViewId);
    },
  },
};
</script>

<style scoped>
  #root {
    flex: 1;
    background-color: white;
  }
  #header {
    height: 60px;
    background-color: #40b883;
    display: flex;
    flex-direction: row;
    align-content: center;
    justify-content: space-between;
  }
  #back-btn {
    height: 24px;
    width: 24px;
    margin: 18px;
  }
  .row {
    flex-direction: row;
  }
  .column {
    flex-direction: column;
  }
  .center {
    justify-content: center;
    align-content: center;
  }
  .fullscreen {
    flex: 1;
  }
  .toolbar {
    display: flex;
    height: 40px;
    flex-direction: row;
  }
  .toolbar .toolbar-btn {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    justify-content: center;
    margin: 3px;
    border-style: solid;
    border-color: blue;
    border-width: 1px;
  }
  .row {
    flex-direction: row;
  }
  .column {
    flex-direction: column;
  }
  .center {
    justify-content: center;
    align-content: center;
  }
  .fullscreen {
    flex: 1;
  }
  .toolbar {
    display: flex;
    height: 40px;
    flex-direction: row;
  }
  .toolbar .toolbar-btn {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    justify-content: center;
    margin: 3px;
    border-style: solid;
    border-color: blue;
    border-width: 1px;
  }
  .toolbar .toolbar-btn p,
  .toolbar .toolbar-btn span {
    justify-content: center;
    text-align: center;
  }
  .toolbar .toolbar-text {
    line-height: 40px;
  }
  .title {
    font-size: 20px;
    line-height: 60px;
    margin-left: 5px;
    margin-right: 10px;
    font-weight: bold;
    background-color: #40b883;
    color: #ffffff;
  }
  .feature-content {
    background-color: #fff;
  }
</style>
