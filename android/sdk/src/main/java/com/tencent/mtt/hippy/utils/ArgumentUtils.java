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
package com.tencent.mtt.hippy.utils;

import android.os.Bundle;
import android.os.Parcelable;
import android.text.TextUtils;
import android.util.Log;

import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.lang.reflect.Type;
import java.util.Iterator;
import java.util.Set;

public class ArgumentUtils
{

	private static final byte[] EMPTY_OBJ_BYTES = new byte[] { '"', '"' };
	private static final byte[]	EMPTY_STRING_BYTES	= new byte[] { 'n', 'u', 'l', 'l' };

	public static HippyArray parseToArray(String json)
	{
		HippyArray array = new HippyArray();
		if (TextUtils.isEmpty(json))
		{
			return array;
		}

		try
		{
			JSONArray jsonArray = new JSONArray(json);
			int length = jsonArray.length();
			Object obj;
			for (int i = 0; i < length; i++)
			{
				obj = jsonArray.get(i);
				parseObjectGotoArray(array, obj);
			}

			return array;
		}
		catch (Throwable e)
		{
			return array;
		}

	}

	public static HippyArray fromJavaArgs(Object[] args)
	{
		HippyArray array = new HippyArray();
		if (args == null || args.length <= 0)
		{
			return array;
		}
		try
		{
			int length = args.length;
			for (int i = 0; i < length; i++)
			{
				Object argument = args[i];
				if (argument == null)
				{
					array.pushNull();
					continue;
				}
				parseObjectGotoArray(array, argument);
			}
		}
		catch (Throwable e)
		{

		}
		return array;
	}

	public static HippyMap parseToMap(String json)
	{
		HippyMap map = new HippyMap();
		if (TextUtils.isEmpty(json))
		{
			return map;
		}
		try
		{

			JSONObject jsonObj = new JSONObject(json);
			Iterator<String> keys = jsonObj.keys();
			while (keys.hasNext())
			{
				String key = keys.next();
				parseObjectGotoMap(map, key, jsonObj.get(key));
			}
			return map;
		}
		catch (Throwable e)
		{
			return map;
		}
	}

	private static void parseObjectGotoArray(HippyArray array, Object obj) throws JSONException
	{
		if (obj == null || obj == JSONObject.NULL)
		{
			array.pushNull();
			return;
		}
		Class cls = obj.getClass();
		if (obj instanceof String)
		{
			array.pushString((String) obj);
		}
		else if (cls == int.class || cls == Integer.class)
		{
			array.pushInt((Integer) obj);
		}
		else if (cls == double.class || cls == Double.class)
		{
			array.pushDouble((Double) obj);
		}
		else if (cls == long.class || cls == Long.class)
		{
			array.pushLong((Long) obj);
		}
		else if (cls == boolean.class || cls == Boolean.class)
		{
			array.pushBoolean((Boolean) obj);
		}
		else if (cls == HippyArray.class)
		{
			array.pushArray((HippyArray) obj);
		}
		else if (cls == HippyMap.class)
		{
			array.pushMap((HippyMap) obj);
		}
		else if (cls == JSONArray.class)
		{
			HippyArray arr = new HippyArray();
			JSONArray jsonArr = (JSONArray) obj;
			int length = jsonArr.length();
			for (int i = 0; i < length; i++)
			{
				parseObjectGotoArray(arr, jsonArr.get(i));
			}
			array.pushArray(arr);
		}
		else if (cls == JSONObject.class)
		{
			HippyMap map = new HippyMap();
			JSONObject jsonObj = (JSONObject) obj;
			Iterator<String> keys = jsonObj.keys();
			while (keys.hasNext())
			{
				String key = keys.next();
				parseObjectGotoMap(map, key, jsonObj.get(key));
			}
			array.pushMap(map);
		}
	}

	private static void parseObjectGotoMap(HippyMap map, String key, Object obj) throws JSONException
	{
		if (obj == null || obj == JSONObject.NULL)
		{
			map.pushNull(key);
			return;
		}

		Class cls = obj.getClass();
		if (obj instanceof String)
		{
			map.pushString(key, (String) obj);
		}
		else if (cls == int.class || cls == Integer.class)
		{
			map.pushInt(key, (Integer) obj);
		}
		else if (cls == double.class || cls == Double.class)
		{
			map.pushDouble(key, (Double) obj);
		}
		else if (cls == long.class || cls == Long.class)
		{
			map.pushLong(key, (Long) obj);
		}
		else if (cls == boolean.class || cls == Boolean.class)
		{
			map.pushBoolean(key, (Boolean) obj);
		}
		else if (cls == JSONArray.class)
		{
			HippyArray arr = new HippyArray();
			map.pushArray(key, arr);
			JSONArray jsonArr = (JSONArray) obj;
			int length = jsonArr.length();
			for (int i = 0; i < length; i++)
			{
				parseObjectGotoArray(arr, jsonArr.get(i));
			}
		}
		else if (cls == JSONObject.class)
		{
			HippyMap hippyMap = new HippyMap();
			map.pushMap(key, hippyMap);
			JSONObject jsonObj = (JSONObject) obj;
			Iterator<String> keys = jsonObj.keys();
			while (keys.hasNext())
			{
				String keyStr = keys.next();
				parseObjectGotoMap(hippyMap, keyStr, jsonObj.get(keyStr));
			}
		}

	}

