<template>
  <div
    id="demo-textarea"
    ref="textareaRef"
    @click.stop="onClickBlurAllInput"
  >
    <label>多行文本:</label>
    <textarea
      :value="content"
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
  </div>
</template>

<script lang="ts">
import {
  type HippyElement,
  type HippyInputElement,
} from '@hippy/vue-next';
import { defineComponent, ref } from '@vue/runtime-core';

import { warn } from '../../util';

export default defineComponent({
  setup() {
    const textareaRef = ref(null);
    const content = ref('The quick brown fox jumps over the lazy dog，快灰狐狸跳过了懒 🐕。');

    /**
       * After listening to the size change of the text box, output event info
       *
       * @param evt
       */
    const contentSizeChange = (evt: Event) => {
      warn(evt);
    };

    const onClickBlurAllInput = () => {
      if (textareaRef.value) {
        const inputWrapper = textareaRef.value as HippyElement;

        // Find all text box nodes in child nodes and call the defocus interface
        if (inputWrapper.childNodes.length) {
          const elements: HippyElement[] =              inputWrapper.childNodes as HippyElement[];

          const matchedElement: HippyElement | undefined = elements.find(element => element.tagName === 'textarea');

          if (matchedElement) {
            (matchedElement as HippyInputElement).blur();
          }
        }
      }
    };

    return {
      content,
      textareaRef,
      contentSizeChange,
      onClickBlurAllInput,
    };
  },
});
</script>

<style>
  #demo-textarea {
    display: flex;
    flex: 1;
    align-items: center;
    flex-direction: column;
    margin: 7px;
  }

  #demo-textarea .textarea {
    width: 300px;
    height: 170px;
    color: #242424;
    text-align: left;
    border-width: 1px;
    border-color: #ccc;
    underline-color-android: #40b883;
    placeholder-text-color: #666;
  }

  .demo-textarea .output {
    word-break: break-all;
  }
</style>
