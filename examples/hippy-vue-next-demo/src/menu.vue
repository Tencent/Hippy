<template>
  <div class="wrapper">
    <ul class="feature-list">
      <li>
        <div id="version-info">
          <p class="feature-title">Vue版本: 3.2.21</p>
        </div>
      </li>
      <li>
        <p class="feature-title" @click.stop="onClickDemoTitle">组件 Demos</p>
      </li>
      <li
        v-for="feature in featureList"
        v-show="isShowDemoWrap"
        :key="feature.id"
        class="feature-item"
      >
        <router-link :to="{ path: `/demo/${feature.id}` }" class="button">
          {{ feature.name }}
        </router-link>
      </li>
      <li>
        <p class="feature-title">Native组件 Demos</p>
      </li>
      <li
        v-for="feature in nativeFeatureList"
        :key="feature.id"
        class="feature-item"
      >
        <router-link :to="{ path: `/demo/${feature.id}` }" class="button">
          {{ feature.name
          }}{{ feature.id === 'demoWaterfall' ? '-仅安卓' : '' }}
        </router-link>
      </li>
    </ul>
  </div>
</template>
<script lang="ts">
  import { toRaw, defineComponent, ref, onMounted } from '@vue/runtime-core';

  import demos from './components/demo';
  import nativeDemos from './components/native-demo';
  import { warn } from './util';

  /** 路由类型 */
  interface RouterList {
    [key: string]: {
      name: string;
    };
  }

  export default defineComponent({
    name: 'Menu',
    setup() {
      // 当前支持的功能路由列表
      const featureList = Object.keys(demos).map((demoId) => ({
        id: demoId,
        name: (demos as RouterList)[demoId].name,
      }));

      // native 功能路由列表
      const nativeFeatureList = Object.keys(nativeDemos).map((demoId) => ({
        id: demoId,
        name: (nativeDemos as RouterList)[demoId].name,
      }));

      // 验证 ref 数据格式
      const testData = ref({
        a: 1,
      });

      onMounted(() => {
        // 有些场景比如传递数据给 Native 时，需要对 ref 对象转为原始对象，否则 native 的 js 代码没有
        // 解 ref 的逻辑，会导致逻辑出错，例如：设置 native 节点的属性等，需要传入 js 原始对象，而非 proxy 对象
        warn('data', testData, toRaw(testData));
      });

      // 是否展示 demo 区域
      const isShowDemoWrap = ref(true);
      /**
       * 点击 demo 标题
       */
      const onClickDemoTitle = () => {
        // 切换展示和隐藏 demo 区域
        isShowDemoWrap.value = !isShowDemoWrap.value;
      };

      return {
        featureList,
        isShowDemoWrap,
        nativeFeatureList,
        onClickDemoTitle,
      };
    },
  });
</script>
<style>
  .wrapper {
    flex: 1;
  }

  .wrapper p,
  span {
    font-size: 24px;
  }

  .feature-list {
    display: flex;
    flex: 1;
    overflow: scroll;
  }

  .feature-item {
    align-items: center;
    justify-content: center;
    padding-top: 10px;
    padding-bottom: 10px;
  }

  .feature-title {
    color: #555;
    text-align: center;
  }

  .feature-item .button {
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
    border-bottom-color: gainsboro;
  }
</style>
