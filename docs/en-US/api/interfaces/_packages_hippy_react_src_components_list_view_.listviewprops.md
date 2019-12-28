[Hippy](../README.md) › [Globals](../globals.md) › ["packages/hippy-react/src/components/list-view"](../modules/_packages_hippy_react_src_components_list_view_.md) › [ListViewProps](_packages_hippy_react_src_components_list_view_.listviewprops.md)

# Interface: ListViewProps

## Hierarchy

* **ListViewProps**

## Index

### Properties

* [dataSource](_packages_hippy_react_src_components_list_view_.listviewprops.md#datasource)
* [initialContentOffset](_packages_hippy_react_src_components_list_view_.listviewprops.md#optional-initialcontentoffset)
* [initialListSize](_packages_hippy_react_src_components_list_view_.listviewprops.md#optional-initiallistsize)
* [numberOfRows](_packages_hippy_react_src_components_list_view_.listviewprops.md#numberofrows)
* [scrollEventThrottle](_packages_hippy_react_src_components_list_view_.listviewprops.md#scrolleventthrottle)
* [showScrollIndicator](_packages_hippy_react_src_components_list_view_.listviewprops.md#optional-showscrollindicator)
* [style](_packages_hippy_react_src_components_list_view_.listviewprops.md#optional-style)

### Methods

* [getRowKey](_packages_hippy_react_src_components_list_view_.listviewprops.md#optional-getrowkey)
* [getRowStyle](_packages_hippy_react_src_components_list_view_.listviewprops.md#optional-getrowstyle)
* [getRowType](_packages_hippy_react_src_components_list_view_.listviewprops.md#optional-getrowtype)
* [onEndReached](_packages_hippy_react_src_components_list_view_.listviewprops.md#optional-onendreached)
* [onMomentumScrollBegin](_packages_hippy_react_src_components_list_view_.listviewprops.md#optional-onmomentumscrollbegin)
* [onMomentumScrollEnd](_packages_hippy_react_src_components_list_view_.listviewprops.md#optional-onmomentumscrollend)
* [onRowLayout](_packages_hippy_react_src_components_list_view_.listviewprops.md#optional-onrowlayout)
* [onScroll](_packages_hippy_react_src_components_list_view_.listviewprops.md#optional-onscroll)
* [onScrollBeginDrag](_packages_hippy_react_src_components_list_view_.listviewprops.md#optional-onscrollbegindrag)
* [onScrollEndDrag](_packages_hippy_react_src_components_list_view_.listviewprops.md#optional-onscrollenddrag)
* [renderRow](_packages_hippy_react_src_components_list_view_.listviewprops.md#renderrow)
* [rowShouldSticky](_packages_hippy_react_src_components_list_view_.listviewprops.md#optional-rowshouldsticky)

## Properties

###  dataSource

• **dataSource**: *[DataItem](../modules/_packages_hippy_react_src_components_list_view_.md#dataitem)[]*

*Defined in [packages/hippy-react/src/components/list-view.tsx:20](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/list-view.tsx#L20)*

Data source

___

### `Optional` initialContentOffset

• **initialContentOffset**? : *undefined | number*

*Defined in [packages/hippy-react/src/components/list-view.tsx:30](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/list-view.tsx#L30)*

Scroll to offset after `ListView` with data rendered.

___

### `Optional` initialListSize

• **initialListSize**? : *undefined | number*

*Defined in [packages/hippy-react/src/components/list-view.tsx:25](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/list-view.tsx#L25)*

Specfic how many data will render at first screen.

___

###  numberOfRows

• **numberOfRows**: *number*

*Defined in [packages/hippy-react/src/components/list-view.tsx:15](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/list-view.tsx#L15)*

Render specific number of rows of data.
Set equal to dataShource.length in most case.

___

###  scrollEventThrottle

• **scrollEventThrottle**: *number*

*Defined in [packages/hippy-react/src/components/list-view.tsx:44](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/list-view.tsx#L44)*

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

### `Optional` showScrollIndicator

• **showScrollIndicator**? : *undefined | false | true*

*Defined in [packages/hippy-react/src/components/list-view.tsx:50](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/list-view.tsx#L50)*

When `true`, shows a horizon scroll indicator.
The default value is `true`.

___

### `Optional` style

• **style**? : *[Style](_types_style_.style.md)*

*Defined in [packages/hippy-react/src/components/list-view.tsx:97](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/list-view.tsx#L97)*

## Methods

### `Optional` getRowKey

▸ **getRowKey**(`index`: number): *string*

*Defined in [packages/hippy-react/src/components/list-view.tsx:89](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/list-view.tsx#L89)*

Specfic the key of row, for better data diff
More info: https://reactjs.org/docs/lists-and-keys.html

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`index` | number | Index Of data. |

**Returns:** *string*

___

### `Optional` getRowStyle

▸ **getRowStyle**(`index`: number): *[Style](_types_style_.style.md)*

*Defined in [packages/hippy-react/src/components/list-view.tsx:80](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/list-view.tsx#L80)*

Returns the style for specific index of row.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`index` | number | Index Of data. |

**Returns:** *[Style](_types_style_.style.md)*

___

### `Optional` getRowType

▸ **getRowType**(`index`: number): *string*

*Defined in [packages/hippy-react/src/components/list-view.tsx:72](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/list-view.tsx#L72)*

Each row have different type, it will be using at render recycle.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`index` | number | Index Of data. |

**Returns:** *string*

___

### `Optional` onEndReached

▸ **onEndReached**(): *void*

*Defined in [packages/hippy-react/src/components/list-view.tsx:102](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/list-view.tsx#L102)*

 Called when the `ListView` is scrolling to bottom.

**Returns:** *void*

___

### `Optional` onMomentumScrollBegin

▸ **onMomentumScrollBegin**(): *void*

*Defined in [packages/hippy-react/src/components/list-view.tsx:119](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/list-view.tsx#L119)*

Called when the momentum scroll starts (scroll which occurs as the ListView starts gliding).

**Returns:** *void*

___

### `Optional` onMomentumScrollEnd

▸ **onMomentumScrollEnd**(): *void*

*Defined in [packages/hippy-react/src/components/list-view.tsx:124](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/list-view.tsx#L124)*

Called when the momentum scroll ends (scroll which occurs as the ListView glides to a stop).

**Returns:** *void*

___

### `Optional` onRowLayout

▸ **onRowLayout**(`evt`: [LayoutEvent](_types_event_.layoutevent.md), `index`: number): *void*

*Defined in [packages/hippy-react/src/components/list-view.tsx:114](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/list-view.tsx#L114)*

 Called when the row first layouting or layout changed.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`evt` | [LayoutEvent](_types_event_.layoutevent.md) | Layout event data |
`index` | number | Index of data.  |

**Returns:** *void*

___

### `Optional` onScroll

▸ **onScroll**(`evt`: object): *void*

*Defined in [packages/hippy-react/src/components/list-view.tsx:134](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/list-view.tsx#L134)*

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

*Defined in [packages/hippy-react/src/components/list-view.tsx:139](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/list-view.tsx#L139)*

Called when the user begins to drag the scroll view.

**Returns:** *void*

___

### `Optional` onScrollEndDrag

▸ **onScrollEndDrag**(): *void*

*Defined in [packages/hippy-react/src/components/list-view.tsx:144](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/list-view.tsx#L144)*

Called when the user stops dragging the scroll view and it either stops or begins to glide.

**Returns:** *void*

___

###  renderRow

▸ **renderRow**(`data`: [DataItem](../modules/_packages_hippy_react_src_components_list_view_.md#dataitem), `unknown?`: any, `index?`: undefined | number): *React.ReactElement*

*Defined in [packages/hippy-react/src/components/list-view.tsx:60](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/list-view.tsx#L60)*

Passing the data and returns the row component.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`data` | [DataItem](../modules/_packages_hippy_react_src_components_list_view_.md#dataitem) | Data for row rendering |
`unknown?` | any | seems null. |
`index?` | undefined &#124; number | Index Of data. |

**Returns:** *React.ReactElement*

___

### `Optional` rowShouldSticky

▸ **rowShouldSticky**(`index`: number): *boolean*

*Defined in [packages/hippy-react/src/components/list-view.tsx:96](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/list-view.tsx#L96)*

Is the row should sticky after scrolling up.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`index` | number | Index Of data. |

**Returns:** *boolean*
