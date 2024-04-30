<!-- markdownlint-disable no-duplicate-header  -->

# Modules

---

# Animation

[[Animation example]](//github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/modules/Animation/index.jsx)

`Animation` is an animation component provided by Hippy, which can support incoming animation configuration and manually control the start and end. Implementing an animation on Hippy is divided into three steps:

- Define animation by Animation;
- Set it to the control property that needs to be animated during render;
- Start the animation through the start interface of Animation, or stop and destroy the animation through destroy.

> Note that when switching to the web, you need to use the setRef method to manually pass in the ref to run the animation normally. hippy-react-web does not support color gradient animation.
>
> Note that version 2.17.1 greatly upgraded iOS animation, fixing the inconsistency between the historical version and the Android animation performance. Please pay attention to compatibility when upgrading.

## Construction Attributes

| Props            | Type                                        | Required | Default value | Description                                                                                                                                                                                                                                                    |
|------------------|---------------------------------------------|----------|---------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| mode             | `string`                                    | yes      | timing        | Animation timeline mode                                                                                                                                                                                                                                        |
| delay            | `number`                                    | yes      | -             | The animation delay start time, in milliseconds, the default is 0, that is, the animation will be executed immediately after the animation starts; the number of rows in the specified list is generally directly passed in the number of data source`length`. |
| startValue       | `number`,`string`,  [color](style/color.md) | yes      | -             | The value at the beginning of the animation, which can be of type Number or String. If it is a color value, refer to [color](style/color.md).                                                                                                                  |
| toValue          | `number`,`string`,  [color](style/color.md) | yes      | -             | The value at the end of the animation; If it is a color value, refer to [color](style/color.md).                                                                                                                                                               |
| valueType\*      | `enum(undefined,rad,deg,color)`             | no       | undefined `(rotate default unit is rad)`          | The type of the start and end values of the animation, the default is empty, and the unit that indicates the start and end of the animation is a common Number. PS: The parameter on the web platform only supports the number type.                           |
| duration         | `number`                                    | no       | -             | Animation duration, in milliseconds(ms).                                                                                                                                                                                                                       |
| timingFunction\* | `string`                                    | no       | linear        | Animation interpolator type, support`linear`,`ease-in`,`ease-out`,`ease-in-out`,`cubic-bezier`.                                                                                                                                                                |
| repeatCount      | `number`,`loop`                             | no       | -             | The number of repetitions of the animation. The default is 0, which means it will be played only once; when it is -1 or "loop", it means infinite loop playback; when repeatCount is set to n, the animation will be played n times.                           |

- Other options for valueType:

  - `rad`: Indicates that the starting and ending values of the animation parameters are in radians, `this is default unit of rotate`.
  - `deg`: Indicates that the starting and ending values of the animation parameters are in degrees.
  - `color`: Indicates that the starting and ending values of the animation parameters are color values, which can modify the background color `backgroundColor` and text color `color` (Supported by iOS since version 2.17.1), refer to [examples.](//github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/modules/Animation/index.jsx) `Minimum supported version 2.6.0`

- Other options for timingFunction:
  - `linear`: With a linear interpolator, the animation will proceed at a constant speed.
  - `ease-in`: with an acceleration interpolator, the animation speed will gradually increase with time.
  - `ease-out`: With a deceleration interpolator, the animation speed will gradually decrease over time.
  - `ease-in-out`: using the acceleration and deceleration interpolator, the animation speed will gradually increase with time in the first half, and the speed will gradually decrease in the second half.
  - `cubic-bezier`: (Minimum supported version 2.9.0) Use a custom Bezier curve, consistent with [css transition-timing-function's cubic-bezier](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-timing-function).

## Methods

### destroy

`() => void` Stop and destroy an animation set. It is recommended to execute this method in the life cycle of component destruction to avoid the animation running in the background.

### pause

`() => void` Pauses a running animation.

### resume

`() => void` Resumes a paused animation.

### start

`() => void` Start the animation. Note: If the animation has not been assigned to the corresponding control through render before calling this method, or the animation has been destroyed, then start will not take effect.

### updateAnimation

`(options: Object) => void` Modify the configuration parameters of the animation. You only need to fill in the configuration items that need to be modified, no need to fill in all the animation parameters repeatedly. Pay attention, if animation has been started or destroyed, updateAnimation will not take effect.

>- options: Object: Instantiation parameter

### onAnimationCancel

`(callback: () => void) => void` Register an animation listener callback that will be called back when the animation is canceled.

### onAnimationEnd

`(callback: () => void) => void` Register an animation listener callback, which will be called back when the animation ends.

### onAnimationRepeat (Supported by iOS since version 2.17.1)

`(callback: () => void) => void` Register an animation listener callback, which will be called back when the animation starts to repeat the next time.

### onAnimationStart

`(callback: () => void) => void` Register an animation listener callback that will be called back when the animation starts.

---

# AnimationSet

[[AnimationSet example]](//github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/modules/Animation)

`AnimationSet` Similar to `Animation`, both are modules that give hippy components the ability to animate individual style properties (such as width, height, left, right).

The difference between `Animation` and `AnimationSet` is that `Animation` is only a single animation module, `AnimationSet` is a combination of animation modules of multiple `Animation`, and supports synchronous execution or sequential execution of multiple `Animation` animations.

> Note that when switching to the web, you need to use the setRef method to manually pass in the ref to run the animation normally.

## Construction Attributes

| Props       | Type                                        | Required | Default value | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
|-------------|---------------------------------------------|----------|---------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| children    | `{ children: Animation, follow = false }[]` | yes      | -             | It is used to specify the sub-animation and receives an Array. Each element of the Array includes:<br/>+ animation: The Animation object corresponding to the sub-animation;<br/>+ follow: configure whether the execution of the sub-animation follows the execution. When it is true, it means that the sub-animation will wait for the execution of the previous sub-animation to complete before starting. When it is false, it means that it starts at the same time as the previous sub-animation. The default is false. |
| repeatCount | `number`                                    | no       | -             | The number of repetitions of the AnimationSet, the default is 0, which means no repeat playback. When it is 'loop', it means infinite loop playback; when `repeatCount` is set to n, the animation will be played n times.                                                                                                                                                                                                                                                                                                     |

## Methods

### destroy

`() => void` Stop and destroy an animation set. It is recommended to execute this method during the component destruction lifecycle to avoid animations running in the background.

### pause

`() => void` Pauses a running animation.

### resume

`() => void` Resumes a paused animation.

### start

`() => void` Start the animation. Note: If the animation has not been assigned to the corresponding control through render or the animation has been destroyed before calling this method, start will not take effect.

### onAnimationCancel

`(callback: () => void) => void` Register an animation listener callback that will be called back when the animation is canceled.

### onAnimationEnd

`(callback: () => void) => void` Register a callback that listens to the animation and will be called back when the animation ends.

### onAnimationRepeat

`(callback: () => void) => void` Register a callback that listens to the animation, the callback will be called when the animation starts to repeat the next time.

### onAnimationStart

`(callback: () => void) => void` Register a callback that listens to the animation, the callback will be called back when the animation starts.

---

# AsyncStorage

[[AsyncStorage example]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/modules/AsyncStorage/index.jsx)

AsyncStorage is a simple, asynchronous, persistent Key-Value storage system that is global to the App.

> You can also use the localStorage object directly. The usage method is the same as the web version of the localStorage interface. The difference is that because they are all asynchronous methods, you need to add `await` in front of the method.

## Methods

### AsyncStorage.getAllKeys

`() => Promise<string[]>` Get all keys of AsyncStorage.

### AsyncStorage.getItem

`(key: string) => Promise<string>` Get the corresponding data according to the key value.

>- key: string - The target key that needs to get the value.

### AsyncStorage.multiGet

`(key: string[]) => Promise<[key: string, value: value][]>` Use multiple key arrays to request cache data in batches at one time, and the return value will be returned in the callback function in the form of a two-dimensional array of key-value pairs.

>- key: string[] - The array of target keys that needs to get the value.

### AsyncStorage.multiRemove

`(key: string[]) => void` Call this function to delete the values in AsyncStorage in batches, according to the incoming keys array.

>- key: string[] - The array of target keys to delete.

### AsyncStorage.multiSet

`(keyValuePairs: [key: string, value: value][]) => void` Call this function to store key-value objects in batches.

>- keyValuePairs: [key: string, value: two][] - A two-dimensional array of stored key values to be set.

### AsyncStorage.removeItem

`(key: string) => void` Delete the corresponding data according to the key value.

>- key: string - target key to delete.

### AsyncStorage.setItem

`(key: string, value: string) => void` Set the key-value pair to be saved according to key and value.

>- key: string - A string containing the name of the key you want to create/update.
>- value: string - A string containing the value you want to give the key you are creating/updating.

---

# BackAndroid

[[BackAndroid example]](//github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/pages/gallery.jsx#L171)

You can listen to the fallback of the Android entity key, and perform operations or intercept the fallback of the entity key before exiting. `hippy-react-web` No.

> Note: This method requires the native to intercept the event of the entity's return button. Please refer to [the onBackPressed method of android-demo](//github.com/Tencent/Hippy/blob/master/examples/android-demo/example/src/main/java/com/tencent/mtt/hippy/example/MyActivity.java)

## Methods

### BackAndroid.addListener

`(handler: () => boolean) => { remove: Function }` Listen to the Android entity key fallback event, and execute the handler callback function when triggered. Intercept the native's fallback operation when the callback function returns true. The fallback will not be intercepted when the callback function returns false. This function returns an object containing a `remove()` method. You can remove the listener by calling the `remove()` method, same as `BackAndroid.removeListener`.

> Callback Function: The callback function called when the entity key is falled back.

### BackAndroid.exitApp

`() => void` Directly execute the native's exit App logic.

### BackAndroid.removeListener

`(handler: () => boolean) => void` Removed BackAndroid listener for Android entity key back events.

>- handle: Function - It is recommended to use the object returned by `addListener` that contains the `remove()` method, or the previous BackAndroid callback function.

---

# ConsoleModule

Provides the ability to output front-end logs to iOS native logs and [Android logcat](//developer.android.com/studio/command-line/logcat)

## Methods

### ConsoleModule.log

`(... value: string) => void`

### ConsoleModule.info

`(... value: string) => void`

### ConsoleModule.warn

`(... value: string) => void`

### ConsoleModule.error

`(... value: string) => void`

> - Both `log` and `info` output as native INFO level logs by default.
> - After Hippy 2.10.0 version, the `console` method of the original js is separated from the `ConsoleModule` method, and `console` no longer outputs logs to the native.

---

# Dimensions

Used to get the width and height of the current device.

## Methods

### Dimensions.get

`(target: 'window' | 'screen') => { height: number, width: number, scale: number, statusBarHeight, navigatorBarHeight }` Hippy Root View size or screen size.

> - target: 'window' |'Screen' - Specify to measure Hippy Root View or screen size.
> - Android special instructions: Due to historical problems, the statusBarHeight in screen mode is calculated in actual pixels, and in window mode, it has been corrected to dp units.
> - navigatorBarHeight: Android bottom navigatorBar height. Minimum supported version 2.3.4.

---

# ImageLoaderModule

You can use this module to perform corresponding operations on remote images.

## Methods

### ImageLoaderModule.getSize

`(url: string) => Promise<{width, height}>` Get the image size (the image will be preloaded at the same time).

> - url - image address.

### ImageLoaderModule.prefetch

`(url: string) => void` For preloading images.

>- url - image address.

---

# NetInfo

[[NetInfo example]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/modules/NetInfo)

The network status of the current device can be obtained through this interface. It is also possible to register a listener to be notified when the system network switches.

Android developers need to add the following configuration to the app's `AndroidManifest.xml` before requesting network status:

```xml
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

`hippy-react-web` uses the experimental property NetworkInformation, see https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation for details.

## Network Status

Asynchronously determines whether the device is connected to the Internet and whether it is using a mobile data network.

- `NONE` - The device is offline.
- `WIFI` - The Device is connected to the Internet through wifi.
- `CELL` - The device is connected to the Internet through the mobile network.
- `UNKNOWN` - The network is abnormal or the network status is unknown.

## Methods

### NetInfo.addEventListener

`(eventName: string, handler: Function) => NetInfoRevoker` Add a network change listener.

>- eventName: 'Change' - Event name.
>- handler: ({ network_info: String }) => any - Callback function called when the network changes.

### NetInfo.fetch

`() => Promise<string>` Used to obtain the current network status.

### NetInfo.removeEventListener

`(eventName: string, handler: NetInfoRevoker | Function) => void` Remove Event Listener

>- eventName: 'Change' - event name.
>- handler: Function - The corresponding event listener that needs to be deleted.

# NetworkModule

It mainly contains modules related to the network, and currently mainly operates cookies.

For common network requests,, please refer to: [Getting Started - Network Requests](guide/network-request.md)

`hippy-react-web` get cookie and set cookie with domain name restrictions. Refer to https for details://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#define_where_cookies_are_sent

## Methods

### NetworkModule.getCookies

`(url: string) => Promise<string>` Get all cookies for the specified url

>- url: string - The target url that needs to get the cookie.
>- return value:  `Promise<string>`, return string like `name=hippy;network=mobile`. After version `2.14.0`, expired Cookies would not be returned.

### NetworkModule.setCookie

`(url: string, keyValue: string, expires?: Date) => <void> Set cookie

>- url: string - The target url that needs to set the cookie.
>- keyValue: string - Key-value pair to set, e.g. `name=hippy;network=mobile`. After version `2.14.0`, `empty string` would clear all Cookies under the specific URL.
>- expires?: Date - Set the timeout for cookies.

---

# PixelRatio

Used to obtain the pixel density of the current device.

## Methods

### PixelRatio.get

`() => number` Returns the pixel density of the current device.

## Paradigm

- PixelRatio.get() === 1
  - [MDPI Android device](//material.io/tools/devices/)
- PixelRatio.get() === 1.5
  - [Hdpi Android device](//material.io/tools/devices/)
- PixelRatio.get() === 2
  - iPhone 4, iPhone 4S
  - iPhone 5, iPhone 5c, iPhone 5s
  - iPhone 6, iPhone 7, iPhone 8
  - [Xhdpi Android device](//material.io/tools/devices/)
- PixelRatio.get() === 3
  - iPhone 6 Plus, iPhone 7 Plus, iPhone 8 Plus
  - iPhone X
  - Pixel, Pixel 2
  - [Xxhdpi Android device](//material.io/tools/devices/)
- PixelRatio.get() === 3.5
  - Nexus 6
  - Pixel XL, Pixel 2 XL
  - [Xxxhdpi Android device](//material.io/tools/devices/)

---

# Platform

A component used to write code to differentiate platforms. Developers develop business logic branches for different platforms based on the output value of `Platform.OS`.

## Attributes

| Props        | Description                                                                         | Type                                                                                                                                                  | Supported Platforms                                                 |
|--------------|-------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------|
| OS           | Used to determine whether it is iOS or Android.                                     | `string`                                                                                                                                              | `Android、iOS`                                                       |
| Localization | Output internationalization related information, `minimum supported version 2.8.0`. | `object: { country: string , language: string, direction: number }` where`direction` 0 indicates the LTR direction and 1 indicates the RTL direction. | `Android、iOS、hippy-react-web(does not support country information)` |

---

# Stylesheet

Provides an abstraction similar to CSS style sheets.

## Attributes

| Props         | Description                                                                                                                                                                                                                                                                              | Type     | Supported Platforms |
|---------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|---------------------|
| hairlineWidth | This constant defines the thinnest width on the current platform. Can be used as a border or as a divider between two elements. However you should not consider it a reliable unit of length, as hairlineWidth may behave differently on different machines or at different resolutions. | `number` | `Android、iOS`       |

## Methods

### StyleSheet.create

`(styleObj: Object) => styleObj`

>- styleObj: Object - style object.

---

# UIManagerModule

Provides some ability to operate UI.

## Methods

### UIManagerModule.callUIFunction

Call the native method defined in the component

`callUIFunction(instance: ref, method: string, options: Array)`

>- instance: Component reference.
>- method: Method name, such as ListView`scrollToIndex`.
>- options: The data to be passed, such as `[xIndex, yIndex, animated]` of ListView, or `[]` when it is empty.

### UIManagerModule.getElementFromFiberRef

Get the Element corresponding to the element Ref (similar to DOM). `hippy-react-web` is not supported.

`getElementFromFiberRef(instance: ref): ElementNode`

>- instance: Component reference.
>- ElementNode：Similar to DOM, you can call methods such as setNativeProps.

### UIManagerModule.measureInAppWindow

Measure the size and position of a component within the scope of the App window. If there is an error, the parameter of callback may be a string or -1. Note that this method can only be called after the node instance actually appears on the screen (after the onLayout event).

`(ref, callback: Function) => Promise`

>- callback: ({ x, y, width, height }|  string |-1) => void - Callback function, its parameters can get the coordinate value, width and height of the referenced component within the scope of the App window. May return -1 or a string with `this view is null` in case of error or [node is optimized (Android only)](style/layout?id=collapsable).

### UIManagerModule.getBoundingClientRect

[[getBoundingClientRect example]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/modules/UIManagerModule/index.jsx)

> Minimum supported version `2.15.3`, `measureInWindow` and `measureInAppWindow` will be deprecated soon.

Measure the size and position of a component within the scope of the App Container(RootView) or App Window(Screen).

`(instance: ref, options: { relToContainer: boolean }) => Promise<DOMRect: { x: number, y: number, width: number, height: number, bottom: number, right: number, left: number, top: number }>`

> - instance: reference of the element of component.
> - options: optional，`relToContainer` indicates whether to be measured relative to the App Container(RootView), default is `false`, meaning relative to App Window(Screen). When measured relative to the App Container(RootView), status bar is included in `iOS`, but `Android` not.
> - DOMRect: same with [MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/getBoundingClientRect) introduction, which can get the size and position of a component. If something goes wrong or [the node is optimized (Android only)](style/layout?id=collapsable), `Promise.reject` error will be thrown.
