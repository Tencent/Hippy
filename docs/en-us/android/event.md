# Native Events

When the native network is switched, or the horizontal/vertical screen display is switched, the native needs to send some global broadcast events to the front-end, so that the front-end can control the service state according to different states.

# Native Sending

The native calls the code at the place where the events need to be sent.

```java
HippyMap hippyMap = new HippyMap();
hippyMap.pushString("result", "hello i am from native");
mEngineManager.getCurrentEngineContext()
    .getModuleManager()
    .getJavaScriptModule(EventDispatcher.class)
    .receiveNativeEvent("rotate", hippyMap);
```
