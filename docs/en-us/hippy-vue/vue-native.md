<!-- markdownlint-disable no-duplicate-header -->

# module

hippy-vue binds a `Native` attribute on vue to obtain terminal device information and call terminal module. It can also be used to monitor if it is running in a Hippy environment.

> Corresponding Demo: [demo-vue-native.vue](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/native-demos/demo-vue-native.vue)

# Get terminal information

It doesn't need any method, directly get values.

## version

Get the version of hippy-vue

* Example

```javascript
console.log(Vue.Native.version); // => 2.0.0
```

## Device

Get the device name, the iPhone can get specific iPhone model, Android devices can only get the text of `Android device` for the time being.

## OSVersion

iOS version

## APILevel

Android operating system version.

## SDKVersion

Hippy Terminal SDK version.

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
console.log(`Window size with status bar：${window.height}x${window.width}`); // => 640x460
```

## PixelRatio

Gets the device pixel scale.

* Example

```javascript
console.log(Vue.Native.PixelRatio); // => 3
```

## isIPhoneX

Gets whether the iPhoneX is a heteromorphic screen.

## screenIsVertical

Whether the screen is switched to landscape.

## OnePixel

The dp/pt value of a pixel.

## Localization

>* Minimum Supported Version 2.8.0

output internationalization-related information `object: { country: string , language: string, direction: number }`, where `direction` is 0 for LTR direction and 1 for RTL direction

---

# AsyncStorage

>* Minimum Supported Version 2.7.0
>* the capability of AsyncStorage are consistent with that localStorage module, which is mounted unde a global variable, and localStorage is available in all versions

[[AsyncStorage Sample（the same as Hippy-React AsyncStorage）]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/modules/AsyncStorage/index.jsx)

AsyncStorage is a simple, asynchronous, persistent Key-Value storage system.

* Example

``` js
Vue.Native.AsyncStorage.setItem('itemKey', 'itemValue');
Vue.Native.AsyncStorage.getItem('itemKey');
```

## method

### AsyncStorage.getAllKeys

`() => Promise<string[]>` get all the keys of AsyncStorage

### AsyncStorage.getItem

`(key: string) => Promise<string>` get data according to the key

> * key: string - Target key to obtain value

### AsyncStorage.multiGet

`(key: string[]) => Promise<[key: string, value: value][]>` One-time use multiple key value array to batch request cache data, the return value will be in the callback function in the form of a two-dimensional array of key-value pairs is returned.

> * key: string[] - The target key array for which the value needs to be obtained

### AsyncStorage.multiRemove

`(key: string[]) => void` Call this function to batch delete the key values in the passed-in keys array in AsyncStorage.

> * key: string[] - Target key array to be deleted

### AsyncStorage.multiSet

`(keyValuePairs: [key: string, value: value][]) => void` Call this function to bulk store key-value pair objects.

> * keyValuePairs: [key: string, value: value][] - Need to set the two-dimensional array of storage key value

### AsyncStorage.removeItem

`(key: string) => void` delete the data according to that key value.

> * key: string - Target key to be deleted

### AsyncStorage.setItem

`(key: string, value: string) => void` save key-value pairs according to the key and value.

> * key: string - The target key for which the value needs to be obtained
> * value: string - The target value for which the value is to be obtained

---

# BackAndroid

[[BackAndroid Sample]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/main-native.js)

You can listen for the fallback of Android entity keys, do actions before exiting, or intercept the fallback of entity keys.

>* Minimum Supported Version 2.7.0
>* Note: This method requires the terminal to intercept the event of the entity return button. Please refer to [onBackPressed Method of android-demo](//github.com/Tencent/Hippy/blob/master/examples/android-demo/example/src/main/java/com/tencent/mtt/hippy/example/MyActivity.java)

## method

### BackAndroid.addListener

`(handler: () => boolean) => { remove: Function }` Monitor the Android entity health rollback, trigger handler callback function.when the callback function returns true, intercepting the rollback operation of the terminal; When the callback function returns false, the rollback is not intercepted. This method will return contains `remove()` method of the object, can be removed by calling the `remove ()` method to listen, with `BackAndroid.RemoveListener`.

> * handler: Function - Callback function fired when an entity key is rolled back

### BackAndroid.exitApp

`() => void` Directly execute the exit App logic of the terminal.

### BackAndroid.removeListener

`(handler: () => boolean) => void` Removes the BackAndroid listener for Android instance health rollback events.

* handler: Function - It is recommended to use the object returned by `addListener` that contains the `remove()` method, or it could be the previous BackAndroid callback function.

---

# callNative/callNativeWithPromise

Call the terminal module method, `callNative` commonly used in no return module method calls, `callNativeWithPromise` commonly used in a return module method calls, it will return a Promise with the results.

# callUIFunction

Invoke a terminal method defined by a component

`callUIFunction(instance: ref, method: string, options: Array)`

> * instance: reference Ref of the component
> * method：Method name, e.g. `scrollToIndex` for ListView
> * options: Data to be passed, such as `[xIndex, yIndex, animated]` of ListView

---

# Clipboard

Clipboard read-write module, but currently only supports plain text.

## method

### getString()

return value：

* string

### setString(content)

| parameter | type     | require | parameter meaning |
| --------  | -------- | -------- |  -------- |
| content | string | yes       | Saved contents of the clipboard |

---

# ConsoleModule

> Minimum Supported Version 2.10.0

Provides the ability to output front-end logs to iOS terminal logs and [Android logcat](//developer.android.com/studio/command-line/logcat)

## method

### ConsoleModule.log

`(...value: string) => void`

### ConsoleModule.info

`(...value: string) => void`

### ConsoleModule.warn

`(...value: string) => void`

### ConsoleModule.error

`(...value: string) => void`

> * Both `log` and `info` are output as terminal INFO level log by default
> * Hippy version 2.10.0 after the original js `console` method and `ConsoleModule` method to separate, `console` no longer output log to the terminal

---

# Cookie

The `set-cookie` Header returned by the fetch service in Hippy will automatically save the Cookie, which will be brought with the request next time. Then the terminal provides this interface so that the service can obtain or modify the saved Cookie.

## method

### getAll(url)

| parameter | type     | require | parameter meaning |
| --------  | -------- | -------- |  -------- |
| url | string | yes       | Gets the cookie set under the specified URL |

return value:

* `Prmoise<string>`, like `name=someone;Gender=female` string, need to manually parse the business.

### set(url, keyValue, expireDate)

parameter：

| parameter | type     | require | parameter meaning |
| -------- | -------- | -------- |  -------- |
| url | string | yes       | Gets the cookie set under the specified URL |
| keyValue | string | yes       | The full string that needs to be set to the Cookie, for example`name=someone;gender=female` |
| expireDate | Date | no | Date type of expiration time, don't fill in not expired |

---

# getElemCss

Gets the CSS style for a concrete node.

> Minimum Supported Version 2.10.1

`(ref: ElementNode) => {}`

* Sample:

```js
this.demon1Point = this.$refs['demo-1-point'];
console.log(Vue.Native.getElemCss(this.demon1Point)) // => { height: 80, left: 0, position: "absolute" }
```

---

# ImageLoaderModule

Through the module can be corresponding to the remote image operation

> Minimum Supported Version 2.7.0

## method

### ImageLoaderModule.getSize

`(url: string) => Promise<{width, height}>` Gets the size of the picture (the picture is preloaded at the same time).

> * url - picture address

### ImageLoaderModule.prefetch

`(url: string) => void` Used to preload pictures.

> * url - picture address

---

# measureInAppWindow

> Minimum Supported Version 2.11.0

Measure the size and position of a component within the scope of the App window. Note that this method can be called only after the node instance is actually displayed (after the layout event).

`(ref) => Promise<{top: number, left: number, right: number, bottom: number, width: number, height: number}>`

> * Promise resolve parameters can get the reference component within the scope of the App window coordinates and width and height, if an error occurs or [node is optimized (only in Android)](hippy-vue/components?id=special attribute within that style) return {top: -1, left: -1, right: -1, bottom: -1, width: -1, height: -1}

---

# NetInfo

Through the interface can obtain the current equipment network status, also can register a listener, when the system network switch, get a notice.

> Minimum Supported Version 2.7.0

For Android developers, before requesting network status, you need.xml to add the following configuration to the app's `AndroidManifest`:

```xml
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

