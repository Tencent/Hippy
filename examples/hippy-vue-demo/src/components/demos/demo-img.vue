<template>
  <div id="demo-img">
    <div id="demo-img-container">
      <label>Contain:</label>
      <img @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd"
           :defaultSource="defaultImage" src="https://static.res.qq.com/nav/3b202b2c44af478caf1319dece33fff2.png" class="image contain" />
      <label>Cover:</label>
      <img :defaultSource="defaultImage" src="https://static.res.qq.com/nav/3b202b2c44af478caf1319dece33fff2.png" class="image cover" />
      <label>Center:</label>
      <img :defaultSource="defaultImage" src="https://static.res.qq.com/nav/3b202b2c44af478caf1319dece33fff2.png" class="image center" />
      <label>Gif:</label>
      <img :defaultSource="defaultImage" src="http://img.qdaily.com/article/article_show/20180226115511QR0IMWjcBZmo8FaV.gif" class="image cover" />
    </div>
  </div>
</template>
<script>
import defaultImage from '../../assets/defaultSource.jpg';

export default {
  data() {
    return {
      defaultImage,
    };
  },
  methods: {
    // img touch event is supported after hippy-vue 2.6.2
    onTouchStart(evt) {
      console.log('onTouchDown', evt);
      evt.stopPropagation();
    },
    // img touch event is supported after hippy-vue 2.6.2
    onTouchMove(evt) {
      console.log('onTouchMove', evt);
      evt.stopPropagation();
      console.log(evt);
    },
    // img touch event is supported after hippy-vue 2.6.2
    onTouchEnd(evt) {
      console.log('onTouchEnd', evt);
      evt.stopPropagation();
      console.log(evt);
    },
  },
};
</script>
<style scope>
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
