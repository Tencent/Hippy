/*
 * Tencent is pleased to support the open source community by making Hippy
 * available.
 * Copyright (C) 2018 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.tencent.mtt.hippy.utils;


import android.util.LruCache;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;
import java.util.Set;

import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;

/**
 * Created by ceasoncai on 2018/8/9.
 */
public class HippyBuffer
{
	private static final String		TAG							= "HippyBuffer";

	private static final byte		TYPE_NULL					= 0x00;

	private static final byte		TYPE_STRING					= 0x01;

	private static final byte		TYPE_BOOLEAN_TRUE			= 0x02;

	private static final byte		TYPE_BOOLEAN_FALSE			= 0x03;

	private static final byte		TYPE_INTEGER				= 0x04;

	private static final byte		TYPE_DOUBLE					= 0x05;

	private static final byte		TYPE_ARRAY					= 0x06;

	private static final byte		TYPE_MAP					= 0x07;

	private static final byte		TYPE_ONE_BYTE_STRING		= 0x08;

	private static final byte		TYPE_UNDEFINED				= (byte) 0xFF;

	private static final Object		VALUE_UNDEFINED				= new Object();

	private static final Charset	CHARSET_FOR_ONE_BYTE_STR	= loadOneByteStrCharset();
    private static final ThreadLocal<char[]>	        sThreadCharBuffer		    = new ThreadLocal<char[]>();

    private static final int					        MAP_PROPERTY_POOL_SZIE	    = 2 * 1024;
    private static final String[]				        sPropertyCachePool		    = new String[MAP_PROPERTY_POOL_SZIE];

	private static final byte[]							BASE64_IMG_HEADER			= new byte[] { 'd', 'a', 't', 'a', ':', 'i', 'm', 'a', 'g', 'e',
			'/' };
	private static final String							IMG_URI_PROP_NAME			= "uri";
	private static final String							IMG_SRC_PROP_NAME			= "src";

    private final LruCache<Integer, CacheItem>          mImgStringCache             = new LruCache<>(32);

    private int   mCacheHitCount;
    private int   mTotalCount;

	@SuppressWarnings("CharsetObjectCanBeUsed")
	private static Charset loadOneByteStrCharset()
	{
		Charset defaultCharset = null;
		try
		{
			Charset iso8859 = Charset.forName("ISO-8859-1");
			if (iso8859 != null)
			{
				defaultCharset = iso8859;
			}
		}
		catch (Throwable e)
		{
			e.printStackTrace();
			defaultCharset = null;
		}

		if (defaultCharset == null)
		{
			defaultCharset = Charset.defaultCharset();
		}

		return defaultCharset;
	}


	/**
	 * construct a specific hippy structure, at most times returing a
	 * HippyArray, using the byte-buffer from hippy brigde
	 *
	 * @param data byte array from brigde
	 */
	public final Object parse(byte[] data)
	{
		if (data == null)
		{
			return new HippyArray();
		}
		try
		{
			Object object;
			Parser parser = new Parser(data);
			object = parser.parse();
			parser.release();

			return object;
		}
		catch (Throwable e)
		{
			e.printStackTrace();
			LogUtils.e(TAG, "Error Parsing Buffer", e);
			return new HippyArray();
		}
	}


	/**
	 * serialize an object to hippy buffer data
	 *
	 * @param object the object which is used to build a hippy-buffer
	 *
	 */
	public final byte[] build(Object object)
	{
		if (object == null)
		{
			return null;
		}

		byte[] hippyBuffer;
		try
		{
			Builder builder = new Builder();
			hippyBuffer = builder.build(object);
			builder.release();
		}
		catch (Throwable e)
		{
			hippyBuffer = null;
			LogUtils.e(TAG, "Error Building Buffer", e);
		}

		return hippyBuffer;
	}

	public final void release()
    {
        mImgStringCache.evictAll();
    }


	/**
	 * It is said that Classes and Methods with final modifier will increase the
	 * performace during execution.
	 */
	private final class Parser
	{
		private static final int					PROPERTY_HASH_VALUE		= 5381;

		private static final int					MAX_CHAR_BUFFER_SIZE	= 32;

		private char[]								mPropsCharBuffer;
		private int									mPosition;
		private byte[]								mBuffer;

		private Parser(byte[] buffer)
		{
			mBuffer = buffer;
			mPosition = 0;

			mPropsCharBuffer = sThreadCharBuffer.get();
			if (mPropsCharBuffer != null)
			{
				sThreadCharBuffer.set(null);
			}
			else
			{
				mPropsCharBuffer = new char[MAX_CHAR_BUFFER_SIZE + 1];
			}
		}

