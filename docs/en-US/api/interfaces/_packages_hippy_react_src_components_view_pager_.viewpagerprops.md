[Hippy](../README.md) › [Globals](../globals.md) › ["packages/hippy-react/src/components/view-pager"](../modules/_packages_hippy_react_src_components_view_pager_.md) › [ViewPagerProps](_packages_hippy_react_src_components_view_pager_.viewpagerprops.md)

# Interface: ViewPagerProps

## Hierarchy

* **ViewPagerProps**

## Index

### Properties

* [initialPage](_packages_hippy_react_src_components_view_pager_.viewpagerprops.md#initialpage)
* [scrollEnabled](_packages_hippy_react_src_components_view_pager_.viewpagerprops.md#optional-scrollenabled)

### Methods

* [onPageScroll](_packages_hippy_react_src_components_view_pager_.viewpagerprops.md#optional-onpagescroll)
* [onPageScrollStateChanged](_packages_hippy_react_src_components_view_pager_.viewpagerprops.md#optional-onpagescrollstatechanged)
* [onPageSelected](_packages_hippy_react_src_components_view_pager_.viewpagerprops.md#optional-onpageselected)

## Properties

###  initialPage

• **initialPage**: *number*

*Defined in [packages/hippy-react/src/components/view-pager.tsx:26](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/view-pager.tsx#L26)*

Specifc initial page after rendering.

Default: 0

___

### `Optional` scrollEnabled

• **scrollEnabled**? : *undefined | false | true*

*Defined in [packages/hippy-react/src/components/view-pager.tsx:35](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/view-pager.tsx#L35)*

When `false`, the view cannot be scrolled via touch interaction.

Default: true

> Note that the view can always be scrolled by calling setPage.

## Methods

### `Optional` onPageScroll

▸ **onPageScroll**(`evt`: [PageScrollEvent](_packages_hippy_react_src_components_view_pager_.pagescrollevent.md)): *void*

*Defined in [packages/hippy-react/src/components/view-pager.tsx:52](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/view-pager.tsx#L52)*

Called when the page scroll starts.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`evt` | [PageScrollEvent](_packages_hippy_react_src_components_view_pager_.pagescrollevent.md) | Page scroll event data. |

**Returns:** *void*

___

### `Optional` onPageScrollStateChanged

▸ **onPageScrollStateChanged**(`evt`: [PageScrollState](../modules/_packages_hippy_react_src_components_view_pager_.md#pagescrollstate)): *void*

*Defined in [packages/hippy-react/src/components/view-pager.tsx:64](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/view-pager.tsx#L64)*

Called when the page scroll state changed.

**Parameters:**

Name | Type |
------ | ------ |
`evt` | [PageScrollState](../modules/_packages_hippy_react_src_components_view_pager_.md#pagescrollstate) |

**Returns:** *void*

___

### `Optional` onPageSelected

▸ **onPageSelected**(`evt`: [PageSelectedEvent](_packages_hippy_react_src_components_view_pager_.pageselectedevent.md)): *void*

*Defined in [packages/hippy-react/src/components/view-pager.tsx:43](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/view-pager.tsx#L43)*

Fires at most once per page is selected

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`evt` | [PageSelectedEvent](_packages_hippy_react_src_components_view_pager_.pageselectedevent.md) | Page selected event data. |

**Returns:** *void*
