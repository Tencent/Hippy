[Hippy](../README.md) › [Globals](../globals.md) › ["packages/hippy-react-web/src/adapters/apply-layout"](_packages_hippy_react_web_src_adapters_apply_layout_.md)

# External module: "packages/hippy-react-web/src/adapters/apply-layout"

## Index

### Interfaces

* [LayoutElement](../interfaces/_packages_hippy_react_web_src_adapters_apply_layout_.layoutelement.md)
* [Registry](../interfaces/_packages_hippy_react_web_src_adapters_apply_layout_.registry.md)

### Variables

* [emptyObject](_packages_hippy_react_web_src_adapters_apply_layout_.md#const-emptyobject)
* [id](_packages_hippy_react_web_src_adapters_apply_layout_.md#let-id)
* [registry](_packages_hippy_react_web_src_adapters_apply_layout_.md#const-registry)
* [resizeObserver](_packages_hippy_react_web_src_adapters_apply_layout_.md#let-resizeobserver)

### Functions

* [applyLayout](_packages_hippy_react_web_src_adapters_apply_layout_.md#applylayout)
* [observe](_packages_hippy_react_web_src_adapters_apply_layout_.md#observe)
* [safeOverride](_packages_hippy_react_web_src_adapters_apply_layout_.md#safeoverride)
* [triggerAll](_packages_hippy_react_web_src_adapters_apply_layout_.md#const-triggerall)
* [unobserve](_packages_hippy_react_web_src_adapters_apply_layout_.md#unobserve)

## Variables

### `Const` emptyObject

• **emptyObject**: *object*

*Defined in [packages/hippy-react-web/src/adapters/apply-layout.ts:18](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/adapters/apply-layout.ts#L18)*

#### Type declaration:

___

### `Let` id

• **id**: *number* = 1

*Defined in [packages/hippy-react-web/src/adapters/apply-layout.ts:21](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/adapters/apply-layout.ts#L21)*

___

### `Const` registry

• **registry**: *[Registry](../interfaces/_packages_hippy_react_web_src_adapters_apply_layout_.registry.md)*

*Defined in [packages/hippy-react-web/src/adapters/apply-layout.ts:19](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/adapters/apply-layout.ts#L19)*

___

### `Let` resizeObserver

• **resizeObserver**: *any*

*Defined in [packages/hippy-react-web/src/adapters/apply-layout.ts:24](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/adapters/apply-layout.ts#L24)*

## Functions

###  applyLayout

▸ **applyLayout**(`Component`: any): *any*

*Defined in [packages/hippy-react-web/src/adapters/apply-layout.ts:86](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/adapters/apply-layout.ts#L86)*

**Parameters:**

Name | Type |
------ | ------ |
`Component` | any |

**Returns:** *any*

___

###  observe

▸ **observe**(`instance`: [LayoutElement](../interfaces/_packages_hippy_react_web_src_adapters_apply_layout_.layoutelement.md)): *void*

*Defined in [packages/hippy-react-web/src/adapters/apply-layout.ts:43](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/adapters/apply-layout.ts#L43)*

**Parameters:**

Name | Type |
------ | ------ |
`instance` | [LayoutElement](../interfaces/_packages_hippy_react_web_src_adapters_apply_layout_.layoutelement.md) |

**Returns:** *void*

___

###  safeOverride

▸ **safeOverride**(`original`: Function, `next`: Function): *Function*

*Defined in [packages/hippy-react-web/src/adapters/apply-layout.ts:74](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/adapters/apply-layout.ts#L74)*

**Parameters:**

Name | Type |
------ | ------ |
`original` | Function |
`next` | Function |

**Returns:** *Function*

___

### `Const` triggerAll

▸ **triggerAll**(): *void*

*Defined in [packages/hippy-react-web/src/adapters/apply-layout.ts:33](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/adapters/apply-layout.ts#L33)*

**Returns:** *void*

___

###  unobserve

▸ **unobserve**(`instance`: [LayoutElement](../interfaces/_packages_hippy_react_web_src_adapters_apply_layout_.layoutelement.md)): *void*

*Defined in [packages/hippy-react-web/src/adapters/apply-layout.ts:60](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/adapters/apply-layout.ts#L60)*

**Parameters:**

Name | Type |
------ | ------ |
`instance` | [LayoutElement](../interfaces/_packages_hippy_react_web_src_adapters_apply_layout_.layoutelement.md) |

**Returns:** *void*
