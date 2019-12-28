[Hippy](../README.md) › [Globals](../globals.md) › ["packages/hippy-react/src/color/index"](_packages_hippy_react_src_color_index_.md)

# External module: "packages/hippy-react/src/color/index"

## Index

### Interfaces

* [ColorParserOption](../interfaces/_packages_hippy_react_src_color_index_.colorparseroption.md)

### Type aliases

* [Color](_packages_hippy_react_src_color_index_.md#color)

### Functions

* [colorArrayParse](_packages_hippy_react_src_color_index_.md#colorarrayparse)
* [colorParse](_packages_hippy_react_src_color_index_.md#colorparse)

## Type aliases

###  Color

Ƭ **Color**: *string | number*

*Defined in [packages/hippy-react/src/color/index.ts:9](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/color/index.ts#L9)*

## Functions

###  colorArrayParse

▸ **colorArrayParse**(`colorArray`: [Color](_packages_hippy_react_src_color_index_.md#color)[], `options?`: [ColorParserOption](../interfaces/_packages_hippy_react_src_color_index_.colorparseroption.md)): *string | number[]*

*Defined in [packages/hippy-react/src/color/index.ts:50](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/color/index.ts#L50)*

Parse the color values array to integer array that native understand.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`colorArray` | [Color](_packages_hippy_react_src_color_index_.md#color)[] | The color values array. |
`options?` | [ColorParserOption](../interfaces/_packages_hippy_react_src_color_index_.colorparseroption.md) | Color options. |

**Returns:** *string | number[]*

___

###  colorParse

▸ **colorParse**(`color`: [Color](_packages_hippy_react_src_color_index_.md#color), `options`: [ColorParserOption](../interfaces/_packages_hippy_react_src_color_index_.colorparseroption.md)): *string | number*

*Defined in [packages/hippy-react/src/color/index.ts:23](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/color/index.ts#L23)*

Parse the color value to integer that native understand.

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`color` | [Color](_packages_hippy_react_src_color_index_.md#color) | - | The color value. |
`options` | [ColorParserOption](../interfaces/_packages_hippy_react_src_color_index_.colorparseroption.md) |  {} | Color options. |

**Returns:** *string | number*
