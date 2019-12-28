[Hippy](../README.md) › [Globals](../globals.md) › ["packages/hippy-react/src/utils/node"](_packages_hippy_react_src_utils_node_.md)

# External module: "packages/hippy-react/src/utils/node"

## Index

### Type aliases

* [RootContainer](_packages_hippy_react_src_utils_node_.md#rootcontainer)

### Variables

* [componentName](_packages_hippy_react_src_utils_node_.md#const-componentname)
* [rootContainer](_packages_hippy_react_src_utils_node_.md#let-rootcontainer)
* [rootViewId](_packages_hippy_react_src_utils_node_.md#let-rootviewid)

### Functions

* [findNodeByCondition](_packages_hippy_react_src_utils_node_.md#findnodebycondition)
* [findNodeById](_packages_hippy_react_src_utils_node_.md#findnodebyid)
* [getRootContainer](_packages_hippy_react_src_utils_node_.md#getrootcontainer)
* [getRootViewId](_packages_hippy_react_src_utils_node_.md#getrootviewid)
* [setRootContainer](_packages_hippy_react_src_utils_node_.md#setrootcontainer)

## Type aliases

###  RootContainer

Ƭ **RootContainer**: *any*

*Defined in [packages/hippy-react/src/utils/node.ts:8](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/utils/node.ts#L8)*

## Variables

### `Const` componentName

• **componentName**: *string[]* =  ['%c[root]%c', 'color: blue', 'color: auto']

*Defined in [packages/hippy-react/src/utils/node.ts:10](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/utils/node.ts#L10)*

___

### `Let` rootContainer

• **rootContainer**: *[RootContainer](_packages_hippy_react_src_utils_node_.md#rootcontainer)*

*Defined in [packages/hippy-react/src/utils/node.ts:13](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/utils/node.ts#L13)*

___

### `Let` rootViewId

• **rootViewId**: *number*

*Defined in [packages/hippy-react/src/utils/node.ts:14](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/utils/node.ts#L14)*

## Functions

###  findNodeByCondition

▸ **findNodeByCondition**(`condition`: function): *any*

*Defined in [packages/hippy-react/src/utils/node.ts:32](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/utils/node.ts#L32)*

**Parameters:**

▪ **condition**: *function*

▸ (`node`: Fiber): *boolean*

**Parameters:**

Name | Type |
------ | ------ |
`node` | Fiber |

**Returns:** *any*

___

###  findNodeById

▸ **findNodeById**(`nodeId`: number): *any*

*Defined in [packages/hippy-react/src/utils/node.ts:56](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/utils/node.ts#L56)*

**Parameters:**

Name | Type |
------ | ------ |
`nodeId` | number |

**Returns:** *any*

___

###  getRootContainer

▸ **getRootContainer**(): *[RootContainer](_packages_hippy_react_src_utils_node_.md#rootcontainer)*

*Defined in [packages/hippy-react/src/utils/node.ts:21](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/utils/node.ts#L21)*

**Returns:** *[RootContainer](_packages_hippy_react_src_utils_node_.md#rootcontainer)*

___

###  getRootViewId

▸ **getRootViewId**(): *number*

*Defined in [packages/hippy-react/src/utils/node.ts:25](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/utils/node.ts#L25)*

**Returns:** *number*

___

###  setRootContainer

▸ **setRootContainer**(`rootId`: number, `root`: [RootContainer](_packages_hippy_react_src_utils_node_.md#rootcontainer)): *void*

*Defined in [packages/hippy-react/src/utils/node.ts:16](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/utils/node.ts#L16)*

**Parameters:**

Name | Type |
------ | ------ |
`rootId` | number |
`root` | [RootContainer](_packages_hippy_react_src_utils_node_.md#rootcontainer) |

**Returns:** *void*
