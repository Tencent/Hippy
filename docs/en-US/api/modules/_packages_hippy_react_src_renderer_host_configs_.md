[Hippy](../README.md) › [Globals](../globals.md) › ["packages/hippy-react/src/renderer/host-configs"](_packages_hippy_react_src_renderer_host_configs_.md)

# External module: "packages/hippy-react/src/renderer/host-configs"

## Index

### Functions

* [appendChild](_packages_hippy_react_src_renderer_host_configs_.md#appendchild)
* [appendChildToContainer](_packages_hippy_react_src_renderer_host_configs_.md#appendchildtocontainer)
* [appendInitialChild](_packages_hippy_react_src_renderer_host_configs_.md#appendinitialchild)
* [commitMount](_packages_hippy_react_src_renderer_host_configs_.md#commitmount)
* [commitUpdate](_packages_hippy_react_src_renderer_host_configs_.md#commitupdate)
* [createContainerChildSet](_packages_hippy_react_src_renderer_host_configs_.md#createcontainerchildset)
* [createInstance](_packages_hippy_react_src_renderer_host_configs_.md#createinstance)
* [createTextInstance](_packages_hippy_react_src_renderer_host_configs_.md#createtextinstance)
* [finalizeContainerChildren](_packages_hippy_react_src_renderer_host_configs_.md#finalizecontainerchildren)
* [finalizeInitialChildren](_packages_hippy_react_src_renderer_host_configs_.md#finalizeinitialchildren)
* [getChildHostContext](_packages_hippy_react_src_renderer_host_configs_.md#getchildhostcontext)
* [getPublicInstance](_packages_hippy_react_src_renderer_host_configs_.md#getpublicinstance)
* [getRootHostContext](_packages_hippy_react_src_renderer_host_configs_.md#getroothostcontext)
* [insertBefore](_packages_hippy_react_src_renderer_host_configs_.md#insertbefore)
* [prepareForCommit](_packages_hippy_react_src_renderer_host_configs_.md#prepareforcommit)
* [prepareUpdate](_packages_hippy_react_src_renderer_host_configs_.md#prepareupdate)
* [removeChild](_packages_hippy_react_src_renderer_host_configs_.md#removechild)
* [removeChildFromContainer](_packages_hippy_react_src_renderer_host_configs_.md#removechildfromcontainer)
* [replaceContainerChildren](_packages_hippy_react_src_renderer_host_configs_.md#replacecontainerchildren)
* [resetAfterCommit](_packages_hippy_react_src_renderer_host_configs_.md#resetaftercommit)
* [resetTextContent](_packages_hippy_react_src_renderer_host_configs_.md#resettextcontent)
* [shouldDeprioritizeSubtree](_packages_hippy_react_src_renderer_host_configs_.md#shoulddeprioritizesubtree)
* [shouldSetTextContent](_packages_hippy_react_src_renderer_host_configs_.md#shouldsettextcontent)

## Functions

###  appendChild

▸ **appendChild**(`parent`: [Element](../interfaces/_packages_hippy_react_web_src_adapters_apply_layout_.layoutelement.md#element), `child`: [Element](../interfaces/_packages_hippy_react_web_src_adapters_apply_layout_.layoutelement.md#element)): *void*

*Defined in [packages/hippy-react/src/renderer/host-configs.ts:13](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/renderer/host-configs.ts#L13)*

**Parameters:**

Name | Type |
------ | ------ |
`parent` | [Element](../interfaces/_packages_hippy_react_web_src_adapters_apply_layout_.layoutelement.md#element) |
`child` | [Element](../interfaces/_packages_hippy_react_web_src_adapters_apply_layout_.layoutelement.md#element) |

**Returns:** *void*

___

###  appendChildToContainer

▸ **appendChildToContainer**(`container`: any, `child`: [Element](../interfaces/_packages_hippy_react_web_src_adapters_apply_layout_.layoutelement.md#element)): *void*

*Defined in [packages/hippy-react/src/renderer/host-configs.ts:17](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/renderer/host-configs.ts#L17)*

**Parameters:**

Name | Type |
------ | ------ |
`container` | any |
`child` | [Element](../interfaces/_packages_hippy_react_web_src_adapters_apply_layout_.layoutelement.md#element) |

**Returns:** *void*

___

###  appendInitialChild

▸ **appendInitialChild**(`parent`: [Element](../interfaces/_packages_hippy_react_web_src_adapters_apply_layout_.layoutelement.md#element), `child`: [Element](../interfaces/_packages_hippy_react_web_src_adapters_apply_layout_.layoutelement.md#element)): *void*

*Defined in [packages/hippy-react/src/renderer/host-configs.ts:21](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/renderer/host-configs.ts#L21)*

**Parameters:**

Name | Type |
------ | ------ |
`parent` | [Element](../interfaces/_packages_hippy_react_web_src_adapters_apply_layout_.layoutelement.md#element) |
`child` | [Element](../interfaces/_packages_hippy_react_web_src_adapters_apply_layout_.layoutelement.md#element) |

**Returns:** *void*

___

###  commitMount

▸ **commitMount**(): *void*

*Defined in [packages/hippy-react/src/renderer/host-configs.ts:25](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/renderer/host-configs.ts#L25)*

**Returns:** *void*

___

###  commitUpdate

▸ **commitUpdate**(`instance`: any, `updatePayload`: any): *void*

*Defined in [packages/hippy-react/src/renderer/host-configs.ts:27](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/renderer/host-configs.ts#L27)*

**Parameters:**

Name | Type |
------ | ------ |
`instance` | any |
`updatePayload` | any |

**Returns:** *void*

___

###  createContainerChildSet

▸ **createContainerChildSet**(): *void*

*Defined in [packages/hippy-react/src/renderer/host-configs.ts:34](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/renderer/host-configs.ts#L34)*

**Returns:** *void*

___

###  createInstance

▸ **createInstance**(`type`: [Type](_packages_hippy_react_src_types_.md#type), `newProps`: [Props](_packages_hippy_react_src_types_.md#props), `rootContainerInstance`: Document, `currentHostContext`: object, `workInProgress`: any): *[ElementNode](../classes/_packages_hippy_react_src_dom_element_node_.elementnode.md)‹›*

*Defined in [packages/hippy-react/src/renderer/host-configs.ts:36](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/renderer/host-configs.ts#L36)*

**Parameters:**

Name | Type |
------ | ------ |
`type` | [Type](_packages_hippy_react_src_types_.md#type) |
`newProps` | [Props](_packages_hippy_react_src_types_.md#props) |
`rootContainerInstance` | Document |
`currentHostContext` | object |
`workInProgress` | any |

**Returns:** *[ElementNode](../classes/_packages_hippy_react_src_dom_element_node_.elementnode.md)‹›*

___

###  createTextInstance

▸ **createTextInstance**(`newText`: string, `rootContainerInstance`: Document): *[ElementNode](../classes/_packages_hippy_react_src_dom_element_node_.elementnode.md)‹›*

*Defined in [packages/hippy-react/src/renderer/host-configs.ts:63](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/renderer/host-configs.ts#L63)*

**Parameters:**

Name | Type |
------ | ------ |
`newText` | string |
`rootContainerInstance` | Document |

**Returns:** *[ElementNode](../classes/_packages_hippy_react_src_dom_element_node_.elementnode.md)‹›*

___

###  finalizeContainerChildren

▸ **finalizeContainerChildren**(): *void*

*Defined in [packages/hippy-react/src/renderer/host-configs.ts:79](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/renderer/host-configs.ts#L79)*

**Returns:** *void*

___

###  finalizeInitialChildren

▸ **finalizeInitialChildren**(): *boolean*

*Defined in [packages/hippy-react/src/renderer/host-configs.ts:75](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/renderer/host-configs.ts#L75)*

**Returns:** *boolean*

___

###  getChildHostContext

▸ **getChildHostContext**(): *[Context](_packages_hippy_react_src_types_.md#context)*

*Defined in [packages/hippy-react/src/renderer/host-configs.ts:157](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/renderer/host-configs.ts#L157)*

**Returns:** *[Context](_packages_hippy_react_src_types_.md#context)*

___

###  getPublicInstance

▸ **getPublicInstance**(`instance`: [Element](../interfaces/_packages_hippy_react_web_src_adapters_apply_layout_.layoutelement.md#element)): *[Element](../interfaces/_packages_hippy_react_web_src_adapters_apply_layout_.layoutelement.md#element)*

*Defined in [packages/hippy-react/src/renderer/host-configs.ts:81](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/renderer/host-configs.ts#L81)*

**Parameters:**

Name | Type |
------ | ------ |
`instance` | [Element](../interfaces/_packages_hippy_react_web_src_adapters_apply_layout_.layoutelement.md#element) |

**Returns:** *[Element](../interfaces/_packages_hippy_react_web_src_adapters_apply_layout_.layoutelement.md#element)*

___

###  getRootHostContext

▸ **getRootHostContext**(): *[Context](_packages_hippy_react_src_types_.md#context)*

*Defined in [packages/hippy-react/src/renderer/host-configs.ts:153](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/renderer/host-configs.ts#L153)*

**Returns:** *[Context](_packages_hippy_react_src_types_.md#context)*

___

###  insertBefore

▸ **insertBefore**(`parent`: [Element](../interfaces/_packages_hippy_react_web_src_adapters_apply_layout_.layoutelement.md#element), `child`: [Element](../interfaces/_packages_hippy_react_web_src_adapters_apply_layout_.layoutelement.md#element), `beforeChild`: [Element](../interfaces/_packages_hippy_react_web_src_adapters_apply_layout_.layoutelement.md#element)): *void*

*Defined in [packages/hippy-react/src/renderer/host-configs.ts:85](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/renderer/host-configs.ts#L85)*

**Parameters:**

Name | Type |
------ | ------ |
`parent` | [Element](../interfaces/_packages_hippy_react_web_src_adapters_apply_layout_.layoutelement.md#element) |
`child` | [Element](../interfaces/_packages_hippy_react_web_src_adapters_apply_layout_.layoutelement.md#element) |
`beforeChild` | [Element](../interfaces/_packages_hippy_react_web_src_adapters_apply_layout_.layoutelement.md#element) |

**Returns:** *void*

___

###  prepareForCommit

▸ **prepareForCommit**(): *void*

*Defined in [packages/hippy-react/src/renderer/host-configs.ts:98](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/renderer/host-configs.ts#L98)*

**Returns:** *void*

___

###  prepareUpdate

▸ **prepareUpdate**(`instance`: [Element](../interfaces/_packages_hippy_react_web_src_adapters_apply_layout_.layoutelement.md#element), `type`: [Type](_packages_hippy_react_src_types_.md#type), `oldProps`: [Props](_packages_hippy_react_src_types_.md#props), `newProps`: [Props](_packages_hippy_react_src_types_.md#props)): *[UpdatePayload](_packages_hippy_react_src_types_.md#updatepayload)*

*Defined in [packages/hippy-react/src/renderer/host-configs.ts:100](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/renderer/host-configs.ts#L100)*

**Parameters:**

Name | Type |
------ | ------ |
`instance` | [Element](../interfaces/_packages_hippy_react_web_src_adapters_apply_layout_.layoutelement.md#element) |
`type` | [Type](_packages_hippy_react_src_types_.md#type) |
`oldProps` | [Props](_packages_hippy_react_src_types_.md#props) |
`newProps` | [Props](_packages_hippy_react_src_types_.md#props) |

**Returns:** *[UpdatePayload](_packages_hippy_react_src_types_.md#updatepayload)*

___

###  removeChild

▸ **removeChild**(`parent`: [Element](../interfaces/_packages_hippy_react_web_src_adapters_apply_layout_.layoutelement.md#element), `child`: [Element](../interfaces/_packages_hippy_react_web_src_adapters_apply_layout_.layoutelement.md#element)): *void*

*Defined in [packages/hippy-react/src/renderer/host-configs.ts:140](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/renderer/host-configs.ts#L140)*

**Parameters:**

Name | Type |
------ | ------ |
`parent` | [Element](../interfaces/_packages_hippy_react_web_src_adapters_apply_layout_.layoutelement.md#element) |
`child` | [Element](../interfaces/_packages_hippy_react_web_src_adapters_apply_layout_.layoutelement.md#element) |

**Returns:** *void*

___

###  removeChildFromContainer

▸ **removeChildFromContainer**(`parent`: [Element](../interfaces/_packages_hippy_react_web_src_adapters_apply_layout_.layoutelement.md#element), `child`: [Element](../interfaces/_packages_hippy_react_web_src_adapters_apply_layout_.layoutelement.md#element)): *void*

*Defined in [packages/hippy-react/src/renderer/host-configs.ts:144](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/renderer/host-configs.ts#L144)*

**Parameters:**

Name | Type |
------ | ------ |
`parent` | [Element](../interfaces/_packages_hippy_react_web_src_adapters_apply_layout_.layoutelement.md#element) |
`child` | [Element](../interfaces/_packages_hippy_react_web_src_adapters_apply_layout_.layoutelement.md#element) |

**Returns:** *void*

___

###  replaceContainerChildren

▸ **replaceContainerChildren**(): *void*

*Defined in [packages/hippy-react/src/renderer/host-configs.ts:138](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/renderer/host-configs.ts#L138)*

**Returns:** *void*

___

###  resetAfterCommit

▸ **resetAfterCommit**(): *void*

*Defined in [packages/hippy-react/src/renderer/host-configs.ts:148](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/renderer/host-configs.ts#L148)*

**Returns:** *void*

___

###  resetTextContent

▸ **resetTextContent**(): *void*

*Defined in [packages/hippy-react/src/renderer/host-configs.ts:150](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/renderer/host-configs.ts#L150)*

**Returns:** *void*

___

###  shouldDeprioritizeSubtree

▸ **shouldDeprioritizeSubtree**(): *boolean*

*Defined in [packages/hippy-react/src/renderer/host-configs.ts:161](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/renderer/host-configs.ts#L161)*

**Returns:** *boolean*

___

###  shouldSetTextContent

▸ **shouldSetTextContent**(`type`: [Type](_packages_hippy_react_src_types_.md#type), `nextProps`: [Props](_packages_hippy_react_src_types_.md#props)): *boolean*

*Defined in [packages/hippy-react/src/renderer/host-configs.ts:165](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/renderer/host-configs.ts#L165)*

**Parameters:**

Name | Type |
------ | ------ |
`type` | [Type](_packages_hippy_react_src_types_.md#type) |
`nextProps` | [Props](_packages_hippy_react_src_types_.md#props) |

**Returns:** *boolean*
