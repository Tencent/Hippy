# Layout

Hippy's style layout uses a Flex layout. It is worth noting that the `PercentFrameLayout` of web pages is not yet compatible.

---

<!-- toc -->

# alignItems

[[MDN Docs]](//developer.mozilla.org/en-US/docs/Web/CSS/align-items)

`alignItems` determines how the child elements are arranged in the direction of the secondary axis (this style is set on the parent element). For example, if the child elements are originally arranged in a vertical direction (i.e., The primary axis is vertical and the secondary axis is horizontal), the `alignItems` determines how they are arranged in the horizontal direction. Its behavior is consistent with that on CSS `align-items`(default is`stretch`).

| Type                                                            | Required|
| --------------------------------------------------------------- | -------- |
| enum('flex-start', 'flex-end', 'center', 'stretch', 'baseline') |false       |

# alignSelf

[[MDN Docs]](//developer.mozilla.org/en-US/docs/Web/CSS/align-self)

`alignSelf` determines how elements are arranged in the direction of the secondary axis of the parent element (this style is set on the child element), and its value overrides the value of the parent element `alignItems`. Its behavior is consistent with that on CSS `align-self`(default is`auto`).

| Type                                                                    | Required|
| ----------------------------------------------------------------------- | -------- |
| enum('auto', 'flex-start', 'flex-end', 'center', 'stretch', 'baseline') |false       |


# backgroundImage

[[MDN Docs]](//developer.mozilla.org/en-US/docs/Web/CSS/background-image)

`backgroundImage` value can be directly passed into the background image address or gradient.

| Type            | Required|
| --------------- | -------- |
| string |false      |

>after`2.8.1` the version, it supports the local image capability of the terminal and can be loaded through webpack `file-loader`.

>Gradient currently support `linear-gradient` linear gradient`(Minimum supported version 2.8.0）` [[MDN Docs]](//developer.mozilla.org/en-US/docs/Web/CSS/gradient/linear-gradient),and supports the use of `linear-gradient([ [ [ <angle> | to [top | bottom] || [left | right] ],]? <color-stop>[, <color-stop>]+)` format. Among them, `angle` supports `deg`, `turn` and `rad` units, and `color-stop` supports setting multiple colors and percentages. DEMO:[Hippy-React](//github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/components/View/index.jsx) [Hippy-Vue](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-div.vue)
> <br/>
> <br/>
>Note:
>
>+ Android can not use percentages if you use`to [top | bottom] || [left | right]` four top corners to set the gradient angle `color-stop`;
>+ iOS `color-stop` percentage can only be explicitly set from small to large, and can not be partially omitted, that is,`red 10%, yellow 20%, blue 50%` can not be`red 10%, yellow 20%, blue 10%`

# backgroundPositionX

[[MDN Docs]](//developer.mozilla.org/en-US/docs/Web/CSS/background-position)

`backgroundPositionX` specifies the horizontal X-coordinate of the initial position of the background image.

| Type            | Required|
| --------------- | -------- |
| number |false       |

# backgroundPositionY

[[MDN Docs]](//developer.mozilla.org/en-US/docs/Web/CSS/background-position)

`backgroundPositionY` specifies the vertical Y-coordinate of the initial position of the background image.

| Type            | Required|
| --------------- | -------- |
| number |false       |

# backgroundSize

[[MDN Docs]](//developer.mozilla.org/en-US/docs/Web/CSS/background-size)

`backgroundSize` sets the background image size.

| Type            | Required|
| --------------- | -------- |
| enum('cover', 'contain') |false       |

# collapsable

In Android, if a `View` subcomponent is used only to layout it, it may be removed from the native layout tree for optimization, so the reference to the DOM of that node is lost`(for example, the size and location information cannot be obtained by calling measureInAppWindow)`. Set this property to `false` disable this optimization to ensure that the corresponding view exists in the native structure.(It can also be set as the `Attribute` attribute of `View`)

| Type            | Required| Supported Platforms|
| --------------- | -------- | ---- |
| enum('false'， 'true'[default]) | false       | Android|

# display

Hippy adopts Flex layout by default. Also, because it only supports Flex layout, it can be used without handwritten `display: flex`.

| Type            | Required|
| --------------- | -------- |
| enum('flex') |false       |

# flex

[[MDN Docs]](//developer.mozilla.org/en-US/docs/Web/CSS/flex)

There's a difference between flex and CSS in Hippy. Flex can only be an integer value in Hippy.

| Type   | Required|
| ------ | -------- |
| number |false       |

# flexBasis

[[MDN Docs]](//developer.mozilla.org/en-US/docs/Web/CSS/flex-basis)

`flex-basis` specifies the initial size of the flex element in the direction of the primary axis.

| Type   | Required|
| ------ | -------- |
| number |false       |

# flexDirection

[[MDN Docs]](//developer.mozilla.org/en-US/docs/Web/CSS/flex-direction)

`flexDirection` determines the direction in which the child elements of the container are arranged:`row` for horizontal arrangement and`column` for vertical arrangement. The other two parameters are reversed.
It's much like css's `flex-direction` definition, but css defaults to`row`, and Hippy defaults to`column`.

| Type                                                   | Required|
| ------------------------------------------------------ | -------- |
| enum('row', 'row-reverse', 'column', 'column-reverse') |false       |

# flexGrow

[[MDN Docs]](//developer.mozilla.org/en-US/docs/Web/CSS/flex-grow)

`flexGrow` defines the extensibility of the scaling project. It accepts a value without units as a scale. It is mainly used to determine how much space the remaining space of the telescopic container should be expanded proportionally.

If all scaling items are`flex-grow` set,`1` then each scaling item will be set to an equal amount of remaining space. If you set a`flex-grow` value of for`2` one of the scaling items, the remaining space for that scaling item is twice as large as the remaining space for the other scaling items.

| Type   | Required|
| ------ | -------- |
| number |false       |

# flexShrink

[[MDN Docs]](//developer.mozilla.org/en-US/docs/Web/CSS/flex-shrink )

`Note: the default value of flexsShrink in Hippy is 0, which is different from the web standard`

`flexBasis` property specifies the shrink rule for the flex element. Flex elements shrink only if the sum of the default widths is greater than the container, and the size of the shrink is based on the flex width shrink value.

| Type   | Required|
| ------ | -------- |
| number |false       |

# flexWrap

[[MDN Docs]](//developer.mozilla.org/en-US/docs/Web/CSS/flex-wrap)

`flexWrap` defines how a child element performs line wrapping behavior when it touches the bottom of the parent container.

| Type                   | Required|
| ---------------------- | -------- |
| enum('wrap', 'nowrap') |false       |

# height

[[MDN Docs]](//developer.mozilla.org/en-US/docs/Web/CSS/height)

`height` defines the height of the container in pt

| Type            | Required|
| --------------- | -------- |
| number, |false       |

# justifyContent

[[MDN Docs]](//developer.mozilla.org/en-US/docs/Web/CSS/justify-content)

`justifyContent` defines how the browser allocates space between and around elastic elements that follow the main axis of the parent container.

| Type                                                                                      | Required|
| ----------------------------------------------------------------------------------------- | -------- |
| enum('flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly') |false       |

# left

[[MDN Docs]](//developer.mozilla.org/en-US/docs/Web/CSS/left)

`left` value refers to how many logical pixels the component is positioned to the left (the definition of the left depends on the position attribute).

It behaves like `left` on CSS, but note that only logical pixel values (numerical units) can be used on Hippy, not percentages, em, or any other unit.

| Type            | Required|
| --------------- | -------- |
| number |false       |

# lineHeight

[[MDN Docs]](//developer.mozilla.org/en-US/docs/Web/CSS/line-height)

`lineHeight` property is used to set the amount of space for multiline elements, such as the spacing of multiline text. Hippy only supports setting specific values.

| Type            | Required|
| --------------- | -------- |
| number |false       |

# margin

[[MDN Docs]](//developer.mozilla.org/en-US/docs/Web/CSS/margin)

Setting `margin` has the same effect as setting the same values for `marginTop`, `marginLeft`, `marginBottom`, and `marginRight`.

| Type            | Required|
| --------------- | -------- |
| number |false       |

# marginBottom

[[MDN Docs]](//developer.mozilla.org/en-US/docs/Web/CSS/margin-bottom)

`marginBottom` similar to CSS `margin-bottom`.

| Type            | Required|
| --------------- | -------- |
| number |false       |

# marginHorizontal

Setting `marginHorizontal` has the same effect as setting `marginLeft` and `marginRight` at the same time

| Type            | Required|
| --------------- | -------- |
| number |false       |

# marginLeft

[[MDN Docs]](//developer.mozilla.org/en-US/docs/Web/CSS/margin-left)

`marginLeft` similar to CSS `margin-left`.

| Type            | Required|
| --------------- | -------- |
| number |false       |

# marginRight

[[MDN Docs]](//developer.mozilla.org/en-US/docs/Web/CSS/margin-right)

`marginRight` similar to CSS `margin-right`.

| Type            | Required|
| --------------- | -------- |
| number |false       |

# marginTop

[[MDN Docs]](//developer.mozilla.org/en-US/docs/Web/CSS/margin-top)

`marginTop` similar to CSS `margin-top`.

| Type            | Required|
| --------------- | -------- |
| number |false       |

# marginVertical

Setting `marginVertical` has the same effect as setting `marginTop` and `marginBottom` at the same time

| Type            | Required|
| --------------- | -------- |
| number |false       |

# maxHeight

[[MDN Docs]](//developer.mozilla.org/en-US/docs/Web/CSS/max-height)

| Type            | Required|
| --------------- | -------- |
| number |false       |

# maxWidth

[[MDN Docs]](//developer.mozilla.org/en-US/docs/Web/CSS/max-width)

| Type            | Required|
| --------------- | -------- |
| number |false       |

# minHeight

[[MDN Docs]](//developer.mozilla.org/en-US/docs/Web/CSS/min-height)

| Type            | Required|
| --------------- | -------- |
| number |false       |

# minWidth

[[MDN Docs]](//developer.mozilla.org/en-US/docs/Web/CSS/min-width)

| Type            | Required|
| --------------- | -------- |
| number |false       |

# overflow


`overflow` defines the display of the child element after it exceeds the width and height of the parent container. The condition of `overflow: hidden` will cause the child element to be cut by the parent container. The part beyond the display range will be displayed normally by the child container, even if it exceeds the display range of the parent container.

!> For historical reasons, Android defaults to all elements `overflow: hidden` and iOS to`overflow: visible`

| Type                                | Required|
| ----------------------------------- | -------- |
| enum('visible', 'hidden') |false       |

# padding

[[MDN Docs]](//developer.mozilla.org/en-US/docs/Web/CSS/padding)

Setting `padding` has the same effect as setting `paddingTop`, `paddingBottom`, `paddingLeft`, and `paddingRight` at the same time.

| Type            | Required|
| --------------- | -------- |
| numbe |false       |

# paddingBottom

[[MDN Docs]](//developer.mozilla.org/en-US/docs/Web/CSS/padding-bottom)

`paddingBottom` similar to CSS `padding-bottom`.

| Type            | Required|
| --------------- | -------- |
| number |false       |

# paddingHorizontal

Setting `paddingHorizontal` has the same effect as setting `paddingLeft` and `paddingRight` at the same time.

| Type            | Required|
| --------------- | -------- |
| number |false       |

# paddingLeft

[[MDN Docs]](//developer.mozilla.org/en-US/docs/Web/CSS/padding-left)

`paddingLeft` similar to CSS `padding-left`.

| Type            | Required|
| --------------- | -------- |
| number |false       |

# paddingRight

[[MDN Docs]](//developer.mozilla.org/en-US/docs/Web/CSS/padding-right)

`paddingRight` similar to CSS `padding-right`.

| Type            | Required|
| --------------- | -------- |
| number |false       |

# paddingTop

[[MDN Docs]](//developer.mozilla.org/en-US/docs/Web/CSS/padding-top)

`paddingTop` similar to CSS `padding-top`.

| Type            | Required|
| --------------- | -------- |
| number |false       |

# paddingVertical

Setting `paddingVertical` has the same effect as setting `paddingTop` and `paddingBottom` at the same time.

| Type            | Required|
| --------------- | -------- |
| number |false       |

# position

[[MDN Docs]](//developer.mozilla.org/en-US/docs/Web/CSS/position)


The behaves of `position` in Hippy is basically the same as that in CSS, but it defaults to 'relative' all the time. Therefore, when the element is set to 'absolute', it can always ensure that only the parent element of the upper level is absolutely positioned.

It is similar to the `position` attribute of CSS, but there are `position` only `absolute``relative` two attributes in Hippy.

| Type                         | Required|
| ---------------------------- | -------- |
| enum('absolute', 'relative') |false       |

# right

[[MDN Docs]](//developer.mozilla.org/en-US/docs/Web/CSS/right)

`right` value refers to how many logical pixels the component is positioned to the right (the definition of the right depends on the position attribute).

It behaves like `right` on CSS, but note that only logical pixel values (numerical units) can be used on Hippy, not percentages, em, or any other unit.


| Type            | Required|
| --------------- | -------- |
| number |false       |

# top

[[MDN Docs]](//developer.mozilla.org/en-US/docs/Web/CSS/top)

`top` The value is how many logical pixels the component is positioned from the top (the definition of the top depends on the position property).

It behaves like `top` on CSS, but note that only logical pixel values (numerical units) can be used on Hippy, not percentages, em, or any other unit.

| Type            | Required|
| --------------- | -------- |
| number |false       |

# width

[[MDN Docs]](//developer.mozilla.org/en-US/docs/Web/CSS/width)

`width` defines the width of the container

| Type            | Required|
| --------------- | -------- |
| number |false       |

# zIndex

[[MDN Docs]](//developer.mozilla.org/en-US/docs/Web/CSS/z-index)

`zIndex` determines the order in which the containers are arranged. Generally, you don't need to use `zIndex` directly. Container elements are rendered in the order of the node tree, with the following elements overwriting the previous elements (if any). zIndex levels can be used in situations where you need to manually specify drawing levels.

| Type   | Required|
| ------ | -------- |
| number |false       |
