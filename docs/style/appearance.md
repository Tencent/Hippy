# 外观

包含了前景、背景、边框、透明度、字体等外观样式

# borderColor

| 类型               | 必需 | 支持平台
| ------------------ | -------- | --- |
| [color](style/color.md) | 否  | All

# borderTopColor

| 类型               | 必需 | 支持平台
| ------------------ | -------- | --- |
| [color](style/color.md) | 否  |  All

# borderBottomColor

| 类型               | 必需 | 支持平台
| ------------------ | -------- | --- |
| [color](style/color.md) | 否 | All

# borderLeftColor

| 类型               | 必需 | 支持平台
| ------------------ | -------- | --- |
| [color](style/color.md) | 否  |  All

# borderRightColor

| 类型               | 必需 | 支持平台
| ------------------ | -------- | --- |
| [color](style/color.md) | 否  |  All

# borderRadius

| 类型   | 必需 | 支持平台
| ------ | -------- | --- |
| number | 否   | All

# borderTopLeftRadius

| 类型   | 必需 | 支持平台
| ------ | -------- | --- |
| number | 否       | All

# borderTopRightRadius

| 类型   | 必需 | 支持平台
| ------ | -------- | --- |
| number | 否       | All

# borderBottomLeftRadius

| 类型   | 必需 | 支持平台
| ------ | -------- | --- |
| number | 否       | All

# borderBottomRightRadius

| 类型   | 必需 | 支持平台
| ------ | -------- | --- |
| number | 否       | All

# borderWidth

| 类型   | 必需 | 支持平台
| ------ | -------- | --- |
| number | 否       | All

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
| [color](style/color.md) | 否   | All

# borderStyle

| 类型                              | 必需 | 支持平台
| --------------------------------- | -------- | --- |
| enum('solid', 'dotted', 'dashed') | 否   | 双平台。dotted、dashed 暂仅支持 iOS


# boxShadow

| 类型   | 必需 | 平台 | 
| ------ | -------- | --------|
| [Hippy-React 参考例子](https://github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/components/BoxShadow/index.jsx) | 否 | 双平台支持，Android实现有差异（详见例子）
| [Hippy-Vue 参考例子](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-shadow.vue) | 否 | 双平台支持，Android实现有差异（详见例子）

# color

字体颜色

| 类型   | 必需 | 支持平台
| ------ | -------- | --- |
| [color](style/color.md) | 否 | All

# fontFamily

字体名，如 `PingFangSC-Regular`

若需自定义字体，参考 [自定义字体说明](guide/custom-font)

| 类型   | 必需 | 支持平台
| ------ | -------- | --- |
| string | 否 | All

# fontSize

字体大小

| 类型   | 必需 | 支持平台
| ------ | -------- | --- |
| number | 否  | All

# fontWeight

字体粗细

[[MDN 文档]](//developer.mozilla.org/zh-CN/docs/Web/CSS/font-weight)

| 类型   | 必需 | 支持平台
| ------ | -------- | --- |
| number \| string | 否 | All

# opacity

| 类型   | 必需 | 支持平台
| ------ | -------- | --- |
| number | 否  | All

# textDecoration

同 `textDecorationLine`

| 类型   | 必需 | 平台 | 
| ------ | -------- | --------|
| enum('underline', 'line-through', 'none')  | 否 | 双平台支持 |

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
| enum('underline', 'line-through', 'none')  | 否 | 双平台支持 |

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
| [color](style/color.md)  | 否 | 双平台支持 |

# textShadowOffset

> 最低支持版本 2.10.0

[Hippy-React 范例](https://github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/components/Text/index.jsx)

[Hippy-Vue 范例](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-p.vue)

文字阴影偏移量

| 类型   | 必需 | 平台 | 
| ------ | -------- | --------|
| object: { x: number, y: number }  | 否 | 双平台支持 |

# textShadowOffsetX

> * 最低支持版本 2.10.0
> * 注意 hippy-vue class 样式只支持合并写法 `text-shadow-offset: 1px 1px`，不支持拆分

[Hippy-React 范例](https://github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/components/Text/index.jsx)

[Hippy-Vue 范例](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-p.vue)

文字阴影X轴偏移量

| 类型   | 必需 | 平台 | 
| ------ | -------- | --------|
| number | 否 | 双平台支持 |

# textShadowOffsetY

> * 最低支持版本 2.10.0
> * 注意 hippy-vue class 样式只支持合并写法 `text-shadow-offset: 1px 1px`，不支持拆分

[Hippy-React 范例](https://github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/components/Text/index.jsx)

[Hippy-Vue 范例](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-p.vue)

文字阴影Y轴偏移量

| 类型   | 必需 | 平台 | 
| ------ | -------- | --------|
| number  | 否 | 双平台支持 |

# textShadowRadius

> 最低支持版本 2.10.0

[Hippy-React 范例](https://github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/components/Text/index.jsx)

[Hippy-Vue 范例](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-p.vue)

文字阴影半径

| 类型   | 必需 | 平台 | 
| ------ | -------- | --------|
| number | 否 | 双平台支持 |

# visibility

| 类型   | 必需 | 支持平台
| ------ | -------- | --- |
| enum('visible'[default]， 'hidden') | 否 | iOS（2.9.0）

