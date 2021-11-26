/* Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2018 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.tencent.mtt.hippy.common;

import com.tencent.mtt.hippy.utils.ArgumentUtils;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Iterator;

@SuppressWarnings({"deprecation", "unchecked", "rawtypes"})
public class HippyArray {

  private final ArrayList mDatas;

  public HippyArray() {
    mDatas = new ArrayList();
  }

  public ArrayList getInternalArray() {
    return mDatas;
  }

  public int size() {
    return mDatas.size();
  }

  public Object get(int index) {
    return mDatas.get(index);
  }

  public void pushObject(Object obj) {
    mDatas.add(obj);
  }

  public void setObject(int index, Object obj) {
    mDatas.set(index, obj);
  }

  public int getInt(int index) {
    if (mDatas.size() > index) {
      Object value = mDatas.get(index);
      return value instanceof Number ? ((Number) value).intValue() : 0;
    }
    return 0;
  }

  public long getLong(int index) {
    if (mDatas.size() > index) {
      Object value = mDatas.get(index);
      return value instanceof Number ? ((Number) value).longValue() : 0;
    }
    return 0;
  }

  public double getDouble(int index) {
    if (mDatas.size() > index) {
      Object value = mDatas.get(index);
      return value instanceof Number ? ((Number) value).doubleValue() : 0;
    }
    return 0;
  }

  public String getString(int index) {
    if (mDatas.size() > index) {
      return String.valueOf(mDatas.get(index));
    }
    return null;
  }

  public boolean getBoolean(int index) {
    if (mDatas.size() > index) {
      Object value = mDatas.get(index);
      return (value instanceof Boolean) && (boolean) value;
    }
    return false;
  }

  public HippyArray getArray(int index) {
    if (mDatas.size() > index) {
      Object value = mDatas.get(index);
      return value instanceof HippyArray ? (HippyArray) value : null;
    }
    return null;
  }

  public HippyMap getMap(int index) {
    if (mDatas.size() > index) {
      Object value = mDatas.get(index);
      return value instanceof HippyMap ? (HippyMap) value : null;
    }
    return null;
  }

  public Object getObject(int index) {
    if (mDatas.size() > index) {
      return mDatas.get(index);
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

  public void pushArray(HippyArray array) {
    mDatas.add(array);
  }

  public void pushMap(HippyMap map) {
    mDatas.add(map);
  }

  public void pushNull() {
    mDatas.add(null);
  }

  @SuppressWarnings("unused")
  public void clear() {
    mDatas.clear();
  }

  public HippyArray copy() {
    HippyArray newArray = new HippyArray();
    Iterator<Object> it = mDatas.iterator();
    Object value;
    Object newValue;
    while (it.hasNext()) {
      value = it.next();
      if (value instanceof HippyMap) {
        newValue = ((HippyMap) value).copy();
      } else if (value instanceof HippyArray) {
        newValue = ((HippyArray) value).copy();
      } else {
        newValue = value;
      }
      newArray.pushObject(newValue);
    }

    return newArray;
  }

  @Override
  public String toString() {
    return mDatas.toString();
  }

  public void pushJSONArray(JSONArray jArray) {
    if (jArray == null || jArray.length() <= 0) {
      return;
    }

    try {
      for (int i = 0; i < jArray.length(); i++) {
        Object obj = jArray.opt(i);
        if (obj == null) {
          pushNull();
        } else if (obj instanceof JSONObject) {
          HippyMap hippyMap = new HippyMap();
          hippyMap.pushJSONObject((JSONObject) obj);
          pushMap(hippyMap);
        } else if (obj instanceof JSONArray) {
          HippyArray hippyArray = new HippyArray();
          hippyArray.pushJSONArray((JSONArray) obj);
          pushArray(hippyArray);
        } else {
          pushObject(obj);
        }
      }
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  public JSONArray toJSONArray() {
    JSONArray jArray = new JSONArray();
    if (size() <= 0) {
      return jArray;
    }

    try {
      Iterator<Object> it = mDatas.iterator();
      Object value;
      while (it.hasNext()) {
        value = it.next();
        if (value instanceof HippyMap) {
          JSONObject jObjectMap = ((HippyMap) value).toJSONObject();
          jArray.put(jObjectMap);
        } else if (value instanceof HippyArray) {
          JSONArray jObjectArray = ((HippyArray) value).toJSONArray();
          jArray.put(jObjectArray);
        } else {
          jArray.put(value);
        }
      }
    } catch (Exception e) {
      e.printStackTrace();
    }

    return jArray;
  }

  public String getSignature(int index) {
    Object obj = get(index);
    if (obj == null) {
      return null;
    }
    return ArgumentUtils.getSupportSignature(obj.getClass());
  }
}
