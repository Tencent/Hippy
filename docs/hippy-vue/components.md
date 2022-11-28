<!-- markdownlint-disable no-duplicate-header -->

# 核心组件

核心组件的定义是跟浏览器、Vue 中保持一致，如果只使用这些组件的话，可以直接跨浏览器。

---

# a

该组件目前映射到终端 Text 组件，目前主要用于在 hippy-vue-router 中进行页面跳转。 一切同 [p](hippy-vue/components.md?id=p)。

## 事件

| 事件名称          | 描述                                                         | 类型                                      | 支持平台 |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| touchstart  | 触屏开始事件，最低支持版本 2.6.2，参数为 `evt: { touches: [{ clientX: number, clientY: number }] }`，`clientX` 和 `clientY` 分别表示点击在屏幕内的绝对位置 | `Function`                                | `Android、iOS、Web-Renderer`    |
| touchmove   | 触屏移动事件，最低支持版本 2.6.2，参数为 `evt: { touches: [{ clientX: number, clientY: number }] }`，`clientX` 和 `clientY` 分别表示点击在屏幕内的绝对位置 | `Function`                                | `Android、iOS、Web-Renderer`    |
| touchend    | 触屏结束事件，最低支持版本 2.6.2，参数为 `evt: { touches: [{ clientX: number, clientY: number }] }`，`clientX` 和 `clientY` 分别表示点击在屏幕内的绝对位置 | `Function`                                | `Android、iOS、Web-Renderer`    |
| touchcancel | 触屏取消事件，当用户触屏过程中，某个系统事件中断了触屏，例如电话呼入、组件变化（如设置为hidden）、其他组件的滑动手势，此函数会收到回调，最低支持版本 2.6.2，参数为 `evt: { touches: [{ clientX: number, clientY: number }] }`，`clientX` 和 `clientY` 分别表示点击在屏幕内的绝对位置 | `Function`                               | `Android、iOS、Web-Renderer`    |

---

# button

