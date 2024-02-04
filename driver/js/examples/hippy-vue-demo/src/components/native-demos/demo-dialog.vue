<template>
  <div id="dialog-demo">
    <label>显示或者隐藏对话框:</label>
    <button
      class="dialog-demo-button-1"
      @click="() => clickView('slide')"
    >
      <span class="button-text">显示对话框--slide</span>
    </button>
    <button
      class="dialog-demo-button-1"
      @click="() => clickView('fade')"
    >
      <span class="button-text">显示对话框--fade</span>
    </button>
    <button
      class="dialog-demo-button-1"
      @click="() => clickView('slide_fade')"
    >
      <span class="button-text">显示对话框--slide_fade</span>
    </button>
    <button
      :style="[{ borderColor: autoHideStatusBar ? '#FF0000' : '#40b883'}]"
      class="dialog-demo-button-1"
      @click="() => clickDialogConfig('hideStatusBar')"
    >
      <span class="button-text">隐藏状态栏</span>
    </button>
    <button
      :style="[{ borderColor: immersionStatusBar ? '#FF0000' : '#40b883'}]"
      class="dialog-demo-button-1"
      @click="() => clickDialogConfig('immerseStatusBar')"
    >
      <span class="button-text">沉浸式状态栏</span>
    </button>
    <button
      :style="[{ borderColor: autoHideNavigationBar ? '#FF0000' : '#40b883'}]"
      class="dialog-demo-button-1"
      @click="() => clickDialogConfig('hideNavigationBar')"
    >
      <span class="button-text">隐藏导航栏</span>
    </button>
    <!-- dialog 无法支持 v-show，只能使用 v-if 进行显式切换 -->
    <dialog
      v-if="dialogIsVisible"
      :animationType="dialogAnimationType"
      :transparent="true"
      :supportedOrientations="supportedOrientations"
      :immersionStatusBar="immersionStatusBar"
      :autoHideStatusBar="autoHideStatusBar"
      :autoHideNavigationBar="autoHideNavigationBar"
      @show="onShow"
      @requestClose="onClose"
    >
      <!-- iOS 平台上 dialog 必须只有一个子节点 -->
      <div class="dialog-demo-wrapper">
        <div
          class="fullscreen center row"
          @click="clickView"
        >
          <div
            class="dialog-demo-close-btn center column"
            @click="stopPropagation"
          >
            <p class="dialog-demo-close-btn-text">
              点击空白区域关闭
            </p>
            <button
              class="dialog-demo-button-2"
              @click="clickOpenSecond"
            >
              <span class="button-text">点击打开二级全屏弹窗</span>
            </button>
          </div>
          <dialog
            v-if="dialog2IsVisible"
            :animationType="dialogAnimationType"
            :transparent="true"
            :immersionStatusBar="immersionStatusBar"
            :autoHideStatusBar="autoHideStatusBar"
            :autoHideNavigationBar="autoHideNavigationBar"
            @requestClose="onClose"
          >
            <div
              class="dialog-2-demo-wrapper center column row"
              @click="clickOpenSecond"
            >
              <p
                class="dialog-demo-close-btn-text"
                style="color: white"
              >
                Hello 我是二级全屏弹窗，点击任意位置关闭。
              </p>
            </div>
          </dialog>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script>
export default {
  // 绑定 Vue-Router 的返回 hook
  beforeRouteLeave(to, from, next) {
    // 如果弹窗没开，就返回上一页。
    if (!this.dialogIsVisible) {
      next();
    }
  },
  data() {
    return {
      supportedOrientations: [
        'portrait',
        'portrait-upside-down',
        'landscape',
        'landscape-left',
        'landscape-right',
      ],
      dialogIsVisible: false,
      dialog2IsVisible: false,
      dialogAnimationType: '',
      immersionStatusBar: false,
      autoHideStatusBar: false,
      autoHideNavigationBar: false,
    };
  },
  methods: {
    clickView(type = '') {
      this.dialogIsVisible = !this.dialogIsVisible;
      if (this.dialogIsVisible) {
        this.dialogAnimationType = type;
      }
    },
    clickOpenSecond(evt) {
      evt.stopPropagation(); // 二级弹窗关闭时会冒泡到这里，所以也要阻止一下冒泡防止一级 dialog 消失
      this.dialog2IsVisible = !this.dialog2IsVisible;
    },
    clickDialogConfig(option) {
      switch (option) {
        case 'hideStatusBar':
          this.autoHideStatusBar = !this.autoHideStatusBar;
          break;
        case 'immerseStatusBar':
          this.immersionStatusBar = !this.immersionStatusBar;
          break;
        case 'hideNavigationBar':
          this.autoHideNavigationBar = !this.autoHideNavigationBar;
          break;
        default:
          break;
      }
    },
    onShow() {
      console.log('Dialog is opening');
    },
    onClose(evt) {
      evt.stopPropagation();
      // Dialog 会响应硬件返回按钮，所以需要在这里关闭弹窗。
      // 如果第二层弹窗是展开的，则只关闭二层弹窗，否则关闭一层弹窗
      if (this.dialog2IsVisible) {
        this.dialog2IsVisible = false;
      } else {
        this.dialogIsVisible = false;
      }
      console.log('Dialog is closing');
    },
    stopPropagation(evt) {
      evt.stopPropagation();
    },
  },
};
</script>

<style scoped>
#dialog-demo {
  display: flex;
  align-items: center;
  flex-direction: column;
  flex: 1;
  margin: 7px;
}

.dialog-demo-button-1 {
  height: 64px;
  width: 200px;
  border-style: solid;
  border-color: #40b883;
  border-width: 2px;
  border-radius: 10px;
  align-items: center;
  margin-top: 10px;
}

.dialog-demo-button-1 .button-text {
  line-height: 56px;
  text-align: center;
}

.dialog-demo-button-2 {
  height: 64px;
  width: 200px;
  border-style: solid;
  border-color: white;
  border-width: 2px;
  border-radius: 10px;
  align-items: center;
  margin-top: 10px;
}

.dialog-demo-button-2 .button-text {
  line-height: 56px;
  text-align: center;
}

.dialog-demo-wrapper {
  background-color: #40b88377;
  flex: 1;
}

.dialog-2-demo-wrapper {
  background-color: #444444ee;
  flex: 1;
  justify-content: center;
  align-items: center;
}

.dialog-demo-close-btn {
  width: 210px;
  height: 200px;
  margin-top: 300px;
  background-color: #40b883;
  justify-content: center;
  align-items: center;
}

.dialog-demo-close-btn-text {
  width: 200px;
  font-size: 22px;
  line-height: 40px;
  flex-direction: column;
  text-align: center;
}
</style>
