[Hippy](../README.md) › [Globals](../globals.md) › ["packages/hippy-react/src/events/listener"](../modules/_packages_hippy_react_src_events_listener_.md) › [HippyEventListener](_packages_hippy_react_src_events_listener_.hippyeventlistener.md)

# Class: HippyEventListener

## Hierarchy

* **HippyEventListener**

## Index

### Constructors

* [constructor](_packages_hippy_react_src_events_listener_.hippyeventlistener.md#constructor)

### Properties

* [eventName](_packages_hippy_react_src_events_listener_.hippyeventlistener.md#eventname)
* [listenerIds](_packages_hippy_react_src_events_listener_.hippyeventlistener.md#listenerids)

### Methods

* [addCallback](_packages_hippy_react_src_events_listener_.hippyeventlistener.md#addcallback)
* [getSize](_packages_hippy_react_src_events_listener_.hippyeventlistener.md#getsize)
* [removeCallback](_packages_hippy_react_src_events_listener_.hippyeventlistener.md#removecallback)
* [unregister](_packages_hippy_react_src_events_listener_.hippyeventlistener.md#unregister)

## Constructors

###  constructor

\+ **new HippyEventListener**(`event`: string): *[HippyEventListener](_packages_hippy_react_src_events_listener_.hippyeventlistener.md)*

*Defined in [packages/hippy-react/src/events/listener.ts:6](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/events/listener.ts#L6)*

**Parameters:**

Name | Type |
------ | ------ |
`event` | string |

**Returns:** *[HippyEventListener](_packages_hippy_react_src_events_listener_.hippyeventlistener.md)*

## Properties

###  eventName

• **eventName**: *string*

*Defined in [packages/hippy-react/src/events/listener.ts:4](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/events/listener.ts#L4)*

___

###  listenerIds

• **listenerIds**: *number[]*

*Defined in [packages/hippy-react/src/events/listener.ts:6](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/events/listener.ts#L6)*

## Methods

###  addCallback

▸ **addCallback**(`handleFunc`: Function, `callContext?`: any): *number*

*Defined in [packages/hippy-react/src/events/listener.ts:13](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/events/listener.ts#L13)*

**Parameters:**

Name | Type |
------ | ------ |
`handleFunc` | Function |
`callContext?` | any |

**Returns:** *number*

___

###  getSize

▸ **getSize**(): *number*

*Defined in [packages/hippy-react/src/events/listener.ts:71](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/events/listener.ts#L71)*

**Returns:** *number*

___

###  removeCallback

▸ **removeCallback**(`callbackId`: number): *void*

*Defined in [packages/hippy-react/src/events/listener.ts:32](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/events/listener.ts#L32)*

**Parameters:**

Name | Type |
------ | ------ |
`callbackId` | number |

**Returns:** *void*

___

###  unregister

▸ **unregister**(): *void*

*Defined in [packages/hippy-react/src/events/listener.ts:53](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/events/listener.ts#L53)*

**Returns:** *void*
