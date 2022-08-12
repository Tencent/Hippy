# Custom UI Components

In the development of using Hippy, it is possible that the builtin components won't meet the need of certain circumstances. In this case, you can augment the UI components by encapsulation or including some third-party functionalities inside the components.

# Components' Extensions

Components' extensions can be achived by following:

1. Extend the custom component from `HippyView` 
2. Implement the class constuctor method
3. Set `tagName` for the custom component
4. Construct `dom` for the custom component
5. Implement `API` for the custom component
6. Implement or define properties for the custom component


The `HippyView` class implements HippyBaseView's interface. There are several essential properties in a custom component:

* id: the unique identifier for every component's instance. This id will assign to component's dom's 'id' property by default. 
* pId: the unique identifier for the parent of every component's instance.
* tagName: this is used to distinguish the type of components, as well as the value that need to be passed into `nativeName` property when application uses this component, where `nativeName` will be used to map the key of the custom component.
* dom: the node that really mount on the document.
* props: it carries the properties and styles passed from application.


## Example

In the following example, we create a custom componet, called `CustomView`, to display a video.

* First, we initialize the component:
  
```javascript

import { HippyView, HippyWebEngine, HippyWebModule } from '@hippy/web-renderer';

// Extends from HippyView
class CustomView extends HippyView {
  // Implement the class constuctor method
  constructor(context,id,pId) {
    super(context,id,pId);
    // Set the tagName as 'CustomView'
    // Such that the JS application can set `nativeName="CustomView"` to create a mapping from application to this component.
    this.tagName = 'CustomView';
    // Contruct the dom for the custom component. We create a video element and assign it to the class member 'dom'. Notice that the class member 'dom' need to be set before the end of constructor method. 
    this.dom = document.createElement('video'); 
  }
}

```

* Second, we can implement the API and related properties for the custom component:

We implement the getter and setter for property `src`. When JS application modify the property `src`, the setter `set src()` will be triggered and retrive the new `src` value. 

We also implement `play` and `pause` class methods. When JS application use `callUIFunction(this.instance, 'play'/'pause', []);`, these two method will be called respectively.

In the `pasue()` method, we use `sendUiEvent` to emit a `onPause` event to JS application, those callbacks that subcribe to `onPause` event will be triggered.


```javascript

import { HippyView, HippyWebEngine, HippyWebModule } from '@hippy/web-renderer';

class CustomView extends HippyView {
  
   set src(value) {
     this.dom.src = value;
   } 
   
   get src() {
    return this.props['src'];
   }
    
   play() {
    this.dom.play();
   }
   
   pause() {
    this.dom.pause();
    this.context.sendUiEvent(this.id, 'onPause', {});
   }
}

```

> About `props`: By default, the low-level implementation of `HippyWebRenderer` will store `props` that passed from application into the custom component's `props`, then triggering the setter for updated `props`, and the components will have timing for updating its states, such that executing some desired behaviors. 
There is a `style` object inside the `props`, which will carry the styles passed from application. By default, this `style` object will also be assigned to the custom component's `dom`'s `style` property by `HippyWebRenderer`. However, since certain properties in `style` object from `props` are hippy-only, hence the `style` object need to be translated before assigning it to the `dom`'s `style` property.

> About `context`: A `context` object will be passed into the custom component when the custom component is constructing. It provides some key methods:

```javascript
export interface ComponentContext {
     sendEvent: (type: string, params: any) => void; // emit global event to the the application
     sendUiEvent: (id: number, type: string, params: any) => void; // emit event to certain component's instance
     sendGestureEvent: (e: HippyTransferData.NativeGestureEvent) => void; // emit gesture event
     subscribe: (evt: string, callback: Function) => void; // subcribe to particular event
     getModuleByName: (moduleName: string) => any; // retrieve module instance by module's name
}
```


# Complicated Components

Sometime we may want to provide a container to wrap the existing components. This container will have some particular form or behaviors, such as managing it own node insertion and deleteion, or modifying style by intercepting properties. In this kind of cases, we need to use more complicate ways to implement these custom components.


* By defalut, `HippyWebRender` will assume the custom components' `dom` use the same method as Web standard:

```javascript
Node.insertBefore<T extends Node>(node: T, child: Node | null): T;
Node.removeChild<T extends Node>(child: T): T;
```

* By implementing the `insertChild` and `removeChild` methods, you can manage your own way and logic to handle node insertion and deletion.

```javascript
class CustomView extends HippyView{
    insertChild (child: HippyBaseView, childPosition: number) {
        ...
    }
    removeChild (child: HippyBaseView){
        ...
   }
}
```

* To intercept the update of `props`, you need to implement the custom component's `updateProps` method.

> In the belowing example, `data` parameter is the real data of updated `props`, where `defaultProcess()` is `HippyWebRenderer`'s default method to update the `props`. Developers can intercept the updating process by modifying the `data` or replacing the `defaultProcess()` method.


```javascript
class CustomView extends HippyView{
    
    updateProps (data: UIProps, defaultProcess: (component: HippyBaseView, data: UIProps) => void) {
      ...
    }
}
```
