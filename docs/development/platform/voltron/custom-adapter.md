# 定制适配器

Flutter App 开发中存在很多第三方基础库。

Voltron 将所有基础能力接口化，抽象为 Adapter，方便业务注入实现，同时大多数基础能力我们也默认实现了一个最简单的方案。

Voltron 现在所提供的 Adapter 包括：

- `VoltronHttpAdapter`：Http 请求 Adapter。
- `VoltronExceptionHandlerAdapter`：引擎和 JS 异常处理 Adapter。
- `VoltronStorageAdapter`：数据库（KEY-VALUE）Adapter。

# VoltronHttpAdapter

Voltron SDK 提供默认的实现 `DefaultHttpAdapter`。如果 `DefaultHttpAdapter`无法满足你的需求，请参考 `DefaultHttpAdapter`代码接入 `VoltronHttpAdapter` 实现。

# VoltronExceptionHandlerAdapter

Voltron SDK 提供默认空实现 `DefaultExceptionHandler`。当你的业务基于 Voltron 上线后，必然会出现一些JS异常，监控这些异常对于线上质量具有很重要的意义。Voltron SDK 会抓取这些 JS 异常，然后通过 `VoltronExceptionHandlerAdapter` 抛给使用者。

# VoltronStorageAdapter

Voltron SDK 提供默认的实现 `DefaultStorageAdapter`。


