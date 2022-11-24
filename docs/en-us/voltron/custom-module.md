# Custom Modules

Sometimes `JS` need to access some capabilities of the corresponding native modules, such as databases, downloads, network requests, etc., it is necessary to use `Module` to expose the interface to `JS`. Voltron SDK implemented some default modules, but it is very likely that they can not meet your needs, which requires you to extend the `Module` package.

---

# Module Extension

We will use `TestModule` as an example to extend a `Module` from scratch, this `Module` will show how the Front-End call native capabilities, and return the results to the Front-End.

Extending a native module consists of three steps:

1. Create `TestModule`
2. Implement the methods exported to JS,
3. Register Module.

## 1. Create `TestModule`

First we need to create `TestModule` class and inherit `VoltronNativeModule`

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

## 2. Implement the methods exported to `JS`

```dart
class TestModule extends VoltronNativeModule {
  static const String kModuleName = "TestModule";

  static const String kLogMethodName = "log";
  static const String kHelloNativeMethodName = "helloNative";
  static const String kHelloNativeWithPromiseMethodName = "helloNativeWithPromise";

  TestModule(EngineContext context) : super(context);

  /***
   * log
   * @param log
   * @param promise
   */
  @VoltronMethod(kLogMethodName)
  bool log(String log, JSPromise promise) {
    // parameters can be dart base type, VoltronMap and VoltronArray, but the Front-End call must correspond correctly
    LogUtils.d("TestModule", log);
    return true;
  }

  /***
   * helloNative
   * @param voltronMap
   * @param promise
   */
  @VoltronMethod(kHelloNativeMethodName)
  bool helloNative(VoltronMap voltronMap, JSPromise promise) {
    // parameters can be dart base type, VoltronMap and VoltronArray, but the Front-End call must correspond correctly
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
   */
  @VoltronMethod(kHelloNativeWithPromiseMethodName)
  bool helloNativeWithPromise(VoltronMap voltronMap, Promise promise) {
    // parameters can be dart base type, VoltronMap and VoltronArray, but the Front-End call must correspond correctly
    String? hello = voltronMap.get<String>("hello");
    if (hello != null) {
      LogUtils.d("TestModule", hello);
      if (hello.isNotEmpty) {
        // If the module is processed here, callback resolve
        VoltronMap hippyMap1 = VoltronMap();
        hippyMap1.push("code", 1);
        hippyMap1.push("result", "hello i am from native");
        promise.resolve(hippyMap1);
        return true;
      }
    }
    // callback rejection on failure
    VoltronMap hippyMap1 = VoltronMap();
    hippyMap1.push("code", -1);
    promise.reject(hippyMap1);
    return true;
  }

  // Fill in the correspondence between method names and methods here
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

!> The main thing to note is that there are several differences from Hippy here

1. Regardless of whether the Front-End calls `callNative` or `callNativeWithPromise`, the last parameter in the function is always `promise`. This is because `flutter` is different from `Android`, there is no reflection here, and we cannot directly get the number of parameters in the method, so the default last parameter must be filled in `promise` , if you call `callNative`, don't pay too much attention, it has no effect on you.

2. Method must return `bool`, The biggest function of the return value is mainly to let the user know that he has to deal with the state of the `promise`. If it returns `true`, the external will ignore it. If it returns `false`, the external will return the bottom value by default.

```dart
bool helloNativeWithPromise(VoltronMap voltronMap, Promise promise) {}
```

## 3. Register Module


After the above work is done, we need to register the module into the Voltron application. Remember the `MyAPIProvider` during initialization, here we have to pass in the `nativeModuleGeneratorList`

```dart
class MyAPIProvider implements APIProvider {

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
