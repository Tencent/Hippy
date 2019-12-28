[Hippy](../README.md) › [Globals](../globals.md) › ["packages/hippy-react/src/modules/animation"](../modules/_packages_hippy_react_src_modules_animation_.md) › [Animation](_packages_hippy_react_src_modules_animation_.animation.md)

# Class: Animation

Better performance of Animation solution.

It pushes the animation scheme to native at once.

## Hierarchy

* [AnimationOptions](../interfaces/_packages_hippy_react_src_modules_animation_.animationoptions.md)

  ↳ **Animation**

  ↳ [AnimationSet](_packages_hippy_react_src_modules_animation_set_.animationset.md)

## Implements

* [Animation](_packages_hippy_react_src_modules_animation_.animation.md)

## Implemented by

* [Animation](_packages_hippy_react_src_modules_animation_.animation.md)
* [AnimationSet](_packages_hippy_react_src_modules_animation_set_.animationset.md)

## Index

### Constructors

* [constructor](_packages_hippy_react_src_modules_animation_.animation.md#constructor)

### Properties

* [animationCancelListener](_packages_hippy_react_src_modules_animation_.animation.md#optional-animationcancellistener)
* [animationEndListener](_packages_hippy_react_src_modules_animation_.animation.md#optional-animationendlistener)
* [animationId](_packages_hippy_react_src_modules_animation_.animation.md#animationid)
* [animationRepeatListener](_packages_hippy_react_src_modules_animation_.animation.md#optional-animationrepeatlistener)
* [animationStartListener](_packages_hippy_react_src_modules_animation_.animation.md#optional-animationstartlistener)
* [delay](_packages_hippy_react_src_modules_animation_.animation.md#optional-delay)
* [direction](_packages_hippy_react_src_modules_animation_.animation.md#optional-direction)
* [duration](_packages_hippy_react_src_modules_animation_.animation.md#duration)
* [inputRange](_packages_hippy_react_src_modules_animation_.animation.md#optional-inputrange)
* [mode](_packages_hippy_react_src_modules_animation_.animation.md#optional-mode)
* [onAnimationCancelCallback](_packages_hippy_react_src_modules_animation_.animation.md#optional-onanimationcancelcallback)
* [onAnimationEndCallback](_packages_hippy_react_src_modules_animation_.animation.md#optional-onanimationendcallback)
* [onAnimationRepeatCallback](_packages_hippy_react_src_modules_animation_.animation.md#optional-onanimationrepeatcallback)
* [onAnimationStartCallback](_packages_hippy_react_src_modules_animation_.animation.md#optional-onanimationstartcallback)
* [onHippyAnimationCancel](_packages_hippy_react_src_modules_animation_.animation.md#optional-onhippyanimationcancel)
* [onHippyAnimationEnd](_packages_hippy_react_src_modules_animation_.animation.md#optional-onhippyanimationend)
* [onHippyAnimationRepeat](_packages_hippy_react_src_modules_animation_.animation.md#optional-onhippyanimationrepeat)
* [onHippyAnimationStart](_packages_hippy_react_src_modules_animation_.animation.md#optional-onhippyanimationstart)
* [onRNfqbAnimationCancel](_packages_hippy_react_src_modules_animation_.animation.md#optional-onrnfqbanimationcancel)
* [onRNfqbAnimationEnd](_packages_hippy_react_src_modules_animation_.animation.md#optional-onrnfqbanimationend)
* [onRNfqbAnimationRepeat](_packages_hippy_react_src_modules_animation_.animation.md#optional-onrnfqbanimationrepeat)
* [onRNfqbAnimationStart](_packages_hippy_react_src_modules_animation_.animation.md#optional-onrnfqbanimationstart)
* [outputRange](_packages_hippy_react_src_modules_animation_.animation.md#optional-outputrange)
* [repeatCount](_packages_hippy_react_src_modules_animation_.animation.md#optional-repeatcount)
* [startValue](_packages_hippy_react_src_modules_animation_.animation.md#startvalue)
* [timingFunction](_packages_hippy_react_src_modules_animation_.animation.md#optional-timingfunction)
* [toValue](_packages_hippy_react_src_modules_animation_.animation.md#tovalue)
* [valueType](_packages_hippy_react_src_modules_animation_.animation.md#optional-valuetype)

### Methods

* [destory](_packages_hippy_react_src_modules_animation_.animation.md#destory)
* [destroy](_packages_hippy_react_src_modules_animation_.animation.md#destroy)
* [onAnimationCancel](_packages_hippy_react_src_modules_animation_.animation.md#onanimationcancel)
* [onAnimationEnd](_packages_hippy_react_src_modules_animation_.animation.md#onanimationend)
* [onAnimationRepeat](_packages_hippy_react_src_modules_animation_.animation.md#onanimationrepeat)
* [onAnimationStart](_packages_hippy_react_src_modules_animation_.animation.md#onanimationstart)
* [pause](_packages_hippy_react_src_modules_animation_.animation.md#pause)
* [removeEventListener](_packages_hippy_react_src_modules_animation_.animation.md#removeeventlistener)
* [resume](_packages_hippy_react_src_modules_animation_.animation.md#resume)
* [start](_packages_hippy_react_src_modules_animation_.animation.md#start)
* [updateAnimation](_packages_hippy_react_src_modules_animation_.animation.md#updateanimation)

## Constructors

###  constructor

\+ **new Animation**(`config`: [AnimationOptions](../interfaces/_packages_hippy_react_src_modules_animation_.animationoptions.md)): *[Animation](_packages_hippy_react_src_modules_animation_.animation.md)*

*Defined in [packages/hippy-react/src/modules/animation.ts:90](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L90)*

**Parameters:**

Name | Type |
------ | ------ |
`config` | [AnimationOptions](../interfaces/_packages_hippy_react_src_modules_animation_.animationoptions.md) |

**Returns:** *[Animation](_packages_hippy_react_src_modules_animation_.animation.md)*

## Properties

### `Optional` animationCancelListener

• **animationCancelListener**? : *HippyEventRevoker*

*Defined in [packages/hippy-react/src/modules/animation.ts:69](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L69)*

___

### `Optional` animationEndListener

• **animationEndListener**? : *HippyEventRevoker*

*Defined in [packages/hippy-react/src/modules/animation.ts:68](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L68)*

___

###  animationId

• **animationId**: *number*

*Defined in [packages/hippy-react/src/modules/animation.ts:62](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L62)*

___

### `Optional` animationRepeatListener

• **animationRepeatListener**? : *HippyEventRevoker*

*Defined in [packages/hippy-react/src/modules/animation.ts:70](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L70)*

___

### `Optional` animationStartListener

• **animationStartListener**? : *HippyEventRevoker*

*Defined in [packages/hippy-react/src/modules/animation.ts:67](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L67)*

___

### `Optional` delay

• **delay**? : *undefined | number*

*Inherited from [AnimationOptions](../interfaces/_packages_hippy_react_src_modules_animation_.animationoptions.md).[delay](../interfaces/_packages_hippy_react_src_modules_animation_.animationoptions.md#optional-delay)*

*Defined in [packages/hippy-react/src/modules/animation.ts:34](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L34)*

Delay starting time

___

### `Optional` direction

• **direction**? : *[AnimationDirection](../modules/_packages_hippy_react_src_modules_animation_.md#animationdirection)*

*Inherited from [AnimationOptions](../interfaces/_packages_hippy_react_src_modules_animation_.animationoptions.md).[direction](../interfaces/_packages_hippy_react_src_modules_animation_.animationoptions.md#optional-direction)*

*Defined in [packages/hippy-react/src/modules/animation.ts:45](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L45)*

Animation start position

___

###  duration

• **duration**: *number*

*Inherited from [AnimationOptions](../interfaces/_packages_hippy_react_src_modules_animation_.animationoptions.md).[duration](../interfaces/_packages_hippy_react_src_modules_animation_.animationoptions.md#duration)*

*Defined in [packages/hippy-react/src/modules/animation.ts:24](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L24)*

Animation execution time

___

### `Optional` inputRange

• **inputRange**? : *any[]*

*Inherited from [AnimationOptions](../interfaces/_packages_hippy_react_src_modules_animation_.animationoptions.md).[inputRange](../interfaces/_packages_hippy_react_src_modules_animation_.animationoptions.md#optional-inputrange)*

*Defined in [packages/hippy-react/src/modules/animation.ts:57](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L57)*

___

### `Optional` mode

• **mode**? : *undefined | "timing"*

*Inherited from [AnimationOptions](../interfaces/_packages_hippy_react_src_modules_animation_.animationoptions.md).[mode](../interfaces/_packages_hippy_react_src_modules_animation_.animationoptions.md#optional-mode)*

*Defined in [packages/hippy-react/src/modules/animation.ts:29](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L29)*

Timeline mode of animation

___

### `Optional` onAnimationCancelCallback

• **onAnimationCancelCallback**? : *[AnimationCallback](../modules/_packages_hippy_react_src_modules_animation_.md#animationcallback)*

*Defined in [packages/hippy-react/src/modules/animation.ts:65](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L65)*

___

### `Optional` onAnimationEndCallback

• **onAnimationEndCallback**? : *[AnimationCallback](../modules/_packages_hippy_react_src_modules_animation_.md#animationcallback)*

*Defined in [packages/hippy-react/src/modules/animation.ts:64](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L64)*

___

### `Optional` onAnimationRepeatCallback

• **onAnimationRepeatCallback**? : *[AnimationCallback](../modules/_packages_hippy_react_src_modules_animation_.md#animationcallback)*

*Defined in [packages/hippy-react/src/modules/animation.ts:66](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L66)*

___

### `Optional` onAnimationStartCallback

• **onAnimationStartCallback**? : *[AnimationCallback](../modules/_packages_hippy_react_src_modules_animation_.md#animationcallback)*

*Defined in [packages/hippy-react/src/modules/animation.ts:63](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L63)*

___

### `Optional` onHippyAnimationCancel

• **onHippyAnimationCancel**? : *Function*

*Defined in [packages/hippy-react/src/modules/animation.ts:79](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L79)*

___

### `Optional` onHippyAnimationEnd

• **onHippyAnimationEnd**? : *Function*

*Defined in [packages/hippy-react/src/modules/animation.ts:78](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L78)*

___

### `Optional` onHippyAnimationRepeat

• **onHippyAnimationRepeat**? : *Function*

*Defined in [packages/hippy-react/src/modules/animation.ts:80](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L80)*

___

### `Optional` onHippyAnimationStart

• **onHippyAnimationStart**? : *Function*

*Defined in [packages/hippy-react/src/modules/animation.ts:77](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L77)*

___

### `Optional` onRNfqbAnimationCancel

• **onRNfqbAnimationCancel**? : *Function*

*Defined in [packages/hippy-react/src/modules/animation.ts:75](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L75)*

___

### `Optional` onRNfqbAnimationEnd

• **onRNfqbAnimationEnd**? : *Function*

*Defined in [packages/hippy-react/src/modules/animation.ts:74](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L74)*

___

### `Optional` onRNfqbAnimationRepeat

• **onRNfqbAnimationRepeat**? : *Function*

*Defined in [packages/hippy-react/src/modules/animation.ts:76](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L76)*

___

### `Optional` onRNfqbAnimationStart

• **onRNfqbAnimationStart**? : *Function*

*Defined in [packages/hippy-react/src/modules/animation.ts:73](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L73)*

___

### `Optional` outputRange

• **outputRange**? : *any[]*

*Inherited from [AnimationOptions](../interfaces/_packages_hippy_react_src_modules_animation_.animationoptions.md).[outputRange](../interfaces/_packages_hippy_react_src_modules_animation_.animationoptions.md#optional-outputrange)*

*Defined in [packages/hippy-react/src/modules/animation.ts:58](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L58)*

___

### `Optional` repeatCount

• **repeatCount**? : *undefined | number*

*Inherited from [AnimationOptions](../interfaces/_packages_hippy_react_src_modules_animation_.animationoptions.md).[repeatCount](../interfaces/_packages_hippy_react_src_modules_animation_.animationoptions.md#optional-repeatcount)*

*Defined in [packages/hippy-react/src/modules/animation.ts:55](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L55)*

Animation repeat times, use 'loop' to be alway repeating.

___

###  startValue

• **startValue**: *[AnimationValue](../modules/_packages_hippy_react_src_modules_animation_.md#animationvalue)*

*Inherited from [AnimationOptions](../interfaces/_packages_hippy_react_src_modules_animation_.animationoptions.md).[startValue](../interfaces/_packages_hippy_react_src_modules_animation_.animationoptions.md#startvalue)*

*Defined in [packages/hippy-react/src/modules/animation.ts:14](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L14)*

Initial value at `Animation` start

___

### `Optional` timingFunction

• **timingFunction**? : *"linear" | "ease" | "bezier" | "in" | "ease-in" | "out" | "ease-out" | "inOut" | "ease-in-out"*

*Inherited from [AnimationOptions](../interfaces/_packages_hippy_react_src_modules_animation_.animationoptions.md).[timingFunction](../interfaces/_packages_hippy_react_src_modules_animation_.animationoptions.md#optional-timingfunction)*

*Defined in [packages/hippy-react/src/modules/animation.ts:50](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L50)*

Animation interpolation type

___

###  toValue

• **toValue**: *[AnimationValue](../modules/_packages_hippy_react_src_modules_animation_.md#animationvalue)*

*Inherited from [AnimationOptions](../interfaces/_packages_hippy_react_src_modules_animation_.animationoptions.md).[toValue](../interfaces/_packages_hippy_react_src_modules_animation_.animationoptions.md#tovalue)*

*Defined in [packages/hippy-react/src/modules/animation.ts:19](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L19)*

End value when `Animation` end.

___

### `Optional` valueType

• **valueType**? : *undefined | "deg"*

*Inherited from [AnimationOptions](../interfaces/_packages_hippy_react_src_modules_animation_.animationoptions.md).[valueType](../interfaces/_packages_hippy_react_src_modules_animation_.animationoptions.md#optional-valuetype)*

*Defined in [packages/hippy-react/src/modules/animation.ts:40](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L40)*

Value type, leavel it blank in most case, except use rotate related
animation, set it to be 'deg'.

## Methods

###  destory

▸ **destory**(): *void*

*Defined in [packages/hippy-react/src/modules/animation.ts:215](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L215)*

Use destroy() to destroy animation.

**Returns:** *void*

___

###  destroy

▸ **destroy**(): *void*

*Defined in [packages/hippy-react/src/modules/animation.ts:223](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L223)*

Destroy the animation

**Returns:** *void*

___

###  onAnimationCancel

▸ **onAnimationCancel**(`cb`: [AnimationCallback](../modules/_packages_hippy_react_src_modules_animation_.md#animationcallback)): *void*

*Defined in [packages/hippy-react/src/modules/animation.ts:307](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L307)*

Call when animation is canceled.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`cb` | [AnimationCallback](../modules/_packages_hippy_react_src_modules_animation_.md#animationcallback) | callback when animation started.  |

**Returns:** *void*

___

###  onAnimationEnd

▸ **onAnimationEnd**(`cb`: [AnimationCallback](../modules/_packages_hippy_react_src_modules_animation_.md#animationcallback)): *void*

*Defined in [packages/hippy-react/src/modules/animation.ts:299](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L299)*

Call when animation is ended.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`cb` | [AnimationCallback](../modules/_packages_hippy_react_src_modules_animation_.md#animationcallback) | callback when animation started.  |

**Returns:** *void*

___

###  onAnimationRepeat

▸ **onAnimationRepeat**(`cb`: [AnimationCallback](../modules/_packages_hippy_react_src_modules_animation_.md#animationcallback)): *void*

*Defined in [packages/hippy-react/src/modules/animation.ts:315](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L315)*

Call when animation is repeated.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`cb` | [AnimationCallback](../modules/_packages_hippy_react_src_modules_animation_.md#animationcallback) | callback when animation started.  |

**Returns:** *void*

___

###  onAnimationStart

▸ **onAnimationStart**(`cb`: [AnimationCallback](../modules/_packages_hippy_react_src_modules_animation_.md#animationcallback)): *void*

*Defined in [packages/hippy-react/src/modules/animation.ts:291](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L291)*

Call when animation started.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`cb` | [AnimationCallback](../modules/_packages_hippy_react_src_modules_animation_.md#animationcallback) | callback when animation started.  |

**Returns:** *void*

___

###  pause

▸ **pause**(): *void*

*Defined in [packages/hippy-react/src/modules/animation.ts:231](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L231)*

Pause the running animation

**Returns:** *void*

___

###  removeEventListener

▸ **removeEventListener**(): *void*

*Defined in [packages/hippy-react/src/modules/animation.ts:140](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L140)*

Remove all of animation event listener

**Returns:** *void*

___

###  resume

▸ **resume**(): *void*

*Defined in [packages/hippy-react/src/modules/animation.ts:238](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L238)*

Resume execution of paused animation

**Returns:** *void*

___

###  start

▸ **start**(): *void*

*Defined in [packages/hippy-react/src/modules/animation.ts:158](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L158)*

Start animation execution

**Returns:** *void*

___

###  updateAnimation

▸ **updateAnimation**(`newConfig`: [AnimationOptions](../interfaces/_packages_hippy_react_src_modules_animation_.animationoptions.md)): *void*

*Defined in [packages/hippy-react/src/modules/animation.ts:247](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L247)*

Update to new animation scheme

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`newConfig` | [AnimationOptions](../interfaces/_packages_hippy_react_src_modules_animation_.animationoptions.md) | new animation schema  |

**Returns:** *void*
