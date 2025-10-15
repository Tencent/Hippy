# 自定义终端模块

很多时候 JS 需要访问对应终端的一些能力模块，比如数据库、下载、网络请求等，这时候就需要使用 Module 来暴露接口给JS使用。Hippy SDK 中默认实现了部分 Module，但这极有可能无法满足你的需求，这就需要你对 Module 进行扩展封装。Hippy支持 Android、iOS、Ohos、Flutter、Web(同构) 等平台的模块扩展。

<br/>

# Android

---

## Module扩展

我们将以 TestModule 为例，从头扩展一个 Module，这个 Module 将展示前端如何调用终端能力，并且把结果返回给前端。

终端扩展Module包括四步：

1. 创建 `HippyNativeModuleBase` 的子类。
2. 添加 `HippyNativeModule` 注解。
3. 实现导出给 JS 的方法。
4. 注册 Module。

## 1. 创建HippyNativeModuleBase的子类

首先我们需要创建`TestModule`类，并且继承`HippyNativeModuleBase`。

```java
package com.tencent.mtt.hippy.example.modules;

import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleBase;

public class TestModule extends HippyNativeModuleBase
{

    public LogModule(HippyEngineContext context)
    {
        super(context);
    }
}
```

## 2. 添加HippyNativeModule注解

HippyNativeModuleBase 要求增加注解 `@HippyNativeModule` 。

HippyNativeModule注解参数：

- name：module名称，js调用时需要通过此属性找到对应的module实例对象。
- names：module别名，支持同一个module设置不同的名称。
- init：默认为false，即module在首次调用的时候才会进行实例初始化，如果设置为true，在引擎创建时候就会马上创建实例并初始化

> **注意：init参数在非必要的情况下不要设置为true，否则可能增加引擎启动的耗时。**

``` java
@HippyNativeModule(name = "TestModule")
public class TestModule extends HippyNativeModuleBase
{
    ...
}
```

## 3. 实现导出给JS的方法

导出给 JS 使用的方法，必须使用注解 `@HippyMethod` ，方法必须为 `public` 类型，返回类型必须为 `void`。

支持的方法参数类型包括：

- Java基本数据类型。
- HippyArray：类似于ArrayList，线程非安全。
- HippyMap：类似于HashMap，线程非安全。
- 基于JSValue的新数据类型：注解参数useJSValueType设置为true时适用。
- Promise：回调JS的触发器，通过 `resolve` 方法返回成功信息给JS。通过 `reject` 方法返回失败实现给JS。

HippyMethod注解参数：

- name：接口名称，js调用时需要通过此参数找到对应的接口信息，并进行反射调用。
- isSync：是否为JSI接口，JSI为同步调用接口，会卡住js线程，只适用于数据结构简单且size较小的数据传输，[JSI特性介绍](feature/feature2.0/jsi.md)
- useJSValueType：接口参数是否使用新数据类型，默认为false，即使用老的HippyMap与HippyArray类型接收参数，设置为true以后参数需要使用基于JSValue为基类的扩展数据类型，[新数据类型介绍](development/type-mapping.md)

> **注意：新数据类型不能与HippyMap或HippyArray相互嵌套混用， 否则会导致数据编解码产生错误。**

```java
@HippyMethod(name="log")
public void log(String msg)
{
    Log.d("TestModule", msg);
}

@HippyMethod(name="helloNative")
public void helloNative(HippyMap hippyMap)
{
    String hello = hippyMap.getString("hello");
    Log.d("TestModule", hello);
}

@HippyMethod(name = "helloNativeWithPromise")
public void helloNativeWithPromise(HippyMap hippyMap, Promise promise)
{
    // 这里回来的参数可以为java的基础类型，和hippymap与hippyarry, 但是前端调用的时候必须对应上
    String hello = hippyMap.getString("hello");
    Log.d("TestModule", hello);
    if (true)
    {
        // TODO 如果模块这里处理成功回调resolve
        HippyMap hippyMap1 = new HippyMap();
        hippyMap1.pushInt("code", 1);
        hippyMap1.pushString("result", "hello i am from native");
        promise.resolve(hippyMap1);
    }
    else
    {
        // 失败就回调reject
        HippyMap hippyMap1 = new HippyMap();
        hippyMap1.pushInt("code", -1);
        promise.reject(hippyMap1);
    }
}
```

