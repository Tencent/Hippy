[Hippy](../README.md) › [Globals](../globals.md) › ["packages/hippy-react/src/components/text"](../modules/_packages_hippy_react_src_components_text_.md) › [TextProps](_packages_hippy_react_src_components_text_.textprops.md)

# Interface: TextProps

## Hierarchy

* [LayoutableProps](_packages_hippy_react_src_types_.layoutableprops.md)

* [ClickableProps](_packages_hippy_react_src_types_.clickableprops.md)

  ↳ **TextProps**

## Index

### Properties

* [children](_packages_hippy_react_src_components_text_.textprops.md#children)
* [ellipsizeMode](_packages_hippy_react_src_components_text_.textprops.md#ellipsizemode)
* [numberOfLines](_packages_hippy_react_src_components_text_.textprops.md#optional-numberoflines)
* [opacity](_packages_hippy_react_src_components_text_.textprops.md#opacity)
* [style](_packages_hippy_react_src_components_text_.textprops.md#optional-style)
* [text](_packages_hippy_react_src_components_text_.textprops.md#optional-text)

### Methods

* [onClick](_packages_hippy_react_src_components_text_.textprops.md#optional-onclick)
* [onLayout](_packages_hippy_react_src_components_text_.textprops.md#optional-onlayout)
* [onLongClick](_packages_hippy_react_src_components_text_.textprops.md#optional-onlongclick)

## Properties

###  children

• **children**: *number | string | string[]*

*Defined in [packages/hippy-react/src/components/text.tsx:41](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/text.tsx#L41)*

___

###  ellipsizeMode

• **ellipsizeMode**: *"head" | "middle" | "tail" | "clip"*

*Defined in [packages/hippy-react/src/components/text.tsx:40](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/text.tsx#L40)*

When numberOfLines is set, this prop defines how text will be truncated.
numberOfLines must be set in conjunction with this prop.
This can be one of the following values:

* head - The line is displayed so that the end fits in the container
         and the missing text at the beginning of the line is indicated by an ellipsis glyph.
         e.g., "...wxyz
* middle - The line is displayed so that the beginning and
           end fit in the container and the missing text in the middle is indicated
           by an ellipsis glyph.
           e.g., "ab...yz"
* tail - The line is displayed so that the beginning fits in the container
         and the missing text at the end of the line is indicated by an ellipsis glyph.
         e.g., "abcd..."
* clip - Lines are not drawn past the edge of the text container.

The default is `tail`.

___

### `Optional` numberOfLines

• **numberOfLines**? : *undefined | number*

*Defined in [packages/hippy-react/src/components/text.tsx:14](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/text.tsx#L14)*

Used to truncate the text with an ellipsis after computing the text layout,
including line wrapping, such that the total number of lines does not exceed this number.
This prop is commonly used with `ellipsizeMode`.

___

###  opacity

• **opacity**: *number*

*Defined in [packages/hippy-react/src/components/text.tsx:19](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/text.tsx#L19)*

Determines what the opacity of the wrapped view.

___

### `Optional` style

• **style**? : *[Style](_types_style_.style.md) | [Style](_types_style_.style.md)[]*

*Defined in [packages/hippy-react/src/components/text.tsx:43](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/text.tsx#L43)*

___

### `Optional` text

• **text**? : *undefined | string*

*Defined in [packages/hippy-react/src/components/text.tsx:42](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/text.tsx#L42)*

## Methods

### `Optional` onClick

▸ **onClick**(): *void*

*Inherited from [ClickableProps](_packages_hippy_react_src_types_.clickableprops.md).[onClick](_packages_hippy_react_src_types_.clickableprops.md#optional-onclick)*

*Defined in [packages/hippy-react/src/types.ts:45](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/types.ts#L45)*

Called when the touch is released.

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
