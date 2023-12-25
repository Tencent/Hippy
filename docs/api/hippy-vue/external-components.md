<!-- markdownlint-disable no-duplicate-header -->

# 终端扩展组件

扩展组件是终端提供了一些很方便的组件，在 hippy-vue 中由 [@hippy/vue-native-components](//www.npmjs.com/package/@hippy/vue-native-components) 提供

---

# animation

[[范例：demo-animation.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/native-demos/demo-animation.vue)

该组件是 hippy-vue 的动画解决方案，直接传入一个样式值和动画方案数组，即可触发动作效果。

需要说明的是一个 animation 本身就是个 View，它会带动所有子节点一起动画，所以如果动画需要分开控制的话，需要在界面层级上进行拆分。

## 参数

| 参数          | 描述                                                         | 类型                                      | 支持平台 |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| playing        | 控制动画是否播放 | boolean                                | `Android、iOS、Web-Renderer、Voltron`    |
| actions*        | 动画方案，其实是一个样式值跟上它的动画方案，详情请参考范例。 | Object                                | `Android、iOS、Web-Renderer、Voltron`    |

* actions 详解
  
  和 HippyReact 不同，HippyVue 将单个动画 Animation 和动画序列 AnimationSet 合二为一，如果是一个对象，就使用 Animation 处理，如果是数组动画序列就用 AnimationSet 处理。动画参数具体可参考 [HippyReact Animation 模块](api/hippy-react/modules.md?id=animation) 和 [范例](https://github.com/Tencent/Hippy/tree/master/examples/hippy-vue-demo/src/components/native-demos/animations)。


```vue
<template>
  <div>
    <animation
        ref="animationRef"
        :actions="actionsConfig"
        :playing="true"
        @start="animationStart"
        @end="animationEnd"
        @repeat="animationRepeat"
        @cancel="animationCancel"
        @actionsDidUpdate="actionsDidUpdate"
    />
  </div>
</template>
<script>
export default {
  data() {
    return {
      actionsConfig: {
        // AnimationSet
        top: [
          {
            startValue: 14,
            toValue: 8,
            duration: 125, // 动画持续时间
          },
          {
            startValue: 8,
            toValue: 14,
            duration: 250,
            timingFunction: 'linear', // 动画插值器类型，可选 linear、ease-in、ease-out、ease-in-out、cubic-bezier(最低支持版本 2.9.0)
            delay: 750, // 动画延迟开始的时间，单位为毫秒
            repeatCount: -1, // 动画的重复次数，0 为不重复，-1('loop') 为重复播放，如果在数组中，整个动画数组的重复次数以最后一个动画的值为准
          },
        ],
        transform: {
          // 单个 Animation
          rotate: {
              startValue: 0,
              toValue: 90,
              duration: 250,
              timingFunction: 'linear',
              valueType: 'deg',  // 动画的开始和结束值的单位类型，默认为 undefined, 可设为 rad、deg、color
            },
        },
      },
    };
  },
  methods: {
    animationStart() {
      console.log('animation-start callback');
    },
    animationEnd() {
      console.log('animation-end callback');
    },
    animationRepeat() {
      console.log('animation-repeat callback');
    },
    animationCancel() {
      console.log('animation-cancel callback');
    },
    actionsDidUpdate() {
      this.animationRef.start();
    }
  },
};
</script>
```

  > 特别说明，对 actions 替换后会重新创建动画，需手动启动新动画。有两种处理方式：
  > 
  > * 替换 actions => 延迟一定时间（如setTimeout）后 或者在 `actionsDidUpdate` 勾子内 `(2.14.0 版本后支持)`，调用 `this.[animation ref].start()`（推荐）
  > * 设置 `playing = false` =>  替换 actions  => 延迟一定时间（如setTimeout）后 或者在 `actionsDidUpdate` 勾子内 `(2.14.0 版本后支持)`，设置 `playing = true`

  > `2.6.0` 及以上版本支持 `backgroundColor` 背景色渐变动画，参考 [渐变色动画DEMO](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/native-demos/animations/color-change.vue)
  > 
  > * 设置 `actions` 对 `backgroundColor` 进行修饰
  > * 设置 `valueType` 为 `color`
  > * 设置 `startValue` 和 `toValue` 为 [color值](api/style/color.md)

  > `2.12.2` 及以上版本支持循环播放参数 `repeatCount: 'loop'` 写法，低版本请使用 `repeatCount: -1`

## 事件

| 参数          | 描述                                                         | 类型                                      | 支持平台 |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| start              | 动画开始时触发，最低支持版本 `2.5.2`      | `Function`                                                    | `Android、iOS、Web-Renderer、Voltron`    |
| end         | 动画结束时触发，最低支持版本 `2.5.2`             | `Function`| `Android、iOS、Web-Renderer、Voltron`    |
| repeat | 每次循环播放时触发，最低支持版本 `2.5.2`               | `Function` | `Android、Voltron`   |
| actionsDidUpdate | 替换 actions 且动画对象创建成功后触发，可以在这个时机重新启动动画，最低支持版本 `2.14.0`  | `Function` | `Android、iOS、Voltron`   |

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

### destroy

`() => void` 销毁动画

---

# dialog

[[范例：demo-dialog.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/native-demos/demo-dialog.vue)

用于模态弹窗，默认透明背景色，需要加一个带背景色的 `<div>` 填充。

## 参数

| 参数          | 描述                                                         | 类型                                      | 支持平台 |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| animationType         | 动画效果                                                            | `enum(none, slide, fade, slide_fade)` | `Android、iOS、Web-Renderer、Voltron`    |
| supportedOrientations | 支持屏幕翻转方向                                                       | `enum(portrait, portrait-upside-down, landscape, landscape-left, landscape-right)[]` | `iOS`    |
| immersionStatusBar    | 是否是沉浸式状态栏。`default: true`                                         | `boolean`                                                    | `Android、Voltron`    |
| darkStatusBarText     | 是否是亮色主体文字，默认字体是黑色的，改成 true 后会认为 Modal 背景为暗色调，字体就会改成白色。 | `boolean`                                                    | `Android、iOS、Voltron`    |
| autoHideStatusBar     | 是否在`Modal`显示时自动隐藏状态栏。<strong>Android 中仅 api28 以上生效。</strong> `default: false` | `boolean` | `Android` |
| autoHideNavigationBar | 是否在`Modal`显示时自动隐藏导航栏。 `default: false` | `boolean` | `Android` |

| transparent | 背景是否是透明的。`default: true` | `boolean`                                                    | `Android、iOS、Web-Renderer、Voltron`    |

## 事件

| 事件名称          | 描述                                                         | 类型                                      | 支持平台 |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| show                | 在`Modal`显示时会执行此回调函数。                            | `Function`                                                   | `Android、iOS、Web-Renderer、Voltron`    |
| orientationChange   | 屏幕旋转方向改变                                           | `Function`                                                   | `Android、iOS`    |
| requestClose        | 在 `Modal`请求关闭时会执行此回调函数，一般时在 Android 系统里按下硬件返回按钮时触发，一般要在里面处理关闭弹窗。 | `Function`                                                   | `Android、Voltron`    |

---

# swiper

[[范例：demo-swiper.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/native-demos/demo-swiper.vue)

支持翻页的容器，它的每一个子容器组件会被视作一个单独的页面，对应终端 `ViewPager`组件， 里面只能包含 `<swiper-slide>` 组件。

## 参数

| 参数                     | 描述                                                         | 类型                                         | 支持平台 |
| ------------------------ | ------------------------------------------------------------ | -------------------------------------------- | -------- |
| bounces | 是否开启回弹效果，默认 `true` | `boolean`                                                  | `iOS、Voltron`    |
| current              | 实时改变当前所处页码 | `number`                                     | `Android、iOS、Web-Renderer、Voltron`    |
| initialPage              | 指定一个数字，用于决定初始化后默认显示的页面index，默认不指定的时候是0 | `number`                                     | `Android、iOS、Web-Renderer、Voltron`    |
| needAnimation            | 切换页面时是否需要动画。                        | `boolean`                                    | `Android、iOS、Voltron`    |
| scrollEnabled            | 指定ViewPager是否可以滑动，默认为true                        | `boolean`                                    | `Android、iOS、Web-Renderer、Voltron`    |
| direction            | 设置viewPager滚动方向，不设置默认横向滚动，设置 `vertical` 为竖向滚动                       | `string`                                    | `Android、Voltron`    |

## 事件

| 事件名称          | 描述                                                         | 类型                                      | 支持平台 |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| dragging                | 拖动时触发。                            | `Function`                                                   | `Android、iOS、Web-Renderer、Voltron`    |
| dropped   | 拖拽松手时触发，就是确定了滚动的页面时触发。                                                            | `Function`                                                   | `Android、iOS、Web-Renderer、Voltron`    |
| stateChanged*   | 手指行为发生改变时触发，包含了 idle、dragging、settling 三种状态，通过 state 参数返回                                                             | `Function`                                                   | `Android、iOS、Web-Renderer、Voltron`    |

* stateChanged 三种值的意思：
  * idle 空闲状态
  * dragging 拖拽中
  * settling 松手后触发，然后马上回到 idle

---

# swiper-slide

[[范例：demo-swiper.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/native-demos/demo-swiper.vue)

翻页子容器组件容器。

---

# pull-header

[[范例：demo-pull-header.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/native-demos/demo-pull-header-footer.vue)

下拉刷新组件，嵌套在 `ul` 中作为第一个子元素使用

## 事件

| 事件名称          | 描述                                                         | 类型                                      | 支持平台 |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| idle                | 滑动距离在 pull-header 区域内触发一次，参数 contentOffset                            | `Function`                                                   | `Android、iOS、Voltron`    |
| pulling   | 滑动距离超出 pull-header 后触发一次，参数 contentOffset                                                        | `Function`   | `Android、iOS、Voltron`    |
| released   | 滑动超出距离，松手后触发一次          | `Function`   | `Android、iOS、Voltron`    |

## 方法

### collapsePullHeader

`(otions: { time: number }) => void` 收起顶部刷新条 `<pull-header>`。当使用了 `pull-header` 后，每当下拉刷新结束需要主动调用该方法收回 pull-header。

> options 参数，最低支持版本 `2.14.0`
>
>* time: number: 可指定延迟多久后收起 PullHeader，单位ms

---

# pull-footer

[[范例：demo-pull-footer.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/native-demos/demo-pull-header-footer.vue)

上拉刷新组件，嵌套在 `ul` 中作为最后一个子元素使用

## 事件

| 事件名称          | 描述                                                         | 类型                                      | 支持平台 |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| idle                | 滑动距离在 pull-footer 区域内触发一次，参数 contentOffset                            | `Function`                                                   | `Android、iOS、Voltron`    |
| pulling   | 滑动距离超出 pull-footer 后触发一次，参数 contentOffset      | `Function`   | `Android、iOS、Voltron`    |
| released   | 滑动超出距离松手后触发一次          | `Function`   | `Android、iOS、Voltron`    |

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
| columnSpacing     | 瀑布流每列之前的水平间距                                      | `number`   | `Android、iOS、Voltron`    |
| interItemSpacing  | item 间的垂直间距                                        | `number`   | `Android、iOS、Voltron`    |
| contentInset      | 内容缩进 ，默认值 `{ top:0, left:0, bottom:0, right:0 }`  | `Object`   | `Android、iOS、Voltron`    |
| containBannerView | 是否包含`bannerView`，只能有一个bannerView，`Android` 暂不支持  | `boolean`  | `iOS、Voltron`    |
| containPullHeader | 是否包含`pull-header`；`Android` 暂不支持，可以用 `ul-refresh` 组件替代  | `boolean`  | `iOS、Voltron`    |
| containPullFooter | 是否包含 `pull-footer` | `boolean`  | `Android、iOS、Voltron` |
| numberOfColumns   | 瀑布流列数量，Default: 2                                               | `number`   | `Android、iOS、Voltron`    |
| preloadItemNumber | 滑动到瀑布流底部前提前预加载的 item 数量       | `number`   | `Android、iOS、Voltron`    |

## 事件

| 事件名称              | 描述           | `类型`     | 支持平台 |
| --------------------- | -------------- | ---------- | -------- |
| endReached      | 当所有的数据都已经渲染过，并且列表被滚动到最后一条时，将触发 `onEndReached` 回调。                                           | `Function` | `Android、iOS、Voltron`    |
| scroll          | 当触发 `WaterFall` 的滑动事件时回调。`startEdgePos`表示距离 List 顶部边缘滚动偏移量；`endEdgePos`表示距离 List 底部边缘滚动偏移量；`firstVisibleRowIndex`表示当前可见区域内第一个元素的索引；`lastVisibleRowIndex`表示当前可见区域内最后一个元素的索引；`visibleRowFrames`表示当前可见区域内所有 item 的信息(x，y，width，height)    | `{ nativeEvent: { startEdgePos: number, endEdgePos: number, firstVisibleRowIndex: number, lastVisibleRowIndex: number, visibleRowFrames: Object[] } }` | `Android、iOS、Voltron`    |

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
| type            | 指定一个函数，在其中返回对应条目的类型（返回Number类型的自然数，默认是0），List 将对同类型条目进行复用，所以合理的类型拆分，可以很好地提升 List 性能。 | `number`              | `Android、iOS、Voltron`    |
| key             | 指定一个函数，在其中返回对应条目的 Key 值，详见 [Vue 官网](//vuejs.org/v2/guide/list.html) | `string`                                    | `Android、iOS、Voltron`    |
