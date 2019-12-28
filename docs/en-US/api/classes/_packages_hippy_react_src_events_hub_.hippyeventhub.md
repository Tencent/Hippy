[Hippy](../README.md) › [Globals](../globals.md) › ["packages/hippy-react/src/events/hub"](../modules/_packages_hippy_react_src_events_hub_.md) › [HippyEventHub](_packages_hippy_react_src_events_hub_.hippyeventhub.md)

# Class: HippyEventHub

## Hierarchy

* **HippyEventHub**

## Implements

* [HippyEventHub](_packages_hippy_react_src_events_hub_.hippyeventhub.md)

## Implemented by

* [HippyEventHub](_packages_hippy_react_src_events_hub_.hippyeventhub.md)

## Index

### Constructors

* [constructor](_packages_hippy_react_src_events_hub_.hippyeventhub.md#constructor)

### Properties

* [eventName](_packages_hippy_react_src_events_hub_.hippyeventhub.md#eventname)
* [handlerContainer](_packages_hippy_react_src_events_hub_.hippyeventhub.md#handlercontainer)
* [nextIdForHandler](_packages_hippy_react_src_events_hub_.hippyeventhub.md#nextidforhandler)

### Methods

* [addEventHandler](_packages_hippy_react_src_events_hub_.hippyeventhub.md#addeventhandler)
* [getEventListeners](_packages_hippy_react_src_events_hub_.hippyeventhub.md#geteventlisteners)
* [getHandlerSize](_packages_hippy_react_src_events_hub_.hippyeventhub.md#gethandlersize)
* [notifyEvent](_packages_hippy_react_src_events_hub_.hippyeventhub.md#notifyevent)
* [removeEventHandler](_packages_hippy_react_src_events_hub_.hippyeventhub.md#removeeventhandler)

## Constructors

###  constructor

\+ **new HippyEventHub**(`eventName`: string): *[HippyEventHub](_packages_hippy_react_src_events_hub_.hippyeventhub.md)*

*Defined in [packages/hippy-react/src/events/hub.ts:15](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/events/hub.ts#L15)*

**Parameters:**

Name | Type |
------ | ------ |
`eventName` | string |

**Returns:** *[HippyEventHub](_packages_hippy_react_src_events_hub_.hippyeventhub.md)*

## Properties

###  eventName

• **eventName**: *string*

*Defined in [packages/hippy-react/src/events/hub.ts:4](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/events/hub.ts#L4)*

___

###  handlerContainer

• **handlerContainer**: *object*

*Defined in [packages/hippy-react/src/events/hub.ts:6](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/events/hub.ts#L6)*

#### Type declaration:

* \[ **key**: *string*\]: object

* **context**: *any*

* **eventHandler**: *Function*

* **id**: *number*

___

###  nextIdForHandler

• **nextIdForHandler**: *number*

*Defined in [packages/hippy-react/src/events/hub.ts:5](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/events/hub.ts#L5)*

## Methods

###  addEventHandler

▸ **addEventHandler**(`handler`: Function, `callContext`: any): *number*

*Defined in [packages/hippy-react/src/events/hub.ts:22](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/events/hub.ts#L22)*

**Parameters:**

Name | Type |
------ | ------ |
`handler` | Function |
`callContext` | any |

**Returns:** *number*

___

###  getEventListeners

▸ **getEventListeners**(): *object[]*

*Defined in [packages/hippy-react/src/events/hub.ts:64](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/events/hub.ts#L64)*

**Returns:** *object[]*

___

###  getHandlerSize

▸ **getHandlerSize**(): *number*

*Defined in [packages/hippy-react/src/events/hub.ts:71](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/events/hub.ts#L71)*

**Returns:** *number*

___

###  notifyEvent

▸ **notifyEvent**(`eventParams`: any): *void*

*Defined in [packages/hippy-react/src/events/hub.ts:51](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/events/hub.ts#L51)*

**Parameters:**

Name | Type |
------ | ------ |
`eventParams` | any |

**Returns:** *void*

___

###  removeEventHandler

▸ **removeEventHandler**(`handlerId`: number): *void*

*Defined in [packages/hippy-react/src/events/hub.ts:40](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/events/hub.ts#L40)*

**Parameters:**

Name | Type |
------ | ------ |
`handlerId` | number |

**Returns:** *void*
