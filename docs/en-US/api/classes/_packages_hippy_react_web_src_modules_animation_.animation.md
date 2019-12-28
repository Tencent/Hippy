[Hippy](../README.md) › [Globals](../globals.md) › ["packages/hippy-react-web/src/modules/animation"](../modules/_packages_hippy_react_web_src_modules_animation_.md) › [Animation](_packages_hippy_react_web_src_modules_animation_.animation.md)

# Class: Animation

## Hierarchy

* **Animation**

## Index

### Constructors

* [constructor](_packages_hippy_react_web_src_modules_animation_.animation.md#constructor)

### Methods

* [calculateNowValue](_packages_hippy_react_web_src_modules_animation_.animation.md#calculatenowvalue)
* [clearAnimationInterval](_packages_hippy_react_web_src_modules_animation_.animation.md#clearanimationinterval)
* [destroy](_packages_hippy_react_web_src_modules_animation_.animation.md#destroy)
* [endAnimation](_packages_hippy_react_web_src_modules_animation_.animation.md#endanimation)
* [getNowValue](_packages_hippy_react_web_src_modules_animation_.animation.md#getnowvalue)
* [initNowAnimationState](_packages_hippy_react_web_src_modules_animation_.animation.md#initnowanimationstate)
* [onAnimationCancel](_packages_hippy_react_web_src_modules_animation_.animation.md#onanimationcancel)
* [onAnimationEnd](_packages_hippy_react_web_src_modules_animation_.animation.md#onanimationend)
* [onAnimationRepeat](_packages_hippy_react_web_src_modules_animation_.animation.md#onanimationrepeat)
* [onAnimationStart](_packages_hippy_react_web_src_modules_animation_.animation.md#onanimationstart)
* [pause](_packages_hippy_react_web_src_modules_animation_.animation.md#pause)
* [renderNowValue](_packages_hippy_react_web_src_modules_animation_.animation.md#rendernowvalue)
* [renderStyleAttribute](_packages_hippy_react_web_src_modules_animation_.animation.md#renderstyleattribute)
* [repeatAnimation](_packages_hippy_react_web_src_modules_animation_.animation.md#repeatanimation)
* [resetState](_packages_hippy_react_web_src_modules_animation_.animation.md#resetstate)
* [resume](_packages_hippy_react_web_src_modules_animation_.animation.md#resume)
* [setRef](_packages_hippy_react_web_src_modules_animation_.animation.md#setref)
* [setStyleAttribute](_packages_hippy_react_web_src_modules_animation_.animation.md#setstyleattribute)
* [setTransformStyleAttribute](_packages_hippy_react_web_src_modules_animation_.animation.md#settransformstyleattribute)
* [start](_packages_hippy_react_web_src_modules_animation_.animation.md#start)
* [updateAnimation](_packages_hippy_react_web_src_modules_animation_.animation.md#updateanimation)

## Constructors

###  constructor

\+ **new Animation**(`config`: any): *[Animation](_packages_hippy_react_web_src_modules_animation_.animation.md)*

*Defined in [packages/hippy-react-web/src/modules/animation.ts:12](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/animation.ts#L12)*

**Parameters:**

Name | Type |
------ | ------ |
`config` | any |

**Returns:** *[Animation](_packages_hippy_react_web_src_modules_animation_.animation.md)*

## Methods

###  calculateNowValue

▸ **calculateNowValue**(): *any*

*Defined in [packages/hippy-react-web/src/modules/animation.ts:110](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/animation.ts#L110)*

**Returns:** *any*

___

###  clearAnimationInterval

▸ **clearAnimationInterval**(): *void*

*Defined in [packages/hippy-react-web/src/modules/animation.ts:63](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/animation.ts#L63)*

**Returns:** *void*

___

###  destroy

▸ **destroy**(): *void*

*Defined in [packages/hippy-react-web/src/modules/animation.ts:186](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/animation.ts#L186)*

Destroy the animation

**Returns:** *void*

___

###  endAnimation

▸ **endAnimation**(): *void*

*Defined in [packages/hippy-react-web/src/modules/animation.ts:121](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/animation.ts#L121)*

**Returns:** *void*

___

###  getNowValue

▸ **getNowValue**(): *any*

*Defined in [packages/hippy-react-web/src/modules/animation.ts:90](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/animation.ts#L90)*

**Returns:** *any*

___

###  initNowAnimationState

▸ **initNowAnimationState**(`config`: any): *void*

*Defined in [packages/hippy-react-web/src/modules/animation.ts:21](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/animation.ts#L21)*

**Parameters:**

Name | Type |
------ | ------ |
`config` | any |

**Returns:** *void*

___

###  onAnimationCancel

▸ **onAnimationCancel**(`cb`: [AnimationCallback](../modules/_packages_hippy_react_src_modules_animation_.md#animationcallback)): *void*

*Defined in [packages/hippy-react-web/src/modules/animation.ts:297](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/animation.ts#L297)*

Call when animation is canceled.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`cb` | [AnimationCallback](../modules/_packages_hippy_react_src_modules_animation_.md#animationcallback) | callback when animation started.  |

**Returns:** *void*

___

###  onAnimationEnd

▸ **onAnimationEnd**(`cb`: [AnimationCallback](../modules/_packages_hippy_react_src_modules_animation_.md#animationcallback)): *void*

*Defined in [packages/hippy-react-web/src/modules/animation.ts:289](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/animation.ts#L289)*

Call when animation is ended.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`cb` | [AnimationCallback](../modules/_packages_hippy_react_src_modules_animation_.md#animationcallback) | callback when animation started.  |

**Returns:** *void*

___

###  onAnimationRepeat

▸ **onAnimationRepeat**(`cb`: [AnimationCallback](../modules/_packages_hippy_react_src_modules_animation_.md#animationcallback)): *void*

*Defined in [packages/hippy-react-web/src/modules/animation.ts:305](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/animation.ts#L305)*

Call when animation is repeated.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`cb` | [AnimationCallback](../modules/_packages_hippy_react_src_modules_animation_.md#animationcallback) | callback when animation started.  |

**Returns:** *void*

___

###  onAnimationStart

▸ **onAnimationStart**(`cb`: [AnimationCallback](../modules/_packages_hippy_react_src_modules_animation_.md#animationcallback)): *void*

*Defined in [packages/hippy-react-web/src/modules/animation.ts:281](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/animation.ts#L281)*

Call when animation started.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`cb` | [AnimationCallback](../modules/_packages_hippy_react_src_modules_animation_.md#animationcallback) | callback when animation started.  |

**Returns:** *void*

___

###  pause

▸ **pause**(): *void*

*Defined in [packages/hippy-react-web/src/modules/animation.ts:198](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/animation.ts#L198)*

Pause the running animation

**Returns:** *void*

___

###  renderNowValue

▸ **renderNowValue**(`finalValue`: any): *void*

*Defined in [packages/hippy-react-web/src/modules/animation.ts:116](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/animation.ts#L116)*

**Parameters:**

Name | Type |
------ | ------ |
`finalValue` | any |

**Returns:** *void*

___

###  renderStyleAttribute

▸ **renderStyleAttribute**(`finalValue`: any): *void*

*Defined in [packages/hippy-react-web/src/modules/animation.ts:73](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/animation.ts#L73)*

**Parameters:**

Name | Type |
------ | ------ |
`finalValue` | any |

**Returns:** *void*

___

###  repeatAnimation

▸ **repeatAnimation**(): *void*

*Defined in [packages/hippy-react-web/src/modules/animation.ts:131](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/animation.ts#L131)*

**Returns:** *void*

___

###  resetState

▸ **resetState**(): *void*

*Defined in [packages/hippy-react-web/src/modules/animation.ts:68](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/animation.ts#L68)*

**Returns:** *void*

___

###  resume

▸ **resume**(): *void*

*Defined in [packages/hippy-react-web/src/modules/animation.ts:206](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/animation.ts#L206)*

Resume execution of paused animation

**Returns:** *void*

___

###  setRef

▸ **setRef**(`ref`: any): *void*

*Defined in [packages/hippy-react-web/src/modules/animation.ts:45](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/animation.ts#L45)*

**Parameters:**

Name | Type |
------ | ------ |
`ref` | any |

**Returns:** *void*

___

###  setStyleAttribute

▸ **setStyleAttribute**(`styleAttribute`: any): *void*

*Defined in [packages/hippy-react-web/src/modules/animation.ts:51](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/animation.ts#L51)*

**Parameters:**

Name | Type |
------ | ------ |
`styleAttribute` | any |

**Returns:** *void*

___

###  setTransformStyleAttribute

▸ **setTransformStyleAttribute**(`styleAttribute`: any): *void*

*Defined in [packages/hippy-react-web/src/modules/animation.ts:57](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/animation.ts#L57)*

**Parameters:**

Name | Type |
------ | ------ |
`styleAttribute` | any |

**Returns:** *void*

___

###  start

▸ **start**(): *void*

*Defined in [packages/hippy-react-web/src/modules/animation.ts:143](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/animation.ts#L143)*

Start animation execution

**Returns:** *void*

___

###  updateAnimation

▸ **updateAnimation**(`param`: any): *void*

*Defined in [packages/hippy-react-web/src/modules/animation.ts:242](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react-web/src/modules/animation.ts#L242)*

Update to new animation scheme

**Parameters:**

Name | Type |
------ | ------ |
`param` | any |

**Returns:** *void*
