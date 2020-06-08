<template>
  <div ref="inputDemo" class="demo-input" @click="blurAllInput">
    <label>文本:</label>
    <input
      placeholder="Text"
      class="input"
      v-model="text"
      ref="input"
      @click="stopPropagation"
      @keyboardWillShow="onKeyboardWillShow"
    />
    <div>
      <span>文本内容为：</span>
      <span>{{ text }}</span>
    </div>
    <button class="input-button" @click="clearTextContent" >
      <span>清空文本内容</span>
    </button>
    <button class="input-button" @click="focus" >
      <span>Focus</span>
    </button>
    <button class="input-button" @click="blur" >
      <span>Blur</span>
    </button>
    <label>数字:</label>
    <input
      type="number"
      placeholder="Number"
      class="input"
      @change="textChange"
      @click="stopPropagation"
    />
    <label>密码:</label>
    <input
      type="password"
      placeholder="Password"
      class="input"
      @change="textChange"
      @click="stopPropagation"
    />
    <label>文本（限制5个字符）:</label>
    <input
      maxlength=5
      placeholder="5 个字符"
      class="input"
      @change="textChange"
      @click="stopPropagation"
    />
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
  mounted() {
    this.getChildNodes(this.$refs.inputDemo.childNodes).find(element => element.tagName === 'input').focus();
  },
  methods: {
    /**
       * 当文字改变时输出
       */
    textChange(evt) {
      // 输入框的内容通过 evt.value 传递回来
      console.log(evt.value);
    },
    /**
       * 当点击顶部 View 时取消所有输入框的 focus 状态
       */
    blurAllInput() {
      this.getChildNodes(this.$refs.inputDemo.childNodes).filter(element => element.tagName === 'input').forEach(input => input.blur());
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
    onKeyboardWillShow(evt) {
      console.log(evt);
    },
    getChildNodes(childNodes) {
      return !Vue.Native ? Array.from(childNodes) : childNodes;
    },
    focus(evt) {
      evt.stopPropagation();
      this.$refs.input.focus();
    },
    blur(evt) {
      evt.stopPropagation();
      this.$refs.input.blur();
    },
  },
};
</script>

<style scope>
.demo-input {
  display: flex;
  flex: 1;
  align-items: center;
  flex-direction: column;
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
}
</style>