		private Object parse()
		{
			Object value = readObject();
			return value == VALUE_UNDEFINED ? null : value;
		}

		private void release()
		{
			mPosition = 0;
			mBuffer = null;
			if (mPropsCharBuffer != null)
			{
				sThreadCharBuffer.set(mPropsCharBuffer);
			}
			mPropsCharBuffer = null;
		}

		private Object readObject()
		{
			return readObject(null);
		}


		private Object readObject(String key)
		{
			byte type = readDataType();
			switch (type)
			{
				case TYPE_STRING:
					return readString(key, false);
				case TYPE_ONE_BYTE_STRING:
					return readString(key, true);
				case TYPE_INTEGER:
					return readInteger();
				case TYPE_MAP:
					return readMap();
				case TYPE_ARRAY:
					return readArray();
				case TYPE_DOUBLE:
					return readDouble();
				case TYPE_BOOLEAN_FALSE:
					return Boolean.FALSE;
				case TYPE_BOOLEAN_TRUE:
					return Boolean.TRUE;
				case TYPE_NULL:
					return null;
				case TYPE_UNDEFINED:
					return VALUE_UNDEFINED;
				default:
					throw new RuntimeException("unknown hippy-buffer type " + type + " at " + mPosition + ", total buffer length =" + mBuffer.length);
			}
		}

		private HippyMap readMap()
		{
			int size = readUnsignedInt();
			HippyMap ret = new HippyMap();

			for (int i = 0; i < size; i++)
			{
				String key = readProperty();
				Object value = readObject(key);
				if (value != VALUE_UNDEFINED)
				{
					ret.pushObject(key, value);
				}
			}
			return ret;
		}

		private HippyArray readArray()
		{
			int length = readUnsignedInt();
			HippyArray ret = new HippyArray();
			for (int i = 0; i < length; i++)
			{
				Object value = readObject();
				ret.pushObject(value);
			}
			return ret;
		}

		private byte readDataType()
		{
			byte type = mBuffer[mPosition];
			mPosition++;
			return type;
		}

		private String readProperty()
		{
			final int length = readUnsignedInt();
			String cache;
			if (length > MAX_CHAR_BUFFER_SIZE)
			{
				cache = new String(mBuffer, mPosition, length);
			}
			else
			{
				int hash = PROPERTY_HASH_VALUE;
				int tempPosition = mPosition;
				for (int i = 0; i < length; i++)
				{
					char ch = (char) mBuffer[tempPosition];
					hash = ((hash << 5) + hash) + ch;
					tempPosition++;
				}
				int propCacheIndex = (sPropertyCachePool.length - 1) & hash;
				cache = sPropertyCachePool[propCacheIndex];
				if (cache != null)
				{
					if (cache.length() != length)
					{
						cache = null;
					}
					else
					{
						cache.getChars(0, length, mPropsCharBuffer, 0);
						for (int i = 0; i < length; i++)
						{
							if (mBuffer[i + mPosition] != mPropsCharBuffer[i])
							{
								cache = null;
								break;
							}
						}
					}
				}

				if (cache == null)
				{
					cache = new String(mBuffer, mPosition, length);
					sPropertyCachePool[propCacheIndex] = cache;
				}
			}
			mPosition += length;
			return cache;
		}


		private String readString(String key, boolean isOneByte)
		{
			final int length = readUnsignedInt();
			String ret;

			final Charset charset = !isOneByte ? Charset.defaultCharset() : CHARSET_FOR_ONE_BYTE_STR;

			if (IMG_URI_PROP_NAME.equals(key) || IMG_SRC_PROP_NAME.equals(key))
			{
				if (length < BASE64_IMG_HEADER.length)
				{
					ret = new String(mBuffer, mPosition, length, charset);
				}
				else
				{
					boolean canCache = true;

					if (mBuffer[mPosition] == BASE64_IMG_HEADER[0])
					{
						for (int i = 1; i < BASE64_IMG_HEADER.length; i++)
						{
							if (mBuffer[mPosition + i] != BASE64_IMG_HEADER[i])
							{
								canCache = false;
								break;
							}
						}
					}
					else
					{
						canCache = false;
					}


					if (canCache)
					{
						final int hashCode = hashCodeOfBuffer(mBuffer, mPosition, length);
                        mTotalCount++;
                        CacheItem item = mImgStringCache.get(hashCode);
						if (item == null || item.length != length)
						{
							ret = new String(mBuffer, mPosition, length, charset);

							item = new CacheItem();
							item.content = ret;
							item.length = length;
							mImgStringCache.put(hashCode, item);
						}
						else
						{
                            ret = item.content;
                            mCacheHitCount++;
						}

//						Log.e("CACHE_WTF", "total:[" + mTotalCount + "], cached:[" + mImgStringCache.size() + "], hitCount:[" + mCacheHitCount
//								+ "], percent:[" + (float) mCacheHitCount / mTotalCount * 100 + "]");
					}
					else
					{
						ret = new String(mBuffer, mPosition, length, charset);
					}
				}
			}
			else
			{
				ret = new String(mBuffer, mPosition, length, charset);
			}

			mPosition += length;
			return ret;
		}

