[Hippy](../README.md) › [Globals](../globals.md) › ["packages/hippy-react/src/modules/net-info"](_packages_hippy_react_src_modules_net_info_.md)

# External module: "packages/hippy-react/src/modules/net-info"

## Index

### Classes

* [NetInfoRevoker](../classes/_packages_hippy_react_src_modules_net_info_.netinforevoker.md)

### Type aliases

* [NetworkChangeEventData](_packages_hippy_react_src_modules_net_info_.md#networkchangeeventdata)
* [NetworkInfoCallback](_packages_hippy_react_src_modules_net_info_.md#networkinfocallback)

### Variables

* [DEVICE_CONNECTIVITY_EVENT](_packages_hippy_react_src_modules_net_info_.md#const-device_connectivity_event)
* [NetInfoEventEmitter](_packages_hippy_react_src_modules_net_info_.md#let-netinfoeventemitter)
* [subScriptions](_packages_hippy_react_src_modules_net_info_.md#const-subscriptions)

### Functions

* [addEventListener](_packages_hippy_react_src_modules_net_info_.md#addeventlistener)
* [fetch](_packages_hippy_react_src_modules_net_info_.md#fetch)
* [removeEventListener](_packages_hippy_react_src_modules_net_info_.md#removeeventlistener)

## Type aliases

###  NetworkChangeEventData

Ƭ **NetworkChangeEventData**: *any*

*Defined in [packages/hippy-react/src/modules/net-info.ts:6](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/net-info.ts#L6)*

___

###  NetworkInfoCallback

Ƭ **NetworkInfoCallback**: *function*

*Defined in [packages/hippy-react/src/modules/net-info.ts:7](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/net-info.ts#L7)*

#### Type declaration:

▸ (`data`: [NetworkChangeEventData](_packages_hippy_react_src_modules_net_info_.md#networkchangeeventdata)): *void*

**Parameters:**

Name | Type |
------ | ------ |
`data` | [NetworkChangeEventData](_packages_hippy_react_src_modules_net_info_.md#networkchangeeventdata) |

## Variables

### `Const` DEVICE_CONNECTIVITY_EVENT

• **DEVICE_CONNECTIVITY_EVENT**: *"networkStatusDidChange"* = "networkStatusDidChange"

*Defined in [packages/hippy-react/src/modules/net-info.ts:14](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/net-info.ts#L14)*

___

### `Let` NetInfoEventEmitter

• **NetInfoEventEmitter**: *[HippyEventEmitter](../classes/_packages_hippy_react_src_events_emitter_.hippyeventemitter.md)*

*Defined in [packages/hippy-react/src/modules/net-info.ts:17](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/net-info.ts#L17)*

___

### `Const` subScriptions

• **subScriptions**: *Map‹any, any›* =  new Map()

*Defined in [packages/hippy-react/src/modules/net-info.ts:15](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/net-info.ts#L15)*

## Functions

###  addEventListener

▸ **addEventListener**(`eventName`: string, `listener`: [NetworkInfoCallback](_packages_hippy_react_src_modules_net_info_.md#networkinfocallback)): *[NetInfoRevoker](../classes/_packages_hippy_react_src_modules_net_info_.netinforevoker.md)*

*Defined in [packages/hippy-react/src/modules/net-info.ts:42](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/net-info.ts#L42)*

Add a network status event listener

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`eventName` | string | Event name will listen for NetInfo module,                             use `change` for listen network change. |
`listener` | [NetworkInfoCallback](_packages_hippy_react_src_modules_net_info_.md#networkinfocallback) | Event status event callback |

**Returns:** *[NetInfoRevoker](../classes/_packages_hippy_react_src_modules_net_info_.netinforevoker.md)*

NetInfoRevoker - The event revoker for destroy the network info event listener.

___

###  fetch

▸ **fetch**(): *Promise‹[NetworkChangeEventData](_packages_hippy_react_src_modules_net_info_.md#networkchangeeventdata)›*

*Defined in [packages/hippy-react/src/modules/net-info.ts:95](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/net-info.ts#L95)*

Get the current network status

**Returns:** *Promise‹[NetworkChangeEventData](_packages_hippy_react_src_modules_net_info_.md#networkchangeeventdata)›*

___

###  removeEventListener

▸ **removeEventListener**(`eventName`: string, `listener?`: [NetInfoRevoker](../classes/_packages_hippy_react_src_modules_net_info_.netinforevoker.md) | [NetworkInfoCallback](_packages_hippy_react_src_modules_net_info_.md#networkinfocallback)): *void*

*Defined in [packages/hippy-react/src/modules/net-info.ts:70](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/net-info.ts#L70)*

Removenetwork status event event listener

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`eventName` | string | Event name will listen for NetInfo module,                             use `change` for listen network change. |
`listener?` | [NetInfoRevoker](../classes/_packages_hippy_react_src_modules_net_info_.netinforevoker.md) &#124; [NetworkInfoCallback](_packages_hippy_react_src_modules_net_info_.md#networkinfocallback) | - |

**Returns:** *void*
