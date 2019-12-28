[Hippy](../README.md) › [Globals](../globals.md) › ["packages/hippy-react/src/components/navigator"](../modules/_packages_hippy_react_src_components_navigator_.md) › [Navigator](_packages_hippy_react_src_components_navigator_.navigator.md)

# Class: Navigator

Simply router component for switch in multiple Hippy page.

## Hierarchy

* any

  ↳ **Navigator**

## Index

### Methods

* [clear](_packages_hippy_react_src_components_navigator_.navigator.md#clear)
* [getCurrentPage](_packages_hippy_react_src_components_navigator_.navigator.md#getcurrentpage)
* [handleAndroidBack](_packages_hippy_react_src_components_navigator_.navigator.md#handleandroidback)
* [pop](_packages_hippy_react_src_components_navigator_.navigator.md#pop)
* [push](_packages_hippy_react_src_components_navigator_.navigator.md#push)

## Methods

###  clear

▸ **clear**(): *void*

*Defined in [packages/hippy-react/src/components/navigator.tsx:226](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/navigator.tsx#L226)*

Clear history stack

**Returns:** *void*

___

###  getCurrentPage

▸ **getCurrentPage**(): *any*

*Defined in [packages/hippy-react/src/components/navigator.tsx:171](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/navigator.tsx#L171)*

**Returns:** *any*

___

###  handleAndroidBack

▸ **handleAndroidBack**(): *void*

*Defined in [packages/hippy-react/src/components/navigator.tsx:175](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/navigator.tsx#L175)*

**Returns:** *void*

___

###  pop

▸ **pop**(`option`: object): *void*

*Defined in [packages/hippy-react/src/components/navigator.tsx:215](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/navigator.tsx#L215)*

Return back to previous page.

**Parameters:**

▪ **option**: *object*

Name | Type |
------ | ------ |
`animated` | boolean |

**Returns:** *void*

___

###  push

▸ **push**(`route`: [Route](../interfaces/_packages_hippy_react_src_components_navigator_.route.md)): *void*

*Defined in [packages/hippy-react/src/components/navigator.tsx:192](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/navigator.tsx#L192)*

Push into a new page/component.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`route` | [Route](../interfaces/_packages_hippy_react_src_components_navigator_.route.md) | New router |

**Returns:** *void*
