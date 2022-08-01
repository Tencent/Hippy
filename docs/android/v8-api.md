# V8 API

获取V8对象，并操作相关方法。

# GetHeapStatistics

获取js堆内存信息。
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

# GetHeapCodeStatistics

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

# GetHeapSpaceStatistics

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

# WriteHeapSnapshot

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
