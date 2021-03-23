<template>
  <div id="asynccomponent">
    <text class="async-txt">我是异步组件</text>
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
    justify-content: center;
    position: relative;
    height: 200px;
    width: 300px;
    background-color: #5dabfb;
    border-radius: 10px;
  }
  .async-txt{
    color: black;
  }
</style>
