# 定制界面组件

App开发中会使用大量UI组件，Hippy SDK已经包含了一些基本UI，比如 View, Text, Image 等。
而用户若想进行自定义组件也十分简单。

# 组件扩展

我们以创建MyView为例，从头介绍如何扩展一个组件。

>本文仅介绍ios端工作，前端工作请查看对应的文档。

扩展一个UI组件需要包括以下工作：

1. 创建对应的ViewManager
2. 注册类并绑定前端组件
3. 绑定View属性及方法
4. 创建对应的shadowView和View

## 创建对应的ViewManager

> ViewManager 是对应的视图管理组件，负责前端视图和终端视图直接进行属性、方法的调用。
> SDK 中最基础的 ViewManager 是 HippyViewManager，封装了基本的方法，负责管理 HippyView。
> 用户自定的 ViewManager 必须继承自 HippyViewManager

HippyMyViewManager.h

```objectivec
@interface HippyMyViewManager:HippyViewManager
@end
```

HippyMyViewManager.m

```objectivec
@implementation HippyMyViewManager
HIPPY_EXPORT_MODULE(MyView)
HIPPY_EXPORT_VIEW_PROPERTY(backgroundColor, UIColor)
HIPPY_REMAP_VIEW_PROPERTY(opacity, alpha, CGFloat)
HIPPY_CUSTOM_VIEW_PROPERTY(overflow, CSSOverflow, HippyView)
{
    if (json) {
        view.clipsToBounds = [HippyConvert CSSOverflow:json] != CSSOverflowVisible;
    } else {
        view.clipsToBounds = defaultView.clipsToBounds;
    }
}
- (HippyView *)view {
    return [HippyMyView new];
}
- (HippyShadowView *)shadowView {
    return [HippyShadowView new];
}
HIPPY_EXPORT_METHOD(focus:(nonnull NSNumber *)reactTag) {
    // do sth
}
HIPPY_EXPORT_METHOD(focus:(nonnull NSNumber *)reactTag callback:(HippyResponseSenderBlock)callback) {
    // do sth
    NSArray *result = xxx;
    callback(result);
}
```

## 类型导出

`HIPPY_EXPORT_MODULE()` 将 HippyMyViewManager 类注册，前端在对 MyView 进行操作时会通过 HippyMyViewManager 进行实例对象指派。

`HIPPY_EXPORT_MODULE()`中的参数可选。代表的是 ViewManager 对应的View名称。
若用户不填写，则默认使用类名称。

但是SDK中有个特殊处理逻辑，若参数中的字符串以 `Manager` 结尾，那SDK在根据字符串查找对应的 View 时会将删除结尾 `Manager` 后的字符串作为View名称

## 参数导出

`HIPPY_EXPORT_VIEW_PROPERTY` 将终端View的参数和前端参数绑定。当前端设定参数值时，会自动调用 setter 方法设置到终端对应的参数。
`HIPPY_REMAP_VIEW_PROPERTY()` 负责将前端对应的参数名和终端对应的参数名对应起来。以上述代码为例，前端的 opacity 参数对应终端的alpha参数。此宏一共包含三个参数，第一个为前端参数名，第二个为对应的终端参数名称，第三个为参数类型。另外，此宏在设置终端参数时使用的是keyPath方法，即终端可以使用keyPath参数。
`HIPPY_CUSTOM_VIEW_PROPERTY()` 允许终端自行解析前端参数。SDK将前端传递过来的原始json类型数据传递给函数体（用户可以使用HippyConvert类中的方法解析对应的 数据），用户获取后自行解析。

>这个方法带有两个隐藏参数-view, defaultView。view是指当前前端要求渲染的view。default指当前端渲染参数为nil时创建的一个临时view，使用其默认参数赋值。

## 方法导出

`HIPPY_EXPORT_METHOD` 能够使前端随时调用终端对应的方法。前端通过三种模式调用，分别是 `callNative`, `callNativeWithCallbackId`, `callNativeWithPromise`。终端调用这三种方式时，函数体写法可以参照上面的示例。

* callNative：此方法不需要终端返回任何值。

* callNativeWithCallbackId: 此方法需要终端在函数体中以单个block形式返回数据。block类型为 `HippyResponseSenderBlock`，参数为一个NSArray变量。

* callNativeWithPromise: 此方法对应的前端使用的是 promise 写法，对应到终端需要业务根据自身情况返回resolve block或者reject block。其中resolve block数据类型为`HippyPromiseResolveBlock`, 参数为一个可以被json化的对象。如果参数为nil，则JS端会将其转化为undefined。reject block数据类型为`HippyPromiseRejectBlock`，参数包括一个错误码，错误信息，以及错误实例对象(NSError)。

一个ViewManager可以管理一种类型的多个实例，为了在ViewManager中区分当前操作的是哪个View，每一个导出方法对应的第一个参数都是View对应的tag值，用户可根据这个tag值找到对应操作的view。

> 由于导出方法并不会在主线程中调用，因此如果用户需要进行UI操作，则必须将其分配至主线程。推荐在导出方法中使用[self.bridge, uiManager addUIBlock:]方法。其中的block类型为`HippyViewManagerUIBlock`。

> `typedef void (^HippyViewManagerUIBlock)(HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry)`。第二个参数为字典，其中的key就是对应的view tag值，value就是对应的view。

## 创建shadowView和View

在OC层，HippyUIManager负责将JS层的解析结果，映射到OC层的视图层级，HippyShadowView它不是真正展现的视图，只是一个映射结果而已，每一个HippyShadowView对应一个真正的视图，但它已经完成了基本的布局。
>HippyView会根据HippyShadowView的映射结果构建真正的View视图。因此对于大多数情况下的自定义view manager来说，直接创建一个HippyShadowView即可。

HippyUIManager将调用[HippyMyViewManager view]方法去创建一个真正的view，用户需要实现这个方法并返回自己所需要的HippyMyView。

到此，一个简单的HippyMyViewManager与HippyMyView创建完成。
