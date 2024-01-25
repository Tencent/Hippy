<template>
  <div
    class="async-component-local"
  >
    <p class="async-txt">
      我是本地异步组件
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/runtime-core';

export default defineComponent({
  name: 'DynamicImportLocal',
});
</script>

<style scoped>
  .async-component-local {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    background-color: #50ca92;
    border-radius: 10px;
    margin-bottom: 10px;
  }
  .async-txt {
    color: black;
  }
</style>
