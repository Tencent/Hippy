[Hippy](../README.md) › [Globals](../globals.md) › ["packages/hippy-react/src/types"](../modules/_packages_hippy_react_src_types_.md) › [LayoutableProps](_packages_hippy_react_src_types_.layoutableprops.md)

# Interface: LayoutableProps

## Hierarchy

* **LayoutableProps**

  ↳ [ViewProps](_packages_hippy_react_src_components_view_.viewprops.md)

  ↳ [TextProps](_packages_hippy_react_src_components_text_.textprops.md)

  ↳ [ImageProps](_packages_hippy_react_src_components_image_.imageprops.md)

  ↳ [TextInputProps](_packages_hippy_react_src_components_text_input_.textinputprops.md)

## Index

### Methods

* [onLayout](_packages_hippy_react_src_types_.layoutableprops.md#optional-onlayout)

## Methods

### `Optional` onLayout

▸ **onLayout**(`evt`: [LayoutEvent](_types_event_.layoutevent.md)): *void*

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
