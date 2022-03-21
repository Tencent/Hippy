<template>
  <div
    ref="inputDemo"
    class="demo-remote-input"
    @click="blurInput"
  >
    <div class="tips-wrap">
      <p
        v-for="(tip, i) in tips"
        :key="i"
        class="tips-item"
        :style="styles.tipText"
      >
        {{ i + 1 }}. {{ tip }}
      </p>
    </div>
    <input
      ref="input"
      v-model="bundleUrl"
      caret-color="yellow"

      placeholder="please input bundleUrl"
      :multiple="true"
      numberOfLines="4"
      class="remote-input"
      @click="stopPropagation"
    >
    <div
      class="buttonContainer"
      :style="styles.buttonContainer"
    >
      <button
        :style="styles.button"
        class="input-button"
        @click="openBundle"
      >
        <span :style="styles.buttonText">开始</span>
      </button>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
export default {
  data() {
    return {
      bundleUrl: 'http://127.0.0.1:38989/index.bundle?debugUrl=ws%3A%2F%2F127.0.0.1%3A38989%2Fdebugger-proxy',
      tips: [
        '安装远程调试依赖： npm i -D @hippy/debug-server-next@latest',
        '修改 webpack 配置，添加远程调试地址',
        '运行 npm run hippy:dev 开始编译，编译结束后打印出 bundleUrl 及调试首页地址',
        '粘贴 bundleUrl 并点击开始按钮',
        '访问调试首页开始远程调试，远程调试支持热更新（HMR）',
      ],
      styles: {
        tipText: {
          color: '#242424',
          marginBottom: 12,
        },
        button: {
          width: 200,
          height: 40,
          borderRadius: 8,
          backgroundColor: '#4c9afa',
          alignItems: 'center',
          justifyContent: 'center',
        },
        buttonText: {
          fontSize: 16,
          textAlign: 'center',
          lineHeight: 40,
          color: '#fff',
        },
        buttonContainer: {
          alignItems: 'center',
          justifyContent: 'center',
        },
      },
    };
  },
  methods: {
    blurInput(evt) {
      evt.stopPropagation();
      this.$refs.input.blur();
    },
    openBundle() {
      if (!this.bundleUrl) return;
      Vue.Native.callNative('TestModule', 'remoteDebug', this.$root.$options.rootViewId, this.bundleUrl);
    },
    stopPropagation(evt) {
      evt.stopPropagation();
    },
    clearTextContent() {
      this.bundleUrl = '';
    },
    getChildNodes(childNodes) {
      return !Vue.Native ? Array.from(childNodes) : childNodes;
    },
  },
};
</script>

<style scoped>
.demo-remote-input {
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
.input-label {
  margin: 20px;
  margin-bottom: 0;
}
.demo-remote-input .remote-input {
  width: 350px;
  height: 80px;
  color: #242424;
  border-width: 1px;
  border-color: #ccc;
  font-size: 16px;
  margin: 20px;
  placeholder-text-color: #aaa;
}
.demo-remote-input .input-button {
  border-color: #4c9afa;
  border-width: 1px;
  padding-left: 10px;
  padding-right: 10px;
  margin-top: 5px;
  margin-bottom: 5px;
  margin-left: 20px;
  margin-right: 20px;
}
.tips-wrap {
  margin-top: 20px;
  padding: 10px;
}
</style>
