<!-- markdownlint-disable no-duplicate-header  -->
<!-- markdownlint-disable no-blacks-blockquote -->

# 模块

---

# Animation

[[Animation 范例]](//github.com/Tencent/Hippy/blob/master/framework/js/examples/hippy-react-demo/src/modules/Animation/index.jsx)

`Animation` 是 Hippy 提供的动画组件，可以支持传入动画配置，以及手动控制开始与结束。在 Hippy 上实现一个动画分为三个步骤：

- 通过 Animation 定义动画；
- 在 render 时，将动画设置到需要产生动画效果的控件属性上；
- 通过 Animation 的 start 接口启动动画，或是通过 destroy 停止并销毁动画。

> 注意，转 Web 需要用 setRef 方法手动传入 ref 才可以正常运行动画

## 构造参数

| 参数             | 类型               | 必需 | 默认值 | 描述                                                                                                                      |
| ---------------- | ------------------ | ---- | ------ | ------------------------------------------------------------------------------------------------------------------------- |
| mode             | `string`           | 是   | timing | 动画时间轴模式                                                                                                            |
| delay            | `number`           | 是   | -      | 动画延迟开始的时间，单位为毫秒，默认为 0，即动画 start 之后立即执行；指定列表的行数，一般直接传入数据源条数 `length` 即可 |
| startValue       | `number`, `string` | 是   | -      | 动画开始时的值，可为 Number 类型 String 类型，如果为颜色值参考 [color](style/color.md)                                    |
| toValue          | `number`, `string` | 是   | -      | 动画结束时候的值；如果为颜色值参考 [color](style/color.md)                                                                |
| valueType\*      | `number`, `string` | 否   | null   | 动画的开始和结束值的类型，默认为空，代表动画起止的单位是普通 Number。 PS: Web 平台此接口只支持 number 类型传参            |
| duration         | `number`           | 否   | -      | 动画时长，单位为毫秒(ms)                                                                                                  |
| timingFunction\* | `string`           | 否   | linear | 动画插值器类型, 支持 `linear`，`ease-in`， `ease-out`，`ease-in-out`，`cubic-bezier`                                                                                                       |
| repeatCount      | `number`, `loop`   | 否   | -      | 动画的重复次数，默认为 0，即只播放一次，为"loop"时代表无限循环播放； repeatCount 设为 n 时，则动画会播放 n 次             |

- valueType 的参数选项：

  - `rad`：代表动画参数的起止值为弧度；
  - `deg`：代表动画参数的起止值为度数；
  - `color`：代表动画参数的起止值为颜色值，可修饰背景色 `backgroundColor` 和文字颜色 `color`(仅 Android 支持)，参考 [例子](//github.com/Tencent/Hippy/blob/master/framework/js/examples/hippy-react-demo/src/modules/Animation/index.jsx) `最低支持版本2.6.0`

- timingFunction 的参数选项：
  - `linear`：使用线性插值器，动画将匀速进行；
  - `ease-in`：使用加速插值器，动画速度将随时间逐渐增加；
  - `ease-out`：使用减速插值器，动画速度将随时间逐渐减小；
  - `ease-in-out`：使用加减速插值器，动画速度前半段先随时间逐渐增加，后半段速度将逐渐减小；
  - `cubic-bezier`：(最低支持版本 2.9.0)使用自定义贝塞尔曲线，与 [css transition-timing-function 的 cubic-bezier](https://developer.mozilla.org/en-US/docs/Web/CSS/transition-timing-function) 一致；

## 方法

### destroy

`() => void` 停止并销毁一个动画集。建议在组件销毁的生命周期执行此方法，避免动画在后台运行耗。

### onAnimationEnd

`(callback: () => void) => void` 注册一个动画的监听回调，在动画结束时将会回调 callback。

### onAnimationRepeat（仅 Android 支持）

`(callback: () => void) => void` 注册一个动画的监听回调，当动画开始下一次重复播放时 callback 将被回调。

### onAnimationStart

`(callback: () => void) => void` 注册一个动画的监听回调，在动画开始时将会回调 callback。

### pause

`() => void` 暂停运行中的动画。

### resume

`() => void` 继续播放暂停了的动画。

### start

`() => void` 启动动画。注意：如果调用该方法前，动画尚未经过 render 赋值给相应控件, 或该动画已经 destroy 的话，那 start 将不会生效；

### updateAnimation

`(options: Object) => void` 修改动画的配置参数，只需要填入需要修改的配置项即可，不需要重复填入所有的动画参数

> - options: Object: 实例化参数

---

# AnimationSet

[[AnimationSet 范例]](//github.com/Tencent/Hippy/blob/master/framework/js/examples/hippy-react-demo/src/modules/Animation)

`AnimationSet` 与 `Animation` 类似，都是赋予 hippy 组件的单个样式属性（如 width、height、left、right）动画能力的模块。

`Animation` 与 `AnimationSet` 的不同点在于 `Animation` 只是单个动画模块，`AnimationSet` 为多个 `Animation` 的动画模块组合，支持同步执行或顺序执行多个 `Animation` 动画。

> 注意，转 Web 需要用 setRef 方法手动传入 ref 才可以正常运行动画。

## 构造参数

| 参数        | 类型                                        | 必需 | 默认值 | 描述                                                                                                                                                                                                                                                        |
| ----------- | ------------------------------------------- | ---- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| children    | `{ children: Animation, follow = false }[]` | 是   | -      | 接收一个 Array，用于指定子动画，该 Array 的每个元素包括： + animation：子动画对应的 Animation 对象； + follow：配置子动画的执行是否跟随执行，为 true，代表该子动画会等待上一个子动画执行完成后在开始，为 false 则代表和上一个子动画同时开始，默认为 false。 |
| repeatCount | `number`                                    | 否   | -      | 动画 Set 的重复次数，默认为 0，即不重复播放，为'loop'时代表无限循环播放； `repeatCount` 设为 n 时，则动画会播放 n 次。                                                                                                                                      |

## 方法

### destroy

`() => void` 停止并销毁一个动画集。建议在组件销毁的生命周期执行此方法，避免动画在后台运行耗。

### onAnimationEnd

`(callback: () => void) => void` 注册一个动画的监听回调，在动画结束时将会回调 callback。

### onAnimationRepeat

`(callback: () => void) => void` 注册一个动画的监听回调，当动画开始下一次重复播放时 callback 将被回调。

### onAnimationStart

`(callback: () => void) => void` 注册一个动画的监听回调，在动画开始时将会回调 callback。

### pause

`() => void` 暂停运行中的动画。

### resume

`() => void` 继续播放暂停了的动画。

### start

`() => void` 启动动画。注意：如果调用该方法前，动画尚未经过 render 赋值给相应控件, 或该动画已经 destroy 的话，那 start 将不会生效；

### updateAnimation

`(options: Object) => void` 修改动画的配置参数，只需要填入需要修改的配置项即可，不需要重复填入所有的动画参数

---

# AsyncStorage

[[AsyncStorage 范例]](//github.com/Tencent/Hippy/tree/master/framework/js/examples/hippy-react-demo/src/modules/AsyncStorage/index.jsx)

AsyncStorage 是一个简单的、异步的、持久化的 Key-Value 存储系统，它对于 App 来说是全局性的。

> 也可以直接使用 localStorage 对象使用，方法跟 Web 版 localStorage 接口一致，不同的是：因为都是异步方法，需要在方法前面前面加上 `await`。

## 方法

### AsyncStorage.getAllKeys

`() => Promise<string[]>` 获取 AsyncStorage 所有的 key。

### AsyncStorage.getItem

`(key: string) => Promise<string>` 根据 key 值获取对应数据。

> - key: string - 需要获取值的目标 key

### AsyncStorage.multiGet

`(key: string[]) => Promise<[key: string, value: value][]>` 一次性用多个 key 值的数组去批量请求缓存数据，返回值将在回调函数以键值对的二维数组形式返回。

> - key: string[] - 需要获取值的目标 key 数组

### AsyncStorage.multiRemove

`(key: string[]) => void` 调用此函数批量删除 AsyncStorage 里面在传入的 keys 数组存在的 key 值。

> - key: string[] - 需要删除的目标 key 数组

### AsyncStorage.multiSet

`(keyValuePairs: [key: string, value: value][]) => void` 调用这个函数可以批量存储键值对对象。

> - keyValuePairs: [key: string, value: value][] - 需要设置的储键值二维数组

### AsyncStorage.removeItem

`(key: string) => void` 根据 key 值删除对应数据。

> - key: string - 需要删除的目标 key

### AsyncStorage.setItem

`(key: string, value: string) => void` 根据 key 和 value 设置保存键值对。

> - key: string - 需要获取值的目标 key
> - value: string - 需要获取值的目标值

---

# BackAndroid

[[BackAndroid 范例]](//github.com/Tencent/Hippy/blob/master/framework/js/examples/hippy-react-demo/src/pages/gallery.jsx#L171)

可以监听 Android 实体键的回退，在退出前做操作或拦截实体键的回退。

> 注意：该方法需要终端拦截实体返回按钮的事件，可以参考 [android-demo 的 onBackPressed 方法](//github.com/Tencent/Hippy/blob/master/framework/js/examples/android-demo/example/src/main/java/com/tencent/mtt/hippy/example/MyActivity.java)

## 方法

### BackAndroid.addListener

`(handler: () => boolean) => { remove: Function }` 监听 Android 实体健回退，触发时执行 handler 回调函数。回调函数返回 true 时，拦截终端的回退操作。回调函数返回 false 时, 就不会拦截回退。该函数返回包含 `remove()` 方法的对象，可通过调用 `remove()` 方法移除监听，同 `BackAndroid.removeListener`。

> - handler: Function - 实体键回退时触发的回调函数

### BackAndroid.exitApp

`() => void`直接执行终端的退出 App 逻辑。

### BackAndroid.removeListener

`(handler: () => boolean) => void` 移除 BackAndroid 关于 Android 实体健回退事件的监听器。

- handler: Function - 建议使用 `addListener` 返回的包含 `remove()` 方法的对象，也可以是之前 BackAndroid 的回调函数。

---

# Clipboard

[[Clipboard 范例]](//github.com/Tencent/Hippy/tree/master/framework/js/examples/hippy-react-demo/src/modules/Clipboard)

模块提供了 iOS/Android 双端的剪贴板能力，开发者可使用其来读取或写入剪贴板，目前仅支持字符串作为存取类型。

## 方法

### Clipboard.getString

`() => string` 获取剪贴板的内容

### Clipboard.setString

`(value: string) => void` 设置剪贴板的内容

> - value: string - 需要设置到剪贴板中的内容。

---

# ConsoleModule

提供了将前端日志输出到 iOS 终端日志和 [Android logcat](//developer.android.com/studio/command-line/logcat) 的能力

## 方法

### ConsoleModule.log

`(...value: string) => void`

### ConsoleModule.info

`(...value: string) => void`

### ConsoleModule.warn

`(...value: string) => void`

### ConsoleModule.error

`(...value: string) => void`

> - `log` 和 `info` 默认都输出为终端 INFO 级别日志。
> - Hippy 2.10.0 版本之后将原始 js 的 `console` 方法与 `ConsoleModule` 方法进行分离，`console` 不再输出日志到终端。

---

# Dimensions

用于获取当前设备的宽高。

## 方法

### Dimensions.get

`(target: 'window' | 'screen') => { height: number, width: number, scale: number, statusBarHeight, navigatorBarHeight }` Hippy Root View 尺寸或者屏幕尺寸。

> - target: 'window' | 'screen' - 指定丈量 Hippy Root View 或者屏幕尺寸。
> - Android 特别说明：因为历史遗留问题，screen 下的 statusBarHeight 是按实际像素算的，window 下经过修正已经是 dp 单位。
> - navigatorBarHeight: Android 底部 navigatorBar 高度；最低支持版本 2.3.4

---

# ImageLoaderModule

通过该模块可以对远程图片进行相应操作

## 方法

### ImageLoaderModule.getSize

`(url: string) => Promise<{width, height}>` 获取图片大小（会同时预加载图片）。

> - url - 图片地址

### ImageLoaderModule.prefetch

`(url: string) => void` 用于预加载图片。

> - url - 图片地址

---

# NetInfo

[[NetInfo 范例]](//github.com/Tencent/Hippy/tree/master/framework/js/examples/hippy-react-demo/src/modules/NetInfo)

通过该接口可以获得当前设备的网络状态，也可以注册一个监听器，当系统网络切换的时候，得到一个通知。

安卓的开发者，在请求网络状态之前，你需要在 app 的 `AndroidManifest.xml` 加入以下配置 :

```xml
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

## 网络状态

以异步的方式判断设备是否联网，以及是否使用了移动数据网络。

- `NONE` - 设备处于离线状态。
- `WIFI` - 设备通过 wifi 联网
- `CELL` - 设备通过移动网络联网
- `UNKNOWN` - 出现异常或联网状态不可知

## 方法

### NetInfo.addEventListener

`(eventName: string, handler: Function) => NetInfoRevoker` 添加一个网络变化监听器。

> - eventName: 'change' - 事件名称
> - handler: ({ network_info:string }) => any - 网络发生变化时触发的回调函数

### NetInfo.fetch

`() => Promise<NetInfo>` 用于获取当前的网络状态。

### NetInfo.removeEventListener

`(eventName: string, handler: NetInfoRevoker | Function) => void` 移除事件监听器

> - eventName: 'change' - 事件名称
> - handler: Function - 需要删除的对应事件监听。

# NetworkModule

主要包含了网络相关的模块，目前主要是操作 Cookie。

普通的网络请求请参考: [起步 - 网络请求](guide/network-request.md)

## 方法

### NetworkModule.getCookies

`(url: string) => Promise<string>` 获取指定 url 的所有 cookie

> - url: string - 需要获取 cookie 的目标 url

### NetworkModule.setCookie

`(url: string, keyValue: string, expires?: string) => Promise<void>` 设置 Cookie

> - url: string - 需要获取 cookie 的目标 url
> - keyValue: string - 需要设置的键值对
> - expires?: string - 设置 Cookie 的超市时间

---

# PixelRatio

用于获取当前设备的像素密度(pixel density)。

## 方法

### PixelRatio.get

`() => number` 返回当前设备的像素密度。

## 范例

- PixelRatio.get() === 1
  - [mdpi Android 设备](//material.io/tools/devices/)
- PixelRatio.get() === 1.5
  - [hdpi Android 设备](//material.io/tools/devices/)
- PixelRatio.get() === 2
  - iPhone 4, iPhone 4S
  - iPhone 5, iPhone 5c, iPhone 5s
  - iPhone 6, iPhone 7, iPhone 8
  - [xhdpi Android 设备](//material.io/tools/devices/)
- PixelRatio.get() === 3
  - iPhone 6 Plus, iPhone 7 Plus, iPhone 8 Plus
  - iPhone X
  - Pixel, Pixel 2
  - [xxhdpi Android 设备](//material.io/tools/devices/)
- PixelRatio.get() === 3.5
  - Nexus 6
  - Pixel XL, Pixel 2 XL
  - [xxxhdpi Android 设备](//material.io/tools/devices/)

---

# Platform

用于书写平台区分代码的一个组件。开发者使用时，根据 `Platform.OS` 输出值开发分平台业务逻辑分支。

## 参数

| 参数         | 描述                                     | 类型                                                                                                                       | 支持平台 |
| ------------ | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------- |
| OS           | 用来判断是在 iOS 或者 Android 下         | `string`                                                                                                                   | `ALL`    |
| Localization | 输出国际化相关信息, `最低支持版本 2.8.0` | `object: { country: string , language: string, direction: number }`， 其中 `direction` 为 0 表示 LTR 方向，1 表示 RTL 方向 | `ALL`    |

---

# Stylesheet

提供了一种类似 CSS 样式表的抽象。

## 参数

| 参数          | 描述                                                                                                                                                                             | 类型     | 支持平台 |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------- |
| hairlineWidth | 这一常量定义了当前平台上的最细的宽度。可以用作边框或是两个元素间的分隔线。然而，你不应该信任它作为一个衡量长度的单位，因为在不同机器与不同分辨率，hairlineWidth 可能会表现不同。 | `number` | `ALL`    |

## 方法

### StyleSheet.create

`(styleObj: Object) => styleObj`

> - styleObj: Object - 样式对象

---

# UIManagerModule

提供了操作 UI 相关的能力。

## 方法

### UIManagerModule.callUIFunction

调用组件定义的终端方法

`callUIFunction(instance: ref, method: string, options: Array)`

> - instance: 组件的引用 Ref
> - method：方法名称，如 ListView 的 `scrollToIndex`
> - options: 需传递的数据，如 ListView 的 `[xIndex, yIndex, animated]`，空时显式写 `[]`

### UIManagerModule.getElementFromFiberRef

获取元素 Ref 对应的 Element(类似DOM)

`getElementFromFiberRef(instance: ref): ElementNode`

> - instance: 组件的引用 Ref
> - ElementNode：类似DOM，可以调用 setNativeProps 等方法

### UIManagerModule.measureInAppWindow

测量在 App 窗口范围内某个组件的尺寸和位置，如果出错 callback 参数可能为字符串或者 -1，注意需要保证节点实例真正上屏后（onLayout事件后）才能调用该方法。

`(ref, callback: Function) => Promise`

> - callback: ({ x, y, width, height } | string | -1) => void - 回调函数, 参数可以获取到引用组件在 App 窗口范围内的坐标值和宽高，如果出错或者 [节点被优化（仅在Android）](hippy-react/components?id=样式内特殊属性)可能返回 -1 或者 `this view is null` 字符串
