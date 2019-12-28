[Hippy](../README.md) › [Globals](../globals.md) › ["packages/hippy-react/src/components/text-input"](../modules/_packages_hippy_react_src_components_text_input_.md) › [TextInputProps](_packages_hippy_react_src_components_text_input_.textinputprops.md)

# Interface: TextInputProps

## Hierarchy

* [LayoutableProps](_packages_hippy_react_src_types_.layoutableprops.md)

* [ClickableProps](_packages_hippy_react_src_types_.clickableprops.md)

  ↳ **TextInputProps**

## Index

### Properties

* [autoFocus](_packages_hippy_react_src_components_text_input_.textinputprops.md#optional-autofocus)
* [defaultValue](_packages_hippy_react_src_components_text_input_.textinputprops.md#optional-defaultvalue)
* [editable](_packages_hippy_react_src_components_text_input_.textinputprops.md#optional-editable)
* [keyboardType](_packages_hippy_react_src_components_text_input_.textinputprops.md#optional-keyboardtype)
* [maxLength](_packages_hippy_react_src_components_text_input_.textinputprops.md#optional-maxlength)
* [multiline](_packages_hippy_react_src_components_text_input_.textinputprops.md#optional-multiline)
* [numberOfLines](_packages_hippy_react_src_components_text_input_.textinputprops.md#optional-numberoflines)
* [placeholder](_packages_hippy_react_src_components_text_input_.textinputprops.md#optional-placeholder)
* [placeholderTextColor](_packages_hippy_react_src_components_text_input_.textinputprops.md#optional-placeholdertextcolor)
* [placeholderTextColors](_packages_hippy_react_src_components_text_input_.textinputprops.md#optional-placeholdertextcolors)
* [returnKeyType](_packages_hippy_react_src_components_text_input_.textinputprops.md#optional-returnkeytype)
* [style](_packages_hippy_react_src_components_text_input_.textinputprops.md#style)
* [underlineColorAndroid](_packages_hippy_react_src_components_text_input_.textinputprops.md#optional-underlinecolorandroid)
* [value](_packages_hippy_react_src_components_text_input_.textinputprops.md#optional-value)

### Methods

* [onBlur](_packages_hippy_react_src_components_text_input_.textinputprops.md#optional-onblur)
* [onChangeText](_packages_hippy_react_src_components_text_input_.textinputprops.md#optional-onchangetext)
* [onClick](_packages_hippy_react_src_components_text_input_.textinputprops.md#optional-onclick)
* [onContentSizeChange](_packages_hippy_react_src_components_text_input_.textinputprops.md#optional-oncontentsizechange)
* [onEndEditing](_packages_hippy_react_src_components_text_input_.textinputprops.md#optional-onendediting)
* [onKeyboardWillShow](_packages_hippy_react_src_components_text_input_.textinputprops.md#optional-onkeyboardwillshow)
* [onLayout](_packages_hippy_react_src_components_text_input_.textinputprops.md#optional-onlayout)
* [onLongClick](_packages_hippy_react_src_components_text_input_.textinputprops.md#optional-onlongclick)
* [onSelectionChange](_packages_hippy_react_src_components_text_input_.textinputprops.md#optional-onselectionchange)

## Properties

### `Optional` autoFocus

• **autoFocus**? : *undefined | false | true*

*Defined in [packages/hippy-react/src/components/text-input.tsx:94](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/text-input.tsx#L94)*

If `true`, focuses the input on `componentDidMount`.

Default: false

___

### `Optional` defaultValue

• **defaultValue**? : *undefined | string*

*Defined in [packages/hippy-react/src/components/text-input.tsx:34](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/text-input.tsx#L34)*

Provides an initial value that will change when the user starts typing.
Useful for use-cases where you do not want to deal with listening to events
and updating the value prop to keep the controlled state in sync.

___

### `Optional` editable

• **editable**? : *undefined | false | true*

*Defined in [packages/hippy-react/src/components/text-input.tsx:41](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/text-input.tsx#L41)*

If `false`, text is not editable.

Default: true

___

### `Optional` keyboardType

• **keyboardType**? : *"default" | "numeric" | "password" | "email" | "phone-pad" | "search"*

*Defined in [packages/hippy-react/src/components/text-input.tsx:55](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/text-input.tsx#L55)*

Determines which keyboard to open, e.g.`numeric`.

The following values work across platforms:
* `default`
* `number-pad`
* `decimal-pad`
* `numeric`
* `email-address`
* `phone-pad`
* `search`

___

### `Optional` maxLength

• **maxLength**? : *undefined | number*

*Defined in [packages/hippy-react/src/components/text-input.tsx:73](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/text-input.tsx#L73)*

Limits the maximum number of characters that can be entered.
Use this instead of implementing the logic in JS to avoid flicker.

___

### `Optional` multiline

• **multiline**? : *undefined | false | true*

*Defined in [packages/hippy-react/src/components/text-input.tsx:81](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/text-input.tsx#L81)*

If `true`, the text input can be multiple lines. The default value is `false`.
It is important to note that this aligns the text to the top on iOS,
and centers it on Android. Use with textAlignVertical set to top for the same behavior
in both platforms.

___

### `Optional` numberOfLines

• **numberOfLines**? : *undefined | number*

*Defined in [packages/hippy-react/src/components/text-input.tsx:87](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/text-input.tsx#L87)*

Sets the number of lines for a TextInput.
Use it with multiline set to true to be able to fill the lines.

___

### `Optional` placeholder

• **placeholder**? : *undefined | number*

*Defined in [packages/hippy-react/src/components/text-input.tsx:104](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/text-input.tsx#L104)*

The string that will be rendered before text input has been entered.

___

### `Optional` placeholderTextColor

• **placeholderTextColor**? : *undefined | string*

*Defined in [packages/hippy-react/src/components/text-input.tsx:109](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/text-input.tsx#L109)*

The text color of the placeholder string.

___

### `Optional` placeholderTextColors

• **placeholderTextColors**? : *string[]*

*Defined in [packages/hippy-react/src/components/text-input.tsx:114](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/text-input.tsx#L114)*

The text colors array of the placeholder string.

___

### `Optional` returnKeyType

• **returnKeyType**? : *"done" | "go" | "next" | "search" | "send"*

*Defined in [packages/hippy-react/src/components/text-input.tsx:67](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/text-input.tsx#L67)*

Determines how the return key should look.

The following values work across platforms:
* `done`
* `go`
* `next`
* `search`
* `send`

___

###  style

• **style**: *[Style](_types_style_.style.md)*

*Defined in [packages/hippy-react/src/components/text-input.tsx:116](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/text-input.tsx#L116)*

___

### `Optional` underlineColorAndroid

• **underlineColorAndroid**? : *undefined | string*

*Defined in [packages/hippy-react/src/components/text-input.tsx:99](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/text-input.tsx#L99)*

The color of the `TextInput` underline.

___

### `Optional` value

• **value**? : *undefined | string*

*Defined in [packages/hippy-react/src/components/text-input.tsx:27](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/text-input.tsx#L27)*

The value to show for the text input. TextInput is a controlled component,
which means the native value will be forced to match this value prop if provided.
For most uses, this works great, but in some cases this may cause flickering
- one common cause is preventing edits by keeping value the same.
In addition to setting the same value, either set editable={false},
or set/update maxLength to prevent unwanted edits without flicker.

## Methods

### `Optional` onBlur

▸ **onBlur**(): *void*

*Defined in [packages/hippy-react/src/components/text-input.tsx:121](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/text-input.tsx#L121)*

Callback that is called when the text input is blurred.

**Returns:** *void*

___

### `Optional` onChangeText

▸ **onChangeText**(`text`: string): *void*

*Defined in [packages/hippy-react/src/components/text-input.tsx:134](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/text-input.tsx#L134)*

Callback that is called when the text input's text changes.
Changed text is passed as a single string argument to the callback handler.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`text` | string | Text content.  |

**Returns:** *void*

___

### `Optional` onClick

▸ **onClick**(): *void*

*Inherited from [ClickableProps](_packages_hippy_react_src_types_.clickableprops.md).[onClick](_packages_hippy_react_src_types_.clickableprops.md#optional-onclick)*

*Defined in [packages/hippy-react/src/types.ts:45](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/types.ts#L45)*

Called when the touch is released.

**Returns:** *void*

___

### `Optional` onContentSizeChange

▸ **onContentSizeChange**(`evt`: object): *void*

*Defined in [packages/hippy-react/src/components/text-input.tsx:143](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/text-input.tsx#L143)*

Callback that is called when the text input's content size changes.

**Parameters:**

▪ **evt**: *object*

Content size change event data.

Name | Type |
------ | ------ |
`nativeEvent` | object |

**Returns:** *void*

___

### `Optional` onEndEditing

▸ **onEndEditing**(): *void*

*Defined in [packages/hippy-react/src/components/text-input.tsx:126](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/text-input.tsx#L126)*

Callback that is called when text input ends.

**Returns:** *void*

___

### `Optional` onKeyboardWillShow

▸ **onKeyboardWillShow**(`evt`: [KeyboardWillShowEvent](_packages_hippy_react_src_components_text_input_.keyboardwillshowevent.md)): *void*

*Defined in [packages/hippy-react/src/components/text-input.tsx:153](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/text-input.tsx#L153)*

Callback that is called when keyboard popup

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`evt` | [KeyboardWillShowEvent](_packages_hippy_react_src_components_text_input_.keyboardwillshowevent.md) | Keyboard will show event data. |

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

### `Optional` onSelectionChange

▸ **onSelectionChange**(`evt`: object): *void*

*Defined in [packages/hippy-react/src/components/text-input.tsx:162](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/text-input.tsx#L162)*

Callback that is called when the text input selection is changed.

**Parameters:**

▪ **evt**: *object*

Selection change event data.

Name | Type |
------ | ------ |
`nativeEvent` | object |

**Returns:** *void*
