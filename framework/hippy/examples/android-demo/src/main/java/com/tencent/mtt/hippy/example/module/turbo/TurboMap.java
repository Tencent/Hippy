package com.tencent.mtt.hippy.example.module.turbo;

import com.tencent.mtt.hippy.annotation.HippyTurboObj;
import com.tencent.mtt.hippy.annotation.HippyTurboProp;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

/**
 * 支持以引用的方式暴露给js使用的Map
 * TurboMap支持的类型如下：
 * 【框架转换后透传】int/long/double/String/boolean/HippyMap/HippyArray
 * 【引用】TurboArray/TurboMap
 */
@HippyTurboObj
public class TurboMap {

  private final HashMap<String, Object> mDatas;

  @Override
  public String toString() {
    return mDatas.toString();
  }

  public TurboMap() {
    mDatas = new HashMap<>();
  }

  public boolean containsKey(String key) {
    return mDatas.containsKey(key);
  }

  @HippyTurboProp(expose = true)
  public int size() {
    return mDatas.size();
  }

  public Set<String> keySet() {
    return mDatas.keySet();
  }

  public Set<Map.Entry<String, Object>> entrySet() {
    return mDatas.entrySet();
  }

  @HippyTurboProp(expose = true)
  public String getString(String key) {
    Object value = mDatas.get(key);
    return value == null ? null : String.valueOf(value);
  }

  public void remove(String key) {
    mDatas.remove(key);
  }

  @HippyTurboProp(expose = true)
  public double getDouble(String key) {
    Object value = mDatas.get(key);
    return value instanceof Number ? ((Number) value).doubleValue() : 0;
  }

  @HippyTurboProp(expose = true)
  public int getInt(String key) {
    Object value = mDatas.get(key);
    return value instanceof Number ? ((Number) value).intValue() : 0;
  }

  @HippyTurboProp(expose = true)
  public boolean getBoolean(String key) {
    Object value = mDatas.get(key);
    return value != null && (boolean) value;
  }

  @HippyTurboProp(expose = true)
  public long getLong(String key) {
    Object value = mDatas.get(key);
    return value instanceof Number ? ((Number) value).longValue() : 0;
  }

  @HippyTurboProp(expose = true)
  public TurboMap getTurboMap(String key) {
    Object value = mDatas.get(key);
    if (value instanceof TurboMap) {
      return (TurboMap) value;
    }
    return null;
  }

  @HippyTurboProp(expose = true)
  public TurboArray getTurboArray(String key) {
    Object value = mDatas.get(key);
    if (value instanceof TurboArray) {
      return (TurboArray) value;
    }
    return null;
  }

  @HippyTurboProp(expose = true)
  public HippyMap getHippyMap(String key) {
    Object value = mDatas.get(key);
    if (value instanceof HippyMap) {
      return (HippyMap) value;
    }
    return null;
  }

  @HippyTurboProp(expose = true)
  public HippyArray getHippyArray(String key) {
    Object value = mDatas.get(key);
    if (value instanceof HippyArray) {
      return (HippyArray) value;
    }
    return null;
  }

  public boolean isNull(String key) {
    return mDatas.get(key) == null;
  }

  public void pushNull(String key) {
    mDatas.put(key, null);
  }

  public void pushInt(String key, int value) {
    mDatas.put(key, value);
  }

  public void pushString(String key, String value) {
    mDatas.put(key, value);
  }

  public void pushBoolean(String key, boolean value) {
    mDatas.put(key, value);
  }

  public void pushDouble(String key, double value) {
    mDatas.put(key, value);
  }

  public void pushLong(String key, long value) {
    mDatas.put(key, value);
  }

  public void pushTurboArray(String key, TurboArray array) {
    mDatas.put(key, array);
  }

  public void pushTurboMap(String key, TurboMap map) {
    mDatas.put(key, map);
  }

  public void pushHippyArray(String key, HippyArray array) {
    mDatas.put(key, array);
  }

  public void pushHippyMap(String key, HippyMap map) {
    mDatas.put(key, map);
  }

  public void pushAll(Map map) {
    if (null != map) {
      mDatas.putAll(map);
    }
  }

  public void clear() {
    mDatas.clear();
  }
}
