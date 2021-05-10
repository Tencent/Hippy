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

import android.content.Context;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;

public class FileUtils
{
	@SuppressWarnings("unused")
	public static String readFile(String filePath)
	{
		String fileContent = "";
		File file = new File(filePath);
		if (!file.exists())
		{
			return fileContent;
		}
		else
		{
			FileInputStream fileReader = null;
			ByteArrayOutputStream byteArrayOutputStream = null;
			try
			{
				byteArrayOutputStream = new ByteArrayOutputStream();
				fileReader = new FileInputStream(file);
				byte[] buffer = new byte[4096];
				int len;
				while ((len = fileReader.read(buffer, 0, buffer.length)) != -1)
				{
					byteArrayOutputStream.write(buffer, 0, len);
				}
				fileContent = byteArrayOutputStream.toString();
			}
			catch (Exception e)
			{
				e.printStackTrace();
			}
			finally
			{
				if (fileReader != null)
				{
					try
					{
						fileReader.close();
					}
					catch (Throwable e)
					{
						e.printStackTrace();
					}
				}

				if (byteArrayOutputStream != null)
				{
					try
					{
						byteArrayOutputStream.close();
					}
					catch (Throwable e)
					{
						e.printStackTrace();
					}
				}
			}
		}
		return fileContent;
	}

	@SuppressWarnings("unused")
	public static byte[] readFileToByteArray(String filePath)
	{
		byte[] data = null;
		File file = new File(filePath);
		if (!file.exists())
		{
			return null;
		}
		else
		{
			try
			{
				ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
				FileInputStream fileReader = new FileInputStream(file);
				try
				{
					byte[] buffer = new byte[4096];
					int len;
					while ((len = fileReader.read(buffer, 0, buffer.length)) != -1)
					{
						byteArrayOutputStream.write(buffer, 0, len);
					}
				}
				catch (Throwable e)
				{
					LogUtils.d("FileUtils", "readFileToByteArray: " + e.getMessage());
				}

				fileReader.close();
				data = byteArrayOutputStream.toByteArray();
				byteArrayOutputStream.close();
			}
			catch (Exception e)
			{
				e.printStackTrace();
			}
		}
		return data;
	}

	public static File getHippyFile(Context context)
	{
		File baseFile = context.getApplicationContext() != null ? context.getApplicationContext().getFilesDir() : context.getFilesDir();
		if (baseFile == null)
			return null;

		return createDir(baseFile, "hippy");
	}

	public static File createDir(File parent, String dirName)
	{
		if (parent == null || dirName == null || dirName.length() == 0)
			return null;

		File childDir = new File(parent, dirName);
		if (!childDir.exists()) {
			boolean ret = childDir.mkdirs();
			if (!ret) {
				LogUtils.e("FileUtils", "mkdirs failed!!");
				return null;
			}
		}

		return childDir;
	}
}
