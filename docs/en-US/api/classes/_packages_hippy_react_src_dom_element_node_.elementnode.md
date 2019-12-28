[Hippy](../README.md) › [Globals](../globals.md) › ["packages/hippy-react/src/dom/element-node"](../modules/_packages_hippy_react_src_dom_element_node_.md) › [ElementNode](_packages_hippy_react_src_dom_element_node_.elementnode.md)

# Class: ElementNode

## Hierarchy

* [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md)

  ↳ **ElementNode**

## Index

### Constructors

* [constructor](_packages_hippy_react_src_dom_element_node_.elementnode.md#constructor)

### Properties

* [attributes](_packages_hippy_react_src_dom_element_node_.elementnode.md#attributes)
* [childNodes](_packages_hippy_react_src_dom_element_node_.elementnode.md#childnodes)
* [id](_packages_hippy_react_src_dom_element_node_.elementnode.md#id)
* [index](_packages_hippy_react_src_dom_element_node_.elementnode.md#index)
* [nextSibling](_packages_hippy_react_src_dom_element_node_.elementnode.md#nextsibling)
* [nodeId](_packages_hippy_react_src_dom_element_node_.elementnode.md#nodeid)
* [parentNode](_packages_hippy_react_src_dom_element_node_.elementnode.md#parentnode)
* [prevSibling](_packages_hippy_react_src_dom_element_node_.elementnode.md#prevsibling)
* [style](_packages_hippy_react_src_dom_element_node_.elementnode.md#style)
* [tagName](_packages_hippy_react_src_dom_element_node_.elementnode.md#tagname)

### Accessors

* [firstChild](_packages_hippy_react_src_dom_element_node_.elementnode.md#firstchild)
* [isMounted](_packages_hippy_react_src_dom_element_node_.elementnode.md#ismounted)
* [lastChild](_packages_hippy_react_src_dom_element_node_.elementnode.md#lastchild)
* [nativeName](_packages_hippy_react_src_dom_element_node_.elementnode.md#nativename)
* [ownerDocument](_packages_hippy_react_src_dom_element_node_.elementnode.md#ownerdocument)

### Methods

* [appendChild](_packages_hippy_react_src_dom_element_node_.elementnode.md#appendchild)
* [findChild](_packages_hippy_react_src_dom_element_node_.elementnode.md#findchild)
* [getAttribute](_packages_hippy_react_src_dom_element_node_.elementnode.md#getattribute)
* [hasAttribute](_packages_hippy_react_src_dom_element_node_.elementnode.md#hasattribute)
* [insertBefore](_packages_hippy_react_src_dom_element_node_.elementnode.md#insertbefore)
* [moveChild](_packages_hippy_react_src_dom_element_node_.elementnode.md#movechild)
* [removeAttribute](_packages_hippy_react_src_dom_element_node_.elementnode.md#removeattribute)
* [removeChild](_packages_hippy_react_src_dom_element_node_.elementnode.md#removechild)
* [setAttribute](_packages_hippy_react_src_dom_element_node_.elementnode.md#setattribute)
* [setStyle](_packages_hippy_react_src_dom_element_node_.elementnode.md#setstyle)
* [setText](_packages_hippy_react_src_dom_element_node_.elementnode.md#settext)
* [toString](_packages_hippy_react_src_dom_element_node_.elementnode.md#tostring)
* [traverseChildren](_packages_hippy_react_src_dom_element_node_.elementnode.md#traversechildren)

### Object literals

* [meta](_packages_hippy_react_src_dom_element_node_.elementnode.md#meta)

## Constructors

###  constructor

\+ **new ElementNode**(`tagName`: string): *[ElementNode](_packages_hippy_react_src_dom_element_node_.elementnode.md)*

*Overrides [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md).[constructor](_packages_hippy_react_src_dom_view_node_.viewnode.md#constructor)*

*Defined in [packages/hippy-react/src/dom/element-node.ts:30](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/element-node.ts#L30)*

**Parameters:**

Name | Type |
------ | ------ |
`tagName` | string |

**Returns:** *[ElementNode](_packages_hippy_react_src_dom_element_node_.elementnode.md)*

## Properties

###  attributes

• **attributes**: *[Attributes](../interfaces/_packages_hippy_react_src_dom_element_node_.attributes.md)*

*Defined in [packages/hippy-react/src/dom/element-node.ts:30](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/element-node.ts#L30)*

___

###  childNodes

• **childNodes**: *[ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md)[]* =  []

*Inherited from [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md).[childNodes](_packages_hippy_react_src_dom_view_node_.viewnode.md#childnodes)*

*Defined in [packages/hippy-react/src/dom/view-node.ts:45](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/view-node.ts#L45)*

___

###  id

• **id**: *string* = ""

*Defined in [packages/hippy-react/src/dom/element-node.ts:26](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/element-node.ts#L26)*

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

###  style

• **style**: *[Style](../interfaces/_types_style_.style.md)*

*Defined in [packages/hippy-react/src/dom/element-node.ts:28](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/element-node.ts#L28)*

___

###  tagName

• **tagName**: *string*

*Defined in [packages/hippy-react/src/dom/element-node.ts:24](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/element-node.ts#L24)*

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

###  nativeName

• **get nativeName**(): *undefined | string*

*Defined in [packages/hippy-react/src/dom/element-node.ts:39](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/element-node.ts#L39)*

**Returns:** *undefined | string*

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

###  getAttribute

▸ **getAttribute**(`key`: string): *string | number | true*

*Defined in [packages/hippy-react/src/dom/element-node.ts:51](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/element-node.ts#L51)*

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |

**Returns:** *string | number | true*

___

###  hasAttribute

▸ **hasAttribute**(`key`: string): *boolean*

*Defined in [packages/hippy-react/src/dom/element-node.ts:47](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/element-node.ts#L47)*

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |

**Returns:** *boolean*

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

###  removeAttribute

▸ **removeAttribute**(`key`: string): *void*

*Defined in [packages/hippy-react/src/dom/element-node.ts:253](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/element-node.ts#L253)*

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |

**Returns:** *void*

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

###  setAttribute

▸ **setAttribute**(`key`: string, `value`: any): *void*

*Defined in [packages/hippy-react/src/dom/element-node.ts:56](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/element-node.ts#L56)*

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |
`value` | any |

**Returns:** *void*

___

###  setStyle

▸ **setStyle**(`property`: string, `value`: string | number | [Transform](../interfaces/_types_style_.transform.md)): *void*

*Defined in [packages/hippy-react/src/dom/element-node.ts:258](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/element-node.ts#L258)*

**Parameters:**

Name | Type |
------ | ------ |
`property` | string |
`value` | string &#124; number &#124; [Transform](../interfaces/_types_style_.transform.md) |

**Returns:** *void*

___

###  setText

▸ **setText**(`text`: string): *null | void*

*Defined in [packages/hippy-react/src/dom/element-node.ts:281](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/element-node.ts#L281)*

**Parameters:**

Name | Type |
------ | ------ |
`text` | string |

**Returns:** *null | void*

___

###  toString

▸ **toString**(): *string*

*Overrides [ViewNode](_packages_hippy_react_src_dom_view_node_.viewnode.md).[toString](_packages_hippy_react_src_dom_view_node_.viewnode.md#tostring)*

*Defined in [packages/hippy-react/src/dom/element-node.ts:43](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/dom/element-node.ts#L43)*

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
