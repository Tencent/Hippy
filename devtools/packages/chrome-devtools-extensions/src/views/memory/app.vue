<template>
  <memory />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Memory from '@chrome-devtools-extensions/views/memory/components/memory.vue';
import '@chrome-devtools-extensions/views/index.scss';

export default defineComponent({
  name: 'App',
  components: {
    Memory,
  },
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
