[Hippy](../README.md) › [Globals](../globals.md) › ["types/hippy"](../modules/_types_hippy_.md) › [Hippy](../modules/_types_hippy_.hippy.md) › [Bridge](_types_hippy_.hippy.bridge.md)

# Interface: Bridge

## Hierarchy

* **Bridge**

## Index

### Methods

* [callNative](_types_hippy_.hippy.bridge.md#callnative)
* [callNativeWithCallbackId](_types_hippy_.hippy.bridge.md#callnativewithcallbackid)
* [callNativeWithPromise](_types_hippy_.hippy.bridge.md#callnativewithpromise)
* [removeNativeCallback](_types_hippy_.hippy.bridge.md#removenativecallback)

## Methods

###  callNative

▸ **callNative**(`moduleName`: string, `methodName`: string, ...`args`: any[]): *void*

*Defined in [types/hippy.ts:37](https://github.com/jeromehan/Hippy/blob/6216275/types/hippy.ts#L37)*

**Parameters:**

Name | Type |
------ | ------ |
`moduleName` | string |
`methodName` | string |
`...args` | any[] |

**Returns:** *void*

___

###  callNativeWithCallbackId

▸ **callNativeWithCallbackId**(`moduleName`: string, `methodName`: string, ...`args`: any[]): *number*

*Defined in [types/hippy.ts:38](https://github.com/jeromehan/Hippy/blob/6216275/types/hippy.ts#L38)*

**Parameters:**

Name | Type |
------ | ------ |
`moduleName` | string |
`methodName` | string |
`...args` | any[] |

**Returns:** *number*

___

###  callNativeWithPromise

▸ **callNativeWithPromise**<**T**>(`moduleName`: string, `methodName`: string, ...`args`: any[]): *Promise‹T›*

*Defined in [types/hippy.ts:39](https://github.com/jeromehan/Hippy/blob/6216275/types/hippy.ts#L39)*

**Type parameters:**

▪ **T**

**Parameters:**

Name | Type |
------ | ------ |
`moduleName` | string |
`methodName` | string |
`...args` | any[] |

**Returns:** *Promise‹T›*

___

###  removeNativeCallback

▸ **removeNativeCallback**(`callbackId`: number): *void*

*Defined in [types/hippy.ts:40](https://github.com/jeromehan/Hippy/blob/6216275/types/hippy.ts#L40)*

**Parameters:**

Name | Type |
------ | ------ |
`callbackId` | number |

**Returns:** *void*
