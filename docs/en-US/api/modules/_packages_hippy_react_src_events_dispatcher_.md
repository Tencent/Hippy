[Hippy](../README.md) › [Globals](../globals.md) › ["packages/hippy-react/src/events/dispatcher"](_packages_hippy_react_src_events_dispatcher_.md)

# External module: "packages/hippy-react/src/events/dispatcher"

## Index

### Interfaces

* [NativeEvent](../interfaces/_packages_hippy_react_src_events_dispatcher_.nativeevent.md)

### Type aliases

* [EventParam](_packages_hippy_react_src_events_dispatcher_.md#eventparam)

### Variables

* [componentName](_packages_hippy_react_src_events_dispatcher_.md#const-componentname)
* [eventHubs](_packages_hippy_react_src_events_dispatcher_.md#const-eventhubs)

### Functions

* [getHippyEventHub](_packages_hippy_react_src_events_dispatcher_.md#gethippyeventhub)
* [receiveNativeEvent](_packages_hippy_react_src_events_dispatcher_.md#receivenativeevent)
* [receiveNativeGesture](_packages_hippy_react_src_events_dispatcher_.md#receivenativegesture)
* [receiveUIComponentEvent](_packages_hippy_react_src_events_dispatcher_.md#receiveuicomponentevent)
* [registerNativeEventHub](_packages_hippy_react_src_events_dispatcher_.md#registernativeeventhub)
* [unregisterNativeEventHub](_packages_hippy_react_src_events_dispatcher_.md#unregisternativeeventhub)

### Object literals

* [EventDispatcher](_packages_hippy_react_src_events_dispatcher_.md#const-eventdispatcher)

## Type aliases

###  EventParam

Ƭ **EventParam**: *string[] | number[]*

*Defined in [packages/hippy-react/src/events/dispatcher.ts:6](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/events/dispatcher.ts#L6)*

## Variables

### `Const` componentName

• **componentName**: *string[]* =  ['%c[event]%c', 'color: green', 'color: auto']

*Defined in [packages/hippy-react/src/events/dispatcher.ts:14](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/events/dispatcher.ts#L14)*

___

### `Const` eventHubs

• **eventHubs**: *Map‹any, any›* =  new Map()

*Defined in [packages/hippy-react/src/events/dispatcher.ts:13](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/events/dispatcher.ts#L13)*

## Functions

###  getHippyEventHub

▸ **getHippyEventHub**(`eventName`: string): *any*

*Defined in [packages/hippy-react/src/events/dispatcher.ts:30](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/events/dispatcher.ts#L30)*

**Parameters:**

Name | Type |
------ | ------ |
`eventName` | string |

**Returns:** *any*

___

###  receiveNativeEvent

▸ **receiveNativeEvent**(`nativeEvent`: [EventParam](_packages_hippy_react_src_events_dispatcher_.md#eventparam)): *void*

*Defined in [packages/hippy-react/src/events/dispatcher.ts:46](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/events/dispatcher.ts#L46)*

**Parameters:**

Name | Type |
------ | ------ |
`nativeEvent` | [EventParam](_packages_hippy_react_src_events_dispatcher_.md#eventparam) |

**Returns:** *void*

___

###  receiveNativeGesture

▸ **receiveNativeGesture**(`nativeEvent`: [NativeEvent](../interfaces/_packages_hippy_react_src_events_dispatcher_.nativeevent.md)): *void*

*Defined in [packages/hippy-react/src/events/dispatcher.ts:64](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/events/dispatcher.ts#L64)*

**Parameters:**

Name | Type |
------ | ------ |
`nativeEvent` | [NativeEvent](../interfaces/_packages_hippy_react_src_events_dispatcher_.nativeevent.md) |

**Returns:** *void*

___

###  receiveUIComponentEvent

▸ **receiveUIComponentEvent**(`nativeEvent`: string[]): *void*

*Defined in [packages/hippy-react/src/events/dispatcher.ts:111](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/events/dispatcher.ts#L111)*

**Parameters:**

Name | Type |
------ | ------ |
`nativeEvent` | string[] |

**Returns:** *void*

___

###  registerNativeEventHub

▸ **registerNativeEventHub**(`eventName`: string): *any*

*Defined in [packages/hippy-react/src/events/dispatcher.ts:16](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/events/dispatcher.ts#L16)*

**Parameters:**

Name | Type |
------ | ------ |
`eventName` | string |

**Returns:** *any*

___

###  unregisterNativeEventHub

▸ **unregisterNativeEventHub**(`eventName`: string): *void*

*Defined in [packages/hippy-react/src/events/dispatcher.ts:37](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/events/dispatcher.ts#L37)*

**Parameters:**

Name | Type |
------ | ------ |
`eventName` | string |

**Returns:** *void*

## Object literals

### `Const` EventDispatcher

### ▪ **EventDispatcher**: *object*

*Defined in [packages/hippy-react/src/events/dispatcher.ts:131](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/events/dispatcher.ts#L131)*

###  getHippyEventHub

• **getHippyEventHub**: *[getHippyEventHub](_packages_hippy_react_src_events_dispatcher_.md#gethippyeventhub)*

*Defined in [packages/hippy-react/src/events/dispatcher.ts:133](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/events/dispatcher.ts#L133)*

###  receiveNativeEvent

• **receiveNativeEvent**: *[receiveNativeEvent](_packages_hippy_react_src_events_dispatcher_.md#receivenativeevent)*

*Defined in [packages/hippy-react/src/events/dispatcher.ts:135](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/events/dispatcher.ts#L135)*

###  receiveNativeGesture

• **receiveNativeGesture**: *[receiveNativeGesture](_packages_hippy_react_src_events_dispatcher_.md#receivenativegesture)*

*Defined in [packages/hippy-react/src/events/dispatcher.ts:136](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/events/dispatcher.ts#L136)*

###  receiveUIComponentEvent

• **receiveUIComponentEvent**: *[receiveUIComponentEvent](_packages_hippy_react_src_events_dispatcher_.md#receiveuicomponentevent)*

*Defined in [packages/hippy-react/src/events/dispatcher.ts:137](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/events/dispatcher.ts#L137)*

###  registerNativeEventHub

• **registerNativeEventHub**: *[registerNativeEventHub](_packages_hippy_react_src_events_dispatcher_.md#registernativeeventhub)*

*Defined in [packages/hippy-react/src/events/dispatcher.ts:132](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/events/dispatcher.ts#L132)*

###  unregisterNativeEventHub

• **unregisterNativeEventHub**: *[unregisterNativeEventHub](_packages_hippy_react_src_events_dispatcher_.md#unregisternativeeventhub)*

*Defined in [packages/hippy-react/src/events/dispatcher.ts:134](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/events/dispatcher.ts#L134)*
