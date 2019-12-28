[Hippy](../README.md) › [Globals](../globals.md) › ["packages/hippy-react/src/components/text-input"](../modules/_packages_hippy_react_src_components_text_input_.md) › [TextInput](_packages_hippy_react_src_components_text_input_.textinput.md)

# Class: TextInput

A foundational component for inputting text into the app via a keyboard. Props provide
configurability for several features, such as auto-correction, auto-capitalization,
placeholder text, and different keyboard types, such as a numeric keypad.

## Hierarchy

* any

  ↳ **TextInput**

## Index

### Methods

* [blur](_packages_hippy_react_src_components_text_input_.textinput.md#blur)
* [clear](_packages_hippy_react_src_components_text_input_.textinput.md#clear)
* [focus](_packages_hippy_react_src_components_text_input_.textinput.md#focus)
* [getValue](_packages_hippy_react_src_components_text_input_.textinput.md#getvalue)
* [hideInputMethod](_packages_hippy_react_src_components_text_input_.textinput.md#hideinputmethod)
* [setValue](_packages_hippy_react_src_components_text_input_.textinput.md#setvalue)
* [showInputMethod](_packages_hippy_react_src_components_text_input_.textinput.md#showinputmethod)

## Methods

###  blur

▸ **blur**(): *void*

*Defined in [packages/hippy-react/src/components/text-input.tsx:236](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/text-input.tsx#L236)*

Make the `TextInput` blured.

**Returns:** *void*

___

###  clear

▸ **clear**(): *void*

*Defined in [packages/hippy-react/src/components/text-input.tsx:257](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/text-input.tsx#L257)*

Clear the content of `TextInput`

**Returns:** *void*

___

###  focus

▸ **focus**(): *void*

*Defined in [packages/hippy-react/src/components/text-input.tsx:229](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/text-input.tsx#L229)*

Make the `TextInput` focused.

**Returns:** *void*

___

###  getValue

▸ **getValue**(): *Promise‹string›*

*Defined in [packages/hippy-react/src/components/text-input.tsx:209](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/text-input.tsx#L209)*

Get the content of `TextInput`.

**Returns:** *Promise‹string›*

___

###  hideInputMethod

▸ **hideInputMethod**(): *void*

*Defined in [packages/hippy-react/src/components/text-input.tsx:250](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/text-input.tsx#L250)*

Hide the input method selection dialog.

**Returns:** *void*

___

###  setValue

▸ **setValue**(`value`: string): *string*

*Defined in [packages/hippy-react/src/components/text-input.tsx:221](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/text-input.tsx#L221)*

Set the content of `TextInput`.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`value` | string | New content of TextInput |

**Returns:** *string*

___

###  showInputMethod

▸ **showInputMethod**(): *void*

*Defined in [packages/hippy-react/src/components/text-input.tsx:243](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/text-input.tsx#L243)*

Show input method selection dialog.

**Returns:** *void*
