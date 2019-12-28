[Hippy](../README.md) › [Globals](../globals.md) › ["types/hippy"](../modules/_types_hippy_.md) › [Hippy](../modules/_types_hippy_.hippy.md) › [AsyncStorage](_types_hippy_.hippy.asyncstorage.md)

# Interface: AsyncStorage

## Hierarchy

* **AsyncStorage**

## Index

### Methods

* [getAllKeys](_types_hippy_.hippy.asyncstorage.md#getallkeys)
* [getItem](_types_hippy_.hippy.asyncstorage.md#getitem)
* [multiGet](_types_hippy_.hippy.asyncstorage.md#multiget)
* [multiRemove](_types_hippy_.hippy.asyncstorage.md#multiremove)
* [multiSet](_types_hippy_.hippy.asyncstorage.md#multiset)
* [removeItem](_types_hippy_.hippy.asyncstorage.md#removeitem)
* [setItem](_types_hippy_.hippy.asyncstorage.md#setitem)

## Methods

###  getAllKeys

▸ **getAllKeys**(): *Promise‹string[]›*

*Defined in [types/hippy.ts:27](https://github.com/jeromehan/Hippy/blob/6216275/types/hippy.ts#L27)*

**Returns:** *Promise‹string[]›*

___

###  getItem

▸ **getItem**(`key`: string): *Promise‹string›*

*Defined in [types/hippy.ts:28](https://github.com/jeromehan/Hippy/blob/6216275/types/hippy.ts#L28)*

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |

**Returns:** *Promise‹string›*

___

###  multiGet

▸ **multiGet**(`keys`: string[]): *Promise‹string[]›*

*Defined in [types/hippy.ts:29](https://github.com/jeromehan/Hippy/blob/6216275/types/hippy.ts#L29)*

**Parameters:**

Name | Type |
------ | ------ |
`keys` | string[] |

**Returns:** *Promise‹string[]›*

___

###  multiRemove

▸ **multiRemove**(`keys`: string[]): *Promise‹void›*

*Defined in [types/hippy.ts:30](https://github.com/jeromehan/Hippy/blob/6216275/types/hippy.ts#L30)*

**Parameters:**

Name | Type |
------ | ------ |
`keys` | string[] |

**Returns:** *Promise‹void›*

___

###  multiSet

▸ **multiSet**(`keys`: object): *Promise‹void›*

*Defined in [types/hippy.ts:31](https://github.com/jeromehan/Hippy/blob/6216275/types/hippy.ts#L31)*

**Parameters:**

Name | Type |
------ | ------ |
`keys` | object |

**Returns:** *Promise‹void›*

___

###  removeItem

▸ **removeItem**(`key`: string): *Promise‹void›*

*Defined in [types/hippy.ts:32](https://github.com/jeromehan/Hippy/blob/6216275/types/hippy.ts#L32)*

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |

**Returns:** *Promise‹void›*

___

###  setItem

▸ **setItem**(`key`: string, `value`: string | number): *Promise‹void›*

*Defined in [types/hippy.ts:33](https://github.com/jeromehan/Hippy/blob/6216275/types/hippy.ts#L33)*

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |
`value` | string &#124; number |

**Returns:** *Promise‹void›*
