<template>
  <div id="root">
    <!-- only for ssr, if you just use client side, remove it, use createApp options iPhone.statusBar instead -->
    <div
      v-if="isIOS"
      id="ios-status-bar"
      :style="iosStatusBarStyle"
    />
    <div id="header">
      <div class="left-title">
        <img
          v-show="!['/', '/debug', '/remote-debug'].includes(currentRoute.path)"
          id="back-btn"
          :src="backButtonImg"
          @click="goBack"
        >
        <label
          v-if="['/', '/debug', '/remote-debug'].includes(currentRoute.path)"
          class="title"
        >Hippy Vue Next {{ ssrMsg }}</label>
      </div>
      <label
        class="title"
      >{{ subTitle }}</label>
    </div>
    <div
      class="body-container"
      @click.stop="() => {}"
    >
      <!--  if you don't need keep-alive, just use '<router-view  />' -->
      <router-view v-slot="{ Component, route }">
        <keep-alive>
          <component
            :is="Component"
            :key="route.path"
          />
        </keep-alive>
      </router-view>
    </div>
    <div class="bottom-tabs">
      <div
        v-for="(tab, i) in tabs"
        :key="'tab-' + i"
        :class="['bottom-tab', i === activatedTab ? 'activated' : '']"
        @click.stop="navigateTo(tab, i)"
      >
        <span class="bottom-tab-text">
          {{ tab.text }}
        </span>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, onServerPrefetch } from '@vue/runtime-core';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { getScreenSize, isIOS } from './util';
import { IS_SSR, IS_SSR_MODE } from './env';
import { useAppStore } from './store';

import backButtonImg from './back-icon.png';

export default defineComponent({
  name: 'App',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const subTitle = ref('');
    const activatedTab = ref(0);
    const tabs = ref([
      {
        text: 'API',
        path: '/',
      },
      {
        text: '调试',
        path: '/remote-debug',
      },
    ]);
    const appStore = useAppStore();
    const { ssrMsg } = storeToRefs(appStore);
    const { getSsrMsg } = appStore;

    /**
       * go back
       */
    const goBack = () => {
      router.back();
    };

    /**
       * navigator to target tab
       */
    const navigateTo = (tab, i) => {
      if (i === activatedTab.value) {
        return;
      }

      // change tab
      activatedTab.value = i;

      // replace to target path
      router.replace({
        path: tab.path,
      });
    };

    // get ssr msg in ssr and non ssr client
    if (IS_SSR || !IS_SSR_MODE) {
      // onServerPrefetch: https://cn.vuejs.org/api/composition-api-lifecycle.html#onserverprefetch
      onServerPrefetch(async () => {
        await getSsrMsg();
      });
    }

    return {
      activatedTab,
      backButtonImg,
      currentRoute: route,
      subTitle,
      tabs,
      iosStatusBarStyle: {
        height: getScreenSize().statusBarHeight,
        backgroundColor: 4283416717,
      },
      ssrMsg,
      goBack,
      navigateTo,
      isIOS: isIOS(),
    };
  },
  watch: {
    $route(to) {
      if (to.name === undefined) {
        this.subTitle = '';
        return;
      }
      this.subTitle = to.name;
    },
  },
});
</script>
<style>
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
  align-items: center;
  justify-content: space-between;
  padding-horizontal: 10px;
}
#root .left-title {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
}
#root #back-btn {
  height: 20px;
  width: 24px;
  margin-top: 18px;
  margin-bottom: 18px;
}
#root .body-container {
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
  border-style: solid;
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
.bottom-tab.activated .bottom-tab-text {
  color: #4c9afa;
}
</style>
