[Hippy](../README.md) › [Globals](../globals.md) › ["packages/hippy-react/src/components/scroll-view"](../modules/_packages_hippy_react_src_components_scroll_view_.md) › [ScrollViewProps](_packages_hippy_react_src_components_scroll_view_.scrollviewprops.md)

# Interface: ScrollViewProps

## Hierarchy

* **ScrollViewProps**

## Index

### Properties

* [contentContainerStyle](_packages_hippy_react_src_components_scroll_view_.scrollviewprops.md#optional-contentcontainerstyle)
* [horizontal](_packages_hippy_react_src_components_scroll_view_.scrollviewprops.md#optional-horizontal)
* [pagingEnabled](_packages_hippy_react_src_components_scroll_view_.scrollviewprops.md#optional-pagingenabled)
* [scrollEnabled](_packages_hippy_react_src_components_scroll_view_.scrollviewprops.md#optional-scrollenabled)
* [scrollEventThrottle](_packages_hippy_react_src_components_scroll_view_.scrollviewprops.md#optional-scrolleventthrottle)
* [scrollIndicatorInsets](_packages_hippy_react_src_components_scroll_view_.scrollviewprops.md#optional-scrollindicatorinsets)
* [showsHorizontalScrollIndicator](_packages_hippy_react_src_components_scroll_view_.scrollviewprops.md#optional-showshorizontalscrollindicator)
* [showsVerticalScrollIndicator](_packages_hippy_react_src_components_scroll_view_.scrollviewprops.md#optional-showsverticalscrollindicator)
* [style](_packages_hippy_react_src_components_scroll_view_.scrollviewprops.md#optional-style)

### Methods

* [onMomentumScrollBegin](_packages_hippy_react_src_components_scroll_view_.scrollviewprops.md#optional-onmomentumscrollbegin)
* [onMomentumScrollEnd](_packages_hippy_react_src_components_scroll_view_.scrollviewprops.md#optional-onmomentumscrollend)
* [onScroll](_packages_hippy_react_src_components_scroll_view_.scrollviewprops.md#optional-onscroll)
* [onScrollBeginDrag](_packages_hippy_react_src_components_scroll_view_.scrollviewprops.md#optional-onscrollbegindrag)
* [onScrollEndDrag](_packages_hippy_react_src_components_scroll_view_.scrollviewprops.md#optional-onscrollenddrag)

## Properties

### `Optional` contentContainerStyle

• **contentContainerStyle**? : *[Style](_types_style_.style.md)*

*Defined in [packages/hippy-react/src/components/scroll-view.tsx:49](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/scroll-view.tsx#L49)*

These styles will be applied to the scroll view content container which wraps all
of the child views.

___

### `Optional` horizontal

• **horizontal**? : *undefined | false | true*

*Defined in [packages/hippy-react/src/components/scroll-view.tsx:16](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/scroll-view.tsx#L16)*

When true, the scroll view's children are arranged horizontally in a row
instead of vertically in a column.
The default value is `false`.

___

### `Optional` pagingEnabled

• **pagingEnabled**? : *undefined | false | true*

*Defined in [packages/hippy-react/src/components/scroll-view.tsx:23](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/scroll-view.tsx#L23)*

When `true`, the scroll view stops on multiples of the scroll view's size when scrolling.
This can be used for horizontal pagination.
Default: false

___

### `Optional` scrollEnabled

• **scrollEnabled**? : *undefined | false | true*

*Defined in [packages/hippy-react/src/components/scroll-view.tsx:31](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/scroll-view.tsx#L31)*

When `false`, the view cannot be scrolled via touch interaction.
Default: true

> Note that the view can always be scrolled by calling scrollTo.

___

### `Optional` scrollEventThrottle

• **scrollEventThrottle**? : *undefined | number*

*Defined in [packages/hippy-react/src/components/scroll-view.tsx:63](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/scroll-view.tsx#L63)*

This controls how often the scroll event will be fired while scrolling
(as a time interval in ms). A lower number yields better accuracy for code
that is tracking the scroll position, but can lead to scroll performance
problems due to the volume of information being send over the bridge.
You will not notice a difference between values set between 1-16 as the JS run loop
is synced to the screen refresh rate. If you do not need precise scroll position tracking,
set this value higher to limit the information being sent across the bridge.

The default value is zero, which results in the scroll event being sent only once
each time the view is scrolled.

___

### `Optional` scrollIndicatorInsets

• **scrollIndicatorInsets**? : *undefined | object*

*Defined in [packages/hippy-react/src/components/scroll-view.tsx:71](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/scroll-view.tsx#L71)*

The amount by which the scroll view indicators are inset from the edges of the scroll view.
This should normally be set to the same value as the `contentInset`.

Default: {top: 0, right: 0, bottom: 0, left: 0}.

___

### `Optional` showsHorizontalScrollIndicator

• **showsHorizontalScrollIndicator**? : *undefined | false | true*

*Defined in [packages/hippy-react/src/components/scroll-view.tsx:37](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/scroll-view.tsx#L37)*

When `true`, shows a horizontal scroll indicator.
Default: true

___

### `Optional` showsVerticalScrollIndicator

• **showsVerticalScrollIndicator**? : *undefined | false | true*

*Defined in [packages/hippy-react/src/components/scroll-view.tsx:43](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/scroll-view.tsx#L43)*

When `true`, shows a vertical scroll indicator.
Default: true

___

### `Optional` style

• **style**? : *[Style](_types_style_.style.md)*

*Defined in [packages/hippy-react/src/components/scroll-view.tsx:107](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/scroll-view.tsx#L107)*

## Methods

### `Optional` onMomentumScrollBegin

▸ **onMomentumScrollBegin**(): *void*

*Defined in [packages/hippy-react/src/components/scroll-view.tsx:81](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/scroll-view.tsx#L81)*

Called when the momentum scroll starts (scroll which occurs as the ScrollView starts gliding).

**Returns:** *void*

___

### `Optional` onMomentumScrollEnd

▸ **onMomentumScrollEnd**(): *void*

*Defined in [packages/hippy-react/src/components/scroll-view.tsx:86](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/scroll-view.tsx#L86)*

Called when the momentum scroll ends (scroll which occurs as the ScrollView glides to a stop).

**Returns:** *void*

___

### `Optional` onScroll

▸ **onScroll**(`evt`: object): *void*

*Defined in [packages/hippy-react/src/components/scroll-view.tsx:96](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/scroll-view.tsx#L96)*

Fires at most once per frame during scrolling.
The frequency of the events can be controlled using the `scrollEventThrottle` prop.

**Parameters:**

▪ **evt**: *object*

Scroll event data.

Name | Type |
------ | ------ |
`contentOffset` | object |

**Returns:** *void*

___

### `Optional` onScrollBeginDrag

▸ **onScrollBeginDrag**(): *void*

*Defined in [packages/hippy-react/src/components/scroll-view.tsx:101](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/scroll-view.tsx#L101)*

Called when the user begins to drag the scroll view.

**Returns:** *void*

___

### `Optional` onScrollEndDrag

▸ **onScrollEndDrag**(): *void*

*Defined in [packages/hippy-react/src/components/scroll-view.tsx:106](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/scroll-view.tsx#L106)*

Called when the user stops dragging the scroll view and it either stops or begins to glide.

**Returns:** *void*
