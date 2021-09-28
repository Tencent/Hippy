# 自定义终端模块

很多时候 JS 需要访问对应终端的一些能力模块，比如数据库、下载、网络请求等，这时候就需要使用 Module 来暴露接口给JS使用。Hippy SDK 中默认实现了部分 Module，但这极有可能无法满足你的需求，这就需要你对 Module 进行扩展封装。

# Module扩展

我们将以 TestModule 为例，从头扩展一个 Module，这个 Module 将展示前端如何调用终端能力，并且把结果返回给前端。

终端扩展Module包括四步：

1. 创建 HippyNativeModuleBase 的子类。
2. 添加 HippyNativeModule 注解。
3. 实现导出给 JS 的方法。
4. 注册 Module。

## 创建HippyNativeModuleBase的子类

首先我们需要创建TestModule类，并且继承`HippyNativeModuleBase`。

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

## 添加HippyNativeModule注解

HippyNativeModuleBase 要求增加注解 `@HippyNativeModule` 。

HippyNativeModule有两个注解参数：

- name：能力名称，js调用时需要通过此访问该能力。
- thread：能力运行的线程。包括 `HippyNativeModule.Thread.DOM`（Dom线程）、`HippyNativeModule.Thread.MAIN`（主线程）、`HippyNativeModule.Thread.BRIDGE`（Bridge线程、默认值）。

``` java
@HippyNativeModule(name = "TestModule", thread = HippyNativeModule.Thread.BRIDGE)
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
- Promise：回调JS的触发器，通过 `resolve` 方法返回成功信息给JS。通过 `reject` 方法返回失败实现给JS。

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

然后需要注册这个Module。需要在 `HippyPackage` 的 `getNativeModules` 方法中添加这个 Module，这样它才能在JS中被访问到。

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

## 注意事项

扩展Module中不能同步执行耗时操作，这可能卡住整个引擎通信线程。存在耗时场景，请使用异步线程处理。

## 混淆说明

扩展 Module 的类名和扩展方法方法名不能混淆，可以增加混淆例外。

``` java
-keep class * extends com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleBase{ public *;}
```
