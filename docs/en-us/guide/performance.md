# Performance

Provide global `performance` to get performance data. 

---

# memory

`performance.memory` return statistics about the js heap (Only android supported, iOS will return `undefined`）。
> Minimum supported version `2.15.0`

```javascript

global.performance.memory = undefined || {
  // Heap size limit
  jsHeapSizeLimit: 4096,
  // Total heap size
  totalJSHeapSize: 2048,
  // Used heap size
  usedJSHeapSize: 1024,
  // The value of native_context is the number of the top-level contexts currently active.
  // Increase of this number over time indicates a memory leak.
  jsNumberOfNativeContexts: 1,
  // The value of detached_context is the number of contexts that were detached and not yet garbage collected.
  // This number being non-zero indicates a potential memory leak.
  jsNumberOfDetachedContexts: 0,
}

```
