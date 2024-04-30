<template>
  <div class="async-component-local">
    <text class="async-txt">
      我是本地异步组件
    </text>
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

<style scoped>
  .async-component-local {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    border-radius: 10px;
    margin-bottom: 10px;
    background-color: #50ca92;
  }
  .async-txt{
    color: black;
  }
</style>
