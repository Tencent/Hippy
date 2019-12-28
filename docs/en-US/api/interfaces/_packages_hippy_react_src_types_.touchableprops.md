[Hippy](../README.md) › [Globals](../globals.md) › ["packages/hippy-react/src/types"](../modules/_packages_hippy_react_src_types_.md) › [TouchableProps](_packages_hippy_react_src_types_.touchableprops.md)

# Interface: TouchableProps

## Hierarchy

* **TouchableProps**

  ↳ [ViewProps](_packages_hippy_react_src_components_view_.viewprops.md)

## Index

### Methods

* [onTouchCancel](_packages_hippy_react_src_types_.touchableprops.md#optional-ontouchcancel)
* [onTouchDown](_packages_hippy_react_src_types_.touchableprops.md#optional-ontouchdown)
* [onTouchEnd](_packages_hippy_react_src_types_.touchableprops.md#optional-ontouchend)
* [onTouchMove](_packages_hippy_react_src_types_.touchableprops.md#optional-ontouchmove)

## Methods

### `Optional` onTouchCancel

▸ **onTouchCancel**(`evt`: TouchEvent): *void*

*Defined in [packages/hippy-react/src/types.ts:90](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/types.ts#L90)*

The touchcancel event occurs when the touch event gets interrupted.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`evt` | TouchEvent | Touch event data |

**Returns:** *void*

___

### `Optional` onTouchDown

▸ **onTouchDown**(`evt`: TouchEvent): *void*

*Defined in [packages/hippy-react/src/types.ts:62](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/types.ts#L62)*

The touchdown event occurs when the user touches an component.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`evt` | TouchEvent | Touch event data |

**Returns:** *void*

___

### `Optional` onTouchEnd

▸ **onTouchEnd**(`evt`: TouchEvent): *void*

*Defined in [packages/hippy-react/src/types.ts:81](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/types.ts#L81)*

The touchend event occurs when the user removes the finger from an component.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`evt` | TouchEvent | Touch event data |

**Returns:** *void*

___

### `Optional` onTouchMove

▸ **onTouchMove**(`evt`: TouchEvent): *void*

*Defined in [packages/hippy-react/src/types.ts:72](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/types.ts#L72)*

The touchmove event occurs when the user moves the finger across the screen.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`evt` | TouchEvent | Touch event data |

**Returns:** *void*
