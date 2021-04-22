<template>
  <div id="demo-vue-native" ref="rect">
    <div>
      <!-- 操作系统平台 -->
      <div v-if="Vue.Native.Platform" class="native-block">
        <label class="vue-native-title">Vue.Native.Platform</label>
        <p>{{ Vue.Native.Platform }}</p>
      </div>

      <!-- 设备名称 -->
      <div v-if="Vue.Native.Device" class="native-block">
        <label class="vue-native-title">Vue.Native.Device</label>
        <p>{{ Vue.Native.Device }}</p>
      </div>

      <!-- 是否是 iPhone X，仅限操作系统为 iOS 使用 -->
      <div v-if="Vue.Native.Platform === 'ios'" class="native-block">
        <label class="vue-native-title">Vue.Native.isIPhoneX</label>
        <p>{{ Vue.Native.isIPhoneX }}</p>
      </div>

      <!-- 操作系统版本，目前仅限 iOS 使用，其它平台返回 null -->
      <div v-if="Vue.Native.Platform === 'ios'" class="native-block">
        <label class="vue-native-title">Vue.Native.OSVersion</label>
        <p>{{ Vue.Native.OSVersion || 'null' }}</p>
      </div>

      <!-- API 版本，目前仅限 Android 使用，其它平台返回 null -->
      <div v-if="Vue.Native.Platform === 'android'"  class="native-block">
        <label class="vue-native-title">Vue.Native.APILevel</label>
        <p>{{ Vue.Native.APILevel || 'null' }}</p>
      </div>

      <!-- 屏幕是否是垂直显示状态 -->
      <div class="native-block"  @layout="refreshScreenStatus">
        <label class="vue-native-title">Vue.Native.screenIsVertical</label>
        <p>{{ screenIsVertical }}</p>
      </div>

      <!-- 窗口宽度 -->
      <div v-if="Vue.Native.Dimensions.window.width" class="native-block">
        <label class="vue-native-title">Vue.Native.Dimensions.window.width</label>
        <p>{{ Vue.Native.Dimensions.window.width }}</p>
      </div>

      <!-- 窗口高度，需要注意的是双平台都是包含状态栏的，而 Android 会从状态栏下方第一个像素开始画 -->
      <div v-if="Vue.Native.Dimensions.window.height" class="native-block">
        <label class="vue-native-title">Vue.Native.Dimensions.window.height</label>
        <p>{{ Vue.Native.Dimensions.window.height }}</p>
      </div>

      <!-- 屏幕宽度 -->
      <div v-if="Vue.Native.Dimensions.screen.width" class="native-block">
        <label class="vue-native-title">Vue.Native.Dimensions.screen.width(Android Only)</label>
        <p>{{ Vue.Native.Dimensions.screen.width }}</p>
      </div>

      <!-- 屏幕高度 -->
      <div v-if="Vue.Native.Dimensions.screen.height" class="native-block">
        <label class="vue-native-title">Vue.Native.Dimensions.screen.height(Android Only)</label>
        <p>{{ Vue.Native.Dimensions.screen.height }}</p>
      </div>

      <!-- 状态栏高度 -->
      <div v-if="Vue.Native.OnePixel" class="native-block">
        <label class="vue-native-title">Vue.Native.OnePixel</label>
        <p>{{ Vue.Native.OnePixel }}</p>
      </div>

      <!-- Android底部导航栏高度 -->
      <div v-if="Vue.Native.Dimensions.screen.navigatorBarHeight" class="native-block">
        <label class="vue-native-title">Vue.Native.Dimensions.screen.navigatorBarHeight</label>
        <p>{{ Vue.Native.Dimensions.screen.navigatorBarHeight }}</p>
      </div>

      <!-- 一个像素的 pt 值 -->
      <div v-if="Vue.Native.Dimensions.screen.statusBarHeight" class="native-block">
        <label class="vue-native-title">Vue.Native.Dimensions.screen.statusBarHeight</label>
        <p>{{ Vue.Native.Dimensions.screen.statusBarHeight }}</p>
      </div>

      <!-- 一个像素的 pt 值 -->
      <div v-if="Vue.Native.Platform === 'android'
       && Vue.Native.Dimensions.screen.navigatorBarHeight !== undefined" class="native-block">
        <label class="vue-native-title">Vue.Native.Dimensions.screen.navigatorBarHeight</label>
        <p>{{ Vue.Native.Dimensions.screen.navigatorBarHeight }}</p>
      </div>

      <!-- 终端传递过来的启动参数 superProps -->
      <div v-if="app" class="native-block">
        <label class="vue-native-title">App.$options.$superProps</label>
        <p>{{ JSON.stringify(app.$options.$superProps) }}</p>
      </div>

      <!-- 一个终端事件的范例，官方 Demo 因为没什么事件，所以造了一个假的，终端事件都是通过 app 进行中转，监听范例参考 mounted -->
      <div v-if="app" class="native-block">
        <label class="vue-native-title">App event</label>
        <div>
          <button @click="triggerAppEvent" class="event-btn">
            <span class="event-btn-text">Trigger app event</span>
          </button>
          <div class="event-btn-result">
            <p>Event triggered times: {{ eventTriggeredTimes }}</p>
          </div>
        </div>
      </div>

      <!-- 测量一个元素尺寸的范例，其实它是 measureInWindow 的封装 -->
      <div v-if="Vue.Native.measureInWindow" class="native-block">
        <label class="vue-native-title">Element.getBoundingClientRect</label>
        <p>{{ rect }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import { getApp } from '../../util';

const TEST_EVENT_NAME = 'testEvent';

export default {
  async mounted() {
    this.app = getApp();
    // app.$on() 其实主要是用于监听来自终端的事件，因为终端事件其实是通过 app 进行分发的。
    // 因为官方 demo 没有什么来自终端的自定义事件，所以这里造了一个通过 app 中转的伪终端事件。
    // 注意该事件在 mounted 里监听，需要在 beforeDestroy 里用 $off 取消监听。
    this.app.$on(TEST_EVENT_NAME, () => {
      this.eventTriggeredTimes += 1;
    });
    // ref="rect" 可以移动到任一元素上测试尺寸，除了 measureInWindow 在 android 上拿不到，别的都可以正常获取。
    const rect = await this.$refs.rect.getBoundingClientRect();
    this.rect = `Container rect: ${JSON.stringify(rect)}`;
  },
  beforeDestroy() {
    // 取消 mounted 里监听的自定义事件
    this.app.$off(TEST_EVENT_NAME);
    delete this.app;
  },
  data() {
    // 屏幕是否是竖屏
    const { screenIsVertical } = Vue.Native;
    return {
      app: this.app,
      eventTriggeredTimes: 0,
      rect: null,
      Vue,
      screenIsVertical,
    };
  },
  methods: {
    // 通过界面，触发经过 app 中转的事件，其实就是个假的终端事件。
    triggerAppEvent() {
      this.app.$emit(TEST_EVENT_NAME);
    },
    refreshScreenStatus() {
      // 当界面重新渲染时，刷新屏幕横竖状态
      // 需要注意的是这里会触发整体刷新，所以 width 和 height 也会改变。
      this.screenIsVertical = Vue.Native.screenIsVertical;
    },
  },
};
</script>

<style scope>
  #demo-vue-native {
    flex: 1;
    padding: 12px;
    overflow-y: scroll;
  }

  .native-block {
    margin-top: 10px;
    margin-bottom: 10px;
  }

  .vue-native-title {
    color: #aaa;
    text-decoration: underline;
    text-decoration-line: underline;
  }

  .event-btn {
    background-color: #40b883;
    flex: 1;
    flex-direction: column;
  }

  .event-btn-result {
    flex: 1;
    flex-direction: column;
  }

  .event-btn .event-btn-text {
    color: white;
  }
</style>
