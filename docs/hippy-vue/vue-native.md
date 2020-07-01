<!-- markdownlint-disable no-duplicate-header -->

# 终端能力

hippy-vue 通过在 Vue 上绑定了一个 `Native` 属性，实现获取终端设备信息、以及调用终端能力。也可以用来监测是否在 Hippy 环境下运行。

> 对应 Demo: [demo-vue-native.vue](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/native-demos/demo-vue-native.vue)

# 获取设备信息

它无需任何方法，直接取值即可。

## version

获取 hippy-vue 的版本

## 示例

```javascript
console.log(Vue.Native.version); // 2.0.0
```

## Device

获取设备名称，iPhone 可以拿到具体的 iPhone 型号，Android 设备暂时只能拿到 `Android device`的文本。

## OSVersion

iOS 版本。

## APILevel

Android 操作系统版本。

## SDKVersion

Hippy 终端 SDK 版本。

## Platform

获取操作系统

## 示例

```javascript
console.log(Vue.Native.Platform); // android
```

## Dimensions

获取屏幕分辨率。

## 示例

```javascript
const { window, screen } = Vue.Native.Dimensions;
console.log(`屏幕尺寸：${screen.height}x${screen.width}`); // 640x480
console.log(`带状态栏的窗口尺寸：${window.height}x${window.width}`); // 640x460
```

## PixelRatio

获取设备像素比例。

## 示例

```javascript
console.log(Vue.Native.PixelRatio); // 3
```

## isIPhoneX

获取是否是异形屏幕的 iPhoneX

## screenIsVertical

屏幕是否横屏过来了

## OnePixel

一个像素的 dp/pt 值。

# 调用终端能力

## callNative/callNativeWithPromise

调用终端模块的方法，`callNative` 一般用于无返回的模块方法调用，callNativeWithPromise 一般用于有返回的模块方法调用，它会返回一个带着结果的 Promise。

## measureInWindow

测量窗口可视范围内某个组件的尺寸和位置，如果出错会都是 -1。

## Cookie

Hippy 中通过 fetch 服务返回的 `set-cookie` Header 会自动将 Cookie 保存起来，下次再发出请求的时候就会带上，然后终端提供了这个界面让 业务可以获取或者修改保存好的 Cookie。

### getAll(url)

| 参数 | 类型     | 必需 | 参数意义 |
| --------  | -------- | -------- |  -------- |
| url | string | 是       | 获取指定 URL 下设置的 cookie |

返回值：

* `Prmoise<string>`，类似 `name=someone;gender=female` 的字符串，需要业务自己手工解析一下。

### set(url, keyValue, expireDate)

参数：

| 参数 | 类型     | 必需 | 参数意义 |
| -------- | -------- | -------- |  -------- |
| url | string | 是       | 设置指定 URL 下设置的 cookie |
| keyValue | string | 是       | 需要设置成 Cookie 的完整字符串，例如`name=someone;gender=female` |
| expreDate | Date | 否 | Date 类型的过期时间，不填不过期 |

## Clipboard

剪贴板读写模块，但是目前只支持纯文本。

### getString()

返回值：

* string

### setString(content)

| 参数 | 类型     | 必需 | 参数意义 |
| --------  | -------- | -------- |  -------- |
| content | string | 是       | 保存进入剪贴板的内容 |

## parseColor(color)

色值类型转换，通过该 API 获取终端可识别的 `int32` 类型色值。可应用于与终端直接通讯（如 `callNative`) 时的接口传参。

| 参数 | 类型     | 必需 | 参数意义 |
| --------  | -------- | -------- |  -------- |
| color | `string` `number` | 是  | 转换的色值，支持类型：`rgb`,`rgba`, `hex ` |

返回值：

* `number`: 返回值为终端可识别的 `int32Color`

示例：

``` js
const int32Color = Vue.Native.parseColor('#40b883') // int32Color: 4282431619
```