		private int hashCodeOfBuffer(byte[] buffer, int offset, int length)
		{
			int h = 0;
			for (int i = 0; i < length; i++)
			{
				h = 31 * h + buffer[offset + i];
			}
			return h;
		}


		private int readInteger()
		{
			int raw = readUnsignedInt();
			int num = (((raw << 31) >> 31) ^ raw) >> 1;
			return num ^ (raw & (1 << 31));
		}

		private int readUnsignedInt()
		{
			int value = 0;
			int i = 0;
			int b;
			while (((b = mBuffer[mPosition]) & 0x80) != 0)
			{
				value |= (b & 0x7F) << i;
				i += 7;
				mPosition += 1;

				if (i > 35)
				{
					throw new IllegalArgumentException("Data length quantity is too long");
				}
			}
			mPosition += 1;
			return value | (b << i);
		}

		private long readLong()
		{
			long number = (((mBuffer[mPosition + 7] & 0xFFL)) + ((mBuffer[mPosition + 6] & 0xFFL) << 8) + ((mBuffer[mPosition + 5] & 0xFFL) << 16)
					+ ((mBuffer[mPosition + 4] & 0xFFL) << 24) + ((mBuffer[mPosition + 3] & 0xFFL) << 32) + ((mBuffer[mPosition + 2] & 0xFFL) << 40)
					+ ((mBuffer[mPosition + 1] & 0xFFL) << 48) + (((long) mBuffer[mPosition]) << 56));
			mPosition += 8;
			return number;
		}

		private Object readDouble()
		{
			double number = Double.longBitsToDouble(readLong());
			if (number > Integer.MAX_VALUE)
			{
				long numberLong = (long) number;
				if (number - (double) (numberLong) < Double.MIN_NORMAL)
				{
					return numberLong;
				}
			}
			return number;
		}

	}

	private static final class Builder
	{
		private static final int							DEFAULT_BUFFER_SZIE	= 2048;

		private final static ThreadLocal<byte[]>			sLocalBuilderBuffer	= new ThreadLocal<byte[]>();
		private final static ThreadLocal<ArrayList<Object>>	sLocalRefStack		= new ThreadLocal<ArrayList<Object>>();

		private byte[]										mBuffer;
		private int											mPosition;
		private ArrayList<Object>							mReferenceStack;

		private Builder()
		{
			mBuffer = sLocalBuilderBuffer.get();
			if (mBuffer != null)
			{
				sLocalBuilderBuffer.set(null);
			}
			else
			{
				mBuffer = new byte[DEFAULT_BUFFER_SZIE];
			}
			mReferenceStack = sLocalRefStack.get();
			if (mReferenceStack != null)
			{
				sLocalRefStack.set(null);
			}
			else
			{
				mReferenceStack = new ArrayList<Object>(16);
			}
		}


		private byte[] build(Object object)
		{
			writeObject(object);
			byte[] hippyBuffer = new byte[mPosition];
			System.arraycopy(mBuffer, 0, hippyBuffer, 0, mPosition);
			return hippyBuffer;
		}

		private void release()
		{
			if (mBuffer.length <= 1024 * 16)
			{
				sLocalBuilderBuffer.set(mBuffer);
			}
			if (mReferenceStack.isEmpty())
			{
				sLocalRefStack.set(mReferenceStack);
			}
			else
			{
				mReferenceStack.clear();
			}
			mReferenceStack = null;
			mBuffer = null;
			mPosition = 0;
		}

