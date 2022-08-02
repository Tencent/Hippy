<template>
  <div id="demo-vue-native" ref="rectRef">
    <div>
      <!-- 操作系统平台 -->
      <div class="native-block">
        <label class="vue-native-title">Native能力使用示例：</label>
      </div>
      <!-- 操作系统平台 -->
      <div v-if="Native.platform" class="native-block">
        <label class="vue-native-title">Native.platform</label>
        <p>{{ Native.platform }}</p>
      </div>

      <div class="native-block">
        <label class="vue-native-title">Native.isIOS</label>
        <p>{{ Native.isIOS() }}</p>
      </div>

      <div class="native-block">
        <label class="vue-native-title">Native.isAndroid</label>
        <p>{{ Native.isAndroid() }}</p>
      </div>

      <!-- 设备名称 -->
      <div class="native-block">
        <label class="vue-native-title">Native.device</label>
        <p>{{ Native.device }}</p>
      </div>

      <!-- 是否是 iPhone X，仅限操作系统为 iOS 使用 -->
      <div v-if="Native.isIOS()" class="native-block">
        <label class="vue-native-title">Native.isIphoneX</label>
        <p>{{ Native.isIphoneX }}</p>
      </div>

      <!-- 操作系统版本，目前仅限 iOS 使用，其它平台返回 null -->
      <div v-if="Native.isIOS()" class="native-block">
        <label class="vue-native-title">Native.osVersion</label>
        <p>{{ Native.osVersion || 'null' }}</p>
      </div>

      <!-- 国际化相关信息 -->
      <div class="native-block">
        <label class="vue-native-title">Native.localization</label>
        <p>{{ `国际化相关信息` }}</p>
        <p>{{ `国家 ${Native.localization?.country}` }}</p>
        <p>{{ `语言 ${Native.localization?.language}` }}</p>
        <p>
          {{ `方向 ${Native.localization.direction === 1 ? 'RTL' : 'LTR'}` }}
        </p>
      </div>

      <!-- API 版本，目前仅限 Android 使用，其它平台返回 null -->
      <div v-if="Native.isAndroid()" class="native-block">
        <label class="vue-native-title">Native.apiLevel</label>
        <p>{{ Native.apiLevel || 'null' }}</p>
      </div>

      <!-- 屏幕是否是垂直显示状态 -->
      <div class="native-block">
        <label class="vue-native-title">Native.isVerticalScreen</label>
        <p>{{ Native.isVerticalScreen }}</p>
      </div>

      <!-- 窗口宽度 -->
      <div v-if="Native.dimensions.window.width" class="native-block">
        <label class="vue-native-title">Native.dimensions.window.width</label>
        <p>{{ Native.dimensions.window.width }}</p>
      </div>

      <!-- 窗口高度，需要注意的是双平台都是包含状态栏的，而 Android 会从状态栏下方第一个像素开始画 -->
      <div v-if="Native.dimensions.window.height" class="native-block">
        <label class="vue-native-title">Native.dimensions.window.height</label>
        <p>{{ Native.dimensions.window.height }}</p>
      </div>

      <!-- 屏幕宽度 -->
      <div v-if="Native.dimensions.screen.width" class="native-block">
        <label class="vue-native-title">Native.dimensions.screen.width</label>
        <p>{{ Native.dimensions.screen.width }}</p>
      </div>

      <!-- 屏幕高度 -->
      <div v-if="Native.dimensions.screen.height" class="native-block">
        <label class="vue-native-title">Native.dimensions.screen.height</label>
        <p>{{ Native.dimensions.screen.height }}</p>
      </div>

      <!-- 一个像素的 pt 值 -->
      <div class="native-block">
        <label class="vue-native-title">Native.onePixel</label>
        <p>{{ Native.onePixel }}</p>
      </div>

      <!-- Android底部导航栏高度 -->
      <div
        v-if="Native.dimensions.screen.navigatorBarHeight"
        class="native-block"
      >
        <label class="vue-native-title"
          >Native.dimensions.screen.navigatorBarHeight</label
        >
        <p>{{ Native.dimensions.screen.navigatorBarHeight }}</p>
      </div>

      <!-- 状态栏高度 -->
      <div v-if="Native.dimensions.screen.statusBarHeight" class="native-block">
        <label class="vue-native-title"
          >Native.dimensions.screen.statusBarHeight</label
        >
        <p>{{ Native.dimensions.screen.statusBarHeight }}</p>
      </div>

      <!-- android虚拟导航栏高度 -->
      <div
        v-if="
          Native.isAndroid() &&
          Native.dimensions.screen.navigatorBarHeight !== undefined
        "
        class="native-block"
      >
        <label class="vue-native-title"
          >Native.dimensions.screen.navigatorBarHeight(Android only)</label
        >
        <p>{{ Native.dimensions.screen.navigatorBarHeight }}</p>
      </div>

      <!-- 终端传递过来的启动参数 superProps -->
      <div v-if="superProps" class="native-block">
        <label class="vue-native-title"
          >在$start完成后的回调参数中包含了superProps</label
        >
        <p>{{ superProps }}</p>
      </div>

      <!-- 测量一个元素尺寸的范例，其实它是 measureInWindow 的封装 -->
      <div ref="measure-block" class="native-block">
        <label class="vue-native-title">Element.getBoundingClientRect</label>
        <p>{{ rect }}</p>
      </div>

      <!-- 本地存储使用 -->
      <div v-if="Native.asyncStorage" class="native-block">
        <label class="vue-native-title">AsyncStorage 使用</label>
        <div class="item-wrapper">
          <button class="item-button" @click="setItem">
            <span>setItem</span>
          </button>
          <span>{{ storageSetStatus }}</span>
        </div>
        <div class="item-wrapper">
          <button class="item-button" @click="removeItem">
            <span>removeItem</span>
          </button>
          <span>{{ storageSetStatus }}</span>
        </div>
        <div class="item-wrapper">
          <button class="item-button" @click="getItem">
            <span>getItem</span>
          </button>
          <span>{{ storageValue }}</span>
        </div>
      </div>

      <!-- ImageLoader使用 -->
      <div v-if="Native.imageLoader" class="native-block">
        <label class="vue-native-title">ImageLoader 使用</label>
        <div class="item-wrapper">
          <button class="item-button" @click="getSize">
            <span>getSize</span>
          </button>
          <span>{{ imageSize }}</span>
        </div>
      </div>

      <!-- NetInfo使用 -->
      <div v-if="Native.network" class="native-block">
        <label class="vue-native-title">NetInfo 使用</label>
        <div class="item-wrapper">
          <span>{{ netInfoText }}</span>
        </div>
      </div>

      <!-- Clipboard使用 -->
      <div v-if="Native.clipboard" class="native-block">
        <label class="vue-native-title">Clipboard 使用</label>
        <div class="item-wrapper">
          <button class="item-button" @click="setString">
            <span>setString</span>
          </button>
          <span>{{ clipboardString }}</span>
        </div>
        <div class="item-wrapper">
          <button class="item-button" @click="getString">
            <span>getString</span>
          </button>
          <span>{{ clipboardValue }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { Native, type HippyNode } from '@hippy/vue-next';
  import { defineComponent, onMounted, ref } from '@vue/runtime-core';

  import { getGlobalInitProps, warn } from '../../util';

  export default defineComponent({
    setup() {
      const clipboardString = ref('ready to set');
      const clipboardValue = ref('');
      const storageSetStatus = ref('ready to set');
      const storageValue = ref('');
      const imageSize = ref('');
      const netInfoText = ref('正在获取...');
      const rect = ref('');
      const superProps = ref('');
      const rectRef = ref(null);

      /**
       * 设置 item 内容
       */
      const setItem = () => {
        Native.asyncStorage.setItem('itemKey', 'storageValue');
        storageSetStatus.value = 'set "storageValue" succeed';
      };

      /**
       * 移除 item 内容
       */
      const removeItem = () => {
        Native.asyncStorage.removeItem('itemKey');
        storageSetStatus.value = 'remove "storageValue" succeed';
      };

      /**
       * 获取 item 内容
       */
      const getItem = async () => {
        const cacheValue = await Native.asyncStorage.getItem('itemKey');
        if (cacheValue) {
          storageValue.value = cacheValue;
        } else {
          storageValue.value = 'undefined';
        }
      };

      /**
       * 获取图片尺寸
       */
      const getSize = async () => {
        const result = await Native.imageLoader.getSize(
          'https://static.res.qq.com/nav/3b202b2c44af478caf1319dece33fff2.png',
        );
        warn('ImageLoader getSize', result);
        imageSize.value = `${result.width}x${result.height}`;
      };

      /**
       * 设置剪贴板内容
       */
      const setString = () => {
        Native.clipboard.setString('clipboardValue');
        clipboardString.value = 'clipboard set "clipboardValue" succeed';
      };

      /**
       * 获取剪贴板内容
       */
      const getString = async () => {
        const value = await Native.clipboard.getString();
        if (value) {
          clipboardValue.value = value;
        } else {
          clipboardValue.value = 'undefined';
        }
      };

      onMounted(() => {
        // hippy 初始化参数
        superProps.value = JSON.stringify(getGlobalInitProps());

        // netInfo
        Native.network.getNetStatus().then((netInfo) => {
          netInfoText.value = netInfo;
        });

        // ref="rect" 可以移动到任一元素上测试尺寸，除了 measureInWindow 在 android 上拿不到，别的都可以正常获取。
        if (rectRef.value) {
          Native.measureInAppWindow(rectRef.value as HippyNode).then(
            (rectInfo) => {
              rect.value = `Container rect: ${JSON.stringify(rectInfo)}`;
            },
          );
        }
      });

      // 屏幕是否是竖屏
      return {
        Native,
        rect,
        rectRef,
        storageValue,
        storageSetStatus,
        clipboardString,
        clipboardValue,
        imageSize,
        netInfoText,
        superProps,
        getSize,
        setItem,
        getItem,
        removeItem,
        setString,
        getString,
      };
    },
  });
</script>

<style>
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
    marginvertical: 5px;
  }

  .vue-native-title {
    text-decoration: underline;
    color: #40b883;
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
    margin-right: 10px;
  }
  .item-button span {
    color: white;
  }
</style>
