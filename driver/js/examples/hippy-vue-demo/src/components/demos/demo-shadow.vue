<template>
  <div id="shadow-demo">

    <div
      v-if="Platform==='android'"
      class="no-offset-shadow-demo-cube-android"
    >
      <div class="no-offset-shadow-demo-content-android">
        <p>没有偏移阴影样式</p>
      </div>
    </div>
    <div
      v-if="Platform==='ios'"
      class="no-offset-shadow-demo-cube-ios"
    >
      <div class="no-offset-shadow-demo-content-ios">
        <p>没有偏移阴影样式</p>
      </div>
    </div>
    <div
      v-if="Platform==='ohos'"
      class="no-offset-shadow-demo-cube-ohos"
    >
      <div class="no-offset-shadow-demo-content-ohos">
        <p>没有偏移阴影样式</p>
      </div>
    </div>

    <div
      v-if="Platform==='android'"
      class="offset-shadow-demo-cube-android"
    >
      <div class="offset-shadow-demo-content-android">
        <p>偏移阴影样式</p>
      </div>
    </div>
    <div
      v-if="Platform==='ios'"
      class="offset-shadow-demo-cube-ios"
    >
      <div class="offset-shadow-demo-content-ios">
        <p>偏移阴影样式</p>
      </div>
    </div>
    <div
      v-if="Platform==='ohos'"
      class="offset-shadow-demo-cube-ohos"
    >
      <div class="offset-shadow-demo-content-ohos">
        <p>偏移阴影样式</p>
      </div>
    </div>

  </div>
</template>
<script>
import Vue from 'vue';

