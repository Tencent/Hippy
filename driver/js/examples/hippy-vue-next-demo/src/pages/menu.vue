<template>
  <ul class="feature-list">
    <li>
      <div id="version-info">
        <p class="feature-title">
          Vue: {{ version }}
        </p>
        <p
          v-if="Native"
          class="feature-title"
        >
          Hippy-Vue-Next: {{ Native.version !== 'unspecified' ? Native.version : 'master' }}
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
        :to="{ path: `/demo/${feature.id}` }"
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
        :to="{ path: `/demo/${feature.id}` }"
        class="button"
      >
        {{ feature.name }}
      </router-link>
    </li>
  </ul>
</template>
<script lang="ts">
import { defineComponent, onMounted, version } from '@vue/runtime-core';
import { Native } from '@hippy/vue-next';

import Demos from '../components/demo';
import NativeDemos from '../components/native-demo';

/** 路由类型 */
interface RouterList {
  [key: string]: {
    name: string;
  };
}

export default defineComponent({
  name: 'App',
  setup() {
    // list of currently supported feature routes
    const featureList = Object.keys(Demos).map(demoId => ({
      id: demoId,
      name: (Demos as RouterList)[demoId].name,
    }));

    // native function routing list
    const nativeFeatureList = Object.keys(NativeDemos).map(demoId => ({
      id: demoId,
      name: (NativeDemos as RouterList)[demoId].name,
    }));

    onMounted(() => {
      /**
       * In some scenarios, for example, when passing data to Native,
       * it is necessary to convert the ref object to the original object.
       * Otherwise, the native js code does not have the logic to parse ref, which will cause logic errors.
       */
      // console.log('data', testData, toRaw(testData));
    });

    return {
      featureList,
      nativeFeatureList,
      version,
      Native,
    };
  },
});
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
