# JSI 模式

> 最低支持版本 2.11.0

JavaScript Interface(JSI) 模式提供了一种无需经历编解码（序列化）过程的跨 VM （同步）互调用解决方案，使得 js 可以和 native 直接通信。传统互调用所传递的对象会全部序列化，但并非所有成员都被访问，在特定场景下导致了不必要的开销与冗余。通过 JSI，js 侧可以获取 C++ 定义的对象（HostObject)，并调用该对象上的方法。

---

# 架构图

<br />
<img src="assets/img/jsi_structure.png" alt="jsi架构图" width="40%"/>
<br />
<br />

# 不适用场景

JSI 并非适用于所有场景:

* 所需读取的成员占比越少，JSI 表现出的性能越优异。
* 随着所需读取的成员占比上升，JNI 调用次数的增加，所累计的耗时也随之上涨，反而不如编解码实现性能优异。
* 同步调用简化了编码，耗时更稳定，但会阻塞 JS 执行，不适用于复杂逻辑。

# 接入说明

## Android

* 通过设置引擎初始化参数开启JSI能力

```java
    HippyEngine.EngineInitParams initParams = new HippyEngine.EngineInitParams();
    initParams.enableTurbo = true;
```

* 定义Module

> 跟普通NativeModule类似，区别在于需要添加以下注解表明是同步调用 `@HippyMethod(isSync = true)`

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

> 支持的数据类型说明：

<br />
<img src="assets/img/jsi_type_android.png" alt="数据类型" width="100%"/>
<br />
<br />

更多示例可参考类[DemoJavaTurboModule](https://github.com/Tencent/Hippy/blob/master/examples/android-demo/example/src/main/java/com/tencent/mtt/hippy/example/module/turbo/DemoJavaTurboModule.java)

* 注册TurboModule模块，跟NativeModule注册方法完全一致

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

## iOS

* 通过设置引擎初始化参数开启JSI能力
iOS有两种方式去打开关闭enableTurbo能力，如下：

```objc
// 方式一：bridge初始化时通过配置参数设置生效
NSDictionary *launchOptions = @{@"EnableTurbo": @(DEMO_ENABLE_TURBO)};
HippyBridge *bridge = [[HippyBridge alloc] initWithDelegate:self
                                                  bundleURL:[NSURL fileURLWithPath:commonBundlePath]
                                             moduleProvider:nil
                                              launchOptions:launchOptions
                                                executorKey:@"Demo"];

// 方式二：bridge初始化完成后，设置属性生效
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

* 定义Module

> 继承HippyOCTurboModule，实现协议HippyTurboModule。

目前iOS端仅支持继承关系来实现JSI能力，后续会考虑升级，只需实现协议`HippyTurboModule`就能实现能力。

具体使用与实现协议如下：

```obj

@implementation TurboConfig

...

// 注册模块
HIPPY_EXPORT_TURBO_MODULE(TurboConfig)

// 注册交互函数
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

> 支持的数据类型说明：

| Objec类型  | Js类型  |
|:----------|:----------|
| BOOL    | Bool    |
| NSInteger    | Number    |
| NSUInteger    | Number    |
| CGDouble    | Number    |
| CGFloat    | Number    |
| NSString    | String    |
| NSArray    | Array    |
| NSDictionary    | Object    |
| Promise    | Function    |
| NULL    | null    |



更多示例可参考类[DemoIOSTurboModule](https://github.com/Tencent/Hippy/blob/master/examples/ios-demo/HippyDemo/turbomodule/TurboBaseModule.mm)


# 使用例子

[Android Demo](https://github.com/Tencent/Hippy/blob/master/examples/android-demo)

[iOS Demo](https://github.com/Tencent/Hippy/blob/master/examples/ios-demo)

[HippyReact Demo](https://github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/externals/Turbo/index.jsx)

[HippyVue Demo](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-turbo.vue)





