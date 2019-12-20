<template>
  <div id="iframe-demo">
    <label>地址栏：</label>
    <input
      id="address"
      name="url"
      ref="input"
      returnKeyType="go"
      :value="displayUrl"
      @endEditing="goToUrl"
      @keyup="onKeyUp"
    />
    <iframe id="iframe" ref="iframe" :src="url" @load="onLoad" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      url: 'https://v.qq.com',
      displayUrl: 'https://v.qq.com',
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
    min-height: 100vh;
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
