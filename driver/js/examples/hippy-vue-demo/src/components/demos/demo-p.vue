<template>
   <div
    class="p-demo"
    :style="{color: topColor}"
    >
    <div>
      <label>不带样式：</label>
      <p
        class="p-demo-content"
        @touchstart="onTouchTextStart"
        @touchmove="onTouchTextMove"
        @touchend="onTouchTextEnd"
      >
        这是最普通的一行可点击文字
      </p>
      <p
        class="p-demo-content-status"
      >
        当前touch状态: {{ labelTouchStatus }}
      </p>
      <label>颜色：</label>
      <p class="p-demo-1 p-demo-content">
        这行文字改变了颜色
      </p>
      <label>尺寸：</label>
      <p class="p-demo-2 p-demo-content">
        这行改变了大小
      </p>
      <label>粗体：</label>
      <p class="p-demo-3 p-demo-content">
        这行加粗了
      </p>
      <label>下划线：</label>
      <p class="p-demo-4 p-demo-content">
        这里有条下划线
      </p>
      <label>删除线：</label>
      <p class="p-demo-5 p-demo-content">
        这里有条删除线
      </p>
      <label>自定义字体：</label>
      <p class="p-demo-6 p-demo-content">
        腾讯字体 Hippy
      </p>
      <p
        class="p-demo-6 p-demo-content"
        style="font-weight: bold"
      >
        腾讯字体 Hippy 粗体
      </p>
      <p
        class="p-demo-6 p-demo-content"
        style="font-style: italic"
      >
        腾讯字体 Hippy 斜体
      </p>
      <p
        class="p-demo-6 p-demo-content"
        style="font-weight: bold; font-style: italic"
      >
        腾讯字体 Hippy 粗斜体
      </p>
      <label>文字阴影：</label>
      <p
        class="p-demo-7 p-demo-content"
        :style="textShadow"
        @click="changeTextShadow"
      >
        这里是文字灰色阴影，点击可改变颜色
      </p>
      <p
        class="p-demo-7 p-demo-content"
        :style="textShadow"
        @click="changeTextColor"
      >
        验证属性继承更改效果，点击可改变整体颜色
      </p>
      <label>文本字符间距</label>
      <p
        class="p-demo-8 p-demo-content"
        style="margin-bottom: 5px"
      >
        Text width letter-spacing -1
      </p>
      <p
        class="p-demo-9 p-demo-content"
        style="margin-top: 5px"
      >
        Text width letter-spacing 5
      </p>
      <label>字体 style：</label>
      <div class="p-demo-content">
        <p style="font-style: normal">
          font-style: normal
        </p>
        <p style="font-style: italic">
          font-style: italic
        </p>
        <p>font-style: [not set]</p>
      </div>
      <label>numberOfLines={{ textMode.numberOfLines }} | ellipsizeMode={{ textMode.ellipsizeMode }}</label>
      <div class="p-demo-content">
        <p
          :numberOfLines="textMode.numberOfLines"
          :ellipsizeMode="textMode.ellipsizeMode"
          :style="{ backgroundColor: '#40b883', marginBottom: 10, paddingHorizontal: 10, paddingVertical: 5 }"
        >
          <span style="font-size: 19px; color: white">先帝创业未半而中道崩殂，今天下三分，益州疲弊，此诚危急存亡之秋也。</span>
          <span>然侍卫之臣不懈于内，忠志之士忘身于外者，盖追先帝之殊遇，欲报之于陛下也。</span>
        </p>
        <p
          :numberOfLines="textMode.numberOfLines"
          :ellipsizeMode="textMode.ellipsizeMode"
          :style="{ backgroundColor: '#40b883', marginBottom: 10, paddingHorizontal: 10, paddingVertical: 5 }"
        >
          {{ 'line 1\n\nline 3\n\nline 5' }}
        </p>
        <p
          :numberOfLines="textMode.numberOfLines"
          :ellipsizeMode="textMode.ellipsizeMode"
          :style="{
            backgroundColor: '#40b883',
            marginBottom: 10,
            paddingHorizontal: 10,
            paddingVertical: 5,
            fontSize: 14
          }"
        >
          <img
            :style="{ width: 24, height: 24 }"
            :src="img1"
          >
          <img
            :style="{ width: 24, height: 24 }"
            :src="img2"
          >
        </p>
        <div class="button-bar">
          <button
            class="button"
            @click="incrementLine"
          >
            <span>加一行</span>
          </button>
          <button
            class="button"
            @click="decrementLine"
          >
            <span>减一行</span>
          </button>
        </div>
        <div class="button-bar">
          <button
            class="button"
            @click="() => changeMode('clip')"
          >
            <span>clip</span>
          </button>
          <button
            class="button"
            @click="() => changeMode('head')"
          >
            <span>head</span>
          </button>
          <button
            class="button"
            @click="() => changeMode('middle')"
          >
            <span>middle</span>
          </button>
          <button
            class="button"
            @click="() => changeMode('tail')"
          >
            <span>tail</span>
          </button>
        </div>
      </div>
      <label v-if="Platform === 'android'">break-strategy={{ breakStrategy }}</label>
      <div
        v-if="Platform === 'android'"
        class="p-demo-content"
      >
        <p
          :break-strategy="breakStrategy"
          style="border-width: 1; border-color: gray;"
        >
          {{ longText }}
        </p>
        <div class="button-bar">
          <button
            class="button"
            @click="() => changeBreakStrategy('simple')"
          >
            <span>simple</span>
          </button>
          <button
            class="button"
            @click="() => changeBreakStrategy('high_quality')"
          >
            <span>high_quality</span>
          </button>
          <button
            class="button"
            @click="() => changeBreakStrategy('balanced')"
          >
            <span>balanced</span>
          </button>
        </div>
      </div>
      <label>vertical-align</label>
      <div class="p-demo-content">
        <p style="line-height: 50; background-color: #40b883; padding-horizontal: 10; padding-vertical: 5;">
          <img
            style="width: 24; height: 24; vertical-align: top;"
            :src="img2"
          >
          <img
            style="width: 18; height: 12; vertical-align: middle;"
            :src="img2"
          >
          <img
            style="width: 24; height: 12; vertical-align: baseline;"
            :src="img2"
          >
          <img
            style="width: 36; height: 24; vertical-align: bottom;"
            :src="img2"
          >
          <img
            style="width: 24; height: 24; vertical-align: top;"
            :src="img3"
          >
          <img
            style="width: 18; height: 12; vertical-align: middle;"
            :src="img3"
          >
          <img
            style="width: 24; height: 12; vertical-align: baseline;"
            :src="img3"
          >
          <img
            style="width: 36; height: 24; vertical-align: bottom;"
            :src="img3"
          >
          <span style="font-size: 16; vertical-align: top;">字</span>
          <span style="font-size: 16; vertical-align: middle;">字</span>
          <span style="font-size: 16; vertical-align: baseline;">字</span>
          <span style="font-size: 16; vertical-align: bottom;">字</span>
        </p>
        <p v-if="Platform === 'android'">
          legacy mode:
        </p>
        <p
          v-if="Platform === 'android'"
          style="lineHeight: 50; background-color: #40b883; padding-horizontal: 10; padding-vertical: 5;"
        >
          <img
            style="width: 24; height: 24; vertical-alignment: 0;"
            :src="img2"
          >
          <img
            style="width: 18; height: 12; vertical-alignment: 1;"
            :src="img2"
          >
          <img
            style="width: 24; height: 12; vertical-alignment: 2;"
            :src="img2"
          >
          <img
            style="width: 36; height: 24; vertical-alignment: 3;"
            :src="img2"
          >
          <img
            style="width: 24; height: 24; top: -10;"
            :src="img3"
          >
          <img
            style="width: 18; height: 12; top: -5;"
            :src="img3"
          >
          <img
            style="width: 24; height: 12;"
            :src="img3"
          >
          <img
            style="width: 36; height: 24; top: 5;"
            :src="img3"
          >
          <span style="font-size: 16;">字</span>
          <span style="font-size: 16;">字</span>
          <span style="font-size: 16;">字</span>
          <span style="font-size: 16;">字</span>
        </p>
      </div>
      <label>tint-color & background-color</label>
      <div class="p-demo-content">
        <p style="background-color: #40b883; padding-horizontal: 10; padding-vertical: 5;">
          <img
            style="width: 24; height: 24; vertical-align: middle; tint-color: orange;"
            :src="img2"
          >
          <img
            style="width: 24; height: 24; vertical-align: middle; tint-color: orange; background-color: #ccc;"
            :src="img2"
          >
          <img
            style="width: 24; height: 24; vertical-align: middle; background-color: #ccc;"
            :src="img2"
          >
          <span style="vertical-align: middle; background-color: #99f;">text</span>
        </p>
        <p v-if="Platform === 'android'">
          legacy mode:
        </p>
        <p
          v-if="Platform === 'android'"
          style="background-color: #40b883; padding-horizontal: 10; padding-vertical: 5;"
        >
          <img
            style="width: 24; height: 24; tint-color: orange;"
            :src="img2"
          >
          <img
            style="width: 24; height: 24; tint-color: orange; background-color: #ccc;"
            :src="img2"
          >
          <img
            style="width: 24; height: 24; background-color: #ccc;"
            :src="img2"
          >
        </p>
      </div>
      <label>margin</label>
      <div class="p-demo-content">
        <p style="line-height: 50; background-color: #40b883; padding-horizontal: 10; padding-vertical: 5;">
          <img
            style="width: 24; height: 24; vertical-align: top; background-color: #ccc; margin: 5;"
            :src="img2"
          >
          <img
            style="width: 24; height: 24; vertical-align: middle; background-color: #ccc; margin: 5;"
            :src="img2"
          >
          <img
            style="width: 24; height: 24; vertical-align: baseline; background-color: #ccc; margin: 5;"
            :src="img2"
          >
          <img
            style="width: 24; height: 24; vertical-align: bottom; background-color: #ccc; margin: 5;"
            :src="img2"
          >
        </p>
        <p v-if="Platform === 'android'">
          legacy mode:
        </p>
        <p
          v-if="Platform === 'android'"
          style="line-height: 50; background-color: #40b883; padding-horizontal: 10; padding-vertical: 5;"
        >
          <img
            style="width: 24; height: 24; vertical-alignment: 0; background-color: #ccc; margin: 5;"
            :src="img2"
          >
          <img
            style="width: 24; height: 24; vertical-alignment: 1; background-color: #ccc; margin: 5;"
            :src="img2"
          >
          <img
            style="width: 24; height: 24; vertical-alignment: 2; background-color: #ccc; margin: 5;"
            :src="img2"
          >
          <img
            style="width: 24; height: 24; vertical-alignment: 3; background-color: #ccc; margin: 5;"
            :src="img2"
          >
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';

