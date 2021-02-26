<template>
  <div id="asynccomponent">
    <label>我是异步组件</label>
  </div>
</template>

<script>
export default {
  data() {
    return {
    };
  },
};
</script>

<style>
  #asynccomponent {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    height: 300;
    width: 400;
    background-color: #0055f0;
  }
</style>
