<template>
  <div
    id="demo-vue-native"
    ref="rectRef"
  >
    <div>
      <!-- platform -->
      <div
        v-if="Native.Platform"
        class="native-block"
      >
        <label class="vue-native-title">Native.Platform</label>
        <p>{{ Native.Platform }}</p>
      </div>

      <!-- device name -->
      <div class="native-block">
        <label class="vue-native-title">Native.Device</label>
        <p>{{ Native.Device }}</p>
      </div>

      <!-- Is it an iPhone X -->
      <div
        v-if="Native.isIOS()"
        class="native-block"
      >
        <label class="vue-native-title">Native.isIPhoneX</label>
        <p>{{ Native.isIPhoneX }}</p>
      </div>

      <!-- OS version, currently only available for iOS, other platforms return null -->
      <div
        v-if="Native.isIOS()"
        class="native-block"
      >
        <label class="vue-native-title">Native.OSVersion</label>
        <p>{{ Native.OSVersion || 'null' }}</p>
      </div>

      <!-- Internationalization related information -->
      <div class="native-block">
        <label class="vue-native-title">Native.Localization</label>
        <p>{{ `国际化相关信息` }}</p>
        <p>{{ `国家 ${Native.Localization?.country}` }}</p>
        <p>{{ `语言 ${Native.Localization?.language}` }}</p>
        <p>
          {{ `方向 ${Native.Localization.direction === 1 ? 'RTL' : 'LTR'}` }}
        </p>
      </div>

      <!-- API version, currently only available for Android, other platforms return null -->
      <div
        v-if="Native.isAndroid()"
        class="native-block"
      >
        <label class="vue-native-title">Native.APILevel</label>
        <p>{{ Native.APILevel || 'null' }}</p>
      </div>

      <!-- Whether the screen is vertically displayed -->
      <div class="native-block">
        <label class="vue-native-title">Native.screenIsVertical</label>
        <p>{{ Native.screenIsVertical }}</p>
      </div>

      <!-- width of window -->
      <div
        v-if="Native.Dimensions.window.width"
        class="native-block"
      >
        <label class="vue-native-title">Native.Dimensions.window.width</label>
        <p>{{ Native.Dimensions.window.width }}</p>
      </div>

      <!-- The height of the window, it should be noted that both platforms include the status bar. -->
      <!-- Android will start drawing from the first pixel below the status bar. -->
      <div
        v-if="Native.Dimensions.window.height"
        class="native-block"
      >
        <label class="vue-native-title">Native.Dimensions.window.height</label>
        <p>{{ Native.Dimensions.window.height }}</p>
      </div>

      <!-- width of screen -->
      <div
        v-if="Native.Dimensions.screen.width"
        class="native-block"
      >
        <label class="vue-native-title">Native.Dimensions.screen.width</label>
        <p>{{ Native.Dimensions.screen.width }}</p>
      </div>

      <!-- height of screen -->
      <div
        v-if="Native.Dimensions.screen.height"
        class="native-block"
      >
        <label class="vue-native-title">Native.Dimensions.screen.height</label>
        <p>{{ Native.Dimensions.screen.height }}</p>
      </div>

      <!-- the pt value of a pixel -->
      <div class="native-block">
        <label class="vue-native-title">Native.OnePixel</label>
        <p>{{ Native.OnePixel }}</p>
      </div>

      <!-- Android Navigation Bar Height -->
      <div
        v-if="Native.Dimensions.screen.navigatorBarHeight"
        class="native-block"
      >
        <label
          class="vue-native-title"
        >Native.Dimensions.screen.navigatorBarHeight</label>
        <p>{{ Native.Dimensions.screen.navigatorBarHeight }}</p>
      </div>

      <!-- height of status bar -->
      <div
        v-if="Native.Dimensions.screen.statusBarHeight"
        class="native-block"
      >
        <label
          class="vue-native-title"
        >Native.Dimensions.screen.statusBarHeight</label>
        <p>{{ Native.Dimensions.screen.statusBarHeight }}</p>
      </div>

      <!-- android virtual navigation bar height -->
      <div
        v-if="
          Native.isAndroid() &&
            Native.Dimensions.screen.navigatorBarHeight !== undefined
        "
        class="native-block"
      >
        <label
          class="vue-native-title"
        >Native.Dimensions.screen.navigatorBarHeight(Android only)</label>
        <p>{{ Native.Dimensions.screen.navigatorBarHeight }}</p>
      </div>

      <!-- The startup parameters passed from the native -->
      <div
        v-if="superProps"
        class="native-block"
      >
        <label
          class="vue-native-title"
        >afterCallback of $start method contain superProps</label>
        <p>{{ superProps }}</p>
      </div>

      <!-- A demo of Native Event，Just show how to use -->
      <div
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

      <!-- example of measuring the size of an element -->
      <div
        ref="measure-block"
        class="native-block"
      >
        <label class="vue-native-title">Native.getBoundingClientRect</label>
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
            <span>relative to Container</span>
          </button>
          <span style="max-width: 200px">{{ rect2 }}</span>
        </div>
      </div>

      <!-- local storage -->
      <div
        v-if="Native.AsyncStorage"
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

      <!-- ImageLoader -->
      <div
        v-if="Native.ImageLoader"
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

      <!-- Fetch -->
      <div class="native-block">
        <label class="vue-native-title">Fetch 使用</label>
        <div class="item-wrapper">
          <span>{{ fetchText }}</span>
        </div>
      </div>

      <!-- network info -->
      <div
        v-if="Native.NetInfo"
        class="native-block"
      >
        <label class="vue-native-title">NetInfo 使用</label>
        <div class="item-wrapper">
          <span>{{ netInfoText }}</span>
        </div>
      </div>

      <!-- Cookie -->
      <div
        v-if="Native.Cookie"
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
      <!-- iOS platform  -->
      <div
        v-if="Native.isIOS()"
        class="native-block"
      >
        <label class="vue-native-title">Native.isIOS</label>
        <p>{{ Native.isIOS() }}</p>
      </div>

      <!-- Android platform  -->
      <div
        v-if="Native.isAndroid()"
        class="native-block"
      >
        <label class="vue-native-title">Native.isAndroid</label>
        <p>{{ Native.isAndroid() }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Native, type HippyNode, EventBus } from '@hippy/vue-next';
