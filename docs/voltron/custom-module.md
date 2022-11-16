# 自定义终端模块

很多时候 `JS` 需要访问对应终端的一些能力模块，比如数据库、下载、网络请求等，这时候就需要使用 `Module` 来暴露接口给JS使用。Voltron SDK 中默认实现了部分 `Module`，但这极有可能无法满足你的需求，这就需要你对 `Module` 进行扩展封装。

---

# Module扩展

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
