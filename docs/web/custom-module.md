# Hippy Web Renderer 自定义模块

Hippy开发过程中可能有很多场景使用当前的能力是无法满足的，可能就会需要使用三方库来提供一下额外的能力或者需要对齐终端的自定义模块。这就涉及到如何提供一个自定义模块

# 模块的扩展

接下来将以CustomModule为例，从头介绍如何扩展Module。

扩展模块包括：

* 创建`HippyWebModule`的子类。

* 设置`Moduel`的`name`属性。

* 实现`Module`需要暴露给前端的`api`。

# 扩展HippyWebModule

`HippyWebModule`类，标准化了HippyWebRenderer可使用的模块的标准。提供了一些HippyWebRenderer的上下文。在一个自定义组件中有几个比较重要的属性：

* name：定义了模块的名字，也是跟前端侧使用`callNative(moduleName，methodName)`中的moduleName相映射的
* context：提供了一系列的方法

```javascript
sendEvent(type: string, params: any);//发送事件
sendUiEvent(nodeId: number, type: string, params: any);//发送ui相关事件
sendGestureEvent(e: HippyTransferData.NativeGestureEvent);//发送手势事件
subscribe(evt: string, callback: Function);//监听某个事件
getModuleByName(moduleName: string);//使用模块名获取模块
```

下面这个例子中，我们创建了CustomModule,用来提供一个获取浏览器信息。

第一步：
继承自HippyWebModule。

第二步：
设置Module的name属性。

第三步：
实现API，`getBrowserInfo`和`setBrowserTitle`分别提供了获取当前浏览器的信息和设置浏览器title的功能。在扩展业务模块的提供api时，api的参数为`function name(arg1,arg2...argn,callBack)`，前面的n个参数对应业务侧调用时的传递参数，最后一个`callback`是当业务侧以待回调的形式进行调用时提供的回放结果的接口。

```javascript
import { HippyWebModule } from '@hippy/web-renderer';
export class CustomModule extends HippyWebModule {
  name = 'CustomModule';
  
  getBrowserInfo(callBack){
   let data = {};
   ...
   callBack.resolve(data);
  }
  
  setBrowserTitle(title,callBack){
   if(title) {
     window.document.title = title;
   }
   ...
   callBack.resolve(true);
  }
}
```
