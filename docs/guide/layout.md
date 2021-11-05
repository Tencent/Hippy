# 盒模型

Hippy 为了方便前端开发便于理解，样式也采用了 CSS 的盒模型构建。当 Hippy 在进行布局的时候，渲染引擎会根据 CSS-Box 模型将所有元素表示为一个矩形盒子，样式配置决定这些盒子的大小，位置以及属性（颜色，背景，边框尺寸...).

在 Hippy 中，使用标准盒模型描述这些矩形盒子中的每一个。这个模型描述了元素所占空间的内容。每个盒子有四个边：外边距边, 边框边, 内填充边 与 内容边。

> PS: Hippy 的盒模型布局对应的是CSS的 `box-sizing` 属性的 `border-box` 类型，具体表现与宽高边距计算可参考[MDN文档 box-sizing](//developer.mozilla.org/zh-CN/docs/Web/CSS/box-sizing)。

![盒模型](//res.imtt.qq.com/hippydoc/img/border-box.png)

* [width](style/layout.md?id=width)
* [height](style/layout.md?id=height)
* [padding](style/layout.md?id=padding)
* [margin](style/layout.md?id=margin)
* [border](style/layout.md?id=borderWidth)

# 布局（Flex）

Hippy 中，为了方便移动端编写布局，所以默认支持了现在移动端最流行的 `Flex` 布局。同时，因为仅支持 `Flex` 布局，所以不需要手写 `display: flex` 即可使用
Flex 布局与 Web 的 Flex 类似，它们都旨在提供一个更加有效的方式制定、调整和分布一个容器里的项目布局，即使他们的大小是未知或者是动态的。Flex 规定了弹性元素如何伸长或缩短以适应flex容器中的可用空间。CSS 版教程文档可以参考[这篇](http://www.w3cplus.com/css3/a-visual-guide-to-css3-flexbox-properties.html)

## flexDirection

flexDirection 属性指定了内部元素是如何在 flex 容器中布局的，定义了主轴的方向(水平或垂直)。

> 注意：Hippy 的 flexDirection 与 Web的 flex-direction Web 默认为 `row`, Hippy 默认为 `column`。

<img src="//res.imtt.qq.com/hippydoc/img/flex-direction.png" alt="flexDirection" width="30%"/>
<br />
<br />

| 类型   | 必需 |默认|
| ------ | -------- |---|
| enum('column', 'row') | 否     |'column'|

## alignItems

alignItems 定义了伸缩项目可以在伸缩容器的当前行的侧轴上对齐方式

* flex-start(默认值)：伸缩项目在侧轴起点边的外边距紧靠住该行在侧轴起始的边。
* flex-end：伸缩项目在侧轴终点边的外边距靠住该行在侧轴终点的边 。
* center：伸缩项目的外边距盒在该行的侧轴上居中放置。
* baseline：伸缩项目根据他们的基线对齐。
* stretch：伸缩项目拉伸填充整个伸缩容器。此值会使项目的外边距盒的尺寸在遵照「min/max-width/height」属性的限制下尽可能接近所在行的尺寸。

| 类型   | 必需 |默认|
| ------ | -------- |---|
| enum('flex-start', 'flex-end', 'center', 'baseline', 'stretch') | 否      |'flex-start'|

## justifyContent

justifyContent 定义了伸缩项目沿着主轴线的对齐方式。

* flex-start(默认值)：伸缩项目向一行的起始位置靠齐。
* flex-end：伸缩项目向一行的结束位置靠齐。
* center：伸缩项目向一行的中间位置靠齐。
* space-between：伸缩项目会平均地分布在行里。第一个伸缩项目一行中的最开始位置，最后一个伸缩项目在一行中最终点位置。
* space-around：伸缩项目会平均地分布在行里，两端保留一半的空间。

| 类型   | 必需 |默认|
| ------ | -------- |---|
| enum('flex-start', 'flex-end', 'center', 'baseline', 'stretch') | 否      |'flex-start'|

## flex

flex 属性数值, 定义了 flex 容器的子节点项可以占用容器中剩余空间的大小。默认值为0，即不占用剩余空间。如果定义了 flex 数字且为正数的时候，则

```text
每个元素占用的剩余空间=自己的 flex 数值 / 所有同一级子容器的 flex 数字之和
```

当 flex 设置为-1的时候，默认情况会显示正常宽高。然而， 如果剩余空间不足的话，此设置了`flex: -1`的容器将会收缩到其 minWidth 的宽度与 minHeight 的高度来显示。

| 类型   | 必需 |默认|
| ------ | -------- |---|
| number| 否      |0|

## flexBasis

flexBasis 设置伸缩基准值，剩余的空间按比率进行伸缩，负值无效，只能为 0 或正数。

| 类型   | 必需 |默认|
| ------ | -------- |---|
| number, string| 否      |auto|

## flexGrow

flexGrow 定义伸缩项目的扩展能力。它接受一个不带单位的值做为一个比例。主要用来决定伸缩容器剩余空间按比例应扩展多少空间。

如果所有伸缩项目的 flex-grow 设置了 1，那么每个伸缩项目将设置为一个大小相等的剩余空间。如果你给其中一个伸缩项目设置了 flex-grow 值为 2，那么这个伸缩项目所占的剩余空间是其他伸缩项目所占剩余空间的两倍。

| 类型   | 必需 |默认|
| ------ | -------- |---|
| number| 否      |0|

## flexShrink

flexShrink 定义伸缩项目收缩的能力。

> 注意：Hippy 中 flexShrink 默认值为 0，与Web标准有差异

| 类型   | 必需 |默认|
| ------ | -------- |---|
| number| 否      |0|

# 长度单位

Hippy 现在暂时不支持百分比的长度值，只支持具体数值（number）。单位为 dp，具体换算公式为：

```text
实际真机长度值 = 屏幕缩放比例 * Hippy 样式长度值
```

屏幕缩放比例 可以通过 `PixelRatio.get()`(hippy-react) 或 `Vue.Native.PixelRatio`（hippy-vue） 获取，如 iPhone 8 为 2，iPhone X 为 3，以 iPhone 8 为例：

* 屏幕真实宽度为 750px
* PixelRatio 为 2
* 所以 Hippy 的全屏宽度为`750/2 = 375`
