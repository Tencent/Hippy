[Hippy](../README.md) › [Globals](../globals.md) › ["packages/hippy-react/src/components/modal"](../modules/_packages_hippy_react_src_components_modal_.md) › [ModalProps](_packages_hippy_react_src_components_modal_.modalprops.md)

# Interface: ModalProps

## Hierarchy

* **ModalProps**

## Index

### Properties

* [animated](_packages_hippy_react_src_components_modal_.modalprops.md#optional-animated)
* [animationType](_packages_hippy_react_src_components_modal_.modalprops.md#optional-animationtype)
* [autoHideStatusBar](_packages_hippy_react_src_components_modal_.modalprops.md#optional-autohidestatusbar)
* [darkStatusBarText](_packages_hippy_react_src_components_modal_.modalprops.md#optional-darkstatusbartext)
* [immersionStatusBar](_packages_hippy_react_src_components_modal_.modalprops.md#optional-immersionstatusbar)
* [primaryKey](_packages_hippy_react_src_components_modal_.modalprops.md#primarykey)
* [style](_packages_hippy_react_src_components_modal_.modalprops.md#optional-style)
* [supportedOrientations](_packages_hippy_react_src_components_modal_.modalprops.md#optional-supportedorientations)
* [transparent](_packages_hippy_react_src_components_modal_.modalprops.md#optional-transparent)
* [visible](_packages_hippy_react_src_components_modal_.modalprops.md#visible)

### Methods

* [onDismiss](_packages_hippy_react_src_components_modal_.modalprops.md#optional-ondismiss)
* [onOrientationChange](_packages_hippy_react_src_components_modal_.modalprops.md#optional-onorientationchange)
* [onRequestClose](_packages_hippy_react_src_components_modal_.modalprops.md#optional-onrequestclose)
* [onShow](_packages_hippy_react_src_components_modal_.modalprops.md#optional-onshow)

## Properties

### `Optional` animated

• **animated**? : *undefined | false | true*

*Defined in [packages/hippy-react/src/components/modal.tsx:39](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/modal.tsx#L39)*

Enable animation to popup or hide

Default: true

> Deprecated, use animationType to instance of

___

### `Optional` animationType

• **animationType**? : *"none" | "slide" | "fade" | "slide_fade"*

*Defined in [packages/hippy-react/src/components/modal.tsx:67](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/modal.tsx#L67)*

The animation effect when toggle

Default: 'slide'

___

### `Optional` autoHideStatusBar

• **autoHideStatusBar**? : *undefined | false | true*

*Defined in [packages/hippy-react/src/components/modal.tsx:60](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/modal.tsx#L60)*

Hide statusbar texts when Modal is showing

Default: false

___

### `Optional` darkStatusBarText

• **darkStatusBarText**? : *undefined | false | true*

*Defined in [packages/hippy-react/src/components/modal.tsx:45](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/modal.tsx#L45)*

Be text color in statusbar dark theme.
Default: false

___

### `Optional` immersionStatusBar

• **immersionStatusBar**? : *undefined | false | true*

*Defined in [packages/hippy-react/src/components/modal.tsx:53](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/modal.tsx#L53)*

Make the Modal content be under of statusbar.
> Android Only

Default: false

___

###  primaryKey

• **primaryKey**: *string*

*Defined in [packages/hippy-react/src/components/modal.tsx:24](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/modal.tsx#L24)*

Primary key
> iOS only

___

### `Optional` style

• **style**? : *[Style](_types_style_.style.md)*

*Defined in [packages/hippy-react/src/components/modal.tsx:74](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/modal.tsx#L74)*

___

### `Optional` supportedOrientations

• **supportedOrientations**? : *[ModalOrientation](../modules/_packages_hippy_react_src_components_modal_.md#modalorientation)[]*

*Defined in [packages/hippy-react/src/components/modal.tsx:72](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/modal.tsx#L72)*

Modal supports orientations

___

### `Optional` transparent

• **transparent**? : *undefined | false | true*

*Defined in [packages/hippy-react/src/components/modal.tsx:30](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/modal.tsx#L30)*

Background is transparent or not
Default: true

___

###  visible

• **visible**: *boolean*

*Defined in [packages/hippy-react/src/components/modal.tsx:18](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/modal.tsx#L18)*

Show or hide

Default false

## Methods

### `Optional` onDismiss

▸ **onDismiss**(): *void*

*Defined in [packages/hippy-react/src/components/modal.tsx:90](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/modal.tsx#L90)*

Trigger when the Modal will hide

**Returns:** *void*

___

### `Optional` onOrientationChange

▸ **onOrientationChange**(): *void*

*Defined in [packages/hippy-react/src/components/modal.tsx:95](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/modal.tsx#L95)*

Trigger when the device orientation changed.

**Returns:** *void*

___

### `Optional` onRequestClose

▸ **onRequestClose**(): *void*

*Defined in [packages/hippy-react/src/components/modal.tsx:80](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/modal.tsx#L80)*

Trigger when hardware button pressed
> Android Only

**Returns:** *void*

___

### `Optional` onShow

▸ **onShow**(): *void*

*Defined in [packages/hippy-react/src/components/modal.tsx:85](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/modal.tsx#L85)*

Trigger when the Modal will show

**Returns:** *void*
