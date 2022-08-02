<template>
  <div id="demo-img">
    <div id="demo-img-container">
      <label>Contain:</label>
      <img
        alt=""
        src="https://static.res.qq.com/nav/3b202b2c44af478caf1319dece33fff2.png"
        :placeholder="defaultImage"
        class="image contain"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
      />
      <label>Cover:</label>
      <img
        alt=""
        :placeholder="defaultImage"
        src="https://static.res.qq.com/nav/3b202b2c44af478caf1319dece33fff2.png"
        class="image cover"
      />
      <label>Center:</label>
      <img
        alt=""
        :placeholder="defaultImage"
        src="https://static.res.qq.com/nav/3b202b2c44af478caf1319dece33fff2.png"
        class="image center"
      />
      <label>Gif:</label>
      <img
        alt=""
        :placeholder="defaultImage"
        src="https://img.qdaily.com/article/article_show/20180226115511QR0IMWjcBZmo8FaV.gif"
        class="image cover"
      />
    </div>
  </div>
</template>
<script lang="ts">
  import { defineComponent } from '@vue/runtime-core';

  import defaultImage from '../../assets/defaultSource.jpg';
  import { warn } from '../../util';

  export default defineComponent({
    setup() {
      // img touch event is supported after hippy-vue 2.6.2
      const onTouchStart = (evt: Event) => {
        warn('onTouchDown', evt);
        evt.stopPropagation();
      };
      // img touch event is supported after hippy-vue 2.6.2
      const onTouchMove = (evt: Event) => {
        warn('onTouchMove', evt);
        evt.stopPropagation();
        warn(evt);
      };
      // img touch event is supported after hippy-vue 2.6.2
      const onTouchEnd = (evt: Event) => {
        warn('onTouchEnd', evt);
        evt.stopPropagation();
        warn(evt);
      };

      return {
        defaultImage,
        onTouchEnd,
        onTouchMove,
        onTouchStart,
      };
    },
  });
</script>
<style>
  #demo-img {
    overflow-y: scroll;
    flex: 1;
  }

  #demo-img #demo-img-container {
    display: flex;
    flex-direction: column;
  }

  #demo-img .image {
    width: 300px;
    height: 180px;
    margin: 30px;
    border-width: 1px;
    border-color: #40b883;
  }

  #demo-img .contain {
    resize-mode: contain;
  }

  #demo-img .cover {
    resize-mode: cover;
  }

  #demo-img .center {
    resize-mode: center;
  }
</style>
