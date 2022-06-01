## Hippy Web Renderer 自定义模块
Hippy开发过程中可能有很多场景使用当前的能力是无法满足的，可能就会需要使用三方库来提供一下额外的能力或者需要对齐终端的自定义模块的提供。这就涉及到如何
自定义模块
### 模块的扩展
接下来将以CustomModule为例，从头介绍如何扩展Module。

扩展模块包括：

* 创建`HippyWebModule`的子类。

* 设置Moduel的name属性。

* 实现Moduel需要暴露给前端的api。
### 扩展HippyWebModule
HippyWebModule类，标准化了HippyWebRender可使用的模块的标准。提供了一些HippyWebRender的上下文。在一个自定义组件中有几个比较重要的属性：
* name:定义了模块的名字，也是跟前端侧使用`callNative(moduleName，methodName)`中的moduleName相映射的
* context:提供了一系列的方法
```typescript
sendEvent(type: string, params: any);//发送事件
sendUiEvent(nodeId: number, type: string, params: any);//发送ui相关事件
sendGestureEvent(e: HippyTransferData.NativeGestureEvent);//发送手势事件
subscribe(evt: string, callback: Function);//监听某个事件
getModuleByName(moduleName: string);//使用模块名获取模块
```
下面这个例子中，我们创建了CustomModule,用来提供一个获取浏览器信息。
第一步：
继承自HippyWebModule。
设置Module的name属性
实现API
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
