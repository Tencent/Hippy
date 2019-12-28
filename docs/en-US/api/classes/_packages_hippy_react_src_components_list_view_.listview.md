[Hippy](../README.md) › [Globals](../globals.md) › ["packages/hippy-react/src/components/list-view"](../modules/_packages_hippy_react_src_components_list_view_.md) › [ListView](_packages_hippy_react_src_components_list_view_.listview.md)

# Class: ListView

Recyclable list for better performance, and lower memory usage.

## Hierarchy

* any

  ↳ **ListView**

## Index

### Methods

* [scrollToContentOffset](_packages_hippy_react_src_components_list_view_.listview.md#scrolltocontentoffset)
* [scrollToIndex](_packages_hippy_react_src_components_list_view_.listview.md#scrolltoindex)

## Methods

###  scrollToContentOffset

▸ **scrollToContentOffset**(`xOffset`: number, `yOffset`: number, `animated`: boolean): *void*

*Defined in [packages/hippy-react/src/components/list-view.tsx:216](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/list-view.tsx#L216)*

Scrolls to a given x, y offset, either immediately, with a smooth animation.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`xOffset` | number | Scroll to horizon offset X. |
`yOffset` | number | Scroll To veritical offset Y. |
`animated` | boolean | With smooth animation.By default is true.  |

**Returns:** *void*

___

###  scrollToIndex

▸ **scrollToIndex**(`xIndex`: number, `yIndex`: number, `animated`: boolean): *void*

*Defined in [packages/hippy-react/src/components/list-view.tsx:202](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/list-view.tsx#L202)*

Scrolls to a given index of itme, either immediately, with a smooth animation.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`xIndex` | number | Scroll to horizon index X. |
`yIndex` | number | Scroll To veritical index Y. |
`animated` | boolean | With smooth animation.By default is true.  |

**Returns:** *void*
