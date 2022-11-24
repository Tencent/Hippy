# Native Events

When the native network is switched, or the horizontal and vertical screens are changed, the native needs to send some global broadcast events to the Front-End, so that the Front-End can control the service state according to different states.

---

# Native send

```dart
var params = VoltronMap();
params.push<String>("result", "hello i am from native");
// The context here is EngineContext, which can be obtained directly in the module
context
    .moduleManager
    .getJavaScriptModule<EventDispatcher>(enumValueToString(JavaScriptModuleType.EventDispatcher))
    ?.receiveNativeEvent("rotate", params);
```

# Front-End receive

!> The listener addition method of the latest version of Hippy has been changed from `addEventListener` to `addListener`

## react

```jsx
import { EventBus } from '@hippy/react';
const rotateCallback = (data) => {
  console.log('rotate data', data && data.orientation);
}
EventBus.on('rotate', rotateCallback)
```

See [hippy-react](hippy-react/native-event?id=eventbus) for details

## vue

```js
getApp().$on("rotate", (e) => {
    console.log(e);
});
```

See [hippy-vue](hippy-vue/native-event?id=event-listener) for details

