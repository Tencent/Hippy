<!-- markdownlint-disable no-duplicate-header -->

# Modules

hippy-vue binds a `Native` prop on Vue to obtain native device information and call native module. It can also be used to monitor if it is running in a Hippy environment.

> Corresponding Demo: [demo-vue-native.vue](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/native-demos/demo-vue-native.vue)

---

# Get native information

It doesn't need any method, directly get values.

## version

Get the version of hippy-vue

* Example

```javascript
console.log(Vue.Native.version); // => 2.0.0
```

## Device

Get the device name. For iphone, it can get specific iPhone version. For Android, it can only get the text of `Android device` currently.

## OSVersion

iOS version

## APILevel

Android operating system version.

## SDKVersion

Hippy native SDK version.

## Platform

Gets the operating system type.

* Example

```javascript
console.log(Vue.Native.Platform); // => android
```

## Dimensions

Gets the screen resolution.

* Example

```javascript
const { window, screen } = Vue.Native.Dimensions;
console.log(`Screen Size：${screen.height}x${screen.width}`); // => 640x480
console.log(`Window size with status bar: ${window.height}x${window.width}`); // => 640x460
```

## PixelRatio

Gets the device pixel scale.

* Example

```javascript
console.log(Vue.Native.PixelRatio); // => 3
```

## isIPhoneX

Gets whether it is the heteromorphic screenthe iPhoneX.

## screenIsVertical

Whether the screen is switched to landscape mode.

## OnePixel

The dp/pt value of one pixel.

## Localization

>* Minimum Supported Version 2.8.0

output internationalization-related information `object: { country: string , language: string, direction: number }`, where `direction` is 0 for LTR direction and 1 for RTL direction

---

# AsyncStorage

>* Minimum Supported Version 2.7.0
>* the capability of AsyncStorage are consistent with that of the localStorage module, which is mounted unde a global variable, and localStorage is available in all versions

[[AsyncStorage Example（the same as Hippy-React AsyncStorage）]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/modules/AsyncStorage/index.jsx)

AsyncStorage is a simple, asynchronous, persistent Key-Value storage system.

* Example

``` js
Vue.Native.AsyncStorage.setItem('itemKey', 'itemValue');
Vue.Native.AsyncStorage.getItem('itemKey');
```

## Methods

### AsyncStorage.getAllKeys

`() => Promise<string[]>` get all the keys of AsyncStorage

### AsyncStorage.getItem

`(key: string) => Promise<string>` get data according to the key

> * key: string - Target key to obtain value

### AsyncStorage.multiGet

`(key: string[]) => Promise<[key: string, value: value][]>` Batch requests for cached data with multiple key arrays at once, the return value will be returned in the form of a two-dimensional array of key-value pairs in the callback function.

> * key: string[] - The target key array for which the value needs to be obtained

### AsyncStorage.multiRemove

`(key: string[]) => void` Call this function to batch delete the key values preserved in the passed-in keys array in AsyncStorage.

> * key: string[] - Target key array to be deleted

### AsyncStorage.multiSet

`(keyValuePairs: [key: string, value: value][]) => void` Call this function to bulk store key-value pair objects.

> * keyValuePairs: [key: string, value: value][] - The two-dimensional array of storage key value that needs to be set.

### AsyncStorage.removeItem

`(key: string) => void` delete the data according to the key value.

> * key: string - Target key to be deleted

### AsyncStorage.setItem

`(key: string, value: string) => void` save key-value pairs according to the key and value.

> * key: string - The target key for which the value needs to be obtained
> * value: string - The target value for which the value needs to be obtained

---

# BackAndroid

[[BackAndroid Example]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/main-native.js)

You can monitor the rollback of Android entity keys, do actions before exiting or intercepting the rollback of entity keys.

