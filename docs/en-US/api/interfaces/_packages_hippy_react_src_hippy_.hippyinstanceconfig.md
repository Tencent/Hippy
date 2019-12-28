[Hippy](../README.md) › [Globals](../globals.md) › ["packages/hippy-react/src/hippy"](../modules/_packages_hippy_react_src_hippy_.md) › [HippyInstanceConfig](_packages_hippy_react_src_hippy_.hippyinstanceconfig.md)

# Interface: HippyInstanceConfig

## Hierarchy

* **HippyInstanceConfig**

## Index

### Properties

* [appName](_packages_hippy_react_src_hippy_.hippyinstanceconfig.md#appname)
* [callback](_packages_hippy_react_src_hippy_.hippyinstanceconfig.md#optional-callback)
* [entryPage](_packages_hippy_react_src_hippy_.hippyinstanceconfig.md#entrypage)
* [silent](_packages_hippy_react_src_hippy_.hippyinstanceconfig.md#optional-silent)

## Properties

###  appName

• **appName**: *string*

*Defined in [packages/hippy-react/src/hippy.ts:19](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/hippy.ts#L19)*

Hippy app name, it's will register to `__GLOBAL__.appRegister` object,
waiting the native load instance event for start the app.

___

### `Optional` callback

• **callback**? : *undefined | function*

*Defined in [packages/hippy-react/src/hippy.ts:34](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/hippy.ts#L34)*

The callback after rendering.

___

###  entryPage

• **entryPage**: *string | FunctionComponent‹any› | ComponentClass‹any, any›*

*Defined in [packages/hippy-react/src/hippy.ts:24](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/hippy.ts#L24)*

Entry component of Hippy app.

___

### `Optional` silent

• **silent**? : *undefined | false | true*

*Defined in [packages/hippy-react/src/hippy.ts:29](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/hippy.ts#L29)*

Disable trace output