export default {
  data() {
    return {
      topColor: 'grey',
      Platform: Vue.Native.Platform,
      textShadowIndex: 0,
      isClicked: false,
      isPressing: false,
      labelTouchStatus: '',
      textShadow: {
        textShadowOffset: {
          x: 1,
          y: 1,
        },
        // support declare textShadowOffsetX & textShadowOffsetY separately
        // textShadowOffsetX: 1,
        // textShadowOffsetY: 1,
        textShadowRadius: 3,
        textShadowColor: 'grey',
      },
      textMode: {
        numberOfLines: 2,
        ellipsizeMode: 'tail',
      },
      img1: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAANlBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC3dmhyAAAAEXRSTlMA9QlZEMPc2Mmmj2VkLEJ4Rsx+pEgAAAChSURBVCjPjVLtEsMgCDOAdbbaNu//sttVPes+zvGD8wgQCLp/TORbUGMAQtQ3UBeSAMlF7/GV9Cmb5eTJ9R7H1t4bOqLE3rN2UCvvwpLfarhILfDjJL6WRKaXfzxc84nxAgLzCGSGiwKwsZUB8hPorZwUV1s1cnGKw+yAOrnI+7hatNIybl9Q3OkBfzopCw6SmDVJJiJ+yD451OS0/TNM7QnuAAbvCG0TSAAAAABJRU5ErkJggg==',
      img2: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAANlBMVEUAAAAAAAAAAAAAAAAAAAAAAAAA
        AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC3dmhyAAAAEnRSTlMA/QpX7WQU2m27pi3Ej9KEQXaD5HhjAAAAqklEQVQoz41
        SWxLDIAh0RcFXTHL/yzZSO01LMpP9WJEVUNA9gfdXTioCSKE/kQQTQmf/ArRYva+xAcuPP37seFII2L7FN4BmXdHzlEPIpDHiZ0A7eIViPc
        w2QwqipkvMSdNEFBUE1bmMNOyE7FyFaIkAP4jHhhG80lvgkzBODTKpwhRMcexuR7fXzcp08UDq6GRbootp4oRtO3NNpd4NKtnR9hB6oaefw
        eIFQU0EfnGDRoQAAAAASUVORK5CYII=`,
      img3: 'https://user-images.githubusercontent.com/12878546/148736255-7193f89e-9caf-49c0-86b0-548209506bd6.gif',
      longText: 'The 58-letter name Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch is '
        + 'the name of a town on Anglesey, an island of Wales.',
      breakStrategy: 'simple',
    };
  },
  methods: {
    changeTextShadow() {
      this.textShadow = {
        textShadowOffsetX: this.textShadowIndex % 2 === 1 ? 10 : 1,
        textShadowOffsetY: 1,
        textShadowRadius: 3,
        textShadowColor: this.textShadowIndex % 2 === 1 ? 'red' : 'grey',
      };
      this.textShadowIndex += 1;
    },
    changeTextColor() {
      this.topColor = this.textShadowIndex % 2 === 1 ? 'red' : 'grey',
      this.textShadowIndex += 1;
    },
    // text/span/label/p/a element touch event is supported after hippy-vue 2.6.2
    onTouchTextStart(evt) {
      this.labelTouchStatus = 'touch start';
      console.log('onTextTouchDown', evt);
      evt.stopPropagation();
    },
    // text/span/label/p/a element touch event is supported after hippy-vue 2.6.2
    onTouchTextMove(evt) {
      this.labelTouchStatus = 'touch move';
      console.log('onTextTouchMove', evt);
      evt.stopPropagation();
      console.log(evt);
    },
    // text/span/label/p/a element touch event is supported after hippy-vue 2.6.2
    onTouchTextEnd(evt) {
      this.labelTouchStatus = 'touch end';
      console.log('onTextTouchEnd', evt);
      evt.stopPropagation();
      console.log(evt);
    },
    incrementLine() {
      if (this.textMode.numberOfLines < 6) {
        this.textMode.numberOfLines += 1;
      }
    },
    decrementLine() {
      if (this.textMode.numberOfLines > 1) {
        this.textMode.numberOfLines -= 1;
      }
    },
    changeMode(mode) {
      this.textMode.ellipsizeMode = mode;
    },
    changeBreakStrategy(strategy) {
      this.breakStrategy = strategy;
    },
  },
};
</script>

<style scoped>
.p-demo {
  margin: 7px;
  overflow-y: scroll;
  flex: 1;
  flex-direction: column;
}

.p-demo .p-demo-content {
  margin: 20px;
}

.p-demo .p-demo-content-status {
  margin-left: 20px;
  margin-right: 20px;
  margin-bottom: 10px;
}

.p-demo .p-demo-1 {
  color: #f44837;
}
.p-demo .p-demo-2 {
  font-size: 30px;
}
.p-demo .p-demo-3 {
  font-weight: bold;
}

.p-demo .p-demo-4 {
  text-decoration-line: underline;
  text-decoration-style: dotted;
}

.p-demo .p-demo-5 {
  text-decoration-line: line-through;
  text-decoration-color: red;
}

.p-demo .p-demo-6 {
  color: #0052d9;
  font-family: TTTGB;
  font-size: 32px;
}

.p-demo .p-demo-7 {
  /*text-shadow-offset: 1px 1px; !* not support declared separately *!*/
  /*text-shadow-radius: 3;*/
  /*text-shadow-color: grey;*/
}

.p-demo .p-demo-8 {
  letter-spacing: -1px;
}

.p-demo .p-demo-9 {
  letter-spacing: 5px;
}

.p-demo .button-bar {
  flex-direction: row;
}

.p-demo .button {
  width: 100px;
  margin: 2px;
  background-color: #eee;
  border-style: solid;
  border-color: black;
  border-width: 1px;
  align-items: center;
  flex-shrink: 1;
}
</style>
