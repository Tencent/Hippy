[Hippy](../README.md) › [Globals](../globals.md) › ["packages/hippy-react/src/modules/network-module"](_packages_hippy_react_src_modules_network_module_.md)

# External module: "packages/hippy-react/src/modules/network-module"

## Index

### Functions

* [getCookies](_packages_hippy_react_src_modules_network_module_.md#getcookies)
* [setCookie](_packages_hippy_react_src_modules_network_module_.md#setcookie)

## Functions

###  getCookies

▸ **getCookies**(`url`: string): *Promise‹string›*

*Defined in [packages/hippy-react/src/modules/network-module.ts:8](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/network-module.ts#L8)*

Get cookies from url

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`url` | string | Specific url for cookie  |

**Returns:** *Promise‹string›*

___

###  setCookie

▸ **setCookie**(`url`: string, `keyValue`: string, `expires`: string | Date): *void*

*Defined in [packages/hippy-react/src/modules/network-module.ts:19](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/modules/network-module.ts#L19)*

Set cookie to url

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`url` | string | Specific url for cookie. |
`keyValue` | string | Cookie key and value string, split with `:`. |
`expires` | string &#124; Date | - |

**Returns:** *void*
