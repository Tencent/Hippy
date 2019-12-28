[Hippy](../README.md) › [Globals](../globals.md) › ["packages/hippy-react-web/src/modules/animation-set"](../modules/_packages_hippy_react_web_src_modules_animation_set_.md) › [AnimationSet](_packages_hippy_react_web_src_modules_animation_set_.animationset.md)

# Class: AnimationSet

## Hierarchy

* **AnimationSet**

## Index

### Constructors

* [constructor](_packages_hippy_react_web_src_modules_animation_set_.animationset.md#constructor)

### Methods

* [calculateNowValue](_packages_hippy_react_web_src_modules_animation_set_.animationset.md#calculatenowvalue)
* [clearAnimationInterval](_packages_hippy_react_web_src_modules_animation_set_.animationset.md#clearanimationinterval)
* [continueToNextChildAnimation](_packages_hippy_react_web_src_modules_animation_set_.animationset.md#continuetonextchildanimation)
* [destroy](_packages_hippy_react_web_src_modules_animation_set_.animationset.md#destroy)
* [endAnimationSet](_packages_hippy_react_web_src_modules_animation_set_.animationset.md#endanimationset)
* [getNowValue](_packages_hippy_react_web_src_modules_animation_set_.animationset.md#getnowvalue)
* [initNowAnimationState](_packages_hippy_react_web_src_modules_animation_set_.animationset.md#initnowanimationstate)
* [onAnimationCancel](_packages_hippy_react_web_src_modules_animation_set_.animationset.md#onanimationcancel)
* [onAnimationEnd](_packages_hippy_react_web_src_modules_animation_set_.animationset.md#onanimationend)
* [onAnimationRepeat](_packages_hippy_react_web_src_modules_animation_set_.animationset.md#onanimationrepeat)
* [onAnimationStart](_packages_hippy_react_web_src_modules_animation_set_.animationset.md#onanimationstart)
* [pause](_packages_hippy_react_web_src_modules_animation_set_.animationset.md#pause)
* [renderNowValue](_packages_hippy_react_web_src_modules_animation_set_.animationset.md#rendernowvalue)
* [renderStyleAttribute](_packages_hippy_react_web_src_modules_animation_set_.animationset.md#renderstyleattribute)
* [repeatAnimationSet](_packages_hippy_react_web_src_modules_animation_set_.animationset.md#repeatanimationset)
* [repeatChildAnimation](_packages_hippy_react_web_src_modules_animation_set_.animationset.md#repeatchildanimation)
* [resetState](_packages_hippy_react_web_src_modules_animation_set_.animationset.md#resetstate)
* [resume](_packages_hippy_react_web_src_modules_animation_set_.animationset.md#resume)
* [setRef](_packages_hippy_react_web_src_modules_animation_set_.animationset.md#setref)
* [setStyleAttribute](_packages_hippy_react_web_src_modules_animation_set_.animationset.md#setstyleattribute)
* [setTransformStyleAttribute](_packages_hippy_react_web_src_modules_animation_set_.animationset.md#settransformstyleattribute)
* [start](_packages_hippy_react_web_src_modules_animation_set_.animationset.md#start)

## Constructors

###  constructor

\+ **new AnimationSet**(`config`: any): *[AnimationSet](_packages_hippy_react_web_src_modules_animation_set_.animationset.md)*

*Defined in [packages/hippy-react-web/src/modules/animation-set.ts:14](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/animation-set.ts#L14)*

**Parameters:**

Name | Type |
------ | ------ |
`config` | any |

**Returns:** *[AnimationSet](_packages_hippy_react_web_src_modules_animation_set_.animationset.md)*

## Methods

###  calculateNowValue

▸ **calculateNowValue**(): *any*

*Defined in [packages/hippy-react-web/src/modules/animation-set.ts:115](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/animation-set.ts#L115)*

**Returns:** *any*

___

###  clearAnimationInterval

▸ **clearAnimationInterval**(): *void*

*Defined in [packages/hippy-react-web/src/modules/animation-set.ts:80](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/animation-set.ts#L80)*

**Returns:** *void*

___

###  continueToNextChildAnimation

▸ **continueToNextChildAnimation**(): *void*

*Defined in [packages/hippy-react-web/src/modules/animation-set.ts:145](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/animation-set.ts#L145)*

**Returns:** *void*

___

###  destroy

▸ **destroy**(): *void*

*Defined in [packages/hippy-react-web/src/modules/animation-set.ts:262](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/animation-set.ts#L262)*

Destroy the animation

**Returns:** *void*

___

###  endAnimationSet

▸ **endAnimationSet**(): *void*

*Defined in [packages/hippy-react-web/src/modules/animation-set.ts:127](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/animation-set.ts#L127)*

**Returns:** *void*

___

###  getNowValue

▸ **getNowValue**(): *any*

*Defined in [packages/hippy-react-web/src/modules/animation-set.ts:95](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/animation-set.ts#L95)*

**Returns:** *any*

___

###  initNowAnimationState

▸ **initNowAnimationState**(): *void*

*Defined in [packages/hippy-react-web/src/modules/animation-set.ts:29](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/animation-set.ts#L29)*

**Returns:** *void*

___

###  onAnimationCancel

▸ **onAnimationCancel**(`cb`: [AnimationCallback](../modules/_packages_hippy_react_src_modules_animation_.md#animationcallback)): *void*

*Defined in [packages/hippy-react-web/src/modules/animation-set.ts:299](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/animation-set.ts#L299)*

Call when animation is canceled.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`cb` | [AnimationCallback](../modules/_packages_hippy_react_src_modules_animation_.md#animationcallback) | callback when animation started.  |

**Returns:** *void*

___

###  onAnimationEnd

▸ **onAnimationEnd**(`cb`: [AnimationCallback](../modules/_packages_hippy_react_src_modules_animation_.md#animationcallback)): *void*

*Defined in [packages/hippy-react-web/src/modules/animation-set.ts:291](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/animation-set.ts#L291)*

Call when animation is ended.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`cb` | [AnimationCallback](../modules/_packages_hippy_react_src_modules_animation_.md#animationcallback) | callback when animation started.  |

**Returns:** *void*

___

###  onAnimationRepeat

▸ **onAnimationRepeat**(`cb`: [AnimationCallback](../modules/_packages_hippy_react_src_modules_animation_.md#animationcallback)): *void*

*Defined in [packages/hippy-react-web/src/modules/animation-set.ts:307](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/animation-set.ts#L307)*

Call when animation is repeated.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`cb` | [AnimationCallback](../modules/_packages_hippy_react_src_modules_animation_.md#animationcallback) | callback when animation started.  |

**Returns:** *void*

___

###  onAnimationStart

▸ **onAnimationStart**(`cb`: [AnimationCallback](../modules/_packages_hippy_react_src_modules_animation_.md#animationcallback)): *void*

*Defined in [packages/hippy-react-web/src/modules/animation-set.ts:283](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/animation-set.ts#L283)*

Call when animation started.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`cb` | [AnimationCallback](../modules/_packages_hippy_react_src_modules_animation_.md#animationcallback) | callback when animation started.  |

**Returns:** *void*

___

###  pause

▸ **pause**(): *void*

*Defined in [packages/hippy-react-web/src/modules/animation-set.ts:274](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/animation-set.ts#L274)*

Pause the running animation

**Returns:** *void*

___

###  renderNowValue

▸ **renderNowValue**(`finalValue`: any): *void*

*Defined in [packages/hippy-react-web/src/modules/animation-set.ts:121](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/animation-set.ts#L121)*

**Parameters:**

Name | Type |
------ | ------ |
`finalValue` | any |

**Returns:** *void*

___

###  renderStyleAttribute

▸ **renderStyleAttribute**(`finalValue`: any): *void*

*Defined in [packages/hippy-react-web/src/modules/animation-set.ts:85](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/animation-set.ts#L85)*

**Parameters:**

Name | Type |
------ | ------ |
`finalValue` | any |

**Returns:** *void*

___

###  repeatAnimationSet

▸ **repeatAnimationSet**(): *void*

*Defined in [packages/hippy-react-web/src/modules/animation-set.ts:136](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/animation-set.ts#L136)*

**Returns:** *void*

___

###  repeatChildAnimation

▸ **repeatChildAnimation**(): *void*

*Defined in [packages/hippy-react-web/src/modules/animation-set.ts:150](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/animation-set.ts#L150)*

**Returns:** *void*

___

###  resetState

▸ **resetState**(): *void*

*Defined in [packages/hippy-react-web/src/modules/animation-set.ts:57](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/animation-set.ts#L57)*

**Returns:** *void*

___

###  resume

▸ **resume**(): *void*

*Defined in [packages/hippy-react-web/src/modules/animation-set.ts:216](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/animation-set.ts#L216)*

Resume execution of paused animation

**Returns:** *void*

___

###  setRef

▸ **setRef**(`ref`: any): *void*

*Defined in [packages/hippy-react-web/src/modules/animation-set.ts:62](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/animation-set.ts#L62)*

**Parameters:**

Name | Type |
------ | ------ |
`ref` | any |

**Returns:** *void*

___

###  setStyleAttribute

▸ **setStyleAttribute**(`styleAttribute`: any): *void*

*Defined in [packages/hippy-react-web/src/modules/animation-set.ts:68](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/animation-set.ts#L68)*

**Parameters:**

Name | Type |
------ | ------ |
`styleAttribute` | any |

**Returns:** *void*

___

###  setTransformStyleAttribute

▸ **setTransformStyleAttribute**(`styleAttribute`: any): *void*

*Defined in [packages/hippy-react-web/src/modules/animation-set.ts:74](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/animation-set.ts#L74)*

**Parameters:**

Name | Type |
------ | ------ |
`styleAttribute` | any |

**Returns:** *void*

___

###  start

▸ **start**(): *void*

*Defined in [packages/hippy-react-web/src/modules/animation-set.ts:159](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/animation-set.ts#L159)*

Start animation execution

**Returns:** *void*
