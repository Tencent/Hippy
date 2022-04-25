<template>
  <div>
    <div class="action-bar">Render Tree</div>
    <el-tree
      ref="treeRef"
      :data="tree"
      :props="treeProps"
      :empty-text="emptyText"
      node-key="id"
      :default-expanded-keys="defaultExpandedKeys"
      :expand-on-click-node="false"
      highlight-current
      @node-click="onNodeClick"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, Ref, ref } from 'vue';
import { useStore } from 'vuex';
import { ElTree } from 'element-plus';

export default defineComponent({
  name: 'RenderTree',
  components: {},
  setup() {
    const treeRef: Ref<typeof ElTree | null> = ref(null);
    const store = useStore();
    return {
      tree: computed(() => {
        const tree = store.state.renderTree?.rtree;
        return tree ? [tree] : null;
      }),
      treeProps: {
        label: 'name',
        children: 'child',
      },
      defaultExpandedKeys: computed(() => {
        const { isSelectMode, renderExpandedKeys } = store.state;
        if (!isSelectMode || !renderExpandedKeys.length) return [];
        treeRef.value?.setCurrentKey(renderExpandedKeys[0]);
        return renderExpandedKeys;
      }),
      treeRef,
      emptyText: computed(() => (store.state.getRenderTreeError ? '获取render树失败' : 'no data')),
      onNodeClick: (node) => {
        treeRef.value?.setCurrentKey(node.id);
        store.commit('selectRenderNode', node);
        store.commit('setRenderExpandedKeys', []);
        store.dispatch('getSelectedRenderObject', node);
      },
    };
  },
  methods: {},
});
</script>

<style lang="scss" scoped></style>