	public static String objectToJson(Object obj)
	{
		if (obj == null)
		{
			return "";
		}

		StringBuilder buider = new StringBuilder();
		objectToJson(buider, obj);
		return buider.toString();
	}

    public static String objectToJsonOpt(Object obj, StringBuilder builder)
    {
        if (obj == null)
        {
            return "";
        }
        objectToJson(builder, obj);
        return builder.toString();
    }

	public static void covertObject2JsonByte(GrowByteBuffer byteBuffer, Object object)
	{
		byteBuffer.reset();
		if (object != null)
		{
			objectToJson(byteBuffer, object);
		}
	}

	private static void objectToJson(GrowByteBuffer byteBuffer, Object obj)
	{
	    if (obj == null)
		{
			byteBuffer.putByteArray(EMPTY_OBJ_BYTES);
			return;
		}
		if (obj instanceof String)
		{
			String str = (String) obj;
			if (TextUtils.isEmpty(str))
			{
				byteBuffer.putByteArray(EMPTY_OBJ_BYTES);
			}
			else
			{
				stringFormat(str, byteBuffer);
			}
		}
		else if (obj.getClass().isAssignableFrom(int.class) || obj instanceof Integer)
		{
			byteBuffer.putInt((Integer) obj);
		}
		else if (obj.getClass().isAssignableFrom(long.class) || obj instanceof Long)
		{
			byteBuffer.putLong((Long) obj);
		}
		else if (obj.getClass().isAssignableFrom(double.class) || obj instanceof Double)
		{
			byteBuffer.putDouble((Double) (Double.isNaN((double) obj) ? 0 : obj));
		}
		else if (obj.getClass().isAssignableFrom(boolean.class) || obj instanceof Boolean)
		{
			byteBuffer.putBoolean((Boolean) obj);
		}
		else if (obj.getClass().isAssignableFrom(float.class) || obj instanceof Float)
		{
			byteBuffer.putFloat((Float) (Float.isNaN((float) obj) ? 0 : obj));
		}
		else if (obj.getClass().isAssignableFrom(byte[].class) || obj instanceof byte[])
		{
			byteBuffer.putByteArray((byte[]) obj);
		}

		else if (obj instanceof HippyArray)
		{
			byteBuffer.putByte((byte) '[');
			HippyArray array = (HippyArray) obj;
			int length = array.size();
			for (int i = 0; i < length; i++)
			{
				objectToJson(byteBuffer, array.getObject(i));
				if (i != length - 1)
				{
					byteBuffer.putByte((byte) ',');
				}
			}
			byteBuffer.putByte((byte) ']');
		}
		else if (obj instanceof HippyMap)
		{
			byteBuffer.putByte((byte) '{');
			HippyMap map = (HippyMap) obj;
			Set<String> keys = map.keySet();

			final int size = keys.size();
			int index = 0;

            //Log.d("GrowByteBuffer", "key size = [" + size + "]");

			for (String key : keys)
			{
                //Log.d("GrowByteBuffer", "keys = [" + key + "]");
				byteBuffer.putByte((byte) '"');
				if (TextUtils.isEmpty(key))
				{
					byteBuffer.putByteArray(EMPTY_STRING_BYTES);
				}
				else
				{
					byteBuffer.putByteArray(key.getBytes());
				}
				byteBuffer.putByte((byte) '"');
				byteBuffer.putByte((byte) ':');
				objectToJson(byteBuffer, map.get(key));

				index++;
				if (index != size)
				{
					byteBuffer.putByte((byte) ',');
				}
			}
			byteBuffer.putByte((byte) '}');
		}
	}

