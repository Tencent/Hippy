# 外观

包含了前景、背景、边框、透明度、字体等外观样式

---

# borderColor

> Android 默认值为 `transparent`，iOS 默认值为 `black`

| 类型               | 必需 | 支持平台
| ------------------ | -------- | --- |
| [color](style/color.md) | 否  | Android、iOS

# borderTopColor

> Android 默认值为 `transparent`，iOS 默认值为 `black`

| 类型               | 必需 | 支持平台
| ------------------ | -------- | --- |
| [color](style/color.md) | 否  |  Android、iOS

# borderBottomColor

> Android 默认值为 `transparent`，iOS 默认值为 `black`

| 类型               | 必需 | 支持平台
| ------------------ | -------- | --- |
| [color](style/color.md) | 否 | Android、iOS

# borderLeftColor

> Android 默认值为 `transparent`，iOS 默认值为 `black`

| 类型               | 必需 | 支持平台
| ------------------ | -------- | --- |
| [color](style/color.md) | 否  |  Android、iOS

# borderRightColor

> Android 默认值为 `transparent`，iOS 默认值为 `black`

| 类型               | 必需 | 支持平台
| ------------------ | -------- | --- |
| [color](style/color.md) | 否  |  Android、iOS

# borderRadius

| 类型   | 必需 | 支持平台
| ------ | -------- | --- |
| number | 否   | Android、iOS

# borderTopLeftRadius

| 类型   | 必需 | 支持平台
| ------ | -------- | --- |
| number | 否       | Android、iOS

# borderTopRightRadius

| 类型   | 必需 | 支持平台
| ------ | -------- | --- |
| number | 否       | Android、iOS

# borderBottomLeftRadius

| 类型   | 必需 | 支持平台
| ------ | -------- | --- |
| number | 否       | Android、iOS

# borderBottomRightRadius

| 类型   | 必需 | 支持平台
| ------ | -------- | --- |
| number | 否       | Android、iOS

# borderWidth

| 类型   | 必需 | 支持平台
| ------ | -------- | --- |
| number | 否       | Android、iOS

# borderTopWidth

| 类型   | 必需 | 支持平台
| ------ | -------- | --- |
| number | 否       | iOS

# borderBottomWidth

| 类型   | 必需 | 支持平台
| ------ | -------- | --- |
| number | 否       | iOS

# borderLeftWidth

| 类型   | 必需 | 支持平台
| ------ | -------- | --- |
| number | 否       | iOS

# borderRightWidth

| 类型   | 必需 | 支持平台
| ------ | -------- | --- |
| number | 否       | iOS

# backgroundColor

| 类型               | 必需 | 支持平台
| ------------------ | -------- | --- |
| [color](style/color.md) | 否   | Android、iOS

# borderStyle

> 默认值为 `solid`

| 类型                              | 必需 | 支持平台
| --------------------------------- | -------- | --- |
| enum('solid', 'dotted', 'dashed') | 否   | Android、iOS。dotted、dashed 暂仅支持 iOS


# boxShadow

