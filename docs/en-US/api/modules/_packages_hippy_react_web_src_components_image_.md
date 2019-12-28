[Hippy](../README.md) › [Globals](../globals.md) › ["packages/hippy-react-web/src/components/image"](_packages_hippy_react_web_src_components_image_.md)

# External module: "packages/hippy-react-web/src/components/image"

## Index

### Classes

* [Image](../classes/_packages_hippy_react_web_src_components_image_.image.md)

### Variables

* [svgDataUriPattern](_packages_hippy_react_web_src_components_image_.md#const-svgdatauripattern)

### Functions

* [resolveAssetUri](_packages_hippy_react_web_src_components_image_.md#const-resolveasseturi)

### Object literals

* [ImageResizeMode](_packages_hippy_react_web_src_components_image_.md#const-imageresizemode)
* [resizeModeStyles](_packages_hippy_react_web_src_components_image_.md#const-resizemodestyles)
* [styles](_packages_hippy_react_web_src_components_image_.md#const-styles)

## Variables

### `Const` svgDataUriPattern

• **svgDataUriPattern**: *RegExp‹›* =  /^(data:image\/svg\+xml;utf8,)(.*)/

*Defined in [packages/hippy-react-web/src/components/image.tsx:62](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/components/image.tsx#L62)*

## Functions

### `Const` resolveAssetUri

▸ **resolveAssetUri**(`source`: string | object): *string*

*Defined in [packages/hippy-react-web/src/components/image.tsx:63](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/components/image.tsx#L63)*

**Parameters:**

Name | Type |
------ | ------ |
`source` | string &#124; object |

**Returns:** *string*

## Object literals

### `Const` ImageResizeMode

### ▪ **ImageResizeMode**: *object*

*Defined in [packages/hippy-react-web/src/components/image.tsx:7](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/components/image.tsx#L7)*

###  center

• **center**: *string* = "center"

*Defined in [packages/hippy-react-web/src/components/image.tsx:8](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/components/image.tsx#L8)*

###  contain

• **contain**: *string* = "contain"

*Defined in [packages/hippy-react-web/src/components/image.tsx:9](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/components/image.tsx#L9)*

###  cover

• **cover**: *string* = "cover"

*Defined in [packages/hippy-react-web/src/components/image.tsx:10](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/components/image.tsx#L10)*

###  none

• **none**: *string* = "none"

*Defined in [packages/hippy-react-web/src/components/image.tsx:11](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/components/image.tsx#L11)*

###  repeat

• **repeat**: *string* = "repeat"

*Defined in [packages/hippy-react-web/src/components/image.tsx:12](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/components/image.tsx#L12)*

###  stretch

• **stretch**: *string* = "stretch"

*Defined in [packages/hippy-react-web/src/components/image.tsx:13](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/components/image.tsx#L13)*

___

### `Const` resizeModeStyles

### ▪ **resizeModeStyles**: *object*

*Defined in [packages/hippy-react-web/src/components/image.tsx:37](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/components/image.tsx#L37)*

▪ **center**: *object*

*Defined in [packages/hippy-react-web/src/components/image.tsx:38](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/components/image.tsx#L38)*

* **backgroundSize**: *string* = "auto"

▪ **contain**: *object*

*Defined in [packages/hippy-react-web/src/components/image.tsx:41](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/components/image.tsx#L41)*

* **backgroundSize**: *string* = "contain"

▪ **cover**: *object*

*Defined in [packages/hippy-react-web/src/components/image.tsx:44](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/components/image.tsx#L44)*

* **backgroundPosition**: *string* = "center top"

* **backgroundSize**: *string* = "cover"

▪ **none**: *object*

*Defined in [packages/hippy-react-web/src/components/image.tsx:48](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/components/image.tsx#L48)*

* **backgroundPosition**: *string* = "0 0"

* **backgroundSize**: *string* = "auto"

▪ **repeat**: *object*

*Defined in [packages/hippy-react-web/src/components/image.tsx:52](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/components/image.tsx#L52)*

* **backgroundPosition**: *string* = "0 0"

* **backgroundRepeat**: *string* = "repeat"

* **backgroundSize**: *string* = "auto"

▪ **stretch**: *object*

*Defined in [packages/hippy-react-web/src/components/image.tsx:57](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/components/image.tsx#L57)*

* **backgroundSize**: *string* = "100% 100%"

___

### `Const` styles

### ▪ **styles**: *object*

*Defined in [packages/hippy-react-web/src/components/image.tsx:16](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/components/image.tsx#L16)*

▪ **image**: *object*

*Defined in [packages/hippy-react-web/src/components/image.tsx:22](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/components/image.tsx#L22)*

* **backgroundColor**: *string* = "transparent"

* **backgroundPosition**: *string* = "center"

* **backgroundRepeat**: *string* = "no-repeat"

* **backgroundSize**: *string* = "cover"

* **bottom**: *number* = 0

* **height**: *string* = "100%"

* **left**: *number* = 0

* **position**: *string* = "absolute"

* **right**: *number* = 0

* **top**: *number* = 0

* **width**: *string* = "100%"

▪ **root**: *object*

*Defined in [packages/hippy-react-web/src/components/image.tsx:17](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/components/image.tsx#L17)*

* **flexBasis**: *string* = "auto"

* **overflow**: *string* = "hidden"

* **zIndex**: *number* = 0