## 4. 注册Module

需要自定义'APIProvider'类，并实现SDK HippyAPIProvider interface，然后在`getNativeModules` 方法中添加这个 Module，这样它才能在JS中被访问到。

```java
public class MyAPIProvider implements HippyAPIProvider {

    @Override
    public Map<Class<? extends HippyNativeModuleBase>, Provider<? extends HippyNativeModuleBase>> getNativeModules(final HippyEngineContext context)
    {
        Map<Class<? extends HippyNativeModuleBase>, Provider<? extends HippyNativeModuleBase>> modules = new HashMap<>();
        //regist the MyModule
        modules.put(TestModule.class, new Provider<HippyNativeModuleBase>() 
        {
            @Override
            public HippyNativeModuleBase get()
            {
                return new TestModule(context);
            }
        });
    }

    @Override
    public List<Class<? extends HippyJavaScriptModule>> getJavaScriptModules() {return null;}

    @Override
    public List<Class<? extends HippyViewController>> getControllers() {return null;}
}
```

## 5. 注册APIProvider

在HippyEngine初始化的EngineInitParams参数属性中设置providers。

``` java
List<HippyAPIProvider> providers = new ArrayList<>();
providers.add(new MyAPIProvider());
initParams.providers = providers;
```


## 注意事项

扩展Module中不能同步执行耗时操作，这可能卡住整个引擎通信线程。存在耗时场景，请使用异步线程处理。

## 混淆说明

扩展 Module 的类名和扩展方法名不能混淆，可以增加混淆例外。

``` java
-keep class * extends com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleBase{ public *;}
```


# iOS

除了UI界面以外，APP开发中还会出现调用设备功能的场景，比如获取当前网络状态、发起HTTP网络请求等。SDK已经封装了一些常用功能，但自定义功能模块也是十分方便的。

> **注意：自定义模块及其方法的名称中不要带上 `Hippy` 几个字（不区分大小写），否则在 iOS 上可能会碰到找不到模块或方法的问题。**

> 功能扩展中类和方法的导出和UI组件的类和方法的导出十分相似，建议先阅读UI组件扩展再来阅读功能扩展文章。

使用 `HIPPY_EXPORT_MODULE()` 扩展自定义功能后，每次APP启动时都会创建一个功能实例，并且以后前端调用组件功能使用的都是这个实例，可以理解为单例的意思。
>功能没有属性这个概念，不要试图去给功能绑定属性。

每个功能都有类似于UI组件对应的方法导出, 同样也对应`callNative`、`callNativeWithCallbackId`、`callNativeWithPromise`三种调用方式。

我们将SDK中的功能模块分为两种类型：

- 非事件型功能--当业务需要某种信息或者需要终端执行某项指令，直接通过接口调用终端代码即可。
- 事件型功能--业务需要终端监听某个事件。当事件触发时，终端通知前端。

---

## 非事件型功能扩展

扩展一个非事件型功能组件包括以下工作：

- 创建对应的功能类，并绑定前端组件，
    >非事件型功能只需要继承自简单的NSObject类即可。在实现文件中使用 `HIPPY_EXPORT_MODULE()` 宏导出。
- 绑定前端方法
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

## 事件型功能扩展

事件型功能除了拥有非事件型功能的全部特点外，还拥有事件监听与反馈的能力。前端可能有个 `MyModule.addListener(string eventname)` 方法调用用于驱动终端监听某个事件，以及一套接收终端事件回调的机制。因此终端将这些机制封装为一个基类`HippyEventObserverModule`。所有事件型功能都必须继承自这个基类并实现必要的方法。
扩展一个事件型功能包括以下工作：

