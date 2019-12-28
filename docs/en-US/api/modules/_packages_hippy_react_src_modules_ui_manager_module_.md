[Hippy](../README.md) › [Globals](../globals.md) › ["packages/hippy-react/src/modules/ui-manager-module"](_packages_hippy_react_src_modules_ui_manager_module_.md)

# External module: "packages/hippy-react/src/modules/ui-manager-module"

## Index

### Variables

* [createNode](_packages_hippy_react_src_modules_ui_manager_module_.md#createnode)
* [deleteNode](_packages_hippy_react_src_modules_ui_manager_module_.md#deletenode)
* [endBatch](_packages_hippy_react_src_modules_ui_manager_module_.md#endbatch)
* [flushBatch](_packages_hippy_react_src_modules_ui_manager_module_.md#flushbatch)
* [getNodeById](_packages_hippy_react_src_modules_ui_manager_module_.md#const-getnodebyid)
* [sendRenderError](_packages_hippy_react_src_modules_ui_manager_module_.md#sendrendererror)
* [startBatch](_packages_hippy_react_src_modules_ui_manager_module_.md#startbatch)
* [updateNode](_packages_hippy_react_src_modules_ui_manager_module_.md#updatenode)

### Functions

* [callUIFunction](_packages_hippy_react_src_modules_ui_manager_module_.md#calluifunction)
* [getNodeIdByRef](_packages_hippy_react_src_modules_ui_manager_module_.md#getnodeidbyref)
* [measureInWindow](_packages_hippy_react_src_modules_ui_manager_module_.md#measureinwindow)

## Variables

###  createNode

• **createNode**: *any*

*Defined in [packages/hippy-react/src/modules/ui-manager-module.ts:8](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/ui-manager-module.ts#L8)*

___

###  deleteNode

• **deleteNode**: *any*

*Defined in [packages/hippy-react/src/modules/ui-manager-module.ts:10](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/ui-manager-module.ts#L10)*

___

###  endBatch

• **endBatch**: *any*

*Defined in [packages/hippy-react/src/modules/ui-manager-module.ts:13](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/ui-manager-module.ts#L13)*

___

###  flushBatch

• **flushBatch**: *any*

*Defined in [packages/hippy-react/src/modules/ui-manager-module.ts:11](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/ui-manager-module.ts#L11)*

___

### `Const` getNodeById

• **getNodeById**: *[findNodeById](_packages_hippy_react_src_utils_node_.md#findnodebyid)* =  findNodeById

*Defined in [packages/hippy-react/src/modules/ui-manager-module.ts:17](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/ui-manager-module.ts#L17)*

___

###  sendRenderError

• **sendRenderError**: *any*

*Defined in [packages/hippy-react/src/modules/ui-manager-module.ts:14](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/ui-manager-module.ts#L14)*

___

###  startBatch

• **startBatch**: *any*

*Defined in [packages/hippy-react/src/modules/ui-manager-module.ts:12](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/ui-manager-module.ts#L12)*

___

###  updateNode

• **updateNode**: *any*

*Defined in [packages/hippy-react/src/modules/ui-manager-module.ts:9](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/ui-manager-module.ts#L9)*

## Functions

###  callUIFunction

▸ **callUIFunction**(...`args`: any[]): *void*

*Defined in [packages/hippy-react/src/modules/ui-manager-module.ts:28](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/ui-manager-module.ts#L28)*

**Parameters:**

Name | Type |
------ | ------ |
`...args` | any[] |

**Returns:** *void*

___

###  getNodeIdByRef

▸ **getNodeIdByRef**(`stringRef`: string): *Fiber*

*Defined in [packages/hippy-react/src/modules/ui-manager-module.ts:19](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/ui-manager-module.ts#L19)*

**Parameters:**

Name | Type |
------ | ------ |
`stringRef` | string |

**Returns:** *Fiber*

___

###  measureInWindow

▸ **measureInWindow**(`node`: Fiber, `callBack`: Function): *void*

*Defined in [packages/hippy-react/src/modules/ui-manager-module.ts:65](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/ui-manager-module.ts#L65)*

**Parameters:**

Name | Type |
------ | ------ |
`node` | Fiber |
`callBack` | Function |

**Returns:** *void*
