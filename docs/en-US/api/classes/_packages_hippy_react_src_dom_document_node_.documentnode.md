[Hippy](../README.md) › [Globals](../globals.md) › ["packages/hippy-react/src/dom/document-node"](../modules/_packages_hippy_react_src_dom_document_node_.md) › [DocumentNode](_packages_hippy_react_src_dom_document_node_.documentnode.md)

# Class: DocumentNode

## Hierarchy

* [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md)

  ↳ **DocumentNode**

## Index

### Constructors

* [constructor](_packages_hippy_react_src_dom_document_node_.documentnode.md#constructor)

### Properties

* [childNodes](_packages_hippy_react_src_dom_document_node_.documentnode.md#childnodes)
* [documentElement](_packages_hippy_react_src_dom_document_node_.documentnode.md#documentelement)
* [index](_packages_hippy_react_src_dom_document_node_.documentnode.md#index)
* [nextSibling](_packages_hippy_react_src_dom_document_node_.documentnode.md#nextsibling)
* [nodeId](_packages_hippy_react_src_dom_document_node_.documentnode.md#nodeid)
* [parentNode](_packages_hippy_react_src_dom_document_node_.documentnode.md#parentnode)
* [prevSibling](_packages_hippy_react_src_dom_document_node_.documentnode.md#prevsibling)
* [createElement](_packages_hippy_react_src_dom_document_node_.documentnode.md#static-createelement)
* [createElementNS](_packages_hippy_react_src_dom_document_node_.documentnode.md#static-createelementns)

### Accessors

* [firstChild](_packages_hippy_react_src_dom_document_node_.documentnode.md#firstchild)
* [isMounted](_packages_hippy_react_src_dom_document_node_.documentnode.md#ismounted)
* [lastChild](_packages_hippy_react_src_dom_document_node_.documentnode.md#lastchild)
* [ownerDocument](_packages_hippy_react_src_dom_document_node_.documentnode.md#ownerdocument)

### Methods

* [appendChild](_packages_hippy_react_src_dom_document_node_.documentnode.md#appendchild)
* [createElement](_packages_hippy_react_src_dom_document_node_.documentnode.md#createelement)
* [createElementNS](_packages_hippy_react_src_dom_document_node_.documentnode.md#createelementns)
* [findChild](_packages_hippy_react_src_dom_document_node_.documentnode.md#findchild)
* [insertBefore](_packages_hippy_react_src_dom_document_node_.documentnode.md#insertbefore)
* [moveChild](_packages_hippy_react_src_dom_document_node_.documentnode.md#movechild)
* [removeChild](_packages_hippy_react_src_dom_document_node_.documentnode.md#removechild)
* [toString](_packages_hippy_react_src_dom_document_node_.documentnode.md#tostring)
* [traverseChildren](_packages_hippy_react_src_dom_document_node_.documentnode.md#traversechildren)

### Object literals

* [meta](_packages_hippy_react_src_dom_document_node_.documentnode.md#meta)

## Constructors

###  constructor

\+ **new DocumentNode**(): *[DocumentNode](_packages_hippy_react_src_dom_document_node_.documentnode.md)*

*Overrides [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md).[constructor](_packages_hippy_react_src_dom_view_node_.viewnode.md#constructor)*

*Defined in [packages/hippy-react/src/dom/document-node.ts:11](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/document-node.ts#L11)*

**Returns:** *[DocumentNode](_packages_hippy_react_src_dom_document_node_.documentnode.md)*

## Properties

###  childNodes

• **childNodes**: *[ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md)[]* =  []

*Inherited from [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md).[childNodes](_packages_hippy_react_src_dom_view_node_.viewnode.md#childnodes)*

*Defined in [packages/hippy-react/src/dom/view-node.ts:45](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/view-node.ts#L45)*

___

###  documentElement

• **documentElement**: *[Element](../interfaces/_packages_hippy_react_web_src_adapters_apply_layout_.layoutelement.md#element)*

*Defined in [packages/hippy-react/src/dom/document-node.ts:7](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/document-node.ts#L7)*

___

###  index

• **index**: *number* = 0

*Inherited from [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md).[index](_packages_hippy_react_src_dom_view_node_.viewnode.md#index)*

*Defined in [packages/hippy-react/src/dom/view-node.ts:42](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/view-node.ts#L42)*

___

###  nextSibling

• **nextSibling**: *[ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md) | null* =  null

*Inherited from [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md).[nextSibling](_packages_hippy_react_src_dom_view_node_.viewnode.md#nextsibling)*

*Defined in [packages/hippy-react/src/dom/view-node.ts:51](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/view-node.ts#L51)*

___

###  nodeId

• **nodeId**: *number*

*Inherited from [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md).[nodeId](_packages_hippy_react_src_dom_view_node_.viewnode.md#nodeid)*

*Defined in [packages/hippy-react/src/dom/view-node.ts:28](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/view-node.ts#L28)*

___

###  parentNode

• **parentNode**: *[ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md) | null* =  null

*Inherited from [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md).[parentNode](_packages_hippy_react_src_dom_view_node_.viewnode.md#parentnode)*

*Defined in [packages/hippy-react/src/dom/view-node.ts:47](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/view-node.ts#L47)*

___

###  prevSibling

• **prevSibling**: *[ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md) | null* =  null

*Inherited from [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md).[prevSibling](_packages_hippy_react_src_dom_view_node_.viewnode.md#prevsibling)*

*Defined in [packages/hippy-react/src/dom/view-node.ts:49](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/view-node.ts#L49)*

___

### `Static` createElement

▪ **createElement**: *Function*

*Defined in [packages/hippy-react/src/dom/document-node.ts:9](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/document-node.ts#L9)*

___

### `Static` createElementNS

▪ **createElementNS**: *Function*

*Defined in [packages/hippy-react/src/dom/document-node.ts:11](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/document-node.ts#L11)*

## Accessors

###  firstChild

• **get firstChild**(): *null | [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md)‹›*

*Inherited from [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md).[firstChild](_packages_hippy_react_src_dom_view_node_.viewnode.md#firstchild)*

*Defined in [packages/hippy-react/src/dom/view-node.ts:63](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/view-node.ts#L63)*

**Returns:** *null | [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md)‹›*

___

###  isMounted

• **get isMounted**(): *boolean*

*Inherited from [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md).[isMounted](_packages_hippy_react_src_dom_view_node_.viewnode.md#ismounted)*

*Defined in [packages/hippy-react/src/dom/view-node.ts:91](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/view-node.ts#L91)*

**Returns:** *boolean*

• **set isMounted**(`isMounted`: boolean): *void*

*Inherited from [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md).[isMounted](_packages_hippy_react_src_dom_view_node_.viewnode.md#ismounted)*

*Defined in [packages/hippy-react/src/dom/view-node.ts:95](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/view-node.ts#L95)*

**Parameters:**

Name | Type |
------ | ------ |
`isMounted` | boolean |

**Returns:** *void*

___

###  lastChild

• **get lastChild**(): *null | [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md)‹›*

*Inherited from [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md).[lastChild](_packages_hippy_react_src_dom_view_node_.viewnode.md#lastchild)*

*Defined in [packages/hippy-react/src/dom/view-node.ts:67](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/view-node.ts#L67)*

**Returns:** *null | [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md)‹›*

___

###  ownerDocument

• **get ownerDocument**(): *[ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md) | null*

*Inherited from [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md).[ownerDocument](_packages_hippy_react_src_dom_view_node_.viewnode.md#ownerdocument)*

*Defined in [packages/hippy-react/src/dom/view-node.ts:74](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/view-node.ts#L74)*

**Returns:** *[ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md) | null*

## Methods

###  appendChild

▸ **appendChild**(`childNode`: [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md)): *void*

*Inherited from [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md).[appendChild](_packages_hippy_react_src_dom_view_node_.viewnode.md#appendchild)*

*Defined in [packages/hippy-react/src/dom/view-node.ts:192](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/view-node.ts#L192)*

**Parameters:**

Name | Type |
------ | ------ |
`childNode` | [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md) |

**Returns:** *void*

___

###  createElement

▸ **createElement**(`tagName`: string): *[ElementNode](_packages_hippy_react_src_dom_element_node_.elementnode.md)‹›*

*Defined in [packages/hippy-react/src/dom/document-node.ts:19](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/document-node.ts#L19)*

**Parameters:**

Name | Type |
------ | ------ |
`tagName` | string |

**Returns:** *[ElementNode](_packages_hippy_react_src_dom_element_node_.elementnode.md)‹›*

___

###  createElementNS

▸ **createElementNS**(`namespace`: string, `tagName`: string): *[ElementNode](_packages_hippy_react_src_dom_element_node_.elementnode.md)‹›*

*Defined in [packages/hippy-react/src/dom/document-node.ts:23](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/document-node.ts#L23)*

**Parameters:**

Name | Type |
------ | ------ |
`namespace` | string |
`tagName` | string |

**Returns:** *[ElementNode](_packages_hippy_react_src_dom_element_node_.elementnode.md)‹›*

___

###  findChild

▸ **findChild**(`condition`: Function): *[ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md) | null*

*Inherited from [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md).[findChild](_packages_hippy_react_src_dom_view_node_.viewnode.md#findchild)*

*Defined in [packages/hippy-react/src/dom/view-node.ts:254](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/view-node.ts#L254)*

Find a specific target with condition

**Parameters:**

Name | Type |
------ | ------ |
`condition` | Function |

**Returns:** *[ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md) | null*

___

###  insertBefore

▸ **insertBefore**(`childNode`: [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md), `referenceNode`: [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md)): *void*

*Inherited from [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md).[insertBefore](_packages_hippy_react_src_dom_view_node_.viewnode.md#insertbefore)*

*Defined in [packages/hippy-react/src/dom/view-node.ts:100](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/view-node.ts#L100)*

**Parameters:**

Name | Type |
------ | ------ |
`childNode` | [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md) |
`referenceNode` | [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md) |

**Returns:** *void*

___

###  moveChild

▸ **moveChild**(`childNode`: [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md), `referenceNode`: [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md)): *void | [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md)‹›*

*Inherited from [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md).[moveChild](_packages_hippy_react_src_dom_view_node_.viewnode.md#movechild)*

*Defined in [packages/hippy-react/src/dom/view-node.ts:133](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/view-node.ts#L133)*

**Parameters:**

Name | Type |
------ | ------ |
`childNode` | [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md) |
`referenceNode` | [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md) |

**Returns:** *void | [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md)‹›*

___

###  removeChild

▸ **removeChild**(`childNode`: [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md)): *void*

*Inherited from [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md).[removeChild](_packages_hippy_react_src_dom_view_node_.viewnode.md#removechild)*

*Defined in [packages/hippy-react/src/dom/view-node.ts:215](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/view-node.ts#L215)*

**Parameters:**

Name | Type |
------ | ------ |
`childNode` | [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md) |

**Returns:** *void*

___

###  toString

▸ **toString**(): *string*

*Inherited from [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md).[toString](_packages_hippy_react_src_dom_view_node_.viewnode.md#tostring)*

*Defined in [packages/hippy-react/src/dom/view-node.ts:59](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/view-node.ts#L59)*

**Returns:** *string*

___

###  traverseChildren

▸ **traverseChildren**(`callback`: Function): *void*

*Inherited from [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md).[traverseChildren](_packages_hippy_react_src_dom_view_node_.viewnode.md#traversechildren)*

*Defined in [packages/hippy-react/src/dom/view-node.ts:274](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/view-node.ts#L274)*

Traverse the children and execute callback

**Parameters:**

Name | Type |
------ | ------ |
`callback` | Function |

**Returns:** *void*

## Object literals

###  meta

### ▪ **meta**: *object*

*Inherited from [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md).[meta](_packages_hippy_react_src_dom_view_node_.viewnode.md#meta)*

*Defined in [packages/hippy-react/src/dom/view-node.ts:34](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/view-node.ts#L34)*

###  component

• **component**: *object*

*Defined in [packages/hippy-react/src/dom/view-node.ts:35](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/view-node.ts#L35)*

#### Type declaration:
