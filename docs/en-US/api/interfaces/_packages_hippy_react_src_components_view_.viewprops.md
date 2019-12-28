[Hippy](../README.md) › [Globals](../globals.md) › ["packages/hippy-react/src/components/view"](../modules/_packages_hippy_react_src_components_view_.md) › [ViewProps](_packages_hippy_react_src_components_view_.viewprops.md)

# Interface: ViewProps

## Hierarchy

* [LayoutableProps](_packages_hippy_react_src_types_.layoutableprops.md)

* [ClickableProps](_packages_hippy_react_src_types_.clickableprops.md)

* [TouchableProps](_packages_hippy_react_src_types_.touchableprops.md)

  ↳ **ViewProps**

## Index

### Properties

* [accessibilityLabel](_packages_hippy_react_src_components_view_.viewprops.md#optional-accessibilitylabel)
* [accessible](_packages_hippy_react_src_components_view_.viewprops.md#optional-accessible)
* [collapsable](_packages_hippy_react_src_components_view_.viewprops.md#optional-collapsable)
* [focusable](_packages_hippy_react_src_components_view_.viewprops.md#optional-focusable)
* [nextFocusDownId](_packages_hippy_react_src_components_view_.viewprops.md#optional-nextfocusdownid)
* [nextFocusLeftId](_packages_hippy_react_src_components_view_.viewprops.md#optional-nextfocusleftid)
* [nextFocusRightId](_packages_hippy_react_src_components_view_.viewprops.md#optional-nextfocusrightid)
* [nextFocusUpId](_packages_hippy_react_src_components_view_.viewprops.md#optional-nextfocusupid)
* [overflow](_packages_hippy_react_src_components_view_.viewprops.md#optional-overflow)
* [requestFocus](_packages_hippy_react_src_components_view_.viewprops.md#optional-requestfocus)
* [style](_packages_hippy_react_src_components_view_.viewprops.md#optional-style)

### Methods

* [onClick](_packages_hippy_react_src_components_view_.viewprops.md#optional-onclick)
* [onFocus](_packages_hippy_react_src_components_view_.viewprops.md#optional-onfocus)
* [onLayout](_packages_hippy_react_src_components_view_.viewprops.md#optional-onlayout)
* [onLongClick](_packages_hippy_react_src_components_view_.viewprops.md#optional-onlongclick)
* [onTouchCancel](_packages_hippy_react_src_components_view_.viewprops.md#optional-ontouchcancel)
* [onTouchDown](_packages_hippy_react_src_components_view_.viewprops.md#optional-ontouchdown)
* [onTouchEnd](_packages_hippy_react_src_components_view_.viewprops.md#optional-ontouchend)
* [onTouchMove](_packages_hippy_react_src_components_view_.viewprops.md#optional-ontouchmove)

## Properties

### `Optional` accessibilityLabel

• **accessibilityLabel**? : *undefined | string*

*Defined in [packages/hippy-react/src/components/view.tsx:15](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/view.tsx#L15)*

Overrides the text that's read by the screen reader when the user interacts with the element.
By default, the label is constructed by traversing all the children and accumulating
all the Text nodes separated by space.

___

### `Optional` accessible

• **accessible**? : *undefined | false | true*

*Defined in [packages/hippy-react/src/components/view.tsx:21](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/view.tsx#L21)*

When `true`, indicates that the view is an accessibility element.
By default, all the touchable elements are accessible.

___

### `Optional` collapsable

• **collapsable**? : *undefined | false*

*Defined in [packages/hippy-react/src/components/view.tsx:29](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/view.tsx#L29)*

Views that are only used to layout their children or otherwise don't draw anything may be
automatically removed from the native hierarchy as an optimization.
Set this property to `false` to disable this optimization
and ensure that this `View` exists in the native view hierarchy.

___

### `Optional` focusable

• **focusable**? : *undefined | false | true*

*Defined in [packages/hippy-react/src/components/view.tsx:37](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/view.tsx#L37)*

___

### `Optional` nextFocusDownId

• **nextFocusDownId**? : *string | Fiber*

*Defined in [packages/hippy-react/src/components/view.tsx:39](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/view.tsx#L39)*

___

### `Optional` nextFocusLeftId

• **nextFocusLeftId**? : *string | Fiber*

*Defined in [packages/hippy-react/src/components/view.tsx:41](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/view.tsx#L41)*

___

### `Optional` nextFocusRightId

• **nextFocusRightId**? : *string | Fiber*

*Defined in [packages/hippy-react/src/components/view.tsx:42](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/view.tsx#L42)*

___

### `Optional` nextFocusUpId

• **nextFocusUpId**? : *string | Fiber*

*Defined in [packages/hippy-react/src/components/view.tsx:40](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/view.tsx#L40)*

___

### `Optional` overflow

• **overflow**? : *"visible" | "hidden"*

*Defined in [packages/hippy-react/src/components/view.tsx:36](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/view.tsx#L36)*

Specifies what should happen if content overflows an container's box.

Default: iOS is 'visible', android is 'hidden'.

___

### `Optional` requestFocus

• **requestFocus**? : *undefined | false | true*

*Defined in [packages/hippy-react/src/components/view.tsx:38](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/view.tsx#L38)*

___

### `Optional` style

• **style**? : *[Style](_types_style_.style.md)*

*Defined in [packages/hippy-react/src/components/view.tsx:43](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/view.tsx#L43)*

## Methods

### `Optional` onClick

▸ **onClick**(): *void*

*Inherited from [ClickableProps](_packages_hippy_react_src_types_.clickableprops.md).[onClick](_packages_hippy_react_src_types_.clickableprops.md#optional-onclick)*

*Defined in [packages/hippy-react/src/types.ts:45](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/types.ts#L45)*

Called when the touch is released.

**Returns:** *void*

___

### `Optional` onFocus

▸ **onFocus**(`evt`: [FocusEvent](_types_event_.focusevent.md)): *void*

*Defined in [packages/hippy-react/src/components/view.tsx:51](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/view.tsx#L51)*

The focus event occurs when the component is focused.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`evt` | [FocusEvent](_types_event_.focusevent.md) | Focus event data |

**Returns:** *void*

___

### `Optional` onLayout

▸ **onLayout**(`evt`: [LayoutEvent](_types_event_.layoutevent.md)): *void*

*Inherited from [LayoutableProps](_packages_hippy_react_src_types_.layoutableprops.md).[onLayout](_packages_hippy_react_src_types_.layoutableprops.md#optional-onlayout)*

*Defined in [packages/hippy-react/src/types.ts:38](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/types.ts#L38)*

Invoked on mount and layout changes with:

`{nativeEvent: { layout: {x, y, width, height}}}`

This event is fired immediately once the layout has been calculated,
but the new layout may not yet be reflected on the screen
at the time the event is received, especially if a layout animation is in progress.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`evt` | [LayoutEvent](_types_event_.layoutevent.md) | Layout event data |

**Returns:** *void*

___

### `Optional` onLongClick

▸ **onLongClick**(): *void*

*Inherited from [ClickableProps](_packages_hippy_react_src_types_.clickableprops.md).[onLongClick](_packages_hippy_react_src_types_.clickableprops.md#optional-onlongclick)*

*Defined in [packages/hippy-react/src/types.ts:50](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/types.ts#L50)*

Called when the touch with longer than about 1s is released.

**Returns:** *void*

___

### `Optional` onTouchCancel

▸ **onTouchCancel**(`evt`: TouchEvent): *void*

*Inherited from [TouchableProps](_packages_hippy_react_src_types_.touchableprops.md).[onTouchCancel](_packages_hippy_react_src_types_.touchableprops.md#optional-ontouchcancel)*

*Defined in [packages/hippy-react/src/types.ts:90](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/types.ts#L90)*

The touchcancel event occurs when the touch event gets interrupted.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`evt` | TouchEvent | Touch event data |

**Returns:** *void*

___

### `Optional` onTouchDown

▸ **onTouchDown**(`evt`: TouchEvent): *void*

*Inherited from [TouchableProps](_packages_hippy_react_src_types_.touchableprops.md).[onTouchDown](_packages_hippy_react_src_types_.touchableprops.md#optional-ontouchdown)*

*Defined in [packages/hippy-react/src/types.ts:62](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/types.ts#L62)*

The touchdown event occurs when the user touches an component.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`evt` | TouchEvent | Touch event data |

**Returns:** *void*

___

### `Optional` onTouchEnd

▸ **onTouchEnd**(`evt`: TouchEvent): *void*

*Inherited from [TouchableProps](_packages_hippy_react_src_types_.touchableprops.md).[onTouchEnd](_packages_hippy_react_src_types_.touchableprops.md#optional-ontouchend)*

*Defined in [packages/hippy-react/src/types.ts:81](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/types.ts#L81)*

The touchend event occurs when the user removes the finger from an component.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`evt` | TouchEvent | Touch event data |

**Returns:** *void*

___

### `Optional` onTouchMove

▸ **onTouchMove**(`evt`: TouchEvent): *void*

*Inherited from [TouchableProps](_packages_hippy_react_src_types_.touchableprops.md).[onTouchMove](_packages_hippy_react_src_types_.touchableprops.md#optional-ontouchmove)*

*Defined in [packages/hippy-react/src/types.ts:72](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/types.ts#L72)*

The touchmove event occurs when the user moves the finger across the screen.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`evt` | TouchEvent | Touch event data |

**Returns:** *void*