import { defineComponent, onMounted, ref } from '@vue/runtime-core';

import { getGlobalInitProps } from '../../util';

let networkListener;
const TEST_EVENT_NAME = 'testEvent';

export default defineComponent({
  setup() {
    const storageSetStatus = ref('ready to set');
    const storageValue = ref('');
    const imageSize = ref('');
    const netInfoText = ref('正在获取...');
    const rect1 = ref('');
    const rect2 = ref('');
    const superProps = ref('');
    const rectRef = ref(null);
    const fetchText = ref('请求网址中...');
    const cookieString = ref('ready to set');
    const cookiesValue = ref('');
    const eventTriggeredTimes = ref(0);

    /**
       * set local storage
       */
    const setItem = () => {
      Native.AsyncStorage.setItem('itemKey', 'hippy');
      storageSetStatus.value = 'set "hippy" value succeed';
    };

    /**
       * remove local storage
       */
    const removeItem = () => {
      Native.AsyncStorage.removeItem('itemKey');
      storageSetStatus.value = 'remove "hippy" value succeed';
    };

    /**
       * get local storage
       */
    const getItem = async () => {
      const cacheValue = await Native.AsyncStorage.getItem('itemKey');
      if (cacheValue) {
        storageValue.value = cacheValue;
      } else {
        storageValue.value = 'undefined';
      }
    };

    /**
       * gei size of image
       */
    const getSize = async () => {
      const result = await Native.ImageLoader.getSize('https://user-images.githubusercontent.com/12878546/148736102-7cd9525b-aceb-41c6-a905-d3156219ef16.png');
      console.log('ImageLoader getSize', result);
      imageSize.value = `${result.width}x${result.height}`;
    };

    const setCookie = () => {
      Native.Cookie.set('https://hippyjs.org', 'name=hippy;network=mobile');
      cookieString.value = '\'name=hippy;network=mobile\' is set';
    };
    const getCookie = () => {
      Native.Cookie.getAll('https://hippyjs.org').then((cookies) => {
        cookiesValue.value = cookies;
      });
    };

    const getBoundingClientRect = async (relToContainer = false) => {
      try {
        const rect = await Native.getBoundingClientRect(rectRef.value as HippyNode, { relToContainer });
        if (!relToContainer) {
          rect1.value = `${JSON.stringify(rect)}`;
        } else {
          rect2.value = `${JSON.stringify(rect)}`;
        }
      } catch (err) {
        console.error('getBoundingClientRect error', err);
      }
    };

    const triggerAppEvent = () => {
      EventBus.$emit(TEST_EVENT_NAME);
    };

    onMounted(() => {
      superProps.value = JSON.stringify(getGlobalInitProps());

      Native.NetInfo.fetch().then((netInfo) => {
        netInfoText.value = netInfo;
      });
      networkListener = Native.NetInfo.addEventListener('change', (info) => {
        netInfoText.value = `收到通知: ${info.network_info}`;
      });

      fetch('https://hippyjs.org', {
        mode: 'no-cors', // 2.14.0 or above supports other options(not only method/headers/url/body)
      })
        .then((responseJson) => {
          fetchText.value = `成功状态: ${responseJson.status}`;
        })
        .catch((error) => {
          fetchText.value = `收到错误: ${error}`;
        });

      EventBus.$on(TEST_EVENT_NAME, () => {
        eventTriggeredTimes.value += 1;
      });
    });

    return {
      Native,
      rect1,
      rect2,
      rectRef,
      storageValue,
      storageSetStatus,
      imageSize,
      netInfoText,
      superProps,
      fetchText,
      cookieString,
      cookiesValue,
      getSize,
      setItem,
      getItem,
      removeItem,
      setCookie,
      getCookie,
      getBoundingClientRect,
      triggerAppEvent,
      eventTriggeredTimes,
    };
  },
  beforeDestroy() {
    if (networkListener) {
      Native.NetInfo.removeEventListener('change', networkListener);
    }
    EventBus.$off(TEST_EVENT_NAME);
  },
});
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
