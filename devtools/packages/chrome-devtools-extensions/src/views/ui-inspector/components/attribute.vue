<template>
  <div class="attr-wrap">
    <multipane class="custom-resizer" layout="horizontal" @paneResizeStop="onPaneResizeStop">
      <div ref="pane0Ref" class="attr-sub-pane-wrap dom-pane" :style="{ display: showDomTree ? 'block' : 'none' }">
        <attr-form :node="selectedDomNode" title-class="action-bar" title="DOM Node" />
      </div>
      <multipane-resizer :style="{ display: showDomTree && showRenderTree ? 'block' : 'none' }" />
      <div class="attr-sub-pane-wrap" style="flex: 1" :style="{ display: showRenderTree ? 'block' : 'none' }">
        <attr-form :node="selectedRenderNode" title-class="action-bar" title="Render Node" />
      </div>
    </multipane>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, Ref, onMounted, toRefs } from 'vue';
import { useStore } from 'vuex';
import { Multipane, MultipaneResizer } from '@chrome-devtools-extensions/components/vue-multipane';
import { marginOrPaddingNormalize, borderNormalize } from '@chrome-devtools-extensions/utils/hippy-flex-normalize';
import AttrForm from './attr-form.vue';

const storageKey = 'ui_inspector_attr_pane_0_height';
export default defineComponent({
  name: 'Attribute',
  components: { AttrForm, Multipane, MultipaneResizer },
  setup() {
    const store = useStore();
    const pane0Height = localStorage.getItem(storageKey) || '50%';
    const pane0Ref = ref(null) as unknown as Ref<HTMLDivElement>;
    const { showDomTree, showRenderTree } = toRefs(store.state);
    onMounted(() => {
      if (showRenderTree.value) pane0Ref.value.style.height = pane0Height;
      else pane0Ref.value.style.height = '100%';
    });
    const onPaneResizeStop = (i, size) => {
      if (i === 0) localStorage.setItem(storageKey, size);
    };
    return {
      selectedDomNode: computed(() => {
        if (!store.state.selectedDomNode) return;
        const { selectedDomNode } = store.state;
        const node = {
          ...selectedDomNode,
          flexNodeStyle: {
            ...(selectedDomNode.flexNodeStyle || {}),
            margin: marginOrPaddingNormalize(selectedDomNode.flexNodeStyle?.margin),
            padding: marginOrPaddingNormalize(selectedDomNode.flexNodeStyle?.padding),
            border: borderNormalize(selectedDomNode.flexNodeStyle?.border),
          },
        };
        if (selectedDomNode.borderColor) {
          if (!node.flexNodeStyle.border) node.flexNodeStyle.border = {};
          if (node.flexNodeStyle.border) node.flexNodeStyle.border.color = selectedDomNode.borderColor;
        }
        delete node.child;
        return node;
      }),
      selectedRenderNode: computed(() => {
        if (!store.state.selectedRenderNode) return;
        const node = { ...store.state.selectedRenderNode };
        delete node.child;
        return node;
      }),
      onPaneResizeStop,
      pane0Ref,
      showDomTree,
      showRenderTree,
    };
  },
});
</script>

<style lang="scss" scoped>
.attr-wrap {
  overflow: auto;
  > .custom-resizer {
    height: 100%;
  }
  .attr-sub-pane-wrap {
    overflow: auto;
  }
  .title {
    text-align: left;
  }
  .attr-form {
    margin-bottom: 20px;
  }
  .dom-pane {
    height: 50%;
  }
}
:deep(.el-input__inner) {
  border-radius: 0;
}
:deep(.el-form-item.el-form-item--mini) {
  margin-bottom: 0;
}
</style>
