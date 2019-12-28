[Hippy](../README.md) › [Globals](../globals.md) › ["packages/hippy-react-web/src/modules/ui-manager-module"](_packages_hippy_react_web_src_modules_ui_manager_module_.md)

# External module: "packages/hippy-react-web/src/modules/ui-manager-module"

## Index

### Type aliases

* [MeasureReturns](_packages_hippy_react_web_src_modules_ui_manager_module_.md#measurereturns)

### Functions

* [getRect](_packages_hippy_react_web_src_modules_ui_manager_module_.md#getrect)

### Object literals

* [UIManager](_packages_hippy_react_web_src_modules_ui_manager_module_.md#const-uimanager)

## Type aliases

###  MeasureReturns

Ƭ **MeasureReturns**: *function*

*Defined in [packages/hippy-react-web/src/modules/ui-manager-module.ts:1](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/ui-manager-module.ts#L1)*

#### Type declaration:

▸ (`x`: number, `y`: number, `width`: number, `height`: number, `left`: number, `top`: number): *void*

**Parameters:**

Name | Type |
------ | ------ |
`x` | number |
`y` | number |
`width` | number |
`height` | number |
`left` | number |
`top` | number |

## Functions

###  getRect

▸ **getRect**(`node`: HTMLElement): *object*

*Defined in [packages/hippy-react-web/src/modules/ui-manager-module.ts:10](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/ui-manager-module.ts#L10)*

**Parameters:**

Name | Type |
------ | ------ |
`node` | HTMLElement |

**Returns:** *object*

* **height**: *any*

* **left**: *any*

* **top**: *any*

* **width**: *any*

## Object literals

### `Const` UIManager

### ▪ **UIManager**: *object*

*Defined in [packages/hippy-react-web/src/modules/ui-manager-module.ts:31](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/ui-manager-module.ts#L31)*

###  measure

▸ **measure**(`node`: HTMLElement, `callback`: [MeasureReturns](_packages_hippy_react_web_src_modules_ui_manager_module_.md#measurereturns)): *void*

*Defined in [packages/hippy-react-web/src/modules/ui-manager-module.ts:32](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/ui-manager-module.ts#L32)*

**Parameters:**

Name | Type |
------ | ------ |
`node` | HTMLElement |
`callback` | [MeasureReturns](_packages_hippy_react_web_src_modules_ui_manager_module_.md#measurereturns) |

**Returns:** *void*
