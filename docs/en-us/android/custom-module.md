# Custom Native Module

Sometimes JS need to access some capabilities of the corresponding native modules, such as databases, downloads, network requests, etc., it is necessary to use Module to expose the interface to JS. Hippy SDK implemented some default modules, but it is very likely that they can not meet your needs, which requires you to extend the Module package.

# Module Extensions

We will use TestModule as an example to extend a Module from scratch, this Module will show how the front-end call native capabilities, and return the results to the front-end.

Extending a native module consists of four steps:

1. Create a subclass of `HippyNativeModuleBase`,
2. Add `HippyNativeModule` annotation,
3. Implement the methods exported to JS,
4. Register Module.

## 1. Create a subclass of HippyNativeModuleBase

First we need to create `TestModule` class and inherit `HippyNativeModuleBase`

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

## 2. Add HippyNativeModule annotation

HippyNativeModuleBase requires the addition of the annotation `@HippyNativeModule`.

HippyNativeModule has two annotation parameters.

- name: module name, js calls need to access the ability through this.
- thread: module thread. Including `HippyNativeModule.Thread.DOM` (Dom thread), `HippyNativeModule.Thread.MAIN` (main thread), `HippyNativeModule.Thread.BRIDGE` (Bridge thread, default value).

``` java
@HippyNativeModule(name = "TestModule", thread = HippyNativeModule.Thread.BRIDGE)
public class TestModule extends HippyNativeModuleBase
{
    ...
}
```

## 3. Implement the methods exported to JS

Methods exported to JS must use the annotation `@HippyMethod`, the method must be of type `public`, and the return type must be `void`.

Supported method parameter types include"

- Java basic data types.
- HippyArray: similar to ArrayList, not thread-safe.
- HippyMap: similar to HashMap, not thread-safe.
- Promise: callback JS trigger, through the `resolve` method to return success information to JS. through the `reject` method to return the failure of the implementation to JS.

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
    // parameters can be java base type, hippymap and hippyarry, but the front-end call must correspond correctly
    String hello = hippyMap.getString("hello");
    Log.d("TestModule", hello);
    if (true)
    {
        // TODO If the module is processed here, callback resolve
        HippyMap hippyMap1 = new HippyMap();
        hippyMap1.pushInt("code", 1);
        hippyMap1.pushString("result", "hello i am from native");
        promise.resolve(hippyMap1);
    }
    else
    {
        // callback rejection on failure
        HippyMap hippyMap1 = new HippyMap();
        hippyMap1.pushInt("code", -1);
        promise.reject(hippyMap1);
    }
}
```

## 4. Register the Module

Then you need to register this Module. you need to add this Module in the `getNativeModules` method of `HippyPackage` so that it can be accessed in JS.

```java
import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.HippyPackage;
import com.tencent.mtt.hippy.common.Provider;
import com.tencent.mtt.hippy.example.module.TestModule;

import com.tencent.mtt.hippy.modules.javascriptmodules.HippyJavaScriptModule;
import com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleBase;
import com.tencent.mtt.hippy.uimanager.HippyViewController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ExamplePackages implements HippyPackage
{
    @Override
    public Map<Class<? extends HippyNativeModuleBase>, Provider<? extends     HippyNativeModuleBase>> getNativeModules(final HippyEngineContext context)
    {
        Map<Class<? extends HippyNativeModuleBase>, Provider<? extends HippyNativeModuleBase>> modules = new HashMap<>();

        // regist the LogModule
        modules.put(ToastModule.class, new Provider<HippyNativeModuleBase>()
        {
            @Override
            public HippyNativeModuleBase get()
            {
                return new TestModule(context);
            }
        });

        return modules;
    }
```

## Caution

Time consuming operations cannot be performed synchronously in the extended module, as it may jam the whole engine communication thread. If there are time-consuming scenarios, please use asynchronous threads to handle them.

## Obfuscation notes

The class name and extension method name of the extended Module cannot be obfuscated, you can add obfuscation exceptions.

``` java
-keep class * extends com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleBase{ public *;}
```
