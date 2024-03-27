<template>
  <ul class="feature-list">
    <li>
      <div id="version-info">
        <p class="feature-title">
          Vue: {{ Vue.version }}
        </p>
        <p
          v-if="Vue.Native"
          class="feature-title"
        >
          Hippy-Vue: {{ Vue.Native.version !== 'unspecified' ? Vue.Native.version : 'master' }}
        </p>
      </div>
    </li>
    <li>
      <p class="feature-title">
        浏览器组件 Demos
      </p>
    </li>
    <li
      v-for="feature in featureList"
      :key="feature.id"
      class="feature-item"
    >
      <router-link
        :to="{path: `/demo/${feature.id}`}"
        class="button"
      >
        {{ feature.name }}
      </router-link>
    </li>
    <li v-if="nativeFeatureList.length">
      <p class="feature-title" paintType="fcp">
        终端组件 Demos
      </p>
    </li>
    <li
      v-for="feature in nativeFeatureList"
      :key="feature.id"
      class="feature-item"
    >
      <router-link
        :to="{path: `/demo/${feature.id}`}"
        class="button"
      >
        {{ feature.name }}
      </router-link>
    </li>
  </ul>
</template>

<script>
import Vue from 'vue';
import demos from '../components/demos';
import nativeDemos from '../components/native-demos';

export default {
  name: 'App',
  data() {
    return {
      featureList: Object.keys(demos).map(demoId => ({
        id: demoId,
        name: demos[demoId].name,
      })),
      nativeFeatureList: Object.keys(nativeDemos).map(demoId => ({
        id: demoId,
        name: nativeDemos[demoId].name,
      })),
      Vue,
    };
  },
  /**
   * Hippy-Vue 的特殊生命周期方法
   *
   * 仅供 Android 使用。
   * 仅供绑定在 '/' 的根页面使用。
   * 仅供 VueRouter 的 disableAutoBack 参数为假时，绑定了 Back 按键返回时使用。
   *
   * 当 Android 上通过 Back 按键返回到根页面时，通过它可以确认是否需要继续退出，传入了一个 exit 方法，
   * 当确认步骤或者退出前处理完后，调用 exit() 即可退出 app。
   *
   * 如果 disableAutoBack = true 阻止了 Back 按键，也可以通过 this.router.history.exitApp() 退出 App
   * 但是这个方法仅限 Android 上通过 Back 按键到最顶页面时触发，其它页面不做响应。
   */
  beforeAppExit(/* exit */) {
    // 取消 exit() 的注释，即可阻止退出，在前面可以加上退出条件
    // exit();
  },
};
</script>

<style scoped>
.feature-list {
  overflow: scroll;
}

.feature-item {
  align-items: center;
  justify-content: center;
  display: flex;
  padding-top: 10px;
  padding-bottom: 10px;
}

.feature-title {
  color: #555;
  text-align: center;
}

.feature-item .button {
  display: block;
  border-style: solid;
  border-color: #40b883;
  border-width: 2px;
  border-radius: 10px;
  justify-content: center;
  align-items: center;
  width: 200px;
  height: 56px;
  line-height: 56px;
  font-size: 16px;
  color: #40b883;
  text-align: center;
}

#version-info {
  padding-top: 10px;
  padding-bottom: 10px;
  margin-bottom: 10px;
  border-bottom-width: 1px;
  border-style: solid;
  border-bottom-color: gainsboro;
}
</style>
