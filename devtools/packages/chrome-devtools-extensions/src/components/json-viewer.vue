<template>
  <div class="monaco-wrap">
    <div class="monaco-title-row">
      <div class="monaco-title">
        {{ title }}
      </div>
    </div>
    <div ref="monacoRef" class="monaco" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, Ref, ref, watch } from 'vue';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { isDarkMode } from '@chrome-devtools-extensions/utils/dark-mode';

export default defineComponent({
  name: 'JsonViewer',
  components: {},
  props: {
    title: {
      type: String,
      default: '',
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
    modelValue: {
      type: String,
      default: '',
    },
    language: {
      type: String,
      default: 'json',
    },
  },
  setup(props, { emit }) {
    const monacoRef = ref(null) as unknown as Ref<HTMLDivElement>;
    onMounted(() => {
      const theme = isDarkMode() ? 'vs-dark' : 'vs';
      const editor = monaco.editor.create(monacoRef.value, {
        value: props.modelValue,
        language: props.language,
        automaticLayout: true,
        theme,
        readOnly: props.readOnly,
      });
      if (!editor) return;
      if (props.readOnly) {
        watch(
          () => props.modelValue,
          (newValue) => {
            editor.setValue(newValue);
          },
        );
      }
      editor.onDidChangeModelContent(() => {
        const value = editor.getValue();
        emit('update:modelValue', value);
      });
    });

    return {
      monacoRef,
    };
  },
});
</script>

<style lang="scss" scoped>
.monaco-wrap {
  height: 100%;
  overflow: hidden;
}
.monaco {
  height: 100%;
}

.monaco-title-row {
  width: 100%;
  height: 30px;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  background: var(--monaco-title-row-bg);
  border-top: 1px solid var(--border);
  margin-top: 2px;
  .monaco-title {
    background: var(--bg);
    color: var(--accent);
    padding: 5px 10px;
    background: var(--monaco-title-bg);
    font-size: 12px;
    color: green;
    height: 100%;
    box-sizing: border-box;
  }
}
</style>
