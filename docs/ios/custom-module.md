# 定制模块

除了UI界面以外，APP开发中还会出现调用设备功能的场景，比如获取当前网络状态、发起HTTP网络请求等。SDK已经封装了一些常用功能，但自定义功能模块也是十分方便的。

> **注意：自定义模块的名称和方法中不要带上 `Hippy` 几个字（不区分大小写），否则在 iOS 上可能会碰到找不到模块或方法的问题。**

> 功能扩展中类和方法的导出和UI组件的类和方法的导出十分相似，建议先阅读UI组件扩展再来阅读功能扩展文章。

---

<!-- toc -->

使用`HIPPY_EXPORT_MODULE()`扩展自定义功能后，每次APP启动时都会创建一个功能实例，并且以后前端调用组件功能使用的都是这个实例，可以理解为单例的意思。
>功能没有属性这个概念，不要试图去给功能绑定属性。

每个功能都有类似于UI组件对应的方法导出, 同样也对应callNative、callNativeWithCallbackId、callNativeWithPromise三分钟调用方式。

我们将SDK中的功能模块分为两种类型：

* 非事件型功能--当业务需要某种信息或者需要终端执行某项指令，直接通过接口调用终端代码即可。
* 事件型功能--业务需要终端监听某个事件。当事件触发时，终端通知前端。

# 非事件型功能扩展

扩展一个非事件型功能组件包括以下工作：

* 创建对应的功能类，并绑定前端组件，
    >非事件型功能只需要继承自简单的NSObject类即可。在实现文件中使用`HIPPY_EXPORT_MODULE()`宏导出。
* 绑定前端方法
    >与扩展UI组件类似，使用`HIPPY_EXPORT_METHOD()`宏绑定前端方法。注意方法名需要对齐。

TestModule.h

```objectivec
@interface TestModule : NSObject <HippyBridgeModule>
@end
```

TestModule.m

``` objectivec
@implementation TestModule
HIPPY_EXPORT_MODULE()
HIPPY_EXPORT_METHOD(click) {
    // 实现前端的click功能
}
@end
```

# 事件型功能扩展

事件型功能除了拥有非事件型功能的全部特点外，还拥有事件监听与反馈的能力。前端可能有个`MyModule.addListener(string eventname)`方法调用用于驱动终端监听某个事件，以及一套接收终端事件回调的机制。因此终端将这些机制封装为一个基类`HippyEventObserverModule`。所有事件型功能都必须继承自这个基类并实现必要的方法。
扩展一个事件型功能包括以下工作：

* 创建对应的事件型功能类，必须继承自`HippyEventObserverModule`，并绑定前端组件。
    >在实现文件中使用`HIPPY_EXPORT_MODULE()`宏导出。
* 绑定前端方法

    >与扩展UI组件类似，使用`HIPPY_EXPORT_METHOD()`宏绑定前端方法。注意方法名需要对齐。

* 实现`[MyModule addEventObserverForName:]`与`[MyModule removeEventObserverForName:]`方法用以开启、关闭对某个事件的监听行为

    >这两个方法在基类`HippyEventObserverModule`中已经实现但未作任何处理，需要MyModule根据也无需要自行实现。同时这一步是否需要实现取决于前端是否有对应的MyModule.addListener()操作，即希望终端监听某个事件。若无，则终端可以不实现。

* 事件发生后通知前端

    >终端使用[MyModule sendEvent:params:]方法通知前端。此方法在基类中已经实现。用户需要将制定参数填入并调用方法即可。
    >第一个参数为事件名，前端终端事件名必须一致。
    >第二个参数为事件信息，`NSDictionary`类型。

TestModule.h

``` objectivec
//注意继承自HippyEventObserverModule
@interface TestModule : HippyEventObserverModule <HippyBridgeModule>
@end
```

TestModule.m

``` objectivec
@implementation TestModule
HIPPY_EXPORT_MODULE()
HIPPY_EXPORT_METHOD(click) {
    // 实现前端的click功能
}
- (void) addEventObserverForName:(NSString *)eventName {
    // 监听customevent事件
    if ([eventName isEqualToString:@"customevent"]) {
        addLisener(eventName);
    }
}
- (void) removeEventObserverForName:(NSString *)eventName {
    // 移除customevent事件
    if ([eventName isEqualToString:@"customevent"]) {
        removeLisener(eventName);
    }
}
- (void) eventOccur {
    // 事件发生，通知前端
    [self sendEvent:@"customevent" params:@{@"key": @"value"}];
}
@end
```
