<template>
  <div id="demo-textarea">
    <label>多行文本:</label>
    <textarea
      :value="content"
      :defaultValue="content"
      :rows="10"
      placeholder="多行文本编辑器"
      class="textarea"
      @change="content = $event.value"
      @contentSizeChange="contentSizeChange"
    />
    <div class="output-container">
      <p class="output">
        输入的文本为：{{ content }}
      </p>
    </div>
    <label v-if="!isIOS">break-strategy={{ breakStrategy }}</label>
    <div v-if="!isIOS">
      <textarea
        class="textarea"
        :defaultValue="longText"
        :break-strategy="breakStrategy"
      />
      <div class="button-bar">
        <button
          class="button"
          @click="() => changeBreakStrategy('simple')"
        >
          <span>simple</span>
        </button>
        <button
          class="button"
          @click="() => changeBreakStrategy('high_quality')"
        >
          <span>high_quality</span>
        </button>
        <button
          class="button"
          @click="() => changeBreakStrategy('balanced')"
        >
          <span>balanced</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/runtime-core';
import { isIOS } from '../../util';

export default defineComponent({
  setup() {
    const content = ref('The quick brown fox jumps over the lazy dog，快灰狐狸跳过了懒 🐕。');
    const breakStrategy = ref('simple');

    /**
       * After listening to the size change of the text box, output event info
       *
       * @param evt
       */
    const contentSizeChange = (evt: Event) => {
      console.log(evt);
    };

    const changeBreakStrategy = (strategy: string) => {
      breakStrategy.value = strategy;
    };

    return {
      content,
      breakStrategy,
      isIOS: isIOS(),
      longText: 'The 58-letter name Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch is the name of a town on Anglesey, an island of Wales.',
      contentSizeChange,
      changeBreakStrategy,
    };
  },
});
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
