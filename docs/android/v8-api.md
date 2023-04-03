# V8 API

获取 V8 JS 引擎对象，并操作相关方法。

---

# GetHeapStatistics

获取 js 堆内存信息。

!> 注意：该方法必须在 js 线程中调用（使用示例的 runInJsThread 方法）。

> 最低支持版本 `2.15.0`

``` java
V8 v8 = mHippyEngine.getV8();
if (v8 != null) {
  mHippyEngine.getEngineContext().getBridgeManager().runInJsThread((param, e) -> {
    boolean success = false;
    try {
      success = v8.getHeapStatistics(new Callback<V8HeapStatistics>() {
        @Override
        public void callback(V8HeapStatistics param, Throwable e) {
          if (param != null) {
            // success
          } else {
            // error
          }
        }
      });
    } catch (NoSuchMethodException ex) {
      ex.printStackTrace();
    }
    if (!success) {
      // error
    }
  });
}
```

# GetHeapCodeStatistics

获取js堆中代码及其元数据的统计信息。

!> 注意：该方法必须在 js 线程中调用（使用示例的 runInJsThread 方法）。

> 最低支持版本 `2.15.0`

``` java
V8 v8 = mHippyEngine.getV8();
if (v8 != null) {
  mHippyEngine.getEngineContext().getBridgeManager().runInJsThread((param, e) -> {
    boolean success = false;
    try {
      success = v8.getHeapCodeStatistics(new Callback<V8HeapStatistics>() {
        @Override
        public void callback(V8HeapCodeStatistics param, Throwable e) {
          if (param != null) {
            // success
          } else {
            // error
          }
        }
      });
    } catch (NoSuchMethodException ex) {
      ex.printStackTrace();
    }
    if (!success) {
      // error
    }
  });
}
```

# GetHeapSpaceStatistics

返回堆各个空间的统计信息。

!> 注意：该方法必须在 js 线程中调用（使用示例的 runInJsThread 方法）。

> 最低支持版本 `2.15.0`

``` java
V8 v8 = mHippyEngine.getV8();
if (v8 != null) {
  mHippyEngine.getEngineContext().getBridgeManager().runInJsThread((param, e) -> {
    boolean success = false;
    try {
      success = v8.getHeapSpaceStatistics(new Callback<ArrayList<V8HeapSpaceStatistics>>() {
        @Override
        public void callback(ArrayList<V8HeapSpaceStatistics> param, Throwable e) {
          if (param != null) {
            // success
          } else {
            // error
          }
        }
      });
    } catch (NoSuchMethodException ex) {
      ex.printStackTrace();
    }
    if (!success) {
      // error
    }
  });
}
```

# WriteHeapSnapshot

生成一个堆快照（可导入 Chrome 浏览器开发者工具分析）。

!> 注意：该方法必须在 js 线程中调用（使用示例的 runInJsThread 方法）。

> 最低支持版本 `2.15.0`

``` java
V8 v8 = mHippyEngine.getV8();
if (v8 != null) {
  File hippyFile = FileUtils.getHippyFile(mHippyEngine.getEngineContext().getGlobalConfigs().getContext());
  String snapshotPath = hippyFile.getAbsolutePath() + File.separator + "snapshot" + File.separator + "1.heapsnapshot";
  boolean success = false;
  try {
    success = v8.writeHeapSnapshot(snapshotPath, new Callback<Integer>() {
      @Override
      public void callback(Integer param, Throwable e) {
        if (param == 0) {
          // success
        } else {
          // error
        }
      }
    });
  } catch (NoSuchMethodException e) {
    e.printStackTrace();
  }
  if (!success) {
    // error
  }
}
```

# printCurrentStackTrace

打印当前堆栈信息。

!> 注意：该方法必须在 js 线程中调用（使用示例的 runInJsThread 方法）。

> 最低支持版本 `2.15.0`

``` java
V8 v8 = mHippyEngine.getV8();
if (v8 != null) {
  mHippyEngine.getEngineContext().getBridgeManager().runInJsThread((param, e) -> {
    v8.printCurrentStackTrace((str, e1) -> LogUtils.e("hippy", "trace = " + str));
  });
}
```

# addNearHeapLimitCallback

添加一个回调。当 V8 堆大小接近最大限制的场景下会回调该方法。

!> 注意：该方法必须在 js 线程中调用（使用示例的 runInJsThread 方法）。

> 最低支持版本 `2.15.0`

``` java
V8 v8 = mHippyEngine.getV8();
if (v8 != null) {
  mHippyEngine.getEngineContext().getBridgeManager().runInJsThread((param, e) -> {
    v8.addNearHeapLimitCallback((currentHeapLimit, initialHeapLimit) -> currentHeapLimit * 2);
  });
}
```

# requestInterrupt

请求 V8 打断当前正在执行耗时长的 js 任务，并调用我们注入的回调方法。回调完成后控制权将会返回给 js 代码。

!> 该方法可以在任意线程中调用。

> 最低支持版本 `2.15.0`

``` java
V8 v8 = mHippyEngine.getV8();
if (v8 != null) {
  v8.requestInterrupt((param, e) -> {
      v8.printCurrentStackTrace((str, e1) -> LogUtils.e("hippy", "trace = " + str));
  });
}
```
