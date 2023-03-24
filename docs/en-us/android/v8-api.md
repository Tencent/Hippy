# V8 API

Get V8 JS engine instance and operate it.

---

# GetHeapStatistics

Get statistics about the V8 heap.

!> This method must be called in the js thread.

> Minimum supported version `2.15.0`

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

Get statistics about the V8 heap code.

!> This method must be called in the js thread.

> Minimum supported version `2.15.0`

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

Get statistics about the V8 heap spaces.

!> This method must be called in the js thread.

> Minimum supported version `2.15.0`

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

Generate a snapshot of the current V8 heap and writes it to a JSON file.
This file is intended to be used with tools such as Chrome DevTools.

!> This method must be called in the js thread.

> Minimum supported version `2.15.0`

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

Print current stack trace.

!> This method must be called in the js thread.

> Minimum supported version `2.15.0`

``` java
V8 v8 = mHippyEngine.getV8();
if (v8 != null) {
  mHippyEngine.getEngineContext().getBridgeManager().runInJsThread((param, e) -> {
    v8.printCurrentStackTrace((str, e1) -> LogUtils.e("hippy", "trace = " + str));
  });
}
```

# addNearHeapLimitCallback

Add a callback to invoke in case the heap size is close to the heap limit.

!> This method must be called in the js thread.

> Minimum supported version `2.15.0`

``` java
V8 v8 = mHippyEngine.getV8();
if (v8 != null) {
  mHippyEngine.getEngineContext().getBridgeManager().runInJsThread((param, e) -> {
    v8.addNearHeapLimitCallback((currentHeapLimit, initialHeapLimit) -> currentHeapLimit * 2);
  });
}
```

# requestInterrupt

Request V8 to interrupt long running JavaScript code and invoke the given callback. After |callback| returns control will be returned to the JavaScript code.
> Minimum supported version `2.15.0`

``` java
V8 v8 = mHippyEngine.getV8();
if (v8 != null) {
  v8.requestInterrupt((param, e) -> {
      v8.printCurrentStackTrace((str, e1) -> LogUtils.e("hippy", "trace = " + str));
  });
}
```

