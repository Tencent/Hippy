package com.tencent.mtt.hippy.example.module.turbo;

import com.tencent.mtt.hippy.annotation.HippyTurboObj;
import com.tencent.mtt.hippy.annotation.HippyTurboProp;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;

import java.util.ArrayList;

/**
 * 支持以引用的方式暴露给js使用的Array
 * TurboArray支持的类型如下：
 * 【框架转换后透传】int/long/double/String/boolean/HippyMap/HippyArray
 * 【引用】TurboArray/TurboMap
 */
@HippyTurboObj
public class TurboArray {

  private final ArrayList mDatas;

  public TurboArray() {
    mDatas = new ArrayList();
  }

  @HippyTurboProp(expose = true)
  public int size() {
    return mDatas.size();
  }

  @HippyTurboProp(expose = true)
  public int getInt(int index) {
    if (mDatas.size() > index) {
      Object value = mDatas.get(index);
      return value instanceof Number ? ((Number) value).intValue() : 0;
    }
    return 0;
  }

  @HippyTurboProp(expose = true)
  public long getLong(int index) {
    if (mDatas.size() > index) {
      Object value = mDatas.get(index);
      return value instanceof Number ? ((Number) value).longValue() : 0;
    }
    return 0;
  }

  @HippyTurboProp(expose = true)
  public double getDouble(int index) {
    if (mDatas.size() > index) {
      Object value = mDatas.get(index);
      return value instanceof Number ? ((Number) value).doubleValue() : 0;
    }
    return 0;
  }

  @HippyTurboProp(expose = true)
  public String getString(int index) {
    if (mDatas.size() > index) {
      return String.valueOf(mDatas.get(index));
    }
    return null;
  }

  @HippyTurboProp(expose = true)
  public boolean getBoolean(int index) {
    if (mDatas.size() > index) {
      Object value = mDatas.get(index);
      return (value instanceof Boolean) && (boolean) value;
    }
    return false;
  }

  @HippyTurboProp(expose = true)
  public TurboArray getTurboArray(int index) {
    if (mDatas.size() > index) {
      Object value = mDatas.get(index);
      return value instanceof TurboArray ? (TurboArray) value : null;
    }
    return null;
  }

  @HippyTurboProp(expose = true)
  public TurboMap getTurboMap(int index) {
    if (mDatas.size() > index) {
      Object value = mDatas.get(index);
      return value instanceof TurboMap ? (TurboMap) value : null;
    }
    return null;
  }

  @HippyTurboProp(expose = true)
  public HippyArray getHippyArray(int index) {
    if (mDatas.size() > index) {
      Object value = mDatas.get(index);
      return value instanceof HippyArray ? (HippyArray) value : null;
    }
    return null;
  }

  @HippyTurboProp(expose = true)
  public HippyMap getHippyMap(int index) {
    if (mDatas.size() > index) {
      Object value = mDatas.get(index);
      return value instanceof HippyMap ? (HippyMap) value : null;
    }
    return null;
  }

  public void pushInt(int value) {
    mDatas.add(value);
  }

  public void pushLong(long value) {
    mDatas.add(value);
  }

  public void pushDouble(double value) {
    mDatas.add(value);
  }

  public void pushBoolean(boolean value) {
    mDatas.add(value);
  }

  public void pushString(String value) {
    mDatas.add(value);
  }

  public void pushTurboArray(TurboArray array) {
    mDatas.add(array);
  }

  public void pushTurboMap(TurboMap map) {
    mDatas.add(map);
  }

  public void pushHippyArray(HippyArray array) {
    mDatas.add(array);
  }

  public void pushHippyMap(HippyMap map) {
    mDatas.add(map);
  }

  public void pushNull() {
    mDatas.add(null);
  }

  public void clear() {
    mDatas.clear();
  }

  @Override
  public String toString() {
    return mDatas.toString();
  }

}
