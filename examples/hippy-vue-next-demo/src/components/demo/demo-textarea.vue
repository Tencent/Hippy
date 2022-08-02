<template>
  <div id="demo-textarea" ref="textareaRef" @click.stop="onClickBlurAllInput">
    <label>多行文本:</label>
    <textarea
      :value="content"
      :rows="10"
      placeholder="多行文本编辑器"
      class="textarea"
      @change="onChange"
      @contentSizeChange="contentSizeChange"
    />
    <div class="output-container">
      <p class="output">输入的文本为：{{ content }}</p>
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
      // textarea 引用
      const textareaRef = ref(null);
      // 文本框内容
      const content = ref(
        'The quick brown fox jumps over the lazy dog，快灰狐狸跳过了懒 🐕。',
      );

      /**
       * 文本框尺寸变更后通知事件
       *
       * @param evt
       */
      const contentSizeChange = (evt: Event) => {
        warn(evt);
      };

      /**
       * 点击让所有输入框失焦
       */
      const onClickBlurAllInput = () => {
        if (textareaRef.value) {
          const inputWrapper = textareaRef.value as HippyElement;

          // 找出子节点中所有的文本框节点并调用失焦接口
          if (inputWrapper.childNodes.length) {
            const elements: HippyElement[] =
              inputWrapper.childNodes as HippyElement[];

            const matchedElement: HippyElement | undefined = elements.find(
              (element) => element.tagName === 'textarea',
            );

            if (matchedElement) {
              (matchedElement as HippyInputElement).blur();
            }
          }
        }
      };

      /**
       * 输入框内容改变
       *
       * @param event
       */
      const onChange = (event) => {
        if (event?.value) {
          content.value = event.value;
        }
      };

      return {
        content,
        textareaRef,
        onChange,
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
