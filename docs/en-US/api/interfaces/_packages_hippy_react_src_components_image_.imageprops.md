[Hippy](../README.md) › [Globals](../globals.md) › ["packages/hippy-react/src/components/image"](../modules/_packages_hippy_react_src_components_image_.md) › [ImageProps](_packages_hippy_react_src_components_image_.imageprops.md)

# Interface: ImageProps

## Hierarchy

* [LayoutableProps](_packages_hippy_react_src_types_.layoutableprops.md)

* [ClickableProps](_packages_hippy_react_src_types_.clickableprops.md)

  ↳ **ImageProps**

## Index

### Properties

* [capInsets](_packages_hippy_react_src_components_image_.imageprops.md#optional-capinsets)
* [defaultSource](_packages_hippy_react_src_components_image_.imageprops.md#optional-defaultsource)
* [imageRef](_packages_hippy_react_src_components_image_.imageprops.md#optional-imageref)
* [imageStyle](_packages_hippy_react_src_components_image_.imageprops.md#optional-imagestyle)
* [resizeMode](_packages_hippy_react_src_components_image_.imageprops.md#optional-resizemode)
* [source](_packages_hippy_react_src_components_image_.imageprops.md#optional-source)
* [sources](_packages_hippy_react_src_components_image_.imageprops.md#optional-sources)
* [src](_packages_hippy_react_src_components_image_.imageprops.md#optional-src)
* [srcs](_packages_hippy_react_src_components_image_.imageprops.md#optional-srcs)
* [style](_packages_hippy_react_src_components_image_.imageprops.md#style)
* [tintColor](_packages_hippy_react_src_components_image_.imageprops.md#optional-tintcolor)
* [tintColors](_packages_hippy_react_src_components_image_.imageprops.md#optional-tintcolors)

### Methods

* [onClick](_packages_hippy_react_src_components_image_.imageprops.md#optional-onclick)
* [onError](_packages_hippy_react_src_components_image_.imageprops.md#optional-onerror)
* [onLayout](_packages_hippy_react_src_components_image_.imageprops.md#optional-onlayout)
* [onLoad](_packages_hippy_react_src_components_image_.imageprops.md#optional-onload)
* [onLoadEnd](_packages_hippy_react_src_components_image_.imageprops.md#optional-onloadend)
* [onLoadStart](_packages_hippy_react_src_components_image_.imageprops.md#optional-onloadstart)
* [onLongClick](_packages_hippy_react_src_components_image_.imageprops.md#optional-onlongclick)
* [onProgress](_packages_hippy_react_src_components_image_.imageprops.md#optional-onprogress)

## Properties

### `Optional` capInsets

• **capInsets**? : *undefined | object*

*Defined in [packages/hippy-react/src/components/image.tsx:65](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/image.tsx#L65)*

When the image is resized, the corners of the size specified by capInsets
will stay a fixed size, but the center content and borders of the image will be stretched.
This is useful for creating resizable rounded buttons, shadows, and other resizable assets.

___

### `Optional` defaultSource

• **defaultSource**? : *undefined | string*

*Defined in [packages/hippy-react/src/components/image.tsx:37](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/image.tsx#L37)*

Image placeholder when image is loading.
Support base64 image only.

___

### `Optional` imageRef

• **imageRef**? : *React.ReactNode*

*Defined in [packages/hippy-react/src/components/image.tsx:53](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/image.tsx#L53)*

Image ref when `Image` have other children.

___

### `Optional` imageStyle

• **imageStyle**? : *[Style](_types_style_.style.md)*

*Defined in [packages/hippy-react/src/components/image.tsx:48](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/image.tsx#L48)*

Image style when `Image` have other children.

___

### `Optional` resizeMode

• **resizeMode**? : *"cover" | "contain" | "stretch" | "repeat" | "center"*

*Defined in [packages/hippy-react/src/components/image.tsx:58](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/image.tsx#L58)*

Image resize mode, as same as containMode

___

### `Optional` source

• **source**? : *[ImageSource](_packages_hippy_react_src_components_image_.imagesource.md) | [ImageSource](_packages_hippy_react_src_components_image_.imagesource.md)[]*

*Defined in [packages/hippy-react/src/components/image.tsx:28](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/image.tsx#L28)*

Image source object

___

### `Optional` sources

• **sources**? : *[ImageSource](_packages_hippy_react_src_components_image_.imagesource.md)[]*

*Defined in [packages/hippy-react/src/components/image.tsx:31](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/image.tsx#L31)*

___

### `Optional` src

• **src**? : *undefined | string*

*Defined in [packages/hippy-react/src/components/image.tsx:23](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/image.tsx#L23)*

Single image source

___

### `Optional` srcs

• **srcs**? : *string[]*

*Defined in [packages/hippy-react/src/components/image.tsx:30](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/image.tsx#L30)*

___

###  style

• **style**: *[Style](_types_style_.style.md)*

*Defined in [packages/hippy-react/src/components/image.tsx:72](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/image.tsx#L72)*

___

### `Optional` tintColor

• **tintColor**? : *number | string*

*Defined in [packages/hippy-react/src/components/image.tsx:42](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/image.tsx#L42)*

Fill color to the image

___

### `Optional` tintColors

• **tintColors**? : *number[] | string[]*

*Defined in [packages/hippy-react/src/components/image.tsx:43](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/image.tsx#L43)*

## Methods

### `Optional` onClick

▸ **onClick**(): *void*

*Inherited from [ClickableProps](_packages_hippy_react_src_types_.clickableprops.md).[onClick](_packages_hippy_react_src_types_.clickableprops.md#optional-onclick)*

*Defined in [packages/hippy-react/src/types.ts:45](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/types.ts#L45)*

Called when the touch is released.

**Returns:** *void*

___

### `Optional` onError

▸ **onError**(`evt`: object): *void*

*Defined in [packages/hippy-react/src/components/image.tsx:95](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/image.tsx#L95)*

Invoke on loading of `Image` get error.

**Parameters:**

▪ **evt**: *object*

Loading error data.

Name | Type |
------ | ------ |
`nativeEvent` | object |

**Returns:** *void*

___

### `Optional` onLayout

▸ **onLayout**(`evt`: [LayoutEvent](_types_event_.layoutevent.md)): *void*

*Inherited from [LayoutableProps](_packages_hippy_react_src_types_.layoutableprops.md).[onLayout](_packages_hippy_react_src_types_.layoutableprops.md#optional-onlayout)*

*Defined in [packages/hippy-react/src/types.ts:38](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/types.ts#L38)*

Invoked on mount and layout changes with:

`{nativeEvent: { layout: {x, y, width, height}}}`

This event is fired immediately once the layout has been calculated,
but the new layout may not yet be reflected on the screen
at the time the event is received, especially if a layout animation is in progress.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`evt` | [LayoutEvent](_types_event_.layoutevent.md) | Layout event data |

**Returns:** *void*

___

### `Optional` onLoad

▸ **onLoad**(): *void*

*Defined in [packages/hippy-react/src/components/image.tsx:77](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/image.tsx#L77)*

Invoked on `Image` is loaded.

**Returns:** *void*

___

### `Optional` onLoadEnd

▸ **onLoadEnd**(): *void*

*Defined in [packages/hippy-react/src/components/image.tsx:82](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/image.tsx#L82)*

Invoke on `Image` is end of loading.

**Returns:** *void*

___

### `Optional` onLoadStart

▸ **onLoadStart**(): *void*

*Defined in [packages/hippy-react/src/components/image.tsx:87](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/image.tsx#L87)*

Invoke on `Image` is start to loading.

**Returns:** *void*

___

### `Optional` onLongClick

▸ **onLongClick**(): *void*

*Inherited from [ClickableProps](_packages_hippy_react_src_types_.clickableprops.md).[onLongClick](_packages_hippy_react_src_types_.clickableprops.md#optional-onlongclick)*

*Defined in [packages/hippy-react/src/types.ts:50](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/types.ts#L50)*

Called when the touch with longer than about 1s is released.

**Returns:** *void*

___

### `Optional` onProgress

▸ **onProgress**(`evt`: object): *void*

*Defined in [packages/hippy-react/src/components/image.tsx:104](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/image.tsx#L104)*

Invoke on Image is loading.

**Parameters:**

▪ **evt**: *object*

Image loading progress data.

Name | Type |
------ | ------ |
`nativeEvent` | object |

**Returns:** *void*