	private static void objectToJson(StringBuilder builder, Object obj)
	{
		if (obj == null)
		{
			builder.append("\"\"");
			return;
		}
		if (obj instanceof String)
		{
			String str = (String) obj;
			if (TextUtils.isEmpty(str))
			{
				builder.append("\"\"");
			}
			else
			{
				stringFormat(str, builder);
			}
		}
		else if (obj.getClass().isAssignableFrom(int.class) || obj instanceof Integer)
		{
			builder.append(obj);
		}
		else if (obj.getClass().isAssignableFrom(long.class) || obj instanceof Long)
		{
			builder.append(obj);
		}
		else if (obj.getClass().isAssignableFrom(double.class) || obj instanceof Double)
		{
			builder.append(Double.isNaN((double) obj) ? 0 : obj);
		}
		else if (obj.getClass().isAssignableFrom(boolean.class) || obj instanceof Boolean)
		{
			builder.append(obj);
		}
		else if (obj.getClass().isAssignableFrom(float.class) || obj instanceof Float)
		{
			builder.append(Float.isNaN((float) obj) ? 0 : obj);
		}
		else if (obj instanceof HippyArray)
		{
			builder.append("[");
			HippyArray array = (HippyArray) obj;
			int length = array.size();
			for (int i = 0; i < length; i++)
			{
				objectToJson(builder, array.getObject(i));
				if (i != length - 1)
				{
					builder.append(",");
				}
			}
			builder.append("]");
		}
		else if (obj instanceof HippyMap)
		{
			builder.append("{");
			HippyMap map = (HippyMap) obj;
			Set<String> keys = map.keySet();
			boolean hasComma = false;
			for (String key : keys)
			{
				builder.append("\"");
				builder.append(key);
				builder.append("\"");
				builder.append(":");
				objectToJson(builder, map.get(key));
				builder.append(",");
				hasComma = true;
			}
			if(hasComma)
			{
				builder.deleteCharAt(builder.length() -1);
			}
			builder.append("}");
		}
	}

	public static Object parseArgument(Type paramCls, HippyArray array, int index)
	{
		if (paramCls == String.class)
		{
			return array.getString(index);
		}
		else if (paramCls == int.class || paramCls == Integer.class)
		{
			return array.getInt(index);
		}
		else if (paramCls == long.class || paramCls == Long.class)
		{
			return array.getLong(index);
		}
		else if (paramCls == double.class || paramCls == Double.class)
		{
			return array.getDouble(index);
		}
		else if (paramCls == boolean.class || paramCls == Boolean.class)
		{
			return array.getBoolean(index);
		}
		else if (paramCls == float.class || paramCls == Float.class)
		{
			return (float) array.getDouble(index);
		}
		else if (paramCls == HippyArray.class)
		{
			return array.getArray(index);
		}
		else if (paramCls == HippyMap.class)
		{
			return array.getMap(index);
		}
		throw new RuntimeException("parseArgument exception");
	}

	public static Object parseArgument(Type paramCls, HippyMap map, String key)
	{
		if (paramCls == String.class)
		{
			return map.getString(key);
		}
		else if (paramCls == int.class || paramCls == Integer.class)
		{
			return map.getInt(key);
		}
		else if (paramCls == long.class || paramCls == Long.class)
		{
			return map.getLong(key);
		}
		else if (paramCls == double.class || paramCls == Double.class)
		{
			return map.getDouble(key);
		}
		else if (paramCls == float.class || paramCls == Float.class)
		{
			return (float) map.getDouble(key);
		}
		else if (paramCls == boolean.class || paramCls == Boolean.class)
		{
			return map.getBoolean(key);
		}
		else if (paramCls == HippyArray.class)
		{
			return map.getArray(key);
		}
		else if (paramCls == HippyMap.class)
		{
			return map.getMap(key);
		}
		throw new RuntimeException("parseArgument exception");
	}

	public static Object parseArgument(Type paramCls, Object value)
	{
		if (paramCls == String.class)
		{
			return String.valueOf(value);
		}
		else if (paramCls == int.class || paramCls == Integer.class)
		{
			return ((Number) value).intValue();
		}
		else if (paramCls == long.class || paramCls == Long.class)
		{
			return ((Number) value).longValue();
		}
		else if (paramCls == double.class || paramCls == Double.class)
		{
			return ((Number) value).doubleValue();
		}
		else if (paramCls == float.class || paramCls == Float.class)
		{
			return ((Number) value).floatValue();
		}
		else if (paramCls == boolean.class || paramCls == Boolean.class)
		{
			return value;
		}
		else if (paramCls == HippyArray.class)
		{
			return value;
		}
		else if (paramCls == HippyMap.class)
		{
			return value;
		}
		throw new RuntimeException("parseArgument exception");
	}

