<!-- markdownlint-disable no-duplicate-header -->

# 核心组件

核心组件的定义是跟浏览器、Vue 中保持一致，如果只使用这些组件的话，可以直接跨浏览器。

# a

该组件目前映射到 Text，目前主要用于在 hippy-vue-router 中进行页面跳转。

一切同 [p](hippy-vue/components.md?id=p)。

# button

[[范例：demo-button.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-button.vue)

该组件映射到 View 上是因为它是一个可点击的容器，容器里面可以放图片、也可以放文本。但是因为 View 不能包裹文本，所以需要在 `<button>` 里包裹其它文本组件才能显示文字，这个跟浏览器不一样，浏览器的 `<button>` 也可以包裹 `<span>` 组件，所以这只是需要开发时注意一下。

## 事件

| 事件名称          | 描述                                                         | 类型                                      | 支持平台 |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| click       | 当按钮被点击以后调用此回调函数。  例如， `@click="clickHandler"` | `Function`                                | `ALL`    |
| longClick   | 当按钮被长按以后调用此回调函数。  例如， `@longClick="longClickHandler"}` | `Function`                                | `ALL`    |

# div

[[范例：demo-p.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-div.vue)

别的组件容器，默认不可以滚动。可以通过增加样式参数 `overflow-y: scroll` 切换为可以纵向滚动容器，或者增加样式参数 `overflow-x: scroll` 切换为水平滚动容器。

## 参数

| 参数               | 描述                                                         | 类型                                 | 支持平台  |
| ------------------ | ------------------------------------------------------------ | ------------------------------------ | --------- |
| accessibilityLabel | 设置当用户与此元素交互时，“读屏器”（对视力障碍人士的辅助功能）阅读的文字。默认情况下，这个文字会通过遍历所有的子元素并累加所有的文本标签来构建。 | `node`                               | `ALL`     |
| accessible         | 当此属性为 `true` 时，表示此视图时一个启用了无障碍功能的元素。默认情况下，所有可触摸操作的元素都是无障碍功能元素。 | `boolean`                            | `ALL`     |
| style              | -                                                            | [`View Styles`](style/layout.md) | `ALL`     |
| collapsable        | 如果一个 `View` 只用于布局它的子组件，则它可能会为了优化而从原生布局树中移除。 把此属性设为 `false` 可以禁用这个优化，以确保对应视图在原生结构中存在。 | `boolean`                            | `Android` |
| opacity            | 配置 `View` 的透明度，同时会影响子节点的透明度               | `number`                             | `ALL`     |
| overflow           | 指定当子节点内容溢出其父级 `View` 容器时, 是否剪辑内容       | `enum`(visible, hidden)         | `ALL`     |
| focusable          | 允许使用遥控器触发 View 的激活状态，改为 true 后使用遥控器将能触发 div 的 `@focus` 事件，需要通过 `nextFocusDownId`、`nextFocusUpId`、`nextFocusLeftId`、`nextFocusRightId` 参数指明四个方向键将移动到的的节点 ID       | `boolean`         | `Android`     |

## 事件

| 事件名称          | 描述                                                         | 类型                                      | 支持平台 |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| layout           | 这个事件会在布局计算完成后立即调用一次，不过收到此事件时新的布局可能还没有在屏幕上呈现，尤其是一个布局动画正在进行中的时候。 | `Function`                           | `ALL`     |
| attachedToWindow   | 这个事件会在节点已经渲染并且添加到容器组件中触发，因为 Hippy 的渲染是异步的，这是很稳妥的执行后续操作的事件。 | `Function`                           | `ALL`     |
| focus            | 该事件在 `focusable` 置为 true 时触发，通过遥控方向键可以移动活动组件位置，事件回调带有 `isFocused` 参数用于标记激活和非激活状态 | `Function`  | `Android` |

# form

[[范例：demo-div.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-div.vue)

别的组件容器。

一切同 [div](hippy-vue/components.md?id=div)。

# iframe

[[范例：demo-iframe.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-iframe.vue)

内嵌网页容器。

## 参数

| 参数               | 描述                                                         | 类型                                 | 支持平台  |
| ------------------ | ------------------------------------------------------------ | ------------------------------------ | --------- |
| src | 内嵌用的网址 | `string`                               | `ALL`     |

## 事件

| 事件名称          | 描述                                                         | 类型                                      | 支持平台 |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| load           | 网页加载成功后会触发 | `Function`                           | `ALL`     |

# img

[[范例：demo-img.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-img.vue)

图片组件，和浏览器的一样。

> **注意：** 必须指定样式中的宽度和高度，否则无法工作。

> **注意：** Android 端默认会带上灰底色用于图片占位，可以加上 `background-color: transparent` 样式改为透明背景。

## 参数

| 参数          | 描述                                                         | 类型                                      | 支持平台 |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| src        | 图片地址 | string                                | `ALL`    |

## 事件

| 事件名称          | 描述                                                         | 类型                                      | 支持平台 |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| layout      | 当元素挂载或者布局改变的时候调用，参数为： `{ nativeEvent: { layout: { x, y, width, height } } }`。 | `Function`                                                   | `ALL`    |
| load        | 加载成功完成时调用此回调函数。                               | `Function`                                                   | `ALL`    |
| loadStart   | 加载开始时调用。 | `Function`                                                   | `ALL`    |
| loadEnd     | 加载结束后，不论成功还是失败，调用此回调函数。               | `Function`                                                   | `ALL`    |
| error       | 当加载错误的时候调用此回调函数。| `Function`                                                   | `ALL`    |
| progress       | 当加载错误的时候调用此回调函数。 | `Function`                                                   | `ALL`    |

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
| defaultValue          | 提供一个文本框中的初始值。当用户开始输入的时候，值就可以改变。  在一些简单的使用情形下，如果你不想用监听消息然后更新 value 属性的方法来保持属性和状态同步的时候，就可以用 defaultValue 来代替。 | `string`                                                     | `ALL`     |
| disabled              | 如果为 true                           | `boolean`                                                    | `ALL`     |
| type          | 决定弹出的何种软键盘的。 注意，`password`仅在属性 `multiline=false` 单行文本框时生效。 | `enum`(default, numeric, password, email, phone-pad) | `ALL`     |
| maxlength             | 限制文本框中最多的字符数。使用这个属性而不用JS 逻辑去实现，可以避免闪烁的现象。 | `numbers`                                                    | `ALL`     |
| numberOfLines         | 设置 `input` 的最大行数，在使用的时候必需同时设置 `multiline` 参数为 `true`。 | `number`                                                     | `ALL`     |
| placeholder           | 如果没有任何文字输入，会显示此字符串。                       | `string`                                                     | `ALL`     |
| placeholderTextColor  | 占位字符串显示的文字颜色。                                   | [`color`](style/color.md)                                | `ALL`     |
| returnKeyType         | 指定软键盘的回车键显示的样式。                               | `enum`(done, go, next, search, send)              | `ALL`     |
| value                 | 指定 `input` 组件的值。                                  | `string`                                                     | `ALL`     |
| autoFocus             | 组件渲染时自动获得焦点。                                       | `boolean`                                                    | `ALL`     |

## 事件

| 事件名称          | 描述                                                         | 类型                                      | 支持平台 |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| blur                | 当文本框失去焦点的时候调用此回调函数。                       | `Function`                                                   | `ALL`     |
| chang          | 当文本框内容变化时调用此回调函数。改变后的文字内容会作为参数传递。 | `Function`                                                   | `ALL`     |
| keyboardWillShow    | 在弹出输入法键盘时候会触发此回调函数，返回值包含键盘高度 `keyboardHeight`，样式如 `{ keyboardHeight: 260}`。                                     | `Function`                                                   | `ALL`     |
| endEditing          | 当文本输入结束后调用此回调函数。                             | `Function`                                                   | `ALL`     |
| layout              | 当组件挂载或者布局变化的时候调用，参数为`{ x, y, width, height }`。 | `Function`                                                   | `ALL`     |
| selectionChange     | 当输入框选择文字的范围被改变时调用。返回参数的样式如 `{ nativeEvent: { selection: { start, end } } }`。 | `Function`                                                   | `ALL`     |

# label

[[范例：demo-p.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-p.vue)

显示文本。

一切同 [p](hippy-vue/components.md?id=p)。

# li

ul 的子节点，终端层节点回收和复用的最小颗粒度。

[[范例：demo-list.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-list.vue)

## 参数

| 参数                  | 描述                                                         | 类型                                                        | 支持平台 |
| --------------------- | ------------------------------------------------------------ | ----------------------------------------------------------- | -------- |
| type            | 指定一个函数，在其中返回对应条目的类型（返回Number类型的自然数，默认是0），List 将对同类型条目进行复用，所以合理的类型拆分，可以很好地提升list 性能。 | `number`              | `ALL`    |
| key             | 指定一个函数，在其中返回对应条目的 Key 值，详见 [Vue 官文](//cn.vuejs.org/v2/guide/list.html) | `string`                                    | `ALL`    |
| sticky       | 对应的item是否需要使用悬停效果（滚动到顶部时，会悬停在List顶部，不会滚出屏幕） | `boolean`                                | `ALL`
| appear       | 当有`li`节点滑动进入屏幕时（曝光）触发，入参返回曝光的`li`节点对应索引值。 | `(index) => any` | `ALL（Android目前回调时机上不准确，待修复）` |
| disappear       | 当有`li`节点滑动离开屏幕时触发，入参返回离开的`li`节点对应索引值。 | `(index) => any` | `ALL（Android目前回调时机上不准确，待修复）` |

# p

[[范例：demo-p.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-p.vue)

显示文本，不过因为 Hippy 下没有 `display: inline` 的显示模式，默认全部都是 flex 的。

## 参数

| 参数          | 描述                                                         | 类型                                      | 支持平台 |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| numberOfLines | 用来当文本过长的时候裁剪文本。包括折叠产生的换行在内，总的行数不会超过这个属性的限制。 | `number`                                  | `ALL`    |
| opacity       | 配置 `View` 的透明度，同时会影响子节点的透明度。             | `number`                                  | `ALL`    |
| onClick       | 当文本被点击以后调用此回调函数。  例如， `onClick={() => console.log('onClick') }` | `Function`                                | `ALL`    |
| ellipsizeMode* | 当设定了 `numberOfLines` 值后，这个参数指定了字符串如何被截断。所以，在使用 `ellipsizeMode` 时，必须得同时指定 `numberOfLines` 数值。 | `enum`(head, middle, tail, clip)| `ALL`    |

* ellipsizeMode 的参数含义：
  * `head` - 文字将会从头开始截断，保证字符串的最后的文字可以正常显示在 `Text` 组件的最后，而从开头给截断的文字，将以 “...” 代替，例如 “...wxyz”；
  * `middle` - "文字将会从中间开始截断，保证字符串的最后与最前的文字可以正常显示在Text组件的响应位置，而中间给截断的文字，将以 “...” 代替，例如 “ab...yz”
  * `tail` - 文字将会从最后开始截断，保证字符串的最前的文字可以正常显示在 Text 组件的最前，而从最后给截断的文字，将以 “...” 代替，例如 “abcd...”；
  * `clip` - 超过指定行数的文字会被直接截断，不显示“...”，

# ul

[[范例：demo-list.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-list.vue)

Hippy 的重点功能，高性能的可复用列表组件。里面第一层只能包含 `<li>`。

## 参数

| 参数                  | 描述                                                         | 类型                                                        | 支持平台 |
| --------------------- | ------------------------------------------------------------ | ----------------------------------------------------------- | -------- |
| numberOfRows          | 指定列表的行数，一般直接传入数据源条数 `length` 即可。       | `number`                                                    | `ALL`    |
| initialContentOffset  | 初始位移值 -- 在列表初始化时即可指定滚动距离，避免初始化后再通过 scrollTo 系列方法产生的闪动。 | `number`                                                    | `ALL`
| scrollEventThrottle   | 指定滑动事件的回调频率，传入数值指定了多少毫秒(ms)组件会调用一次 `onScroll` 回调事件，默认 200ms | `number`                                                    | `ALL`    |
| showScrollIndicator   | 是否显示垂直滚动条。 因为目前 ListView 其实仅有垂直滚动一种方向，水平滚动会导致 `onEndReached` 等一堆问题暂不建议使用，所以 `showScrollIndicator` 也仅用来控制是否显示垂直滚动条。 | `boolean`                                                   | `ALL`    |
| preloadItemNumber     | 指定当列表滚动至倒数第几行时触发 `onEndReached` 回调。 | `number` | `ALL` |
| exposureEventEnabled | 曝光能力启用开关（仅Android需设置）| `boolean` | `Android`
| endReached | 当所有的数据都已经渲染过，并且列表被滚动到最后一条时，将触发 `endReached` 回调。 | `Function`                                                  | `ALL`    |

## 事件

| 事件名称          | 描述                                                         | 类型                                      | 支持平台 |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| endReached          | 当所有的数据都已经渲染过，并且列表被滚动到最后一条时，将触发 `onEndReached` 回调。 | `Function`                                                  | `ALL`    |
| momentumScrollBegin | 在 `ScrollView` 开始滑动的时候调起                           | `Function`                                                  | `ALL`    |
| momentumScrollEnd   | 在 `ScrollView` 结束滑动的时候调起                           | `Function`                                                  | `ALL`    |
 scroll              | 当触发 `ListView` 的滑动事件时回调，在 `ListView` 滑动时回调，因此调用会非常频繁，请使用 `scrollEventThrottle` 进行频率控制。 注意：ListView 在滚动时会进行组件回收，不要在滚动时对 renderRow() 生成的 ListItemView 做任何 ref 节点级的操作（例如：所有 callUIFunction 和 measureInWindow 方法），回收后的节点将无法再进行操作而报错。 | `(obj: { contentOffset: { x: number, y: number } }) => any` | `ALL`    |
| scrollBeginDrag     | 当用户开始拖拽 `ScrollView` 时调用。                         | `Function`                                                  | `ALL`    |
| scrollEndDrag       | 当用户停止拖拽 `ScrollView` 或者放手让 `ScrollView` 开始滑动的时候调用 | `Function`                                                  | `ALL`    |

## 方法

### scrollTo

`(xOffset: number, yOffset: number: duration: number) => void` 通知 ListView 滑动到某个具体坐标偏移值(offset)的位置。

> * `xOffset`: number - 滑动到 X 方向的 offset
> * `yOffset`: numbere - 滑动到 Y 方向的 offset
> * `number`: boolean - 多长事件滚到指定位置

### scrollToIndex

`(xIndex: number, yIndex: number: animated: boolean) => void` 通知 ListView 滑动到第几个 item。

> * `xIndex`: number - 滑动到 X 方向的第 xIndex 个 item
> * `yIndex`: number - 滑动到 Y 方向的 yIndex 个 item
> * `animated`: boolean - 滑动过程是否使用动画

## 事件

| 事件名称          | 描述                                                         | 类型                                      | 支持平台 |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| layout      | 当元素挂载或者布局改变的时候调用，参数为： `{ nativeEvent: { layout: { x, y, width, height } } }`。 | `Function`                                | `ALL`    |

# span

[[范例：demo-p.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-p.vue)

显示文本。

一切同 [p](hippy-vue/components.md?id=p)。

# textarea

[[范例：demo-p.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-textarea.vue)

多行文本输入框。

一切同 [input](hippy-vue/components.md?id=input)。
