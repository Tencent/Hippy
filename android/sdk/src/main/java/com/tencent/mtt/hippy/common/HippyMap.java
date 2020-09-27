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

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;

/**
 * FileName: HippyMap
 * Description：
 * History：
 */
public class HippyMap
{

	private final HashMap<String, Object>	mDatas;

	@Override
	public String toString()
	{
		return mDatas == null ? "null" : mDatas.toString();
	}

	public HippyMap()
	{
		mDatas = new HashMap<>();
	}

	public boolean containsKey(String key)
	{
		return mDatas.containsKey(key);
	}

	public int size()
	{
		return mDatas.size();
	}

	public Set<String> keySet()
	{
		return mDatas.keySet();
	}

	public Set<Map.Entry<String, Object>> entrySet()
	{
		return mDatas.entrySet();
	}

	public Object get(String key)
	{
		return mDatas.get(key);
	}

  public String getString(String key, String defaultValue)
  {
    Object value = mDatas.get(key);
    return value == null ? defaultValue : String.valueOf(value);
  }

  public String getString(String key)
  {
    return getString(key, null);
  }

	public void remove(String key)
	{
		mDatas.remove(key);
	}

  public double getDouble(String key, double defaultValue)
  {
    Object value = mDatas.get(key);
    return value instanceof Number ? ((Number) value).doubleValue() : defaultValue;
  }

  public double getDouble(String key)
  {
    return getDouble(key, 0);
  }

  public int getInt(String key, int defaultValue)
  {
    Object value = mDatas.get(key);
    return value instanceof Number ? ((Number) value).intValue() : defaultValue;
  }

  public int getInt(String key)
  {
    return getInt(key, 0);
  }

  public boolean getBoolean(String key, boolean defaultValue)
  {
    Object value = mDatas.get(key);
    return value == null ? defaultValue : (boolean) value;
  }

  public boolean getBoolean(String key)
  {
    return getBoolean(key, false);
  }

  public long getLong(String key, long defaultValue)
  {
    Object value = mDatas.get(key);
    return value instanceof Number ? ((Number) value).longValue() : defaultValue;
  }

  public long getLong(String key)
  {
    return getLong(key, 0);
  }

	public HippyMap getMap(String key)
	{
		Object value = mDatas.get(key);
		if (value instanceof HippyMap)
		{
			return (HippyMap) value;
		}
		return null;
	}

	public HippyArray getArray(String key)
	{
		Object value = mDatas.get(key);
		if (value instanceof HippyArray)
		{
			return (HippyArray) value;
		}
		return null;
	}

	public boolean isNull(String key)
	{
			return mDatas.get(key) == null;
	}

	public void pushNull(String key)
	{
		mDatas.put(key, null);
	}

	public void pushInt(String key, int value)
	{
		mDatas.put(key, value);
	}

	public void pushString(String key, String value)
	{
		mDatas.put(key, value);
	}

	public void pushBoolean(String key, boolean value)
	{
		mDatas.put(key, value);
	}

	public void pushDouble(String key, double value)
	{
		mDatas.put(key, value);
	}

	public void pushLong(String key, long value)
	{
		mDatas.put(key, value);
	}

	public void pushArray(String key, HippyArray array)
	{
		mDatas.put(key, array);
	}

	public void pushMap(String key, HippyMap map)
	{
		mDatas.put(key, map);
	}

	// 批量加入。QB里有用到
	public void pushAll(HippyMap map)
	{
		if (null != map)
		{
			mDatas.putAll(map.mDatas);
		}
	}

	public void pushObject(String key, Object obj)
	{
		if (obj == null)
		{
			pushNull(key);
		}
		else if (obj instanceof String)
		{
			pushString(key, (String) obj);
		}
		else if (obj instanceof HippyMap)
		{
			pushMap(key, (HippyMap) obj);
		}
		else if (obj instanceof HippyArray)
		{
			pushArray(key, (HippyArray) obj);
		}
		else if (obj instanceof Integer)
		{
			pushInt(key, (Integer) obj);
		}
		else if (obj instanceof Boolean)
		{
			pushBoolean(key, (Boolean) obj);
		}
		else if (obj instanceof Double)
		{
			pushDouble(key, (Double) obj);
		}
		else if (obj instanceof Float)
		{
			pushDouble(key, ((Number) obj).doubleValue());
		}
		else if (obj instanceof Long)
		{
			pushLong(key, (Long) obj);
		}
		else
		{
			Class<?> clazz = obj.getClass();
			if(clazz.isAssignableFrom(int.class))
			{
				pushInt(key, (Integer) obj);
			}
			else if (clazz.isAssignableFrom(boolean.class))
			{
				pushBoolean(key, (Boolean) obj);
			}
			else if (clazz.isAssignableFrom(double.class))
			{
				pushDouble(key, (Double) obj);
			}
			else if(clazz.isAssignableFrom(float.class))
			{
				pushDouble(key, ((Number) obj).doubleValue());
			}
			else if (clazz.isAssignableFrom(long.class))
			{
				pushLong(key, (Long) obj);
			}
			else
			{
				throw new RuntimeException("push unsupported object into HippyMap");
			}
		}
	}


    public void clear()
	{
		mDatas.clear();
    }

	public HippyMap copy()
	{
		HippyMap newMap = new HippyMap();
		Iterator<Map.Entry<String, Object>> it = mDatas.entrySet().iterator();
		Map.Entry<String, Object> entry;
		Object value;
		Object newValue;
		while (it.hasNext())
		{
			entry = it.next();
			value = entry.getValue();

			if(value instanceof HippyMap )
			{
				newValue = ((HippyMap)value).copy();
			}
			else if(value instanceof HippyArray)
			{
				newValue = ((HippyArray)value).copy();
			}else{
				newValue = value;
			}
			newMap.pushObject(entry.getKey(),newValue);
		}

		return newMap;
	}

	public void pushJSONObject(JSONObject jObject) {
		if (jObject == null) {
			return;
		}

		try {
			Iterator<?> it = jObject.keys();
			while(it.hasNext()){
				String key = it.next().toString();
				Object obj = jObject.opt(key);
				if (jObject.isNull(key)) {
					pushNull(key);
				} else if (obj instanceof JSONObject) {
					HippyMap hippyMap = new HippyMap();
					hippyMap.pushJSONObject((JSONObject)obj);
					pushMap(key, hippyMap);
				} else if (obj instanceof JSONArray) {
					HippyArray hippyArray = new HippyArray();
					hippyArray.pushJSONArray((JSONArray)obj);
					pushArray(key, hippyArray);
				} else {
					pushObject(key, obj);
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	public JSONObject toJSONObject() {
		JSONObject jObject = new JSONObject();
		if (size() <= 0) {
			return jObject;
		}

		Iterator var2 = entrySet().iterator();
		try {
			while (var2.hasNext()) {
				Map.Entry<String, Object> entry = (Map.Entry)var2.next();
				String key = entry.getKey();
				if (entry.getValue() instanceof HippyMap) {
					JSONObject jObjectMap = ((HippyMap)entry.getValue()).toJSONObject();
					jObject.put(key, jObjectMap);
				} else if (entry.getValue() instanceof HippyArray) {
					JSONArray jObjectArray = ((HippyArray)entry.getValue()).toJSONArray();
					jObject.put(key, jObjectArray);
				} else {
					jObject.put(key, entry.getValue());
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
		}

		return jObject;
	}
}
