[Hippy](../README.md) › [Globals](../globals.md) › ["packages/hippy-react/src/renderer/render"](_packages_hippy_react_src_renderer_render_.md)

# External module: "packages/hippy-react/src/renderer/render"

## Index

### Interfaces

* [Style](../interfaces/_packages_hippy_react_src_renderer_render_.style.md)

### Variables

* [componentName](_packages_hippy_react_src_renderer_render_.md#const-componentname)

### Functions

* [getNativeProps](_packages_hippy_react_src_renderer_render_.md#getnativeprops)
* [insertChild](_packages_hippy_react_src_renderer_render_.md#insertchild)
* [isLayout](_packages_hippy_react_src_renderer_render_.md#islayout)
* [removeChild](_packages_hippy_react_src_renderer_render_.md#removechild)
* [renderToNative](_packages_hippy_react_src_renderer_render_.md#rendertonative)
* [renderToNativeWithChildren](_packages_hippy_react_src_renderer_render_.md#rendertonativewithchildren)
* [updateChild](_packages_hippy_react_src_renderer_render_.md#updatechild)
* [updateWithChildren](_packages_hippy_react_src_renderer_render_.md#updatewithchildren)

## Variables

### `Const` componentName

• **componentName**: *string[]* =  ['%c[native]%c', 'color: red', 'color: auto']

*Defined in [packages/hippy-react/src/renderer/render.ts:16](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/renderer/render.ts#L16)*

## Functions

###  getNativeProps

▸ **getNativeProps**(`node`: [Element](../interfaces/_packages_hippy_react_web_src_adapters_apply_layout_.layoutelement.md#element)): *otherProps*

*Defined in [packages/hippy-react/src/renderer/render.ts:21](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/renderer/render.ts#L21)*

Translate to native props from attributes and meta

**Parameters:**

Name | Type |
------ | ------ |
`node` | [Element](../interfaces/_packages_hippy_react_web_src_adapters_apply_layout_.layoutelement.md#element) |

**Returns:** *otherProps*

___

###  insertChild

▸ **insertChild**(`parentNode`: [ViewNode](../classes/_packages_hippy_react_src_dom_view_node_.viewnode.md), `childNode`: [ViewNode](../classes/_packages_hippy_react_src_dom_view_node_.viewnode.md), `atIndex`: number): *void*

*Defined in [packages/hippy-react/src/renderer/render.ts:80](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/renderer/render.ts#L80)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`parentNode` | [ViewNode](../classes/_packages_hippy_react_src_dom_view_node_.viewnode.md) | - |
`childNode` | [ViewNode](../classes/_packages_hippy_react_src_dom_view_node_.viewnode.md) | - |
`atIndex` | number |  -1 |

**Returns:** *void*

___

###  isLayout

▸ **isLayout**(`node`: [ViewNode](../classes/_packages_hippy_react_src_dom_view_node_.viewnode.md)): *boolean*

*Defined in [packages/hippy-react/src/renderer/render.ts:70](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/renderer/render.ts#L70)*

**Parameters:**

Name | Type |
------ | ------ |
`node` | [ViewNode](../classes/_packages_hippy_react_src_dom_view_node_.viewnode.md) |

**Returns:** *boolean*

___

###  removeChild

▸ **removeChild**(`parentNode`: [ViewNode](../classes/_packages_hippy_react_src_dom_view_node_.viewnode.md), `childNode`: [ViewNode](../classes/_packages_hippy_react_src_dom_view_node_.viewnode.md)): *void*

*Defined in [packages/hippy-react/src/renderer/render.ts:119](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/renderer/render.ts#L119)*

**Parameters:**

Name | Type |
------ | ------ |
`parentNode` | [ViewNode](../classes/_packages_hippy_react_src_dom_view_node_.viewnode.md) |
`childNode` | [ViewNode](../classes/_packages_hippy_react_src_dom_view_node_.viewnode.md) |

**Returns:** *void*

___

###  renderToNative

▸ **renderToNative**(`rootViewId`: number, `targetNode`: [Element](../interfaces/_packages_hippy_react_web_src_adapters_apply_layout_.layoutelement.md#element)): *[NativeNode](../interfaces/_types_hippy_.hippy.nativenode.md) | null*

*Defined in [packages/hippy-react/src/renderer/render.ts:30](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/renderer/render.ts#L30)*

Render Element to native

**Parameters:**

Name | Type |
------ | ------ |
`rootViewId` | number |
`targetNode` | [Element](../interfaces/_packages_hippy_react_web_src_adapters_apply_layout_.layoutelement.md#element) |

**Returns:** *[NativeNode](../interfaces/_types_hippy_.hippy.nativenode.md) | null*

___

###  renderToNativeWithChildren

▸ **renderToNativeWithChildren**(`rootViewId`: number, `node`: [ViewNode](../classes/_packages_hippy_react_src_dom_view_node_.viewnode.md)): *[NativeNode](../interfaces/_types_hippy_.hippy.nativenode.md)[]*

*Defined in [packages/hippy-react/src/renderer/render.ts:59](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/renderer/render.ts#L59)*

Render Element with child to native

**Parameters:**

Name | Type |
------ | ------ |
`rootViewId` | number |
`node` | [ViewNode](../classes/_packages_hippy_react_src_dom_view_node_.viewnode.md) |

**Returns:** *[NativeNode](../interfaces/_types_hippy_.hippy.nativenode.md)[]*

___

###  updateChild

▸ **updateChild**(`parentNode`: [Element](../interfaces/_packages_hippy_react_web_src_adapters_apply_layout_.layoutelement.md#element)): *void*

*Defined in [packages/hippy-react/src/renderer/render.ts:142](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/renderer/render.ts#L142)*

**Parameters:**

Name | Type |
------ | ------ |
`parentNode` | [Element](../interfaces/_packages_hippy_react_web_src_adapters_apply_layout_.layoutelement.md#element) |

**Returns:** *void*

___

###  updateWithChildren

▸ **updateWithChildren**(`parentNode`: [ViewNode](../classes/_packages_hippy_react_src_dom_view_node_.viewnode.md)): *void*

*Defined in [packages/hippy-react/src/renderer/render.ts:155](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/renderer/render.ts#L155)*

**Parameters:**

Name | Type |
------ | ------ |
`parentNode` | [ViewNode](../classes/_packages_hippy_react_src_dom_view_node_.viewnode.md) |

**Returns:** *void*
