[Hippy](../README.md) › [Globals](../globals.md) › ["packages/hippy-react-web/src/adapters/image-loader"](_packages_hippy_react_web_src_adapters_image_loader_.md)

# External module: "packages/hippy-react-web/src/adapters/image-loader"

## Index

### Interfaces

* [Requests](../interfaces/_packages_hippy_react_web_src_adapters_image_loader_.requests.md)

### Type aliases

* [LoadSuccess](_packages_hippy_react_web_src_adapters_image_loader_.md#loadsuccess)
* [SizeFailure](_packages_hippy_react_web_src_adapters_image_loader_.md#sizefailure)
* [SizeSucces](_packages_hippy_react_web_src_adapters_image_loader_.md#sizesucces)

### Variables

* [id](_packages_hippy_react_web_src_adapters_image_loader_.md#let-id)
* [requests](_packages_hippy_react_web_src_adapters_image_loader_.md#const-requests)

### Object literals

* [ImageLoader](_packages_hippy_react_web_src_adapters_image_loader_.md#const-imageloader)

## Type aliases

###  LoadSuccess

Ƭ **LoadSuccess**: *function*

*Defined in [packages/hippy-react-web/src/adapters/image-loader.ts:9](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/adapters/image-loader.ts#L9)*

#### Type declaration:

▸ (`ev`: Event): *void*

**Parameters:**

Name | Type |
------ | ------ |
`ev` | Event |

___

###  SizeFailure

Ƭ **SizeFailure**: *function*

*Defined in [packages/hippy-react-web/src/adapters/image-loader.ts:8](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/adapters/image-loader.ts#L8)*

#### Type declaration:

▸ (): *void*

___

###  SizeSucces

Ƭ **SizeSucces**: *function*

*Defined in [packages/hippy-react-web/src/adapters/image-loader.ts:7](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/adapters/image-loader.ts#L7)*

#### Type declaration:

▸ (`width`: number, `height`: number): *void*

**Parameters:**

Name | Type |
------ | ------ |
`width` | number |
`height` | number |

## Variables

### `Let` id

• **id**: *number* = 0

*Defined in [packages/hippy-react-web/src/adapters/image-loader.ts:11](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/adapters/image-loader.ts#L11)*

___

### `Const` requests

• **requests**: *[Requests](../interfaces/_packages_hippy_react_web_src_adapters_image_loader_.requests.md)*

*Defined in [packages/hippy-react-web/src/adapters/image-loader.ts:12](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/adapters/image-loader.ts#L12)*

## Object literals

### `Const` ImageLoader

### ▪ **ImageLoader**: *object*

*Defined in [packages/hippy-react-web/src/adapters/image-loader.ts:14](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/adapters/image-loader.ts#L14)*

###  abort

▸ **abort**(`requestId`: number): *void*

*Defined in [packages/hippy-react-web/src/adapters/image-loader.ts:15](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/adapters/image-loader.ts#L15)*

**Parameters:**

Name | Type |
------ | ------ |
`requestId` | number |

**Returns:** *void*

###  getSize

▸ **getSize**(`uri`: string, `success`: [SizeSucces](_packages_hippy_react_web_src_adapters_image_loader_.md#sizesucces), `failure`: [SizeFailure](_packages_hippy_react_web_src_adapters_image_loader_.md#sizefailure)): *void*

*Defined in [packages/hippy-react-web/src/adapters/image-loader.ts:24](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/adapters/image-loader.ts#L24)*

**Parameters:**

Name | Type |
------ | ------ |
`uri` | string |
`success` | [SizeSucces](_packages_hippy_react_web_src_adapters_image_loader_.md#sizesucces) |
`failure` | [SizeFailure](_packages_hippy_react_web_src_adapters_image_loader_.md#sizefailure) |

**Returns:** *void*

###  load

▸ **load**(`uri`: string, `onLoad`: [LoadSuccess](_packages_hippy_react_web_src_adapters_image_loader_.md#loadsuccess), `onError`: OnErrorEventHandler): *number*

*Defined in [packages/hippy-react-web/src/adapters/image-loader.ts:52](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/adapters/image-loader.ts#L52)*

**Parameters:**

Name | Type |
------ | ------ |
`uri` | string |
`onLoad` | [LoadSuccess](_packages_hippy_react_web_src_adapters_image_loader_.md#loadsuccess) |
`onError` | OnErrorEventHandler |

**Returns:** *number*

###  prefetch

▸ **prefetch**(`uri`: string): *Promise‹unknown›*

*Defined in [packages/hippy-react-web/src/adapters/image-loader.ts:73](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/adapters/image-loader.ts#L73)*

**Parameters:**

Name | Type |
------ | ------ |
`uri` | string |

**Returns:** *Promise‹unknown›*
