# 一、JSI是什么？
 ==JSI==是一个精简通用型的JS引擎接口，理论上可以对接任何JS引擎，包括Google的V8和微软的ChakraCore，或者是RN现在使用的JavaScriptCore（JSC）的新版本（JSI已经集成到RN的0.59版本中，并且在该版本中升级了JSC的版本）。
同时，==JSI==是架起 JS 和Native之间的桥梁，通过在C++层实现一个 JSI::HostObject，现在不需要序列化成JSON并双向传递等一系列操作，实现了Native和 JS间的直接通讯。
# 二、使用步骤
## 1.JS调用java方法
如果希望通过前端调用java端的代码，应该将java函数注册到全局，这是一段示例代码

```java
public class TestJSIInstaller {
    public native void InstallBinding(long javaScriptContextHolder,jstring moduleName);

    public void runTest() {
        ......
    }
}
```
在安卓工程中，应该调用该==InstallBinding==方法。

```java
@Override
public void ExampleFun(ReactContext context) {
  new TestJSIInstaller().InstallBinding(context.getJavaScriptContextHolder().get());
}
```
## 2.java调用js方法
需要被调用的js方法应该是global的，像下面这样：

```javascript

global.jsCallSyncHook = function exampleFun() {
    ......
};
```
在JSI中实现的函数getPropertyAsFunction(*runtime, "jsCallSyncHook")就可以返回Funtion变量，在Function之上调用成员函数call(Runtime)即可调用js端的global函数。

