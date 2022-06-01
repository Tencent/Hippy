# Custom Modules

In addition to the UI, there will also be scenarios in APP development to call device modules, such as obtaining the current network status, initiating HTTP network requests, etc. The SDK already encapsulates some common modules, but it's also convenient to customize functional modules.

> **note: Don't include `Hippy` (case-insensitive) in the name of a custom module and its methods, or you may encounter problems of "not finding the module or method" on iOS.**

>The export of classes and methods in module extensions is very similar to the export of classes and methods in UI components. It is recommended to read UI component extensions first and then read the module extensions article.

---

After using `HIPPY_EXPORT_MODULE()`  to extended custom module, a module instance will be created every time the APP is started, and this instance will be used by the front-end to call component modules all the time. You can understand it as a single instance.
>modules don't have the concept of attributes, so don't try to bind attributes to modules.

Each module has a similar method export scheme to that of a UI component. There are three call mode as well: `callhandler`, `callNativeWithCallbackId`, and `callnativewithhandler`.

We divide the SDK modules into two types:

* Non-Event: When the business needs some information or needs the native to execute some instruction, just need to call the native code directly through the interface.
* Event: When the business needs the native to monitor certain event. The native notifies the front-end when an event is triggered.

# Non-Event Module Extension

Extending a Non-Event module component involves the following:

* Establishing a corresponding module class and binding a front-end component,
    >Non-event module only needs to inherit from `NSObject` type。Use `HIPPY_EXPORT_MODULE()` macro to export in implementation files.
* Binding front-end method
    >Similar to extending UI components, `HIPPY_EXPORT_METHOD()` macro to bind front-end method. Note that method names need to maintain consistency

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
    // implement font-end click
}
@end
```

# Event Type Module Extension

In addition to all the characteristics of Non-Event modules, Event modules also have the ability to monitor and feedback events. The front-end may have a`MyModule.addListener(string eventname)` method call to drive the native to listen for an event, as well as a mechanism to receive native event callbacks. The native encapsulates these mechanisms as a base class`HippyEventObserverModule`. All Event modules must inherit from this base class and implement the necessary methods.
Extending an Event module involves the following:

* To create the corresponding event-type module class, you must inherit from`HippyEventObserverModule` and bind the front-end component.
    >Export `HIPPY_EXPORT_MODULE()` macro in implementation files
* Binding front-end method

    >Similar to extending UI components, `HIPPY_EXPORT_METHOD()` macro is used to bind front-end methods. Note that method names need to maintain consistency.

* implement `[MyModule addEventObserverForName:]` and`[MyModule removeEventObserverForName:]` methods to turn on/off monitoring an event

    >The two methods has been implemented as empty in `HippyEventObserverModule`. MyModule can implement this if needed. Meanwhile, whether this method needs to be implemented depends on whether the front-end has a corresponding `MyModule.addListener()` operation, i.e., the native is expected to listen for an event. If not, the native is not required to implement it.

* Notify front-end after event triggered

    >The native uses `[MyModule sendEvent:params:]` method to notify the front-end。This method is already implemented in the base class. The users need to fill in parameters and call the method.
    >The first parameter is event-name, required to be the same between front-end and the native.
    >The second parameter is event-info, with the datatype of `NSDictionary`

TestModule.h

``` objectivec
// inherit from HippyEventObserverModule
@interface TestModule : HippyEventObserverModule <HippyBridgeModule>
@end
```

TestModule.m

``` objectivec
@implementation TestModule
HIPPY_EXPORT_MODULE()
HIPPY_EXPORT_METHOD(click) {
    // implement "click"
}
- (void) addEventObserverForName:(NSString *)eventName {
    // listen to customevent
    if ([eventName isEqualToString:@"customevent"]) {
        addLisener(eventName);
    }
}
- (void) removeEventObserverForName:(NSString *)eventName {
    // remove customevent
    if ([eventName isEqualToString:@"customevent"]) {
        removeLisener(eventName);
    }
}
- (void) eventOccur {
    // notify front-end
    [self sendEvent:@"customevent" params:@{@"key": @"value"}];
}
@end
```
