<template>
  <div id="root">
    <div id="header">
      <img
        v-show="!['/', '/debug', '/remote-debug'].includes($router.history.current.path)"
        id="back-btn"
        :src="imgs.backButtonImg"
        @click="goToHome"
      >
      <label class="title">Hippy Vue 示例</label>
      <label
        class="title"
      >{{ subtitle }}</label>
    </div>
    <div
      class="body-container"
      @click="($event) => $event.stopPropagation()"
    >
      <keep-alive>
        <router-view class="feature-content" />
      </keep-alive>
    </div>
    <div class="bottom-tabs">
      <div
        v-for="(tab, i) in tabs"
        :key="'tab-' + i"
        :class="['bottom-tab', i === activatedTab ? 'activated' : '']"
        @click="($event) => navigateTo($event, tab, i)"
      >
        <span class="bottom-tab-text">
          {{ tab.text }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import backButtonImg from './back-icon.png';

export default {
  name: 'App',
  data() {
    return {
      imgs: {
        backButtonImg,
      },
      subtitle: '',
      activatedTab: 0,
      tabs: [
        {
          text: 'API',
          path: '/',
        },
        {
          text: '调试',
          path: '/remote-debug',
        },
      ],
    };
  },
  watch: {
    $route(to) {
      if (to.name === undefined) {
        this.subtitle = '';
        return;
      }
      this.subtitle = to.name;
    },
  },
  methods: {
    navigateTo(event, tab, i) {
      if (i === this.activatedTab) return;
      event.stopPropagation();
      console.log(tab);
      this.activatedTab = i;
      this.$router.replace({ path: tab.path });
    },
    goToHome() {
      this.$router.back();
    },
  },
};
</script>

<style scoped>
  #root {
    flex: 1;
    background-color: white;
    display: flex;
    flex-direction: column;
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
    marginTop: 18px;
    margin-bottom: 18px;
    margin-left: 18px;
    margin-right: 0;
  }
  .body-container {
    flex: 1;
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
  .bottom-tabs {
    height: 48px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    background-color: #fff;
    border-top-width: 1px;
    border-top-color: #eee;
  }
  .bottom-tab {
    height: 48px;
    flex: 1;
    font-size: 16px;
    color: #242424;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }
  .bottom-tab:not(:last-child) {
    border-right-width: 1px;
    border-right-color: #eee;
  }
  .bottom-tab.activated .bottom-tab-text {
    color: #4c9afa;
  }
</style>
