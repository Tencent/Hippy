<template>
  <div
    id="root-wrapper"
    v-report="{
      notReport: !isLoaded,
      pageId: isOldUser ? 'pg_zplan_xiaowo_olduer' : 'pg_zplan_xiaowo_newuer',
      pageParams: {
        dt_appkey: '0DOU00GF3L42XIJR',
        zplan_external_entrance: 'dynamic',
        zplan_bullet_chat: 0,
      },
    }"
  >
    <div id="header">
      <img
        id="back-btn"
        v-report="{
          elementId: isOldUser
            ? 'em_zplan_entrance_xiaowo_olduer'
            : 'em_zplan_entrance_xiaowo_newuer',
          elementParams: {
            zplan_entrance_xiaowo_status: 0,
          },
        }"
        :src="backButtonImg"
        @click="goBack"
      />
      <label class="title" @click.stop="onClickDemo">Hippy Vue3 示例</label>
    </div>
    <router-view class="feature-content" />
    <!--  暂不支持keep-alive的写法，待修复  <router-view class="feature-content" v-slot="{ Component }">-->
    <!--      <keep-alive>-->
    <!--        <component :is="Component" />-->
    <!--      </keep-alive>-->
    <!--    </router-view>-->
  </div>
</template>
<script lang="ts">
  import { defineComponent, ref } from '@vue/runtime-core';
  import { useRouter } from 'vue-router';

  import backButtonImg from './back-icon.png';

  export default defineComponent({
    name: 'App',
    setup() {
      const isLoaded = ref(false);
      const isOldUser = ref(false);
      const router = useRouter();

      /**
       * 点击返回上一页
       */
      const goBack = () => {
        router.back();
      };

      /**
       * 点击标题
       */
      const onClickDemo = () => {
        // 变量获取成功
        isOldUser.value = true;

        // 数据加载成功，触发上报
        isLoaded.value = true;
      };

      return {
        backButtonImg,
        isLoaded,
        isOldUser,
        goBack,
        onClickDemo,
      };
    },
  });
</script>
<style>
  #root-wrapper {
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
    font-size: 0.4rem;
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