- 创建对应的事件型功能类，必须继承自 `HippyEventObserverModule`，并绑定前端组件。
    >在实现文件中使用 `HIPPY_EXPORT_MODULE()` 宏导出。
- 绑定前端方法

    >与扩展UI组件类似，使用 `HIPPY_EXPORT_METHOD()` 宏绑定前端方法。注意方法名需要对齐。

- 实现 `[MyModule addEventObserverForName:]` 与 `[MyModule removeEventObserverForName:]` 方法用以开启、关闭对某个事件的监听行为

    >这两个方法在基类 `HippyEventObserverModule` 中已经实现但未作任何处理，需要MyModule根据需要自行实现。同时这一步是否需要实现取决于前端是否有对应的MyModule.addListener()操作，即希望终端监听某个事件。若无，则终端可以不实现。

- 事件发生后通知前端

    >终端使用 `[MyModule sendEvent:params:]` 方法通知前端。此方法在基类中已经实现。用户需要将制定参数填入并调用方法即可。
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

# Ohos

很多时候 `JS` 需要访问对应终端的一些能力模块，比如数据库、下载、网络请求等，这时候就需要使用 `Module` 来暴露接口给JS使用。Ohos SDK 中默认实现了部分 `Module`，但这极有可能无法满足你的需求，这就需要你对 `Module` 进行扩展封装。

---

## Module扩展

我们将以 `ExampleNativeModule` 为例，从头扩展一个 `Module`，这个 `Module` 将展示前端如何调用终端能力，并且把结果返回给前端。

终端扩展 `Module` 的步骤：

1. 创建 `HippyNativeModuleBase` 的子类。
2. 实现导出给 JS 的方法。
3. 注册 Module。
4. 注册 HippyAPIProvider。

## 1. 创建 HippyNativeModuleBase 的子类

```typescript
export class ExampleNativeModule extends HippyNativeModuleBase {
  public static readonly NAME = 'ExampleNativeModule'

  constructor(ctx: HippyEngineContext) {
    super(ctx)
  }

  public call(method: string, params: Array<HippyAny>, promise: HippyModulePromise): HippyAny {
    switch (method) {
      case 'test': {
        this.test();
        break;
      }
      case 'testPromise': {
        this.testPromise(params, promise);
        break;
      }
      case 'testSendEvent': {
        this.testSendEvent(params, promise);
      }
      default:
        super.call(method, params, promise);
    }
    return null;
  }

  public test() {
    LogUtils.i(ExampleNativeModule.NAME, 'module test');
  }

  public testPromise(params: Array<HippyAny>, promise: HippyModulePromise) {
    promise.resolve('test');
  }

  public testSendEvent(params: Array<HippyAny>, promise: HippyModulePromise) {
    LogUtils.i(ExampleNativeModule.NAME, 'testSendEvent');
    if (this.ctx != null && this.ctx.getModuleManager() != null) {
      const eventModule = this.ctx.getModuleManager().getJavaScriptModule(EventDispatcher.MODULE_NAME);
      if (eventModule != null) {
        const event = 'testEvent';
        const params = new Map<string, HippyAny>();
        params.set('testString', 'testStringValue');

        const valueMap = new Map<string, HippyAny>();
        valueMap.set('testString2', 'testStringValue2');
        params.set('testMap', valueMap);

        const array: HippyArray = [];
        array.push(valueMap);
        params.set('testArray', array);

        (eventModule as EventDispatcher).receiveNativeEvent(event, params);
      }
    }
  }

}
```

需要注意的是，这里与Android、iOS有几处不同。

1. 需要指定 NAME，设置为前端调用的 module name

2. 需要实现 call 方法

## 2. 实现导出给 JS 的方法

例子见上一步 call 方法的实现。

## 3. 注册 Module

```typescript
export class ExampleAPIProvider extends HippyAPIProvider {
  getCustomNativeModuleCreatorMap(): Map<string, HippyNativeModuleCreator> | null {
    let registerMap: Map<string, HippyNativeModuleCreator> =
      new Map()
    registerMap.set(ExampleNativeModule.NAME,
      (ctx): HippyNativeModuleBase => new ExampleNativeModule(ctx))
    return registerMap;
  }
}
```

