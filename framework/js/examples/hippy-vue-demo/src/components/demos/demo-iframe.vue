<template>
  <div
    id="iframe-demo"
    :style="iframeStyle"
  >
    <label>地址栏：</label>
    <input
      id="address"
      ref="input"
      name="url"
      returnKeyType="go"
      :value="displayUrl"
      @endEditing="goToUrl"
      @keyup="onKeyUp"
    >
    <iframe
      id="iframe"
      ref="iframe"
      :src="url"
      method="get"
      @load="onLoad"
      @loadStart="onLoadStart"
      @loadEnd="onLoadEnd"
    />
  </div>
</template>

<script>
import Vue from 'vue';

export default {
  data() {
    return {
      url: 'https://v.qq.com',
      displayUrl: 'https://v.qq.com',
      iframeStyle: {
        'min-height': Vue.Native ? 100 : '100vh',
      },
    };
  },
  methods: {
    onLoad(evt) {
      let { url } = evt;
      if (url === undefined) {
        url = this.$refs.iframe.src;
      }
      if (url !== this.url) {
        this.displayUrl = url;
      }
    },
    onLoadStart(evt) {
      const { url } = evt;
      console.log('onLoadStart', url);
    },
    onLoadEnd(evt) {
      const { url } = evt;
      console.log('onLoadEnd', url);
    },
    // Web compatible
    onKeyUp(evt) {
      if (evt.keyCode === 13) {
        evt.preventDefault();
        this.goToUrl({
          value: this.$refs.input.value,
        });
      }
    },
    goToUrl(evt) {
      this.url = evt.value;
    },
  },
};
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
