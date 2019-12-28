[Hippy](../README.md) › [Globals](../globals.md) › ["packages/hippy-react/src/components/web-view"](../modules/_packages_hippy_react_src_components_web_view_.md) › [WebViewProps](_packages_hippy_react_src_components_web_view_.webviewprops.md)

# Interface: WebViewProps

## Hierarchy

* **WebViewProps**

## Index

### Properties

* [method](_packages_hippy_react_src_components_web_view_.webviewprops.md#optional-method)
* [source](_packages_hippy_react_src_components_web_view_.webviewprops.md#source)
* [userAgent](_packages_hippy_react_src_components_web_view_.webviewprops.md#optional-useragent)

### Methods

* [onLoad](_packages_hippy_react_src_components_web_view_.webviewprops.md#optional-onload)
* [onLoadEnd](_packages_hippy_react_src_components_web_view_.webviewprops.md#onloadend)
* [onLoadStart](_packages_hippy_react_src_components_web_view_.webviewprops.md#optional-onloadstart)

## Properties

### `Optional` method

• **method**? : *"get" | "post"*

*Defined in [packages/hippy-react/src/components/web-view.tsx:23](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/web-view.tsx#L23)*

Request method

___

###  source

• **source**: *object*

*Defined in [packages/hippy-react/src/components/web-view.tsx:11](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/web-view.tsx#L11)*

WebView loads url

#### Type declaration:

* **uri**: *string*

___

### `Optional` userAgent

• **userAgent**? : *undefined | string*

*Defined in [packages/hippy-react/src/components/web-view.tsx:18](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/web-view.tsx#L18)*

Custom user agent.

## Methods

### `Optional` onLoad

▸ **onLoad**(`evt`: [LoadEvent](_packages_hippy_react_src_components_web_view_.loadevent.md)): *void*

*Defined in [packages/hippy-react/src/components/web-view.tsx:31](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/web-view.tsx#L31)*

Invoke when web page loaded.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`evt` | [LoadEvent](_packages_hippy_react_src_components_web_view_.loadevent.md) | Load event data |

**Returns:** *void*

___

###  onLoadEnd

▸ **onLoadEnd**(`evt`: [LoadEvent](_packages_hippy_react_src_components_web_view_.loadevent.md)): *void*

*Defined in [packages/hippy-react/src/components/web-view.tsx:47](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/web-view.tsx#L47)*

Invoke when web page load completed

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`evt` | [LoadEvent](_packages_hippy_react_src_components_web_view_.loadevent.md) | Load event data |

**Returns:** *void*

___

### `Optional` onLoadStart

▸ **onLoadStart**(`evt`: [LoadEvent](_packages_hippy_react_src_components_web_view_.loadevent.md)): *void*

*Defined in [packages/hippy-react/src/components/web-view.tsx:39](https://github.com/jeromehan/Hippy/blob/6216275/packages/hippy-react/src/components/web-view.tsx#L39)*

Invoke when web page start to load.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`evt` | [LoadEvent](_packages_hippy_react_src_components_web_view_.loadevent.md) | Load event data |

**Returns:** *void*
