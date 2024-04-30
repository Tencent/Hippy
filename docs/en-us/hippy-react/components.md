<!-- markdownlint-disable no-duplicate-header -->

# Components

Hippy-React SDK provides common UI components, syntactically close to Native.

---

# Image

[[Image example]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/Image)

A image component that displays a single image.

>* The width and height in the style must be specified or it won't work.
>* By default, the Android side will bring a gray background color for image placeholders. You can add `backgroundColor: transparent` to change it to a transparent background (After `2.14.1` version Image default background color set to `transparent`).

## Basic Usage

Load remote images directly:

```jsx
<Image
  style={{ width: 200, height: 200 }}
  source={{ uri: 'http://xxx/qb_icon_new.png' }}
  resizeMode={Image.resizeMode.cover}
/>;
```

Or use local image import:

```jsx
import icon from './qb_icon_new.png';

<Image
  style={{ width: 200, height: 200 }}
  source={{ uri: icon }}
  resizeMode={Image.resizeMode.cover}
/>
```

>* Local images can be converted to base64 for loading through [Define Loader when loading](//webpack.js.org/concepts/loaders/#inline), or webpack configuration`url-loader`.
>* After version `2.8.1`, it supports the local image capability of the native, which can be loaded by configuring the webpack `file-loader`.

## Attributes

| Props         | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Type                                                           | Supported Platforms           |
|---------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------|-------------------------------|
| capInsets     | When resizing`Image`, the corner dimensions specified by `capInsets` are fixed and not scaled, while the rest of the middle and sides are stretched. This is very useful when making some variable-sized rounded buttons, shadows, and other assets.                                                                                                                                                                                                                                    | `{ top: number, left: number, bottom: number, right: number }` | `Android、iOS`                 |
| defaultSource | Specifies the placeholder image for the image specified by the `source` when the Image component has not been loaded. When the image specified by the `source` fails to load, the Image component will display the image specified by the `defaultSource`.                                                                                                                                                                                                                              | `string`: image base64 string                                  | `Android、iOS、hippy-react-web、Web-Renderer` |
| source        | uri is a string representing the resource representation of the image. Currently supported image formats are `png`,`jpg`,`jpeg`,`bmp`,`gif`.                                                                                                                                                                                                                                                                                                                                            | `{ uri: string }`                                              | `Android、iOS、hippy-react-web、Web-Renderer` |
| tintColor     | Colorize the image (when coloring a non-solid color image with transparency, the default value of `blendMode` is different between Android and iOS).                                                                                                                                                                                                                                                                                                                                    | [color](style/color.md)                                        | `Android、iOS、Web-Renderer`                 |
| onLayout      | Called when the element mounts or the layout changes, the parameter is:`nativeEvent: { layout: { x, y, width, height } }` where`x` and`y` are the coordinates relative to the parent element.                                                                                                                                                                                                                                                                                           | `Function`                                                     | `Android、iOS、hippy-react-web、Web-Renderer` |
| onLoad        | This callback function is called when the load completes successfully.                                                                                                                                                                                                                                                                                                                                                                                                                  | `Function`                                                     | `Android、iOS、hippy-react-web、Web-Renderer` |
| onLoadStart   | Called when loading starts. e.g, `onLoadStart={() => this.setState({ loading: true })}`.                                                                                                                                                                                                                                                                                                                                                                                                | `Function`                                                     | `Android、iOS、hippy-react-web、Web-Renderer` |
| onLoadEnd     | This callback function is called after loading is complete, regardless of success or failure.                                                                                                                                                                                                                                                                                                                                                                                           | `Function`                                                     | `Android、iOS、hippy-react-web、Web-Renderer` |
| resizeMode    | Determines how to resize the image when the component size is not proportional to the image size. Note: hippy-react-web、Web-Renderer does not support `repeat`.                                                                                                                                                                                                                                                                                                                                      | `enum (cover, contain, stretch, repeat, center)`               | `Android, iOS, hippy-react-web、Web-Renderer` |
| onError       | This callback function is called when the loading error occurs, the parameter is `nativeEvent: { error }`.                                                                                                                                                                                                                                                                                                                                                                              | `Function`                                                     | `Android、iOS、hippy-react-web、Web-Renderer` |
| onProgress    | This callback function is called continuously during the loading process, the parameter is `nativeEvent: { loaded: number, total: number }`, `loaded` represents the size of the image being loaded, and `total` represents the total size of the image.                                                                                                                                                                                                                                | `Function`                                                     | `iOS`                         |
| onTouchDown   | This callback function is called when the user starts to press the finger on the control, passing the touch point information as a parameter; The parameter is `nativeEvent: { name, page_x, page_y, id }`,`page_x` and `page_y` respectively represent the absolute position of the click on the screen.                                                                                                                                                                               | `Function`                                                     | `Android、iOS、hippy-react-web、Web-Renderer` |
| onTouchMove   | This callback function is called continuously when the user moves the finger in the control, and the touch screen point information of the control is informed through the event parameter; The parameter is `nativeEvent: { name, page_x, page_y, id }`,`page_x` and `page_y` respectively represent the absolute position of the click on the screen.                                                                                                                                 | `Function`                                                     | `Android、iOS、hippy-react-web、Web-Renderer` |
| onTouchEnd    | This callback function is called when the user lifts his finger on the control at the end of the touch screen operation, and informs the touch screen point information of the control through the event parameter; The parameter is `nativeEvent: { name, page_x, page_y, id }`,`page_x` and `page_y` respectively represent the absolute position of the click on the screen.                                                                                                         | `Function`                                                     | `Android、iOS、hippy-react-web、Web-Renderer` |
| onTouchCancel | This callback function is called when a system event interrupts the touch screen during the user's touch screen, such as incoming phone calls, component changes (such as setting hidden), sliding gestures of other components, and informs the touch screen point of the control through the event parameter information; The parameter is `nativeEvent: { name, page_x, page_y, id }`,`page_x` and `page_y` respectively represent the absolute position of the click on the screen. | `Function`                                                     | `Android、iOS、hippy-react-web、Web-Renderer` |

## Methods

### getSize

`(uri: string, success: (width: number, height: number) => void, failure?: ErrorFunction) => void` Get the width and height (in pixels) of the image before displaying it.This method will also fail if the image URL is incorrect or if the download fails.

To get the size of an image, you first need to load or download the image (which will be cached at the same time). This means that in theory this method can be used to preload images, but a better preload solution is to use the following `prefetch` preload method. *Not available for static image assets.*

>* `uri`: string - the address of the image.
>* `success`: (width: number, height: Number) => void - This callback function will be called back after obtaining the image and its width and height successfully.
>* `failure`: ErrorFunction - This callback function will be called back when an exception occurs, such as failure to obtain pictures, etc.

### prefetch

`(url: string) => void` Preload a remote image and download it to the local disk cache.

>* `uri`: string - the address of the image.

---

# ListView

[[ListView example]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/ListView)

Reusable vertical list function, especially suitable for data rendering of a large number of items.

> Android replaced `ListView` with `RecyclerView` after `2.14.0`

## Attributes

| Props                 | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Type                                                        | Supported Platforms           |
|-----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------|-------------------------------|
| bounces               | Whether to enable the rebound effect, default `true`, Android supports this attribute after `2.14.1`, `overScrollEnabled` can be used in old version.                                                                                                                                                                                                                                                                                                                                                                     | `boolean`                                                   | `Android, iOS`                        |
| overScrollEnabled     | Whether to enable the rebound effect, default `true`, it will be deprecated in version 3.0.                                                                                                                                                                                                                                                                                                                                                                                                                               | `boolean`                                                   | `Android`                     |
| getRowKey             | Specify a function in which to returns the Key value of the corresponding entry. See [React](//reactjs.org/docs/lists-and-keys.html) for details.                                                                                                                                                                                                                                                                                                                                                                         | `(index: number) => any`                                    | `Android、iOS、hippy-react-web、Web-Renderer` |
| getRowStyle           | Sets the style of the `ListViewItem` container. When setting `horizontal=true` to enable a horizontal ListView, explicitly set the `ListViewItem` width.                                                                                                                                                                                                                                                                                                                                                                  | `(index: number) => styleObject`                            | `Android、iOS、hippy-react-web、Web-Renderer` |
| getHeaderStyle           | Sets the style of the `PullHeader` container. When setting `horizontal=true` to enable a horizontal ListView, explicitly set the `PullHeader` width.  `Minimum supported version 2.14.1`                                                                                                                                                                                                                                                                                                                                  | `() => styleObject`                                    | `Android、iOS` |
| getFooterStyle           | Sets the style of the `PullFooter` container. When setting `horizontal=true` to enable a horizontal ListView, explicitly set the `PullFooter` width. `Minimum supported version 2.14.1`                                                                                                                                                                                                                                                                                                                                   | `() => styleObject`                                    | `Android、iOS` |
| getRowType            | Specify a function in which to return the type of the corresponding entry (returns a natural number of type Number, the default is 0), and List will reuse entries of the same type, so reasonable type splitting can greatly improve the performance of List. `Note: Item components of the same type may not go through the complete component creation life cycle due to reuse`.                                                                                                                                       | `(index: number) => number`                                 | `Android、iOS、hippy-react-web、Web-Renderer` |
| horizontal            | Specifies whether the `ListView` has a landscape layout. `default: undefined` vertical layout, Android can set `false` after `2.14.1`. iOS not supported horizontal ListView                                                                                                                                                                                                                                                                                                                                              | `boolean`  \| `undefined`      | `Android、hippy-react-web` |
| initialListSize       | Specifies how many rows of data to render when the component is just mounted. Use this property to ensure that the right amount of data is displayed above the fold, rather than taking too much frame time to gradually display it.                                                                                                                                                                                                                                                                                      | `number`                                                    | `Android、iOS、Web-Renderer`                 |
| initialContentOffset  | Initial displacement value. The scroll distance can be specified when the list is initialized to avoid flickering through scrollTo series methods after initialization. Android support after version `2.8.0`.                                                                                                                                                                                                                                                                                                            | `number`                                                    | `Android、iOS、Web-Renderer`                 |
| onAppear              | Called when a `ListViewItem` slides into the screen (exposure), and the input parameter returns the index value of the exposed `ListViewItem`.                                                                                                                                                                                                                                                                                                                                                                            | `(index) => void`                                           | `Android、iOS、hippy-react-web、Web-Renderer` |
| onDisappear           | Called when a `ListViewItem` slides off the screen, the input parameter returns the corresponding index value of the `ListViewItem` left.                                                                                                                                                                                                                                                                                                                                                                                 | `(index) => void`                                           | `Android、iOS、hippy-react-web、Web-Renderer` |
| onWillAppear          | Called when at least one pixel of the `ListViewItem` enters the screen (exposure), and the input parameter returns the index value corresponding to the exposed `ListViewItem`. `Minimum supported version 2.3.0`                                                                                                                                                                                                                                                                                                         | `(index) => void`                                           | `Android、iOS`                 |
| onWillDisappear       | Called when a `ListViewItem` slides off the screen by at least one pixel, the input parameter returns the corresponding index value of the `ListViewItem` that left. `Minimum supported version 2.3.0`                                                                                                                                                                                                                                                                                                                    | `(index) => void`                                           | `Android、iOS`                 |
| onEndReached          | The `onEndReached` callback is called when all the data has been rendered and the list has been scrolled to the last item.                                                                                                                                                                                                                                                                                                                                                                                                | `Function`                                                  | `Android、iOS、hippy-react-web、Web-Renderer` |
| onMomentumScrollBegin | Called when the `ListView` starts to slide.                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | `(obj: { contentOffset: { x: number, y: number } }) => any` | `Android、iOS、Web-Renderer`                 |
| onMomentumScrollEnd   | Called when the `ListView` finishes sliding.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | `(obj: { contentOffset: { x: number, y: number } }) => any`  | `Android、iOS、Web-Renderer`                 |
| onScroll              | Called when `ListView` is swiped. The call frequency may be high, and the frequency can be controlled using `scrollEventThrottle`. Note: ListView will recycle components when scrolling. Do not perform any ref node-level operations on the ListItemView generated by renderRow() during scrolling (for example: all callUIFunction and measureInAppWindow methods), the recycled nodes will no longer be able to operate and an error will be reported. Android support since version `2.8.0` when horizontal ListView. | `(obj: { contentOffset: { x: number, y: number } }) => any` | `Android、iOS、hippy-react-web、Web-Renderer` |
| onScrollBeginDrag     | Called when the user starts dragging the `ListView`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | `(obj: { contentOffset: { x: number, y: number } }) => any`    | `Android、iOS、Web-Renderer`                 |
| onScrollEndDrag       | Called when the user stops dragging the `ListView` or lets go of the `ListView` to start sliding.                                                                                                                                                                                                                                                                                                                                                                                                                         | `(obj: { contentOffset: { x: number, y: number } }) => any`  | `Android、iOS、Web-Renderer`                 |
| preloadItemNumber     | Specifies how many lines from the bottom the `onEndReached` callback fires when the list is scrolled to the bottom.                                                                                                                                                                                                                                                                                                                                                                                                       | `number`                                                    | `Android、iOS、Web-Renderer`                 |
| renderRow             | The input parameter here is the index index of the current row, which needs to return the Node node as the content of `ListViewItem`. Here, you can use index to get the data of a specific row of cells, so as to decide how to render this cell.                                                                                                                                                                                                                                                                        | `(index: number) => Node`                                   | `Android、iOS、hippy-react-web、Web-Renderer` |
| rowShouldSticky       | In the callback function, return true or false according to the incoming parameter index (the index of the ListView cell) to specify whether the corresponding item needs to use the hover effect (when scrolling to the top, it will hover at the top of the List and will not scroll off the screen).                                                                                                                                                                                                                   | `(index: number) => boolean`                                | `Android、iOS、hippy-react-web、Web-Renderer` |
| scrollEventThrottle   | Specifies the callback frequency of the sliding event. The incoming value specifies how many milliseconds (ms) the component will call once the `onScroll` event.                                                                                                                                                                                                                                                                                                                                                         | `number`                                                    | `Android、iOS、hippy-react-web、Web-Renderer` |
| scrollEnabled         | Whether sliding is enabled. `default: true`                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | `boolean`                                                   | `Android、iOS、hippy-react-web、Web-Renderer` |
| showScrollIndicator   | Whether to show scroll bars. `default: true`                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | `boolean`                                                   | `iOS、hippy-react-web`         |
| renderPullHeader      | Set the list drop-down header (refresh bar), use with `onHeaderReleased`, `onHeaderPulling` and `collapsePullHeader`, refer to [DEMO](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/PullHeaderFooter/index.jsx).                                                                                                                                                                                                                                                                        | `() => View`                                                | `Android、iOS、hippy-react-web` |
| onHeaderPulling       | Called during the drop-down process, the event will return the drag height through the `contentOffset`, and the corresponding logic can be done according to the drop-down offset.                                                                                                                                                                                                                                                                                                                                        | `(obj: { contentOffset: number }) => any`                   | `Android、iOS、hippy-react-web` |
| onHeaderReleased      | Called when the drop-down exceeds the content height and let go.                                                                                                                                                                                                                                                                                                                                                                                                                                                          | `() => any`                                                 | `Android、iOS、hippy-react-web` |
| renderPullFooter   | `Minimum supported version 2.14.0`, Set the list pull-up footer, use with `onFooterReleased`, `onFooterPulling` and `collapsePullFooter`, refer to [DEMO](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/PullHeaderFooter/index.jsx)。                                                                                                                                                                                                                                                    | `() => View`                                                   | `Android、iOS` |
| onFooterPulling   | `Minimum supported version 2.14.0`, Called during the pull-up process, the event will return the drag height through the `contentOffset`, and the corresponding logic can be done according to the drop-down offset.                                                                                                                                                                                                                                                                                                      | `(obj: { contentOffset: number }) => any`                                                   | `Android、iOS` |
| onFooterReleased   | `Minimum supported version 2.14.0`, Called when the pull-up exceeds the content height and let go.                                                                                                                                                                                                                                                                                                                                                                                                                        | `() => any`                                                   | `Android、iOS` |
| editable              | Whether it is editable or not, it needs to be set to `true` when the side slide deletion is enabled. `Minimum supported version 2.9.0`                                                                                                                                                                                                                                                                                                                                                                                    | `boolean`                                                   | `iOS`                         |
| delText               | Slide sideways to delete text. `Minimum supported version 2.9.0`                                                                                                                                                                                                                                                                                                                                                                                                                                                          | `string`                                                    | `iOS`                         |
| onDelete              | Called when a list item is swiped to delete. `Minimum supported version 2.9.0`                                                                                                                                                                                                                                                                                                                                                                                                                                            | `(nativeEvent: { index: number}) => void`                   | `iOS`                         |
| nestedScrollPriority* | Nested scroll event processing priority, `default:self`. Equivalent to setting `nestedScrollLeftPriority`, `nestedScrollTopPriority`, `nestedScrollRightPriority` and  `nestedScrollBottomPriority` at the same time. `Minimum supported version 2.16.0.`                                                                                                                                                                                                                                                                 | `enum(self,parent,none)` | `Android` |
| nestedScrollLeftPriority | Nested scroll event that set priority of direction **from right to left**, which will overwrite corresponding value of `nestedScrollPriority` .                                                                                                                                                                                                                                                                                                                                                                           | `enum(self,parent,none)` | `Android` |
| nestedScrollTopPriority | Nested scroll event that set priority of direction **from bottom to top**, which will overwrite corresponding value of `nestedScrollPriority`. `Minimum supported version 2.16.0.`                                                                                                                                                                                                                                                                                                                                         | `enum(self,parent,none)` | `Android` |
| nestedScrollRightPriority | Nested scroll event that set priority of direction **from left to right**, which will overwrite corresponding value of `nestedScrollPriority`.`Minimum supported version 2.16.0.`                                                                                                                                                                                                                                                                                                                                | `enum(self,parent,none)` | `Android` |
| nestedScrollBottomPriority | Nested scroll event that set priority of direction **from top to bottom**, which will overwrite corresponding value of `nestedScrollPriority`. `Minimum supported version 2.16.0.`                                                                                                                                                                                                                                                                                                                                         | `enum(self,parent,none)` | `Android` |

* Attributes meaning of nestedScrollPriority: 

  * `self`(default value): the current component takes priority, the scroll event will be consumed by the current component first, and the rest will be passed to the parent component for consumption;

  * `parent`: the parent component takes priority, the scroll event will be consumed by the parent component first, and the rest will be consumed by the current component;

  * `none`: nested scrolling is not allowed, scroll events will not be dispatched to the parent component.

## Methods

### scrollToContentOffset

`(xOffset: number, yOffset: number, animated: boolean) => void` Notifies the ListView to slide to a specific coordinate offset value.

>* `xOffset`: number - Slide to the offset in the X direction.
>* `yOffset`: number - Slide to the offset in the Y direction.
>* `animated`: boolean - Whether to use animation during the sliding process.

### scrollToIndex

`(xIndex: number, yIndex: number, animated: boolean) => void` Notify ListView to slide to a specific index position.

>* `xIndex`: number - Swipe to the xIndex-th item in the X direction.
>* `yIndex`: number - Swipe to the xIndex-th item in the X direction.
>* `animated`: boolean - Whether to use animation during the sliding process.

### collapsePullHeader

`(otions: { time: number }) => void` Collapse the refresh bar PullHeader. When the `renderPullHeader` is set, whenever the pull-down refresh ends, you need to actively call this method to put away the PullHeader.

> options parameter，`minimum supported version 2.14.0`
>
>* time: number: specify how much delay collapsing the PullHeader, the unit is ms.

### expandPullHeader

`() => void` Expand the refresh bar PullHeader. When the refresh ends, you need to actively call `collapsePullHeader` to put away the PullHeader.

### collapsePullFooter

> `Minimum supported version 2.14.0`

`() => void` Collapse the bottom bar PullFooter. When the `renderPullFooter` is set, whenever the load-more refresh ends, you need to actively call this method to put away the PullFooter.

---

# Modal

[[Modal example]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/Modal)

Modal popup component.

## Attributes

| Props                 | Description                                                                                                                                                                                                    | Type                                                                                  | Supported Platforms           |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------|-------------------------------|
| animated              | Whether to pop up with animation.                                                                                                                                                                              | `boolean`                                                                             | `Android、iOS、hippy-react-web、Web-Renderer` |
| animationType         | Animation effect.                                                                                                                                                                                              | `enum (none, slide, fade, slide_fade)`                                                | `Android、iOS、hippy-react-web、Web-Renderer` |
| supportedOrientations | Support screen flip direction.                                                                                                                                                                                 | `enum (portrait, portrait-upside-down, landscape, landscape-left, landscape-right)[]` | `iOS`                         |
| immersionStatusBar    | Whether the immersive status bar. `default: false`                                                                                                                                                             | `boolean`                                                                             | `Android`                     |
| darkStatusBarText     | Whether it is a bright color main text, the default font is black, after changing to true, the Modal background will be considered as a dark color, and the font will be changed to white.                     | `boolean`                                                                             | `Android、iOS`                 |
| onShow                | This callback function is called when the `Modal` is displayed.                                                                                                                                                | `Function`                                                                            | `Android、iOS、hippy-react-web、Web-Renderer` |
| onOrientationChange   | This callback function is called when the screen rotation direction changes.                                                                                                                                   | `Function`                                                                            | `Android、iOS`                 |
| onRequestClose        | This callback function is called when the `Modal` request is closed. In general, it is called when the hardware back button is pressed in the `Android` system, and the pop-up window should be closed inside. | `Function`                                                                            | `Android、hippy-react-web`     |
| transparent           | Whether the background is transparent. `default: true`                                                                                                                                                         | `boolean`                                                                             | `Android、iOS、hippy-react-web、Web-Renderer` |
| visible               | Whether to display. `default: true`                                                                                                                                                                            | `boolean`                                                                             | `Android、iOS、hippy-react-web、Web-Renderer` |

---

# RefreshWrapper

[[RefreshWrapper example]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/RefreshWrapper)

A component that wraps `ListView` to provide slide-to-refresh functionality.

> `RefreshWrapper` now only supports wrapping a `ListView` component, and does not support the slide-to-refresh function of other components.

## Attributes

| Props      | Description                                                                                        | Type       | Supported Platforms           |
|------------|----------------------------------------------------------------------------------------------------|------------|-------------------------------|
| onRefresh  | This callback function is called when the `RefreshWrapper` performs a refresh operation.           | `Function` | `Android、iOS、hippy-react-web、Web-Renderer` |
| getRefresh | Defines the view representation of the refresh bar, returning `View`, `Text` and other components. | `Function` | `Android、iOS、hippy-react-web、Web-Renderer` |
| bounceTime | Specifies the duration of the refresh bar retraction animation (unit: ms).                         | `number`   | `Android、iOS、Web-Renderer`                 |

## Methods

### refreshCompleted

`() => void` Call this method to inform the RefreshWrapper that the refresh has been completed, and the RefreshWrapper will close the refresh bar.

### startRefresh

`() => void` Call this method to manually inform RefreshWrapper to start refreshing and expand the refresh bar.

---

# ScrollView

[[Scroll example]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/ScrollView)

This component is used to display content of indeterminate height. A series of sub-components of indeterminate height can be installed into a container of certain height. Users can scroll up and down or left and right to view content beyond the width and height of the component.

A component that wraps the platform's `ScrollView`, while also integrating a touch-locked "responder" system.

>* Note: Remember that a ScrollView must have a deterministic height to work properly, because all it actually does is pack a series of indeterminate-height subcomponents into a deterministic-height container (via scrolling). To determine a height for a ScrollView, either set the height directly (not recommended), or make sure that all parent containers have a certain height. Generally speaking, we will set `flex: 1` to ScrollView to automatically fill the empty space of the parent container, but the premise is that all parent containers themselves have flex set or height specified, otherwise it will not scroll normally, you can Use the element viewer to find the cause of the problem.
>* Note: ScrollView cannot use the onTouch series of events to listen to touch screen behavior, but it can use onScroll to listen to scroll behavior.

## Attributes

| Props                          | Description                                                  | Type                                                         | Supported Platforms                           |
| ------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | --------------------------------------------- |
| bounces                        | Whether to enable the rebound effect, default`true`.         | `boolean`                                                    | `iOS`                                         |
| contentContainerStyle          | These styles will be applied to an inner content container, and all subviews will be wrapped inside the content container. | `StyleSheet`                                                 | `Android、iOS、hippy-react-web、Web-Renderer` |
| horizontal                     | When this property is `true`, all subviews will be aligned horizontally in a row instead of the default vertical row. | `boolean`                                                    | `Android、iOS、hippy-react-web、Web-Renderer` |
| onMomentumScrollBegin          | This callback function is called when the `ScrollView` starts to slide. | `(obj: { contentOffset: { x: number, y: number } }) => any`  | `Android、iOS、hippy-react-web、Web-Renderer` |
| onMomentumScrollEnd            | This callback function is called when the `ScrollView` swipe ends. | `(obj: { contentOffset: { x: number, y: number } }) => any`  | `Android、iOS、hippy-react-web、Web-Renderer` |
| onScroll                       | This callback function is called at most once per frame during scrolling. | `(obj: { contentOffset: { x: number, y: number } }) => any`  | `Android、iOS、hippy-react-web、Web-Renderer` |
| onScrollBeginDrag              | This callback function is called when the user starts dragging the `ScrollView`. | `(obj: { contentOffset: { x: number, y: number } }) => any`  | `Android、iOS、hippy-react-web、Web-Renderer` |
| onScrollEndDrag                | This callback function is called when the user stops dragging the `ScrollView` or lets go of the `ScrollView` to start sliding. | `(obj: { contentOffset: { x: number, y: number } }) => any`  | `Android、iOS、hippy-react-web、Web-Renderer` |
| pagingEnabled                  | When `true`, the scroll bar will stop at an integer multiple of the scroll view's size. This can be used for horizontal pagination.`default: false` | `boolean`                                                    | `Android、iOS、hippy-react-web、Web-Renderer` |
| scrollEventThrottle            | Specifies the callback frequency of the sliding event, and the passed value specifies how many milliseconds (ms) the component will call once the `onScroll` callback event. | `number`                                                     | `Android、iOS、hippy-react-web、Web-Renderer` |
| scrollIndicatorInsets          | Determines the coordinates of the scrollbar from the edge of the view. This value should be the same as contentInset. | `{ top: number, left: number, bottom: number, right: number }` | `Android、iOS`                                |
| scrollEnabled                  | When the value is `false`, the content cannot be scrolled. `default: true` | `boolean`                                                    | `Android、iOS、hippy-react-web、Web-Renderer` |
| showScrollIndicator            | Whether to display scroll bars. `default: false`             | `boolean`                                                    | `Android、hippy-react-web`                    |
| showsHorizontalScrollIndicator | When this value is set to `false`, the horizontal scroll bar of the `ScrollView` will be hidden. `default: true` | `boolean`                                                    | `iOS`                                         |
| showsVerticalScrollIndicator   | When this value is set to `false`, the vertical scroll bar of the `ScrollView` will be hidden. `default: true` | `boolean`                                                    | `iOS`                                         |
| nestedScrollPriority* | Nested scroll event processing priority, `default:self`. Equivalent to setting `nestedScrollLeftPriority`, `nestedScrollTopPriority`, `nestedScrollRightPriority` and  `nestedScrollBottomPriority` at the same time. `Minimum supported version 2.16.0.`                                                                                                                                                                                                                                                                 | `enum(self,parent,none)` | `Android` |
| nestedScrollLeftPriority | Nested scroll event that set priority of direction **from right to left**, which will overwrite corresponding value of `nestedScrollPriority` .                                                                                                                                                                                                                                                                                                                                                                           | `enum(self,parent,none)` | `Android` |
| nestedScrollTopPriority | Nested scroll event that set priority of direction **from bottom to top**, which will overwrite corresponding value of `nestedScrollPriority`. `Minimum supported version 2.16.0.`                                                                                                                                                                                                                                                                                                                                         | `enum(self,parent,none)` | `Android` |
| nestedScrollRightPriority | Nested scroll event that set priority of direction **from left to right**, which will overwrite corresponding value of `nestedScrollPriority`.`Minimum supported version 2.16.0.`                                                                                                                                                                                                                                                                                                                                | `enum(self,parent,none)` | `Android` |
| nestedScrollBottomPriority | Nested scroll event that set priority of direction **from top to bottom**, which will overwrite corresponding value of `nestedScrollPriority`. `Minimum supported version 2.16.0.`                                                                                                                                                                                                                                                                                                                                         | `enum(self,parent,none)` | `Android` |

* Attributes meaning of nestedScrollPriority: 

  * `self`(default value): the current component takes priority, the scroll event will be consumed by the current component first, and the rest will be passed to the parent component for consumption;

  * `parent`: the parent component takes priority, the scroll event will be consumed by the parent component first, and the rest will be consumed by the current component;

  * `none`: nested scrolling is not allowed, scroll events will not be dispatched to the parent component.

## Methods

### scrollTo

`(x: number, y: number, animated: boolean) => void` Scroll to the offset value specified by X, Y, and the third parameter sets whether to enable smooth scroll animation.

>* x: number - X offset value.
>* y: number - Y offset value.
>* animated: boolean - Whether to enable smooth scroll animation.

### scrollToWithDuration

`(x: number, y: number, duration: number) => void` Scroll smoothly to the specified X, Y offset value, after the specified time.

>* x: number - X offset value.
>* y: number - Y offset value.
>* duration: number - scroll time in milliseconds, default 1000ms.

---

# TextInput

[[TextInput example]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/TextInput)

Basic component for entering text.

The properties of this component provide configuration of various features, such as autocomplete, auto-capitalization/auto-lowercase, placeholder text, and many different keyboard types (such as a pure numeric keyboard), etc.

## Difference

Due to the difference in the system component layer, if the TextInput is in a position that will be covered by the keyboard, after calling the keyboard:

* IOS is normally covered.
* The performance of Android is that the page will be pushed up by the keyboard, and the magnitude of the push depends on the Y-axis position of TextInput.

We are still discussing addressing this platform difference.

If there is a need for iOS to align the Android keyboard, it is recommended to refer to [stackoverflow](//stackoverflow.com/questions/32382892/ios-xcode-how-to-move-view-up-when-keyboard-appears) to solve it at the business layer.

### The Solution To Cover The UI After Android Pops Up

On some Android models, the UI may be covered after the keyboard pops up. Generally, it can be solved by modifying the `AndroidMainfest.xml` file and adding android:windowSoftInputMode="adjustPan" to the activity.

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.tencent.mtt.hippy.example"
>
    <application
        android:allowBackup="true"
        android:label="@string/app_name"
    >
        <!-- Attention: android:windowSoftInputMode="adjustPan" is written in the parameters of the activity-->
        <activity android:name=".MyActivity"
            android:windowSoftInputMode="adjustPan"
            android:label="@string/activity_name"
            android:configChanges="orientation|screenSize"
        >
        </activity>
    </application>
</manifest>
```

The meaning of this parameter is:

* adjustResize: resize the page content.
* adjustPan: move page content without resizing page content.

For more details, please refer to the Android development documentation.

## Attributes

| Props                 | Description                                                  | Type                                                  | Supported Platforms                         |
| --------------------- | ------------------------------------------------------------ | ----------------------------------------------------- | ------------------------------------------- |
| caretColor            | The color of the cursor when typing (Can also be set to the Style property). `Minimum supported version 2.11.5` | [`color`](style/color.md)                             | `Android、hippy-react-web`                  |
| defaultValue          | Provides an initial value in a text box. When the user starts typing, the value can change. In some simple use cases, you don't want to keep the property and state in sync by listening for messages and then updating the value property, you can use defaultValue instead. | `string`                                              | `Android、iOS、hippy-react-web、Web-Renderer`             |
| editable              | If false, the text box is not editable. `default: true`      | `boolean`                                             | `Android、iOS、hippy-react-web、Web-Renderer`             |
| keyboardType          | Determines which type of soft keyboard pops up. Note：`password` only takes effect in a single-line text box with the attribute `multiple=false`. | `enum (default, numeric, password, email, phone-pad)` | `Android、iOS、hippy-react-web、Web-Renderer`             |
| maxLength             | Limits the maximum number of characters in a text box. Use this property instead of Javascript to avoid flickering. | `number`                                              | `Android、iOS、hippy-react-web、Web-Renderer`             |
| multiline             | If `true` , multiple lines of text can be entered in the text box. | `boolean`                                             | `Android、iOS、hippy-react-web、Web-Renderer`             |
| numberOfLines         | Set the maximum number of lines displayed by `TextInput`. If `TextInput` does not explicitly set the height, it will calculate the height according to `numberOfLines` and expand. When using it, you must also set the `multiline` parameter to `true`. | `number`                                              | `Android、hippy-react-web、Web-Renderer`                  |
| onBlur                | This callback function is called when the text box is blurred. | `Function`                                            | `Android、iOS、hippy-react-web、Web-Renderer`             |                             |
| onFocus               | This callback function is called when the text box is focused. | `Function`                                            | `Android、iOS`                              |
| onChangeText          | This callback function is called when the text box content changes. The changed text content is passed as a parameter. | `Function`                                            | `Android、iOS、hippy-react-web、Web-Renderer`             |
| onKeyboardWillShow    | This callback function is called when the input method keyboard pops up. The return value contains the keyboard height`keyboardHeight`, style is as follow`{ keyboardHeight: 260 }`. | `Function`                                            | `Android、iOS、hippy-react-web`             |
| onKeyboardWillHide    | This callback function is called when the input keyboard is hidden. `Supported from version 2.16.0 on iOS` | `Function` | `Android、iOS`   |
| onEndEditing          | This callback function is called when the text input ends.   | `Function`                                            | `Android、iOS、hippy-react-web、Web-Renderer`             |
| onLayout              | This callback function is called when the component is mounted or the layout changes. The parameter is `nativeEvent: { layout: { x, y, width, height } }`, where `x` and `y` are the coordinates relative to the parent element. | `Function`                                            | `Android、iOS、hippy-react-web、Web-Renderer`             |
| onSelectionChange     | This callback function is called when the range of the selected text in the input box is changed, and the return parameter is in the form of `nativeEvent: { selection: { start, end } }`. | `Function`                                            | `Android、iOS、Web-Renderer`                              |
| placeholder           | This string is displayed if no text is entered.              | `string`                                              | `Android、iOS、hippy-react-web、Web-Renderer`             |
| placeholderTextColor  | The color of the text displayed by the placeholder string (can also be set to the Style property). `Minimum supported version 2.13.4`. | [`color`](style/color.md)                             | `Android、iOS、Web-Renderer`                              |
| returnKeyType         | Specifies the style of the soft keyboard's Enter key display. | `enum (done, go, next, search, send)`                 | `Android、iOS、Web-Renderer`                              |
| underlineColorAndroid | The color of the bottom line under the `TextInput`. Can be set to 'transparent' to remove the bottom line (can also be set to the Style property). | [`color`](style/color.md)                             | `Android`                                   |
| value                 | Specifies the value of the `TextInput` component.            | `string`                                              | `Android、iOS、hippy-react-web、Web-Renderer`             |
| autoFocus             | Whether to automatically gain focus when the component has finished rendering. | `boolean`                                             | `Android、iOS、hippy-react-web、Web-Renderer`             |
| breakStrategy*        | Set text break strategy on Android API 23 and above. `default: simple` | `enum(simple, high_quality, balanced)`                | `Android(minimum supported version 2.14.2)` |

* Attributes meaning of breakStrategy:
  * `simple`(default value): strategy indicating simple line breaking, automatic hyphens are not added, and modifying text generally doesn't affect the layout before it (which yields a more consistent user experience when editing), but layout may not be the highest quality;
  * `high_quality`: strategy indicating high quality line breaking, including automatic hyphenation and doing whole-paragraph optimization of line breaks;
  * `balanced`: strategy indicating balanced line breaking, the breaks are chosen to make all lines as close to the same length as possible, including automatic hyphenation.

## Methods

### blur

`() => void` Causes the specified input or View component to lose cursor focus, the opposite of focus().

### clear

`() => void` Clear the contents of the input box.

### focus

`() => void` Assign TextInput to get focus.

### getValue

`() => Promise<string>` Get the contents of the text box. Caution, value may be changed since the callback is asynchronous.

### setValue

`(value: string) => void` Set the text box content.

>* Value: string - text box contents.

### isFocused

`Minimum supported version 2.14.1. hippy-react-web does not support.`

`() => Promise<boolean>`Get the focus status of the input box. Caution, value may be changed since the callback is asynchronous.

---

# Text

[[Text example]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/Text)

Text component.

## Attributes

| Props          | Description                                                  | Type                                   | Supported Platforms                                          |
| -------------- | ------------------------------------------------------------ | -------------------------------------- | ------------------------------------------------------------ |
| numberOfLines  | Used to crop text when it is too long. The total number of lines will not exceed the limit of this property, including line breaks caused by folding. | `number`                               | `Android、iOS、hippy-react-web、Web-Renderer`                              |
| opacity        | Configure the transparency of the `View`, and also affect the transparency of the child nodes. | `number`                               | `Android、iOS、hippy-react-web、Web-Renderer`                              |
| onLayout       | This callback function is called when the element is mounted or the layout is changed. The parameters is: `nativeEvent: { layout: { x, y, width, height } }`, where `x` and `y` are the coordinates relative to the parent element. | `Function`                             | `Android、iOS、hippy-react-web、Web-Renderer`                              |
| onClick        | This callback function is called when the text is clicked. For example,`onClick={() => console.log('onClick') }`. | `Function`                             | `Android、iOS、hippy-react-web、Web-Renderer`                              |
| ellipsizeMode* | When the `numberOfLines` value is set, this parameter specifies how strings are truncated. So when using `ellipsizeMode`, you must also specify the `numberOfLines` value. `default: tail` | `enum(head, middle, tail, clip)`       | `Android(only supported tail)、iOS(full supported)、hippy-react-web(clip、ellipsis)、Web-Renderer(clip、ellipsis)` |
| onTouchDown    | This callback function is called when the user starts to press the finger on the control, and the touch point information is passed in as a parameter. The parameters is: `nativeEvent: { name, page_x, page_y, id }`, `page_x` and `page_y` respectively represent the absolute position of the click on the screen. | `Function`                             | `Android、iOS、hippy-react-web、Web-Renderer`                              |
| onTouchMove    | This callback function is called continuously when the user moves the finger on the control, and the touch point information is passed in as a parameter. The parameters is: `nativeEvent: { name, page_x, page_y, id }`, `page_x` and `page_y` respectively represent the absolute position of the click on the screen. | `Function`                             | `Android、iOS、hippy-react-web、Web-Renderer`                              |
| onTouchEnd     | This callback function is called when the user lifts his finger on the control after the touch screen operation, and the touch screen point information is passed in as a parameter.. The parameters is: `nativeEvent: { name, page_x, page_y, id }`, `page_x` and `page_y` respectively represent the absolute position of the click on the screen. | `Function`                             | `Android、iOS、hippy-react-web、Web-Renderer`                              |
| onTouchCancel  | This callback function is called when a system event interrupts the touch screen during the user's touch screen process, such as incoming phone calls, component changes (such as setting hidden), sliding gestures of other components, etc., and the touch point information is passed in as a parameter. The parameters is: `nativeEvent: { name, page_x, page_y, id }`, `page_x` and `page_y` respectively represent the absolute position of the click on the screen. | `Function`                             | `Android、iOS、hippy-react-web、Web-Renderer`                              |
| breakStrategy* | Set text break strategy on Android API 23 and above. `default: simple` | `enum(simple, high_quality, balanced)` | `Android(minimum supported version 2.14.2)`                  |
| verticalAlign* | Sets the alignment strategy when text components are nested within text components or image components are nested within text components. `default: baseline` | `enum(top, middle, baseline, bottom)` | `Android, iOS (minimum supported version 2.16.0)` |

* Attributes meaning of ellipsizeMode:
  * `clip` - Text that exceeds the specified number of lines will be directly truncated without displaying "...". (Android  2.14.1+, iOS full supported)
  * `head` - The text will be truncated from the beginning to ensure that the last text of the string can be displayed normally at the end of the `Text` component, and the text truncated at the beginning will be replaced by "...", such as "...wxyz". (Android  2.14.1+, iOS full supported)
  * `middle` - The text will be truncated from the middle to ensure that the text at the end and the beginning of the string can be displayed normally in the corresponding position of the Text component, and the truncated text in the middle will be replaced by "...", such as "ab...yz" . (Android  2.14.1+, iOS full supported)
  * `tail`(default value) - The text will be truncated from the end to ensure that the text at the beginning of the string can be displayed normally at the beginning of the Text component, and the text that is truncated at the end will be replaced by "...", such as "abcd...".
* Attributes meaning of breakStrategy:
  * `simple`(default value): strategy indicating simple line breaking, automatic hyphens are not added, and modifying text generally doesn't affect the layout before it (which yields a more consistent user experience when editing), but layout may not be the highest quality;
  * `high_quality`: strategy indicating high quality line breaking, including automatic hyphenation and doing whole-paragraph optimization of line breaks;
  * `balanced`: strategy indicating balanced line breaking, the breaks are chosen to make all lines as close to the same length as possible, including automatic hyphenation.
* Parameter meaning of verticalAlign:
  * `top`: line top alignment
  * `middle`: center alignment
  * `baseline`: baseline alignment
  * `bottom`: line bottom alignment

---

# View

[[View example]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/View)

The most basic container component, it is a container that supports Flexbox layout, styling, some touch handling, and some accessibility features, and it can be placed in other views, and can have any number of subviews of any type. Regardless of the platform, `View` will directly correspond to the native view of a platform.

!> Android has node optimization, please pay attention to  `collapsable` attribute.

## Attributes

| Props                   | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Type                             | Supported Platforms           |
|-------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------|-------------------------------|
| accessible              | When this property is `true`, indicates that this view is an accessibility-enabled element. When enabling other properties of accessibility, you must set `accessible` to `true` in preference.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | `boolean`                        | `Android、iOS、hippy-react-web` |
| accessibilityLabel      | Sets the text that a "screen reader" (accessibility for the visually impaired) reads when the user interacts with this element. By default, the text is constructed by iterating over all child elements and accumulating all text tags.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | `string`                         | `Android、iOS、hippy-react-web` |
| collapsable             | In Android, if a `View` is only used to lay out its child components, it may be removed from the native layout tree for optimization, so the reference to the node will be lost `(for example, calling measureInAppWindow cannot get size and position information)`. Setting this property to `false` disables this optimization to ensure that the corresponding view exists in the native structure. `(Android supports to set collapsable in Attribute after 2.14.1, older versions need to be set in Style property)`.                                                                                                                                                                                                                                                                                                        | `boolean`                        | ` Android apps                |
| style                   | -                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | [`View Styles`](style/layout.md) | `Android、iOS、hippy-react-web、Web-Renderer` |
| opacity                 | Configure the transparency of the `View`, which will also affect the transparency of the child nodes.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | `number`                         | `Android、iOS、hippy-react-web、Web-Renderer` |
| overflow                | Specifies whether to clip the content of a child node when it overflows its parent `View` container.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | `enum(visible, hidden)`          | `Android、iOS、hippy-react-web、Web-Renderer` |
| nativeBackgroundAndroid | Configure the water ripple effect. Minimum supported version 2.13.1.The configuration is`{ borderless: boolean, color: Color, rippleRadius: number }`;`borderless` indicates whether the ripple has a border, the default is false; `color` indicates the color of the ripple; `rippleRadius` indicates the radius of the ripple, if not set, the default container border is the border; `Note: After setting the water ripple, it will not be displayed by default. You need to call the setPressed and setHotspot methods in the corresponding touch event to display the water ripple. For details, please refer to the relevant`[demo](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/RippleViewAndroid/index.jsx). | `Object`                         | `Android`                     |
| onLayout                | This callback function is called when the element is mounted or the layout is changed. The parameter is: `nativeEvent: { layout: { x, y, width, height } }`, where `x` and `y` are the coordinates relative to the parent element.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | `Function`                       | `Android、iOS、hippy-react-web、Web-Renderer` |
| onAttachedToWindow      | This callback function is called when the node has been rendered and added to the container component, since Hippy's rendering is asynchronous, this is a safe event to perform subsequent operations.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | `Function`                       | `Android、iOS、hippy-react-web、Web-Renderer` |
| onTouchDown             | This callback function is called when the user starts to press the finger on the control, and the touch point information is passed in as a parameter. The parameters is: `nativeEvent: { name, page_x, page_y, id }`, `page_x` and `page_y` respectively represent the absolute position of the click on the screen.                                                                                                                                                                                                                                                                                                                                                                                                                                     | `Function`                       | `Android、iOS、hippy-react-web、Web-Renderer` |
| onTouchMove             | This callback function is called continuously when the user moves the finger on the control, and the touch point information is passed in as a parameter. The parameters is: `nativeEvent: { name, page_x, page_y, id }`, `page_x` and `page_y` respectively represent the absolute position of the click on the screen.                                                                                                                                                                                                                                                                                                                                                                                                                                  | `Function`                       | `Android、iOS、hippy-react-web、Web-Renderer` |
| onTouchEnd              | This callback function is called when the user lifts his finger on the control after the touch screen operation, and the touch screen point information is passed in as a parameter.. The parameters is: `nativeEvent: { name, page_x, page_y, id }`, `page_x` and `page_y` respectively represent the absolute position of the click on the screen.                                                                                                                                                                                                                                                                                                                                                                                                      | `Function`                       | `Android、iOS、hippy-react-web、Web-Renderer` |
| onTouchCancel           | This callback function is called when a system event interrupts the touch screen during the user's touch screen process, such as incoming phone calls, component changes (such as setting hidden), sliding gestures of other components, etc., and the touch point information is passed in as a parameter. The parameters is: `nativeEvent: { name, page_x, page_y, id }`, `page_x` and `page_y` respectively represent the absolute position of the click on the screen.                                                                                                                                                                                                                                                                                | `Function`                       | `Android、iOS、hippy-react-web、Web-Renderer` |


## Methods

### setPressed

[[setPressed example]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/RippleViewAndroid/RippleViewAndroid.jsx)

`Minimum supported version 2.13.1. hippy-react-web、Web-Renderer does not support.`

`(pressed: boolean) => void` By passing in a boolean value, notify the native whether the current water ripple effect needs to be displayed.

>* Pressed: boolean - true: Display water ripples, false: Hide water ripples.

### setHotspot

[[setHotspot example]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/RippleViewAndroid/RippleViewAndroid.jsx)

`Minimum supported version 2.13.1. hippy-react-web、Web-Renderer does not support.`

`(x: number, y: number) => void` By passing in the `x`, `y` coordinate value, notify the native to set the current ripple center position.

---

# ViewPager

[[ViewPager example]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/ViewPager)

A container that supports scrolling pages, each of its child container components will be treated as a separate page and stretched to the width of the `ViewPager` itself.

## Attributes

| Props                    | Description                                                                                                                                                                                                                                                                                         | Type                                                | Supported Platforms           |
|--------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------|-------------------------------|
| bounces                  | Whether to enable the rebound effect, default`true`.                                                                                                                                                                                                                                                | `boolean`                                           | `iOS`                         |
| initialPage              | Specify a number to determine the page index displayed by default after initialization, the default is 0.                                                                                                                                                                                           | `number`                                            | `Android、iOS、hippy-react-web、Web-Renderer` |
| scrollEnabled            | Specifies whether the ViewPager can be swiped, default is`true`.                                                                                                                                                                                                                                    | `boolean`                                           | `Android、iOS、hippy-react-web、Web-Renderer` |
| onPageSelected           | This callback function is called when the page is selected. The callback parameter is an event object, and the callback parameter is: `position: number` - Indicates the index of the target page to slide to.                                                                                      | `(obj: {position: number}) => void`                 | `Android、iOS、hippy-react-web、Web-Renderer` |
| onPageScroll             | This callback function is called when the page is swiped. The callback parameter is an event object. The callback parameters are: `position: number` - the index of the target page to slide to, `offset: number` - the relative displacement of the currently selected page, ranging from -1 to 1. | `(obj: {position: number, offset: number}) => void` | `Android、iOS、Web-Renderer`                 |
| onPageScrollStateChanged | This callback function is called when the sliding state of the page changes. `pageScrollState: string` - The changed state. `idle` indicates stop, `dragging` indicates the user is dragging by hand, `settling` indicates the page is sliding.                                                     | `(pageScrollState: string) => void`                 | `Android、iOS、hippy-react-web、Web-Renderer` |
| direction                | Set viewPager scrolling direction, default horizontal scrolling, set `vertical` to vertical scrolling.                                                                                                                                                                                              | `string`                                            | `Android、hippy-react-web`     |

## Methods

### setPage

`(index: number) => void` By passing in an index value (number), slide to the index-th page (with animation).

>* Index: number - Specify a sliding page.

### setPageWithoutAnimation

`(index: number) => void` By passing in an index value (number), slide to the index-th page (no animation).

>* Index: number - Specify a sliding page.

---

# WaterfallView

> Minimum supported version 2.9.0. hippy-react-web does not support.

[[WaterfallView example]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/WaterfallView)

Waterfall component.

## Attributes

| Props             | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Type                                                                                                                                               | Supported Platforms |
|-------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|---------------------|
| numberOfColumns   | The number of columns in the waterfall,`Default: 2`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | `number`                                                                                                                                           | `Android、iOS`       |
| numberOfItems     | The number of items in the waterfall.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | `number`                                                                                                                                           | `Android、iOS`       |
| columnSpacing     | The horizontal spacing between each column of the waterfall.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | `number`                                                                                                                                           | `Android、iOS`       |
| interItemSpacing  | The vertical spacing between each item in the waterfall.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | `number`                                                                                                                                           | `Android、iOS`       |
| contentInset      | Content indent, default`{ top:0, left:0, bottom:0, right:0 }`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | `Object`                                                                                                                                           | `Android、iOS`       |
| renderItem        | The input parameter here is the index of the current item. Here, the data of a specific cell of the waterfall flow can be obtained by means of the index, so as to decide how to render the cell.                                                                                                                                                                                                                                                                                                                                         | `(index: number) => React.ReactElement`                                                                                                            | `Android、iOS`       |
| renderBanner      | How to render Banner. `Android` support after version `2.15.0`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | `() => React.ReactElement`                                                                                                                         | `Android、iOS`               |
| getItemStyle      | Sets the style of the `WaterfallItem` container.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | `(index: number) => styleObject`                                                                                                                   | `Android、iOS`       |
| getItemType       | Specify a function that returns the type of the corresponding entry (returns a natural number of type Number, the default is 0). List will reuse items of the same type, so reasonable type splitting will greatly improve list performance.                                                                                                                                                                                                                                                                                              | `(index: number) => number`                                                                                                                        | `Android、iOS`       |
| getItemKey        | Specify a function that returns the Key of the corresponding item. See [React](//reactjs.org/docs/lists-and-keys.html) for details.                                                                                                                                                                                                                                                                                                                                                                                                       | `(index: number) => any`                                                                                                                           | `Android、iOS`       |
| preloadItemNumber | The number of items to preload before sliding to the bottom of the waterfall.                                                                                                                                                                                                                                                                                                                                                                                                                                                             | `number`                                                                                                                                           | `Android、iOS`       |
| onEndReached      | `onEndReached` is called when all data has been rendered and the list has been scrolled to the end.                                                                                                                                                                                                                                                                                                                                                                                                                                       | `Function`                                                                                                                                         | `Android、iOS`       |
| containPullHeader | Whether to include the `PullHeader` component, default`false`;`Android` does not support it temporarily, it can be temporarily replaced with the `RefreshWrapper` component.                                                                                                                                                                                                                                                                                                                                                              | `boolean`                                                                                                                                          | `iOS`               |
| renderPullHeader  | Specifies how to render the `PullHeader`, in which case `containPullHeader` is set to `true` by default.                                                                                                                                                                                                                                                                                                                                                                                                                                  | `() => React.ReactElement`                                                                                                                         | `iOS`               |
| containPullFooter | Whether to include the `PullFooter` component, default`false`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | `boolean`                                                                                                                                          | `Android、iOS`       |
| renderPullFooter  | Specifies how to render the `PullFooter`, in which case `containPullFooter` is set to `true` by default.                                                                                                                                                                                                                                                                                                                                                                                                                                  | `() => React.ReactElement`                                                                                                                         | `Android、iOS`       |
| onScroll          | This callback function is called when the WaterFall's sliding event is triggered. `startEdgePos` indicates the scroll offset from the top edge of the List; `endEdgePos` indicates the scroll offset from the bottom edge of the List;`firstVisibleRowIndex` indicates the index of the first element in the current visible area; `lastVisibleRowIndex` indicates the index of the last element in the current visible area;`visibleRowFrames` indicates the information (x, y, width, height) of all items in the current visible area. | `nativeEvent: { startEdgePos: number, endEdgePos: number, firstVisibleRowIndex: number, lastVisibleRowIndex: number, visibleRowFrames: Object[] }` | `Android、iOS`       |

## Methods

### scrollToIndex

`(obj: { index: number, animated: boolean }) => void` Notify Waterfall to slide to the specified item.

>* `index`: number - Scroll to the index item
>* `animated`: boolean - Whether to use animation during the sliding process, default`true`

### scrollToContentOffset

`(obj: { xOffset: number, yOffset: number, animated: boolean }) => void` Notifies Waterfall to slide to a specific coordinate offset value.

>* `xOffset`: number - Slide to the offset in the X direction.
>* `yOffset`: number - Slide to the offset in the Y direction.
>* `animated`: boolean - Whether to use animation during the sliding process, default`true`.

---

# WebView

[[WebView example]](//github.com/Tencent/Hippy/tree/master/examples/hippy-react-demo/src/components/WebView/index.jsx)

WebView component.

## Attributes

| Props       | Description                                                  | Type                                                         | Supported Platforms                           |
| ----------- | ------------------------------------------------------------ | ------------------------------------------------------------ | --------------------------------------------- |
| source      | Webview embedded address.                                    | `{ uri: string }`                                            | `Android、iOS、hippy-react-web、Web-Renderer` |
| userAgent   | Webview userAgent.                                           | `string`                                                     | `Android、iOS`                                |
| method      | Request method: `get`,`post`.                                | `string`                                                     | `Android、iOS`                                |
| onLoadStart | This callback function is called when the page starts to load. | `(object: { url: string }) => void`                           | `Android、iOS、Web-Renderer`                  |
| onLoad      | This callback function is called when the webpage is loading. | `(object: { url: string }) => void`                           | `Android、iOS、Web-Renderer`                  |
| onLoadEnd   | This callback function is called when the web page is loaded. (The `success` and `error` parameters are only available on `Android` and `iOS` since version `2.15.3`) | `(object: { url: string, success: boolean, error: string }) => void` | `Android、iOS、hippy-react-web、Web-Renderer` |
| style       | Webview container style.                                     | `Object`                                                     | `Android、iOS、hippy-react-web、Web-Renderer` |
