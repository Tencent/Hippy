# Appearance

Includes foreground,background,border,opacity,font and other appearance styles

# borderColor

| Type               | Required| Supported Platforms
| ------------------ | -------- | --- |
| [color](style/color.md) |false|  Android,iOS

# borderTopColor

| Type               | Required| Supported Platforms
| ------------------ | -------- | --- |
| [color](style/color.md) |false|   Android,iOS

# borderBottomColor

| Type               | Required| Supported Platforms
| ------------------ | -------- | --- |
| [color](style/color.md) |false|  Android,iOS

# borderLeftColor

| Type               | Required| Supported Platforms
| ------------------ | -------- | --- |
| [color](style/color.md) |false|   Android,iOS

# borderRightColor

| Type               | Required| Supported Platforms
| ------------------ | -------- | --- |
| [color](style/color.md) |false|   Android,iOS

# borderRadius

| Type   | Required| Supported Platforms
| ------ | -------- | --- |
| number |false   |  Android,iOS

# borderTopLeftRadius

| Type   | Required| Supported Platforms
| ------ | -------- | --- |
| number |false       |  Android,iOS

# borderTopRightRadius

| Type   | Required| Supported Platforms
| ------ | -------- | --- |
| number |false       |  Android,iOS

# borderBottomLeftRadius

| Type   | Required| Supported Platforms
| ------ | -------- | --- |
| number |false       |  Android,iOS

# borderBottomRightRadius

| Type   | Required| Supported Platforms
| ------ | -------- | --- |
| number |false       |  Android,iOS

# borderWidth

| Type   | Required| Supported Platforms
| ------ | -------- | --- |
| number |false       |  Android,iOS

# borderTopWidth

| Type   | Required| Supported Platforms
| ------ | -------- | --- |
| number |false       |  iOS

# borderBottomWidth

| Type   | Required| Supported Platforms
| ------ | -------- | --- |
| number |false       |  iOS

# borderLeftWidth

| Type   | Required| Supported Platforms
| ------ | -------- | --- |
| number |false       |  iOS

# borderRightWidth

| Type   | Required| Supported Platforms
| ------ | -------- | --- |
| number |false       |  iOS

# backgroundColor

| Type               | Required| Supported Platforms
| ------------------ | -------- | --- |
| [color](style/color.md) |false   |  Android,iOS

# borderStyle

| Type                              | Required| Supported Platforms
| --------------------------------- | -------- | --- |
| enum('solid', 'dotted', 'dashed') |false   |  Android,iOS.'dotted' and 'dashed' support iOS only for the time being


# boxShadow

| Type   | Required| Platform|
| ------ | -------- | --------|
| [Hippy-React reference example](https://github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/components/BoxShadow/index.jsx) |false| Android, iOS. Android implementation differences (see example for details)
| [Hippy-Vue reference example](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-shadow.vue) |false| Android, iOS. Android implementation differences (see example for details)

# color

Font color

| Type   | Required| Supported Platforms
| ------ | -------- | --- |
| [color](style/color.md) | false | Android,iOS

# fontFamily

Font name, such as`PingFangSC-Regular`

For custom fonts, refer to [custom font instructions](guide/custom-font)

| Type               | Required| Supported Platforms
| ------ | -------- | --- |
| string |false|  Android,iOS
 
# fontSize

Font size

| Type   | Required| Supported Platforms
| ------ | -------- | --- |
| number |false|  Android,iOS

# fontWeight

Font weight

[[MDN Docs]](//developer.mozilla.org/en-US/docs/Web/CSS/font-weight)

| Type               | Required| Supported Platforms
| ------ | -------- | --- |
| number \| string |false|  Android,iOS

# opacity

| Type   | Required| Supported Platforms
| ------ | -------- | --- |
| number |false|  Android,iOS

# textDecoration

Same as `textDecorationLine`

| Type   | Required| Supported Platforms
| ------ | -------- | --------|
| enum('underline', 'line-through', 'falsene')  | false | Android,iOS |

# textDecorationColor

[Hippy-React example](https://github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/components/Text/index.jsx)

[Hippy-Vue example](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-p.vue)

Decoration line color for text

| Type   | Required| Platform|
| ------ | -------- | --------|
| [color](style/color.md)  | false | iOS |

# textDecorationLine

[Hippy-React example](https://github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/components/Text/index.jsx)

[Hippy-Vue example](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-p.vue)

Decoration line type for text

| Type   | Required| Platform|
| ------ | -------- | --------|
| enum('underline', 'line-through', 'none')  |false|  Android,iOS |

# textDecorationStyle

[Hippy-React example](https://github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/components/Text/index.jsx)

[Hippy-Vue example](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-p.vue)

Decoration line style for text

| Type   | Required| Supported Platforms
| ------ | -------- | --------|
| enum('dotted', 'dashed', 'solid')  |false|  iOS |

# textShadowColor

> Minimum supported version 2.10.0

[Hippy-React example](https://github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/components/Text/index.jsx)

[Hippy-Vue example](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-p.vue)

Text shadow color

| Type   | Required| Supported Platforms
| ------ | -------- | --------|
| [color](style/color.md)  | false | Android,iOS |

# textShadowOffset

> Minimum supported version 2.10.0

[Hippy-React example](https://github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/components/Text/index.jsx)

[Hippy-Vue example](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-p.vue)

Text shadow offset

| Type   | Required| Platform|
| ------ | -------- | --------|
| object: { x: number, y: number }| false|  Android,iOS |

# textShadowOffsetX

* Minimum supported version 2.10.0
* Note that the Hippy-Vue class style only supports the combined writing method 'text shadow offset: 1px 1px', and does not support splitting

[Hippy-React example](https://github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/components/Text/index.jsx)

[Hippy-Vue example](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-p.vue)

Text shadow X-axis offset

| Type   | Required| Supported Platforms
| ------ | -------- | --------|
| number |false|  Android,iOS |

# textShadowOffsetY

> * Minimum supported version 2.10.0
>* Note that the Hippy-Vue class style only supports the combined writing method `text-shadow-offset: 1px 1px`, and does not support splitting

[Hippy-React example](https://github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/components/Text/index.jsx)

[Hippy-Vue example](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-p.vue)

Text shadow Y-axis offset

| Type   | Required| Platform|
| ------ | -------- | --------|
| number  |false|  Android,iOS |

# textShadowRadius

> * Minimum supported version 2.10.0

[Hippy-React example](https://github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/components/Text/index.jsx)

[Hippy-Vue example](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-p.vue)

Text shadow radius

| Type   | Required| Supported Platforms
| ------ | -------- | --------|
| number |false|  Android,iOS |

# tintColor

[Hippy-React example](https://github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/components/Image/index.jsx)

[Hippy-Vue example](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-img.vue)


Dye the image (when coloring the non-solid color image with transparency, the default values of 'blendmode' of Android and iOS are different)

| Type               | Required| Supported Platforms
| ------------------ | -------- | --- |
| [color](style/color.md) |false|   Android,iOS

# visibility

| Type   | Required| Supported Platforms
| ------ | -------- | --- |
| enum('visible'[default]， 'hidden') | false | iOS（2.9.0）

