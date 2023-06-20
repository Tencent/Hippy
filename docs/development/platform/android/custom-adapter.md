# 自定义适配器

Android App 开发中存在很多第三方基础库。

比如图片缓存系统常用的有：Picasso、Glide、Fresco 等。

Hippy SDK 如果在代码中直接集成这些第三方基础库，很有可能与你的项目实际情况冲突。为了解决这个矛盾点，Hippy SDK 将所有基础能力接口化，抽象为 Adapter，方便业务注入实现，同时大多数基础能力我们也默认实现了一个最简单的方案。

Hippy SDK 现在所提供的 Adapter 包括：

- `HippyHttpAdapter`：Http 请求 Adapter。
- `HippyExceptionHandlerAdapter`：引擎和 JS 异常处理 Adapter。
- `HippySharedPreferencesAdapter`：SharedPreferences Adapter。
- `HippyStorageAdapter`：数据库（KEY-VALUE）Adapter。
- `HippyExecutorSupplierAdapter`：线程池 Adapter。
- `HippyEngineMonitorAdapter`：Hippy 引擎状态监控 Adapter。

---

# HippyHttpAdapter

Hippy SDK 提供默认的实现 `DefaultHttpAdapter`。如果 `DefaultHttpAdapter`无法满足你的需求，请参考 `DefaultHttpAdapter`代码接入 `HippyHttpAdapter` 实现。

# HippyExceptionHandlerAdapter

Hippy SDK 提供默认空实现 `DefaultExceptionHandler`。当你的业务基于 Hippy 上线后，必然会出现一些JS异常，监控这些异常对于线上质量具有很重要的意义。Hippy SDK 会抓取这些 JS 异常，然后通过 `HippyExceptionHandlerAdapter` 抛给使用者。

## handleJsException

处理抓取到的JS异常。JS 异常不会导致引擎不可运行，但可能导致用户感知或者业务逻辑出现问题，是线上质量的最重要衡量标准。

# HippySharedPreferencesAdapter

Hippy SDK 提供默认的实现 `DefaultSharedPreferencesAdapter`。大多数场景也不需要进行扩展。

# HippyStorageAdapter

Hippy SDK 提供默认的实现 `DefaultStorageAdapter`。

# HippyExecutorSupplierAdapter

Hippy SDK 提供默认的实现 `DefaultExecutorSupplierAdapter`。

# HippyEngineMonitorAdapter

Hippy SDK 提供默认空实现 `DefaultEngineMonitorAdapter`。当你需要查看引擎加载速度和模块加载速度时，可以通过此Adapter获取到相关信息。

# ImageDecoderAdapter

用于支持开发者有自定义格式图片的解码需求，需要开发者自行提供接口类实例。
