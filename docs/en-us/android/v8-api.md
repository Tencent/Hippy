# V8 API

Get V8 instance and operate it。

---

# GetHeapStatistics

Get statistics about the V8 heap.
> Minimum supported version `2.15.0`

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

Get statistics about the V8 heap code.
> Minimum supported version `2.15.0`

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

Get statistics about the V8 heap spaces.
> Minimum supported version `2.15.0`

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

Generate a snapshot of the current V8 heap and writes it to a JSON file.
This file is intended to be used with tools such as Chrome DevTools.
> Minimum supported version `2.15.0`

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
