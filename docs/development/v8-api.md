# V8 相关初始化参数

在HippyEngine初始化的时候，EngineInitParams属性里有以下v8相关的属性参数。

## codeCacheTag

code cache 是V8中的一个特性，简单说就是JavaScript代码在执行前，需要进行解析和编译，才能正确执行，解析编译过程是耗时的，V8 暴露了一个方法，可以将编译产物序列化存储下来，下次再执行相同一段代码时，就可以用之前缓存的内容，节省了解析编译的时间，codeCacheTag作为编译内容缓存的key，设置后便会开启v8 code cache能力，建议开发者对该初始化参数进行设置，可以有效降低非首次启动js bundle加载运行耗时。

## v8InitParams

- initialHeapSize代表v8初始Heap size
- maximumHeapSize代表v8最大Heap size

由于v8的内存是自己管理的，使用策略是尽可能使用更多的内存，只有在达到maximumHeapSize 80%左右的时候才会触发gc，未达到之前会一直增长，达到80%触发gc的同时会回调near_heap_limit_callback接口获取内存增量，这里内存增量通过sdk内部接口V8VMInitParam::HeapLimitSlowGrowthStrategy返回，默认内存增长策略是当前max值*2，如果前端申请大内存，扩容后还不满足内存分配就会产生OOM.

在无限滚动列表场景，设置maximumHeapSize可以有效降低v8内存增加速率。

修改v8初始内存参数虽然能减少内存增量，但频繁的内存申请和gc，可能引入以下2个负面影响：

- 首屏性能下降
- OOM率升高

所以v8初始化内存参数的设置需要跟进具体的业务场景设置合适的值，并做完整的测试验证，如果不是内存占用有严格要的求场景不建议设置该初始化参数。

# V8 API

获取 V8 JS 引擎对象，并操作相关方法。

---

## GetHeapStatistics

获取 js 堆内存信息。

> 最低支持版本 `2.15.0`

``` java
V8 v8 = mHippyEngine.getV8();
if (v8 != null) {
  boolean success = v8.getHeapStatistics(new Callback<V8HeapStatistics>() {
    @Override
    public void callback(V8HeapStatistics param, Throwable e) {
      if (param != null) {
        // success
      } else {
        // error
      }
    }
  });
  if (!success) {
    // error
  }
}
```

## GetHeapCodeStatistics

获取js堆中代码及其元数据的统计信息。
> 最低支持版本 `2.15.0`

``` java
V8 v8 = mHippyEngine.getV8();
if (v8 != null) {
  boolean success = v8.getHeapCodeStatistics(new Callback<V8HeapCodeStatistics>() {
    @Override
    public void callback(V8HeapCodeStatistics param, Throwable e) {
      if (param != null) {
        // success
      } else {
        // error
      }
    }
  });
  if (!success) {
    // error
  }
}
```

## GetHeapSpaceStatistics

返回堆各个空间的统计信息。
> 最低支持版本 `2.15.0`

``` java
V8 v8 = mHippyEngine.getV8();
if (v8 != null) {
  boolean success = v8.getHeapSpaceStatistics(new Callback<V8HeapSpaceStatistics>() {
    @Override
    public void callback(V8HeapSpaceStatistics param, Throwable e) {
      if (param != null) {
        // success
      } else {
        // error
      }
    }
  });
  if (!success) {
    // error
  }
}
```

## WriteHeapSnapshot

生成一个堆快照（可导入Chrome浏览器开发者工具分析）。
> 最低支持版本 `2.15.0`

``` java
V8 v8 = mHippyEngine.getV8();
if (v8 != null) {
  File hippyFile = FileUtils.getHippyFile(mHippyEngine.getEngineContext().getGlobalConfigs().getContext());
  String snapshotPath = hippyFile.getAbsolutePath() + File.separator + "snapshot" + File.separator + "1.heapsnapshot";
  boolean success = v8.writeHeapSnapshot(snapshotPath, new Callback<Integer>() {
    @Override
    public void callback(Integer param, Throwable e) {
      if (param == 0) {
        // success
      } else {
        // error
      }
    }
  });
  if (!success) {
    // error
  }
}
```