	public static HippyArray fromArray(Object array)
	{
		HippyArray catalystArray = new HippyArray();
		int length;
		int index;
		if (array instanceof String[])
		{
			String[] strs = (String[]) ((String[]) array);
			length = strs.length;

			for (index = 0; index < length; ++index)
			{
				String str = strs[index];
				catalystArray.pushString(str);
			}
		}
		else if (array instanceof Parcelable[])
		{
      Parcelable[] parcelables = (Parcelable[]) ((Parcelable[]) array);
			length = parcelables.length;

			for (index = 0; index < length; ++index)
			{
				Parcelable parcelable = parcelables[index];
				if (parcelable instanceof Bundle)
				{
          catalystArray.pushMap(fromBundle((Bundle) parcelable));
        }
			}
		}
		else if (array instanceof int[])
		{
			int[] ints = (int[]) ((int[]) array);
			length = ints.length;

			for (index = 0; index < length; ++index)
			{
				int value = ints[index];
				catalystArray.pushInt(value);
			}
		}
		else if (array instanceof float[])
		{
			float[] values = (float[]) ((float[]) array);
			length = values.length;

			for (index = 0; index < length; ++index)
			{
				float value = values[index];
				catalystArray.pushDouble((double) value);
			}
		}
		else if (array instanceof double[])
		{
			double[] values = (double[]) ((double[]) array);
			length = values.length;

			for (index = 0; index < length; ++index)
			{
				double value = values[index];
				catalystArray.pushDouble(value);
			}
		}
		else
		{
			if (!(array instanceof boolean[]))
			{
				throw new IllegalArgumentException("Unknown array type " + array.getClass());
			}

			boolean[] values = (boolean[]) ((boolean[]) array);
			length = values.length;

			for (index = 0; index < length; ++index)
			{
				boolean value = values[index];
				catalystArray.pushBoolean(value);
			}
		}

		return catalystArray;
	}

	public static HippyMap fromBundle(Bundle bundle)
	{
		HippyMap map = new HippyMap();
		Iterator iterator = bundle.keySet().iterator();

		while (iterator.hasNext())
		{
			String key = (String) iterator.next();
			Object value = bundle.get(key);
			if (value == null)
			{
				map.pushNull(key);
			}
			else if (value.getClass().isArray())
			{
				map.pushArray(key, fromArray(value));
			}
			else if (value instanceof String)
			{
				map.pushString(key, (String) value);
			}
			else if (value instanceof Number)
			{
				if (value instanceof Integer)
				{
					map.pushInt(key, ((Integer) value).intValue());
				}
				else
				{
					map.pushDouble(key, ((Number) value).doubleValue());
				}
			}
			else if (value instanceof Boolean)
			{
				map.pushBoolean(key, ((Boolean) value).booleanValue());
			}
			else
			{
				if (!(value instanceof Bundle))
				{
					throw new IllegalArgumentException("Could not convert " + value.getClass());
				}

				map.pushMap(key, fromBundle((Bundle) value));
			}
		}

		return map;
	}

	public static Bundle toBundle(HippyMap hippyMap)
	{
		Bundle b = new Bundle(9);
		if (hippyMap != null)
		{
			for (String key : hippyMap.keySet())
			{
				Object value = hippyMap.get(key);
				if (value == null)
				{
					b.putString(key, null);
				}
				else if (value instanceof String)
				{
					b.putString(key, (String) value);
				}
				else if (value.getClass().isAssignableFrom(int.class) || value instanceof Integer)
				{
					b.putInt(key, (Integer) value);
				}
				else if (value.getClass().isAssignableFrom(long.class) || value instanceof Long)
				{
					b.putLong(key, (Long) value);
				}
				else if (value.getClass().isAssignableFrom(double.class) || value instanceof Double)
				{
					b.putDouble(key, (Double) value);
				}
				else if (value.getClass().isAssignableFrom(boolean.class) || value instanceof Boolean)
				{
					b.putBoolean(key, (Boolean) value);
				}
				else if (value instanceof HippyMap)
				{
					b.putBundle(key, toBundle((HippyMap) value));
				}
				else if (value instanceof HippyArray)
				{
					throw new UnsupportedOperationException("Arrays aren't supported yet.");
				}
				else
				{
					throw new IllegalArgumentException("Could not convert object with key: " + key + ".");
				}
			}
		}
		return b;
	}


	private static void stringFormat(String value, GrowByteBuffer buffer)
	{
	    StringBuilder stringBuilder = buffer.getStringBuilderCache();
	    stringFormat(value, stringBuilder);
	    buffer.putString(stringBuilder.toString());
	}

	private static void stringFormat(String value, StringBuilder builder)
	{
		builder.append("\"");
		for (int i = 0, length = value.length(); i < length; i++)
		{
			char c = value.charAt(i);

			switch (c)
			{
				case '"':
				case '\\':
				case '/':
					builder.append('\\').append(c);
					break;

				case '\t':
					builder.append("\\t");
					break;

				case '\b':
					builder.append("\\b");
					break;

				case '\n':
					builder.append("\\n");
					break;

				case '\r':
					builder.append("\\r");
					break;

				case '\f':
					builder.append("\\f");
					break;

				default:
					if (c <= 0x1F)
					{
						builder.append(String.format("\\u%04x", (int) c));
					}
					else
					{
						builder.append(c);
					}
					break;
			}

		}
		builder.append("\"");
	}
}
