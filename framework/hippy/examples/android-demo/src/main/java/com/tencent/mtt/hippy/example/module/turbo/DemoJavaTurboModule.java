package com.tencent.mtt.hippy.example.module.turbo;

import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.annotation.HippyMethod;
import com.tencent.mtt.hippy.annotation.HippyNativeModule;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.modules.PromiseImpl;
import com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleBase;
import com.tencent.mtt.hippy.utils.LogUtils;

@HippyNativeModule(name = "demoTurbo")
public class DemoJavaTurboModule extends HippyNativeModuleBase {

  private static final String TAG = "DemoJavaTurboModule";

  public DemoJavaTurboModule(HippyEngineContext context) {
    super(context);
  }

  @HippyMethod(isSync = true)
  public double getNum(double num) {
    return num;
  }

  @HippyMethod(isSync = true)
  public String getString(String info) {
    return "demoTurbo" + ":" + info;
  }

  @HippyMethod(isSync = true)
  public boolean getBoolean(Boolean b) {
    LogUtils.d(TAG, "getBoolean " + b);
    return b != null && b.booleanValue();
  }

  @HippyMethod(isSync = true)
  public HippyMap getMap(HippyMap map) {
    LogUtils.d(TAG, "getMap ");
    return map;
  }

  @HippyMethod(isSync = true)
  public HippyArray getArray(HippyArray array) {
    LogUtils.d(TAG, "getArray ");
    return array;
  }

  @HippyMethod(isSync = true)
  public TurboMap getMapRef() {
    LogUtils.d(TAG, "getMapRef ");

    TurboMap turboMap = new TurboMap();
    for (int i = 0; i < 100; i++) {
      turboMap.pushInt(String.valueOf(i), i);
    }

    TurboArray turboArray = new TurboArray();
    for (int i = 0; i < 100; i++) {
      turboArray.pushInt(i);
    }

    turboMap.pushTurboArray("arrayRef", turboArray);
    return turboMap;
  }

  @HippyMethod(isSync = true)
  public void nativeWithPromise(String info, Promise promise) {
    LogUtils.d(TAG, "nativeWithPromise " + info + Thread.currentThread().toString() + " id=" + Thread.currentThread().getId());

    if (promise instanceof PromiseImpl) {
      ((PromiseImpl) promise).setContext(mContext);
    }
    promise.resolve("resolve from demoTurbo: " + info);
  }

  @HippyMethod(isSync = true)
  public TurboConfig getTurboConfig() {
    return new TurboConfig();
  }

  @HippyMethod(isSync = true)
  public String printTurboConfig(TurboConfig turboConfig) {
    if (turboConfig == null) {
      return "turboConfig == null";
    }

    return turboConfig.toString();
  }
}
