[Hippy](../README.md) › [Globals](../globals.md) › ["packages/hippy-react/src/dom/view-node"](../modules/_packages_hippy_react_src_dom_view_node_.md) › [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md)

# Class: ViewNode

## Hierarchy

* **ViewNode**

  ↳ [ElementNode](_packages_hippy_react_src_dom_element_node_.elementnode.md)

  ↳ [DocumentNode](_packages_hippy_react_src_dom_document_node_.documentnode.md)

## Index

### Constructors

* [constructor](_packages_hippy_react_src_dom_view_node_.viewnode.md#constructor)

### Properties

* [childNodes](_packages_hippy_react_src_dom_view_node_.viewnode.md#childnodes)
* [index](_packages_hippy_react_src_dom_view_node_.viewnode.md#index)
* [nextSibling](_packages_hippy_react_src_dom_view_node_.viewnode.md#nextsibling)
* [nodeId](_packages_hippy_react_src_dom_view_node_.viewnode.md#nodeid)
* [parentNode](_packages_hippy_react_src_dom_view_node_.viewnode.md#parentnode)
* [prevSibling](_packages_hippy_react_src_dom_view_node_.viewnode.md#prevsibling)

### Accessors

* [firstChild](_packages_hippy_react_src_dom_view_node_.viewnode.md#firstchild)
* [isMounted](_packages_hippy_react_src_dom_view_node_.viewnode.md#ismounted)
* [lastChild](_packages_hippy_react_src_dom_view_node_.viewnode.md#lastchild)
* [ownerDocument](_packages_hippy_react_src_dom_view_node_.viewnode.md#ownerdocument)

### Methods

* [appendChild](_packages_hippy_react_src_dom_view_node_.viewnode.md#appendchild)
* [findChild](_packages_hippy_react_src_dom_view_node_.viewnode.md#findchild)
* [insertBefore](_packages_hippy_react_src_dom_view_node_.viewnode.md#insertbefore)
* [moveChild](_packages_hippy_react_src_dom_view_node_.viewnode.md#movechild)
* [removeChild](_packages_hippy_react_src_dom_view_node_.viewnode.md#removechild)
* [toString](_packages_hippy_react_src_dom_view_node_.viewnode.md#tostring)
* [traverseChildren](_packages_hippy_react_src_dom_view_node_.viewnode.md#traversechildren)

### Object literals

* [meta](_packages_hippy_react_src_dom_view_node_.viewnode.md#meta)

## Constructors

###  constructor

\+ **new ViewNode**(): *[ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md)*

*Defined in [packages/hippy-react/src/dom/view-node.ts:51](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/view-node.ts#L51)*

**Returns:** *[ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md)*

## Properties

###  childNodes

• **childNodes**: *[ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md)[]* =  []

*Defined in [packages/hippy-react/src/dom/view-node.ts:45](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/view-node.ts#L45)*

___

###  index

• **index**: *number* = 0

*Defined in [packages/hippy-react/src/dom/view-node.ts:42](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/view-node.ts#L42)*

___

###  nextSibling

• **nextSibling**: *[ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md) | null* =  null

*Defined in [packages/hippy-react/src/dom/view-node.ts:51](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/view-node.ts#L51)*

___

###  nodeId

• **nodeId**: *number*

*Defined in [packages/hippy-react/src/dom/view-node.ts:28](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/view-node.ts#L28)*

___

###  parentNode

• **parentNode**: *[ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md) | null* =  null

*Defined in [packages/hippy-react/src/dom/view-node.ts:47](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/view-node.ts#L47)*

___

###  prevSibling

• **prevSibling**: *[ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md) | null* =  null

*Defined in [packages/hippy-react/src/dom/view-node.ts:49](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/view-node.ts#L49)*

## Accessors

###  firstChild

• **get firstChild**(): *null | [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md)‹›*

*Defined in [packages/hippy-react/src/dom/view-node.ts:63](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/view-node.ts#L63)*

**Returns:** *null | [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md)‹›*

___

###  isMounted

• **get isMounted**(): *boolean*

*Defined in [packages/hippy-react/src/dom/view-node.ts:91](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/view-node.ts#L91)*

**Returns:** *boolean*

• **set isMounted**(`isMounted`: boolean): *void*

*Defined in [packages/hippy-react/src/dom/view-node.ts:95](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/view-node.ts#L95)*

**Parameters:**

Name | Type |
------ | ------ |
`isMounted` | boolean |

**Returns:** *void*

___

###  lastChild

• **get lastChild**(): *null | [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md)‹›*

*Defined in [packages/hippy-react/src/dom/view-node.ts:67](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/view-node.ts#L67)*

**Returns:** *null | [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md)‹›*

___

###  ownerDocument

• **get ownerDocument**(): *[ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md) | null*

*Defined in [packages/hippy-react/src/dom/view-node.ts:74](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/view-node.ts#L74)*

**Returns:** *[ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md) | null*

## Methods

###  appendChild

▸ **appendChild**(`childNode`: [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md)): *void*

*Defined in [packages/hippy-react/src/dom/view-node.ts:192](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/view-node.ts#L192)*

**Parameters:**

Name | Type |
------ | ------ |
`childNode` | [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md) |

**Returns:** *void*

___

###  findChild

▸ **findChild**(`condition`: Function): *[ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md) | null*

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

*Defined in [packages/hippy-react/src/dom/view-node.ts:215](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/view-node.ts#L215)*

**Parameters:**

Name | Type |
------ | ------ |
`childNode` | [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md) |

**Returns:** *void*

___

###  toString

▸ **toString**(): *string*

*Defined in [packages/hippy-react/src/dom/view-node.ts:59](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/view-node.ts#L59)*

**Returns:** *string*

___

###  traverseChildren

▸ **traverseChildren**(`callback`: Function): *void*

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

*Defined in [packages/hippy-react/src/dom/view-node.ts:34](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/view-node.ts#L34)*

###  component

• **component**: *object*

*Defined in [packages/hippy-react/src/dom/view-node.ts:35](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/view-node.ts#L35)*

#### Type declaration:
