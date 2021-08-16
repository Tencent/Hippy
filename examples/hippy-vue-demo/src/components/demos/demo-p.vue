<template>
  <div class="p-demo">
    <label>不带样式：</label>
    <p
      class="p-demo-content"
      @touchstart="onTouchTextStart"
      @touchmove="onTouchTextMove"
      @touchend="onTouchTextEnd"
    >
      这是最普通的一行文字 - 当前 touch 状态: {{ labelTouchStatus }}
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
  </div>
</template>

<script>
export default {
  data() {
    return {
      isClicked: false,
      isPressing: false,
      labelTouchStatus: '',
    };
  },
  methods: {
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
  },
};
</script>

<style scope>
.p-demo .p-demo-content {
  margin: 20px;
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
  text-decoration: underline;
}

.p-demo .p-demo-5 {
  text-decoration: line-through;
}

.p-demo .p-demo-6 {
  color: #0052d9;
  font-family: TTTGB;
  font-size: 32px;
}
</style>
