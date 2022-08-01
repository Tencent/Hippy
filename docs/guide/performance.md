# Performance

提供全局 `performance` 对象，用于获取性能数据。

# memory

`performance.memory` 返回 js 引擎中内存的统计数据（仅 Android 支持，iOS将返回`undefined`）。
> 最低支持版本 `2.15.0`

```javascript

global.performance.memory = undefined || {
  jsHeapSizeLimit: 4096, // 堆内存大小限制
  totalJSHeapSize: 2048, // 可使用的堆内存
  usedJSHeapSize: 1024, // 已使用的堆内存
  jsNumberOfNativeContexts: 1, // 当前活动的顶层上下文的数量（随着时间的推移，此数字的增加表示内存泄漏）
  jsNumberOfDetachedContexts: 0, // 已分离但尚未回收垃圾的上下文数（该数字不为零表示潜在的内存泄漏）
}

```
