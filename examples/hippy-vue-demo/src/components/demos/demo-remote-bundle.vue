<template>
  <div
    ref="inputDemo"
    class="demo-input"
  >
    <label class="input-label">BundleURL:</label>
    <input
      ref="input"
      v-model="text"
      caret-color="yellow"
      placeholder="Text"
      class="input"
      @click="stopPropagation"
      @keyboardWillShow="onKeyboardWillShow"
    >
    <button
      class="input-button"
      @click="openBundle"
    >
      <span>打开 bundle</span>
    </button>
  </div>
</template>

<script>
import Vue from 'vue';
/**
   * 这个 Demo 里有直接操作 DOM 的章节
   */
export default {
  /**
     * 组件加载时自动 focus 第一个输入框
     */
  data() {
    return {
      text: '',
    };
  },
  methods: {
    openBundle() {
      Vue.Native.callNative('TestModule', 'debug', this.$root.$options.rootViewId, this.text);
    },
    /**
       * 点击输入框时，点击事件会冒泡到顶部 View 导致 focus 时又被 blur 了，所以这里需要阻止一下冒泡
       */
    stopPropagation(evt) {
      evt.stopPropagation();
    },
    clearTextContent() {
      this.text = '';
    },
    getChildNodes(childNodes) {
      return !Vue.Native ? Array.from(childNodes) : childNodes;
    },
  },
};
</script>

<style scoped>
.demo-input {
  display: flex;
  flex: 1;
  align-items: flex-start;
  flex-direction: column;
}
.input-label {
  margin: 20px;
  margin-bottom: 0;
}
.demo-input .input {
  width: 300px;
  height: 48px;
  color: #242424;
  border-width: 1px;
  border-color: #ccc;
  font-size: 16px;
  margin: 20px;
  placeholder-text-color: #aaa;
  /* underline-color-android: #40b883; */
}
.demo-input .input-button {
  border-color: #4c9afa;
  border-width: 1px;
  padding-left: 10px;
  padding-right: 10px;
  margin-top: 5px;
  margin-bottom: 5px;
  margin-left: 20px;
  margin-right: 20px;
}
</style>
