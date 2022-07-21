# 自定义 Web 模块

使用 Hippy 开发过程中，当前的能力可能无法满足一些特定场景，这时候就需要使用第三方库或者通过自定义实现来提供额外的能力，下面就来介绍如何提供一个自定义模块

# 模块的扩展

扩展模块主要包括：

1. 创建 `HippyWebModule` 的子类
2. 设置 `Moduel` 的 `name` 属性
3. 实现 `Module` 需要暴露给前端的 `API`

其中 `HippyWebModule` 类标准化了 HippyWebRenderer 可使用的模块，提供了一些 HippyWebRenderer 的上下文，在一个自定义组件中有几个比较重要的属性：

* name：定义了模块的名字，与 JS 业务侧使用 `callNative(moduleName，methodName)` 中的 `moduleName` 相对应
* context：提供了一系列的方法

```javascript
sendEvent(type: string, params: any); //发送事件
sendUiEvent(nodeId: number, type: string, params: any); // 发送 UI 相关事件
sendGestureEvent(e: HippyTransferData.NativeGestureEvent); // 发送手势事件
subscribe(evt: string, callback: Function); // 监听某个事件
getModuleByName(moduleName: string); // 使用模块名获取模块
```

## 例子

以 CustomModule 为例，从头介绍如何扩展 Module

```javascript
import { HippyWebModule } from '@hippy/web-renderer';
// 继承自 HippyWebModule
export class CustomModule extends HippyWebModule {
  // 设置 Module的 name 属性
  name = 'CustomModule';
  // 实现API `getBrowserInfo` 和 `setBrowserTitle` ，分别提供了获取当前浏览器的信息和设置浏览器 title 的功能。
  // 在提供自定义模块的 api 时，api的参数为 `function name(arg1,arg2...argn,callBack)`，前面的n个参数对应业务侧调用时的传递参数，最后一个 `callback` 是当 JS 业务侧需要有返回值形式的调用时，提供返回结果的回调。
  getBrowserInfo(callBack) {
   let data = {};
   ...
   callBack.resolve(data);
  }
  
  setBrowserTitle(title, callBack) {
   if (title) {
     window.document.title = title;
   };
   ...
   callBack.resolve(true);
   // callBack.reject(null);执行失败时
  }
}
```