## 4. 注册 HippyAPIProvider

在 HippyEngine 初始化的 EngineInitParams 参数属性中设置 providers。

```typescript
params.providers = new Array(new ExampleAPIProvider())
```

## Turbo Module扩展

和 Module 的扩展一致，不过还需要配置 isTurbo 方法，且不需要实现 call 方法，参考如下：

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


# Voltron

很多时候 `JS` 需要访问对应终端的一些能力模块，比如数据库、下载、网络请求等，这时候就需要使用 `Module` 来暴露接口给JS使用。Voltron SDK 中默认实现了部分 `Module`，但这极有可能无法满足你的需求，这就需要你对 `Module` 进行扩展封装。

---

## Module扩展

我们将以 `TestModule` 为例，从头扩展一个 `Module`，这个 `Module` 将展示前端如何调用终端能力，并且把结果返回给前端

终端扩展 `Module` 包括四步：

1. 创建 `TestModule`
2. 实现导出给 `JS` 的方法。
3. 注册 `Module`。

## 1. 创建 `TestModule`

首先我们需要创建 `TestModule` ，并且继承 `VoltronNativeModule` 。

```dart
import 'package:voltron/voltron.dart';

class TestModule extends VoltronNativeModule {
  static const String kModuleName = "TestModule";

  TestModule(EngineContext context) : super(context);

  @override
  Map<String, Function> get extraFuncMap => {};

  @override
  String get moduleName => kModuleName;
}
```

## 2. 实现导出给 `JS` 的方法


```dart
class TestModule extends VoltronNativeModule {
  static const String kModuleName = "TestModule";

  // 这里定义方法名
  static const String kLogMethodName = "log";
  static const String kHelloNativeMethodName = "helloNative";
  static const String kHelloNativeWithPromiseMethodName = "helloNativeWithPromise";

  TestModule(EngineContext context) : super(context);

  /***
   * log
   * @param log
   * @param promise
   * 自定义了扩展了一个 log 的接口并且无回调
   */
  @VoltronMethod(kLogMethodName)
  bool log(String log, JSPromise promise) {
    // 这里回来的参数可以为 dart 的基础类型和 VoltronMap (对应前端{})与 VoltronArray (对应前端[]),但是前端调用的时候必须对应上
    LogUtils.d("TestModule", log);
    return true;
  }

  /***
   * helloNative
   * @param voltronMap
   * @param promise
   * 自定义了扩展了一个helloNative的接口，传入复杂结构参数
   */
  @VoltronMethod(kHelloNativeMethodName)
  bool helloNative(VoltronMap voltronMap, JSPromise promise) {
    // 这里回来的参数可以为dart的基础类型和VoltronMap(对应前端{})与VoltronArray(对应前端[]),但是前端调用的时候必须对应上
    String? hello = voltronMap.get<String>("hello");
    if (hello != null) {
      LogUtils.d("TestModule", hello);
    }
    return true;
  }

  /***
   * helloNativeWithPromise
   * @param voltronMap
   * @param promise
   * 自定义了扩展了一个helloNativeWithPromise的接口，支持回调
   */
  @VoltronMethod(kHelloNativeWithPromiseMethodName)
  bool helloNativeWithPromise(VoltronMap voltronMap, Promise promise) {
    // 这里回来的参数可以为 dart 的基础类型和 VoltronMap (对应前端{})与 VoltronArray (对应前端[]),但是前端调用的时候必须对应上
    String? hello = voltronMap.get<String>("hello");
    if (hello != null) {
      LogUtils.d("TestModule", hello);
      if (hello.isNotEmpty) {
        // 如果模块这里处理成功回调 resolve
        VoltronMap hippyMap1 = VoltronMap();
        hippyMap1.push("code", 1);
        hippyMap1.push("result", "hello i am from native");
        promise.resolve(hippyMap1);
        return true;
      }
    }
    // 失败就回调 reject
    VoltronMap hippyMap1 = VoltronMap();
    hippyMap1.push("code", -1);
    promise.reject(hippyMap1);
    return true;
  }

  // 这里填写方法名与方法的对应关系
  @override
  Map<String, Function> get extraFuncMap => {
        kLogMethodName: log,
        kHelloNativeMethodName: helloNative,
        kHelloNativeWithPromiseMethodName: helloNativeWithPromise,
      };

  @override
  String get moduleName => kModuleName;
}
```

