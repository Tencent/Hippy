# Performance

## SDK startup performance indicators

### Introduce

The loading and execution process of `Hippy` Native SDK is shown in the figure below:

![hippy-launch-steps](../assets/img/hippy-launch-steps.png)

Corresponding to the above stages, `Hippy` Native SDK provides the corresponding time-consuming and other performance indicators for developers to obtain, as shown in the following table:

| Category | Description | Key |
| :------- | :--------------- | :--------------------- |
| JS engine | Initialize JS engine (Android only) | hippyInitJsFramework |
| Vendor bundle | Vendor bundle loading | hippyCommonLoadSource |
| Vendor bundle | Vendor bundle execution | hippyCommonExecuteSource |
| Business bundle | Business bundle loading | hippySecondaryLoadSource |
| Business bundle | Business bundle execution | hippySecondaryExecuteSource |
| Overall | Bridge startup | hippyBridgeStartup |
| Overall | JS entry execution | hippyRunApplication |
| Overall | First Paint | hippyFirstPaint |




### Native get performance data

#### Android API Guidelines

##### 1. Inject `HippyEngineMonitorAdapter`

```java
public class MyEngineMonitorAdapter extends DefaultEngineMonitorAdapter {
    @Override
    public void reportEngineLoadResult(int code, int loadTime,
        List<HippyEngineMonitorEvent> loadEvents, Throwable e) {
        // Engine creation completed callback
    }

    @Override
    public void reportModuleLoadComplete(HippyRootView rootView, int loadTime,
        List<HippyEngineMonitorEvent> loadEvents) {
        // Business JS execute and first paint completed callback
    }
}
```

```java
HippyEngine.EngineInitParams initParams = new HippyEngine.EngineInitParams();
initParams.engineMonitor = new MyEngineMonitorAdapter();
...
HippyEngine engine = HippyEngine.create(initParams);
```

##### 2. Get performance data

It is recommended to call after reportModuleLoadComplete to obtain complete performance data.

Use as

```java
TimeMonitor monitor = rootView == null ? null : rootView.getTimeMonitor();
if (monitor != null) {
    List<HippyEngineMonitorEvent> list = monitor.getAllSeparateEvents();
}
```

The constants to each indicator are defined in the `HippyEngineMonitorEvent` class, and the naming rules are: `hippyXxx` corresponds to `SEPARATE_EVENT_XXX`.

#### iOS API Guidelines

It is recommended to obtain performance indicators after HippyRootView is loaded (that is, after receiving `HippyContentDidAppearNotification` notification).

Use as

```objc
int64_t duration = [bridge.performanceLogger durationForTag:HippyPLxxxTag];
```



### JS get performance data

#### Get performance data

```js
performance.getEntries();
```

Returns

```json
// Multiple Hippy instances will return multiple array elements, distinguished by the name field
[PerformanceNavigationTiming {
  name: "Demo",
  entryType: "navigation",
  hippyCommonLoadSourceStart: 0,
  hippyCommonLoadSourceEnd: 233,
  ...
}, ...]
```

Each performance indicator corresponds to two fields `hippyXxxStart` and `hippyXxxEnd`, and the value is milliseconds relative to `performance.timeOrigin`.

#### Add custom data

```js
performance.markStart(appName, key); // e.g.: appName='Demo', key='showContent'
performance.markEnd(appName, key);
```




---

## memory

Provide global `performance` to get performance data. 

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

