[Hippy](../README.md) › [Globals](../globals.md) › ["packages/hippy-react/src/modules/animation-set"](../modules/_packages_hippy_react_src_modules_animation_set_.md) › [AnimationSet](_packages_hippy_react_src_modules_animation_set_.animationset.md)

# Class: AnimationSet

Better performance of Animation series solution.

It pushes the animation scheme to native at once.

## Hierarchy

  ↳ [Animation](_packages_hippy_react_src_modules_animation_.animation.md)

  ↳ **AnimationSet**

## Implements

* [Animation](_packages_hippy_react_src_modules_animation_.animation.md)
* [AnimationSet](_packages_hippy_react_src_modules_animation_set_.animationset.md)

## Implemented by

* [AnimationSet](_packages_hippy_react_src_modules_animation_set_.animationset.md)

## Index

### Constructors

* [constructor](_packages_hippy_react_src_modules_animation_set_.animationset.md#constructor)

### Properties

* [animationCancelListener](_packages_hippy_react_src_modules_animation_set_.animationset.md#optional-animationcancellistener)
* [animationEndListener](_packages_hippy_react_src_modules_animation_set_.animationset.md#optional-animationendlistener)
* [animationId](_packages_hippy_react_src_modules_animation_set_.animationset.md#animationid)
* [animationList](_packages_hippy_react_src_modules_animation_set_.animationset.md#animationlist)
* [animationRepeatListener](_packages_hippy_react_src_modules_animation_set_.animationset.md#optional-animationrepeatlistener)
* [animationStartListener](_packages_hippy_react_src_modules_animation_set_.animationset.md#optional-animationstartlistener)
* [delay](_packages_hippy_react_src_modules_animation_set_.animationset.md#optional-delay)
* [direction](_packages_hippy_react_src_modules_animation_set_.animationset.md#optional-direction)
* [duration](_packages_hippy_react_src_modules_animation_set_.animationset.md#duration)
* [inputRange](_packages_hippy_react_src_modules_animation_set_.animationset.md#optional-inputrange)
* [mode](_packages_hippy_react_src_modules_animation_set_.animationset.md#optional-mode)
* [onAnimationCancelCallback](_packages_hippy_react_src_modules_animation_set_.animationset.md#optional-onanimationcancelcallback)
* [onAnimationEndCallback](_packages_hippy_react_src_modules_animation_set_.animationset.md#optional-onanimationendcallback)
* [onAnimationRepeatCallback](_packages_hippy_react_src_modules_animation_set_.animationset.md#optional-onanimationrepeatcallback)
* [onAnimationStartCallback](_packages_hippy_react_src_modules_animation_set_.animationset.md#optional-onanimationstartcallback)
* [onHippyAnimationCancel](_packages_hippy_react_src_modules_animation_set_.animationset.md#optional-onhippyanimationcancel)
* [onHippyAnimationEnd](_packages_hippy_react_src_modules_animation_set_.animationset.md#optional-onhippyanimationend)
* [onHippyAnimationRepeat](_packages_hippy_react_src_modules_animation_set_.animationset.md#optional-onhippyanimationrepeat)
* [onHippyAnimationStart](_packages_hippy_react_src_modules_animation_set_.animationset.md#optional-onhippyanimationstart)
* [onRNfqbAnimationCancel](_packages_hippy_react_src_modules_animation_set_.animationset.md#optional-onrnfqbanimationcancel)
* [onRNfqbAnimationEnd](_packages_hippy_react_src_modules_animation_set_.animationset.md#optional-onrnfqbanimationend)
* [onRNfqbAnimationRepeat](_packages_hippy_react_src_modules_animation_set_.animationset.md#optional-onrnfqbanimationrepeat)
* [onRNfqbAnimationStart](_packages_hippy_react_src_modules_animation_set_.animationset.md#optional-onrnfqbanimationstart)
* [outputRange](_packages_hippy_react_src_modules_animation_set_.animationset.md#optional-outputrange)
* [repeatCount](_packages_hippy_react_src_modules_animation_set_.animationset.md#optional-repeatcount)
* [startValue](_packages_hippy_react_src_modules_animation_set_.animationset.md#startvalue)
* [timingFunction](_packages_hippy_react_src_modules_animation_set_.animationset.md#optional-timingfunction)
* [toValue](_packages_hippy_react_src_modules_animation_set_.animationset.md#tovalue)
* [valueType](_packages_hippy_react_src_modules_animation_set_.animationset.md#optional-valuetype)

### Methods

* [destory](_packages_hippy_react_src_modules_animation_set_.animationset.md#destory)
* [destroy](_packages_hippy_react_src_modules_animation_set_.animationset.md#destroy)
* [onAnimationCancel](_packages_hippy_react_src_modules_animation_set_.animationset.md#onanimationcancel)
* [onAnimationEnd](_packages_hippy_react_src_modules_animation_set_.animationset.md#onanimationend)
* [onAnimationRepeat](_packages_hippy_react_src_modules_animation_set_.animationset.md#onanimationrepeat)
* [onAnimationStart](_packages_hippy_react_src_modules_animation_set_.animationset.md#onanimationstart)
* [pause](_packages_hippy_react_src_modules_animation_set_.animationset.md#pause)
* [removeEventListener](_packages_hippy_react_src_modules_animation_set_.animationset.md#removeeventlistener)
* [resume](_packages_hippy_react_src_modules_animation_set_.animationset.md#resume)
* [start](_packages_hippy_react_src_modules_animation_set_.animationset.md#start)
* [updateAnimation](_packages_hippy_react_src_modules_animation_set_.animationset.md#updateanimation)

## Constructors

###  constructor

\+ **new AnimationSet**(`config`: [AnimationOptions](../interfaces/_packages_hippy_react_src_modules_animation_.animationoptions.md)): *[AnimationSet](_packages_hippy_react_src_modules_animation_set_.animationset.md)*

*Inherited from [Animation](_packages_hippy_react_src_modules_animation_.animation.md).[constructor](_packages_hippy_react_src_modules_animation_.animation.md#constructor)*

*Defined in [packages/hippy-react/src/modules/animation.ts:90](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L90)*

**Parameters:**

Name | Type |
------ | ------ |
`config` | [AnimationOptions](../interfaces/_packages_hippy_react_src_modules_animation_.animationoptions.md) |

**Returns:** *[AnimationSet](_packages_hippy_react_src_modules_animation_set_.animationset.md)*

## Properties

### `Optional` animationCancelListener

• **animationCancelListener**? : *HippyEventRevoker*

*Inherited from [Animation](_packages_hippy_react_src_modules_animation_.animation.md).[animationCancelListener](_packages_hippy_react_src_modules_animation_.animation.md#optional-animationcancellistener)*

*Defined in [packages/hippy-react/src/modules/animation.ts:69](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L69)*

___

### `Optional` animationEndListener

• **animationEndListener**? : *HippyEventRevoker*

*Inherited from [Animation](_packages_hippy_react_src_modules_animation_.animation.md).[animationEndListener](_packages_hippy_react_src_modules_animation_.animation.md#optional-animationendlistener)*

*Defined in [packages/hippy-react/src/modules/animation.ts:68](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L68)*

___

###  animationId

• **animationId**: *number*

*Overrides [Animation](_packages_hippy_react_src_modules_animation_.animation.md).[animationId](_packages_hippy_react_src_modules_animation_.animation.md#animationid)*

*Defined in [packages/hippy-react/src/modules/animation-set.ts:25](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation-set.ts#L25)*

___

###  animationList

• **animationList**: *[AnimationInstance](../interfaces/_packages_hippy_react_src_modules_animation_set_.animationinstance.md)[]*

*Defined in [packages/hippy-react/src/modules/animation-set.ts:26](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation-set.ts#L26)*

___

### `Optional` animationRepeatListener

• **animationRepeatListener**? : *HippyEventRevoker*

*Inherited from [Animation](_packages_hippy_react_src_modules_animation_.animation.md).[animationRepeatListener](_packages_hippy_react_src_modules_animation_.animation.md#optional-animationrepeatlistener)*

*Defined in [packages/hippy-react/src/modules/animation.ts:70](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L70)*

___

### `Optional` animationStartListener

• **animationStartListener**? : *HippyEventRevoker*

*Inherited from [Animation](_packages_hippy_react_src_modules_animation_.animation.md).[animationStartListener](_packages_hippy_react_src_modules_animation_.animation.md#optional-animationstartlistener)*

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

*Inherited from [Animation](_packages_hippy_react_src_modules_animation_.animation.md).[onAnimationCancelCallback](_packages_hippy_react_src_modules_animation_.animation.md#optional-onanimationcancelcallback)*

*Defined in [packages/hippy-react/src/modules/animation.ts:65](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L65)*

___

### `Optional` onAnimationEndCallback

• **onAnimationEndCallback**? : *[AnimationCallback](../modules/_packages_hippy_react_src_modules_animation_.md#animationcallback)*

*Inherited from [Animation](_packages_hippy_react_src_modules_animation_.animation.md).[onAnimationEndCallback](_packages_hippy_react_src_modules_animation_.animation.md#optional-onanimationendcallback)*

*Defined in [packages/hippy-react/src/modules/animation.ts:64](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L64)*

___

### `Optional` onAnimationRepeatCallback

• **onAnimationRepeatCallback**? : *[AnimationCallback](../modules/_packages_hippy_react_src_modules_animation_.md#animationcallback)*

*Inherited from [Animation](_packages_hippy_react_src_modules_animation_.animation.md).[onAnimationRepeatCallback](_packages_hippy_react_src_modules_animation_.animation.md#optional-onanimationrepeatcallback)*

*Defined in [packages/hippy-react/src/modules/animation.ts:66](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L66)*

___

### `Optional` onAnimationStartCallback

• **onAnimationStartCallback**? : *[AnimationCallback](../modules/_packages_hippy_react_src_modules_animation_.md#animationcallback)*

*Inherited from [Animation](_packages_hippy_react_src_modules_animation_.animation.md).[onAnimationStartCallback](_packages_hippy_react_src_modules_animation_.animation.md#optional-onanimationstartcallback)*

*Defined in [packages/hippy-react/src/modules/animation.ts:63](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L63)*

___

### `Optional` onHippyAnimationCancel

• **onHippyAnimationCancel**? : *Function*

*Overrides [Animation](_packages_hippy_react_src_modules_animation_.animation.md).[onHippyAnimationCancel](_packages_hippy_react_src_modules_animation_.animation.md#optional-onhippyanimationcancel)*

*Defined in [packages/hippy-react/src/modules/animation-set.ts:35](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation-set.ts#L35)*

___

### `Optional` onHippyAnimationEnd

• **onHippyAnimationEnd**? : *Function*

*Overrides [Animation](_packages_hippy_react_src_modules_animation_.animation.md).[onHippyAnimationEnd](_packages_hippy_react_src_modules_animation_.animation.md#optional-onhippyanimationend)*

*Defined in [packages/hippy-react/src/modules/animation-set.ts:34](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation-set.ts#L34)*

___

### `Optional` onHippyAnimationRepeat

• **onHippyAnimationRepeat**? : *Function*

*Overrides [Animation](_packages_hippy_react_src_modules_animation_.animation.md).[onHippyAnimationRepeat](_packages_hippy_react_src_modules_animation_.animation.md#optional-onhippyanimationrepeat)*

*Defined in [packages/hippy-react/src/modules/animation-set.ts:36](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation-set.ts#L36)*

___

### `Optional` onHippyAnimationStart

• **onHippyAnimationStart**? : *Function*

*Overrides [Animation](_packages_hippy_react_src_modules_animation_.animation.md).[onHippyAnimationStart](_packages_hippy_react_src_modules_animation_.animation.md#optional-onhippyanimationstart)*

*Defined in [packages/hippy-react/src/modules/animation-set.ts:33](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation-set.ts#L33)*

___

### `Optional` onRNfqbAnimationCancel

• **onRNfqbAnimationCancel**? : *Function*

*Overrides [Animation](_packages_hippy_react_src_modules_animation_.animation.md).[onRNfqbAnimationCancel](_packages_hippy_react_src_modules_animation_.animation.md#optional-onrnfqbanimationcancel)*

*Defined in [packages/hippy-react/src/modules/animation-set.ts:31](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation-set.ts#L31)*

___

### `Optional` onRNfqbAnimationEnd

• **onRNfqbAnimationEnd**? : *Function*

*Overrides [Animation](_packages_hippy_react_src_modules_animation_.animation.md).[onRNfqbAnimationEnd](_packages_hippy_react_src_modules_animation_.animation.md#optional-onrnfqbanimationend)*

*Defined in [packages/hippy-react/src/modules/animation-set.ts:30](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation-set.ts#L30)*

___

### `Optional` onRNfqbAnimationRepeat

• **onRNfqbAnimationRepeat**? : *Function*

*Overrides [Animation](_packages_hippy_react_src_modules_animation_.animation.md).[onRNfqbAnimationRepeat](_packages_hippy_react_src_modules_animation_.animation.md#optional-onrnfqbanimationrepeat)*

*Defined in [packages/hippy-react/src/modules/animation-set.ts:32](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation-set.ts#L32)*

___

### `Optional` onRNfqbAnimationStart

• **onRNfqbAnimationStart**? : *Function*

*Overrides [Animation](_packages_hippy_react_src_modules_animation_.animation.md).[onRNfqbAnimationStart](_packages_hippy_react_src_modules_animation_.animation.md#optional-onrnfqbanimationstart)*

*Defined in [packages/hippy-react/src/modules/animation-set.ts:29](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation-set.ts#L29)*

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

*Inherited from [Animation](_packages_hippy_react_src_modules_animation_.animation.md).[destory](_packages_hippy_react_src_modules_animation_.animation.md#destory)*

*Defined in [packages/hippy-react/src/modules/animation.ts:215](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L215)*

Use destroy() to destroy animation.

**Returns:** *void*

___

###  destroy

▸ **destroy**(): *void*

*Inherited from [Animation](_packages_hippy_react_src_modules_animation_.animation.md).[destroy](_packages_hippy_react_src_modules_animation_.animation.md#destroy)*

*Defined in [packages/hippy-react/src/modules/animation.ts:223](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L223)*

Destroy the animation

**Returns:** *void*

___

###  onAnimationCancel

▸ **onAnimationCancel**(`cb`: [AnimationCallback](../modules/_packages_hippy_react_src_modules_animation_.md#animationcallback)): *void*

*Inherited from [Animation](_packages_hippy_react_src_modules_animation_.animation.md).[onAnimationCancel](_packages_hippy_react_src_modules_animation_.animation.md#onanimationcancel)*

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

*Inherited from [Animation](_packages_hippy_react_src_modules_animation_.animation.md).[onAnimationEnd](_packages_hippy_react_src_modules_animation_.animation.md#onanimationend)*

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

*Inherited from [Animation](_packages_hippy_react_src_modules_animation_.animation.md).[onAnimationRepeat](_packages_hippy_react_src_modules_animation_.animation.md#onanimationrepeat)*

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

*Inherited from [Animation](_packages_hippy_react_src_modules_animation_.animation.md).[onAnimationStart](_packages_hippy_react_src_modules_animation_.animation.md#onanimationstart)*

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

*Inherited from [Animation](_packages_hippy_react_src_modules_animation_.animation.md).[pause](_packages_hippy_react_src_modules_animation_.animation.md#pause)*

*Defined in [packages/hippy-react/src/modules/animation.ts:231](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L231)*

Pause the running animation

**Returns:** *void*

___

###  removeEventListener

▸ **removeEventListener**(): *void*

*Inherited from [Animation](_packages_hippy_react_src_modules_animation_.animation.md).[removeEventListener](_packages_hippy_react_src_modules_animation_.animation.md#removeeventlistener)*

*Defined in [packages/hippy-react/src/modules/animation.ts:140](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L140)*

Remove all of animation event listener

**Returns:** *void*

___

###  resume

▸ **resume**(): *void*

*Inherited from [Animation](_packages_hippy_react_src_modules_animation_.animation.md).[resume](_packages_hippy_react_src_modules_animation_.animation.md#resume)*

*Defined in [packages/hippy-react/src/modules/animation.ts:238](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L238)*

Resume execution of paused animation

**Returns:** *void*

___

###  start

▸ **start**(): *void*

*Inherited from [Animation](_packages_hippy_react_src_modules_animation_.animation.md).[start](_packages_hippy_react_src_modules_animation_.animation.md#start)*

*Defined in [packages/hippy-react/src/modules/animation.ts:158](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L158)*

Start animation execution

**Returns:** *void*

___

###  updateAnimation

▸ **updateAnimation**(`newConfig`: [AnimationOptions](../interfaces/_packages_hippy_react_src_modules_animation_.animationoptions.md)): *void*

*Inherited from [Animation](_packages_hippy_react_src_modules_animation_.animation.md).[updateAnimation](_packages_hippy_react_src_modules_animation_.animation.md#updateanimation)*

*Defined in [packages/hippy-react/src/modules/animation.ts:247](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L247)*

Update to new animation scheme

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`newConfig` | [AnimationOptions](../interfaces/_packages_hippy_react_src_modules_animation_.animationoptions.md) | new animation schema  |

**Returns:** *void*
