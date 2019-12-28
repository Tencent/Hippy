[Hippy](../README.md) › [Globals](../globals.md) › ["packages/hippy-react/src/color/color-parser"](_packages_hippy_react_src_color_color_parser_.md)

# External module: "packages/hippy-react/src/color/color-parser"

## Index

### Functions

* [baseColor](_packages_hippy_react_src_color_color_parser_.md#basecolor)
* [hslToRgb](_packages_hippy_react_src_color_color_parser_.md#hsltorgb)
* [hue2rgb](_packages_hippy_react_src_color_color_parser_.md#hue2rgb)
* [parse1](_packages_hippy_react_src_color_color_parser_.md#parse1)
* [parse255](_packages_hippy_react_src_color_color_parser_.md#parse255)
* [parse360](_packages_hippy_react_src_color_color_parser_.md#parse360)
* [parsePercentage](_packages_hippy_react_src_color_color_parser_.md#parsepercentage)

## Functions

###  baseColor

▸ **baseColor**(`color`: string | keyof Colors): *null | number*

*Defined in [packages/hippy-react/src/color/color-parser.ts:81](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/color/color-parser.ts#L81)*

**Parameters:**

Name | Type |
------ | ------ |
`color` | string &#124; keyof Colors |

**Returns:** *null | number*

___

###  hslToRgb

▸ **hslToRgb**(`h`: number, `s`: number, `l`: number): *number*

*Defined in [packages/hippy-react/src/color/color-parser.ts:51](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/color/color-parser.ts#L51)*

**Parameters:**

Name | Type |
------ | ------ |
`h` | number |
`s` | number |
`l` | number |

**Returns:** *number*

___

###  hue2rgb

▸ **hue2rgb**(`p`: number, `q`: number, `tx`: number): *number*

*Defined in [packages/hippy-react/src/color/color-parser.ts:31](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/color/color-parser.ts#L31)*

**Parameters:**

Name | Type |
------ | ------ |
`p` | number |
`q` | number |
`tx` | number |

**Returns:** *number*

___

###  parse1

▸ **parse1**(`str`: string): *number*

*Defined in [packages/hippy-react/src/color/color-parser.ts:20](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/color/color-parser.ts#L20)*

**Parameters:**

Name | Type |
------ | ------ |
`str` | string |

**Returns:** *number*

___

###  parse255

▸ **parse255**(`str`: string): *number*

*Defined in [packages/hippy-react/src/color/color-parser.ts:9](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/color/color-parser.ts#L9)*

**Parameters:**

Name | Type |
------ | ------ |
`str` | string |

**Returns:** *number*

___

###  parse360

▸ **parse360**(`str`: string): *number*

*Defined in [packages/hippy-react/src/color/color-parser.ts:65](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/color/color-parser.ts#L65)*

**Parameters:**

Name | Type |
------ | ------ |
`str` | string |

**Returns:** *number*

___

###  parsePercentage

▸ **parsePercentage**(`str`: string): *number*

*Defined in [packages/hippy-react/src/color/color-parser.ts:70](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/color/color-parser.ts#L70)*

**Parameters:**

Name | Type |
------ | ------ |
`str` | string |

**Returns:** *number*
