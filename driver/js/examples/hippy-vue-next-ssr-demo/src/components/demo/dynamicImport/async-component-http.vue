<template>
  <div
    id="async-component-http"
    class="local-local"
  >
    <p class="async-txt">
      我是远程异步组件
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/runtime-core';

export default defineComponent({
  name: 'DynamicImportHttp',
});
</script>

<style>
  #async-component-http {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    height: 200px;
    width: 300px;
    background-color: #50ca92;
    border-radius: 10px;
    margin-bottom: 10px;
  }
  .async-txt {
    color: black;
  }
</style>
