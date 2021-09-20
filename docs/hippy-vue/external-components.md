<!-- markdownlint-disable no-duplicate-header -->

# 终端扩展组件

扩展组件是终端提供了一些很方便的组件，在 hippy-vue 中由 [@hippy/vue-native-components](//www.npmjs.com/package/@hippy/vue-native-components) 提供，但因为暂时还没有 `@hippy/vue-web-components` 所以暂时无法在浏览器中使用。

---

# animation

[[范例：demo-animation.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/native-demos/demo-animation.vue)

该组件是 hippy-vue 的动画解决方案，直接传入一个样式值和动画方案数组，即可触发动作效果。

需要说明的是一个 animation 本身就是个 View，它会带动所有子节点一起动画，所以如果动画需要分开控制的话，需要在界面层级上进行拆分。

## 参数

| 参数          | 描述                                                         | 类型                                      | 支持平台 |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| playing        | 控制动画是否播放 | boolean                                | `ALL`    |
| actions*        | 动画方案，其实是一个样式值跟上它的动画方案，详情请参考范例。 | Object                                | `ALL`    |

* actions 详解
  
  和 React 不同，它将单个动画 Animation 和动画序列 AnimationSet 合二为一了，其实方法特别简单，发现是个对象就是 Animation，如果是个数组就是动画序列就用 AnimationSet 处理，单个动画参数具体参考 [Animation 模块](../hippy-react/modules.md?id=animation)和 [范例](https://github.com/Tencent/Hippy/tree/master/examples/hippy-vue-demo/src/components/native-demos/animations)。需要说明 hippy-vue 的动画参数有一些[默认值](https://github.com/Tencent/Hippy/blob/master/packages/hippy-vue-native-components/src/animation.js#L5)，只有差异部分才需要填写。

  特别说明，对 actions 替换后会自动新建动画，需手动启动新动画。有两种处理方式：
  * 替换 actions => 延迟一定时间后（如setTimeout） 调用 `this.[animation ref].start()`（推荐）
  * `playing = false` =>  替换 actions =>  延迟一定时间后（如setTimeout） `playing = true`
  
  2.6.0 版本新增 `backgroundColor` 背景色渐变动画支持，参考 [渐变色动画DEMO](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/native-demos/animations/color-change.vue)
  * 设置 `actions` 对 `backgroundColor` 进行修饰
  * 设置 `valueType` 为 `color`
  * 设置 `startValue` 和 `toValue` 为 [color值](style/color.md)

## 事件

> 最低支持版本 2.5.2

| 参数          | 描述                                                         | 类型                                      | 支持平台 |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| start              | 动画开始时触发                                                            | `Function`                                                    | `ALL`    |
| end         | 动画结束时触发                                                            | `Function`| `ALL`    |
| repeat | 每次循环播放时触发                                                            | `Function` | `Android`   |

## 方法

> 最低支持版本 2.5.2

### start

`() => void` 手动触发动画开始（`playing`属性置为`true`也会自动触发`start`函数调用）

### pause

`() => void` 手动触发动画暂停（`playing`属性置为`false`也会自动触发`pause`函数调用）

### resume

`() => void` 手动触发动画继续（`playing`属性置为`false`后再置为`true`会自动触发`resume`函数调用）

### create

`() => void` 手动触发动画创建

### reset

`() => void` 重置开始标记

---

# dialog

[[范例：demo-dialog.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/native-demos/demo-dialog.vue)

用于模态弹窗，默认透明背景色，需要加一个带背景色的 `<div>` 填充。

## 参数

| 参数          | 描述                                                         | 类型                                      | 支持平台 |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| animated              | 弹出时是否需要带动画                                                            | `boolean`                                                    | `ALL`    |
| animationType         | 动画效果                                                            | `enum`(none, slide, fade, slide_fade) | `ALL`    |
| supportedOrientations | 支持屏幕翻转方向                                                            | `enum`(portrait, portrait-upside-down, landscape, landscape-left, landscape-right)[] | `ALL`    |
| immersionStatusBar    | 是否是沉浸式状态栏。                                         | `boolean`                                                    | `ALL`    |
| darkStatusBarText     | 是否是亮色主体文字，默认字体是黑色的，改成 true 后会认为 Modal 背景为暗色调，字体就会改成白色。 | `boolean`                                                    | `ALL`    |

## 事件

| 事件名称          | 描述                                                         | 类型                                      | 支持平台 |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| show                | 在`Modal`显示时会执行此回调函数。                            | `Function`                                                   | `ALL`    |
| orientationChange   | 屏幕旋转方向改变                                           | `Function`                                                   | `ALL`    |
| requestClose        | 在`Modal`请求关闭时会执行此回调函数，一般时在 Android 系统里按下硬件返回按钮时触发，一般要在里面处理关闭弹窗。 | `Function`                                                   | `Android`    |

---

# swiper

[[范例：demo-swiper.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/native-demos/demo-swiper.vue)

轮播组件，对应终端 `ViewPager`组件， 里面只能包含 `<swiper-slide>` 组件。

> **注意事项：**如果在 ul 里嵌套 swiper，因为 ul 自带复用能力，swiper 滚出屏幕后不可在对其进行任何操作（例如通过代码更改 current 值），否则很可能导致终端出错。

## 参数

| 参数                     | 描述                                                         | 类型                                         | 支持平台 |
| ------------------------ | ------------------------------------------------------------ | -------------------------------------------- | -------- |
| current              | 实时改变当前所处页码 | `number`                                     | `ALL`    |
| initialPage              | 指定一个数字，用于决定初始化后默认显示的页面index，默认不指定的时候是0 | `number`                                     | `ALL`    |
| needAnimation            | 切换页面时是否需要动画。                        | `boolean`                                    | `ALL`    |
| scrollEnabled            | 指定ViewPager是否可以滑动，默认为true                        | `boolean`                                    | `ALL`    |
| direction            | 设置viewPager滚动方向，不设置默认横向滚动，设置 `vertical` 为竖向滚动                       | `boolean`                                    | `Android`    |

## 事件

| 事件名称          | 描述                                                         | 类型                                      | 支持平台 |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| dragging                | 拖动时触发。                            | `Function`                                                   | `ALL`    |
| dropped   | 拖拽松手时触发，就是确定了滚动的页面时触发。                                                            | `Function`                                                   | `ALL`    |
| stateChanged*   | 手指行为发生改变时触发，包含了 idle、dragging、settling 三种状态，通过 state 参数返回                                                             | `Function`                                                   | `ALL`    |

* stateChanged 三种值的意思：
  * idle 空闲状态
  * dragging 拖拽中
  * settling 松手后触发，然后马上回到 idle

---

# swiper-slide

[[范例：demo-swiper.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/native-demos/demo-swiper.vue)

轮播组件页容器。

---

# pull-header

[[范例：demo-pull-header.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/native-demos/demo-pull-header.vue)

下拉刷新组件，嵌套在 `ul` 中作为第一个子元素使用

## 事件

| 事件名称          | 描述                                                         | 类型                                      | 支持平台 |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| idle                | 滑动距离在 pull-header 区域内触发一次，参数 contentOffset                            | `Function`                                                   | `ALL`    |
| pulling   | 滑动距离超出 pull-header 后触发一次，参数 contentOffset                                                        | `Function`   | `ALL`    |
| released   | 滑动超出距离，松手后触发一次          | `Function`   | `ALL`    |

## 方法

### collapsePullHeader

`() => void` 收起顶部刷新条 `<pull-header>`。

---

# pull-footer

[[范例：demo-pull-footer.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/native-demos/demo-pull-footer.vue)

上拉刷新组件，嵌套在 `ul` 中作为最后一个子元素使用

## 事件

| 事件名称          | 描述                                                         | 类型                                      | 支持平台 |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| idle                | 滑动距离在 pull-footer 区域内触发一次，参数 contentOffset                            | `Function`                                                   | `ALL`    |
| pulling   | 滑动距离超出 pull-footer 后触发一次，参数 contentOffset      | `Function`   | `ALL`    |
| refresh   | 滑动超出距离，松手后触发一次          | `Function`   | `ALL`    |

## 方法

### collapsePullFooter

`() => void` 收起底部刷新条 `<pull-footer>`。

---

# waterfall

> 最低支持版本 2.9.0

[[范例：demo-waterfall]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/native-demos/demo-waterfall.vue)

瀑布流组件，子元素必须是 `waterfall-item` ，瀑布流组件下拉刷新需在最外层用`ul-refresh-wrapper`， 可在`waterfall` 内用 `pull-footer` 展示上拉加载文案。

## 参数

| 参数              | 描述                                                  | 类型       | 支持平台 |
| ----------------- | ----------------------------------------------------- | ---------- | -------- |
| columnSpacing     | 瀑布流每列之前的水平间距                                      | `number`   | `ALL`    |
| interItemSpacing  | item 间的垂直间距                                        | `number`   | `ALL`    |
| contentInset      | 内容缩进 ，默认值 `{ top:0, left:0, bottom:0, right:0 }`  | `Object`   | `ALL`    |
| containBannerView | 是否包含`bannerView`，只能有一个bannerView，`Android` 暂不支持  | `boolean`  | `iOS`    |
| containPullHeader | 是否包含`pull-header`；`Android` 暂不支持，可以用 `ul-refresh` 组件替代  | `boolean`  | `iOS`    |
| containPullFooter | 是否包含 `pull-footer` | `boolean`  | `ALL` |
| numberOfColumns   | 瀑布流列数量，Default: 2                                               | `number`   | `ALL`    |
| preloadItemNumber | 滑动到瀑布流底部前提前预加载的 item 数量       | `number`   | `ALL`    |

## 事件

| 事件名称              | 描述           | `类型`     | 支持平台 |
| --------------------- | -------------- | ---------- | -------- |
| endReached      | 当所有的数据都已经渲染过，并且列表被滚动到最后一条时，将触发 `onEndReached` 回调。                                           | `Function` | `ALL`    |
| scroll          | 当触发 `WaterFall` 的滑动事件时回调。`startEdgePos`表示距离 List 顶部边缘滚动偏移量；`endEdgePos`表示距离 List 底部边缘滚动偏移量；`firstVisibleRowIndex`表示当前可见区域内第一个元素的索引；`lastVisibleRowIndex`表示当前可见区域内最后一个元素的索引；`visibleRowFrames`表示当前可见区域内所有 item 的信息(x，y，width，height)    | `{ nativeEvent: { startEdgePos: number, endEdgePos: number, firstVisibleRowIndex: number, lastVisibleRowIndex: number, visibleRowFrames: Object[] } }` | `ALL`    |

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

# waterfall-item

> 最低支持版本 2.9.0

瀑布流组件 Cell 容器，瀑布流子元素

| 参数                  | 描述                                                         | 类型                                                        | 支持平台 |
| --------------------- | ------------------------------------------------------------ | ----------------------------------------------------------- | -------- |
| type            | 指定一个函数，在其中返回对应条目的类型（返回Number类型的自然数，默认是0），List 将对同类型条目进行复用，所以合理的类型拆分，可以很好地提升 List 性能。 | `number`              | `ALL`    |
| key             | 指定一个函数，在其中返回对应条目的 Key 值，详见 [Vue 官文](//cn.vuejs.org/v2/guide/list.html) | `string`                                    | `ALL`    |