| 类型   | 必需 | 平台 | 
| ------ | -------- | --------|
| [Hippy-React 参考例子](https://github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/components/BoxShadow/index.jsx) | 否 | Android、iOS，Android实现有差异（详见例子）
| [Hippy-Vue 参考例子](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-shadow.vue) | 否 | Android、iOS，Android实现有差异（详见例子）

# color

字体颜色

| 类型   | 必需 | 支持平台
| ------ | -------- | --- |
| [color](style/color.md) | 否 | Android、iOS

# fontFamily

字体名，如 `PingFangSC-Regular`

若需自定义字体，参考 [自定义字体说明](guide/custom-font)

| 类型   | 必需 | 支持平台
| ------ | -------- | --- |
| string | 否 | Android、iOS

# fontSize

字体大小

> 默认值为 `14`

| 类型   | 必需 | 支持平台
| ------ | -------- | --- |
| number | 否  | Android、iOS

# fontStyle

字体样式

> 默认值为 `normal`

| 类型                     | 必需 | 支持平台     |
| ------------------------ | ---- | ------------ |
| enum('normal', 'italic') | 否   | Android、iOS |

# fontWeight

字体粗细

[[MDN 文档]](//developer.mozilla.org/zh-CN/docs/Web/CSS/font-weight)

| 类型   | 必需 | 支持平台
| ------ | -------- | --- |
| number \| string | 否 | Android、iOS

# letterSpacing

文本字符间距

[[MDN 文档]](//developer.mozilla.org/zh-CN/docs/Web/CSS/letter-spacing)

!> hippy-vue 需采用 @hippy/vue-css-loader `2.14.1` 以上版本

!> 在部分 Android 设备上，letterSpacing 设置负值有兼容性问题，可能会导致在非预期的位置换行

| 类型   | 必需 | 支持平台
| ------ | -------- | --- |
| number | 否 | Android、iOS

# opacity

| 类型   | 必需 | 支持平台
| ------ | -------- | --- |
| number | 否  | Android、iOS

# textDecoration

同 `textDecorationLine`

| 类型   | 必需 | 平台 | 
| ------ | -------- | --------|
| enum('underline', 'line-through', 'none')  | 否 | Android、iOS |

# textDecorationColor

[Hippy-React 范例](https://github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/components/Text/index.jsx)

[Hippy-Vue 范例](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-p.vue)

文本的修饰线颜色

| 类型   | 必需 | 平台 |
| ------ | -------- | --------|
| [color](style/color.md)  | 否 | iOS |

# textDecorationLine

[Hippy-React 范例](https://github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/components/Text/index.jsx)

[Hippy-Vue 范例](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-p.vue)

文本的修饰线类型

| 类型   | 必需 | 平台 | 
| ------ | -------- | --------|
| enum('underline', 'line-through', 'none')  | 否 | Android、iOS |

# textDecorationStyle

[Hippy-React 范例](https://github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/components/Text/index.jsx)

[Hippy-Vue 范例](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-p.vue)

文本的修饰线样式

| 类型   | 必需 | 平台 | 
| ------ | -------- | --------|
| enum('dotted', 'dashed', 'solid')  | 否 | iOS |

# textShadowColor

> 最低支持版本 2.10.0

[Hippy-React 范例](https://github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/components/Text/index.jsx)

[Hippy-Vue 范例](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-p.vue)

文字阴影颜色

| 类型   | 必需 | 平台 | 
| ------ | -------- | --------|
| [color](style/color.md)  | 否 | Android、iOS |

# textShadowOffset

> 最低支持版本 2.10.0

[Hippy-React 范例](https://github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/components/Text/index.jsx)

[Hippy-Vue 范例](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-p.vue)

文字阴影偏移量

| 类型   | 必需 | 平台 | 
| ------ | -------- | --------|
| object: { x: number, y: number }  | 否 | Android、iOS |

# textShadowOffsetX

> * 最低支持版本 2.10.0
> * 注意 hippy-vue class 样式只支持合并写法 `text-shadow-offset: 1px 1px`，不支持拆分

[Hippy-React 范例](https://github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/components/Text/index.jsx)

[Hippy-Vue 范例](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-p.vue)

文字阴影X轴偏移量

| 类型   | 必需 | 平台 | 
| ------ | -------- | --------|
| number | 否 | Android、iOS |

# textShadowOffsetY

> * 最低支持版本 2.10.0
> * 注意 hippy-vue class 样式只支持合并写法 `text-shadow-offset: 1px 1px`，不支持拆分

[Hippy-React 范例](https://github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/components/Text/index.jsx)

[Hippy-Vue 范例](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-p.vue)

文字阴影Y轴偏移量

| 类型   | 必需 | 平台 | 
| ------ | -------- | --------|
| number  | 否 | Android、iOS |

# textShadowRadius

> 最低支持版本 2.10.0

[Hippy-React 范例](https://github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/components/Text/index.jsx)

[Hippy-Vue 范例](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-p.vue)

文字阴影半径

| 类型   | 必需 | 平台 | 
| ------ | -------- | --------|
| number | 否 | Android、iOS |

# tintColor

[Hippy-React 范例](https://github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/components/Image/index.jsx)

[Hippy-Vue 范例](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-img.vue)

对图片进行染色(对非纯色图片进行有透明度的染色时，Android 和 iOS 的 `blendMode` 默认值有差异)

| 类型               | 必需 | 支持平台
| ------------------ | -------- | --- |
| [color](style/color.md) | 否  |  Android、iOS

# visibility

| 类型   | 必需 | 支持平台
| ------ | -------- | --- |
| enum('visible'[default]， 'hidden') | 否 | Android(2.14.5)、iOS（2.9.0）

