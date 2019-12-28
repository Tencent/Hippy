[Hippy](../README.md) › [Globals](../globals.md) › ["packages/hippy-react-web/src/adapters/transfer"](_packages_hippy_react_web_src_adapters_transfer_.md)

# External module: "packages/hippy-react-web/src/adapters/transfer"

## Index

### Variables

* [borderPropsArray](_packages_hippy_react_web_src_adapters_transfer_.md#const-borderpropsarray)
* [borderSpecialPropsArray](_packages_hippy_react_web_src_adapters_transfer_.md#const-borderspecialpropsarray)
* [displayValue](_packages_hippy_react_web_src_adapters_transfer_.md#const-displayvalue)

### Functions

* [formatWebStyle](_packages_hippy_react_web_src_adapters_transfer_.md#formatwebstyle)
* [hackWebStyle](_packages_hippy_react_web_src_adapters_transfer_.md#hackwebstyle)
* [hasOwnProperty](_packages_hippy_react_web_src_adapters_transfer_.md#hasownproperty)
* [is8DigitHexColor](_packages_hippy_react_web_src_adapters_transfer_.md#is8digithexcolor)
* [mapTransform](_packages_hippy_react_web_src_adapters_transfer_.md#maptransform)
* [resolveTransform](_packages_hippy_react_web_src_adapters_transfer_.md#resolvetransform)
* [transformHexToRgba](_packages_hippy_react_web_src_adapters_transfer_.md#transformhextorgba)

## Variables

### `Const` borderPropsArray

• **borderPropsArray**: *string[]* =  ['borderWidth']

*Defined in [packages/hippy-react-web/src/adapters/transfer.ts:8](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/adapters/transfer.ts#L8)*

___

### `Const` borderSpecialPropsArray

• **borderSpecialPropsArray**: *string[]* =  ['borderTopWidth', 'borderBottomWidth', 'borderLeftWidth', 'borderRightWidth']

*Defined in [packages/hippy-react-web/src/adapters/transfer.ts:7](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/adapters/transfer.ts#L7)*

___

### `Const` displayValue

• **displayValue**: *"flex" | "-webkit-flex"* =  typeof window !== 'undefined' && !('flex' in window.document.body.style) ? '-webkit-flex' : 'flex'

*Defined in [packages/hippy-react-web/src/adapters/transfer.ts:9](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/adapters/transfer.ts#L9)*

## Functions

###  formatWebStyle

▸ **formatWebStyle**(`style`: any): *object*

*Defined in [packages/hippy-react-web/src/adapters/transfer.ts:248](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/adapters/transfer.ts#L248)*

**Parameters:**

Name | Type |
------ | ------ |
`style` | any |

**Returns:** *object*

___

###  hackWebStyle

▸ **hackWebStyle**(`webStyle_`: any): *void*

*Defined in [packages/hippy-react-web/src/adapters/transfer.ts:72](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/adapters/transfer.ts#L72)*

**Parameters:**

Name | Type |
------ | ------ |
`webStyle_` | any |

**Returns:** *void*

___

###  hasOwnProperty

▸ **hasOwnProperty**(`obj`: Object, `name`: string | number | symbol): *boolean*

*Defined in [packages/hippy-react-web/src/adapters/transfer.ts:11](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/adapters/transfer.ts#L11)*

**Parameters:**

Name | Type |
------ | ------ |
`obj` | Object |
`name` | string &#124; number &#124; symbol |

**Returns:** *boolean*

___

###  is8DigitHexColor

▸ **is8DigitHexColor**(`color`: string): *false | true | ""*

*Defined in [packages/hippy-react-web/src/adapters/transfer.ts:60](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/adapters/transfer.ts#L60)*

**Parameters:**

Name | Type |
------ | ------ |
`color` | string |

**Returns:** *false | true | ""*

___

###  mapTransform

▸ **mapTransform**(`transform`: any): *string*

*Defined in [packages/hippy-react-web/src/adapters/transfer.ts:17](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/adapters/transfer.ts#L17)*

**Parameters:**

Name | Type |
------ | ------ |
`transform` | any |

**Returns:** *string*

___

###  resolveTransform

▸ **resolveTransform**(`transformArray`: any[]): *string*

*Defined in [packages/hippy-react-web/src/adapters/transfer.ts:23](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/adapters/transfer.ts#L23)*

**Parameters:**

Name | Type |
------ | ------ |
`transformArray` | any[] |

**Returns:** *string*

___

###  transformHexToRgba

▸ **transformHexToRgba**(`color`: number): *string*

*Defined in [packages/hippy-react-web/src/adapters/transfer.ts:64](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/adapters/transfer.ts#L64)*

**Parameters:**

Name | Type |
------ | ------ |
`color` | number |

**Returns:** *string*
