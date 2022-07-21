<template>
  <div id="demo-textarea">
    <label>多行文本:</label>
    <textarea
      v-model="content"
      :rows="10"
      placeholder="多行文本编辑器"
      class="textarea"
      @contentSizeChange="contentSizeChange"
    />
    <div class="output-container">
      <p class="output">
        输入的文本为：{{ content }}
      </p>
    </div>
    <label v-if="Platform === 'android'">textBreakStrategy={{ textBreakStrategy }}</label>
    <div v-if="Platform === 'android'">
      <textarea
        class="textarea"
        :defaultValue="longText"
        :textBreakStrategy="textBreakStrategy"
      />
      <div class="button-bar">
        <button
          class="button"
          @click="() => changeTextBreakStrategy('simple')"
        >
          <span>simple</span>
        </button>
        <button
          class="button"
          @click="() => changeTextBreakStrategy('highQuality')"
        >
          <span>highQuality</span>
        </button>
        <button
          class="button"
          @click="() => changeTextBreakStrategy('balanced')"
        >
          <span>balanced</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';

export default {
  data() {
    return {
      Platform: Vue.Native.Platform,
      content: 'The quick brown fox jumps over the lazy dog，快灰狐狸跳过了懒 🐕。',
      longText: 'The 58-letter name Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch is '
        + 'the name of a town on Anglesey, an island of Wales.',
      textBreakStrategy: 'simple',
    };
  },
  methods: {
    contentSizeChange(evt) {
      console.log(evt);
    },
    changeTextBreakStrategy(strategy) {
      this.textBreakStrategy = strategy;
    },
  },
};
</script>

<style scoped>
#demo-textarea {
  display: flex;
  align-items: center;
  flex-direction: column;
  margin: 7px;
}

#demo-textarea label {
  align-self: flex-start;
  font-weight: bold;
  margin-top: 5px;
  margin-bottom: 5px;
}

#demo-textarea .textarea {
  width: 300px;
  height: 150px;
  color: #242424;
  text-align: left;
  border-width: 1px;
  border-style: solid;
  border-color: #ccc;
  underline-color-android: #40b883;
  placeholder-text-color: #666;
  align-self: center;
}

#demo-textarea .output {
  word-break: break-all;
}

#demo-textarea .button-bar {
  flex-direction: row;
}

#demo-textarea .button {
  width: 100px;
  margin: 2px;
  backgroundColor: #eee;
  border-style: solid;
  border-color: black;
  border-width: 1px;
  align-items: center;
  flex-shrink: 1;
}
</style>
