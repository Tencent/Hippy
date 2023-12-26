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

```kotlin
val initParams = HippyEngine.EngineInitParams()
initParams.enableTurbo = true
```

* 定义Module

> 跟普通NativeModule类似，区别在于需要添加以下注解表明是同步调用 `@HippyMethod(isSync = true)`

```kotlin
@HippyNativeModule(name = "demoTurbo")
class DemoTurboModule(context: HippyEngineContext?) : HippyNativeModuleBase(context) {
    ...
    @HippyMethod(isSync = true)
    fun getNum(num: Double): Double = num
    ...
}
```

> 支持的数据类型说明：

<br />
<img src="assets/img/jsi_type_android.png" alt="数据类型" width="100%"/>
<br />
<br />

更多示例可参考类[DemoTurboModule](https://github.com/Tencent/Hippy/blob/v3.0-dev/framework/examples/android-demo/src/main/java/com/openhippy/example/turbo/DemoTurboModule.kt)

* 注册TurboModule模块，跟NativeModule注册方法完全一致

```kotlin
class ExampleAPIProvider : HippyAPIProvider {

    override fun getNativeModules(context: HippyEngineContext): Map<Class<out HippyNativeModuleBase>, Provider<out HippyNativeModuleBase>> {
        return mapOf(
            ...
            DemoTurboModule::class.java to Provider { DemoTurboModule(context) }
        )
    }
    ...
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
rootView.bridge.enableTurbo = YES;

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

## 鸿蒙

* 通过设置引擎初始化参数开启JSI能力

```typescript
initParams.enableTurbo = true
```

* 定义Module

> 跟普通NativeModule类似，区别在于需要设置 isTurbo 为 true

```typescript
export class ExampleNativeTurboModule extends HippyNativeModuleBase {
  public static readonly NAME = 'demoTurbo'

  constructor(ctx: HippyEngineContext) {
    super(ctx)
  }

  isTurbo(): boolean {
    return true
  }

  public getString(info: string): string {
    return 'demoTurbo' + info;
  }

  public getNum(num: number): number {
    return num;
  }

  public getBoolean(b: boolean): boolean {
    return b;
  }

  public getMap(map: HippyMap): HippyMap {
    return map
  }

  public getArray(array: HippyArray): HippyArray {
    return array
  }

  public getObject(obj: HippyAny): HippyAny {
    return obj
  }

  public getTurboConfig(): TurboConfig {
    return new TurboConfig();
  }

  public printTurboConfig(turboConfig: TurboConfig): string {
    return turboConfig.info;
  }
}
```

> 嵌套 turbo 对象需要设置注解@HippyTurboObject, 否则会当作普通对象解析

``` typescript
@HippyTurboObject()
export class TurboConfig {
  public static readonly NAME = 'turboConfig'
  public info = "info from turboConfig"
  private static instance: TurboConfig;

  public static getInstance() {
    if (!TurboConfig.instance) {
      TurboConfig.instance = new TurboConfig();
    }
    return TurboConfig.instance;
  }

  public toString() {
    return this.info;
  }

  public getTestString() {
    return 'test' + this.info;
  }
}
```

> 支持的数据类型说明：

| Objec类型  | Js类型  |
|:----------|:----------|
| napi_boolean    | Bool    |
| napi_number    | Number    |
| napi_bigint    | Number    |
| napi_string    | String    |
| napi_object    | Array    |
| napi_object    | Object    |
| NULL    | null    |

更多示例可参考类[DemoTurboModule](https://github.com/sohotz/Hippy/blob/main/framework/examples/ohos-demo/src/main/ets/hippy_extend/ExampleNativeTurboModule.ets)

* 注册TurboModule模块，跟NativeModule注册方法完全一致



# 使用例子

[Android Demo](https://github.com/Tencent/Hippy/blob/master/examples/android-demo)

[iOS Demo](https://github.com/Tencent/Hippy/blob/master/examples/ios-demo)

[HippyReact Demo](https://github.com/Tencent/Hippy/blob/master/examples/hippy-react-demo/src/externals/Turbo/index.jsx)

[HippyVue Demo](https://github.com/Tencent/Hippy/blob/master/examples/hippy-vue-demo/src/components/demos/demo-turbo.vue)





