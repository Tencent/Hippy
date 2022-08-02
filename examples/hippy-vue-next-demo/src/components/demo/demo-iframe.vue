<template>
  <div
    id="iframe-demo"
    :style="iframeStyle"
  >
    <label>地址栏：</label>
    <input
      id="address"
      ref="inputRef"
      name="targetUrl"
      returnKeyType="go"
      :value="displayUrl"
      @endEditing="goToUrl"
      @keyup="onKeyUp"
    >
    <iframe
      id="iframe"
      :ref="iframeRef"
      :src="targetUrl"
      @load="onLoad"
    />
  </div>
</template>

<script lang="ts">
import { Native, type HippyEvent } from '@hippy/vue-next';
import { defineComponent, ref } from '@vue/runtime-core';

export default defineComponent({
  setup() {
    const targetUrl = ref('https://v.qq.com');
    const displayUrl = ref('https://v.qq.com');
    const inputRef = ref(null);
    const iframeRef = ref(null);

    /**
       * 跳转到指定链接
       *
       * @param url
       */
    const goToUrl = (url: string) => {
      if (url) {
        targetUrl.value = url;
      }
    };

    /**
       * 加载完成
       *
       * @param evt
       */
    const onLoad = (evt: HippyEvent) => {
      let { url } = evt;
      if (url === undefined && iframeRef.value) {
        url = (iframeRef.value as HTMLIFrameElement).src;
      }

      if (url && url !== targetUrl.value) {
        displayUrl.value = url;
      }
    };
      // Web compatible
    const onKeyUp = (evt: HippyEvent) => {
      if (evt.keyCode === 13) {
        evt.preventDefault();

        if (inputRef.value) {
          goToUrl((inputRef.value as HTMLInputElement).value);
        }
      }
    };

    return {
      targetUrl,
      displayUrl,
      iframeStyle: {
        'min-height': Native ? 100 : '100vh',
      },
      inputRef,
      iframeRef,
      onLoad,
      onKeyUp,
      goToUrl,
    };
  },
});
</script>

<style>
  #iframe-demo {
    display: flex;
    flex: 1;
    flex-direction: column;
  }
  #iframe-demo #address {
    height: 48px;
    border-color: #ccc;
    border-width: 1px;
  }

  #iframe-demo #iframe {
    flex: 1;
    flex-grow: 1;
  }
</style>
