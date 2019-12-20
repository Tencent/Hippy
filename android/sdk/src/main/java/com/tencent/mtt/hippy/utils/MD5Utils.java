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

/**
 * 1.0 xiandongluo on 2018/2/6
 */
public class MD5Utils
{
	public static String getMD5(String string)
	{
		String s = null;
		if (string == null)
		{
			return null;
		}
		try
		{
			byte[] source = string.getBytes();
			java.security.MessageDigest md = java.security.MessageDigest.getInstance("MD5");
			md.update(source);
			return byteToHexString(md.digest());
		}
		catch (Exception e)
		{
		}
		return s;
	}

	public static String getMD5(byte[] src)
	{
		try
		{
			java.security.MessageDigest md = java.security.MessageDigest.getInstance("MD5");
			md.update(src);
			return byteToHexString(md.digest());
		}
		catch (Exception e)
		{
		}
		return null;
	}

	/**
	 * Convert byte data to hexadecimal strings
	 */
	public static String byteToHexString(byte[] bytes)
	{
		if (bytes == null || bytes.length <= 0)
			return null;

		StringBuffer buf = new StringBuffer(bytes.length * 2);

		for (int i = 0; i < bytes.length; i++)
		{
			if (((int) bytes[i] & 0xff) < 0x10)
			{
				buf.append("0");
			}
			buf.append(Long.toString((int) bytes[i] & 0xff, 16));
		}
		return buf.toString();
	}

}