!> 主要注意的是，这里与Hippy有几处不同

1. 不管前端调用 `callNative` ，还是 `callNativeWithPromise` ，终端这里最后一个参数始终为 `promise` ，这里是由于 `flutter` 与安卓不同，这里不存在反射，我们无法直接获取到方法中的参数个数，所以默认最后一个参数必须填写 `promise` ，如果你调用的是 `callNative` ，也不用过于关注，这里对你没有任何影响。

2. 方法必须返回 `bool`，返回值的最大作用主要是为了让用户能够明确自己必须要处理 `promise` 的状态，这里如果返回 `true` ，则外部会忽略，如果返回 `false` ，则外部会默认返回兜底值

```dart
bool helloNativeWithPromise(VoltronMap voltronMap, Promise promise) {}
```

## 3. 注册 `Module`

上面的工作做完后，我们需要把模块注册进入 Voltron 应用，还记得初始化时的 `MyAPIProvider` 吗，这里我们要传入在 `nativeModuleGeneratorList`

```dart
class MyAPIProvider implements APIProvider {

  // 这个是模块扩展
  @override
  List<ModuleGenerator> get nativeModuleGeneratorList => [
    ModuleGenerator(
      TestModule.kModuleName,
      (context) => TestModule(context),
    ),
  ];

  @override
  List<JavaScriptModuleGenerator> get javaScriptModuleGeneratorList => [];

  @override
  List<ViewControllerGenerator> get controllerGeneratorList => [];
}
```


# Web

---

## 模块的扩展

扩展模块主要包括：

1. 创建 `HippyWebModule` 的子类
2. 设置 `Moduel` 的 `name` 属性
3. 实现 `Module` 需要暴露给前端的 `API`

其中 `HippyWebModule` 类标准化了 HippyWebRenderer 可使用的模块，提供了一些 HippyWebRenderer 的上下文，在一个自定义组件中有几个比较重要的属性：

- name：定义了模块的名字，与 JS 业务侧使用 `callNative(moduleName，methodName)` 中的 `moduleName` 相对应
- context：提供了一系列的方法

```javascript
sendEvent(type: string, params: any); //发送事件
sendUiEvent(nodeId: number, type: string, params: any); // 发送 UI 相关事件
sendGestureEvent(e: HippyTransferData.NativeGestureEvent); // 发送手势事件
subscribe(evt: string, callback: Function); // 监听某个事件
getModuleByName(moduleName: string); // 使用模块名获取模块
```

### 例子

以 CustomModule 为例，从头介绍如何扩展 Module

```javascript
import { HippyWebModule } from '@hippy/web-renderer';
// 继承自 HippyWebModule
export class CustomModule extends HippyWebModule {
  // 设置 Module的 name 属性
  name = 'CustomModule';
  // 实现API `getBrowserInfo` 和 `setBrowserTitle` ，分别提供了获取当前浏览器的信息和设置浏览器 title 的功能。
  // 在提供自定义模块的 api 时，api的参数为 `function name(arg1,arg2...argn,callBack)`，前面的n个参数对应业务侧调用时的传递参数，最后一个 `callback` 是当 JS 业务侧需要有返回值形式的调用时，提供返回结果的回调。
  getBrowserInfo(callBack) {
   let data = {};
   ...
   callBack.resolve(data);
  }
  
  setBrowserTitle(title, callBack) {
   if (title) {
     window.document.title = title;
   };
   ...
   callBack.resolve(true);
   // callBack.reject(null);执行失败时
  }
}
```

