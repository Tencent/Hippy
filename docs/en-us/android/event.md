# 终端事件

当终端网络切换，或者横竖屏改变的时候，终端需要像前端发送一些全局的广播事件，这样前端可以根据不同的状态来控制业务状态。

# 终端发送

终端在需要发送事件的地方调用代码：

```java
HippyMap hippyMap = new HippyMap();
hippyMap.pushString("result", "hello i am from native");
mEngineManager.getCurrentEngineContext()
    .getModuleManager()
    .getJavaScriptModule(EventDispatcher.class)
    .receiveNativeEvent("rotate", hippyMap);
```
