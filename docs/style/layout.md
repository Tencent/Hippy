# 布局

Hippy 的样式排版使用了 Flex 布局。值得注意的是，尚不兼容网页的百分比布局。

---

<!-- toc -->

# alignItems

[[MDN 文档]](//developer.mozilla.org/zh-CN/docs/Web/CSS/align-items)

`alignItems`决定了子元素在次轴方向的排列方式（此样式设置在父元素上）。例如若子元素本来是沿着竖直方向排列的（即主轴竖直，次轴水平），则`alignItems`决定了它们在水平方向的排列方式。此样式和CSS中的`alignItems`表现一致，默认值为stretch。

| 类型                                                            | 必需 |
| --------------------------------------------------------------- | -------- |
| enum('flex-start', 'flex-end', 'center', 'stretch', 'baseline') | 否       |

# alignSelf

[[MDN 文档]](//developer.mozilla.org/zh-CN/docs/Web/CSS/align-self)

`alignSelf`决定了元素在父元素的次轴方向的排列方式（此样式设置在子元素上），其值会覆盖父元素的`alignItems`的值。其表现和 CSS 上的`align-self`一致（默认值为auto）。

| 类型                                                                    | 必需 |
| ----------------------------------------------------------------------- | -------- |
| enum('auto', 'flex-start', 'flex-end', 'center', 'stretch', 'baseline') | 否       |

# borderBottomWidth

[[MDN 文档]](//developer.mozilla.org/zh-CN/docs/Web/CSS/border-bottom-width)

`borderBottomWidth`和 CSS 上的`border-bottom-width`表现一致。

| 类型   | 必需 |
| ------ | -------- |
| number | 否       |

# borderLeftWidth

[[MDN 文档]](//developer.mozilla.org/zh-CN/docs/Web/CSS/border-left-width)

`borderLeftWidth`和 CSS 上的`border-left-width`表现一致。

| 类型   | 必需 |
| ------ | -------- |
| number | 否       |

# borderRightWidth

[[MDN 文档]](//developer.mozilla.org/zh-CN/docs/Web/CSS/border-right-width)

`borderRightWidth` 和 CSS 上的`border-right-width`表现一致。

| 类型   | 必需 |
| ------ | -------- |
| number | 否       |

# borderTopWidth

[[MDN 文档]](//developer.mozilla.org/zh-CN/docs/Web/CSS/border-top-width)

`borderTopWidth`和 CSS 上的`border-top-width`表现一致。

| 类型   | 必需 |
| ------ | -------- |
| number | 否       |

# borderWidth

[[MDN 文档]](//developer.mozilla.org/zh-CN/docs/Web/CSS/border-width)

`borderWidth`和 CSS 上的`border-width`表现一致。

| 类型   | 必需 |
| ------ | -------- |
| number | 否       |

# bottom

[MDN 文档](//developer.mozilla.org/zh-CN/docs/Web/CSS/bottom)

`bottom` 值是指将本组件定位到距离底部多少个逻辑像素（底部的定义取决于position属性）。

它的表现和 CSS 上的bottom类似，但注意在Hippy上只能使用逻辑像素值（数字单位），而不能使用百分比、em、rem、vh 或是任何其他单位。

| 类型            | 必需 |
| --------------- | -------- |
| number | 否       |

# backgroundImage

[[MDN 文档]](//developer.mozilla.org/zh-CN/docs/Web/CSS/background-image)

`backgroundImage` 值可以直接传入背景图片地址，让这张图片渲染为一个`View`组件的背景图片。

| 类型            | 必需 |
| --------------- | -------- |
| string | 否      |

# backgroundPositionX

[[MDN 文档]](//developer.mozilla.org/zh-CN/docs/Web/CSS/background-position)

`backgroundPositionX` 指定背景图片的初始位置的横轴X坐标。

| 类型            | 必需 |
| --------------- | -------- |
| number | 否       |

# backgroundPositionY

[[MDN 文档]](//developer.mozilla.org/zh-CN/docs/Web/CSS/background-position)

`backgroundPositionY` 指定背景图片的初始位置的竖轴Y坐标。

| 类型            | 必需 |
| --------------- | -------- |
| number | 否       |

# flex

[[MDN 文档]](//developer.mozilla.org/zh-CN/docs/Web/CSS/flex)

在 Hippy 中 flex 的表现和 CSS 有些区别。 flex 在 Hippy 中只能为整数值。

| 类型   | 必需 |
| ------ | -------- |
| number | 否       |

# flexBasis

[[MDN 文档]](//developer.mozilla.org/zh-CN/docs/Web/CSS/flex-basis)

`flex-basis` 指定了 flex 元素在主轴方向上的初始大小。

| 类型   | 必需 |
| ------ | -------- |
| number | 否       |

# flexDirection

[[MDN 文档]](//developer.mozilla.org/zh-CN/docs/Web/CSS/flex-direction)

`flexDirection` 决定了容器的子元素的排列方向：`row` 代表水平排列, `column` 代表垂直排列。其他两个参数是反向排列。
它跟 css 的 flex-direction 定义很像，但 css 是默认值为 `row`，而 Hippy 默认是 `column`。

| 类型                                                   | 必需 |
| ------------------------------------------------------ | -------- |
| enum('row', 'row-reverse', 'column', 'column-reverse') | 否       |

# flexGrow

[[MDN 文档]](//developer.mozilla.org/zh-CN/docs/Web/CSS/flex-grow)

`flexGrow` 定义伸缩项目的扩展能力。它接受一个不带单位的值做为一个比例。主要用来决定伸缩容器剩余空间按比例应扩展多少空间。

如果所有伸缩项目的 `flex-grow` 设置了 `1`，那么每个伸缩项目将设置为一个大小相等的剩余空间。如果你给其中一个伸缩项目设置了 `flex-grow` 值为 `2`，那么这个伸缩项目所占的剩余空间是其他伸缩项目所占剩余空间的两倍。

| 类型   | 必需 |
| ------ | -------- |
| number | 否       |

# flexShrink

[[MDN 文档]](//developer.mozilla.org/zh-CN/docs/Web/CSS/flex-shrink )

`注意：Hippy 中 flexShrink 默认值为 0，与Web标准有差异`

`flexBasis` 属性指定了 flex 元素的收缩规则。flex 元素仅在默认宽度之和大于容器的时候才会发生收缩，其收缩的大小是依据 flex-shrink 的值。

| 类型   | 必需 |
| ------ | -------- |
| number | 否       |

# flexWrap

[[MDN 文档]](//developer.mozilla.org/zh-CN/docs/Web/CSS/flex-wrap)

`flexWrap` 定义了子元素如何在接触到父容器底部时执行换行的行为。

| 类型                   | 必需 |
| ---------------------- | -------- |
| enum('wrap', 'nowrap') | 否       |

# height

[[MDN 文档]](//developer.mozilla.org/zh-CN/docs/Web/CSS/height)

`height` 定义了容器的高度，单位为 pt

| 类型            | 必需 |
| --------------- | -------- |
| number, | 否       |

# justifyContent

[[MDN 文档]](//developer.mozilla.org/zh-CN/docs/Web/CSS/justify-content)

`justifyContent` 定义了浏览器如何分配顺着父容器主轴的弹性元素之间及其周围的空间。

| 类型                                                                                      | 必需 |
| ----------------------------------------------------------------------------------------- | -------- |
| enum('flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly') | 否       |

# left

[[MDN 文档]](//developer.mozilla.org/zh-CN/docs/Web/CSS/left)

`left` 值是指将本组件定位到距离左边多少个逻辑像素（左边的定义取决于position属性）。

它的表现和 CSS 上的 left 类似，但注意在 Hippy 上只能使用逻辑像素值（数字单位），而不能使用百分比、em或是任何其他单位。

| 类型            | 必需 |
| --------------- | -------- |
| number | 否       |

# lineHeight

[[MDN 文档]](//developer.mozilla.org/zh-CN/docs/Web/CSS/line-height)

`lineHeight` 属性用于设置多行元素的空间量，如多行文本的间距，hippy里仅支持设置具体数值。

| 类型            | 必需 |
| --------------- | -------- |
| number | 否       |

# margin

[[MDN 文档]](//developer.mozilla.org/zh-CN/docs/Web/CSS/margin)

设置 `margin` 与同时对`marginTop`, `marginLeft`, `marginBottom`, 和 `marginRight`设置了同样的值效果一致。

| 类型            | 必需 |
| --------------- | -------- |
| number | 否       |

# marginBottom

[[MDN 文档]](//developer.mozilla.org/zh-CN/docs/Web/CSS/margin-bottom)

`marginBottom` 和 CSS 的 `margin-bottom` 类似。

| 类型            | 必需 |
| --------------- | -------- |
| number | 否       |

# marginHorizontal

设置 `marginHorizontal` 与同时设置 `marginLeft` and `marginRight`一个值效果一致.

| 类型            | 必需 |
| --------------- | -------- |
| number | 否       |

# marginLeft

[[MDN 文档]](//developer.mozilla.org/zh-CN/docs/Web/CSS/margin-left)

`marginLeft` 与 CSS 的 `margin-left` 类似。

| 类型            | 必需 |
| --------------- | -------- |
| number | 否       |

# marginRight

[[MDN 文档]](//developer.mozilla.org/zh-CN/docs/Web/CSS/margin-right)

`marginRight` 与 CSS 的 `margin-right` 类似。

| 类型            | 必需 |
| --------------- | -------- |
| number | 否       |

# marginTop

[[MDN 文档]](//developer.mozilla.org/zh-CN/docs/Web/CSS/margin-top)

`marginTop` 和 CSS 的 `margin-top` 类似。

| 类型            | 必需 |
| --------------- | -------- |
| number | 否       |

# marginVertical

设置 `marginVertical` 与同时设置 `marginTop` and `marginBottom`一个值效果一致。

| 类型            | 必需 |
| --------------- | -------- |
| number | 否       |

# maxHeight

[[MDN 文档]](//developer.mozilla.org/zh-CN/docs/Web/CSS/max-height)

| 类型            | 必需 |
| --------------- | -------- |
| number | 否       |

# maxWidth

[[MDN 文档]](//developer.mozilla.org/zh-CN/docs/Web/CSS/max-width)

| 类型            | 必需 |
| --------------- | -------- |
| number | 否       |

# minHeight

[[MDN 文档]](//developer.mozilla.org/zh-CN/docs/Web/CSS/min-height)

| 类型            | 必需 |
| --------------- | -------- |
| number | 否       |

# minWidth

[[MDN 文档]](//developer.mozilla.org/zh-CN/docs/Web/CSS/min-width)

| 类型            | 必需 |
| --------------- | -------- |
| number | 否       |

# overflow

`overflow` 定义了子元素超过父容器宽高度后的显示情况 `overflow: hidden` 的情况会导致子元素被父容器切割超出显示范围的部分 `overflow: visible` 会让子容器正常显示全部，即使超出父容器的显示范围。

| 类型                                | 必需 |
| ----------------------------------- | -------- |
| enum('visible', 'hidden') | 否       |

# padding

[[MDN 文档]](//developer.mozilla.org/zh-CN/docs/Web/CSS/padding)

设置 `padding` 与同时设置`paddingTop`, `paddingBottom`, `paddingLeft`, 和 `paddingRight`一个值时效果一致。

| 类型            | 必需 |
| --------------- | -------- |
| numbe | 否       |

# paddingBottom

[[MDN 文档]](//developer.mozilla.org/zh-CN/docs/Web/CSS/padding-bottom)

`paddingBottom` 与 CSS 的 `padding-bottom` 类似。

| 类型            | 必需 |
| --------------- | -------- |
| number | 否       |

# paddingHorizontal

设置 `paddingHorizontal` 与同时设置  `paddingLeft` 和 `paddingRight`一个值时效果一致.

| 类型            | 必需 |
| --------------- | -------- |
| number | 否       |

# paddingLeft

[[MDN 文档]](//developer.mozilla.org/zh-CN/docs/Web/CSS/padding-left)

`paddingLeft` 与 CSS 的 `padding-left` 类似。

| 类型            | 必需 |
| --------------- | -------- |
| number | 否       |

# paddingRight

[[MDN 文档]](//developer.mozilla.org/zh-CN/docs/Web/CSS/padding-right)

`paddingRight` 和 CSS 的 `padding-right` 类似。

| 类型            | 必需 |
| --------------- | -------- |
| number | 否       |

# paddingTop

[[MDN 文档]](//developer.mozilla.org/zh-CN/docs/Web/CSS/padding-top)

`paddingTop` 和 CSS 的 `padding-top` 类似。

| 类型            | 必需 |
| --------------- | -------- |
| number | 否       |

# paddingVertical

设置 `paddingVertical` 与同时设置  `paddingTop` 和 `paddingBottom`一个值时效果一致.

| 类型            | 必需 |
| --------------- | -------- |
| number | 否       |

# position

[[MDN 文档]](//developer.mozilla.org/zh-CN/docs/Web/CSS/position)

`position` 在 Hippy 里表现与 CSS基本一致, 但是所有时候都是默认为 `relative`, 所以当元素设置 `absolute` 的时候可以保证永远只对上一级父元素绝对定位。

它和 CSS 的'position'属性类似，但hippy内的`position`只有`absolute`与`relative`两个属性。

| 类型                         | 必需 |
| ---------------------------- | -------- |
| enum('absolute', 'relative') | 否       |

# right

[[MDN 文档]](//developer.mozilla.org/zh-CN/docs/Web/CSS/right)

`right` 值是指将本组件定位到距离右边多少个逻辑像素（右边的定义取决于position属性）。

它的表现和 CSS 上的right类似，但注意在React Native上只能使用逻辑像素值（数字单位），而不能使用百分比、em或是任何其他单位。

| 类型            | 必需 |
| --------------- | -------- |
| number | 否       |

# top

[[MDN 文档]](//developer.mozilla.org/zh-CN/docs/Web/CSS/top)

`top` 值是指将本组件定位到距离顶部多少个逻辑像素（顶部的定义取决于position属性）。

它的表现和 CSS 上的top类似，但注意在React Native上只能使用逻辑像素值（数字单位），而不能使用百分比、em或是任何其他单位。

| 类型            | 必需 |
| --------------- | -------- |
| number | 否       |

# width

[[MDN 文档]](//developer.mozilla.org/zh-CN/docs/Web/CSS/width)

`width`定义了容器的宽度

| 类型            | 必需 |
| --------------- | -------- |
| number | 否       |

# zIndex

[[MDN 文档]](//developer.mozilla.org/zh-CN/docs/Web/CSS/z-index)

`zIndex` 决定了容器排列的顺序。一般情况下，你无需直接使用 `zIndex`，容器元素会按照节点树的顺序依次渲染，在后面的元素会覆盖前面的元素（如果有覆盖情况的话）。`zIndex` 可以在你需要手动指定绘制层级的情况使用。

| 类型   | 必需 |
| ------ | -------- |
| number | 否       |
