# 终端事件

当终端网络切换，或者横竖屏改变的时候，终端需要像前端发送一些全局的广播事件，这样前端可以根据不同的状态来控制业务状态。

---

# 终端发送

终端在需要发送事件的地方调用代码：

```objectivec
// 也可以参考HippyEventObserverModule.m
[self sendEvent: @"rotate" params: @{@"foo":@"bar"}];
- (void)sendEvent:(NSString *)eventName params:(NSDictionary *)params
{
    HippyAssertParam(eventName);
    // 这里的"EventDispatcher"和"receiveNativeEvent"是常量，无需也不能更改
    [self.bridge.eventDispatcher dispatchEvent:@"EventDispatcher" methodName:@"receiveNativeEvent" args:@{@"eventName": eventName, @"extra": params ? : @{}}];
}
```

# 前端接收

这里是向前端发送一个名叫rotate的事件里面有个参数是result，这样就发送到前端去了。然后在前端进行接收处理。

PS: 最新版 Hippy 的监听器添加方法由 `addEventListener` 改为了 `addListener`

```jsx
import { HippyEventEmitter } from '@hippy/react';

let hippyEventEmitter = new HippyEventEmitter();
this.call = hippyEventEmitter.addListener("rotate", (e) => {
    // log结果: { foo: 'bar' }
    console.log(e) ;
});
```

