# Hippy Core 架构

Hippy 开发的时候，前端 JS 经常需要访问一些双端（Android 和 iOS）通用能力，Hippy 推荐使用 `internalBinding` 来实现底层能力扩展（我们将这项能力称为 [Core 架构](//github.com/Tencent/Hippy/tree/master/framework/js/core)），它和 Node.js 的 internalBinding 一样，使用 C++ 进行开发，直接共享 JS 和 C++ 运行环境和数据，提供了非常高的 JS 和终端通信性能。

它的原理是在 JS 环境中直接插入函数、类等方式，JS 使用这些函数或方法，可以直接访问 C++ 代码。

但如果涉及到平台相关，依然需要分平台桥接。

目前 Hippy 里的[定时器](../guide/timer.md)和[日志](../guide/console.md)模块都是使用 Core 实现。

![Core 架构对比](//puui.qpic.cn/vupload/0/1579662891889_qwnzemj0cto.png/0)
