<template>
  <div ref="wrapperRef" class="demo-input" @click.stop="onClickBlurAllInput">
    <label>文本:</label>
    <input
      ref="inputRef"
      :value="text"
      placeholder="Text"
      class="input"
      @change="onChange"
      @click="stopPropagation"
      @keyboardWillShow="onKeyboardWillShow"
    />
    <div>
      <span>文本内容为：</span>
      <span>{{ text }}</span>
    </div>
    <button class="input-button" @click="clearTextContent">
      <span>清空文本内容</span>
    </button>
    <button class="input-button" @click="focus">
      <span>Focus</span>
    </button>
    <button class="input-button" @click="blur">
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
      :maxlength="5"
      placeholder="5 个字符"
      class="input"
      @change="textChange"
      @click="stopPropagation"
    />
  </div>
</template>
<script lang="ts">
  import {
    type HippyEvent,
    type HippyElement,
    type HippyInputElement,
  } from '@hippy/vue-next';
  import { defineComponent, nextTick, ref, onMounted } from '@vue/runtime-core';

  import { warn } from '../../util';

  /**
   * 点击输入框时，点击事件会冒泡到顶部 View 导致 focus 时又被 blur 了，所以这里需要阻止一下冒泡
   */
  const stopPropagation = (evt: HippyEvent) => {
    evt.stopPropagation();
  };

  /**
   * 当文字改变时输出
   */
  const textChange = (evt: HippyEvent) => {
    // 输入框的内容通过 evt.value 传递回来
    warn(evt.value);
  };

  /**
   * 输入事件内容
   *
   * @param evt
   */
  const onKeyboardWillShow = (evt: HippyEvent) => {
    warn(evt);
  };

  /**
   * 这个 Demo 里有直接操作 DOM 的章节
   */
  export default defineComponent({
    setup() {
      // 输入框的引用
      const wrapperRef = ref(null);
      const inputRef = ref(null);
      const text = ref('');
      /**
       * 获取当前所有input element
       */
      const getChildInputElements = (): HippyInputElement[] => {
        if (wrapperRef.value) {
          const inputWrapper: HippyElement = wrapperRef.value as HippyElement;

          if (inputWrapper.childNodes.length) {
            let inputItems: HippyElement[] =
              inputWrapper.childNodes as HippyElement[];

            inputItems = inputItems.filter(
              (element: HippyElement) => element.tagName === 'input',
            );

            return inputItems as HippyInputElement[];
          }
        }

        return [];
      };

      /**
       * 点击让所有输入框失焦
       */
      const onClickBlurAllInput = () => {
        const inputItems = getChildInputElements();

        if (inputItems.length) {
          inputItems.map((inputItem) => {
            inputItem.blur();

            return true;
          });
        }
      };

      /**
       * 清空内容
       */
      const clearTextContent = () => {
        text.value = '';
      };

      const focus = (evt: HippyEvent) => {
        evt.stopPropagation();
        if (inputRef.value) {
          (inputRef.value as HippyInputElement).focus();
        }
      };

      const blur = (evt: HippyEvent) => {
        evt.stopPropagation();
        if (inputRef.value) {
          (inputRef.value as HippyInputElement).focus();
        }
      };

      onMounted(() => {
        // mounted 后让第一个输入框获得焦点
        nextTick(() => {
          // 让第一个input 获得焦点
          const inputItems = getChildInputElements();

          if (inputItems.length) {
            // 默认让第一个input获得焦点

            inputItems[0].focus();
          }
        });
      });

      /**
       * 输入框内容改变
       *
       * @param event
       */
      const onChange = (event) => {
        if (event?.value) {
          text.value = event.value;
        }
      };

      return {
        inputRef,
        wrapperRef,
        text,
        blur,
        clearTextContent,
        focus,
        onClickBlurAllInput,
        onKeyboardWillShow,
        stopPropagation,
        textChange,
        onChange,
      };
    },
  });
</script>

<style>
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
