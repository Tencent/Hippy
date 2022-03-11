<!-- markdownlint-disable no-duplicate-header -->
# 转 Web

hippy-react 通过 [@hippy/react-web](//www.npmjs.com/package/@hippy/react-web) 库来将 Hippy 应用转译、运行在浏览器中。

> 该项目仍在开发中，有不完善的地方，欢迎 PR。

# 安装运行时依赖

请使用 `npm i` 安装以下 npm 包，保证转 Web 运行时正常。

| 包名            | 说明                              |
| --------------- | --------------------------------- |
| react       | react 版本 >= v16.8.0      |
| bezier-easing   | hippy-react 动画在 Web 运行时需要   |
| hippy-react-web | hippy-react 转 Web 适配器          |
| react-dom       | react 的 Web 的渲染器              |
| animated-scroll-to | scroll 的时候添加动画            |
| swiper          | ViewPager 需要                    |
| rmc-list-view   | ListView 需要                     |
| rmc-pull-to-refresh | ListView PullHeader 需要      |



# 组件支持

## Image

[[Image 范例]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/Image)

图片组件，用于显示单张图片。

> * 注意： 必须指定样式中的宽度和高度，否则无法工作。
> * 注意： Android 端默认会带上灰底色用于图片占位，可以加上 `backgroundColor: transparent` 样式改为透明背景。


### 不支持的参数

| 参数          | 描述                                                         | 类型                                                         | 支持平台 |
| ------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------- |
| capInsets     | 当调整 `Image` 大小的时候，由 `capInsets` 指定的边角尺寸会被固定而不进行缩放，而中间和边上其他的部分则会被拉伸。这在制作一些可变大小的圆角按钮、阴影、以及其它资源的时候非常有用。 | `{ top: number, left: number, bottom: number, right: number }` | `web 暂不支持`    |
| onProgress    | 在加载过程中不断调用，参数为 `{ nativeEvent: { loaded, total } }` | `Function`         |   `web 暂不支持`  |

### 方法

#### getSize

`web 暂不支持`

`(uri: string, success: (width: number, height: number) => void, failure?: ErrorFunction) => void` 在显示图片前获取图片的宽高(以像素为单位)。如果图片地址不正确或下载失败, 此方法也会失败。

要获取图片的尺寸, 首先需要加载或下载图片(同时会被缓存起来)。这意味着理论上你可以用这个方法来预加载图片，虽然此方法并没有针对这一用法进行优化，而且将来可能会换一些实现方案使得并不需要完整下载图片即可获取尺寸。所以更好的预加载方案是使用下面那个专门的预加载方法。

*不适用于静态图片资源。*

> * `uri`: string - 图片的地址
> * `success`: (width: number, height: number) => void - 此函数会在获取图片与其宽高成功后被回调
> * `failure`: ErrorFunction - 此函数会在如获取图片失败等异常情况被回调

#### prefetch


`web 暂不支持`

`(url: string) => void` 预加载一个远程图片，将其下载到本地磁盘缓存。

> * `uri`: string - 图片的地址

---

## ListView

[[ListView 范例]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/ListView)

可复用垂直列表功能，尤其适合大量条目的数据渲染。

### 不支持的参数

| 参数                  | 描述                                                         | 类型                                                        | 支持平台 |
| --------------------- | ------------------------------------------------------------ | ----------------------------------------------------------- | -------- |
| bounces | 是否开启回弹效果，默认 `true` | `boolean`                                                                                             | `web 暂不支持` |
| overScrollEnabled | 是否开启回弹效果，默认 `true` | `boolean`                                                                                   | ``web 暂不支持`` |
| horizontal       | 指定 `ListView` 是否采用横向布局。`default: undefined` | `any`   | `web 暂不支持` |
| onWillAppear     | 当有`ListViewItem`至少一个像素进入屏幕时（曝光）触发，入参返回曝光的`ListViewItem`对应索引值。 `最低支持版本2.3.0` | `(index) => any`   | `web 暂不支持` |
| onWillDisappear     | 当有`ListViewItem`至少一个像素滑动离开屏幕时触发，入参返回离开的`ListViewItem`对应索引值。 `最低支持版本2.3.0`| `(index) => any`    | `web 暂不支持` |
| onMomentumScrollBegin | 在 `ListView` 开始滑动的时候调起                           | `Function`                                                  | `web 暂不支持`    |
| onMomentumScrollEnd   | 在 `ListView` 结束滑动的时候调起                           | `Function`                                                  | `web 暂不支持`    |
| onScrollBeginDrag     | 当用户开始拖拽 `ListView` 时调用。                         | `Function`                                                  | `web 暂不支持`   |
| onScrollEndDrag       | 当用户停止拖拽 `ListView` 或者放手让 `ListView` 开始滑动的时候调用 | `Function`                                              | `web 暂不支持`    |
| preloadItemNumber     | 指定当列表滚动至倒数第几行时触发 `onEndReached` 回调。 | `number` | `web 暂不支持` |
| editable   | 是否可编辑，开启侧滑删除时需要设置为 `true`。`最低支持版本2.9.0` | `boolean`                                                             | `web 暂不支持` |
| delText   | 侧滑删除文本。`最低支持版本2.9.0` | `string`                                                                                          | `web 暂不支持` |
| onDelete   | 在列表项侧滑删除时调起。`最低支持版本2.9.0` | `( nativeEvent: { index: number} ) => void`                                              | `web 暂不支持` |

---

## Modal

[[Modal 范例]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/Modal)

模态弹窗组件。

### 不支持的参数

| 参数                  | 描述                                                         | 类型                                                         | 支持平台 |
| --------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------- |
| supportedOrientations | 支持屏幕翻转方向                                                            | `enum(portrait, portrait-upside-down, landscape, landscape-left, landscape-right)[]` | `web 暂不支持`    |
| immersionStatusBar    | 是否是沉浸式状态栏。                                         | `boolean`                                                    | `web 暂不支持`    |
| onOrientationChange   | 屏幕旋转方向改变时执行会回调                       | `Function`                                                   | `web 暂不支持`    |
| onRequestClose        | 在`Modal`请求关闭时会执行此回调函数，web 在按下 esc 键触发，一般要在里面处理关闭弹窗。 | `Function`                                                   | `ALL`    |
| primaryKey            | -                                                            | `string`                                                     | `web 暂不支持`    |

---

## RefreshWrapper

[[RefreshWrapper 范例]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/RefreshWrapper)

包裹住 `ListView` 提供下滑刷新功能的组件.(web 暂不支持，可以使用 ListView 的 renderPullHeader)

---

## ScrollView

[[Scroll 范例]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/ScrollView)

滚动视图组件，用于展示不确定高度的内容，它可以将一系列不确定高度的子组件装到一个确定高度的容器中，使用者可通过上下或左右滚动操作查看组件宽高之外的内容。

### 不支持的参数

| 参数                           | 描述                                                         | 类型                                                         | 支持平台 |
| ------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | -------- |
| bounces | 是否开启回弹效果，默认 `true` | `boolean`                                                                                                       | `web 暂不支持`    |
| onScrollBeginDrag              | 当用户开始拖拽 `ScrollView` 时调用。                         | `Function`                                                  | `web 暂不支持`  |
| onScrollEndDrag                | 当用户停止拖拽 `ScrollView` 或者放手让 `ScrollView` 开始滑动的时候调用。 | `Function`                                        | `web 暂不支持`    |
| pagingEnabled                  | 当值为 `true` 时，滚动条会停在滚动视图的尺寸的整数倍位置。这个可以用在水平分页上。`default: false` | `boolean`                     | `web 暂不支持`    |
| showsHorizontalScrollIndicator | 当此值设为 `false` 的时候，`ScrollView` 会隐藏水平的滚动条。`default: true` | `boolean`                                     | `web 暂不支持`    |
| showsVerticalScrollIndicator   | 当此值设为 `false` 的时候，`ScrollView` 会隐藏垂直的滚动条。 `default: true` | `boolean`                                    | `web 暂不支持`    |

---

## TextInput

[[TextInput 范例]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/TextInput)

输入文本的基本组件。

本组件的属性提供了多种特性的配置，譬如自动完成、自动大小写、占位文字，以及多种不同的键盘类型（如纯数字键盘）等等。

### 不支持的参数

| 参数                  | 描述                                                         | 类型                                                         | 支持平台  |
| --------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | --------- |
| onKeyboardWillShow    | 在弹出输入法键盘时候会触发此回调函数，返回值包含键盘高度 `keyboardHeight`，样式如 `{ keyboardHeight: 260}`。 | `Function`            | `web 暂不支持` |
| onSelectionChange     | 当输入框选择文字的范围被改变时调用。返回参数的样式如 `{ nativeEvent: { selection: { start, end } } }`。 | `Function`               | `web 暂不支持` |
| returnKeyType         | 指定软键盘的回车键显示的样式。                               | `enum(done, go, next, search, send)`                            | `web 暂不支持` |
| underlineColorAndroid | `TextInput` 下底线的颜色。 可以设置为'transparent'来去掉下底线。 | `string`                                                      | `web 暂不支持` |

### 方法

#### hideInputMethod

`() => void` 隐藏软键盘。 web 等同于 blur。

#### showInputMethod

`() => void` 显示软键盘。 web 等同于 focus。

---

## Text

[[Text 范例]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/Text)

文本组件。


### 不支持的参数

| 参数          | 描述                                                         | 类型                                      | 支持平台 |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| ellipsizeMode* | 当设定了 `numberOfLines` 值后，这个参数指定了字符串如何被截断。所以在使用 `ellipsizeMode` 时，必须得同时指定 `numberOfLines` 数值。 | `enum(head, middle, tail, clip)` | ，web 支持 ellipsis 和 clip` |

* ellipsizeMode 的参数含义：
  * `clip` - 超过指定行数的文字会被直接截断，不显示“...”；
  * `ellipsis` - 文字将会从最后开始截断，保证字符串的最前的文字可以正常显示在 Text 组件的最前，而从最后给截断的文字，将以 “...” 代替，例如 “abcd...”；

---

## View

[[View 范例]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/View)

最基础的容器组件，它是一个支持Flexbox布局、样式、一些触摸处理、和一些无障碍功能的容器，并且它可以放到其它的视图里，也可以有任意多个任意类型的子视图。不论在什么平台上，`View` 都会直接对应一个平台的原生视图。(参数均支持)

---

## ViewPager

[[ViewPager 范例]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/ViewPager)

支持横滑翻页的容器，它的每一个子容器组件会被视作一个单独的页面，并且会被拉伸宽度至 `ViewPager` 本身宽度。

### 不支持的参数

| 参数                     | 描述                                                         | 类型                                         | 支持平台 |
| ------------------------ | ------------------------------------------------------------ | -------------------------------------------- | -------- |
| onPageScroll             | 指定一个函数，当page被滑动时进行回调，回调参数是一个对象event，包括position值与offset值 回调参数： `position`: number -即将滑到的目标page的index `offset`: number -当前被选中的page的相对位移，取值范围-1到1 | `(obj: {position: number, offset: number}) => void` | `web 暂不支持`    |
| onPageScrollStateChanged | 指定一个函数，当page的滑动状态改变时进行回调 回调参数： `pageScrollState`: string -改变后的状态，idle表示停止，dragging表示用户用手拖拽，settling表示page正在滑动 | `(pageScrollState: string) => void`          | `web 暂不支持`    |

---

## WaterfallView

> 最低支持版本 2.9.0

[[WaterfallView 范例]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/WaterfallView)

瀑布流组件。(web 暂不支持)

---

## WebView

[[WebView 范例]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/WebView/index.jsx)

WebView组件。

### 不支持的参数

| 参数                  | 描述                                                         | 类型                                                        | 支持平台 |
| --------------------- | ------------------------------------------------------------ | ----------------------------------------------------------- | -------- |
| userAgent | Webview userAgent | `string` | `web 暂不支持`|
| method     | 请求方式， `get`、`post` | `string`   | `web 暂不支持`    |
| onLoadStart  | 网页开始加载时触发 | `(object: { url:string }) => void`   | `web 暂不支持`  |
| onLoad  | 网页加载时触发  | `(object: { url:string }) => void`   | `web 暂不支持`  |

# 编译时依赖

以官方提供的 [范例工程](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo) 范例工程为例，需要使用 `npm i -D` 准备好以下依赖，当然开发者可以根据需要自行选择：

| 包名                | 说明                          |
| ------------------- | ----------------------------- |
| css-loader          | Webpack 插件 - 内联样式转 CSS |
| html-webpack-plugin | Webpack 插件 - 生成首页 html  |
| style-loader        | Webpack 插件 - 内联样式       |
| webpack-dev-server  | Webpack 网页端调试服务        |

# 终端开发调试用编译配置

该配置展示了将 Hippy 运行于 Web 的最小化配置，并未包含分包等内容，开发者可以自行扩展。

和 hippy-react 的主要区别在于做了一个 hippy-react 到 hippy-react-web 的 [alias](//github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/scripts/hippy-webpack.web.js#L80)，使之可以不用修改代码直接运行。

| 配置文件                                                     | 说明       |
| ------------------------------------------------------------ | ---------- |
| [hippy-webpack.web.js](//github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/scripts/hippy-webpack.web.js) | 调试用配置 |

# 入口文件

hippy-react-web 和 hippy-react 的启动参数一致，可以共享同一个 `main.js` 入口文件。

# npm script

hippy-react-web 使用了 [webpack-dev-server](//webpack.js.org/configuration/dev-server/) 来启动调试，可以支持全部的 Web 调试特性，而同时使用同一份配置文件换而使用 webpack 进行打包。

这里的命令其实参考了 vue-cli 生成的 Vue 项目，通过 `serve` 启动调试服务，通过 `build` 编译出 JS 包。

```json
  "scripts": {
    "serve": "webpack-dev-server --config ./scripts/hippy-webpack.web.js",
    "build": "webpack --config ./scripts/hippy-webpack.web.js",
  }
```

# 启动调试

执行 `npm run serve` 后就会启动 Web 调试，但要注意默认生成的 HTML 文件名是从 `package.json` 的 `name` 字段定义，而不是默认的 `index.html`，所以对于官方范例，需要使用 `http://localhost:8080/hippy-react-demo.html` 来访问调试用页面。

# 转 Web 新方案

未来 Hippy 会采用 `WebRenderer` 方案，增加基于公共通信协议的转换层，业务开发者可以使用同一套 Hippy 语法开发的业务代码，映射成 JS 实现的组件和模块，上层无论使用 React，Vue 或者其他第三方框架，都可以实现兼容，敬请期待。
