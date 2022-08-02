<template>
  <div id="dialog-demo">
    <label>显示或者隐藏对话框:</label>
    <button class="dialog-demo-button-1" @click.stop="onClickView">
      <span class="button-text">显示对话框</span>
    </button>
    <!-- dialog 无法支持 v-show，只能使用 v-if 进行显示切换 -->
    <dialog
      v-if="dialogIsVisible"
      animationType="slide"
      class="dialog-demo"
      :supportedOrientations="supportedOrientations"
      @show="onShow"
      @requestClose="onClose"
    >
      <!-- iOS 平台上 dialog 必须只有一个子节点 -->
      <!-- dialog 里的布局比较奇怪，碰到问题请联系终端同学 -->
      <div class="dialog-demo-wrapper">
        <!-- 空白区域点击关闭 -->
        <div class="fullscreen center row" @click.stop="onClickView">
          <!-- 内容区域阻止点击事件冒泡导致关闭 -->
          <div
            class="dialog-demo-close-btn center column"
            @click="stopPropagation"
          >
            <p class="dialog-demo-close-btn-text">点击空白区域关闭</p>
            <button
              class="dialog-demo-button-1"
              @click.stop="onClickOpenSecond"
            >
              <span class="button-text">点击打开二级全屏弹窗</span>
            </button>
          </div>
          <dialog
            v-if="dialog2IsVisible"
            animationType="slide"
            @requestClose="onClose"
          >
            <div class="dialog-2-demo-wrapper" @click.stop="onClickOpenSecond">
              <p>Hello 我是二级全屏弹窗，点击任意位置关闭。</p>
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

  import { warn } from '../../util';

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

      const onClickView = () => {
        dialogIsVisible.value = !dialogIsVisible.value;
      };
      const onClickOpenSecond = () => {
        dialog2IsVisible.value = !dialog2IsVisible.value;
      };

      const onShow = () => {
        warn('Dialog is opening');
      };

      const onClose = (evt) => {
        evt.stopPropagation();
        // Dialog 会响应硬件返回按钮，所以需要在这里关闭弹窗。
        // 如果第二层弹窗是展开的，则只关闭二层弹窗，否则关闭一层弹窗
        if (dialog2IsVisible.value) {
          dialog2IsVisible.value = false;
        } else {
          dialogIsVisible.value = false;
        }
        warn('Dialog is closing');
      };

      const stopPropagation = (evt) => {
        evt.stopPropagation();
      };

      // 路由离开前的 hook，无弹窗时可以返回
      onBeforeRouteLeave((to, from, next) => {
        // 如果弹窗没开，就返回上一页。
        if (!dialogIsVisible.value) {
          next();
        }
      });

      return {
        supportedOrientations,
        dialogIsVisible,
        dialog2IsVisible,
        stopPropagation,
        onClose,
        onShow,
        onClickView,
        onClickOpenSecond,
      };
    },
  });
</script>

<style>
  #dialog-demo {
    display: flex;
    align-items: center;
    flex-direction: column;
    flex: 1;
  }

  .dialog-demo-button-1 {
    height: 64px;
    width: 200px;
    border-style: solid;
    border-color: #40b883;
    border-width: 2px;
    border-radius: 10px;
    align-items: center;
  }

  .dialog-demo-button-1 .button-text {
    line-height: 56px;
    text-align: center;
  }

  .dialog-demo {
    position: absolute;
    background-color: transparent;
  }

  .dialog-demo-wrapper {
    background-color: transparent;
    position: absolute;
    top: 0;
    left: 0;
  }

  .dialog-2-demo-wrapper {
    background-color: white;
    position: absolute;
    top: 0;
    left: 0;
  }

  .dialog-demo-close-btn {
    width: 200px;
    height: 200px;
    margin-top: 300px;
    background-color: red;
    border-radius: 8px;
  }

  .dialog-demo-close-btn-text {
    width: 200px;
    font-size: 22px;
    line-height: 40px;
    flex-direction: column;
    text-align: center;
  }
</style>
