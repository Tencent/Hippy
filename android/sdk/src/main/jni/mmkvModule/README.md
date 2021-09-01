# hippy-kkmv
## 介绍
基于==JSI==实现将mmkv的方法注册到JS端。注册的方法已通过jni注册到java端，需要在java端调用==bridge.installBindingMMKV(String path)==将MMKV方法注册到前端。

## 已注册的方法
可供前端调用的MMKV方法目前有

 - mmkvSet
 - mmkvGetBoolean
 - mmkvGetString
 - mmkvGetNumber
 - mmkvDelete
 - mmkvGetAllKeys
 - mmkvClearAll

