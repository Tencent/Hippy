[Hippy](../README.md) › [Globals](../globals.md) › ["packages/hippy-react/src/components/scroll-view"](../modules/_packages_hippy_react_src_components_scroll_view_.md) › [ScrollView](_packages_hippy_react_src_components_scroll_view_.scrollview.md)

# Class: ScrollView

Scrollable View without recycle feature.

If you need to implement a long list, use `ListView`.

## Hierarchy

* any

  ↳ **ScrollView**

## Index

### Methods

* [scrollTo](_packages_hippy_react_src_components_scroll_view_.scrollview.md#scrollto)
* [scrollToWithDuration](_packages_hippy_react_src_components_scroll_view_.scrollview.md#scrolltowithduration)

## Methods

###  scrollTo

▸ **scrollTo**(`x`: number | object, `y`: number, `animated`: boolean): *void*

*Defined in [packages/hippy-react/src/components/scroll-view.tsx:149](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/scroll-view.tsx#L149)*

Scrolls to a given x, y offset, either immediately, with a smooth animation.

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`x` | number &#124; object | - | Scroll to horizon position X. |
`y` | number | - | Scroll To veritical position Y. |
`animated` | boolean | true | With smooth animation.By default is true.  |

**Returns:** *void*

___

###  scrollToWithDuration

▸ **scrollToWithDuration**(`x`: number, `y`: number, `duration`: number): *void*

*Defined in [packages/hippy-react/src/components/scroll-view.tsx:176](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/scroll-view.tsx#L176)*

Scrolls to a given x, y offset, with specific duration of animation.

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`x` | number | 0 | Scroll to horizon position X. |
`y` | number | 0 | Scroll To veritical position Y. |
`duration` | number | 1000 | Duration of animation execution time, with ms unit.                            By default is 1000ms.  |

**Returns:** *void*