[[范例：demo-button.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-button.vue)

该组件映射到 View 组件，容器里面可以放图片、也可以放文本。但是因为 View 不能包裹文本，所以需要在 `<button>` 里包裹其它文本组件才能显示文字，这个跟浏览器不一样，浏览器的 `<button>` 也可以包裹 `<span>` 组件，开发时注意一下。一切同 [div](hippy-vue/components.md?id=div)。

## 事件

| 事件名称          | 描述                                                         | 类型                                      | 支持平台 |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| click       | 当按钮被点击以后调用此回调函数。  例如， `@click="clickHandler"` | `Function`                                | `Android、iOS、Web-Renderer`    |
| longClick   | 当按钮被长按以后调用此回调函数。  例如， `@longClick="longClickHandler"}` | `Function`                                | `Android、iOS、Web-Renderer`    |
| touchstart  | 触屏开始事件，最低支持版本 2.6.2，参数为 `evt: { touches: [{ clientX: number, clientY: number }] }`，`clientX` 和 `clientY` 分别表示点击在屏幕内的绝对位置 | `Function`                                | `Android、iOS、Web-Renderer`    |
| touchmove   | 触屏移动事件，最低支持版本 2.6.2，参数为 `evt: { touches: [{ clientX: number, clientY: number }] }`，`clientX` 和 `clientY` 分别表示点击在屏幕内的绝对位置 | `Function`                                | `Android、iOS、Web-Renderer`    |
| touchend    | 触屏结束事件，最低支持版本 2.6.2，参数为 `evt: { touches: [{ clientX: number, clientY: number }] }`，`clientX` 和 `clientY` 分别表示点击在屏幕内的绝对位置 | `Function`                                | `Android、iOS、Web-Renderer`    |
| touchcancel | 触屏取消事件，当用户触屏过程中，某个系统事件中断了触屏，例如电话呼入、组件变化（如设置为hidden）、其他组件的滑动手势，此函数会收到回调，最低支持版本 2.6.2，参数为 `evt: { touches: [{ clientX: number, clientY: number }] }`，`clientX` 和 `clientY` 分别表示点击在屏幕内的绝对位置 | `Function`                                | `Android、iOS、Web-Renderer`    |

---

# div

[[范例：demo-div.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-div.vue)

> div 组件容器，默认不可以滚动。可以通过增加样式参数 `overflow-y: scroll` 切换为可以纵向滚动容器，或者增加样式参数 `overflow-x: scroll` 切换为水平滚动容器。在终端侧会被映射成 [ScrollView](hippy-react/components.md?id=ScrollView)，因此具备 [ScrollView](hippy-react/components.md?id=ScrollView) 通用的能力。

!> Android 具有节点优化的特性，请注意 `collapsable` 属性的使用

## 参数

| 参数               | 描述                                                         | 类型                                 | 支持平台  |
| ------------------ | ------------------------------------------------------------ | ------------------------------------ | --------- |
| accessibilityLabel | 设置当用户与此元素交互时，“读屏器”（对视力障碍人士的辅助功能）阅读的文字。默认情况下，这个文字会通过遍历所有的子元素并累加所有的文本标签来构建。 | `string`                               | `Android、iOS`     |
| accessible         | 当此属性为 `true` 时，表示此视图时一个启用了无障碍功能的元素。默认情况下，所有可触摸操作的元素都是无障碍功能元素。 | `boolean`                            | `Android、iOS`     |
| collapsable        | 如果一个 `div` 只用于布局它的子组件，则它可能会为了优化而从原生布局树中移除，因此该节点 DOM 的引用会丢失`（比如调用 measureInAppWindow 无法获取到大小和位置信息）`。 把此属性设为 `false` 可以禁用这个优化，以确保对应视图在原生结构中存在。`（Android 2.14.1 版本后支持在 Attribute 设置，以前版本请在静态 Style 属性里设置)` | `boolean`                            | `Android` |
| style              | -                                                            | [`View Styles`](style/layout.md) | `Android、iOS、Web-Renderer`     |
| opacity            | 配置 `View` 的透明度，同时会影响子节点的透明度               | `number`                             | `Android、iOS、Web-Renderer`     |
| overflow           | 指定当子节点内容溢出其父级 `View` 容器时, 是否剪辑内容       | `enum(visible, hidden)`         | `Android、iOS、Web-Renderer`     |
| focusable          | 允许使用遥控器触发 View 的激活状态，改为 true 后使用遥控器将能触发 div 的 `@focus` 事件，需要通过 `nextFocusDownId`、`nextFocusUpId`、`nextFocusLeftId`、`nextFocusRightId` 参数指明四个方向键将移动到的的节点 ID       | `boolean`         | `Android`     |
| scrollEventThrottle            | 指定滑动事件的回调频率，传入数值指定了多少毫秒(ms)组件会调用一次 `onScroll` 回调事件。`（仅在 overflow-y/x: scroll 时适用）` | `number`                                                     | `Android、iOS、Web-Renderer`    |
| pagingEnabled                  | 当值为 `true` 时，滚动条会停在滚动视图的尺寸的整数倍位置。这个可以用在水平分页上。`default: false` `（仅在 overflow-y/x: scroll 时适用）` | `boolean`                                                    | `Android、iOS、Web-Renderer`    |
| bounces | 是否开启回弹效果，默认 `true` `（仅在 overflow-y/x: scroll 时适用）` | `boolean`                                                  | `iOS`    |
| scrollEnabled                  | 当值为 `false` 的时候，内容不能滚动。`default: true` `（仅在 overflow-y/x: scroll 时适用）` | `boolean`                                                    | `Android、iOS、Web-Renderer`    |
| showScrollIndicator            | 是否显示滚动条。 `default: false`（仅在 overflow-y/x: scroll 时适用） | `boolean`  | `Android`    |
| showsHorizontalScrollIndicator | 当此值设为 `false` 的时候，`ScrollView` 会隐藏水平的滚动条。`default: true` `（仅在 overflow-y/x: scroll 时适用）`| `boolean`                                                    | `iOS`    |
| showsVerticalScrollIndicator   | 当此值设为 `false` 的时候，`ScrollView` 会隐藏垂直的滚动条。 `default: true` `（仅在 overflow-y/x: scroll 时适用）`| `boolean`  | `iOS`   |
| nativeBackgroundAndroid        | 配置水波纹效果，`最低支持版本 2.13.1`；配置项为 `{ borderless: boolean, color: Color, rippleRadius: number }`； `borderless` 表示波纹是否有边界，默认false；`color` 波纹颜色；`rippleRadius` 波纹半径，若不设置，默认容器边框为边界； `注意：设置水波纹后默认不显示，需要在对应触摸事件中调用 setPressed 和 setHotspot 方法进行水波纹展示，详情参考相关`[demo](//github.com/Tencent/Hippy/tree/master/examples/hippy-vue-demo/src/components/demos/demo-div.vue) | `Object`| `Android`    |
| nestedScrollPriority*          | 嵌套滚动事件处理优先级，`default:self`。相当于同时设置 `nestedScrollLeftPriority`、 `nestedScrollTopPriority`、 `nestedScrollRightPriority`、 `nestedScrollBottomPriority`。 | `enum(self,parent,none)`         | `Android(版本 2.15.4以上)`   |
| nestedScrollLeftPriority       | **从右往左**的嵌套滚动事件的处理优先级，参数含义同`nestedScrollPriority`，此参数优先级更高。 | `enum(self,parent,none)`         | `Android(版本 2.15.4以上)`   |
| nestedScrollTopPriority        | **从下往上**的嵌套滚动事件的处理优先级，参数含义同`nestedScrollPriority`，此参数优先级更高。 | `enum(self,parent,none)` | `Android(版本 2.15.4以上)` |
| nestedScrollRightPriority | **从左往右**的嵌套滚动事件的处理优先级，参数含义同`nestedScrollPriority`，此参数优先级更高。 | `enum(self,parent,none)` | `Android(版本 2.15.4以上)` |
| nestedScrollBottomPriority | **从上往下**的嵌套滚动事件的处理优先级，参数含义同`nestedScrollPriority`，此参数优先级更高。 | `enum(self,parent,none)` | `Android(版本 2.15.4以上)` |

* nestedScrollPriority 的参数含义：

  * `self`（默认值）：当前组件优先，滚动事件将先由当前组件消费，剩余部分传递给父组件消费；

  * `parent`：父组件优先，滚动事件将先由父组件消费，剩余部分再由当前组件消费；

  * `none`：不允许嵌套滚动，滚动事件将不会传递给父组件。

---

## 事件

| 事件名称          | 描述                                                         | 类型                                      | 支持平台 |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| attachedToWindow   | 这个事件会在节点已经渲染并且添加到容器组件中触发，因为 Hippy 的渲染是异步的，这是很稳妥的执行后续操作的事件。 | `Function`                           | `Android、iOS、Web-Renderer`     |
| click       | 当按钮被点击以后调用此回调函数。  例如， `@click="clickHandler"` | `Function`                                | `Android、iOS、Web-Renderer`    |
| focus            | 该事件在 `focusable` 置为 true 时触发，通过遥控方向键可以移动活动组件位置，事件回调带有 `isFocused` 参数用于标记激活和非激活状态 | `Function`  | `Android` |
| longClick   | 当按钮被长按以后调用此回调函数。  例如， `@longClick="longClickHandler"}` | `Function`                                | `Android、iOS、Web-Renderer`    |
| layout           | 当元素挂载或者布局改变的时候调用，参数为： `nativeEvent: { layout: { x, y, width, height } }`，其中 `x` 和 `y` 为相对父元素的坐标位置 | `Function`                           | `Android、iOS、Web-Renderer`     |
| momentumScrollBegin  | 在 ScrollView 滑动开始的时候调起。`（仅在 overflow-y/x: scroll 时适用）`, `2.14.6` 版本后支持 `offset` 相关参数 | `(event: { offsetX: number, offsetY: number }) => any`                                | `Android、iOS、Web-Renderer`    |
| momentumScrollEnd  | 在 ScrollView 滑动结束的时候调起。`（仅在 overflow-y/x: scroll 时适用）`，`2.14.6` 版本后支持 `offset` 相关参数 | `(event: { offsetX: number, offsetY: number }) => any`                                | `Android、iOS、Web-Renderer`    |
| scroll  | 在滚动的过程中，每帧最多调用一次此回调函数。`（仅在 overflow-y/x: scroll 时适用）` | `(event: { offsetX: number, offsetY: number }) => any`                                | `Android、iOS、Web-Renderer`    |
| scrollBeginDrag  | 当用户开始拖拽 ScrollView 时调用。`（仅在 overflow-y/x: scroll 时适用）` | `(event: { offsetX: number, offsetY: number }) => any`                                | `Android、iOS、Web-Renderer`    |
| scrollEndDrag  | 当用户停止拖拽 ScrollView 时调用。`（仅在 overflow-y/x: scroll 时适用）` | `(event: { offsetX: number, offsetY: number }) => any`                                | `Android、iOS、Web-Renderer`    |
| touchstart  | 触屏开始事件，参数为 `evt: { touches: [{ clientX: number, clientY: number }] }`，`clientX` 和 `clientY` 分别表示点击在屏幕内的绝对位置 | `Function`                                | `Android、iOS、Web-Renderer`    |
| touchmove   | 触屏移动事件，参数为 `evt: { touches: [{ clientX: number, clientY: number }] }`，`clientX` 和 `clientY` 分别表示点击在屏幕内的绝对位置 | `Function`                                | `Android、iOS、Web-Renderer`    |
| touchend    | 触屏结束事件，参数为 `evt: { touches: [{ clientX: number, clientY: number }] }`，`clientX` 和 `clientY` 分别表示点击在屏幕内的绝对位置 | `Function`                                | `Android、iOS、Web-Renderer`    |
| touchcancel | 触屏取消事件，当用户触屏过程中，某个系统事件中断了触屏，例如电话呼入、组件变化（如设置为hidden）、其他组件的滑动手势，此函数会收到回调，参数为 `evt: { touches: [{ clientX: number, clientY: number }] }`，`clientX` 和 `clientY` 分别表示点击在屏幕内的绝对位置 | `Function`                                | `Android、iOS、Web-Renderer`    |

## 方法

### scrollTo

> 仅在 overflow-y/x: scroll 时适用

`(x: number, y: number, duration: boolean) => void` 滚动到指定的 X，Y 偏移值，第三个参数为是否启用平滑滚动动画。

> * x: number - X 偏移值
> * y: number - Y 偏移值
> * duration: number | boolean - 毫秒为单位的滚动时间, 默认 1000ms，false 等同 0ms


### setPressed

[[setPressed 范例]](//github.com/Tencent/Hippy/tree/master/examples/hippy-vue-demo/src/components/demos/demo-ripple-div.vue)

`最低支持版本 2.13.1`

`(pressed: boolean) => void` 通过传入一个布尔值，通知终端当前是否需要显示水波纹效果

> * pressed: boolean - true 显示水波纹，false 收起水波纹

### setHotspot

[[setHotspot 范例]](//github.com/Tencent/Hippy/tree/master/examples/hippy-vue-demo/src/components/demos/demo-ripple-div.vue)

`最低支持版本 2.13.1`

`(x: number, y: number) => void` 通过传入一个 `x, y` 坐标值，通知终端设置当前波纹中心位置

---

# form

[[范例：demo-div.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-div.vue)

容器组件。 一切同 [div](hippy-vue/components.md?id=div)。

---

# iframe

[[范例：demo-iframe.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-iframe.vue)

内嵌网页容器。

## 参数

| 参数               | 描述                                                         | 类型                                 | 支持平台  |
| ------------------ | ------------------------------------------------------------ | ------------------------------------ | --------- |
| src | 内嵌用的网址 | `string`                               | `Android、iOS、Web-Renderer`     |
| method | 请求方式，`get`、`post` | `string`   | `Android、iOS`    |
| userAgent | Webview userAgent | `string` | `Android、iOS`|

## 事件

| 事件名称          | 描述                                                         | 类型                                      | 支持平台 |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| load           | 网页加载成功后会触发 | `(object: { url: string }) => void`    | `Android、iOS、Web-Renderer`     |
| loadStart           | 网页开始加载时触发 | `(object: { url: string }) => void`    | `Android、iOS、Web-Renderer`     |
| loadEnd           | 网页加载结束时触发 (`success`与`error`参数仅`Android`、`iOS`上可用，最低支持版本`2.15.3`)  | `(object: { url: string, success: boolean, error: string }) => void` | `Android、iOS、Web-Renderer`     |

---

# img

[[范例：demo-img.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-img.vue)

图片组件，和浏览器的一样。

> * 注意: 必须指定样式中的宽度和高度，否则无法工作。
> * 注意: Android 端默认会带上灰底色用于图片占位，可以加上 `background-color: transparent` 样式改为透明背景。

## 参数

| 参数          | 描述                                                         | 类型                                      | 支持平台 |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| src        | 图片地址。现在支持的图片格式有 png , jpg , jpeg , bmp , gif 。 | string                                | `Android、iOS、Web-Renderer`    |
| capInsets | 当调整 img 大小的时候，由 capInsets 指定的边角尺寸会被固定而不进行缩放，而中间和边上其他的部分则会被拉伸。这在制作一些可变大小的圆角按钮、阴影、以及其它资源的时候非常有用。 |  `{ top: number, left: number, bottom: number, right: number }` | `Android、iOS` | 
| placeholder | 指定当 `img` 组件还没加载出 `src` 属性指定的图片或者图片加载出错时的占位符图片 | `string`: 图片 base64 字符串                                     | `Android、iOS、Web-Renderer`    |

> `2.8.1` 版本后支持终端本地图片能力，可通过 webpack `file-loader` 加载。

## 样式内特殊属性

| 参数               | 描述                                                         | 类型                                 | 支持平台  |
| ------------------ | ------------------------------------------------------------ | ------------------------------------ | --------- |
| resize-mode        |  决定当组件尺寸和图片尺寸不成比例的时候如何调整图片的大小。(`Web-Renderer 不支持 repeat`)   |  `enum (cover, contain, stretch, repeat, center)` | `Android、iOS、Web-Renderer`    |

## 事件

| 事件名称          | 描述                                                         | 类型                                      | 支持平台 |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| layout      | 当元素挂载或者布局改变的时候调用，参数为： `nativeEvent: { layout: { x, y, width, height } }`，其中 `x` 和 `y` 为相对父元素的坐标位置 | `Function`                                                   | `Android、iOS、Web-Renderer`    |
| load        | 加载成功完成时调用此回调函数。                               | `Function`                                                   | `Android、iOS、Web-Renderer`    |
| loadStart   | 加载开始时调用。 | `Function`                                                   | `Android、iOS、Web-Renderer`    |
| loadEnd     | 加载结束后，不论成功还是失败，调用此回调函数。               | `Function`                                                   | `Android、iOS、Web-Renderer`    |
| error       | 当加载错误的时候调用此回调函数。| `Function`                                                   | `Android、iOS、Web-Renderer`    |
| progress    | 在加载过程中不断调用，参数为 `nativeEvent: { loaded: number, total: number }`, `loaded` 表示加载中的图片大小， `total` 表示图片总大小 | `Function`                                                   | `iOS`    |
| touchstart  | 触屏开始事件，最低支持版本 2.6.2，参数为 `evt: { touches: [{ clientX: number, clientY: number }] }`，`clientX` 和 `clientY` 分别表示点击在屏幕内的绝对位置 | `Function`                                | `Android、iOS、Web-Renderer`    |
| touchmove   | 触屏移动事件，最低支持版本 2.6.2，参数为 `evt: { touches: [{ clientX: number, clientY: number }] }`，`clientX` 和 `clientY` 分别表示点击在屏幕内的绝对位置 | `Function`                                | `Android、iOS、Web-Renderer`    |
| touchend    | 触屏结束事件，最低支持版本 2.6.2，参数为 `evt: { touches: [{ clientX: number, clientY: number }] }`，`clientX` 和 `clientY` 分别表示点击在屏幕内的绝对位置 | `Function`                                | `Android、iOS、Web-Renderer`    |
| touchcancel | 触屏取消事件，当用户触屏过程中，某个系统事件中断了触屏，例如电话呼入、组件变化（如设置为hidden）、其他组件的滑动手势，此函数会收到回调，最低支持版本 2.6.2，参数为 `evt: { touches: [{ clientX: number, clientY: number }] }`，`clientX` 和 `clientY` 分别表示点击在屏幕内的绝对位置 | `Function`                                | `Android、iOS、Web-Renderer`    |

---

# input

[[范例：demo-input.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-input.vue)

单行文本组件。

> 不建议手工双向绑定数据，建议通过 `v-model` 来绑定视图和数据。

## 差异性

由于系统组件层的差异，如果 input 处于会被键盘遮住的位置，在呼出键盘后：

* iOS 则是正常的遮住
* Android 的表现为页面会被键盘顶起，顶起的幅度取决于 input 的 Y 轴位置决定

关于解决此间的平台差异性，我们仍在讨论。

若有 iOS 对齐 Android 的键盘顶起的需求，建议参考 [StackOverflow](//stackoverflow.com/questions/32382892/ios-xcode-how-to-move-view-up-when-keyboard-appears)，在业务层解决。

### Android 弹出后盖住界面的解决办法

在部分 Android 机型上，键盘弹出后也可能会产生盖住界面的情况，一般情况下可以通过修改 `AndroidMainfest.xml` 文件，在 activity 上增加 android:windowSoftInputMode="adjustPan" 解决。

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.tencent.mtt.hippy.example"
>
    <application
        android:allowBackup="true"
        android:label="@string/app_name"
    >
        <!-- 注意 android:windowSoftInputMode="adjustPan" 写在 activity 的参数里-->
        <activity android:name=".MyActivity"
            android:windowSoftInputMode="adjustPan"
            android:label="@string/activity_name"
            android:configChanges="orientation|screenSize"
        >
        </activity>
    </application>
</manifest>
```

该参数的意义是：

* adjustResize: resize the page content
* adjustPan: move page content without resizing page content

详情请参考 Android 开发文档。

## 参数

| 参数                  | 描述                                                         | 类型                                                         | 支持平台  |
| --------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | --------- |
| caret-color           | 输入光标颜色。(也可设置为 Style 属性) `最低支持版本2.11.5` | [`color`](style/color.md)        | `Android`     |
| defaultValue          | 提供一个文本框中的初始值。当用户开始输入的时候，值就可以改变。  在一些简单的使用情形下，如果你不想用监听消息然后更新 value 属性的方法来保持属性和状态同步的时候，就可以用 defaultValue 来代替。 | `string`                                                     | `Android、iOS`     |
| editable              | 如果为 false，文本框是不可编辑的。`default: true`                        | `boolean`                                                    | `Android、iOS、Web-Renderer`     |
| type          | 决定弹出的何种软键盘的。 注意，`password`仅在属性 `multiline=false` 单行文本框时生效。 | `enum(default, numeric, password, email, phone-pad)` | `Android、iOS、Web-Renderer`     |
| maxlength             | 限制文本框中最多的字符数。使用这个属性而不用JS 逻辑去实现，可以避免闪烁的现象。 | `numbers`                                                    | `Android、iOS、Web-Renderer`     |
| numberOfLines         | 设置 `input` 最大显示行数，如果 `input` 没有显式设置高度，会根据 `numberOfLines` 来计算高度撑开。在使用的时候必需同时设置 `multiline` 参数为 `true`。 | `number`                                                     | `Android、Web-Renderer`     |
| placeholder           | 如果没有任何文字输入，会显示此字符串。                       | `string`                                                     | `Android、iOS、Web-Renderer`     |
| placeholder-text-color  | 占位字符串显示的文字颜色。（也可设置为 Style 属性）  `最低支持版本2.13.4`                                   | [`color`](style/color.md)                                | `Android、iOS、Web-Renderer`     |
| underline-color-android  | `input` 下底线的颜色。 可以设置为 'transparent' 来去掉下底线。（也可设置为 Style 属性）  `最低支持版本2.13.4`      | [`color`](style/color.md)                                                      | `Android` |
| returnKeyType         | 指定软键盘的回车键显示的样式。                               | `enum(done, go, next, search, send)`              | `Android、iOS、Web-Renderer`     |
| value                 | 指定 `input` 组件的值。                                  | `string`                                                     | `Android、iOS、Web-Renderer`     |
| break-strategy* | 设置Android API 23及以上系统的文本换行策略。`default: simple` | `enum(simple, high_quality, balanced)` | `Android(版本 2.14.2以上)` |

* break-strategy 的参数含义：
  * `simple`（默认值）：简单折行，每一行显示尽可能多的字符，直到这一行不能显示更多字符时才进行换行，这种策略下不会自动折断单词（当一行只有一个单词并且宽度显示不下的情况下才会折断）；
  * `high_quality`：高质量折行，针对整段文本的折行进行布局优化，必要时会自动折断单词，比其他两种策略略微影响性能，通常比较适合只读文本；
  * `balanced`：平衡折行，尽可能保证一个段落的每一行的宽度相同，必要时会折断单词。

## 事件

| 事件名称          | 描述                                                         | 类型                                      | 支持平台 |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| blur                | 当文本框失去焦点的时候调用此回调函数。                       | `Function`                                                   | `Android、iOS、Web-Renderer`     |
| focus | 当文本框获得焦点的时候调用此回调函数。 | `Function` | `Android、iOS` |
| change          | 当文本框内容变化时调用此回调函数。改变后的文字内容会作为参数传递。 | `Function`                                                   | `Android、iOS`     |
| keyboardWillShow    | 在弹出输入法键盘时候会触发此回调函数，返回值包含键盘高度 `keyboardHeight`，样式如 `{ keyboardHeight: 260 }`。                                     | `Function`                                                   | `Android、iOS`     |
| keyboardWillHide     | 在隐藏输入法键盘时候会触发此回调函数 | `Function`                                                   | `Android`     |
| keyboardHeightChanged | 在输入法键盘高度改变时触发此回调函数，返回值包含键盘高度 `keyboardHeight`，样式如 `{ keyboardHeight: 260 }`, `最低支持版本2.14.0`。 | `Function` | `iOS` |                                 
| endEditing          | 当文本输入结束后调用此回调函数。                             | `Function`                                                   | `Android、iOS、Web-Renderer`     |
| layout              | 当元素挂载或者布局改变的时候调用，参数为： `nativeEvent: { layout: { x, y, width, height } }`，其中 `x` 和 `y` 为相对父元素的坐标位置。 | `Function`                                                   | `Android、iOS、Web-Renderer`     |
| selectionChange     | 当输入框选择文字的范围被改变时调用。返回参数的样式如 `{ nativeEvent: { selection: { start, end } } }`。 | `Function`                                                   | `Android、iOS、Web-Renderer`     |

## 方法

### blur

`() => void` 让指定的 input 组件失去光标焦点，与 focus() 的作用相反。

### clear

`() => void` 清空输入框的内容。

### focus

`() => void` 指派 input 获得焦点。

### getValue

`() => Promise<string>` 获得文本框中的内容。注意，由于是异步回调，收到回调时值可能已经改变。

### setValue

`(value: string) => void` 设置文本框内容。

> * value: string - 文本框内容

### isFocused

`最低支持版本 2.14.1。hippy-react-web 不支持。`

`() => Promise<boolean>` 获得文本框的焦点状态。注意，由于是异步回调，收到回调时值可能已经改变。

---

# label

[[范例：demo-p.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-p.vue)

显示文本。 一切同 [p](hippy-vue/components.md?id=p)。

## 事件

| 事件名称          | 描述                                                         | 类型                                      | 支持平台 |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| touchstart  | 触屏开始事件，最低支持版本 2.6.2，参数为 `evt: { touches: [{ clientX: number, clientY: number }] }`，`clientX` 和 `clientY` 分别表示点击在屏幕内的绝对位置 | `Function`                                | `Android、iOS、Web-Renderer`    |
| touchmove   | 触屏移动事件，最低支持版本 2.6.2，参数为 `evt: { touches: [{ clientX: number, clientY: number }] }`，`clientX` 和 `clientY` 分别表示点击在屏幕内的绝对位置 | `Function`                                | `Android、iOS、Web-Renderer`    |
| touchend    | 触屏结束事件，最低支持版本 2.6.2，参数为 `evt: { touches: [{ clientX: number, clientY: number }] }`，`clientX` 和 `clientY` 分别表示点击在屏幕内的绝对位置 | `Function`                                | `Android、iOS、Web-Renderer`    |
| touchcancel | 触屏取消事件，当用户触屏过程中，某个系统事件中断了触屏，例如电话呼入、组件变化（如设置为hidden）、其他组件的滑动手势，此函数会收到回调，最低支持版本 2.6.2，参数为 `evt: { touches: [{ clientX: number, clientY: number }] }`，`clientX` 和 `clientY` 分别表示点击在屏幕内的绝对位置 | `Function`                                | `Android、iOS、Web-Renderer`    |

---

# ul

[[范例：demo-list.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-list.vue)

Hippy 的重点功能，高性能的可复用列表组件，在终端侧会被映射成 `ListView`，包含 `ListView` 所有能力。里面第一层只能包含 `<li>`。

!> Android `2.14.0` 版本后会采用 `RecyclerView` 替换原有 `ListView`

## 参数

| 参数                  | 描述                                                         | 类型                                                        | 支持平台 |
| --------------------- | ------------------------------------------------------------ | ----------------------------------------------------------- | -------- |
| horizontal       | 指定 `ul` 是否采用横向布局。`default: undefined` 纵向布局，Android `2.14.1` 版本后可设置 `false` 显式固定纵向布局；iOS 暂不支持横向 `ul` | `boolean \| undefined`   | `Android`    |
| initialContentOffset  | 初始位移值。在列表初始化时即可指定滚动距离，避免初始化后再通过 scrollTo 系列方法产生的闪动。Android 在 `2.8.0` 版本后支持    | `number`  | `Android、iOS、Web-Renderer` |
| bounces | 是否开启回弹效果，默认 `true` | `boolean`                                                  | `iOS`    |
| overScrollEnabled | 是否开启回弹效果，默认 `true` | `boolean`                                                  | `Android`    |
| rowShouldSticky  | 设置 `ul` 是否需要开启悬停效果能力，与 `li` 的 `sticky` 配合使用。 `default: false` | `boolean`  | `Android、iOS、Web-Renderer`|
| scrollEnabled    | 滑动是否开启。`default: true` | `boolean` | `Android、iOS、Web-Renderer` |
| scrollEventThrottle   | 指定滑动事件的回调频率，传入数值指定了多少毫秒(ms)组件会调用一次 `onScroll` 回调事件，默认 200ms | `number`                                                    | `Android、iOS、Web-Renderer`    |
| showScrollIndicator   | 是否显示滚动条。`default: true` | `boolean`                                                   | `iOS`    |
| preloadItemNumber     | 指定当列表滚动至倒数第几行时触发 `endReached` 回调。 | `number` | `Android、iOS、Web-Renderer` |
| exposureEventEnabled | Android 曝光能力启用开关，如果要使用 `appear`、`disappear` 相关事件，Android 需要设置该开关（iOS无需设置）, `default: true` | `boolean` | `Android`|
| endReached | 当所有的数据都已经渲染过，并且列表被滚动到最后一条时，将触发 `endReached` 回调。 | `Function`                                                  | `Android、iOS、Web-Renderer`    |
| editable | 是否可编辑，开启侧滑删除时需要设置为 `true`。`最低支持版本2.9.0` | `boolean`                                                  | `iOS`    |
| delText | 侧滑删除文本。`最低支持版本2.9.0` | `string`                                                  | `iOS`    |
| nestedScrollPriority*      | 嵌套滚动事件处理优先级，`default:self`。相当于同时设置 `nestedScrollLeftPriority`、 `nestedScrollTopPriority`、 `nestedScrollRightPriority`、 `nestedScrollBottomPriority`。 | `enum(self,parent,none)` | `Android(版本 2.15.4以上)`   |
| nestedScrollLeftPriority   | **从右往左**的嵌套滚动事件的处理优先级，参数含义同`nestedScrollPriority`，此参数优先级更高。 | `enum(self,parent,none)` | `Android(版本 2.15.4以上)` |
| nestedScrollTopPriority | **从下往上**的嵌套滚动事件的处理优先级，参数含义同`nestedScrollPriority`，此参数优先级更高。 | `enum(self,parent,none)` | `Android(版本 2.15.4以上)` |
| nestedScrollRightPriority | **从左往右**的嵌套滚动事件的处理优先级，参数含义同`nestedScrollPriority`，此参数优先级更高。 | `enum(self,parent,none)` | `Android(版本 2.15.4以上)` |
| nestedScrollBottomPriority | **从上往下**的嵌套滚动事件的处理优先级，参数含义同`nestedScrollPriority`，此参数优先级更高。 | `enum(self,parent,none)` | `Android(版本 2.15.4以上)` |

* nestedScrollPriority 的参数含义：

  * `self`（默认值）：当前组件优先，滚动事件将先由当前组件消费，剩余部分传递给父组件消费；

  * `parent`：父组件优先，滚动事件将先由父组件消费，剩余部分再由当前组件消费；

  * `none`：不允许嵌套滚动，滚动事件将不会传递给父组件。

## 事件

| 事件名称          | 描述                                                         | 类型                                      | 支持平台 |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| endReached          | 当所有的数据都已经渲染过，并且列表被滚动到最后一条时，将触发 `onEndReached` 回调。 | `Function`                                                  | `Android、iOS、Web-Renderer`    |
| momentumScrollBegin | 在 `ListView` 开始滑动的时候调起，`2.14.6` 版本后支持 `offset` 相关参数      | `(event: { offsetX: number, offsetY: number }) => any`                                                  | `Android、iOS、Web-Renderer`    |
| momentumScrollEnd   | 在 `ListView` 结束滑动的时候调起，`2.14.6` 版本后支持 `offset` 相关参数   | `(event: { offsetX: number, offsetY: number }) => any`                                                  | `Android、iOS、Web-Renderer`    |
| scroll              | 当触发 `ListView` 的滑动事件时回调。由于在 `ListView` 滑动时回调，调用会非常频繁，请使用 `scrollEventThrottle` 进行频率控制。 注意：ListView 在滚动时会进行组件回收，不要在滚动时对 renderRow() 生成的 ListItemView 做任何 ref 节点级的操作（例如：所有 callUIFunction 和 measureInAppWindow 方法），回收后的节点将无法再进行操作而报错。横向ListView时，Android在 `2.8.0` 版本后支持 | `(event: { offsetX: number, offsetY: number }) => any` | `Android、iOS、Web-Renderer`    |
| scrollBeginDrag     | 当用户开始拖拽 `ListView` 时调用，`2.14.6` 版本后支持 `offset` 相关参数   | `(event: { offsetX: number, offsetY: number }) => any`                                                  | `Android、iOS、Web-Renderer`    |
| scrollEndDrag       | 当用户停止拖拽 `ListView` 或者放手让 `ListView` 开始滑动的时候调用，`2.14.6` 版本后支持 `offset` 相关参数 | `(event: { offsetX: number, offsetY: number }) => any`                                                  | `Android、iOS、Web-Renderer`    |
| layout      | 当元素挂载或者布局改变的时候调用，参数为： `nativeEvent: { layout: { x, y, width, height } }`，其中 `x` 和 `y` 为相对父元素的坐标位置。 | `Function`                                | `Android、iOS、Web-Renderer`    |
| delete      | 在列表项侧滑删除时调起。`最低支持版本2.9.0` | `(nativeEvent: { index: number}) => void`                                | `iOS`    |

## 方法

### scrollTo

`(xOffset: number, yOffset: number, animated: boolean) => void` 通知 ListView 滑动到某个具体坐标偏移值(offset)的位置。

> * `xOffset`: number - 滑动到 X 方向的 offset
> * `yOffset`: number - 滑动到 Y 方向的 offset
> * `animated`: boolean - 滑动过程是否使用动画

### scrollToIndex

`(xIndex: number, yIndex: number, animated: boolean) => void` 通知 ListView 滑动到第几个 item。

> * `xIndex`: number - 滑动到 X 方向的第 xIndex 个 item
> * `yIndex`: number - 滑动到 Y 方向的 yIndex 个 item
> * `animated`: boolean - 滑动过程是否使用动画

---

# li

ul 的子节点，终端层节点回收和复用的最小颗粒度。

[[范例：demo-list.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-list.vue)

## 参数

> 当设置`ul` 的 `:horizontal=true` 启用横向无限列表时，需显式设置 `li` 样式宽度

| 参数                  | 描述                                                         | 类型                                                        | 支持平台 |
| --------------------- | ------------------------------------------------------------ | ----------------------------------------------------------- | -------- |
| type            | 指定一个函数，在其中返回对应条目的类型（返回Number类型的自然数，默认是0），List 将对同类型条目进行复用，所以合理的类型拆分，可以很好地提升 List 性能。`注意：同一 type 的 item 组件由于复用可能不会走完整组件创建生命周期` | `number`              | `Android、iOS、Web-Renderer`    |
| key             | 指定一个函数，在其中返回对应条目的 Key 值，详见 [Vue 官文](//cn.vuejs.org/v2/guide/list.html) | `string`                                    | `Android、iOS、Web-Renderer`    |
| sticky       | 对应的 item 是否需要使用悬停效果（滚动到顶部时，会悬停在 ListView 顶部，不会滚出屏幕），需跟 `ul` 的 `rowShouldSticky` 配合使用 | `boolean`                                | `Android、iOS、Web-Renderer`
| appear       | 当有`li`节点滑动进入屏幕时（曝光）触发，入参返回曝光的`li`节点对应索引值。 | `(index) => any` | `Android、iOS、Web-Renderer` |
| disappear       | 当有`li`节点滑动离开屏幕时触发，入参返回离开的`li`节点对应索引值。 | `(index) => any` | `Android、iOS、Web-Renderer` |
| willAppear       | 当有`li`节点至少一个像素滑动进入屏幕时（曝光）触发，入参返回曝光的`li`节点对应索引值。`最低支持版本2.3.0` | `(index) => any` | `Android、iOS` |
| willDisappear       | 当有`li`节点至少一个像素滑动离开屏幕时触发，入参返回离开的`li`节点对应索引值。`最低支持版本2.3.0` | `(index) => any` | `Android、iOS` |

---

# p

[[范例：demo-p.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-p.vue)

显示文本，不过因为 Hippy 下没有 `display: inline` 的显示模式，默认全部都是 flex 的。

## 事件

| 事件名称          | 描述                                                         | 类型                                      | 支持平台 |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| touchstart  | 触屏开始事件，最低支持版本 2.6.2，参数为 `evt: { touches: [{ clientX: number, clientY: number }] }`，`clientX` 和 `clientY` 分别表示点击在屏幕内的绝对位置 | `Function`                                | `Android、iOS、Web-Renderer`    |
| touchmove   | 触屏移动事件，最低支持版本 2.6.2，参数为 `evt: { touches: [{ clientX: number, clientY: number }] }`，`clientX` 和 `clientY` 分别表示点击在屏幕内的绝对位置 | `Function`                                | `Android、iOS、Web-Renderer`    |
| touchend    | 触屏结束事件，最低支持版本 2.6.2，参数为 `evt: { touches: [{ clientX: number, clientY: number }] }`，`clientX` 和 `clientY` 分别表示点击在屏幕内的绝对位置 | `Function`                                | `Android、iOS、Web-Renderer`    |
| touchcancel | 触屏取消事件，当用户触屏过程中，某个系统事件中断了触屏，例如电话呼入、组件变化（如设置为hidden）、其他组件的滑动手势，此函数会收到回调，最低支持版本 2.6.2，参数为 `evt: { touches: [{ clientX: number, clientY: number }] }`，`clientX` 和 `clientY` 分别表示点击在屏幕内的绝对位置 | `Function`                                | `Android、iOS、Web-Renderer`    |

## 参数

| 参数          | 描述                                                         | 类型                                      | 支持平台 |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| numberOfLines | 用来当文本过长的时候裁剪文本。包括折叠产生的换行在内，总的行数不会超过这个属性的限制。 | `number`                                  | `Android、iOS、Web-Renderer`    |
| opacity       | 配置 `View` 的透明度，同时会影响子节点的透明度。             | `number`                                  | `Android、iOS、Web-Renderer`    |
| ellipsizeMode* | 当设定了 `numberOfLines` 值后，这个参数指定了字符串如何被截断。所以在使用 `ellipsizeMode` 时，必须得同时指定 `numberOfLines` 数值。`default: tail` | `enum(head, middle, tail, clip)` | `Android(版本2.14.1以上全支持，低版本仅支持tail)、iOS(全支持)` |
| break-strategy* | 设置Android API 23及以上系统的文本换行策略。`default: simple` | `enum(simple, high_quality, balanced)` | `Android(版本 2.14.2以上)` |

* ellipsizeMode 的参数含义：
  * `clip` - 超过指定行数的文字会被直接截断，不显示“...”；（Android 2.14.1以上、iOS全支持）
  * `head` - 文字将会从头开始截断，保证字符串的最后的文字可以正常显示在 `Text` 组件的最后，而从开头给截断的文字，将以 “...” 代替，例如 “...wxyz”；（Android 2.14.1以上、iOS全支持）
  * `middle` - "文字将会从中间开始截断，保证字符串的最后与最前的文字可以正常显示在Text组件的响应位置，而中间给截断的文字，将以 “...” 代替，例如 “ab...yz”；（Android 2.14.1以上、iOS全支持）
  * `tail`(默认值) - 文字将会从最后开始截断，保证字符串的最前的文字可以正常显示在 Text 组件的最前，而从最后给截断的文字，将以 “...” 代替，例如 “abcd...”；
* break-strategy 的参数含义：
  * `simple`（默认值）：简单折行，每一行显示尽可能多的字符，直到这一行不能显示更多字符时才进行换行，这种策略下不会自动折断单词（当一行只有一个单词并且宽度显示不下的情况下才会折断）；
  * `high_quality`：高质量折行，针对整段文本的折行进行布局优化，必要时会自动折断单词，比其他两种策略略微影响性能，通常比较适合只读文本；
  * `balanced`：平衡折行，尽可能保证一个段落的每一行的宽度相同，必要时会折断单词。

## whitespace 处理

`2.15.3` 版本前，Hippy 对模板中文本空格的处理行为默认采用 `trim` 的处理，即会将元素中开头和结尾的空格（包括特殊 `&nbsp;`）均去除。

`2.15.3` 版本后，增加 `Vue.config.trimWhitespace` 配置，设为 `false` 可关闭 `trim` 的处理，其余遵循 [Vue-Loader compilerOptions](https://cn.vuejs.org/api/application.html#app-config-compileroptions-whitespace) 本身的配置。

!> 注意：Vue2.x compilerOptions.whitespace 的默认值为 `preserve`

```javascript
// entry file
// trimWhitespace default is  true
Vue.config.trimWhitespace = false; // close trim handler

// webpack script
rules: [
  {
    test: /\.vue$/,
    use: [
      {
        loader: vueLoader,
        options: {
          compilerOptions: {
            // whitespace handler, default is 'preserve'
            whitespace: 'condense',
          },
        },
      },
    ],
  },
]
```

---

# span

[[范例：demo-p.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-p.vue)

显示文本。 一切同 [p](hippy-vue/components.md?id=p)。

## 事件

| 事件名称          | 描述                                                         | 类型                                      | 支持平台 |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| touchstart  | 触屏开始事件，最低支持版本 2.6.2，参数为 `evt: { touches: [{ clientX: number, clientY: number }] }`，`clientX` 和 `clientY` 分别表示点击在屏幕内的绝对位置 | `Function`                                | `Android、iOS、Web-Renderer`    |
| touchmove   | 触屏移动事件，最低支持版本 2.6.2，参数为 `evt: { touches: [{ clientX: number, clientY: number }] }`，`clientX` 和 `clientY` 分别表示点击在屏幕内的绝对位置 | `Function`                                | `Android、iOS、Web-Renderer`    |
| touchend    | 触屏结束事件，最低支持版本 2.6.2，参数为 `evt: { touches: [{ clientX: number, clientY: number }] }`，`clientX` 和 `clientY` 分别表示点击在屏幕内的绝对位置 | `Function`                                | `Android、iOS、Web-Renderer`    |
| touchcancel | 触屏取消事件，当用户触屏过程中，某个系统事件中断了触屏，例如电话呼入、组件变化（如设置为hidden）、其他组件的滑动手势，此函数会收到回调，最低支持版本 2.6.2，参数为 `evt: { touches: [{ clientX: number, clientY: number }] }`，`clientX` 和 `clientY` 分别表示点击在屏幕内的绝对位置 | `Function`                                | `Android、iOS、Web-Renderer`    |

---

# textarea

[[范例：demo-p.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-textarea.vue)

多行文本输入框。 一切同 [input](hippy-vue/components.md?id=input)。
