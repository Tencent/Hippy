# JSI Mode

> Min support version: 2.11.0

The JavaScript Interface (JSI) pattern provides a cross-VM (synchronous) intercall solution without going through the codec (serialization) process, allowing js to communicate directly with native. Objects passed by traditional intercalls are serialised in their entirety, but not all members are accessed, leading to unnecessary overhead and redundancy in certain scenarios. With JSI, the js side can fetch a C++-defined object (HostObject) and call the methods on that object.

---

# Structure

<br />
<img src="assets/img/jsi_structure.png" alt="JSI Structure" width="40%"/>
<br />
<br />

# Not Applicable Scenarios

JSI is not suitable for all scenarios:

* The lower the percentage of members to be read, the better the performance of JSI.
* As the percentage of members to be read rises, the cumulative time consumed increases as the number of JNI calls increases, which is not as good as the codec implementation.
* Synchronous calls simplify coding process and are more stable, but they block JS execution and are not suitable for complex logic.

# Instructions

## Native

### Android

* Enable JSI capability by setting engine initialization parameters

```java
    HippyEngine.EngineInitParams initParams = new HippyEngine.EngineInitParams();
    initParams.enableTurbo = true;
```

* Define Module

> Similar to a normal NativeModule, except that you need to annotate `@HippyMethod(isSync = true)` to indicate that it is a synchronous call

```java
@HippyNativeModule(name = "demoTurbo")
public class DemoJavaTurboModule extends HippyNativeModuleBase {

  ...
  @HippyMethod(isSync = true)
  public double getNum(double num) {
    return num;
  }
  ...
}
```

> Supported types

<br />
<img src="assets/img/jsi_type_android.png" alt="Supported types" width="100%"/>
<br />
<br />

For more demo, refer to [DemoJavaTurboModule](https://github.com/Tencent/Hippy/blob/master/examples/android-demo/example/src/main/java/com/tencent /mtt/hippy/example/module/turbo/DemoJavaTurboModule.java)

* Registering `TurboModule` is the same as registering `NativeModule`

```java
public class MyAPIProvider implements HippyAPIProvider {
 
  @Override
  public Map<Class<? extends HippyNativeModuleBase>, Provider<? extends HippyNativeModuleBase>> getNativeModules(final HippyEngineContext context) {
    Map<Class<? extends HippyNativeModuleBase>, Provider<? extends HippyNativeModuleBase>> modules = new HashMap<>();
    ...
    modules.put(DemoJavaTurboModule.class, new Provider<HippyNativeModuleBase>() {
      @Override
      public HippyNativeModuleBase get() {
        return new DemoJavaTurboModule(context);
      }
    });
    ...
    return modules;
  }
```

### iOS

* Enable JSI capability by setting engine initialization parameters
  iOS has two ways to turn on/off the enableTurbo capability, as follows.

```objc
// Way 1: bridge initialization takes effect by setting the configuration parameters
NSDictionary *launchOptions = @{@"EnableTurbo": @(DEMO_ENABLE_TURBO)};
HippyBridge *bridge = [[HippyBridge alloc] initWithDelegate:self
                                                  bundleURL:[NSURL fileURLWithPath:commonBundlePath]
                                             moduleProvider:nil
                                              launchOptions:launchOptions
                                                executorKey:@"Demo"];

// way two: after bridge initialization is complete, set the properties to take effect
HippyRootView *rootView = [[HippyRootView alloc] initWithBridge:nil
                                                    businessURL:nil
                                                     moduleName:@"Demo" 
                                              initialProperties:@{@"isSimulator": @(isSimulator)} 
                                                  launchOptions:nil 
                                                   shareOptions:nil 
                                                      debugMode:YES 
                                                       delegate:nil];
[rootView.bridge setTurboModuleEnabled:YES];

```

* Define Module

> Inherit HippyOCTurboModule, implement the protocol HippyTurboModule.

Currently, iOS side only supports JSI capabilities via inheritance, the subsequent version will consider to enhance, to achieve the ability by only implementing `HippyTurboModule` .

Specific use and implementation of the protocol is as follows:

```obj

@implementation TurboConfig

...

// Register the module
HIPPY_EXPORT_TURBO_MODULE(TurboConfig)

// Register interactive functions
HIPPY_EXPORT_TURBO_METHOD(getInfo) {
    return self.strInfo;
}
HIPPY_EXPORT_TURBO_METHOD(setInfo:(NSString *)string) {
    self.strInfo = string;
    return @(YES);
}

...

@end

```

> Description of supported data types.

| Object type  | Js type |
|:-------------|:----------|
| BOOL         | Bool |
| NSInteger    | Number |
| NSUInteger   | Number |
| CGDouble     | Number |
| CGFloat      | Number |
| NSString     | String |
| NSArray      | Array |
| NSDictionary | Object |
| Promise      | Function |
| NULL         | null |



More examples can be found in class [DemoIOSTurboModule](https://github.com/Tencent/Hippy/blob/master/examples/ios-demo/HippyDemo/turbomodule/TurboBaseModule. mm)


## Usage examples

[Android Demo](https://github.com/Tencent/Hippy/blob/master/examples/android-demo)

[iOS Demo](https://github.com/Tencent/Hippy/blob/master/examples/ios-demo)

[HippyReact Demo](https://github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/externals/Turbo/index.jsx)

[HippyVue Demo](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-turbo.vue)





