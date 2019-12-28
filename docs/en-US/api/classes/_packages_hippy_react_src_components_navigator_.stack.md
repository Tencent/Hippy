[Hippy](../README.md) › [Globals](../globals.md) › ["packages/hippy-react/src/components/navigator"](../modules/_packages_hippy_react_src_components_navigator_.md) › [Stack](_packages_hippy_react_src_components_navigator_.stack.md)

# Class: Stack

## Hierarchy

* **Stack**

## Index

### Properties

* [size](_packages_hippy_react_src_components_navigator_.stack.md#size)
* [top](_packages_hippy_react_src_components_navigator_.stack.md#top)

### Methods

* [clear](_packages_hippy_react_src_components_navigator_.stack.md#clear)
* [displayAll](_packages_hippy_react_src_components_navigator_.stack.md#displayall)
* [peek](_packages_hippy_react_src_components_navigator_.stack.md#peek)
* [pop](_packages_hippy_react_src_components_navigator_.stack.md#pop)
* [push](_packages_hippy_react_src_components_navigator_.stack.md#push)

## Properties

###  size

• **size**: *number* = 0

*Defined in [packages/hippy-react/src/components/navigator.tsx:34](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/navigator.tsx#L34)*

___

###  top

• **top**: *[Top](../interfaces/_packages_hippy_react_src_components_navigator_.top.md) | null* =  null

*Defined in [packages/hippy-react/src/components/navigator.tsx:32](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/navigator.tsx#L32)*

## Methods

###  clear

▸ **clear**(): *void*

*Defined in [packages/hippy-react/src/components/navigator.tsx:82](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/navigator.tsx#L82)*

Clear history stack

**Returns:** *void*

___

###  displayAll

▸ **displayAll**(): *any[]*

*Defined in [packages/hippy-react/src/components/navigator.tsx:90](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/navigator.tsx#L90)*

Returns all of routes

**Returns:** *any[]*

___

###  peek

▸ **peek**(): *any*

*Defined in [packages/hippy-react/src/components/navigator.tsx:56](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/navigator.tsx#L56)*

Returns latest push router.

**Returns:** *any*

___

###  pop

▸ **pop**(): *any*

*Defined in [packages/hippy-react/src/components/navigator.tsx:63](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/navigator.tsx#L63)*

Return back to previous page.

**Returns:** *any*

___

###  push

▸ **push**(`route`: [Route](../interfaces/_packages_hippy_react_src_components_navigator_.route.md)): *void*

*Defined in [packages/hippy-react/src/components/navigator.tsx:45](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/navigator.tsx#L45)*

Push into a new page/component.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`route` | [Route](../interfaces/_packages_hippy_react_src_components_navigator_.route.md) | New router |

**Returns:** *void*