export default {
  data() {
    return {
      Platform: Vue.Native.Platform,
    };
  },
  mounted() {
    this.Platform = Vue.Native.Platform;
  },
};
</script>
<style scoped>
  #shadow-demo {
    flex: 1;
  }

  /**
   * P.S. Android shadow size is based on the container size
   * and a solid shadow background exists.
   * You should make content fully cover the solid shadow background
   * whose size is determined by container size, shadowRadius and shadowOffset,
   * so Android container with shadow(170*170) should be bigger than content(160*160),
   * and set some offset(e.g. top or left) for content to cover shadow background.
   *
   * boxShadow consists attrs as follow：boxShadowOpacity，boxShadowRadius，boxShadowColor，
   * boxShadowOffsetX，boxShadowOffsetY，boxShadowSpread(iOS only).
   *
   * 注意: Android的阴影大小根据容器体积大小来决定，通过在容器上对矩形view做阴影来实现，阴影会有一个实体的背景色。
   * 因此必须用content内容去遮挡住阴影的实体背景，该背景由容器大小、阴影圆角和阴影偏移共同决定。
   * Android带有阴影的Container容器大小(170*170)必须大于Content内容的大小(160*160)，
   * 同时要将Content内容做一定的偏移（如top或者left）来遮盖阴影背景。
   *
   * boxShadow支持以下属性：box-shadow-opacity，box-shadow-radius，box-shadow-color，
   * box-shadow-offset, box-shadow-offset-x，box-shadow-offset-y，box-shadow-spread(仅iOS).
   *
   * if you use border-radius, Android container & content both should be set.
   * 如果设置了border-radius，在Android上必须同时在Container容器和Content内容同时设置该属性。
   */
  #shadow-demo .no-offset-shadow-demo-cube-android {
    position: absolute;
    left: 50px;
    top: 50px;
    width: 170px;
    height: 170px;
    box-shadow-opacity: 0.6;
    box-shadow-radius: 5;
    box-shadow-color: #098a29;
    /* container & content should both set radius */
    /* 容器和内容都要设置border-radius */
    border-radius: 5px;
  }

  #shadow-demo .no-offset-shadow-demo-content-android {
    position: absolute;
    /* android set left & top offset to cover shadow solid background */
    /* android 设置left和top偏移来遮挡阴影实体背景 */
    left: 5px;
    top: 5px;
    width: 160px;
    height: 160px;
    background-color: grey;
    border-radius: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  #shadow-demo .no-offset-shadow-demo-content-android p {
    color: white;
  }

  /**
   * ios
   */
  #shadow-demo .no-offset-shadow-demo-cube-ios {
    position: absolute;
    left: 50px;
    top: 50px;
    width: 160px;
    height: 160px;
    box-shadow-opacity: 0.6;
    box-shadow-radius: 5;
    /* spread attr is only supported on iOS */
    /* spread 属性仅适用于iOS */
    box-shadow-spread: 1;
    box-shadow-color: #098a29;
    /* container & content should both set radius */
    /* 容器和内容都要设置border-radius */
    border-radius: 5px;
  }

  #shadow-demo .no-offset-shadow-demo-content-ios {
    width: 160px;
    height: 160px;
    background-color: grey;
    border-radius: 5px;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  #shadow-demo .no-offset-shadow-demo-content-ios p {
    color: white;
  }

  /**
   * ohos
   */
  #shadow-demo .no-offset-shadow-demo-cube-ohos {
    position: absolute;
    left: 50px;
    top: 50px;
    width: 160px;
    height: 160px;
    box-shadow-opacity: 0.6;
    box-shadow-radius: 5;
    box-shadow-color: #098a29;
    /* container & content should both set radius */
    /* 容器和内容都要设置border-radius */
    border-radius: 5px;
  }

  #shadow-demo .no-offset-shadow-demo-content-ohos {
    width: 160px;
    height: 160px;
    background-color: grey;
    border-radius: 5px;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  #shadow-demo .no-offset-shadow-demo-content-ohos p {
    color: white;
  }

  /**
   * P.S. Android shadow size is based on the container size
   * and a solid shadow background exists.
   * Shadow offset is not fully supported on Android.
   * if you have to use boxShadowOffset,
   * the tricky methods below is for reference on both Android and iOS.
   *
   * 注意: Android 的阴影大小根据容器体积大小来决定，通过在容器上对矩形view做阴影来实现，阴影会有一个实体的背景色。
   * 在Android上shadow offset没有很好地支持。
   * 如果你必须要使用boxShadowOffset，可以通过以下的小技巧来调整适配。
   */
  #shadow-demo .offset-shadow-demo-cube-android {
    position: absolute;
    left: 50px;
    top: 300px;
    width: 175px;
    height: 175px;
    box-shadow-opacity: 0.6;
    box-shadow-radius: 5;
    box-shadow-color: #098a29;
    box-shadow-offset: 15px 15px;
    /*box-shadow-offset-x: 15px;*/ /* it is supported by setting offset separately
    /*box-shadow-offset-y: 15px;*/
  }

  #shadow-demo .offset-shadow-demo-content-android {
    width: 160px;
    height: 160px;
    background-color: grey;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  #shadow-demo .offset-shadow-demo-content-android p {
    color: white
  }

  /**
   * ios
   */
  #shadow-demo .offset-shadow-demo-cube-ios {
    position: absolute;
    left: 50px;
    top: 300px;
    width: 160px;
    height: 160px;
    box-shadow-opacity: 0.6;
    box-shadow-radius: 5;
    box-shadow-spread: 1; /* spread attr is only supported on iOS */
    box-shadow-offset: 10px 10px;
    /*box-shadow-offset-x: 10px;*/ /* it is supported by setting offset separately
    /*box-shadow-offset-y: 10px;*/
    box-shadow-color: #098a29;
  }

  #shadow-demo .offset-shadow-demo-content-ios {
    width: 160px;
    height: 160px;
    background-color: grey;
    justify-content: center;
    align-items: center;
  }

  #shadow-demo .offset-shadow-demo-content-ios p {
    color: white;
  }

  /**
   * ohos
   */
   #shadow-demo .offset-shadow-demo-cube-ohos {
    position: absolute;
    left: 50px;
    top: 300px;
    width: 160px;
    height: 160px;
    box-shadow-opacity: 0.6;
    box-shadow-radius: 5;
    box-shadow-offset: 10px 10px;
    /*box-shadow-offset-x: 10px;*/ /* it is supported by setting offset separately
    /*box-shadow-offset-y: 10px;*/
    box-shadow-color: #098a29;
  }

  #shadow-demo .offset-shadow-demo-content-ohos {
    width: 160px;
    height: 160px;
    background-color: grey;
    justify-content: center;
    align-items: center;
  }

  #shadow-demo .offset-shadow-demo-content-ohos p {
    color: white;
  }
</style>
