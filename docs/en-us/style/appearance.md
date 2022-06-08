# Appearance

Includes foreground, background, border, opacity, font and other appearance styles.

# borderColor

| Type               | Required| Supported Platforms
| ------------------ | -------- | --- |
| [color](style/color.md) |No|  Android,iOS

# borderTopColor

| Type               | Required| Supported Platforms
| ------------------ | -------- | --- |
| [color](style/color.md) |No|   Android,iOS

# borderBottomColor

| Type               | Required| Supported Platforms
| ------------------ | -------- | --- |
| [color](style/color.md) |No|  Android,iOS

# borderLeftColor

| Type               | Required| Supported Platforms
| ------------------ | -------- | --- |
| [color](style/color.md) |No|   Android,iOS

# borderRightColor

| Type               | Required| Supported Platforms
| ------------------ | -------- | --- |
| [color](style/color.md) |No|   Android,iOS

# borderRadius

| Type   | Required| Supported Platforms
| ------ | -------- | --- |
| number |No   |  Android,iOS

# borderTopLeftRadius

| Type   | Required| Supported Platforms
| ------ | -------- | --- |
| number |No       |  Android,iOS

# borderTopRightRadius

| Type   | Required| Supported Platforms
| ------ | -------- | --- |
| number |No       |  Android,iOS

# borderBottomLeftRadius

| Type   | Required| Supported Platforms
| ------ | -------- | --- |
| number |No       |  Android,iOS

# borderBottomRightRadius

| Type   | Required| Supported Platforms
| ------ | -------- | --- |
| number |No       |  Android,iOS

# borderWidth

| Type   | Required| Supported Platforms
| ------ | -------- | --- |
| number |No       |  Android,iOS

# borderTopWidth

| Type   | Required| Supported Platforms
| ------ | -------- | --- |
| number |No       |  iOS

# borderBottomWidth

| Type   | Required| Supported Platforms
| ------ | -------- | --- |
| number |No       |  iOS

# borderLeftWidth

| Type   | Required| Supported Platforms
| ------ | -------- | --- |
| number |No       |  iOS

# borderRightWidth

| Type   | Required| Supported Platforms
| ------ | -------- | --- |
| number |No       |  iOS

# backgroundColor

| Type               | Required| Supported Platforms
| ------------------ | -------- | --- |
| [color](style/color.md) |No   |  Android,iOS

# borderStyle

| Type                              | Required| Supported Platforms
| --------------------------------- | -------- | --- |
| enum('solid', 'dotted', 'dashed') |No   |  Android,iOS.'dotted' and 'dashed' only support iOS for the time being


# boxShadow

| Type   | Required| Supported Platforms|
| ------ | -------- | --------|
| [Hippy-React reference example](https://github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/components/BoxShadow/index.jsx) |No| Android, iOS. Android has different implementation (see example for details)
| [Hippy-Vue reference example](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-shadow.vue) |No| Android, iOS. Android has different implementation (see example for details)

# color

Font color

| Type   | Required| Supported Platforms
| ------ | -------- | --- |
| [color](style/color.md) | No | Android,iOS

# fontFamily

Font name, such as`PingFangSC-Regular`

For custom fonts, refer to [custom font instructions](guide/custom-font)

| Type               | Required| Supported Platforms
| ------ | -------- | --- |
| string |No|  Android,iOS
 
# fontSize

Font size

| Type   | Required| Supported Platforms
| ------ | -------- | --- |
| number |No|  Android,iOS

# fontWeight

Font weight

[[MDN Docs]](//developer.mozilla.org/en-US/docs/Web/CSS/font-weight)

| Type               | Required| Supported Platforms
| ------ | -------- | --- |
| number \| string |No|  Android,iOS

# opacity

| Type   | Required| Supported Platforms
| ------ | -------- | --- |
| number |No|  Android,iOS

# textDecoration

Same as `textDecorationLine`

| Type                                      | Required | Supported Platforms
|-------------------------------------------|----------| --------|
| enum('underline', 'line-through', 'none') | No       | Android,iOS |

# textDecorationColor

[Hippy-React example](https://github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/components/Text/index.jsx)

[Hippy-Vue example](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-p.vue)

Decoration line color for text

| Type   | Required| Supported Platforms|
| ------ | -------- | --------|
| [color](style/color.md)  | No | iOS |

# textDecorationLine

[Hippy-React example](https://github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/components/Text/index.jsx)

[Hippy-Vue example](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-p.vue)

Decoration line type for text

| Type   | Required| Supported Platforms|
| ------ | -------- | --------|
| enum('underline', 'line-through', 'none')  |No|  Android,iOS |

# textDecorationStyle

[Hippy-React example](https://github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/components/Text/index.jsx)

[Hippy-Vue example](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-p.vue)

Decoration line style for text

| Type   | Required| Supported Platforms
| ------ | -------- | --------|
| enum('dotted', 'dashed', 'solid')  |No|  iOS |

# textShadowColor

> Minimum supported version 2.10.0

[Hippy-React example](https://github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/components/Text/index.jsx)

[Hippy-Vue example](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-p.vue)

Text shadow color

| Type   | Required| Supported Platforms
| ------ | -------- | --------|
| [color](style/color.md)  | No | Android,iOS |

# textShadowOffset

> Minimum supported version 2.10.0

[Hippy-React example](https://github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/components/Text/index.jsx)

[Hippy-Vue example](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-p.vue)

Text shadow offset

| Type   | Required| Supported Platforms|
| ------ | -------- | --------|
| object: { x: number, y: number }| No|  Android,iOS |

# textShadowOffsetX

* Minimum supported version 2.10.0
* Note that the Hippy-Vue class style only supports the combined write format 'text shadow offset: 1px 1px', and does not support splitting

[Hippy-React example](https://github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/components/Text/index.jsx)

[Hippy-Vue example](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-p.vue)

Text shadow X-axis offset

| Type   | Required| Supported Platforms
| ------ | -------- | --------|
| number |No|  Android,iOS |

# textShadowOffsetY

> * Minimum supported version 2.10.0
>* Note that the Hippy-Vue class style only supports the combined write format `text-shadow-offset: 1px 1px`, and does not support splitting

[Hippy-React example](https://github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/components/Text/index.jsx)

[Hippy-Vue example](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-p.vue)

Text shadow Y-axis offset

| Type   | Required| Supported Platforms|
| ------ | -------- | --------|
| number  |No|  Android,iOS |

# textShadowRadius

> * Minimum supported version 2.10.0

[Hippy-React example](https://github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/components/Text/index.jsx)

[Hippy-Vue example](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-p.vue)

Text shadow radius

| Type   | Required| Supported Platforms
| ------ | -------- | --------|
| number |No|  Android,iOS |

# tintColor

[Hippy-React example](https://github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/components/Image/index.jsx)

[Hippy-Vue example](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-img.vue)


Tint the image (When tinting the non-solid color image with transparency, there is a difference in the default value of 'blendmode' between Android and iOS)

| Type               | Required| Supported Platforms
| ------------------ | -------- | --- |
| [color](style/color.md) |No|   Android,iOS

# visibility

| Type                               | Required| Supported Platforms
|------------------------------------| -------- | --- |
| enum('visible'[default], 'hidden') | No | iOS（2.9.0）

