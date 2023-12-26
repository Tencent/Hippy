<template>
  <div
    id="demo-vue-native"
    ref="rect"
  >
    <div>
      <!-- 操作系统平台 -->
      <div
        v-if="Vue.Native.Platform"
        class="native-block"
      >
        <label class="vue-native-title">Vue.Native.Platform</label>
        <p>{{ Vue.Native.Platform }}</p>
      </div>

      <!-- 设备名称 -->
      <div
        v-if="Vue.Native.Device"
        class="native-block"
      >
        <label class="vue-native-title">Vue.Native.Device</label>
        <p>{{ Vue.Native.Device }}</p>
      </div>

      <!-- 是否是 iPhone X，仅限操作系统为 iOS 使用 -->
      <div
        v-if="Vue.Native.Platform === 'ios'"
        class="native-block"
      >
        <label class="vue-native-title">Vue.Native.isIPhoneX</label>
        <p>{{ Vue.Native.isIPhoneX }}</p>
      </div>

      <!-- 操作系统版本，目前仅限 iOS 使用，其它平台返回 null -->
      <div
        v-if="Vue.Native.Platform === 'ios'"
        class="native-block"
      >
        <label class="vue-native-title">Vue.Native.OSVersion</label>
        <p>{{ Vue.Native.OSVersion || 'null' }}</p>
      </div>

      <!-- 国际化相关信息 -->
      <div
        class="native-block"
      >
        <label class="vue-native-title">Vue.Native.Localization</label>
        <p>{{ `国际化相关信息` }}</p>
        <p>{{ `国家 ${Vue.Native.Localization.country}` }}</p>
        <p>{{ `语言 ${Vue.Native.Localization.language}` }}</p>
        <p>{{ `方向 ${Vue.Native.Localization.direction === 1 ? 'RTL' : 'LTR'}` }}</p>
      </div>

      <!-- API 版本，目前仅限 Android 使用，其它平台返回 null -->
      <div
        v-if="Vue.Native.Platform === 'android'"
        class="native-block"
      >
        <label class="vue-native-title">Vue.Native.APILevel</label>
        <p>{{ Vue.Native.APILevel || 'null' }}</p>
      </div>

      <!-- 屏幕是否是垂直显示状态 -->
      <div
        class="native-block"
        @layout="refreshScreenStatus"
      >
        <label class="vue-native-title">Vue.Native.screenIsVertical</label>
        <p>{{ screenIsVertical }}</p>
      </div>

      <!-- 窗口宽度 -->
      <div
        v-if="Vue.Native.Dimensions.window.width"
        class="native-block"
      >
        <label class="vue-native-title">Vue.Native.Dimensions.window.width</label>
        <p>{{ Vue.Native.Dimensions.window.width }}</p>
      </div>

      <!-- 窗口高度，需要注意的是双平台都是包含状态栏的，而 Android 会从状态栏下方第一个像素开始画 -->
      <div
        v-if="Vue.Native.Dimensions.window.height"
        class="native-block"
      >
        <label class="vue-native-title">Vue.Native.Dimensions.window.height</label>
        <p>{{ Vue.Native.Dimensions.window.height }}</p>
      </div>

      <!-- 屏幕宽度 -->
      <div
        v-if="Vue.Native.Dimensions.screen.width"
        class="native-block"
      >
        <label class="vue-native-title">Vue.Native.Dimensions.screen.width</label>
        <p>{{ Vue.Native.Dimensions.screen.width }}</p>
      </div>

      <!-- 屏幕高度 -->
      <div
        v-if="Vue.Native.Dimensions.screen.height"
        class="native-block"
      >
        <label class="vue-native-title">Vue.Native.Dimensions.screen.height</label>
        <p>{{ Vue.Native.Dimensions.screen.height }}</p>
      </div>

      <!-- 一个像素的 pt 值 -->
      <div
        v-if="Vue.Native.OnePixel"
        class="native-block"
      >
        <label class="vue-native-title">Vue.Native.OnePixel</label>
        <p>{{ Vue.Native.OnePixel }}</p>
      </div>

      <!-- Android底部导航栏高度 -->
      <div
        v-if="Vue.Native.Dimensions.screen.navigatorBarHeight"
        class="native-block"
      >
        <label class="vue-native-title">Vue.Native.Dimensions.screen.navigatorBarHeight</label>
        <p>{{ Vue.Native.Dimensions.screen.navigatorBarHeight }}</p>
      </div>

      <!-- 状态栏高度 -->
      <div
        v-if="Vue.Native.Dimensions.screen.statusBarHeight"
        class="native-block"
      >
        <label class="vue-native-title">Vue.Native.Dimensions.screen.statusBarHeight</label>
        <p>{{ Vue.Native.Dimensions.screen.statusBarHeight }}</p>
      </div>

      <!-- android虚拟导航栏高度 -->
      <div
        v-if="Vue.Native.Platform === 'android'
          && Vue.Native.Dimensions.screen.navigatorBarHeight !== undefined"
        class="native-block"
      >
        <label class="vue-native-title">Vue.Native.Dimensions.screen.navigatorBarHeight(Android only)</label>
        <p>{{ Vue.Native.Dimensions.screen.navigatorBarHeight }}</p>
      </div>

      <!-- 终端传递过来的启动参数 superProps -->
      <div
        v-if="app"
        class="native-block"
      >
        <label class="vue-native-title">App.$options.$superProps</label>
        <p>{{ JSON.stringify(app.$options.$superProps) }}</p>
      </div>

      <!-- 一个终端事件的范例，官方 Demo 因为没什么事件，所以造了一个假的，终端事件都是通过 app 进行中转，监听范例参考 mounted -->
      <div
        v-if="app"
        class="native-block"
      >
        <label class="vue-native-title">App event</label>
        <div>
          <button
            class="event-btn"
            @click="triggerAppEvent"
          >
            <span class="event-btn-text">Trigger app event</span>
          </button>
          <div class="event-btn-result">
            <p>Event triggered times: {{ eventTriggeredTimes }}</p>
          </div>
        </div>
      </div>

      <!-- 测量一个元素尺寸的范例 -->
      <div
        v-if="Vue.Native.getBoundingClientRect"
        class="native-block"
      >
        <label class="vue-native-title">Vue.Native.getBoundingClientRect</label>
        <div class="item-wrapper">
          <button
            class="item-button"
            @click="() => getBoundingClientRect(false)"
          >
            <span>relative to App</span>
          </button>
          <span style="max-width: 200px">{{ rect1 }}</span>
        </div>
        <div class="item-wrapper">
          <button
            class="item-button"
            @click="() => getBoundingClientRect(true)"
          >
            <span>relative to container</span>
          </button>
          <span style="max-width: 200px">{{ rect2 }}</span>
        </div>
      </div>

      <!-- 本地存储使用 -->
      <div
        v-if="Vue.Native.AsyncStorage"
        class="native-block"
      >
        <label class="vue-native-title">AsyncStorage 使用</label>
        <div class="item-wrapper">
          <button
            class="item-button"
            @click="setItem"
          >
            <span>setItem</span>
          </button>
          <span>{{ storageSetStatus }}</span>
        </div>
        <div class="item-wrapper">
          <button
            class="item-button"
            @click="removeItem"
          >
            <span>removeItem</span>
          </button>
          <span>{{ storageSetStatus }}</span>
        </div>
        <div class="item-wrapper">
          <button
            class="item-button"
            @click="getItem"
          >
            <span>getItem</span>
          </button>
          <span>{{ storageValue }}</span>
        </div>
      </div>

      <!-- ImageLoader使用 -->
      <div
        v-if="Vue.Native.ImageLoader"
        class="native-block"
      >
        <label class="vue-native-title">ImageLoader 使用</label>
        <div class="item-wrapper">
          <button
            class="item-button"
            @click="getSize"
          >
            <span>getSize</span>
          </button>
          <span>{{ imageSize }}</span>
        </div>
      </div>

      <!-- Fetch使用 -->
      <div
        class="native-block"
      >
        <label class="vue-native-title">Fetch 使用</label>
        <div class="item-wrapper">
          <span>{{ fetchText }}</span>
        </div>
      </div>

      <!-- NetInfo使用 -->
      <div
        v-if="Vue.Native.NetInfo"
        class="native-block"
      >
        <label class="vue-native-title">NetInfo 使用</label>
        <div class="item-wrapper">
          <span>{{ netInfoText }}</span>
        </div>
      </div>

      <!-- Cookie 使用 -->
      <div
        v-if="Vue.Native.Cookie"
        class="native-block"
      >
        <label class="vue-native-title">Cookie 使用</label>
        <div class="item-wrapper">
          <button
            class="item-button"
            @click="setCookie"
          >
            <span>setCookie</span>
          </button>
          <span>{{ cookieString }}</span>
        </div>
        <div class="item-wrapper">
          <button
            class="item-button"
            @click="getCookie"
          >
            <span>getCookie</span>
          </button>
          <span>{{ cookiesValue }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import { getApp } from '../../util';

const TEST_EVENT_NAME = 'testEvent';

export default {
  data() {
    // 屏幕是否是竖屏
    const { screenIsVertical } = Vue.Native;
    return {
      app: this.app,
      eventTriggeredTimes: 0,
      rect1: null,
      rect2: null,
      Vue,
      screenIsVertical,
      storageValue: '',
      storageSetStatus: 'ready to set',
      imageSize: '',
      netInfoText: '正在获取...',
      fetchText: '请求网址中...',
      cookieString: 'ready to set',
      cookiesValue: '',
      hasLayout: false,
    };
  },
  async created() {
    this.storageValue = '';
    this.imageSize = '';
    this.netInfoText = '';
    // netInfo
    this.netInfoText = await Vue.Native.NetInfo.fetch();
    this.netInfoListener = Vue.Native.NetInfo.addEventListener('change', (info) => {
      this.netInfoText = `收到通知: ${info.network_info}`;
    });
    fetch('https://hippyjs.org', {
      mode: 'no-cors', // 2.14.0 or above supports other options(not only method/headers/url/body)
    }).then((responseJson) => {
      this.fetchText = `成功状态: ${responseJson.status}`;
    }).catch((error) => {
        this.fetchText =  `收到错误: ${error}`;
    });
  },
  async mounted() {
    this.app = getApp();
    // app.$on() 其实主要是用于监听来自终端的事件，因为终端事件其实是通过 app 进行分发的。
    // 因为官方 demo 没有什么来自终端的自定义事件，所以这里造了一个通过 app 中转的伪终端事件。
    // 注意该事件在 mounted 里监听，需要在 beforeDestroy 里用 $off 取消监听。
    this.app.$on(TEST_EVENT_NAME, () => {
      this.eventTriggeredTimes += 1;
    });
  },
  beforeDestroy() {
    // 取消 mounted 里监听的自定义事件
    this.netInfoListener && Vue.Native.NetInfo.remove('change', this.netInfoListener);
    this.app.$off(TEST_EVENT_NAME);
    delete this.app;
  },
  methods: {
    async getBoundingClientRect(relToContainer = false) {
      try {
        const rect = await Vue.Native.getBoundingClientRect(this.$refs.rect, { relToContainer });
        if (!relToContainer) {
          this.rect1 = `${JSON.stringify(rect)}`;
        } else {
          this.rect2 = `${JSON.stringify(rect)}`;
        }
      } catch (err) {
        console.error('getBoundingClientRect error', err);
      }
    },
    triggerAppEvent() {
      this.app.$emit(TEST_EVENT_NAME);
    },
    refreshScreenStatus() {
      /**
       *  当界面重新渲染时，刷新屏幕横竖状态
       *  需要注意的是这里会触发整体刷新，所以 width 和 height 也会改变。
       */
      this.screenIsVertical = Vue.Native.screenIsVertical;
    },
    setItem() {
      Vue.Native.AsyncStorage.setItem('itemKey', 'hippy');
      this.storageSetStatus = 'set "hippy" value succeed';
    },
    removeItem() {
      Vue.Native.AsyncStorage.removeItem('itemKey');
      this.storageSetStatus = 'remove "hippy" value succeed';
    },
    async getItem() {
      const storageValue = await Vue.Native.AsyncStorage.getItem('itemKey');
      if (storageValue) {
        this.storageValue = storageValue;
      } else {
        this.storageValue = 'undefined';
      }
    },
    async getSize() {
      // const result = await Vue.Native.ImageLoader.getSize('https://user-images.githubusercontent.com/12878546/148736102-7cd9525b-aceb-41c6-a905-d3156219ef16.png');
      // 更换小图测试
      const result = await Vue.Native.ImageLoader.getSize('https://hippyjs.org/assets/img/tv.png');
      
      console.log('ImageLoader getSize', result);
      this.imageSize = `${result.width}x${result.height}`;
    },
    setCookie() {
      Vue.Native.Cookie.set('https://hippyjs.org', 'name=hippy;network=mobile');
      this.cookieString = '\'name=hippy;network=mobile\' is set';
    },
    getCookie() {
      Vue.Native.Cookie.getAll('https://hippyjs.org').then((cookies) => {
        this.cookiesValue = cookies;
      });
    },
  },
};
</script>

<style scoped>
  #demo-vue-native {
    flex: 1;
    padding: 12px;
    overflow-y: scroll;
  }

  .native-block {
    margin-top: 15px;
    margin-bottom: 15px;
  }

  .native-block p {
    margin-vertical: 5px;
  }

  .vue-native-title {
    text-decoration: underline;
    color: #40b883
  }

  .event-btn {
    background-color: #40b883;
    flex: 1;
    flex-direction: column;
    width: 120px;
    height: 40px;
    justify-content: center;
    align-items: center;
    border-radius: 3px;
    margin-bottom: 5px;
    margin-top: 5px;
  }

  .event-btn-result {
    flex: 1;
    flex-direction: column;
  }

  .event-btn .event-btn-text {
    color: white;
  }
  .item-wrapper {
    display: flex;
    justify-content: flex-start;
    flex-direction: row;
    align-items: center;
  }
  .item-button {
    width: 80px;
    height: 40px;
    background-color: #40b883;
    border-radius: 3px;
    margin-bottom: 5px;
    margin-top: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: 10px
  }
  .item-button span {
    color: white;
    text-align: center;
  }
</style>