## network status

Determine whether the device is networked and using a mobile data network in an asynchronous manner.

* `NONE` -  The device is offline.
* `WIFI` - Device connected via wifi
* `CELL` - Device is connected via mobile network
* `UNKNOWN` - Abnormal or networking status unknown

## method

### NetInfo.addEventListener

`(eventName: string, handler: Function) => NetInfoRevoker` Add a network change listener.

> * eventName: 'change' - event name
> * handler: ({ network_info:string }) => any - Callback function triggered when the network changes

### NetInfo.fetch

`() => Promise<NetInfo>` Used to get the current network status.

### NetInfo.removeEventListener

`(eventName: string, handler: NetInfoRevoker | Function) => void` remove event listener

> * eventName: 'change' - event name
> * handler: Function - the corresponding event monitoring needs to be deleted

---

# parseColor

Color value type conversion, through the API to obtain terminal can identify `int32` type color value.Can be applied to direct communication with the terminal (such as `callNative`) interface parameters.

| parameter | type     | require | parameter meaning |
| --------  | -------- | -------- |  -------- |
| color | `string` `number` | yes  | Converted color values, supported types: `rgb`,`rgba`, `hex` |

return value:

* `number`: The return value is `int32Color` recognized by the terminal

* Example:

``` js
const int32Color = Vue.Native.parseColor('#40b883') // int32Color: 4282431619
```
