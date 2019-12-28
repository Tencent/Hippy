[Hippy](../README.md) › [Globals](../globals.md) › ["packages/hippy-react/src/components/image"](../modules/_packages_hippy_react_src_components_image_.md) › [Image](_packages_hippy_react_src_components_image_.image.md)

# Class: Image

A React component for displaying different types of images, including network images,
static resources, temporary local images, and images from local disk, such as the camera roll.

## Hierarchy

* any

  ↳ **Image**

## Index

### Properties

* [prefetch](_packages_hippy_react_src_components_image_.image.md#static-prefetch)

### Accessors

* [resizeMode](_packages_hippy_react_src_components_image_.image.md#static-resizemode)

### Methods

* [getSize](_packages_hippy_react_src_components_image_.image.md#static-getsize)

## Properties

### `Static` prefetch

▪ **prefetch**: *[prefetch](../modules/_packages_hippy_react_src_modules_image_loader_module_.md#prefetch)* =  prefetch

*Defined in [packages/hippy-react/src/components/image.tsx:155](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/image.tsx#L155)*

## Accessors

### `Static` resizeMode

• **get resizeMode**(): *object*

*Defined in [packages/hippy-react/src/components/image.tsx:125](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/image.tsx#L125)*

**Returns:** *object*

* **center**: *string* = "center"

* **contain**: *string* = "contain"

* **cover**: *string* = "cover"

* **repeat**: *string* = "repeat"

* **stretch**: *string* = "stretch"

## Methods

### `Static` getSize

▸ **getSize**(`url`: string, `success`: function, `failure`: function): *any*

*Defined in [packages/hippy-react/src/components/image.tsx:135](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/image.tsx#L135)*

**Parameters:**

▪ **url**: *string*

▪ **success**: *function*

▸ (`width`: number, `height`: number): *void*

**Parameters:**

Name | Type |
------ | ------ |
`width` | number |
`height` | number |

▪ **failure**: *function*

▸ (`err`: ErrorConstructor): *void*

**Parameters:**

Name | Type |
------ | ------ |
`err` | ErrorConstructor |

**Returns:** *any*
