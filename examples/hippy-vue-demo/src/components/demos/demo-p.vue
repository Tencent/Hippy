<template>
  <div class="p-demo">
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
      <label>文字阴影：</label>
      <p
        class="p-demo-7 p-demo-content"
        :style="textShadow"
        @click="changeTextShadow"
      >
        这里是文字灰色阴影，点击可改变颜色
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
      <label>numberOfLines={{ numberOfLines.lines }} ellipsizeMode={{ numberOfLines.mode || 'undefined' }}</label>
      <div class="p-demo-content">
        <p
          :numberOfLines="numberOfLines.lines"
          :ellipsizeMode="numberOfLines.mode"
          style="backgroundColor: yellow"
        >
          <span style="fontSize: 24; color: red">先帝创业未半而中道崩殂，今天下三分，益州疲弊，此诚危急存亡之秋也。</span>
          <span>然侍卫之臣不懈于内，忠志之士忘身于外者，盖追先帝之殊遇，欲报之于陛下也。</span>
        </p>
        <p
          :numberOfLines="numberOfLines.lines"
          :ellipsizeMode="numberOfLines.mode"
          style="backgroundColor: cyan"
        >
          {{ 'line 1\n\nline 3\n\nline 5' }}
        </p>
        <p
          :numberOfLines="numberOfLines.lines"
          :ellipsizeMode="numberOfLines.mode"
          :style="{ backgroundColor: 'yellow', width: 240, fontFamily: 'monospace', lineHeight: 24}"
        >
          <img
            :style="{ width: 24, height: 24, fontFamily: 'monospace', lineHeight: 24 }"
            :src="img1"
          >
          <span :style="{ fontSize: 24, fontFamily: 'monospace', lineHeight: 24 }">looooooooooooong</span>
          <img
            :style="{ width: 24, height: 24, fontFamily: 'monospace', lineHeight: 24 }"
            :src="img2"
          >
          <span :style="{ fontSize: 24, fontFamily: 'monospace', lineHeight: 24 }">loooooooooong</span>
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
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
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
      numberOfLines: {
        lines: 2,
        mode: 'tail',
      },
      img1: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAANlBMVEUAAAAAAAAAAAAAAAAAAAAAAAAA
        AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC3dmhyAAAAEXRSTlMA9QlZEMPc2Mmmj2VkLEJ4Rsx+pEgAAAChSURBVCjPjVL
        tEsMgCDOAdbbaNu//sttVPes+zvGD8wgQCLp/TORbUGMAQtQ3UBeSAMlF7/GV9Cmb5eTJ9R7H1t4bOqLE3rN2UCvvwpLfarhILfDjJL6WRK
        aXfzxc84nxAgLzCGSGiwKwsZUB8hPorZwUV1s1cnGKw+yAOrnI+7hatNIybl9Q3OkBfzopCw6SmDVJJiJ+yD451OS0/TNM7QnuAAbvCG0TS
        AAAAABJRU5ErkJggg==`,
      img2: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAANlBMVEUAAAAAAAAAAAAAAAAAAAAAAAAA
        AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC3dmhyAAAAEnRSTlMA/QpX7WQU2m27pi3Ej9KEQXaD5HhjAAAAqklEQVQoz41
        SWxLDIAh0RcFXTHL/yzZSO01LMpP9WJEVUNA9gfdXTioCSKE/kQQTQmf/ArRYva+xAcuPP37seFII2L7FN4BmXdHzlEPIpDHiZ0A7eIViPc
        w2QwqipkvMSdNEFBUE1bmMNOyE7FyFaIkAP4jHhhG80lvgkzBODTKpwhRMcexuR7fXzcp08UDq6GRbootp4oRtO3NNpd4NKtnR9hB6oaefw
        eIFQU0EfnGDRoQAAAAASUVORK5CYII=`,
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
      if (this.numberOfLines.lines < 6) {
        this.numberOfLines.lines += 1;
      }
    },
    decrementLine() {
      if (this.numberOfLines.lines > 0) {
        this.numberOfLines.lines -= 1;
      }
    },
    changeMode(mode) {
      this.numberOfLines.mode = mode;
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
  backgroundColor: #eee;
  border-style: solid;
  border-color: black;
  border-width: 1px;
  align-items: center;
  flex-shrink: 1;
}
</style>
