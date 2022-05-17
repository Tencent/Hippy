<!-- markdownlint-disable no-duplicate-header -->

# terminal extension component

Extensions are convenient components provided by the terminal, which are provided by [@hippy/vue - native-components](//www.npmjs.com/package/@hippy/vue-native-components) in hippy-vue, but are not available in browsers because there is no `@hippy/vue-web-components`.

---

# animation

[[Sample：demo-animation.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/native-demos/demo-animation.vue)

This component is the animation solution of hippy-vue. It can trigger the action effect by directly passing in a style value and animation scheme array.

To be sure is an animation itself is a View, it will drive all the child nodes animation together, so if the animation need to separate control, need to split on the interface level.

## parameter

| parameter          | description                                                         | type                                      | supported platform |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| playing        | Controls whether the animation plays | boolean                                | `Android、iOS`    |
| actions*        | Animation scheme, is actually a style value to keep up with its animation scheme, please refer to the sample for details. | Object                                | `Android、iOS`    |

* actions detailed explanation
  
  Different from React, it combines single Animation and animation sequence AnimationSet into one. In fact, method is very simple. If an object is found to be Animation, if an array is animation sequence, AnimationSet is used for processing. For specific information of single animation parameter, refer to [Animation module](../hippy-react/modules.md?id=animation) and [sample](https://github.com/Tencent/Hippy/tree/master/examples/hippy-vue-demo/src/components/native-demos/animations). Note: The hippy-vue animation parameters have some [default values](https://github.com/Tencent/Hippy/blob/master/packages/hippy-vue-native-components/src/animation.js#L5), and only the differences need to be filled in. The loop playback parameter `repeatCount: 'loop'` is supported in `2.12.2` and above, and `repeatCount: -1` is used in lower versions.

  Special instructions, the actions after replacement will automatically create a new animation, need to manually start the new animation.There are two processing methods:
  * Replace the actions => delay after a certain time (such as setTimeout) call `this.[animation ref].start()` (recommend)
  * `playing = false`=> replace actions => delay after a certain time (such as setTimeout) `playing = true`
  
  Version 2.6.0 new `backgroundColor` background color gradient animation support, reference [gradient animation DEMO](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/native-demos/animations/color-change.vue)
  * set `actions` to decorate `backgroundColor`
  * set `valueType` to `color`
  * set `startValue` and `toValue` to [color value](style/color.md)

## event

> minimum supported version 2.5.2

| parameter          | description                                                         | type                                      | supported platform |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| start              | Trigger when animation starts                                  | `Function`                                                    | `Android、iOS`    |
| end         | Trigger when animation ends                                   | `Function`| `Android、iOS`    |
| repeat | Triggered every time a loop is played                                 | `Function` | `Android`   |

## method

> minimum supported version 2.5.2

### start

`() => void` Manually trigger the animation start (`playing` attribute set to `true` will automatically trigger the `start` function call)

### pause

`() => void` Manually trigger animation pause (`playing` attribute set to `false` will automatically trigger the `pause` function call)

### resume

`() => void` Manually trigger animation to continue (`playing` property set to `false` and then set to `true` will automatically trigger the `resume` function call)

### create

`() => void` Manually trigger animation creation

### reset

`() => void` Reset Start Marker

### destroy

`() => void` Destroy Animation

---

# dialog

[[sample：demo-dialog.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/native-demos/demo-dialog.vue)

Used for modal pop - up window, the default transparent background color, need to add a background color `<div>` fill.

## parameter

| parameter          | description                                                         | type                                      | supported platform |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| animationType         | Animation effects                                                            | `enum(none, slide, fade, slide_fade)` | `Android、iOS`    |
| supportedOrientations | Support for screen flip orientation                            | `enum(portrait, portrait-upside-down, landscape, landscape-left, landscape-right)[]` | `iOS`    |
| immersionStatusBar    | Whether it is an immersive status bar. `default: true`                                         | `boolean`                                                    | `Android`    |
| darkStatusBarText     | Whether it is bright color main body text, the default font is black, after change to true will think Modal background is dark, the font will be changed to white. | `boolean`                                                    | `Android、iOS`    |
| transparent | Whether the background is transparent. `default: true` | `boolean`                                                    | `Android、iOS`    |

## event

| event name          | description                                                         | type                                      | supported platform |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| show                | This callback function is executed when `Modal` is displayed.                            | `Function`                                                   | `Android、iOS`    |
| orientationChange   | Screen rotation direction change                                           | `Function`                                                   | `Android、iOS`    |
| requestClose        | In `Modal` request to close when the callback function is executed, generally in the Android system hardware when the return button is triggered, generally to close the popup window inside processing. | `Function`                                                   | `Android`    |

---

# swiper

[[sample：demo-swiper.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/native-demos/demo-swiper.vue)

Support paging container, its each child container components will be regarded as a separate page, corresponding terminal `ViewPager` components, it can only contain `<swiper-slide>` components.

## parameter

| parameter                     | description                                                         | type                                         | supported platform |
| ------------------------ | ------------------------------------------------------------ | -------------------------------------------- | -------- |
| bounces | Whether to open the springback effect, the default is `true` | `boolean`                                                  | `iOS`    |
| current              | Change the current page number in real time | `number`                                     | `Android、iOS`    |
| initialPage              | Specify a number, used to determine the default display page index after initialization, the default is 0 when not specified | `number`                                     | `Android、iOS`    |
| needAnimation            | Whether animation is required when switching pages.                    | `boolean`                                    | `Android、iOS`    |
| scrollEnabled            | Specify whether ViewPager can slide, the default is true                        | `boolean`                                    | `Android、iOS`    |
| direction            | Set viewPager scroll direction, do not set the default horizontal scroll, set `vertical` for vertical scroll                       | `string`                                    | `Android`    |

## event

| event name          | description                                                         | type                                      | supported platform |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| dragging                | Triggered when dragged.                            | `Function`                                                   | `Android、iOS`    |
| dropped   | Triggered when drag and drop let go, is to determine the scrolling page trigger.                                            | `Function`                                                   | `Android、iOS`    |
| stateChanged*   | Triggered when finger behavior changes, including idle, dragging and settling states, returned through state parameter                       | `Function`                                                   | `Android、iOS`    |

* stateChanged The meaning of the three values:
  * idle idle state
  * dragging Dragging
  * settling Trigger after releasing the hand, and then return to idle immediately

---

# swiper-slide

[[sample：demo-swiper.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/native-demos/demo-swiper.vue)

Flip subcontainer component container.

---

# pull-header

[[sample：demo-pull-header.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/native-demos/demo-pull-header.vue)

Dropdown refresh component, nested in `ul` as first child element

## event

| event name          | description                                                         | type                                      | supported platform |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| idle                | The sliding distance is triggered once in the pull-header area. The parameter contentOffset            | `Function`                                                   | `Android、iOS`    |
| pulling   | Triggering once after the sliding distance exceeds pull-header, parameter contentOffset                                         | `Function`   | `Android、iOS`    |
| released   | Sliding beyond the distance, after let go trigger once          | `Function`   | `Android、iOS`    |

## method

### collapsePullHeader

`() => void` collapse that top refresh bar `<pull-header>`. When using the `pull-header` after each pull-down refresh end need to take the initiative to call the method back pull-header.

---

# pull-footer

[[sample：demo-pull-footer.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/native-demos/demo-pull-footer.vue)

Pull-up refresh component, nested in `ul` as last child element

## event

| event name          | description                                                         | type                                      | supported platform |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| idle                | The sliding distance is triggered once in the pull-footer area. The parameter contentOffset.                           | `Function`                                                   | `Android、iOS`    |
| pulling   | Triggering once after the sliding distance exceeds pull-footer, parameter contentOffset     | `Function`   | `Android、iOS`    |
| refresh   | Sliding beyond the distance, after let go trigger once          | `Function`   | `Android、iOS`    |

## method

### collapsePullFooter

`() => void` Collapse bottom refresh bar `<pull-footer>`。

---

# waterfall

> minimum supported version 2.9.0

[[sample：demo-waterfall]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/native-demos/demo-waterfall.vue)

Waterfall flow component, the child element must be `waterfall-item`, waterfall flow component drop-down refresh need to use `ul-refresh-wrapper` in the outermost layer, can use `pull-footer` in the `waterfall` to show the pull-up loading copy.

## parameter

| parameter              | description                                                  | type       | supported platform |
| ----------------- | ----------------------------------------------------- | ---------- | -------- |
| columnSpacing     | Horizontal spacing before each column of waterfall                                      | `number`   | `Android、iOS`    |
| interItemSpacing  | Vertical space between items                                        | `number`   | `Android、iOS`    |
| contentInset      | content indentation, default `{ top:0, left:0, bottom:0, right:0 }`  | `Object`   | `Android、iOS`    |
| containBannerView | Whether to include `bannerView`, there can be only one bannerView, `Android` is not supported  | `boolean`  | `iOS`    |
| containPullHeader | Whether to include `pull-header`; `Android` is not supported, can use `ul-refresh` component instead  | `boolean`  | `iOS`    |
| containPullFooter | Whether to include `pull-footer` | `boolean`  | `Android、iOS` |
| numberOfColumns   | Number of waterfall columns, Default: 2                                               | `number`   | `Android、iOS`    |
| preloadItemNumber | Number of items preloaded in advance before sliding to bottom of waterfall       | `number`   | `Android、iOS`    |

## event

| event name              | description           | `type`     | supported platform |
| --------------------- | -------------- | ---------- | -------- |
| endReached      | When all the data has been rendered, and the list is scrolled to the last one, will trigger the `onEndReached` callback.            | `Function` | `Android、iOS`    |
| scroll          | Callback when sliding event of `WaterFall` is triggered. `startEdgePos` is that scroll offset from the top edge of the List; `endEdgePos` is the scroll offset from the bottom edge of the List; `firstVisibleRowIndex` is the index of the first element in the currently visible area; `lastVisibleRowIndex` is the index of the last element in the currently visible area; `visibleRowFrames` is the information (x, y, width, height) of all item in the currently visible area    | `{ nativeEvent: { startEdgePos: number, endEdgePos: number, firstVisibleRowIndex: number, lastVisibleRowIndex: number, visibleRowFrames: Object[] } }` | `Android、iOS`    |

## method

### scrollToIndex

`(obj: { index: number, animated: boolean }) => void` Notifies Waterfall to which item to slide to.

> * `index`: number - slide to the index item
> * `animated`: boolean - Whether the sliding process uses animation, default is `true`

### scrollToContentOffset

`(obj: { xOffset: number, yOffset: number, animated: boolean }) => void` Tells the Waterfall to slide to a specific coordinate offset.

> * `xOffset`: number - Slide to offset in X direction
> * `yOffset`: number - Slide to offset in Y direction
> * `animated`: boolean - Whether the sliding process uses animation, default is `true`

---

# waterfall-item

> minimum supported version 2.9.0

Waterfall component cell container, waterfall child element

| parameter                  | description                                                         | type                                                        | supported platform |
| --------------------- | ------------------------------------------------------------ | ----------------------------------------------------------- | -------- |
| type            | Specify a function, in which the type of the corresponding entry is returned (returns the natural number of the Number type, the default is 0), the List will reuse the same type of entry, so the reasonable type split, can improve the performance of the List. | `number`              | `Android、iOS`    |
| key             | Specifies a function that returns the Key value of the corresponding entry, as described in [Vue official documentation](//cn.vuejs.org/v2/guide/list.html) | `string`                                    | `Android、iOS`    |
