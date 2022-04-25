<template>
  <div v-if="title" :class="[titleClass, 'title']">
    {{ title }}
  </div>
  <el-form
    v-if="node"
    class="attr-form"
    size="mini"
    :model="node"
    :disabled="true"
    label-position="left"
    label-width="120px"
  >
    <el-form-item
      v-for="key in Object.keys(node)"
      :key="key"
      :class="[node[key] instanceof Object ? 'form-in-form' : '']"
      :label="key"
    >
      <el-input v-if="!(node[key] instanceof Object)" :model-value="String(node[key])" />
      <attr-form v-else :node="node[key]" />
    </el-form-item>
  </el-form>
  <div v-else class="no-node">未选择节点</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AttrForm',
  components: {},
  props: ['node', 'title', 'titleClass'],
});
</script>

<style lang="scss" scoped>
.title {
  text-align: left;
}
.no-node {
  font-size: 14px;
  margin-bottom: 20px;
}
.attr-form {
  // :deep(.el-form-item:not(:last-child)) {
  //   padding: 1px 0;
  //   border-bottom: 1px solid var(--border);
  // }
  // :deep(.el-form-item__content) {
  //   border-top: 1px solid var(--border);
  // }
  :deep(.form-in-form) {
    flex-direction: column;
    .el-form-item__content {
      margin-left: 20px;
    }
  }
  :deep(.el-input__inner) {
    border-radius: 0;
    // text-align: right;
  }
  :deep(.el-input) {
    &.is-disabled {
      .el-input__inner {
        cursor: text;
      }
    }
  }
  :deep(.el-form-item.el-form-item--mini) {
    margin-bottom: 0;
  }
}
</style>
