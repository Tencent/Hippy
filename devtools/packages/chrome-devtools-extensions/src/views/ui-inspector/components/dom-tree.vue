<template>
  <div>
    <div class="action-bar">Dom Tree</div>
    <el-tree
      ref="treeRef"
      :data="tree"
      :empty-text="emptyText"
      :props="treeProps"
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
  name: 'DomTree',
  components: {},
  setup() {
    const treeRef: Ref<typeof ElTree | null> = ref(null);
    const store = useStore();
    return {
      tree: computed(() => {
        const tree = store.state.domTree?.itree;
        return tree ? [tree] : null;
      }),
      treeProps: {
        label: 'nodeType',
        children: 'child',
      },
      defaultExpandedKeys: computed(() => {
        const { isSelectMode, domExpandedKeys } = store.state;
        if (!isSelectMode || !domExpandedKeys.length) return [];
        treeRef.value?.setCurrentKey(domExpandedKeys[0]);
        return domExpandedKeys;
      }),
      treeRef,
      emptyText: computed(() => (store.state.getDomTreeError ? '获取DOM树失败' : 'no data')),
      onNodeClick: (node) => {
        treeRef.value?.setCurrentKey(node.id);
        store.commit('selectDomNode', node);
        store.commit('setDomExpandedKeys', []);
      },
    };
  },
  methods: {},
});
</script>

<style lang="scss" scoped></style>
