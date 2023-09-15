<template>
  <div
    id="iframe-demo"
    :style="iframeStyle"
  >
    <label>地址栏：</label>
    <input
      id="address"
      ref="input"
      name="targetUrl"
      returnKeyType="go"
      :value="displayUrl"
      @endEditing="goToUrl"
      @keyup="onKeyUp"
    >
    <iframe
      id="iframe"
      :ref="iframe"
      :src="targetUrl"
      method="get"
      @load="onLoad"
      @loadStart="onLoadStart"
      @loadEnd="onLoadEnd"
    />
  </div>
</template>

<script lang="ts">
import { Native, type HippyLoadResourceEvent, type HippyKeyboardEvent } from '@hippy/vue-next';
import { defineComponent, ref } from '@vue/runtime-core';

export default defineComponent({
  setup() {
    const targetUrl = ref('https://hippyjs.org');
    const displayUrl = ref('https://hippyjs.org');
    const input = ref(null);
    const iframe = ref(null);

    /**
       * 跳转到指定链接
       *
       * @param evt
       */
    const goToUrl = (evt) => {
      if (evt.value) {
        targetUrl.value = evt.value;
      }
    };

    /**
       * 加载完成
       *
       * @param evt
       */
    const onLoad = (evt: HippyLoadResourceEvent) => {
      let { url } = evt;
      if (url === undefined && iframe.value) {
        url = (iframe.value as HTMLIFrameElement).src;
      }

      if (url && url !== targetUrl.value) {
        displayUrl.value = url;
      }
    };
      // Web compatible
    const onKeyUp = (evt: HippyKeyboardEvent) => {
      if (evt.keyCode === 13) {
        evt.preventDefault();
        if (input.value) {
          goToUrl((input.value as HTMLInputElement).value);
        }
      }
    };

    const onLoadStart = (evt: HippyLoadResourceEvent) => {
      const { url } = evt;
      console.log('onLoadStart', url);
    };

    const onLoadEnd = (evt: HippyLoadResourceEvent) => {
      const { url, success, error } = evt;
      console.log('onLoadEnd', url, success, error);
    };

    return {
      targetUrl,
      displayUrl,
      iframeStyle: {
        'min-height': Native ? 100 : '100vh',
      },
      input,
      iframe,
      onLoad,
      onKeyUp,
      goToUrl,
      onLoadStart,
      onLoadEnd,
    };
  },
});
</script>

<style>
#iframe-demo {
  display: flex;
  flex: 1;
  flex-direction: column;
  margin: 7px;
}
#iframe-demo #address {
  height: 48px;
  border-color: #ccc;
  border-width: 1px;
  border-style: solid;
}

#iframe-demo #iframe {
  flex: 1;
  flex-grow: 1;
}
</style>
