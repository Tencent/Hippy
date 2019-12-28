[Hippy](../README.md) › [Globals](../globals.md) › ["packages/hippy-react/src/modules/animation"](../modules/_packages_hippy_react_src_modules_animation_.md) › [AnimationOptions](_packages_hippy_react_src_modules_animation_.animationoptions.md)

# Interface: AnimationOptions

## Hierarchy

* **AnimationOptions**

  ↳ [Animation](../classes/_packages_hippy_react_src_modules_animation_.animation.md)

## Index

### Properties

* [delay](_packages_hippy_react_src_modules_animation_.animationoptions.md#optional-delay)
* [direction](_packages_hippy_react_src_modules_animation_.animationoptions.md#optional-direction)
* [duration](_packages_hippy_react_src_modules_animation_.animationoptions.md#duration)
* [inputRange](_packages_hippy_react_src_modules_animation_.animationoptions.md#optional-inputrange)
* [mode](_packages_hippy_react_src_modules_animation_.animationoptions.md#optional-mode)
* [outputRange](_packages_hippy_react_src_modules_animation_.animationoptions.md#optional-outputrange)
* [repeatCount](_packages_hippy_react_src_modules_animation_.animationoptions.md#optional-repeatcount)
* [startValue](_packages_hippy_react_src_modules_animation_.animationoptions.md#startvalue)
* [timingFunction](_packages_hippy_react_src_modules_animation_.animationoptions.md#optional-timingfunction)
* [toValue](_packages_hippy_react_src_modules_animation_.animationoptions.md#tovalue)
* [valueType](_packages_hippy_react_src_modules_animation_.animationoptions.md#optional-valuetype)

## Properties

### `Optional` delay

• **delay**? : *undefined | number*

*Defined in [packages/hippy-react/src/modules/animation.ts:34](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L34)*

Delay starting time

___

### `Optional` direction

• **direction**? : *[AnimationDirection](../modules/_packages_hippy_react_src_modules_animation_.md#animationdirection)*

*Defined in [packages/hippy-react/src/modules/animation.ts:45](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L45)*

Animation start position

___

###  duration

• **duration**: *number*

*Defined in [packages/hippy-react/src/modules/animation.ts:24](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L24)*

Animation execution time

___

### `Optional` inputRange

• **inputRange**? : *any[]*

*Defined in [packages/hippy-react/src/modules/animation.ts:57](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L57)*

___

### `Optional` mode

• **mode**? : *undefined | "timing"*

*Defined in [packages/hippy-react/src/modules/animation.ts:29](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L29)*

Timeline mode of animation

___

### `Optional` outputRange

• **outputRange**? : *any[]*

*Defined in [packages/hippy-react/src/modules/animation.ts:58](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L58)*

___

### `Optional` repeatCount

• **repeatCount**? : *undefined | number*

*Defined in [packages/hippy-react/src/modules/animation.ts:55](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L55)*

Animation repeat times, use 'loop' to be alway repeating.

___

###  startValue

• **startValue**: *[AnimationValue](../modules/_packages_hippy_react_src_modules_animation_.md#animationvalue)*

*Defined in [packages/hippy-react/src/modules/animation.ts:14](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L14)*

Initial value at `Animation` start

___

### `Optional` timingFunction

• **timingFunction**? : *"linear" | "ease" | "bezier" | "in" | "ease-in" | "out" | "ease-out" | "inOut" | "ease-in-out"*

*Defined in [packages/hippy-react/src/modules/animation.ts:50](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L50)*

Animation interpolation type

___

###  toValue

• **toValue**: *[AnimationValue](../modules/_packages_hippy_react_src_modules_animation_.md#animationvalue)*

*Defined in [packages/hippy-react/src/modules/animation.ts:19](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L19)*

End value when `Animation` end.

___

### `Optional` valueType

• **valueType**? : *undefined | "deg"*

*Defined in [packages/hippy-react/src/modules/animation.ts:40](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/animation.ts#L40)*

Value type, leavel it blank in most case, except use rotate related
animation, set it to be 'deg'.
