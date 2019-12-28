[Hippy](../README.md) › [Globals](../globals.md) › ["packages/hippy-react/src/events/emitter"](../modules/_packages_hippy_react_src_events_emitter_.md) › [HippyEventEmitter](_packages_hippy_react_src_events_emitter_.hippyeventemitter.md)

# Class: HippyEventEmitter

## Hierarchy

* **HippyEventEmitter**

## Index

### Constructors

* [constructor](_packages_hippy_react_src_events_emitter_.hippyeventemitter.md#constructor)

### Properties

* [hippyEventListeners](_packages_hippy_react_src_events_emitter_.hippyeventemitter.md#hippyeventlisteners)

### Methods

* [addListener](_packages_hippy_react_src_events_emitter_.hippyeventemitter.md#addlistener)
* [emit](_packages_hippy_react_src_events_emitter_.hippyeventemitter.md#emit)
* [listenerSize](_packages_hippy_react_src_events_emitter_.hippyeventemitter.md#listenersize)
* [removeAllListeners](_packages_hippy_react_src_events_emitter_.hippyeventemitter.md#removealllisteners)
* [sharedListeners](_packages_hippy_react_src_events_emitter_.hippyeventemitter.md#sharedlisteners)

## Constructors

###  constructor

\+ **new HippyEventEmitter**(`sharedListeners?`: [EventListeners](../interfaces/_packages_hippy_react_src_events_emitter_.eventlisteners.md)): *[HippyEventEmitter](_packages_hippy_react_src_events_emitter_.hippyeventemitter.md)*

*Defined in [packages/hippy-react/src/events/emitter.ts:17](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/events/emitter.ts#L17)*

**Parameters:**

Name | Type |
------ | ------ |
`sharedListeners?` | [EventListeners](../interfaces/_packages_hippy_react_src_events_emitter_.eventlisteners.md) |

**Returns:** *[HippyEventEmitter](_packages_hippy_react_src_events_emitter_.hippyeventemitter.md)*

## Properties

###  hippyEventListeners

• **hippyEventListeners**: *[EventListeners](../interfaces/_packages_hippy_react_src_events_emitter_.eventlisteners.md)*

*Defined in [packages/hippy-react/src/events/emitter.ts:17](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/events/emitter.ts#L17)*

## Methods

###  addListener

▸ **addListener**(`event`: string, `callback`: function, `context?`: any): *[EventEmitterRevoker](_packages_hippy_react_src_events_emitter_revoker_.eventemitterrevoker.md)‹›*

*Defined in [packages/hippy-react/src/events/emitter.ts:31](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/events/emitter.ts#L31)*

**Parameters:**

▪ **event**: *string*

▪ **callback**: *function*

▸ (`data?`: any): *void*

**Parameters:**

Name | Type |
------ | ------ |
`data?` | any |

▪`Optional`  **context**: *any*

**Returns:** *[EventEmitterRevoker](_packages_hippy_react_src_events_emitter_revoker_.eventemitterrevoker.md)‹›*

___

###  emit

▸ **emit**(`event`: string, `param`: any): *boolean*

*Defined in [packages/hippy-react/src/events/emitter.ts:63](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/events/emitter.ts#L63)*

**Parameters:**

Name | Type |
------ | ------ |
`event` | string |
`param` | any |

**Returns:** *boolean*

___

###  listenerSize

▸ **listenerSize**(`event`: string): *number*

*Defined in [packages/hippy-react/src/events/emitter.ts:75](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/events/emitter.ts#L75)*

**Parameters:**

Name | Type |
------ | ------ |
`event` | string |

**Returns:** *number*

___

###  removeAllListeners

▸ **removeAllListeners**(`event`: string): *void*

*Defined in [packages/hippy-react/src/events/emitter.ts:50](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/events/emitter.ts#L50)*

**Parameters:**

Name | Type |
------ | ------ |
`event` | string |

**Returns:** *void*

___

###  sharedListeners

▸ **sharedListeners**(): *[EventListeners](../interfaces/_packages_hippy_react_src_events_emitter_.eventlisteners.md)*

*Defined in [packages/hippy-react/src/events/emitter.ts:27](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/events/emitter.ts#L27)*

**Returns:** *[EventListeners](../interfaces/_packages_hippy_react_src_events_emitter_.eventlisteners.md)*
