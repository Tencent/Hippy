[Hippy](../README.md) › [Globals](../globals.md) › ["packages/hippy-react/src/utils/index"](_packages_hippy_react_src_utils_index_.md)

# External module: "packages/hippy-react/src/utils/index"

## Index

### Variables

* [IS_NUMBER_REG](_packages_hippy_react_src_utils_index_.md#const-is_number_reg)
* [numberRegEx](_packages_hippy_react_src_utils_index_.md#const-numberregex)
* [silent](_packages_hippy_react_src_utils_index_.md#let-silent)

### Functions

* [isFunction](_packages_hippy_react_src_utils_index_.md#isfunction)
* [isNumber](_packages_hippy_react_src_utils_index_.md#isnumber)
* [setSilent](_packages_hippy_react_src_utils_index_.md#setsilent)
* [trace](_packages_hippy_react_src_utils_index_.md#trace)
* [tryConvertNumber](_packages_hippy_react_src_utils_index_.md#tryconvertnumber)
* [unicodeToChar](_packages_hippy_react_src_utils_index_.md#unicodetochar)
* [warn](_packages_hippy_react_src_utils_index_.md#warn)

## Variables

### `Const` IS_NUMBER_REG

• **IS_NUMBER_REG**: *RegExp‹›* =  new RegExp(/^\d+$/)

*Defined in [packages/hippy-react/src/utils/index.ts:4](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/utils/index.ts#L4)*

___

### `Const` numberRegEx

• **numberRegEx**: *RegExp‹›* =  new RegExp('^[+-]?\\d+(\\.\\d+)?$')

*Defined in [packages/hippy-react/src/utils/index.ts:40](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/utils/index.ts#L40)*

Convert to string as possible

___

### `Let` silent

• **silent**: *boolean* = false

*Defined in [packages/hippy-react/src/utils/index.ts:5](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/utils/index.ts#L5)*

## Functions

###  isFunction

▸ **isFunction**(`input`: any): *boolean*

*Defined in [packages/hippy-react/src/utils/index.ts:66](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/utils/index.ts#L66)*

Determine input is function.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`input` | any | the input will determine is function. |

**Returns:** *boolean*

___

###  isNumber

▸ **isNumber**(`input`: string): *boolean*

*Defined in [packages/hippy-react/src/utils/index.ts:75](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/utils/index.ts#L75)*

Determine a string is number.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`input` | string | the input will determine is number. |

**Returns:** *boolean*

___

###  setSilent

▸ **setSilent**(`silentArg`: boolean): *void*

*Defined in [packages/hippy-react/src/utils/index.ts:82](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/utils/index.ts#L82)*

Make trace be silent.

**Parameters:**

Name | Type |
------ | ------ |
`silentArg` | boolean |

**Returns:** *void*

___

###  trace

▸ **trace**(...`context`: any[]): *void*

*Defined in [packages/hippy-react/src/utils/index.ts:10](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/utils/index.ts#L10)*

Trace running information

**Parameters:**

Name | Type |
------ | ------ |
`...context` | any[] |

**Returns:** *void*

___

###  tryConvertNumber

▸ **tryConvertNumber**(`input`: any): *any*

*Defined in [packages/hippy-react/src/utils/index.ts:46](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/utils/index.ts#L46)*

Try to convert something to number

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`input` | any | The input try to convert number  |

**Returns:** *any*

___

###  unicodeToChar

▸ **unicodeToChar**(`text`: string): *string*

*Defined in [packages/hippy-react/src/utils/index.ts:33](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/utils/index.ts#L33)*

Convert unicode string to normal string

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`text` | string | The unicode string input  |

**Returns:** *string*

___

###  warn

▸ **warn**(...`context`: any[]): *void*

*Defined in [packages/hippy-react/src/utils/index.ts:21](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/utils/index.ts#L21)*

Warninng information output

**Parameters:**

Name | Type |
------ | ------ |
`...context` | any[] |

**Returns:** *void*