		private void writeObject(Object object) throws RuntimeException
		{
			if (object instanceof String)
			{
				ensureBufferSize(2);
				writeDataType(TYPE_STRING);
				writeString((String) object);
			}
			else if (object instanceof HippyMap)
			{
				if (mReferenceStack.contains(object))
				{
					throw new RuntimeException("Circluar Reference Detected");
				}

				mReferenceStack.add(object);
				writeMap((HippyMap) object);
				mReferenceStack.remove(mReferenceStack.size() - 1);
			}
			else if (object instanceof HippyArray)
			{
				if (mReferenceStack.contains(object))
				{
					throw new RuntimeException("Circluar Reference Detected");
				}

				mReferenceStack.add(object);
				ensureBufferSize(8);
				HippyArray hippyArray = (HippyArray) object;
				writeDataType(TYPE_ARRAY);
				int arraySize = hippyArray.size();
				writeUnsignedInt(arraySize);
				for (int i = 0; i < arraySize; i++)
				{
					Object element = hippyArray.get(i);
					writeObject(element);
				}
				mReferenceStack.remove(mReferenceStack.size() - 1);
			}
			else if (object instanceof Number)
			{
				Number number = (Number) object;
				writeNumber(number);
			}
			else if (object instanceof Boolean)
			{
				ensureBufferSize(2);
				Boolean value = (Boolean) object;
				if (value)
				{
					writeDataType(TYPE_BOOLEAN_TRUE);
				}
				else
				{
					writeDataType(TYPE_BOOLEAN_FALSE);
				}
			}
			else if (object == null)
			{
				ensureBufferSize(2);
				writeDataType(TYPE_NULL);
			}
		}

		private void writeNumber(Number number)
		{
			ensureBufferSize(12);
			if (number instanceof Integer || number instanceof Short || number instanceof Byte)
			{
				writeDataType(TYPE_INTEGER);
				writeInteger(number.intValue());
			}
			else if (number instanceof Float || number instanceof Double || number instanceof Long)
			{
				writeDataType(TYPE_DOUBLE);
				writeDouble(number.doubleValue());
			}
		}

		private void writeMap(HippyMap map)
		{
			ensureBufferSize(8);
			writeDataType(TYPE_MAP);
			writeUnsignedInt(map.size());
			Set<Map.Entry<String, Object>> entries = map.entrySet();
			for (Map.Entry<String, Object> entry : entries)
			{
				writeProperty(entry.getKey());
				writeObject(entry.getValue());
			}
		}

		private void writeDataType(byte dataType)
		{
			mBuffer[mPosition] = dataType;
			mPosition++;
		}

		private void writeProperty(String value)
		{
			ensureBufferSize(2);
			mBuffer[mPosition] = (byte) 0xF0;
			mBuffer[mPosition + 1] = (byte) 0x00;
			mPosition += 2;
			writeString(value);
		}

		private void writeString(String value)
		{
			byte[] strBytes = value.getBytes();
			int length = strBytes == null ? 0 : strBytes.length;
			ensureBufferSize(length + 8);
			writeUnsignedInt(length);
			if (length > 0)
			{
				System.arraycopy(strBytes, 0, mBuffer, mPosition, length);
				mPosition += length;
			}
		}

		private void writeDouble(double value)
		{
			writeLong(Double.doubleToLongBits(value));
		}

		private void writeFloat(float value)
		{
			int val = Float.floatToIntBits(value);
			mBuffer[mPosition + 3] = (byte) (val);
			mBuffer[mPosition + 2] = (byte) (val >>> 8);
			mBuffer[mPosition + 1] = (byte) (val >>> 16);
			mBuffer[mPosition] = (byte) (val >>> 24);
			mPosition += 4;
		}

		private void writeLong(long val)
		{
			mBuffer[mPosition + 7] = (byte) (val);
			mBuffer[mPosition + 6] = (byte) (val >>> 8);
			mBuffer[mPosition + 5] = (byte) (val >>> 16);
			mBuffer[mPosition + 4] = (byte) (val >>> 24);
			mBuffer[mPosition + 3] = (byte) (val >>> 32);
			mBuffer[mPosition + 2] = (byte) (val >>> 40);
			mBuffer[mPosition + 1] = (byte) (val >>> 48);
			mBuffer[mPosition] = (byte) (val >>> 56);
			mPosition += 8;
		}

		private void writeInteger(int value)
		{
			writeUnsignedInt((value << 1) ^ (value >> 31));
		}

		private void writeUnsignedInt(int value)
		{
			while ((value & 0xFFFFFF80) != 0)
			{
				mBuffer[mPosition] = (byte) ((value & 0x7F) | 0x80);
				mPosition++;
				value >>>= 7;
			}
			mBuffer[mPosition] = (byte) (value & 0x7F);
			mPosition++;
		}


		private void ensureBufferSize(int minCapacity)
		{
			minCapacity += mPosition;

			if (minCapacity - mBuffer.length > 0)
			{
				int oldCapacity = mBuffer.length;
				int newCapacity = oldCapacity << 1;
				if (newCapacity < 1024 * 16)
				{
					newCapacity = 1024 * 16;
				}
				if (newCapacity - minCapacity < 0)
				{
					newCapacity = minCapacity;
				}
				mBuffer = Arrays.copyOf(mBuffer, newCapacity);
			}
		}
	}

	private static class CacheItem
	{
		String	content;
		int		length;
	}

}
