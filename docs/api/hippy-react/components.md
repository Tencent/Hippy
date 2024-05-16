<!-- markdownlint-disable no-duplicate-header -->

# 组件

Hippy-React SDK 提供了常用的 UI 组件，语法上接近终端

---

# Image

[[Image 范例]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/Image)

图片组件，用于显示单张图片。

> * 必须指定样式中的宽度和高度，否则无法工作。
> * Android 端默认会带上灰底色用于图片占位，可以加上 `backgroundColor: transparent` 样式改为透明背景。(`2.14.1` 版本后 Image 默认背景色修改成 `transparent`)

## 基本用法

直接加载远程图片：

```jsx
<Image
  style={{ width: 200, height: 200 }}
  source={{ uri: 'http://xxx/qb_icon_new.png' }}
  resizeMode={Image.resizeMode.cover}
/>;
```

或者使用本地图片加载能力：

```jsx
import icon from './qb_icon_new.png';

<Image
  style={{ width: 200, height: 200 }}
  source={{ uri: icon }}
  resizeMode={Image.resizeMode.cover}
/>
```

>* 本地图片可通过[加载时定义 Loader](//webpack.js.org/concepts/loaders/#inline)，或者 webpack 配置 `url-loader` 转换成 base64 加载。
>* `2.8.1` 版本后支持终端本地图片能力，可通过配置 webpack `file-loader` 加载。

## 参数

| 参数          | 描述                                                                                                                                                                       | 类型                                                         | 支持平台 |
| ------------- |--------------------------------------------------------------------------------------------------------------------------------------------------------------------------| ------------------------------------------------------------ | -------- |
| capInsets     | 当调整 `Image` 大小的时候，由 `capInsets` 指定的边角尺寸会被固定而不进行缩放，而中间和边上其他的部分则会被拉伸。这在制作一些可变大小的圆角按钮、阴影、以及其它资源的时候非常有用。                                                                     | `{ top: number, left: number, bottom: number, right: number }` | `Android、iOS、Voltron`    |
| defaultSource | 指定当 `Image` 组件还没加载出来 `source` 属性指定的图片的占位符图片，当 `source` 属性指定的图片加载失败时， `Image` 组件会显示 `defaultSource` 属性指定的图片                                                               | `string`: 图片 base64 字符串                                     | `Android、iOS、hippy-react-web、Web-Renderer、Voltron`    |
| source        | uri 是一个表示图片的资源标识的字符串。 现在支持的图片格式有 `png` , `jpg` , `jpeg` , `bmp` , `gif` 。                                                                                                | `{ uri: string }`                                            | `Android、iOS、hippy-react-web、Web-Renderer、Voltron`    |
| tintColor     | 对图片进行染色(对非纯色图片进行有透明度的染色时，Android 和 iOS 的 `blendMode` 默认值有差异)。                                                                                                            | [color](api/style/color.md) | `Android、iOS、Web-Renderer`|
| onLayout      | 当元素挂载或者布局改变的时候调用，参数为： `nativeEvent: { layout: { x, y, width, height } }`，其中 `x` 和 `y` 为相对父元素的坐标位置                                                                        | `Function`                                                   | `Android、iOS、hippy-react-web、Web-Renderer、Voltron`    |
| onLoad        | 加载成功完成时调用此回调函数。                                                                                                                                                          | `Function`                                                   | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| onLoadStart   | 加载开始时调用。 例如, `onLoadStart={() => this.setState({ loading: true })}`                                                                                                      | `Function`                                                   | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| onLoadEnd     | 加载结束后，不论成功还是失败，调用此回调函数。参数为：`nativeEvent: { success: number, width: number, height: number}`  | `Function`                                                   | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| resizeMode    | 决定当组件尺寸和图片尺寸不成比例的时候如何调整图片的大小。`注意：hippy-react-web、Web-Renderer 不支持 repeat`                                                                                                |  `enum (cover, contain, stretch, repeat, center)` | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| onError       | 当加载错误的时候调用此回调函数，参数为 `nativeEvent: { error }`                                                                                                                             | `Function`                                                   | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| onProgress    | 在加载过程中不断调用，参数为 `nativeEvent: { loaded: number, total: number }`, `loaded` 表示加载中的图片大小， `total` 表示图片总大小                                                                    | `Function`                                                   |      `iOS、Voltron`     |
| onTouchDown  | 当用户开始在控件上按下手指时，将回调此函数，并将触屏点信息作为参数传递进来； 参数为 `nativeEvent: { name, page_x, page_y, id }`,  `page_x` 和 `page_y` 分别表示点击在屏幕内的绝对位置                                             | `Function`                                | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| onTouchMove   | 当用户在控件移动手指时，此函数会持续收到回调，并通过event参数告知控件的触屏点信息；参数为 `nativeEvent: { name, page_x, page_y, id }`，`page_x` 和 `page_y` 分别表示点击在屏幕内的绝对位置                                          | `Function` | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| onTouchEnd    | 当触屏操作结束，用户在该控件上抬起手指时，此函数将被回调，event参数也会通知当前的触屏点信息；参数为 `nativeEvent: { name, page_x, page_y, id }`，`page_x` 和 `page_y` 分别表示点击在屏幕内的绝对位置                                     | `Function`                                | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| onTouchCancel | 当用户触屏过程中，某个系统事件中断了触屏，例如电话呼入、组件变化（如设置为hidden）、其他组件的滑动手势，此函数会收到回调，触屏点信息也会通过event参数告知前端；参数为 `nativeEvent: { name, page_x, page_y, id }`，`page_x` 和 `page_y` 分别表示点击在屏幕内的绝对位置 | `Function`                                | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |

## 方法

### getSize

`(uri: string, success: (width: number, height: number) => void, failure?: ErrorFunction) => void` 在显示图片前获取图片的宽高(以像素为单位)。如果图片地址不正确或下载失败, 此方法也会失败。

要获取图片的尺寸, 首先需要加载或下载图片(同时会被缓存起来)。这意味着理论上可以用这个方法来预加载图片，但是更好的预加载方案是使用下面 `prefetch` 预加载方法。

*不适用于静态图片资源。*

> * `uri`: string - 图片的地址
> * `success`: (width: number, height: number) => void - 此函数会在获取图片与其宽高成功后被回调
> * `failure`: ErrorFunction - 此函数会在如获取图片失败等异常情况被回调

### prefetch

`(url: string) => void` 预加载一张远程图片，将其下载到本地磁盘缓存。

> * `uri`: string - 图片的地址

---

# ListView

[[ListView 范例]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/ListView)

可复用垂直列表功能，尤其适合大量条目的数据渲染。

> Android `2.14.0` 版本后会采用 `RecyclerView` 替换原有 `ListView`

## 参数

| 参数                  | 描述                                                         | 类型                                                        | 支持平台 |
| --------------------- | ------------------------------------------------------------ | ----------------------------------------------------------- | -------- |
| bounces | 是否开启回弹效果，默认 `true`， Android `2.14.1` 版本后支持该属性，老版本使用 `overScrollEnabled` | `boolean`                                                  | `Android`、`iOS`、`Voltron`    |
| getRowKey             | 指定一个函数，在其中返回对应条目的 Key 值，详见 [React 官文](//reactjs.org/docs/lists-and-keys.html) | `(index: number) => any`                                    | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| getRowStyle           | 设置 `ListViewItem` 容器的样式。当设置了 `horizontal=true` 启用横向 `ListView` 时，需显式设置 `ListViewItem` 宽度              | `(index: number) => styleObject`                                    | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| getHeaderStyle           | 设置 `PullHeader` 容器的样式。当设置了 `horizontal=true` 启用横向 `ListView` 时，需显式设置 `PullHeader` 宽度。`最低支持版本2.14.1`              | `() => styleObject`                                    | `Android、iOS、Voltron` |
| getFooterStyle           | 设置 `PullFooter` 容器的样式。当设置了 `horizontal=true` 启用横向 `ListView` 时，需显式设置 `PullFooter` 宽度。`最低支持版本2.14.1`              | `() => styleObject`                                    | `Android、iOS、Voltron` |
| getRowType            | 指定一个函数，在其中返回对应条目的类型（返回Number类型的自然数，默认是0），List 将对同类型条目进行复用，所以合理的类型拆分，可以很好地提升 List 性能。`注意：同一 type 的 item 组件由于复用可能不会走完整组件创建生命周期` | `(index: number) => number`                                    | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| horizontal       | 指定 `ListView` 是否采用横向布局。`default: undefined` 纵向布局，Android `2.14.1` 版本后可设置 `false` 显式固定纵向布局；iOS 从 `3.0` 开始支持横向 `ListView`| `boolean \| undefined`   | `Android、iOS、hippy-react-web、Voltron` |
| initialListSize       | 指定在组件刚挂载的时候渲染多少行数据。用这个属性来确保首屏显示合适数量的数据，而不是花费太多帧时间逐步显示出来。 | `number`                                                    | `Android、iOS、Web-Renderer、Voltron` |
| initialContentOffset  | 初始位移值。在列表初始化时即可指定滚动距离，避免初始化后再通过 scrollTo 系列方法产生的闪动。Android 在 `2.8.0` 版本后支持        | `number`                                             | `Android、iOS、Web-Renderer、Voltron`    |
| onAppear     | 当有`ListViewItem`滑动进入屏幕时（曝光）触发，入参返回曝光的`ListViewItem`对应索引值。 | `(index) => void` | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| onDisappear     | 当有`ListViewItem`滑动离开屏幕时触发，入参返回离开的`ListViewItem`对应索引值。 | `(index) => void` | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| onWillAppear     | 当有`ListViewItem`至少一个像素进入屏幕时（曝光）触发，入参返回曝光的`ListViewItem`对应索引值。 `最低支持版本2.3.0` | `(index) => void` | `Android、iOS、Voltron` |
| onWillDisappear     | 当有`ListViewItem`至少一个像素滑动离开屏幕时触发，入参返回离开的`ListViewItem`对应索引值。 `最低支持版本2.3.0`| `(index) => void` | `Android、iOS、Voltron` |
| onEndReached          | 当所有的数据都已经渲染过，并且列表被滚动到最后一条时，将触发 `onEndReached` 回调。 | `Function`                                                  | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| onMomentumScrollBegin | 在 `ListView` 开始滑动的时候触发。                          | `(obj: { contentOffset: { x: number, y: number } }) => any`   | `Android、iOS、Web-Renderer、Voltron`    |
| onMomentumScrollEnd   | 在 `ListView` 结束滑动的时候触发。                          | `(obj: { contentOffset: { x: number, y: number } }) => any`   | `Android、iOS、Web-Renderer、Voltron`    |
| onScroll              | 在 `ListView` 滑动时回调。调用频率可能较高，可使用 `scrollEventThrottle` 进行频率控制。 注意：ListView 在滚动时会进行组件回收，不要在滚动时对 renderRow() 生成的 ListItemView 做任何 ref 节点级的操作（例如：所有 callUIFunction 和 measureInAppWindow 方法），回收后的节点将无法再进行操作而报错。横向 ListView Android 在 `2.8.0` 版本后支持 | `(obj: { contentOffset: { x: number, y: number } }) => any` | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| onScrollBeginDrag     | 当用户开始拖拽 `ListView` 时调用。                         | `(obj: { contentOffset: { x: number, y: number } }) => any`     | `Android、iOS、Web-Renderer、Voltron`    |
| onScrollEndDrag       | 当用户停止拖拽 `ListView` 或者放手让 `ListView` 开始滑动时调用 | `(obj: { contentOffset: { x: number, y: number } }) => any`    | `Android、iOS、Web-Renderer、Voltron`    |
| preloadItemNumber     | 指定当列表滚动至倒数第几行时触发 `onEndReached` 回调。 | `number` | `Android、iOS、Web-Renderer、Voltron` |
| renderRow             | 这里的入参是当前行的索引 index，需返回一个用于构造 `ListViewItem` 内容的 Node 节点。在这里可以凭借 index 获取到具体这一行单元格的数据，从而决定如何渲染这个单元格。 | `(index: number) => Node`                                   | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| rowShouldSticky       | 在回调函数，根据传入参数index（ListView单元格的index）返回 true 或 false 指定对应的 item 是否需要使用悬停效果（滚动到顶部时，会悬停在List顶部，不会滚出屏幕）。 | `(index: number) => boolean`                                | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| scrollEventThrottle   | 指定滑动事件的回调频率，传入数值指定了多少毫秒(ms)组件会调用一次 `onScroll` 事件 | `number`                                                    | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| scrollEnabled    | 滑动是否开启。`default: true` | `boolean` | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| showScrollIndicator   | 是否显示滚动条。`default: true` | `boolean`  | `iOS、hippy-react-web、Voltron` |
| renderPullHeader   | 设置列表下拉头部（刷新条），配合`onHeaderReleased`、`onHeaderPulling` 和 `collapsePullHeader`使用, 参考 [DEMO](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/PullHeaderFooter/index.jsx)。 | `() => View`                                                   | `Android、iOS、hippy-react-web、Voltron` |
| onHeaderPulling   | 下拉过程中触发, 事件会通过 contentOffset 参数返回拖拽高度，可以根据下拉偏移量做相应的逻辑。 | `(obj: { contentOffset: number }) => any`                                                   | `Android、iOS、hippy-react-web、Voltron` |
| onHeaderReleased   | 下拉超过内容高度，松手后触发。 | `() => any`                                                   | `Android、iOS、hippy-react-web、Voltron` |
| renderPullFooter   | 最低支持版本`2.14.0`， 设置列表底部上拉刷新条，配合 `onFooterReleased`、`onFooterPulling` 和 `collapsePullFooter` 使用, 参考 [DEMO](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/PullHeaderFooter/index.jsx)。 | `() => View`                                                   | `Android、iOS、hippy-react-web、Voltron` |
| onFooterPulling   | 最低支持版本`2.14.0`，上拉过程中触发, 事件会通过 contentOffset 参数返回拖拽高度，可以根据上拉偏移量做相应的逻辑。 | `(obj: { contentOffset: number }) => any`                                                   | `Android、iOS、hippy-react-web、Voltron` |
| onFooterReleased   |  最低支持版本`2.14.0`，上拉超出一定距离，松手后触发。 | `() => any`                                                   | `Android、iOS、hippy-react-web、Voltron` |
| editable   | 是否可编辑，开启侧滑删除时需要设置为 `true`。`最低支持版本2.9.0` | `boolean`                                                   | `iOS`    |
| delText   | 侧滑删除文本。`最低支持版本2.9.0` | `string`                                                   | `iOS`    |
| onDelete   | 在列表项侧滑删除时调起。`最低支持版本2.9.0` | `(nativeEvent: { index: number}) => void`                                                   | `iOS`    |

## 方法

### scrollToContentOffset

`(xOffset: number, yOffset: number, animated: boolean) => void` 通知 ListView 滑动到某个具体坐标偏移值(offset)的位置。

> * `xOffset`: number - 滑动到 X 方向的 offset
> * `yOffset`: number - 滑动到 Y 方向的 offset
> * `animated`: boolean - 滑动过程是否使用动画

### scrollToIndex

`(xIndex: number, yIndex: number, animated: boolean) => void` 通知 ListView 滑动到第几个 item。

> * `xIndex`: number - 滑动到 X 方向的第 xIndex 个 item
> * `yIndex`: number - 滑动到 Y 方向的 yIndex 个 item
> * `animated`: boolean - 滑动过程是否使用动画

### collapsePullHeader

`(otions: { time: number }) => void` 收起刷新条 PullHeader。当设置了`renderPullHeader`后，每当下拉刷新结束需要主动调用该方法收回 PullHeader。

> options 参数，最低支持版本 `2.14.0`
>
>* time: number: 可指定延迟多久后收起 PullHeader，单位ms

### collapsePullFooter

> 最低支持版本 `2.14.0`

`() => void` 收起底部上拉刷新条 PullFooter。当设置了`renderPullFooter`后，每当上拉刷新结束需要主动调用该方法收回 PullFooter。

---

# Modal

[[Modal 范例]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/Modal)

模态弹窗组件。

## 参数

| 参数                  | 描述                                                         | 类型                                                         | 支持平台 |
| --------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------- |
| animationType         | 动画效果                                                            | `enum (none, slide, fade, slide_fade)` | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| supportedOrientations | 支持屏幕翻转方向                                                            | `enum (portrait, portrait-upside-down, landscape, landscape-left, landscape-right)[]` | `iOS`    |
| immersionStatusBar    | 是否是沉浸式状态栏。`default: false`                                        | `boolean`                                                    | `Android、Voltron`    |
| darkStatusBarText     | 是否是亮色主体文字，默认字体是黑色的，改成 true 后会认为 Modal 背景为暗色调，字体就会改成白色。 | `boolean`                                                    | `Android、iOS、Voltron`    |
| autoHideStatusBar     | 是否在`Modal`显示时自动隐藏状态栏。<strong>Android 中仅 api28 以上生效。</strong> `default: false` | `boolean` | `Android` |
| autoHideNavigationBar | 是否在`Modal`显示时自动隐藏导航栏。 `default: false` | `boolean` | `Android` |
| onShow                | 在`Modal`显示时会执行此回调函数。                            | `Function`                                                   | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| onOrientationChange   | 屏幕旋转方向改变时执行会回调，返回当前屏幕显示方向 `{ orientation: portrait｜landscape }` | `Function`                                                   | `Android、iOS`    |
| onRequestClose        | 在 `Modal` 请求关闭时会执行此回调函数，一般时在 Android 系统里按下硬件返回按钮时触发，一般要在里面处理关闭弹窗。 | `Function`                                                   | `Android、hippy-react-web、Voltron` |
| transparent           | 背景是否是透明的。`default: true`                    | `boolean`                                                    | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| visible               | 是否显示。`default: true`                                                    | `boolean`                                                    | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |

---

# RefreshWrapper

[[RefreshWrapper 范例]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/RefreshWrapper)

包裹住 `ListView` 提供下滑刷新功能的组件.

> `RefreshWrapper` 现在只支持包裹一个 `ListView` 组件，暂不支持别的组件的下滑刷新功能。

## 参数

| 参数       | 描述                                                 | 类型       | 支持平台 |
| ---------- | ---------------------------------------------------- | ---------- | -------- |
| onRefresh  | 当`RefreshWrapper`执行刷新操作时，会触发到此回调函数 | `Function` | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| getRefresh | 定义刷新栏的视图表现，返回 `View`， `Text` 等组件。  | `Function` | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| bounceTime | 指定刷新条收回动画的时长，单位为ms                   | `number`   | `Android、iOS、Web-Renderer、Voltron`    |

## 方法

### refreshCompleted

`() => void` 调用此方法，告知 RefreshWrapper 已经刷新完毕，RefreshWrapper 将会收起刷新栏。

### startRefresh

`() => void` 调用此方法，手工告知 RefreshWrapper 开始刷新，展开刷新栏。

---

# ScrollView

[[Scroll 范例]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/ScrollView)

滚动视图组件，用于展示不确定高度的内容，它可以将一系列不确定高度的子组件装到一个确定高度的容器中，使用者可通过上下或左右滚动操作查看组件宽高之外的内容。

一个包装了平台的 `ScrollView`（滚动视图）的组件，同时还集成了触摸锁定的“响应者”系统。

> * 注意：记住 ScrollView 必须有一个确定的高度才能正常工作，因为它实际上所做的就是将一系列不确定高度的子组件装进一个确定高度的容器（通过滚动操作）。要给一个 ScrollView 确定一个高度的话，要么直接给它设置高度（不建议），要么确定所有的父容器都有确定的高度。一般来说我们会给 ScrollView 设置 `flex: 1` 以使其自动填充父容器的空余空间，但前提条件是所有的父容器本身也设置了flex或者指定了高度，否则就会导致无法正常滚动，你可以使用元素查看器来查找问题的原因。
> * 注意： ScrollView 无法使用 onTouch 系列事件监听触屏行为，但可以用 onScroll 监听滚动行为。

## 参数

| 参数                           | 描述                                                         | 类型                                                         | 支持平台 |
| ------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | -------- |
| bounces | 是否开启回弹效果，默认 `true` | `boolean`                                                  | `iOS、Voltron`    |
| contentContainerStyle          | 这些样式会应用到一个内层的内容容器上，所有的子视图都会包裹在内容容器内。 | `StyleSheet`                                                 | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| horizontal                     | 当此属性为 `true` 的时候，所有的子视图会在水平方向上排成一行，而不是默认的在垂直方向上排成一列 | `boolean`                                                    | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| onMomentumScrollBegin          | 在 `ScrollView` 滑动开始的时候调起。                         | `(obj: { contentOffset: { x: number, y: number } }) => any`                                                   | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| onMomentumScrollEnd            | 在 `ScrollView` 滑动结束的时候调起。                         | `(obj: { contentOffset: { x: number, y: number } }) => any`                                                   | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| onScroll                       | 在滚动的过程中，每帧最多调用一次此回调函数。                 | `(obj: { contentOffset: { x: number, y: number } }) => any`                                                   | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| onScrollBeginDrag              | 当用户开始拖拽 `ScrollView` 时调用。                         | `(obj: { contentOffset: { x: number, y: number } }) => any`                                                   | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| onScrollEndDrag                | 当用户停止拖拽 `ScrollView` 或者放手让 `ScrollView` 开始滑动的时候调用。 | `(obj: { contentOffset: { x: number, y: number } }) => any`                                                   | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| pagingEnabled                  | 当值为 `true` 时，滚动条会停在滚动视图的尺寸的整数倍位置。这个可以用在水平分页上。`default: false` | `boolean`                                                    | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| scrollEventThrottle            | 指定滑动事件的回调频率，传入数值指定了多少毫秒(ms)组件会调用一次 `onScroll` 回调事件。 | `number`                                                     | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| scrollIndicatorInsets          | 决定滚动条距离视图边缘的坐标。这个值应该和contentInset一样。 | `{ top: number, left: number, bottom: number, right: number }` | `Android、iOS`    |
| scrollEnabled                  | 当值为 `false` 的时候，内容不能滚动。`default: true`                        | `boolean`                                                    | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| showScrollIndicator            | 是否显示滚动条。 `default: false` | `boolean`  | `Android、hippy-react-web、Voltron` |
| showsHorizontalScrollIndicator | 当此值设为 `false` 的时候，`ScrollView` 会隐藏水平的滚动条。`default: true` | `boolean`                                                    | `iOS、Voltron`    |
| showsVerticalScrollIndicator   | 当此值设为 `false` 的时候，`ScrollView` 会隐藏垂直的滚动条。 `default: true` | `boolean`                                                    | `iOS、Voltron`    |

## 方法

### scrollTo

`(x: number, y: number, animated: boolean) => void` 滚动到指定的 X，Y 偏移值，第三个参数为是否启用平滑滚动动画。

> * x: number - X 偏移值
> * y: number - Y 偏移值
> * animated: boolean - 是否启用平滑滚动动画。

### scrollToWithDuration

`(x: number, y: number, duration: number) => void` 经过指定的时间平滑滚动到 X、Y 偏移值。

> * x: number - X 偏移值
> * y: number - Y 偏移值
> * duration: number - 毫秒为单位的滚动时间，默认 1000ms

---

# TextInput

[[TextInput 范例]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/TextInput)

输入文本的基本组件。

本组件的属性提供了多种特性的配置，譬如自动完成、自动大小写、占位文字，以及多种不同的键盘类型（如纯数字键盘）等等。

## 差异性

由于系统组件层的差异，如果 TextInput 处于会被键盘遮住的位置，在呼出键盘后：

* iOS 则是正常的遮住
* Android 的表现为页面会被键盘顶起，顶起的幅度取决于 TextInput 的 Y 轴位置决定

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
| caretColor          | 输入光标颜色。（也可设置为 Style 属性） `最低支持版本2.11.5` | [`color`](api/style/color.md)    | `Android、hippy-react-web、Voltron` |
| defaultValue          | 提供一个文本框中的初始值。当用户开始输入的时候，值就可以改变。  在一些简单的使用情形下，如果你不想用监听消息然后更新 value 属性的方法来保持属性和状态同步的时候，就可以用 defaultValue 来代替。 | `string`                                                     | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| editable              | 如果为 false，文本框是不可编辑的。 `default: true`                          | `boolean`                                                    | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| keyboardType          | 决定弹出的何种软键盘的。 注意，`password`仅在属性 `multiline=false` 单行文本框时生效。 | `enum (default, numeric, password, email, phone-pad)` | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| maxLength             | 限制文本框中最多的字符数。使用这个属性而不用JS 逻辑去实现，可以避免闪烁的现象。 | `number`                                                    | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| multiline             | 如果为 `true` ，文本框中可以输入多行文字。 由于终端特性。    | `boolean`                                                    | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| numberOfLines         | 设置 `TextInput` 最大显示行数，如果 `TextInput` 没有显式设置高度，会根据 `numberOfLines` 来计算高度撑开。在使用的时候必需同时设置 `multiline` 参数为 `true`。 | `number`                                                     | `Android、hippy-react-web、Web-Renderer、Voltron` |
| onBlur                | 当文本框失去焦点的时候调用此回调函数。                       | `Function`                                                   | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| onFocus | 当文本框获得焦点的时候调用此回调函数。 | `Function` | `Android、iOS、Voltron` |
| onChangeText          | 当文本框内容变化时调用此回调函数。改变后的文字内容会作为参数传递。 | `Function`                                                   | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| onKeyboardWillShow    | 在弹出输入法键盘时候会触发此回调函数，返回值包含键盘高度 `keyboardHeight`，样式如 `{ keyboardHeight: 260 }`。 | `Function`                                                   | `Android、iOS、hippy-react-web、Voltron` |
| onKeyboardWillHide    | 在隐藏输入法键盘时候会触发此回调函数 | `Function`                                                   | `Android、iOS、Voltron`     |
| onKeyboardHeightChanged    | 在输入法键盘高度改变时触发此回调函数，返回值包含键盘高度 `keyboardHeight`，样式如 `{ keyboardHeight: 260 }`, `最低支持版本2.14.0`。 | `Function`                                                   | `iOS、Voltron`     |
| onEndEditing          | 当文本输入结束后调用此回调函数。                             | `Function`                                                   | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| onLayout              | 当组件挂载或者布局变化的时候调用，参数为`nativeEvent: { layout: { x, y, width, height } }`，其中 `x` 和 `y` 为相对父元素的坐标位置。 | `Function`                                                   | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| onSelectionChange     | 当输入框选择文字的范围被改变时调用。返回参数的样式如 `nativeEvent: { selection: { start, end } }`。 | `Function`                                                   | `Android、iOS、Web-Renderer、Voltron`     |
| placeholder           | 如果没有任何文字输入，会显示此字符串。                       | `string`                                                     | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| placeholderTextColor  | 占位字符串显示的文字颜色。（也可设置为 Style 属性）`最低支持版本2.13.4`                | [`color`](api/style/color.md)                                | `Android、iOS、Web-Renderer、Voltron`     |
| returnKeyType         | 指定软键盘的回车键显示的样式。（其中部分样式仅`multiline=false`时有效） | `enum (done, go, next, search, send)`              | `Android、iOS、Web-Renderer、Voltron`     |
| value                 | 指定 `TextInput` 组件的值。                                  | `string`                                                     | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| autoFocus             | 组件渲染时自动获得焦点。                                       | `boolean`                                                    | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| breakStrategy* | 设置Android API 23及以上系统的文本折行策略。`default: simple` | `enum(simple, high_quality, balanced)` | `Android(版本 2.14.2以上)` |

* breakStrategy 的参数含义：
  * `simple`（默认值）：简单折行，每一行显示尽可能多的字符，直到这一行不能显示更多字符时才进行换行，这种策略下不会自动折断单词（当一行只有一个单词并且宽度显示不下的情况下才会折断）；
  * `high_quality`：高质量折行，针对整段文本的折行进行布局优化，必要时会自动折断单词，比其他两种策略略微影响性能，通常比较适合只读文本；
  * `balanced`：平衡折行，尽可能保证一个段落的每一行的宽度相同，必要时会折断单词。

## 方法

### blur

`() => void` 让指定的 input 或 View 组件失去光标焦点，与 focus() 的作用相反。

### clear

`() => void` 清空输入框的内容。

### focus

`() => void` 指派 TextInput 获得焦点。

### getValue

`() => Promise<string>` 获得文本框中的内容。注意，由于是异步回调，收到回调时值可能已经改变。

### setValue

`(value: string) => void` 设置文本框内容。

> * value: string - 文本框内容

### isFocused

`最低支持版本 2.14.1。hippy-react-web 不支持。`

`() => Promise<boolean>` 获得文本框的焦点状态。注意，由于是异步回调，收到回调时值可能已经改变。

---

# Text

[[Text 范例]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/Text)

文本组件。

## 属性

| 参数          | 描述                                                         | 类型                                      | 支持平台 |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| numberOfLines | 用来当文本过长的时候裁剪文本。包括折叠产生的换行在内，总的行数不会超过这个属性的限制。 | `number`                                  | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| opacity       | 配置 `View` 的透明度，同时会影响子节点的透明度。             | `number`                                  | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| onLayout      | 当元素挂载或者布局改变的时候调用，参数为： `nativeEvent: { layout: { x, y, width, height } }`，其中 `x` 和 `y` 为相对父元素的坐标位置。 | `Function`                                | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| onClick       | 当文本被点击以后调用此回调函数。  例如， `onClick={() => console.log('onClick') }` | `Function`                                | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| ellipsizeMode* | 当设定了 `numberOfLines` 值后，这个参数指定了字符串如何被截断。所以在使用 `ellipsizeMode` 时，必须得同时指定 `numberOfLines` 数值。 `default: tail` | `enum(head, middle, tail, clip)` | `Android 仅支持 tail 属性，iOS 全支持、hippy-react-web(clip、ellipsis)、Web-Renderer(clip、ellipsis)、Voltron(tail、clip)` |
| onTouchDown  | 当用户开始在控件上按下手指时，将回调此函数，并将触屏点信息作为参数传递进来； 参数为 `nativeEvent: { name, page_x, page_y, id }`,  `page_x` 和 `page_y` 分别表示点击在屏幕内的绝对位置| `Function`                                | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| onTouchMove   | 当用户在控件移动手指时，此函数会持续收到回调，并通过event参数告知控件的触屏点信息；参数为 `nativeEvent: { name, page_x, page_y, id }`，`page_x` 和 `page_y` 分别表示点击在屏幕内的绝对位置 | `Function` | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| onTouchEnd    | 当触屏操作结束，用户在该控件上抬起手指时，此函数将被回调，event参数也会通知当前的触屏点信息；参数为 `nativeEvent: { name, page_x, page_y, id }`，`page_x` 和 `page_y` 分别表示点击在屏幕内的绝对位置 | `Function`                                | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| onTouchCancel | 当用户触屏过程中，某个系统事件中断了触屏，例如电话呼入、组件变化（如设置为hidden）、其他组件的滑动手势，此函数会收到回调，触屏点信息也会通过event参数告知前端；参数为 `nativeEvent: { name, page_x, page_y, id }`，`page_x` 和 `page_y` 分别表示点击在屏幕内的绝对位置 | `Function`                                | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| breakStrategy* | 设置Android API 23及以上系统的文本折行策略。`default: simple` | `enum(simple, high_quality, balanced)` | `Android(版本 2.14.2以上)` |

* ellipsizeMode 的参数含义：
  * `clip` - 超过指定行数的文字会被直接截断，不显示“...”；（Android 2.14.1以上、iOS）
  * `head` - 文字将会从头开始截断，保证字符串的最后的文字可以正常显示在 `Text` 组件的最后，而从开头给截断的文字，将以 “...” 代替，例如 “...wxyz”；（Android 2.14.1 以上、iOS全支持）
  * `middle` - "文字将会从中间开始截断，保证字符串的最后与最前的文字可以正常显示在Text组件的响应位置，而中间给截断的文字，将以 “...” 代替，例如 “ab...yz”；（Android 2.14.1 以上、iOS全支持）
  * `tail`（默认值） - 文字将会从最后开始截断，保证字符串的最前的文字可以正常显示在 Text 组件的最前，而从最后给截断的文字，将以 “...” 代替，例如 “abcd...”；
* breakStrategy 的参数含义：
  * `simple`（默认值）：简单折行，每一行显示尽可能多的字符，直到这一行不能显示更多字符时才进行换行，这种策略下不会自动折断单词（当一行只有一个单词并且宽度显示不下的情况下才会折断）；
  * `high_quality`：高质量折行，针对整段文本的折行进行布局优化，必要时会自动折断单词，比其他两种策略略微影响性能，通常比较适合只读文本；
  * `balanced`：平衡折行，尽可能保证一个段落的每一行的宽度相同，必要时会折断单词。


---

# View

[[View 范例]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/View)

最基础的容器组件，它是一个支持Flexbox布局、样式、一些触摸处理、和一些无障碍功能的容器，并且它可以放到其它的视图里，也可以有任意多个任意类型的子视图。不论在什么平台上，`View` 都会直接对应一个平台的原生视图。

!> Android 具有节点优化的特性，请注意 `collapsable` 属性的使用

## 属性

| 参数               | 描述                                                         | 类型                                 | 支持平台  |
| ------------------ | ------------------------------------------------------------ | ------------------------------------ | --------- |
| accessible         | 当此属性为 `true` 时，表示此视图时一个启用了无障碍功能的元素。启用无障碍的其他属性时，必须优先设置 `accessible` 为 `true`。 | `boolean` | `Android、iOS、hippy-react-web` |
| accessibilityLabel | 设置当用户与此元素交互时，“读屏器”（对视力障碍人士的辅助功能）阅读的文字。默认情况下，这个文字会通过遍历所有的子元素并累加所有的文本标签来构建。 | `string`                               | `Android、iOS、hippy-react-web` |
| collapsable        | Android 里如果一个 `View` 只用于布局它的子组件，则它可能会为了优化而从原生布局树中移除，因此该节点 DOM 的引用会丢失 `（比如调用 measureInAppWindow 无法获取到大小和位置信息）`。 把此属性设为 `false` 可以禁用这个优化，以确保对应视图在原生结构中存在。`（Android 2.14.1 版本后支持在 Attribute 设置，以前版本请在 Style 属性里设置)` | `boolean`                            | `Android、Voltron` |
| style              | -                                                            | [`View Styles`](api/style/layout.md) | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| opacity            | 配置 `View` 的透明度，同时会影响子节点的透明度               | `number`                             | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| overflow           | 指定当子节点内容溢出其父级 `View` 容器时, 是否剪辑内容       | `enum(visible, hidden)`         | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| nativeBackgroundAndroid    | 配置水波纹效果，`最低支持版本 2.13.1`；配置项为 `{ borderless: boolean, color: Color, rippleRadius: number }`； `borderless` 表示波纹是否有边界，默认 false；`color` 波纹颜色；`rippleRadius` 波纹半径，若不设置，默认容器边框为边界； `注意：设置水波纹后默认不显示，需要在对应触摸事件中调用 setPressed 和 setHotspot 方法进行水波纹展示，详情参考相关`[demo](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/RippleViewAndroid/index.jsx) | `Object`| `Android`    |
| onLayout           | 当元素挂载或者布局改变的时候调用，参数为： `nativeEvent: { layout: { x, y, width, height } }`，其中 `x` 和 `y` 为相对父元素的坐标位置。 | `Function`                           | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| onAttachedToWindow           | 这个事件会在节点已经渲染并且添加到容器组件中触发，因为 Hippy 的渲染是异步的，这是很稳妥的执行后续操作的事件。 | `Function`                           | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| onTouchDown  | 当用户开始在控件上按下手指时，将回调此函数，并将触屏点信息作为参数传递进来； 参数为 `nativeEvent: { name, page_x, page_y, id }`,  `page_x` 和 `page_y` 分别表示点击在屏幕内的绝对位置| `Function`                                | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| onTouchMove   | 当用户在控件移动手指时，此函数会持续收到回调，并通过event参数告知控件的触屏点信息；参数为 `nativeEvent: { name, page_x, page_y, id }`，`page_x` 和 `page_y` 分别表示点击在屏幕内的绝对位置 | `Function` | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| onTouchEnd    | 当触屏操作结束，用户在该控件上抬起手指时，此函数将被回调，event参数也会通知当前的触屏点信息；参数为 `nativeEvent: { name, page_x, page_y, id }`，`page_x` 和 `page_y` 分别表示点击在屏幕内的绝对位置 | `Function`                                | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| onTouchCancel | 当用户触屏过程中，某个系统事件中断了触屏，例如电话呼入、组件变化（如设置为hidden）、其他组件的滑动手势，此函数会收到回调，触屏点信息也会通过event参数告知前端；参数为 `nativeEvent: { name, page_x, page_y, id }`，`page_x` 和 `page_y` 分别表示点击在屏幕内的绝对位置 | `Function`                                | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |


## 方法

### setPressed

[[setPressed 范例]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/RippleViewAndroid/RippleViewAndroid.jsx)

`最低支持版本 2.13.1。hippy-react-web、Web-Renderer 不支持`

`(pressed: boolean) => void` 通过传入一个布尔值，通知终端当前是否需要显示水波纹效果

> * pressed: boolean - true 显示水波纹，false 收起水波纹

### setHotspot

[[setHotspot 范例]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/RippleViewAndroid/RippleViewAndroid.jsx)

`最低支持版本 2.13.1 hippy-react-web、Web-Renderer 不支持`

`(x: number, y: number) => void` 通过传入一个 `x, y` 坐标值，通知终端设置当前波纹中心位置

---

# ViewPager

[[ViewPager 范例]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/ViewPager)

支持横滑翻页的容器，它的每一个子容器组件会被视作一个单独的页面，并且会被拉伸宽度至 `ViewPager` 本身宽度。

## 参数

| 参数                     | 描述                                                         | 类型                                         | 支持平台 |
| ------------------------ | ------------------------------------------------------------ | -------------------------------------------- | -------- |
| bounces | 是否开启回弹效果，默认 `true` | `boolean`                                                  | `iOS、Voltron`    |
| initialPage              | 指定一个数字，用于决定初始化后默认显示的页面 index，默认不指定的时候是0 | `number`                                     | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| scrollEnabled            | 指定 ViewPager 是否可以滑动，默认为 `true`                        | `boolean`                                    | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| onPageSelected           | 指定一个函数，当 page 被选中时进行回调。回调参数是一个 event 对象，回调参数： `position: number` - 表示即将滑到的目标 page 的索引 | `(obj: {position: number}) => void`      | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| onPageScroll             | 指定一个函数，当 page 被滑动时进行回调。回调参数是一个 event 对象，回调参数 `position: number` - 表示即将滑到的目标 page 的索引，`offset: number` - 当前被选中的 page 的相对位移，取值范围 -1 到 1 | `(obj: {position: number, offset: number}) => void` | `Android、iOS、Web-Renderer、Voltron`    |
| onPageScrollStateChanged | 指定一个函数，当 page 的滑动状态改变时进行回调。回调参数： `pageScrollState: string` - 改变后的状态，`idle` 表示停止，`dragging` 表示用户用手拖拽，`settling` 表示 page 正在滑动 | `(pageScrollState: string) => void`          | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| direction | 设置 viewPager 滚动方向，不设置默认横向滚动，设置 `vertical` 为竖向滚动 | `string`          | `Android、hippy-react-web、Voltron` |

## 方法

### setPage

`(index: number) => void` 通过传入一个index 值（数字），滑动到第 index 个页面（有动画）

> * index: number - 指定滑动页面

### setPageWithoutAnimation

`(index: number) => void` 通过传入一个index 值（数字），滑动到第 index 个页面（无动画）

> * index: number - 指定滑动页面

---

# WaterfallView

> 最低支持版本 2.9.0。hippy-react-web 不支持

[[WaterfallView 范例]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/WaterfallView)

瀑布流组件。

## 参数

| 参数                  | 描述                                                         | 类型                                                        | 支持平台 |
| --------------------- | ------------------------------------------------------------ | ----------------------------------------------------------- | ------------------ |
| numberOfColumns | 瀑布流列数量 ， `Default: 2` | `number` | `Android、iOS、Voltron` |
| numberOfItems | 瀑布流 item 总个数 | `number` | `Android、iOS、Voltron、`|
| columnSpacing     | 瀑布流每列之前的水平间距  | `number`   | `Android、iOS、Voltron`    |
| interItemSpacing  | item 间的垂直间距  | `number`   | `Android、iOS、Voltron`  |
| contentInset      | 内容缩进 ，默认值 `{ top:0, left:0, bottom:0, right:0 }`  | `Object`   | `Android、iOS、Voltron`   |
| renderItem             | 这里的入参是当前 item 的 index，在这里可以凭借 index 获取到瀑布流一个具体单元格的数据，从而决定如何渲染这个单元格。 | `(index: number) => React.ReactElement`                                   | `Android、iOS、Voltron`    |
| renderBanner | 如何渲染 Banner。 | `() => React.ReactElement` |  `Android、iOS、Voltron`
| getItemStyle           | 设置`WaterfallItem`容器的样式。  | `(index: number) => styleObject`                                    | `Android、iOS、Voltron`    |
| getItemType            | 指定一个函数，在其中返回对应条目的类型（返回Number类型的自然数，默认是0），List 将对同类型条目进行复用，所以合理的类型拆分，可以很好地提升list 性能。 | `(index: number) => number`                                    | `Android、iOS、Voltron`    |
| getItemKey             | 指定一个函数，在其中返回对应条目的 Key 值，详见 [React 官文](//reactjs.org/docs/lists-and-keys.html) | `(index: number) => any`                                    | `Android、iOS、Voltron`    |
| preloadItemNumber     | 滑动到瀑布流底部前提前预加载的 item 数量 | `number` | `Android、iOS、Voltron` |
| onEndReached          | 当所有的数据都已经渲染过，并且列表被滚动到最后一条时，将触发 `onEndReached` 回调。 | `Function`                                                  | `Android、iOS、Voltron`    |
| renderPullHeader | 如何渲染 `PullHeader`，此时 `containPullHeader` 默认设置成 `true` |  `() => React.ReactElement` | `Android、iOS、Voltron`    |
| renderPullFooter | 如何渲染 `PullFooter`，此时 `containPullFooter` 默认设置成 `true` |  `() => React.ReactElement` | `Android、iOS、Voltron` |
| onScroll              | 当触发 `WaterFall` 的滑动事件时回调。`startEdgePos`表示距离 List 顶部边缘滚动偏移量；`endEdgePos`表示距离 List 底部边缘滚动偏移量；`firstVisibleRowIndex`表示当前可见区域内第一个元素的索引；`lastVisibleRowIndex`表示当前可见区域内最后一个元素的索引；`visibleRowFrames`表示当前可见区域内所有 item 的信息(x，y，width，height)    | `nativeEvent: { startEdgePos: number, endEdgePos: number, firstVisibleRowIndex: number, lastVisibleRowIndex: number, visibleRowFrames: Object[] }` | `Android、iOS、Voltron`

## 方法

### scrollToIndex

`(obj: { index: number, animated: boolean }) => void` 通知 Waterfall 滑动到第几个 item。

> * `index`: number - 滑动到的第 index 个 item
> * `animated`: boolean - 滑动过程是否使用动画, 默认 `true`

### scrollToContentOffset

`(obj: { xOffset: number, yOffset: number, animated: boolean }) => void` 通知 Waterfall 滑动到某个具体坐标偏移值(offset)的位置。

> * `xOffset`: number - 滑动到 X 方向的 offset
> * `yOffset`: number - 滑动到 Y 方向的 offset
> * `animated`: boolean - 滑动过程是否使用动画，默认 `true`

---

# WebView

[[WebView 范例]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/WebView/index.jsx)

WebView组件。

## 参数

| 参数                  | 描述                                                         | 类型                                                        | 支持平台 |
| --------------------- | ------------------------------------------------------------ | ----------------------------------------------------------- | -------- |
| source | Webview 内嵌地址 | `{ uri: string }` | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| userAgent | Webview userAgent | `string` | `Android、iOS、Voltron`|
| method     | 请求方式， `get`、`post` | `string`   | `Android、iOS`    |
| onLoadStart  | 网页开始加载时触发 | `(object: { url: string }) => void`   | `Android、iOS、Web-Renderer、Voltron`  |
| onLoad  | 网页加载时触发  | `(object: { url: string }) => void`   | `Android、iOS、Web-Renderer、Voltron`  |
| onLoadEnd  | 网页加载结束时触发 (`success`与`error`参数仅`Android`、`iOS`上可用，最低支持版本`2.15.3`) | `(object: { url: string, success: boolean, error: string }) => void` | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
| style  | Webview 容器样式  | `Object`   | `Android、iOS、hippy-react-web、Web-Renderer、Voltron` |
