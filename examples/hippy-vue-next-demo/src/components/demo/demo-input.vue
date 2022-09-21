<template>
  <div
    ref="inputDemo"
    class="demo-input"
    @click.stop="blurAllInput"
  >
    <label>文本:</label>
    <input
      ref="input"
      placeholder="Text"
      caret-color="yellow"
      underline-color-android="grey"
      placeholder-text-color="#40b883"
      :editable="true"
      class="input"
      :value="text"
      @change="text = $event.value"
      @click="stopPropagation"
      @keyboardWillShow="onKeyboardWillShow"
      @keyboardWillHide="onKeyboardWillHide"
      @blur="onBlur"
      @focus="onFocus"
    >
    <div>
      <span>文本内容为：</span>
      <span>{{ text }}</span>
    </div>
    <div><span>{{ `事件: ${event} | isFocused: ${isFocused}` }}</span></div>
    <button
      class="input-button"
      @click.stop="clearTextContent"
    >
      <span>清空文本内容</span>
    </button>
    <button
      class="input-button"
      @click.stop="focus"
    >
      <span>Focus</span>
    </button>
    <button
      class="input-button"
      @click.stop="blur"
    >
      <span>Blur</span>
    </button>
    <label>数字:</label>
    <input
      type="number"
      caret-color="yellow"
      underline-color-android="grey"
      placeholder-text-color="#40b883"
      placeholder="Number"
      class="input"
      @change="textChange"
      @click="stopPropagation"
    >
    <label>密码:</label>
    <input
      type="password"
      caret-color="yellow"
      underline-color-android="grey"
      placeholder-text-color="#40b883"
      placeholder="Password"
      class="input"
      @change="textChange"
      @click="stopPropagation"
    >
    <label>文本（限制5个字符）:</label>
    <input
      :maxlength="5"
      caret-color="yellow"
      underline-color-android="grey"
      placeholder-text-color="#40b883"
      placeholder="5 个字符"
      class="input"
      @change="textChange"
      @click="stopPropagation"
    >
  </div>
</template>
<script lang="ts">
import {
  type HippyEvent,
  type HippyElement,
  type HippyInputElement,
  type HippyKeyboardEvent,
} from '@hippy/vue-next';
import { defineComponent, nextTick, ref, onMounted } from '@vue/runtime-core';

/**
   * When the input box is clicked, the click event bubbles up to the top View, so stopPropagation here
   */
const stopPropagation = (evt: HippyEvent) => {
  evt.stopPropagation();
};

/**
   * print content when text changes
   */
const textChange = (evt: HippyKeyboardEvent) => {
  console.log(evt.value);
};

/**
   * keyboard event
   *
   * @param evt
   */
const onKeyboardWillShow = (evt: HippyEvent) => {
  console.log('onKeyboardWillShow', evt);
};

/**
 * keyboard event
 */
const onKeyboardWillHide = () => {
  console.log('onKeyboardWillHide');
};

export default defineComponent({
  setup() {
    const inputDemo = ref(null);
    const input = ref(null);
    const text = ref('');
    const event = ref('');
    const isFocused = ref(false);
    /**
       * Get all current input elements
       */
    const getChildInputElements = (): HippyInputElement[] => {
      if (inputDemo.value) {
        const inputWrapper: HippyElement = inputDemo.value as HippyElement;

        if (inputWrapper.childNodes.length) {
          let inputItems: HippyElement[] = inputWrapper.childNodes as HippyElement[];

          inputItems = inputItems.filter((element: HippyElement) => element.tagName === 'input');

          return inputItems as HippyInputElement[];
        }
      }

      return [];
    };

    /**
       * Click to make all input boxes out of focus
       */
    const blurAllInput = () => {
      const inputItems = getChildInputElements();

      if (inputItems.length) {
        inputItems.map((inputItem) => {
          inputItem.blur();

          return true;
        });
      }
    };

    /**
       * clear content
       */
    const clearTextContent = () => {
      text.value = '';
    };

    const focus = (evt: HippyEvent) => {
      evt.stopPropagation();
      if (input.value) {
        (input.value as HippyInputElement).focus();
      }
    };

    const blur = (evt: HippyEvent) => {
      evt.stopPropagation();
      if (input.value) {
        (input.value as HippyInputElement).blur();
      }
    };

    onMounted(() => {
      nextTick(() => {
        // make the first input focus
        const inputItems = getChildInputElements();

        if (inputItems.length) {
          inputItems[0].focus();
        }
      });
    });

    /**
       * Change the content of the input box
       *
       * @param event
       */
    const onChange = (event) => {
      if (event?.value) {
        text.value = event.value;
      }
    };

    const onFocus = async () => {
      if (input.value) {
        isFocused.value = await (input.value as HippyInputElement).isFocused();
        event.value = 'onFocus';
      }
    };

    const onBlur = async () => {
      if (input.value) {
        isFocused.value = await (input.value as HippyInputElement).isFocused();
        event.value = 'onBlur';
      }
    };

    return {
      input,
      inputDemo,
      text,
      event,
      isFocused,
      blur,
      clearTextContent,
      focus,
      blurAllInput,
      onKeyboardWillShow,
      onKeyboardWillHide,
      stopPropagation,
      textChange,
      onChange,
      onBlur,
      onFocus,
    };
  },
});
</script>

<style scoped>
.demo-input {
  display: flex;
  flex: 1;
  align-items: center;
  flex-direction: column;
  margin: 7px;
}
.demo-input .input {
  width: 300px;
  height: 48px;
  color: #242424;
  border-width: 1px;
  border-style: solid;
  border-color: #ccc;
  font-size: 16px;
  margin: 20px;
}
.demo-input .input-button {
  border-color: #4c9afa;
  border-width: 1px;
  border-style: solid;
  padding-left: 10px;
  padding-right: 10px;
  margin-top: 5px;
  margin-bottom: 5px;
}
</style>
