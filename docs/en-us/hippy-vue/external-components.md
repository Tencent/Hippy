<!-- markdownlint-disable no-duplicate-header -->

# Native Extension Component

Extensions are some convenient components provided by the native, which are provided by [@hippy/vue-native-components](//www.npmjs.com/package/@hippy/vue-native-components) in hippy-vue.

---

# animation

[[Example: demo-animation.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/native-demos/demo-animation.vue)

This component is the animation solution of hippy-vue. It can trigger the action effect by directly passing in a style value and animation scheme array.

It should note is that an animation itself is a View, it will drive all the child nodes animation together, so if the animation needs to be controlled separately, you need to split them on the interface level.

## Attributes

| Props          | Description                                                         | Type                                      | Supported Platforms |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| playing        | Controls whether the animation plays | boolean                                | `Android、iOS`    |
| actions*        | Animation scheme, it is actually a style value followed by its animation scheme, please refer to the example for details. | Object                                | `Android、iOS`    |

* actions detailed explanation
  
  Different from React, it combines single animation Animation and animation sequence AnimationSet into one, if it is an object, use Animation to process it; if it is an animation sequence array, use AnimationSet to process it. For specific information of animation parameter, refer to [HippyReact Animation module](../hippy-react/modules.md?id=animation) and [Example](https://github.com/Tencent/Hippy/tree/master/examples/hippy-vue-demo/src/components/native-demos/animations).

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
            duration: 125, // Animation duration
          },
          {
            startValue: 8,
            toValue: 14,
            duration: 250,
            timingFunction: 'linear', // Animating interpolator types, optional: linear, ease-in, ease-out, ease-in-out, cubic-Bezier (minimum supported version 2.9.0) 
            delay: 750, // The time at which the animation delay starts, in milliseconds
            repeatCount: -1, // The number of repetitions of the animation, 0 for non-repetitions, -1('loop') for repetitions, and if in an array, the number of repetitions of the entire animation array is based on the value of the last animation 
          },
        ],
        transform: {
          // Single Animation
          rotate: {
              startValue: 0,
              toValue: 90,
              duration: 250,
              timingFunction: 'linear',
              valueType: 'deg',  // The unit type of the start and end values of the animation, which defaults to undefined and can be set to rad, deg, or color
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

  > For special instructions, a new animation will be automatically created after the actions are replaced, you need to manually start the new animation. There are two methods:
  > 
  >* Replace the actions => After a certain delay (e.g. SetTimeout) or in `actionsDidUpdate` (supported after 2.14.0), call `this.[animation ref].start()` (recommended).
  > * Set `playing = false`=> replace actions => delay after a certain time (such as setTimeout) or in `actionsDidUpdate` (supported after 2.14.0), set `playing = true`
   
  > Version `2.12.2` and the above support parameters `repeatCount: 'loop'`, use `repeatCount: -1` for lower version.
   
  > Version `2.6.0` and the above support `backgroundColor` background color gradient animation, reference [gradient animation DEMO](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/native-demos/animations/color-change.vue)
  >
  > * set `actions` to decorate `backgroundColor`
  > * set `valueType` to `color`
  > * set `startValue` and `toValue` to [color value](style/color.md)

## Events

| Props          | Description                                                         | Type                                      | Supported Platforms |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| start              | Called when animation starts                                  | `Function`                                                    | `Android、iOS`    |
| end         | Called when animation ends                                   | `Function`| `Android、iOS`    |
| repeat | Called each time the loop is played                                | `Function` | `Android`   |

## Methods

> minimum supported version 2.5.2

### start

`() => void` Manually call the animation start (`playing` attribute set to `true` will automatically call the `start` function)

### pause

`() => void` Manually call the animation to pause (`playing` attribute set to `false` will automatically call the `pause` function)

### resume

`() => void` Manually call the animation to continue (`playing` property set to `false` and then set to `true` will automatically call the `resume` function)

### create

`() => void` Manually call the animation to create

### reset

`() => void` Reset the start marker

### destroy

`() => void` Destroy the animation

---

# dialog

[[Example: demo-dialog.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/native-demos/demo-dialog.vue)

Used for modal pop-up window, the default background is transparent, needs to add a `<div>` with background color to fill.

## Attributes

| Props          | Description                                                         | Type                                      | Supported Platforms |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| animationType         | Animation effects                                                            | `enum(none, slide, fade, slide_fade)` | `Android、iOS`    |
| supportedOrientations | Supports screen orientation reversal                            | `enum(portrait, portrait-upside-down, landscape, landscape-left, landscape-right)[]` | `iOS`    |
| immersionStatusBar    | Whether it is an immersive status bar. `default: true`                                         | `boolean`                                                    | `Android`    |
| darkStatusBarText     | Whether main body text is bright color, the default font color is black. The Modal background will be dark after changing it to true, the font color will be changed to white. | `boolean`                                                    | `Android、iOS`    |
| transparent | Whether the background is transparent. `default: true` | `boolean`                                                    | `Android、iOS`    |

## Events

| Event name          | Description                                                         | Type                                      | Supported Platforms |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| show                | This callback function is called when `Modal` is displayed.                            | `Function`                                                   | `Android、iOS`    |
| orientationChange   | Screen rotation direction changes                                           | `Function`                                                   | `Android、iOS`    |
| requestClose        | Called when the `Modal` requires to close, generally called in the Android system hardware when the return button is triggered, generally to close the popup window inside processing. | `Function`                                                   | `Android`    |

---

# swiper

[[Example: demo-swiper.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/native-demos/demo-swiper.vue)

A container that supports paging, its each child container component will be regarded as a separate page, corresponding the native `ViewPager` component, it can only contain `<swiper-slide>` components.

## Attributes

| Props                     | Description                                                         | Type                                         | Supported Platforms |
| ------------------------ | ------------------------------------------------------------ | -------------------------------------------- | -------- |
| bounces | Whether to open the springback effect, the default is `true` | `boolean`                                                  | `iOS`    |
| current              | Change the current page number in real time | `number`                                     | `Android、iOS`    |
| initialPage              | Specify a number, it will be used to determine the default display page index after initialization, the default is 0 when it is not specified | `number`                                     | `Android、iOS`    |
| needAnimation            | Whether animation is required when switching pages.                    | `boolean`                                    | `Android、iOS`    |
| scrollEnabled            | Specify whether ViewPager can slide, the default is true                        | `boolean`                                    | `Android、iOS`    |
| direction            | Set viewPager scroll direction, the default is horizontal scroll, use `vertical` for vertical scroll                       | `string`                                    | `Android`    |

## Events

| Event name          | Description                                                         | Type                                      | Supported Platforms |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| dragging                | Called when dragged.                            | `Function`                                                   | `Android、iOS`    |
| dropped   | Called when the drag is done. Called when a scrolling page action is detected.                                            | `Function`                                                   | `Android、iOS`    |
| stateChanged*   | Called when finger behavior changes, including idle, dragging and settling states, returned through state parameter                       | `Function`                                                   | `Android、iOS`    |

* stateChanged The meaning of the three values:
  * idle idle state
  * dragging Dragging
  * settling Called after releasing the hand, and then return to idle immediately

---

# swiper-slide

[[Example: demo-swiper.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/native-demos/demo-swiper.vue)

Subcontainer of the flipping component container.

---

# pull-header

[[Example: demo-pull-header.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/native-demos/demo-pull-header.vue)

Dropdown refresh component, nested in `ul` as first child element

## Events

| Event name          | Description                                                         | Type                                      | Supported Platforms |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| idle                | Called once when the sliding distance is in the pull-header area. The parameter is contentOffset            | `Function`                                                   | `Android、iOS`    |
| pulling   | Called once after the sliding distance exceeds pull-header area. The parameter is contentOffset                                         | `Function`   | `Android、iOS`    |
| released   | Called once after the sliding beyond the distance.         | `Function`   | `Android、iOS`    |

## Methods

### collapsePullHeader

`(otions: { time: number }) => void` collapse the top refresh bar `<pull-header>`. When using the `pull-header`, you need to call the method to take back the pull-header after each pull-down refresh ends.

> options parameter，`minimum supported version 2.14.0`
>
>* time: number: specify how much delay collapsing the pull-header, the unit is ms.

---

# pull-footer

[[Example: demo-pull-footer.vue]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/native-demos/demo-pull-footer.vue)

Pull-up refresh component, nested in `ul` as last child element

## Events

| Event name          | Description                                                         | Type                                      | Supported Platforms |
| ------------- | ------------------------------------------------------------ | ----------------------------------------- | -------- |
| idle                | Called once when the sliding distance is in the pull-header area. The parameter is contentOffset                           | `Function`                                                   | `Android、iOS`    |
| pulling   | Called once after the sliding distance exceeds pull-header area. The parameter is contentOffset     | `Function`   | `Android、iOS`    |
| refresh   | Called once after the sliding beyond the distance.          | `Function`   | `Android、iOS`    |


## Methods

### collapsePullFooter

`() => void` Collapse the bottom refresh bar `<pull-footer>`.

---

# waterfall

> minimum supported version 2.9.0

[[Example: demo-waterfall]](//github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/native-demos/demo-waterfall.vue)

Waterfall flow component, the child element must be `waterfall-item`, waterfall flow component drop-down needs to use `ul-refresh-wrapper` in the outermost layer when refresh, you can use `pull-footer` in the `waterfall` to show the pull-up loading text.

## Attributes

| Props              | Description                                                  | Type       | Supported Platforms |
| ----------------- | ----------------------------------------------------- | ---------- | -------- |
| columnSpacing     | Horizontal spacing before each column of waterfall                                      | `number`   | `Android、iOS`    |
| interItemSpacing  | Vertical space between items                                        | `number`   | `Android、iOS`    |
| contentInset      | Content indentation, default `{ top:0, left:0, bottom:0, right:0 }`  | `Object`   | `Android、iOS`    |
| containBannerView | Whether to include `bannerView`, there can be only one bannerView, `Android` is not supported  | `boolean`  | `iOS`    |
| containPullHeader | Whether to include `pull-header`; `Android` is not supported, can use `ul-refresh` component instead  | `boolean`  | `iOS`    |
| containPullFooter | Whether to include `pull-footer` | `boolean`  | `Android、iOS` |
| numberOfColumns   | Number of waterfall columns, Default: 2                                               | `number`   | `Android、iOS`    |
| preloadItemNumber | Number of items preloaded in advance before sliding to the bottom of waterfall       | `number`   | `Android、iOS`    |

## Events

| Event name              | Description           | `type`     | Supported Platforms |
| --------------------- | -------------- | ---------- | -------- |
| endReached      | When all the data has been rendered, and the list is scrolled to the last one, `onEndReached` will be called.            | `Function` | `Android、iOS`    |
| scroll          | Called when the sliding event of `WaterFall` is called. `startEdgePos` is that scroll offset from the top edge of the List; `endEdgePos` is the scroll offset from the bottom edge of the List; `firstVisibleRowIndex` is the index of the first element in the currently visible area; `lastVisibleRowIndex` is the index of the last element in the currently visible area; `visibleRowFrames` is the information (x, y, width, height) of all items in the currently visible area    | `{ nativeEvent: { startEdgePos: number, endEdgePos: number, firstVisibleRowIndex: number, lastVisibleRowIndex: number, visibleRowFrames: Object[] } }` | `Android、iOS`    |

## Methods

### scrollToIndex

`(obj: { index: number, animated: boolean }) => void` Notifies which item the Waterfall will slide to.

> * `index`: number - the index of the item slides to
> * `animated`: boolean - Whether the sliding process uses animation, default is `true`

### scrollToContentOffset

`(obj: { xOffset: number, yOffset: number, animated: boolean }) => void` Tells the Waterfall to slide to a specific coordinate offset.

> * `xOffset`: number - offset of the slide in X direction
> * `yOffset`: number - offset of the slide in Y direction
> * `animated`: boolean - Whether the sliding process uses animation, default is `true`

---

# waterfall-item

> minimum supported version 2.9.0

Cell container of the waterfall component, waterfall child element

| Props                  | Description                                                         | Type                                                        | Supported Platforms |
| --------------------- | ------------------------------------------------------------ | ----------------------------------------------------------- | -------- |
| type            | Specify a function, in which the type of the corresponding entry is returned (returns the natural number of the Number type, the default is 0), the List will reuse the same type of entry, so the reasonable type split can improve the performance of the List. | `number`              | `Android、iOS`    |
| key             | Specifies a function that returns the Key value of the corresponding entry, as described in [Vue official documentation](//cn.vuejs.org/v2/guide/list.html) | `string`                                    | `Android、iOS`    |
