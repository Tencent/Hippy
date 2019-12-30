<!-- markdownlint-disable no-duplicate-header -->

# 终端扩展组件

扩展组件是终端提供了一些很方便的组件，在 hippy-vue 中由 [hippy-vue-native-components](//www.npmjs.com/package/hippy-vue-native-components) 提供，但因为暂时还没有 `hippy-vue-web-components` 所以暂时无法在浏览器中使用。

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
和 React 不同，它将 Animation 和 AnimationSet 合二为一了，其实方法特别简单，发现是个动画就是 Animation，如果是个数组就是动画序列就用 AnimationSet 处理。

# dialog

[[范例：demo-dialog.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/native-demos/demo-dialog.vue)

用于模态弹窗。

## 参数

| 参数          | 描述                                                         | 类型                                      | 支持平台 |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| animated              | -                                                            | `boolean`                                                    | `ALL`    |
| animationType         | -                                                            | `enum`(none, slide, fade, slide_fade) | `ALL`    |
| supportedOrientations | -                                                            | `enum`(portrait, portrait-upside-down, landscape, landscape-left, landscape-right)[] | `ALL`    |
| immersionStatusBar    | 是否是沉浸式状态栏。                                         | `boolean`                                                    | `ALL`    |
| darkStatusBarText     | 是否是亮色主体文字，默认字体是黑色的，改成 true 后会认为 Modal 背景为暗色调，字体就会改成白色。 | `boolean`                                                    | `ALL`    |
| primaryKey            | -                                                            | `string`                                                     | `iOS`    |
| transparent           | -                                                            | `boolean`                                                    | `ALL`    |
| visible               | -                                                            | `boolean`                                                    | `ALL`    |

## 事件

| 事件名称          | 描述                                                         | 类型                                      | 支持平台 |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| show                | 在`Modal`显示时会执行此回调函数。                            | `Function`                                                   | `ALL`    |
| orientationChange   | -                                                            | `Function`                                                   | `ALL`    |
| requestClose        | 在`Modal`请求关闭时会执行此回调函数，一般时在 Android 系统里按下硬件返回按钮时触发，一般要在里面处理关闭弹窗。 | `Function`                                                   | `ALL`    |
| dismiss             | -                                                            | `Function`                                                   | `iOS`    |

# swiper

[[范例：demo-swiper.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/native-demos/demo-swiper.vue)

轮播组件，里面只能包含 `<swiper-slide>` 组件。

> **注意事项：**如果在 ul 里嵌套 swiper，因为 ul 自带复用能力，swiper 滚出屏幕后不可在对其进行任何操作（例如通过代码更改 current 值），否则很可能导致终端出错。

## 参数

| 参数                     | 描述                                                         | 类型                                         | 支持平台 |
| ------------------------ | ------------------------------------------------------------ | -------------------------------------------- | -------- |
| current              | 实时改变当前所处页码 | `number`                                     | `ALL`    |
| initialPage              | 指定一个数字，用于决定初始化后默认显示的页面index，默认不指定的时候是0 | `number`                                     | `ALL`    |
| needAnimation            | 切换页面时是否需要动画。                        | `boolean`                                    | `ALL`    |
| scrollEnabled            | 指定ViewPager是否可以滑动，默认为true                        | `boolean`                                    | `ALL`    |

## 事件

| 事件名称          | 描述                                                         | 类型                                      | 支持平台 |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| dragging                | 拖动时触发。                            | `Function`                                                   | `ALL`    |
| dropped   | 拖拽松手时触发，就是确定了滚动的页面时触发。                                                            | `Function`                                                   | `ALL`    |

# swiper-slide

[[范例：demo-swiper.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/native-demos/demo-swiper.vue)

轮播组件页容器。

# ul-refresh-wrapper

[[范例：demo-list-refresh.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/native-demos/demo-list-refresh.vue)

列表下拉刷新组件，里面只能包裹 `<ul-refresh>` 和 `<ul>` 组件。

## 事件

### refresh

下拉刷新回弹后触发刷新回调

下拉刷新，加载数据完成后需要用 `Vue.Native.callUIFunction(this.$refs.refreshWrapper, 'refreshComplected', null);` 告知终端刷新已经结束，可以弹回去了。

| 类型     | 必需 |
| -------- | -------- |
| boolean | 否       |

# ul-refresh

[[范例：demo-list-refresh.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/native-demos/demo-list-refresh.vue)

列表下拉刷新时，刷新内容的容器组件。
