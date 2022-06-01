# Custom UI Components

A large number of UI components are used in App development, and the Hippy SDK already contains some basic UI, such as View, Text, Image, etc.
Also, it's easy for users to customize their own components.

# Component Extension

Let's take the creation of MyView as an example to show you how to extend a component from scratch.

>This article only introduces iOS work. Please check the corresponding documents for web Frontend.

Extending a UI component involves the following:

1. Create the corresponding ViewManager
2. Register classes and bind Frontend components
3. Bind `View` properties and methods
4. Create corresponding `shadowView` and `View`

## Create corresponding ViewManager

>ViewManager is the corresponding view Management component, responsible for directly calling properties and methods from front-end view and native view.
>The most basic view Manager in the SDK is the `HippyView` manager, which encapsulates the basic method and is responsible for managing the `HippyView`.
>User-defined ViewManager must inherit from `HippyViewManager`.

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

## Type export

`HIPPY_EXPORT_MODULE()` registers the `HippyMyViewManager` class, and the front-end will assign instance objects through `HippyMyViewManager` when operating on `MyView`.

Parameters of `HIPPY_EXPORT_MODULE()` are optional, representing the corresponding View name.
If the user does not fill in parameters, default class name will be used.

Note: there is a special processing logic in the SDK. If the string in the parameter ends with `Manager`, the SDK will delete the tailing `Manager` and use as the View name.

## Parameter export

`HIPPY_EXPORT_VIEW_PROPERTY` binds the parameters between native view and the front-end. When the parameter value is set at front-end, the `setter` method will be automatically invoked to set the parameter to the native.
`HIPPY_REMAP_VIEW_PROPERTY()` corresponds the parameter name between front-end and the native. Take the above code as an example, the `opacity` parameter of the front-end corresponds to the `alpha` parameter of the native. This macro contains three parameters. The first is the front-end parameter name, the second is the corresponding native parameter name, and the third is the parameter type. In addition, this macro uses `keyPath` method when setting native parameters, that is, the native can use the `keyPath` parameter.
`HIPPY_CUSTOM_VIEW_PROPERTY()` allows native to parse the front-end parameters by itself. The SDK transfers the original JSON type data from the front-end to the function body (the user can use the method in the `HippyConvert` class to parse the corresponding data), and the user can parse the data after obtaining the data.

>This method has two hidden parameters, `view` and `defaultView`. `View` is the view that the current front-end renders. Default is a temporary view created when the front-end rendering parameter is nil, assigned with its default parameter.

## Method export

`HIPPY_EXPORT_METHOD` enables the front-end to call native methods. There are three calling modes, `callNative`, `callNativeWithCallbackId`, `callNativeWithPromise`. You can refer to the snippet above.

* callNative: this method does not require the native to return any values.

* callNativeWithCallbackId: This method requires the native to return data in a single block. The block type is `HippyResponseSenderBlock` and the parameter is an `NSArray` variable.

* callNativeWithPromise: Corresponding to Promise in front-end, and the service corresponding to the native needs to return a resolve block or a reject block according to its own situation. The datatype of resolve block is`HippyPromiseResolveBlock`, and the parameter is an object that can be Jsonified. If the argument is nil, the JS side converts it to undefined. The datatype of reject block data is `HippyPromiseRejectBlock`, which includes an error code, error information, and error instance object (NSError).

A `ViewManager` can manage multiple instances of one type. In order to distinguish which View is currently operated in the `ViewManager`, the first parameter corresponding to each export method is the tag value corresponding to the View. The user can find the view corresponding to the operation according to the tag.

>As the export method will not be called in the main thread, if the user needs to perform UI action, it must be assigned to the main thread. We recommend using the [self.bridge, uiManager addUIBlock:] method in the export method, where the block type should be`HippyViewManagerUIBlock`.

> `typedef void (^HippyViewManagerUIBlock)(HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry)`。The second parameter is a dictionary, in which the key is the corresponding view tag value, and the value is the corresponding view.

## Create shadowView and View

In the OC layer, the `HippyUIManager` is responsible for mapping the parsed results of the JS layer to the view level of the OC layer. The `HippyShadowView` is not the real view, but merely a mapping result. Each `HippyShadowView` corresponds to a real view, but it has completed the basic layout.
>`HippyView` builds a true view based on the mapping results of `HippyShadowView`. Therefore, for a custom view manager in most cases, just create a `HippyShadowView`.

The `HippyUIManager` will call the [HippyMyViewManager view] method to create a real view, and users need to implement this method and return the `HippyMyView` for their own need.

At this point, a simple `HippyMyViewManager` and `HippyMyView` has been created created.
