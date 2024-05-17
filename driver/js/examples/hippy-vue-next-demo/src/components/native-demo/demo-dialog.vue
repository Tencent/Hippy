<template>
  <div id="dialog-demo">
    <label>显示或者隐藏对话框:</label>
    <button
      class="dialog-demo-button-1"
      @click.stop="() => onClickView('slide')"
    >
      <span class="button-text">显示对话框--slide</span>
    </button>
    <button
      class="dialog-demo-button-1"
      @click.stop="() => onClickView('fade')"
    >
      <span class="button-text">显示对话框--fade</span>
    </button>
    <button
      class="dialog-demo-button-1"
      @click.stop="() => onClickView('slide_fade')"
    >
      <span class="button-text">显示对话框--slide_fade</span>
    </button>
    <button
      :style="[{ borderColor: autoHideStatusBar ? '#FF0000' : '#40b883'}]"
      class="dialog-demo-button-1"
      @click.stop="() => onClickDialogConfig('hideStatusBar')"
    >
      <span class="button-text">隐藏状态栏</span>
    </button>
    <button
      :style="[{ borderColor: immersionStatusBar ? '#FF0000' : '#40b883'}]"
      class="dialog-demo-button-1"
      @click.stop="() => onClickDialogConfig('immerseStatusBar')"
    >
      <span class="button-text">沉浸式状态栏</span>
    </button>
    <button
      :style="[{ borderColor: autoHideNavigationBar ? '#FF0000' : '#40b883'}]"
      class="dialog-demo-button-1"
      @click.stop="() => onClickDialogConfig('hideNavigationBar')"
    >
      <span class="button-text">隐藏导航栏</span>
    </button>
    <!-- dialog can't support v-show, can only use v-if for explicit switching -->

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
      @orientationChange="onOrientationChange"
    >
      <!-- dialog on iOS platform can only have one child node -->
      <div class="dialog-demo-wrapper">
        <div
          class="fullscreen center row"
          @click="onClickView"
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
              @click="onClickOpenSecond"
            >
              <span class="button-text">点击打开二级全屏弹窗</span>
            </button>
          </div>
          <dialog
            v-if="dialog2IsVisible"
            :animationType="dialogAnimationType"
            :transparent="true"
            @requestClose="onClose"
            @orientationChange="onOrientationChange"
          >
            <div
              class="dialog-2-demo-wrapper center column row"
              @click="onClickOpenSecond"
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

<script lang="ts">
import { defineComponent, ref } from '@vue/runtime-core';
import { onBeforeRouteLeave } from 'vue-router';

const supportedOrientations = [
  'portrait',
  'portrait-upside-down',
  'landscape',
  'landscape-left',
  'landscape-right',
];

export default defineComponent({
  setup() {
    // dialog 1 是否展示
    const dialogIsVisible = ref(false);
    // dialog 2 是否展示
    const dialog2IsVisible = ref(false);
    // dialog 动画效果
    const dialogAnimationType = ref('fade');
    // 是否沉浸式状态栏
    const immersionStatusBar = ref(false);
    // 是否隐藏状态栏
    const autoHideStatusBar = ref(false);
    // 是否隐藏导航栏
    const autoHideNavigationBar = ref(false);

    const onClickView = (type = '') => {
      dialogIsVisible.value = !dialogIsVisible.value;
      dialogAnimationType.value = type;
    };
    const onClickDialogConfig = (option) => {
      switch (option) {
        case 'hideStatusBar':
          autoHideStatusBar.value = !autoHideStatusBar.value;
          break;
        case 'immerseStatusBar':
          immersionStatusBar.value = !immersionStatusBar.value;
          break;
        case 'hideNavigationBar':
          autoHideNavigationBar.value = !autoHideNavigationBar.value;
          break;
        default:
          break;
      }
    };
    const onClickOpenSecond = (evt) => {
      evt.stopPropagation();
      dialog2IsVisible.value = !dialog2IsVisible.value;
    };

    const onShow = () => {
      console.log('Dialog is opening');
    };
    const onOrientationChange = (evt) => {
      console.log('orientation changed', evt.nativeParams);
    };
    const onClose = (evt) => {
      evt.stopPropagation();
      /**
       * Dialog will respond to the hardware back button, so you need to close the popup here.
       * If the second layer popup window is expanded,
       * only the second layer popup window is closed, otherwise the first layer popup window is closed
       */
      if (dialog2IsVisible.value) {
        dialog2IsVisible.value = false;
      } else {
        dialogIsVisible.value = false;
      }
      console.log('Dialog is closing');
    };

    const stopPropagation = (evt) => {
      evt.stopPropagation();
    };

    // The hook before the route leaves, you can return when there is no pop-up window
    onBeforeRouteLeave((to, from, next) => {
      // If the popup is not open, go back to the previous page
      if (!dialogIsVisible.value) {
        next();
      }
    });

    return {
      supportedOrientations,
      dialogIsVisible,
      dialog2IsVisible,
      dialogAnimationType,
      immersionStatusBar,
      autoHideStatusBar,
      autoHideNavigationBar,
      stopPropagation,
      onClose,
      onShow,
      onClickView,
      onClickOpenSecond,
      onClickDialogConfig,
    };
  },
});
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
  flex: 1;
  background-color: #40b88377;
}

.dialog-2-demo-wrapper {
  flex: 1;
  background-color: #444444ee;
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
