<!-- markdownlint-disable no-duplicate-header -->

# 组件

hippy-react 的组件接近终端，语法上接近 React Native。

# Image

[[Image 范例]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/Image)

图片组件，用于显示单张图片。

> **注意：** 必须指定样式中的宽度和高度，否则无法工作。

## 基本用法

直接加载远程图片：

```jsx
<Image
  style={{ width: 200, height: 200 }}
  source={{ uri: 'http://res.imtt.qq.com/flower-h5/qb_icon_new.png' }}
  resizeMode={Image.resizeMode.cover}
/>;
```

或者使用终端的本地图片加载能力：

```jsx
import icon from './qb_icon_new.png';

<Image
  style={{ width: 200, height: 200 }}
  source={{ uri: icon }}
  resizeMode={Image.resizeMode.cover}
/>
```

本地图片还有另外一种形式：通过 base64 图片引用进来也可以支持，直接通过[加载时定义 Loader](//webpack.js.org/concepts/loaders/#inline)，用 `url-loader` 加载即可。

## 参数

| 参数          | 描述                                                         | 类型                                                         | 支持平台 |
| ------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------- |
| onLayout      | 当元素挂载或者布局改变的时候调用，参数为： `{ nativeEvent: { layout: { x, y, width, height } } }`。 | `Function`                                                   | `ALL`    |
| onLoad        | 加载成功完成时调用此回调函数。                               | `Function`                                                   | `ALL`    |
| onLoadStart   | 加载开始时调用。 例如, `onLoadStart={(e) => this.setState({ loading: true })}` | `Function`                                                   | `ALL`    |
| onLoadEnd     | 加载结束后，不论成功还是失败，调用此回调函数。               | `Function`                                                   | `ALL`    |
| resizeMode    | 决定当组件尺寸和图片尺寸不成比例的时候如何调整图片的大小。   |  `enum`(cover, contain, stretch, repeat, center) | `ALL`    |
| source        | uri是一个表示图片的资源标识的字符串，需要用http路径。  现在支持的图片格式有 `png` , `jpg` , `jpeg` , `bmp` , `gif` 。 | `{ uri: string }`                                            | `ALL`    |
| defaultSource | 指定当 `Image` 组件还没加载出来 `source` 属性指定的图片的占位符图片，当 `source` 属性指定的图片加载失败时， `Image` 组件会显示 `defaultSource` 属性指定的图片 | `string`:图片 base64 字符串                                     | `ALL`    |
| onError       | 当加载错误的时候调用此回调函数，参数为 `{ nativeEvent: { error } }` | `Function`                                                   | `ALL`    |
| capInsets     | 当调整 `Image` 大小的时候，由 `capInsets` 指定的边角尺寸会被固定而不进行缩放，而中间和边上其他的部分则会被拉伸。这在制作一些可变大小的圆角按钮、阴影、以及其它资源的时候非常有用。 | `{ top: number, left: number, bottom: number, right: number }` | `ALL`    |
| onProgress    | 在加载过程中不断调用，参数为 `{ nativeEvent: { loaded, total } }` | `Function`                                                   |      `ALL`     |

## 方法

### getSize

`(uri: string, success: (width: number, height: number) => void, failure?: ErrorFunction) => void` 在显示图片前获取图片的宽高(以像素为单位)。如果图片地址不正确或下载失败, 此方法也会失败。

要获取图片的尺寸, 首先需要加载或下载图片(同时会被缓存起来)。这意味着理论上你可以用这个方法来预加载图片，虽然此方法并没有针对这一用法进行优化，而且将来可能会换一些实现方案使得并不需要完整下载图片即可获取尺寸。所以更好的预加载方案是使用下面那个专门的预加载方法。

*不适用于静态图片资源。*

> * `uri`: string - 图片的地址
> * `success`: (width: number, height: number) => void - 此函数会在获取图片与其宽高成功后被回调
> * `failure`: ErrorFunction - 此函数会在如获取图片失败等异常情况被回调

### prefetch

`(url: string) => void` 预加载一个远程图片，将其下载到本地磁盘缓存。

> * `uri`: string - 图片的地址

# ListView

[[ListView 范例]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/ListView)

可复用垂直列表功能，尤其适合大量条目的数据渲染。

## 参数

| 参数                  | 描述                                                         | 类型                                                        | 支持平台 |
| --------------------- | ------------------------------------------------------------ | ----------------------------------------------------------- | -------- |
| initialListSize       | 指定在组件刚挂载的时候渲染多少行数据。用这个属性来确保首屏显示合适数量的数据，而不是花费太多帧时间逐步显示出来。 | `number`                                                    | `ALL`    |
| numberOfRows          | 指定列表的行数，一般直接传入数据源条数 `length` 即可。       | `number`                                                    | `ALL`    |
| initialContentOffset  | 初始位移值 -- 在列表初始化时即可指定滚动距离，避免初始化后再通过 scrollTo 系列方法产生的闪动。 | `number`                                                    | `ALL`    |
| renderRow             | 这里的入参是当前row 的index，在这里可以凭借index 获取到具体这一行单元格的数据，从而决定如何渲染这个单元格。 | `(index: number) => Node`                                   | `ALL`    |
| getRowStyle           | -                                                            | `(index: number) => any`                                    | `ALL`    |
| getRowType            | 指定一个函数，在其中返回对应条目的类型（返回Number类型的自然数，默认是0），List 将对同类型条目进行复用，所以合理的类型拆分，可以很好地提升list 性能。 | `(index: number) => any`                                    | `ALL`    |
| getRowKey             | 指定一个函数，在其中返回对应条目的 Key 值，详见 [React 官文](//reactjs.org/docs/lists-and-keys.html) | `(index: number) => any`                                    | `ALL`    |
| onEndReached          | 当所有的数据都已经渲染过，并且列表被滚动到最后一条时，将触发 `onEndReached` 回调。 | `Function`                                                  | `ALL`    |
| onMomentumScrollBegin | 在 `ListView` 开始滑动的时候调起                           | `Function`                                                  | `ALL`    |
| onMomentumScrollEnd   | 在 `ListView` 结束滑动的时候调起                           | `Function`                                                  | `ALL`    |
| onScroll              | 当触发 `ListView` 的滑动事件时回调，在 `ListView` 滑动时回调，因此调用会非常频繁，请使用 `scrollEventThrottle` 进行频率控制。 注意：ListView 在滚动时会进行组件回收，不要在滚动时对 renderRow() 生成的 ListItemView 做任何 ref 节点级的操作（例如：所有 callUIFunction 和 measureInWindow 方法），回收后的节点将无法再进行操作而报错。 | `(obj: { contentOffset: { x: number, y: number } }) => any` | `ALL`    |
| onScrollBeginDrag     | 当用户开始拖拽 `ListView` 时调用。                         | `Function`                                                  | `ALL`    |
| onScrollEndDrag       | 当用户停止拖拽 `ListView` 或者放手让 `ListView` 开始滑动的时候调用 | `Function`                                                  | `ALL`    |
| scrollEventThrottle   | 指定滑动事件的回调频率，传入数值指定了多少毫秒(ms)组件会调用一次 `onScroll` 回调事件 | `number`                                                    | `ALL`    |
| rowShouldSticky       | 在回调函数，根据传入参数index（ListView单元格的index）返回true或false指定对应的item是否需要使用悬停效果（滚动到顶部时，会悬停在List顶部，不会滚出屏幕） | `(index: number) => boolean`                                | `ALL`    |
| showScrollIndicator   | 是否显示垂直滚动条。 因为目前 ListView 其实仅有垂直滚动一种方向，水平滚动会导致 `onEndReached` 等一堆问题暂不建议使用，所以 `showScrollIndicator` 也仅用来控制是否显示垂直滚动条。 | `boolean`                                                   | `ALL`    |

## 方法

### scrollToContentOffset

`(xOffset: number, yOffset: number: animated: boolean) => void` 通知 ListView 滑动到某个具体坐标偏移值(offset)的位置。

> * `xOffset`: number - 滑动到 X 方向的 offset
> * `yOffset`: numbere - 滑动到 Y 方向的 offset
> * `animated`: boolean - 滑动过程是否使用动画

### scrollToIndex

`(xIndex: number, yIndex: number: animated: boolean) => void` 通知 ListView 滑动到第几个 item。

> * `xIndex`: number - 滑动到 X 方向的第 xIndex 个 item
> * `yIndex`: numbere - 滑动到 Y 方向的 xIndex 个 item
> * `animated`: boolean - 滑动过程是否使用动画

# Modal

[[Modal 范例]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/Modal)

模态弹窗组件。

## 参数

| 参数                  | 描述                                                         | 类型                                                         | 支持平台 |
| --------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------- |
| animated              | -                                                            | `boolean`                                                    | `ALL`    |
| animationType         | -                                                            | `enum`(none, slide, fade, slide_fade) | `ALL`    |
| supportedOrientations | -                                                            | `enum`(portrait, portrait-upside-down, landscape, landscape-left, landscape-right)[] | `ALL`    |
| immersionStatusBar    | 是否是沉浸式状态栏。                                         | `boolean`                                                    | `ALL`    |
| darkStatusBarText     | 是否是亮色主体文字，默认字体是黑色的，改成 true 后会认为 Modal 背景为暗色调，字体就会改成白色。 | `boolean`                                                    | `ALL`    |
| onShow                | 在`Modal`显示时会执行此回调函数。                            | `Function`                                                   | `ALL`    |
| onOrientationChange   | -                                                            | `Function`                                                   | `ALL`    |
| onRequestClose        | 在`Modal`请求关闭时会执行此回调函数，一般时在 Android 系统里按下硬件返回按钮时触发，一般要在里面处理关闭弹窗。 | `Function`                                                   | `ALL`    |
| primaryKey            | -                                                            | `string`                                                     | `iOS`    |
| onDismiss             | -                                                            | `Function`                                                   | `iOS`    |
| transparent           | -                                                            | `boolean`                                                    | `ALL`    |
| visible               | -                                                            | `boolean`                                                    | `ALL`    |

# Navigator

导航容器。通过这个组件，你可以实现一个app页面的导航、跳转等功能。

> 该组件通过启动一个新的 Hippy 实例实现，在 2.0 下实例之间可能无法互相通信，iOS 上也必须作为根节点包裹所有子组件，使用有很大限制。

## 参数

| 参数                   | 描述                                                         | 类型          | 支持平台 |
| ---------------------- | ------------------------------------------------------------ | ------------- | -------- |
| initialRoute           | `Navigator` 初始化首页面的参数，需要传入`routeName`, `component` 和`initProps` 三个属性 | `Object`      | `ALL`    |
| initialRoute.routeName | 指定页面的路由名字                                           | `string`      | `ALL`    |
| initialRoute.component | 传入一个 `React Component`，`Navigator` 路由到此页面就可以渲染此 `component` | `React Component` | `ALL`    |
| initialRoute.initProps | 初始化当前路由页面的 `props`为透传参数，可以在此路由页面的 `component` 使用 `this.props` 获取 | `Object`  | `ALL`    |
| initialRoute.animated  | 指定切换的时候是否有动画效果，默认值为 false                 | `boolean`     | `ALL`    |

## 方法

### clear

`() => void` 清空 Navigator 的历史栈

### getCurrentPage

`() => Object` 获取当前 Navigator 的页面，会返回 routeName , component 和 initProps 等属性值

### pop

`(options: Object) => void` 在 Navigator 返回上一个页面

> * options: Object
>   * toDirection: left | right | top | bottom - 自定义页面pop 的方向

### push

`(options: Object) => void` 进入一个新的页面

> * options: Object
>   * routeName: string - 路由名称
>   * component: ReactComponent - 新页面组件
>   * initProps: Object - 初始化参数
>   * toDirection: left | right | top | bottom - 自定义页面pop 的方向

# RefreshWrapper

[[RefreshWrapper 范例]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/RefreshWrapper)

包裹住 `ListView` 提供下滑刷新功能的组件.

> `RefreshWrapper` 现在只支持包裹一个 `ListView` 组件，暂不支持别的组件的下滑刷新功能。

## 参数

| 参数       | 描述                                                 | 类型       | 支持平台 |
| ---------- | ---------------------------------------------------- | ---------- | -------- |
| onRefresh  | 当`RefreshWrapper`执行刷新操作时，会触发到此回调函数 | `Function` | `ALL`    |
| getRefresh | 定义刷新栏的视图表现，返回 `View`， `Text` 等组件。  | `Function` | `ALL`    |
| bounceTime | 指定刷新条收回动画的时长，单位为ms                   | `number`   | `ALL`    |

## 方法

### refreshCompleted

`() => void` 调用此方法，告知 RefreshWrapper 已经刷新完毕，RefreshWrapper 将会收起刷新栏。

### startRefresh

`() => void` 调用此方法，手工告知 RefreshWrapper 开始刷新，展开刷新栏。

# ScrollView

[[Scroll 范例]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/ScrollView)

滚动视图组件，用于展示不确定高度的内容，它可以将一系列不确定高度的子组件装到一个确定高度的容器中，使用者可通过上下或左右滚动操作查看组件宽高之外的内容。

一个包装了平台的 `ScrollView`（滚动视图）的组件，同时还集成了触摸锁定的“响应者”系统。

> **注意：**记住 ScrollView 必须有一个确定的高度才能正常工作，因为它实际上所做的就是将一系列不确定高度的子组件装进一个确定高度的容器（通过滚动操作）。要给一个 ScrollView 确定一个高度的话，要么直接给它设置高度（不建议），要么确定所有的父容器都有确定的高度。一般来说我们会给 ScrollView 设置 `flex: 1` 以使其自动填充父容器的空余空间，但前提条件是所有的父容器本身也设置了flex或者指定了高度，否则就会导致无法正常滚动，你可以使用元素查看器来查找问题的原因。

> **注意：** ScrollView 无法使用 onTouch 系列事件监听触屏行为，但可以用 onScroll 监听滚动行为。

## 参数

| 参数                           | 描述                                                         | 类型                                                         | 支持平台 |
| ------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | -------- |
| contentContainerStyle          | 这些样式会应用到一个内层的内容容器上，所有的子视图都会包裹在内容容器内。 | `StyleSheet`                                                 | `ALL`    |
| onMomentumScrollBegin          | 在 `ScrollView` 滑动开始的时候调起。                         | `Function`                                                   | `ALL`    |
| onMomentumScrollEnd            | 在 `ScrollView` 滑动结束的时候调起。                         | `Function`                                                   | `ALL`    |
| onScroll                       | 在滚动的过程中，每帧最多调用一次此回调函数。                 | `Function`                                                   | `ALL`    |
| onScrollBeginDrag              | 当用户开始拖拽 `ScrollView` 时调用。                         | `Function`                                                   | `ALL`    |
| onScrollEndDrag                | 当用户停止拖拽 `ScrollView` 或者放手让 `ScrollView` 开始滑动的时候调用。 | `Function`                                                   | `ALL`    |
| scrollEventThrottle            | 指定滑动事件的回调频率，传入数值指定了多少毫秒(ms)组件会调用一次 `onScroll` 回调事件。 | `number`                                                     | `ALL`    |
| scrollIndicatorInsets          | 决定滚动条距离视图边缘的坐标。这个值应该和contentInset一样。 | `{ top: number, left: number, bottom: number, right: number }` | `ALL`    |
| pagingEnabled                  | 当值为 `true` 时，滚动条会停在滚动视图的尺寸的整数倍位置。这个可以用在水平分页上。 | `boolean`                                                    | `ALL`    |
| scrollEnabled                  | 当值为 `false` 的时候，内容不能滚动。                        | `boolean`                                                    | `ALL`    |
| horizontal                     | 当此属性为 `true` 的时候，所有的子视图会在水平方向上排成一行，而不是默认的在垂直方向上排成一列 | `boolean`                                                    | `ALL`    |
| showsHorizontalScrollIndicator | 当此值设为 `true` 的时候，`ScrollView` 会显示一个水平的滚动条。 | `boolean`                                                    | `ALL`    |
| showsVerticalScrollIndicator   | 当此值设为 `true` 的时候，`ScrollView` 会显示一个垂直的滚动条。 | `boolean`                                                    | `ALL`    |

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
> * duration: number - 毫秒为单位的滚动时间

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

|                       |                                                              |                                                              |           |
| --------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | --------- |
| 参数                  | 描述                                                         | 类型                                                         | 支持平台  |
| defaultValue          | 提供一个文本框中的初始值。当用户开始输入的时候，值就可以改变。  在一些简单的使用情形下，如果你不想用监听消息然后更新 value 属性的方法来保持属性和状态同步的时候，就可以用 defaultValue 来代替。 | `string`                                                     | `ALL`     |
| editable              | 如果为 false，文本框是不可编辑的。                           | `boolean`                                                    | `ALL`     |
| keyboardType          | 决定弹出的何种软键盘的。 注意，`password`仅在属性 `multiline=false` 单行文本框时生效。 | `enum`(default, numeric, password, email, phone-pad) | `ALL`     |
| maxLength             | 限制文本框中最多的字符数。使用这个属性而不用JS 逻辑去实现，可以避免闪烁的现象。 | `numbers`                                                    | `ALL`     |
| multiline             | 如果为 `true` ，文本框中可以输入多行文字。 由于终端特性。    | `boolean`                                                    | `ALL`     |
| numberOfLines         | 设置 `TextInput` 的最大行数，在使用的时候必需同时设置 `multiline` 参数为 `true`。 | `number`                                                     | `ALL`     |
| onBlur                | 当文本框失去焦点的时候调用此回调函数。                       | `Function`                                                   | `ALL`     |
| onChangeText          | 当文本框内容变化时调用此回调函数。改变后的文字内容会作为参数传递。 | `Function`                                                   | `ALL`     |
| onKeyboardWillShow    | 在弹出输入法键盘时候会触发此回调函数，返回值包含键盘高度 `keyboardHeight`，样式如 `{ keyboardHeight: 260}`。仅在 `iOS` 可用，`Android` 输入法不会遮挡App画面 | `Function`                                                   | `iOS`     |
| onEndEditing          | 当文本输入结束后调用此回调函数。                             | `Function`                                                   | `ALL`     |
| onLayout              | 当组件挂载或者布局变化的时候调用，参数为`{ x, y, width, height }`。 | `Function`                                                   | `ALL`     |
| onSelectionChange     | 当输入框选择文字的范围被改变时调用。返回参数的样式如 `{ nativeEvent: { selection: { start, end } } }`。 | `Function`                                                   | `ALL`     |
| placeholder           | 如果没有任何文字输入，会显示此字符串。                       | `string`                                                     | `ALL`     |
| placeholderTextColor  | 占位字符串显示的文字颜色。                                   | [`color`](style/color.md)                                | `ALL`     |
| placeholderTextColors | -                                                            | [`color`](style/color.md)                                | `ALL`     |
| returnKeyType         | 指定软键盘的回车键显示的样式。                               | `enum`(done, go, next, search, send)              | `ALL`     |
| underlineColorAndroid | `TextInput` 下底线的颜色。 可以设置为'transparent'来去掉下底线。 | `string`                                                     | `Android` |
| value                 | 指定 `TextInput` 组件的值。                                  | `string`                                                     | `ALL`     |
| autoFocus             | 组件渲染时自动获得焦点。                                       | `boolean`                                                    | `ALL`     |

## 方法

### blur

`() => void` 让指定的 input 或 View 组件失去光标焦点，与 focus() 的作用相反。

### clear

`() => void` 清空输入框的内容。

### focus

`() => void` 指派 TextInput 获得焦点。

### getValue

`() => Promise<string>` 获得文本框中的内容。

### hideInputMethod

`() => void` 隐藏软键盘。

### setValue

`(value: string) => void` 设置文本框内容。

> * value: string - 文本框内容

### showInputMethod

`() => void` 显示软键盘。

# Text

[[Text 范例]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/Text)

文本组件，但不支持嵌套。

## 注意事项

需要注意的是，在 `<Text>` 中拼接字符串时，推荐使用 ES6 的[模板字符串](//developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)：

```jsx
<Text>{ `现在时间是 ${new Date().toString()}` }</Text> // ✅
```

而不是

```jsx
<Text>现在时间是 { new Date().toString() }</Text> // ❌
```

后者有可能在数据更新时不会更新界面。

## 属性

| 参数          | 描述                                                         | 类型                                      | 支持平台 |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| numberOfLines | 用来当文本过长的时候裁剪文本。包括折叠产生的换行在内，总的行数不会超过这个属性的限制。 | `number`                                  | `ALL`    |
| opacity       | 配置 `View` 的透明度，同时会影响子节点的透明度。             | `number`                                  | `ALL`    |
| onLayout      | 当元素挂载或者布局改变的时候调用，参数为： `{ nativeEvent: { layout: { x, y, width, height } } }`。 | `Function`                                | `ALL`    |
| onClick       | 当文本被点击以后调用此回调函数。  例如， `onClick={() => console.log('onClick') }` | `Function`                                | `ALL`    |
| ellipsizeMode* | 当设定了 `numberOfLines` 值后，这个参数指定了字符串如何被截断。所以，在使用 `ellipsizeMode` 时，必须得同时指定 `numberOfLines` 数值。 | `enum`(head, middle, tail, clip)| `ALL`    |

* ellipsizeMode 的参数含义：
  * `head` - 文字将会从头开始截断，保证字符串的最后的文字可以正常显示在 `Text` 组件的最后，而从开头给截断的文字，将以 “...” 代替，例如 “...wxyz”；
  * `middle` - "文字将会从中间开始截断，保证字符串的最后与最前的文字可以正常显示在Text组件的响应位置，而中间给截断的文字，将以 “...” 代替，例如 “ab...yz”
  * `tail` - 文字将会从最后开始截断，保证字符串的最前的文字可以正常显示在 Text 组件的最前，而从最后给截断的文字，将以 “...” 代替，例如 “abcd...”；
  * `clip` - 超过指定行数的文字会被直接截断，不显示“...”，

# View

[[View 范例]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/View)

最基础的容器组件，它是一个支持Flexbox布局、样式、一些触摸处理、和一些无障碍功能的容器，并且它可以放到其它的视图里，也可以有任意多个任意类型的子视图。不论在什么平台上，`View` 都会直接对应一个平台的原生视图。

## 属性

| 参数               | 描述                                                         | 类型                                 | 支持平台  |
| ------------------ | ------------------------------------------------------------ | ------------------------------------ | --------- |
| accessibilityLabel | 设置当用户与此元素交互时，“读屏器”（对视力障碍人士的辅助功能）阅读的文字。默认情况下，这个文字会通过遍历所有的子元素并累加所有的文本标签来构建。 | `node`                               | `ALL`     |
| onLayout           | 这个事件会在布局计算完成后立即调用一次，不过收到此事件时新的布局可能还没有在屏幕上呈现，尤其是一个布局动画正在进行中的时候。 | `Function`                           | `ALL`     |
| accessible         | 当此属性为 `true` 时，表示此视图时一个启用了无障碍功能的元素。默认情况下，所有可触摸操作的元素都是无障碍功能元素。 | `boolean`                            | `ALL`     |
| style              | -                                                            | [`View Styles`](style/layout.md) | `ALL`     |
| collapsable        | 如果一个 `View` 只用于布局它的子组件，则它可能会为了优化而从原生布局树中移除。 把此属性设为 `false` 可以禁用这个优化，以确保对应视图在原生结构中存在。 | `boolean`                            | `Android` |
| opacity            | 配置 `View` 的透明度，同时会影响子节点的透明度               | `number`                             | `ALL`     |
| overflow           | 指定当子节点内容溢出其父级 `View` 容器时, 是否剪辑内容       | `enum`(visible, hidden)         | `ALL`     |

# ViewPager

[[ViewPager 范例]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/ViewPager)

支持横滑翻页的容器，它的每一个子容器组件会被视作一个单独的页面，并且会被拉伸宽度至 `ViewPager` 本身宽度。

## 参数

| 参数                     | 描述                                                         | 类型                                         | 支持平台 |
| ------------------------ | ------------------------------------------------------------ | -------------------------------------------- | -------- |
| initialPage              | 指定一个数字，用于决定初始化后默认显示的页面index，默认不指定的时候是0 | `number`                                     | `ALL`    |
| scrollEnabled            | 指定ViewPager是否可以滑动，默认为true                        | `boolean`                                    | `ALL`    |
| onPageSelected           | 指定一个函数，当page被选中时进行回调，回调参数是一个对象event，包括position值 回调参数： `position`: number -当前被选中的page的index | `(position: number) => void`                 | `ALL`    |
| onPageScroll             | 指定一个函数，当page被滑动时进行回调，回调参数是一个对象event，包括position值与offset值 回调参数： `position`: number -即将滑到的目标page的index `offset`: number -当前被选中的page的相对位移，取值范围-1到1 | `(position: number, offset: number) => void` | `ALL`    |
| onPageScrollStateChanged | 指定一个函数，当page的滑动状态改变时进行回调 回调参数： `pageScrollState`: string -改变后的状态，idle表示停止，dragging表示用户用手拖拽，settling表示page正在滑动 | `(pageScrollState: string) => void`          | `ALL`    |

## 方法

### setPage

`(index: number) => void` 通过传入一个index 值（数字），滑动到第 index 个页面（有动画）

> * index: number - 指定滑动页面

### setPageWithoutAnimation

`(index: number) => void` 通过传入一个index 值（数字），滑动到第 index 个页面（无动画）

> * index: number - 指定滑动页面
