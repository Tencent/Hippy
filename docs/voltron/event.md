# 终端事件

当终端网络切换，或者横竖屏改变的时候，终端需要向前端发送一些全局的广播事件，这样前端可以根据不同的状态来控制业务状态。

---

# 终端发送

```dart
var params = VoltronMap();
params.push<String>("result", "hello i am from native");
// 这里的 context 是 EngineContext，在 module 中可以直接获取到
context
    .moduleManager
    .getJavaScriptModule<EventDispatcher>(enumValueToString(JavaScriptModuleType.EventDispatcher))
    ?.receiveNativeEvent("rotate", params);
```

# 前端接收

!> 最新版 Hippy 的监听器添加方法由 `addEventListener` 改为了 `addListener`

## react

```jsx
import { EventBus } from '@hippy/react';
const rotateCallback = (data) => {
  console.log('rotate data', data && data.orientation);
}
EventBus.on('rotate', rotateCallback)
```

详情查看 [hippy-react](hippy-react/native-event?id=eventbus)

## vue

```js
getApp().$on("rotate", (e) => {
    console.log(e);
});
```

详情查看 [hippy-vue](hippy-vue/native-event?id=事件监听器)

