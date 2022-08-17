# Custom Modules

In the development of using Hippy, it is possible that the builtin module won't meet the need of certain circumstances. In this case, you can augment the module by encapsulation or importing some third-party functionalities inside the module.

---

# Module Extension

Module extension mainly including:

1. Extend from `HippyWebModule` class
2. Set the `name` property of the custom `Module`
3. Implement the `Module API` that needs to be exposed to Front-end

The `HippyWebModule` class standardizes the useable modules of HippyWebRenderer, providing context of HippyWebRenderer. There are some important properties in a custom module:

* name: define the name of the custom module, which is corresponding to the `moduleName` when JS application call `callNative(moduleName，methodName)`.
* context: provide a series of methods:
  
```javascript
sendEvent(type: string, params: any); // dispatch an event
sendUiEvent(nodeId: number, type: string, params: any); // dispatch an UI-related event
sendGestureEvent(e: HippyTransferData.NativeGestureEvent); // dispatch an Gesture event
subscribe(evt: string, callback: Function); // listening to an event
getModuleByName(moduleName: string); // get module by module's name
```

## Example

Take CustomModule as an example, let's introduce how to extend a custom Module from beginning

```javascript
import { HippyWebModule } from '@hippy/web-renderer';
// Extends from HippyWebModule
export class CustomModule extends HippyWebModule {
  // Set the name for CustomModule
  name = 'CustomModule';
  // Implement 'getBrowserInfo' and 'setBrowserTitle' APIs, which are used to retrieve the current browser infomation and set the title of browser repectively.
  // When implements the custom module's APIs, the parameters will be like: `function name(arg1,arg2...argn,callBack)`, while all the parameters before the nth one will be the parameters that the application passes into, and the nth parameter will be the callback that passed from application to retrive the return from APIs.
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
   // use callBack.reject(null) if something goes wrong;
  }
}
```