>* Minimum Supported Version 2.7.0
>* Note: This method requires the native to intercept the event of the entity return button. Please refer to [onBackPressed method of android-demo](//github.com/Tencent/Hippy/blob/master/examples/android-demo/example/src/main/java/com/tencent/mtt/hippy/example/MyActivity.java)

## Methods

### BackAndroid.addListener

`(handler: () => boolean) => { remove: Function }` Monitor the Android entity rollback function, call the function handler when the rollback function is called. When the callback function returns true, intercepting the rollback operation of the native; When the callback function returns false, the rollback is not intercepted. This method will return the object that contains `remove()` method. The monitor can be removed by calling the `remove ()` method, the same as `BackAndroid.RemoveListener`.

> * handler: Function - Callback function called when the entity key is rolled back

### BackAndroid.exitApp

`() => void` Directly execute the exit App logic of the native.

### BackAndroid.removeListener

`(handler: () => boolean) => void` Removes the BackAndroid listener for Android entity callback events.

* handler: Function - It is recommended to use the object returned by `addListener` that contains the `remove()` method, or it could be the previous BackAndroid callback function.

---

# callNative/callNativeWithPromise

Method to call the native module, `callNative` is commonly used in module method calls with no return values, `callNativeWithPromise` is commonly used in module method calls with return values, it will return a Promise with the results.

# callUIFunction

Invoke a native method defined by a component

`callUIFunction(instance: ref, method: string, options: Array)`

> * instance: reference Ref of the component
> * method：Method name, e.g. `scrollToIndex` for ListView
> * options: Data to be passed, such as `[xIndex, yIndex, animated]` of ListView

---

# ConsoleModule

> Minimum Supported Version 2.10.0

Provides the ability to output front-end logs to iOS native logs and [Android logcat](//developer.android.com/studio/command-line/logcat)

## Methods

### ConsoleModule.log

`(...value: string) => void`

### ConsoleModule.info

`(...value: string) => void`

### ConsoleModule.warn

`(...value: string) => void`

### ConsoleModule.error

`(...value: string) => void`

> * Both `log` and `info` are output as native INFO level log by default
> * Hippy version 2.10.0 and after will separate the original js `console` method and `ConsoleModule` method, `console` will no longer output log to the native

---

# Cookie

The `set-cookie` Header returned by the fetch service in Hippy will automatically save the Cookie, which will be brought with the request next time. Then the native provides this interface so that the service can obtain or modify the saved Cookie.

## Methods

### getAll(url)

| Props | Type     | Require | Description |
| --------  | -------- | -------- |  -------- |
| url | string | yes       | Gets the cookie set under the specified URL. After version `2.14.0`, expired Cookies would not be returned. |

Return Value:

* `Prmoise<string>` like `name=hippy;network=mobile` string.

### set(url, keyValue, expireDate)

Attributes:

| Props | Type     | Require | Description |
| -------- | -------- | -------- |  -------- |
| url | string | yes       | Gets the cookie set under the specified URL |
| keyValue | string | yes       | The full string that needs to be set to the Cookie, for example`name=hippy;network=mobile`. After version `2.14.0`, `empty string` would clear all Cookies under the specific URL. |
| expireDate | Date | no | Date type of expiration time, it will not expired if not fill in. |

---

# getElemCss

Gets the CSS style for a concrete node.

> Minimum Supported Version `2.10.1`

`(ref: ElementNode) => {}`

* Example:

```js
this.demon1Point = this.$refs['demo-1-point'];
console.log(Vue.Native.getElemCss(this.demon1Point)) // => { height: 80, left: 0, position: "absolute" }
```

---

# ImageLoaderModule

Can do the corresponding operations to the remote image through this module. 

> Minimum Supported Version `2.7.0`

## Methods

### ImageLoaderModule.getSize

`(url: string) => Promise<{width, height}>` Gets the size of the picture (the picture is preloaded at the same time).

> * url - picture address

### ImageLoaderModule.prefetch

`(url: string) => void` Used to preload pictures.

> * url - picture address

---

# measureInAppWindow

> Minimum Supported Version `2.11.0`

Measure the size and position of a component within the scope of the App window. Note that this method can be called only after the node instance is actually displayed (after the layout event).

`(ref) => Promise<{top: number, left: number, right: number, bottom: number, width: number, height: number}>`

> * Promise resolve parameters can get the coordinates and width and height of the reference component within the scope of the App window, if an error occurs or [node is optimized (only in Android)](hippy-vue/components?id=special prop within that style) return {top: -1, left: -1, right: -1, bottom: -1, width: -1, height: -1}

---

# getBoundingClientRect

> Minimum supported version `2.15.3`, `measureInWindow` and `measureInAppWindow` will be deprecated soon.

Measure the size and position of a component within the scope of the App Container(RootView) or App Window(Screen).

`(instance: ref, options: { relToContainer: boolean }) => Promise<DOMRect: { x: number, y: number, width: number, height: number, bottom: number, right: number, left: number, top: number }>`

> * instance: reference of the element of component.
> * options: optional，`relToContainer` indicates whether to be measured relative to the App Container(RootView). Default is `false`, meaning relative to App Window(Screen). When measured relative to the App Container(RootView), status bar is included in `iOS`, but `Android` not.
> * DOMRect: same with [MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/getBoundingClientRect) introduction, which can get the size and position of a component. If something goes wrong or [the node is optimized (Android only)](style/layout?id=collapsable), `Promise.reject` error will be thrown.

---

# NetInfo

Through the interface can obtain the current equipment network status, also can register a listener. When the system network switches, you will get a notice.

> Minimum Supported Version 2.7.0

For Android developers, before requesting network status, you need to add the following configurations to the app's `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

## Network Status

Determine whether the device is connected to the Internet and used a mobile data network in an asynchronous manner.

* `NONE` -  The device is offline.
* `WIFI` - Device connected to the Internet via wifi
* `CELL` - Device connected to the Internet via mobile network
* `UNKNOWN` - Abnormal or unknown networking status 

## Methods

### NetInfo.addEventListener

`(eventName: string, handler: Function) => NetInfoRevoker` Add a network change listener.

> * eventName: 'change' - event name
> * handler: ({ network_info:string }) => any - Callback function called when the network changes

### NetInfo.fetch

`() => Promise<string>` Used to get the current network status.

### NetInfo.removeEventListener

`(eventName: string, handler: NetInfoRevoker | Function) => void` remove event listener

> * eventName: 'change' - event name
> * handler: Function - the corresponding event monitoring needs to be deleted

---

# parseColor

Color value type conversion, obtain the `int32` type color value that can be identified by the native through the API. Can be used to pass parameters through the interface when directly comminicate with the native (such as `callNative`).

| Props | Type     | Require | Description |
| --------  | -------- | -------- |  -------- |
| color | `string` `number` | yes  | Converted color values, supported types: `rgb`,`rgba`, `hex` |

return value:

* `number`: The return value is `int32Color` that can be recognized by the native

* Example:

``` js
const int32Color = Vue.Native.parseColor('#40b883') // int32Color: 4282431619
```
