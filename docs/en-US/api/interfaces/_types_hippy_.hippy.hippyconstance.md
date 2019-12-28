[Hippy](../README.md) › [Globals](../globals.md) › ["types/hippy"](../modules/_types_hippy_.md) › [Hippy](../modules/_types_hippy_.hippy.md) › [HippyConstance](_types_hippy_.hippy.hippyconstance.md)

# Interface: HippyConstance

## Hierarchy

* **HippyConstance**

## Index

### Properties

* [asyncStorage](_types_hippy_.hippy.hippyconstance.md#asyncstorage)
* [bridge](_types_hippy_.hippy.hippyconstance.md#bridge)
* [device](_types_hippy_.hippy.hippyconstance.md#device)
* [document](_types_hippy_.hippy.hippyconstance.md#document)
* [register](_types_hippy_.hippy.hippyconstance.md#register)

### Methods

* [on](_types_hippy_.hippy.hippyconstance.md#on)

## Properties

###  asyncStorage

• **asyncStorage**: *[AsyncStorage](_types_hippy_.hippy.asyncstorage.md)*

*Defined in [types/hippy.ts:52](https://github.com/jeromehan/Hippy/blob/6216275/types/hippy.ts#L52)*

___

###  bridge

• **bridge**: *[Bridge](_types_hippy_.hippy.bridge.md)*

*Defined in [types/hippy.ts:53](https://github.com/jeromehan/Hippy/blob/6216275/types/hippy.ts#L53)*

___

###  device

• **device**: *object*

*Defined in [types/hippy.ts:54](https://github.com/jeromehan/Hippy/blob/6216275/types/hippy.ts#L54)*

#### Type declaration:

* **platform**(): *object*

  * **APILevel**: *number*

  * **OS**: *[Platform](../modules/_types_hippy_.hippy.md#platform)*

* **screen**: *[Sizes](_types_hippy_.hippy.sizes.md)*

* **window**: *[Sizes](_types_hippy_.hippy.sizes.md)*

* **cancelVibrate**(): *void*

* **vibrate**(`pattern`: number, `repeatTimes?`: undefined | number): *void*

* **vibrate**(`pattern`: number, `repeatTimes?`: undefined | number): *void*

___

###  document

• **document**: *object*

*Defined in [types/hippy.ts:65](https://github.com/jeromehan/Hippy/blob/6216275/types/hippy.ts#L65)*

#### Type declaration:

* **createNode**(`rootViewId`: number, `queue`: [NativeNode](_types_hippy_.hippy.nativenode.md)[]): *void*

* **deleteNode**(`rootViewId`: number, `queue`: [NativeNode](_types_hippy_.hippy.nativenode.md)[]): *void*

* **endBatch**(`renderId`: number): *void*

* **flushBatch**(`rootViewId`: number, `queue`: [NativeNode](_types_hippy_.hippy.nativenode.md)[]): *void*

* **sendRenderError**(`err`: Error): *void*

* **startBatch**(`renderId`: number): *void*

* **updateNode**(`rootViewId`: number, `queue`: [NativeNode](_types_hippy_.hippy.nativenode.md)[]): *void*

___

###  register

• **register**: *object*

*Defined in [types/hippy.ts:75](https://github.com/jeromehan/Hippy/blob/6216275/types/hippy.ts#L75)*

#### Type declaration:

* **regist**(`appName`: string, `entryFunc`: Function): *void*

## Methods

###  on

▸ **on**(`event`: string, `callback`: Function): *void*

*Defined in [types/hippy.ts:74](https://github.com/jeromehan/Hippy/blob/6216275/types/hippy.ts#L74)*

**Parameters:**

Name | Type |
------ | ------ |
`event` | string |
`callback` | Function |

**Returns:** *void*
