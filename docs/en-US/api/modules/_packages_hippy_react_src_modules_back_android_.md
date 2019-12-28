[Hippy](../README.md) › [Globals](../globals.md) › ["packages/hippy-react/src/modules/back-android"](_packages_hippy_react_src_modules_back_android_.md)

# External module: "packages/hippy-react/src/modules/back-android"

## Index

### Interfaces

* [BackAndroidRevoker](../interfaces/_packages_hippy_react_src_modules_back_android_.backandroidrevoker.md)

### Type aliases

* [EventListener](_packages_hippy_react_src_modules_back_android_.md#eventlistener)

### Variables

* [backPressSubscriptions](_packages_hippy_react_src_modules_back_android_.md#const-backpresssubscriptions)
* [hippyEventEmitter](_packages_hippy_react_src_modules_back_android_.md#const-hippyeventemitter)

### Object literals

* [BackAndroid](_packages_hippy_react_src_modules_back_android_.md#let-backandroid)
* [realBackAndroid](_packages_hippy_react_src_modules_back_android_.md#const-realbackandroid)

## Type aliases

###  EventListener

Ƭ **EventListener**: *function*

*Defined in [packages/hippy-react/src/modules/back-android.ts:11](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/back-android.ts#L11)*

#### Type declaration:

▸ (): *void*

## Variables

### `Const` backPressSubscriptions

• **backPressSubscriptions**: *Set‹unknown›* =  new Set()

*Defined in [packages/hippy-react/src/modules/back-android.ts:9](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/back-android.ts#L9)*

___

### `Const` hippyEventEmitter

• **hippyEventEmitter**: *[HippyEventEmitter](../classes/_packages_hippy_react_src_events_emitter_.hippyeventemitter.md)‹›* =  new HippyEventEmitter()

*Defined in [packages/hippy-react/src/modules/back-android.ts:8](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/back-android.ts#L8)*

## Object literals

### `Let` BackAndroid

### ▪ **BackAndroid**: *object*

*Defined in [packages/hippy-react/src/modules/back-android.ts:63](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/back-android.ts#L63)*

Fake BackAndroid for iOS

###  addListener

▸ **addListener**(`handler`: [EventListener](_packages_hippy_react_src_modules_back_android_.md#eventlistener)): *[BackAndroidRevoker](../interfaces/_packages_hippy_react_src_modules_back_android_.backandroidrevoker.md)*

*Defined in [packages/hippy-react/src/modules/back-android.ts:65](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/back-android.ts#L65)*

**Parameters:**

Name | Type |
------ | ------ |
`handler` | [EventListener](_packages_hippy_react_src_modules_back_android_.md#eventlistener) |

**Returns:** *[BackAndroidRevoker](../interfaces/_packages_hippy_react_src_modules_back_android_.backandroidrevoker.md)*

###  exitApp

▸ **exitApp**(): *void*

*Defined in [packages/hippy-react/src/modules/back-android.ts:64](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/back-android.ts#L64)*

**Returns:** *void*

###  initEventListener

▸ **initEventListener**(): *void*

*Defined in [packages/hippy-react/src/modules/back-android.ts:71](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/back-android.ts#L71)*

**Returns:** *void*

###  removeListener

▸ **removeListener**(`handler`: [EventListener](_packages_hippy_react_src_modules_back_android_.md#eventlistener)): *void*

*Defined in [packages/hippy-react/src/modules/back-android.ts:70](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/back-android.ts#L70)*

**Parameters:**

Name | Type |
------ | ------ |
`handler` | [EventListener](_packages_hippy_react_src_modules_back_android_.md#eventlistener) |

**Returns:** *void*

___

### `Const` realBackAndroid

### ▪ **realBackAndroid**: *object*

*Defined in [packages/hippy-react/src/modules/back-android.ts:20](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/back-android.ts#L20)*

Android hardware back button event listener.

###  addListener

▸ **addListener**(`handler`: [EventListener](_packages_hippy_react_src_modules_back_android_.md#eventlistener)): *[BackAndroidRevoker](../interfaces/_packages_hippy_react_src_modules_back_android_.backandroidrevoker.md)*

*Defined in [packages/hippy-react/src/modules/back-android.ts:25](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/back-android.ts#L25)*

**Parameters:**

Name | Type |
------ | ------ |
`handler` | [EventListener](_packages_hippy_react_src_modules_back_android_.md#eventlistener) |

**Returns:** *[BackAndroidRevoker](../interfaces/_packages_hippy_react_src_modules_back_android_.backandroidrevoker.md)*

###  exitApp

▸ **exitApp**(): *void*

*Defined in [packages/hippy-react/src/modules/back-android.ts:21](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/back-android.ts#L21)*

**Returns:** *void*

###  initEventListener

▸ **initEventListener**(): *void*

*Defined in [packages/hippy-react/src/modules/back-android.ts:42](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/back-android.ts#L42)*

**Returns:** *void*

###  removeListener

▸ **removeListener**(`handler`: [EventListener](_packages_hippy_react_src_modules_back_android_.md#eventlistener)): *void*

*Defined in [packages/hippy-react/src/modules/back-android.ts:35](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/back-android.ts#L35)*

**Parameters:**

Name | Type |
------ | ------ |
`handler` | [EventListener](_packages_hippy_react_src_modules_back_android_.md#eventlistener) |

**Returns:** *void*
