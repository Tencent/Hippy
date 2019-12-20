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
package com.tencent.mtt.hippy.bridge.libraryloader;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.ApplicationInfo;
import android.text.TextUtils;

import com.tencent.mtt.hippy.adapter.soloader.HippySoLoaderAdapter;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import java.util.zip.ZipInputStream;


/**
 * FileName: SoLoaderNew
 * Description：
 * History：
 */
public class LibraryLoader
{

	private static final ArrayList<String>	SO_LIST;
	private static final long				NO_VALUE					= -1L;
	/**
	 * Size of reading buffers.
	 */
	private static final int				BUFFER_SIZE					= 0x4000;
	private static Context					sContext;
	private static SharedPreferences		sSharedPreferences;
	private static String					DEFAULT_LIBRARY_DIR;
	private static String					PRIVATE_LIBRARY_DIR;
	private static ArrayList<String>		SO_LOADED_LIST				= new ArrayList<>();

	private static HippySoLoaderAdapter		sHippySoLoaderAdapter;
	static
	{
		SO_LIST = new ArrayList<String>();
		SO_LIST.add("libmtt_shared.so");
		SO_LIST.add("libmttv8.so");
		SO_LIST.add("libhippybridge.so");
		SO_LIST.add("libflexbox.so");
	}

	public static void init(Context context,  SharedPreferences sharedPreferences,
			HippySoLoaderAdapter hippySoLoaderAdapter)
	{
		try
		{
			sContext = context;
			sSharedPreferences = sharedPreferences;
			sHippySoLoaderAdapter = hippySoLoaderAdapter;
			ApplicationInfo applicationInfo = context.getApplicationInfo();
			DEFAULT_LIBRARY_DIR = applicationInfo.nativeLibraryDir;
			PRIVATE_LIBRARY_DIR = applicationInfo.dataDir + File.separator + "private_hy_libs";
		}
		catch (Throwable e)
		{
		}
	}

	public static synchronized void loadLibraryIfNeed(String shortName)
	{

		String libraryName = mapLibraryName(shortName);
		boolean isHippySo = SO_LIST.contains(libraryName);
		if (isHippySo && SO_LOADED_LIST.contains(libraryName))
		{
			return;
		}
		if (isHippySo)
		{
			String currentName = "";
			try
			{
				for (String name : SO_LIST)
				{
					if (SO_LOADED_LIST.contains(name))
					{
						continue;
					}
					currentName = name;
					loadLibraryBySoName(name);
					SO_LOADED_LIST.add(currentName);
				}
			}
			catch (Throwable e)
			{
				throw e;
			}
		}
		else
		{
			try
			{
				loadLibraryBySoName(libraryName);
			}
			catch (Throwable e)
			{

			}
		}
	}

	private static void loadLibraryBySoName(String libraryName)
	{

		//优先走自己定义的
		if (loadFormCusPath(libraryName))
		{
			return;
		}


		//然后先从系统目录中去加载so
		boolean flag = loadFormDefaultDir(libraryName);
		if (!flag)
		{
			flag = loadFormPrivateDir(libraryName);
			if (!flag)
			{
				String shortName = libraryName.substring(3, libraryName.length() - 3);
				System.loadLibrary(shortName);
			}
		}
	}

	private static boolean loadFormCusPath(String libraryName)
	{
		String cusSoPath = sHippySoLoaderAdapter.loadSoPath(libraryName);

		if (TextUtils.isEmpty(cusSoPath))
		{
			return false;
		}
		try
		{
			File file = new File(cusSoPath);
			if (file != null && file.exists())
			{
				System.load(file.getAbsolutePath());
				return true;
			}
		}
		catch (Throwable e)
		{
		}
		return false;

	}

	private static boolean loadFormDefaultDir(String libraryName)
	{
		if (TextUtils.isEmpty(DEFAULT_LIBRARY_DIR))
		{
			return false;
		}
		try
		{
			File file = new File(DEFAULT_LIBRARY_DIR, libraryName);
			if (file != null && file.exists())
			{
				System.load(file.getAbsolutePath());
				return true;
			}
		}
		catch (Throwable e)
		{
		}
		return false;
	}

	private static boolean loadFormPrivateDir(String libraryName)
	{
		if (TextUtils.isEmpty(PRIVATE_LIBRARY_DIR))
		{
			return false;
		}
		try
		{
			if (checkPrivateLibrary(libraryName))
			{

				File file = new File(PRIVATE_LIBRARY_DIR, libraryName);
				System.load(file.getAbsolutePath());
				return true;
			}
			else
			{
				//这里从原始apk中解压一份
				ApplicationInfo info = sContext.getApplicationInfo();
				if (info == null)
				{
					return false;
				}
				File sourceApk = new File(info.sourceDir);
				if (sourceApk == null || !sourceApk.exists())
				{
					return false;
				}

				File targetFile = new File(PRIVATE_LIBRARY_DIR, libraryName);
				// 先删除老文件
				if (targetFile != null && targetFile.exists())
				{
					targetFile.delete();
				}
				if (!targetFile.exists())
				{
					if(targetFile.getParentFile() != null)
					{
						targetFile.getParentFile().mkdirs();
					}
					targetFile.createNewFile();
				}


				//这里做一次改造，先走ZipFile的模式进行解压，如果不成功，再走一次ZipInputStream（因为ZipFile的模式，要求zip文件必须没有完全没有损坏）
				try
				{
					unZipByZipFile(sourceApk, libraryName, targetFile);
					// load so here
					if (targetFile == null || !targetFile.exists())
					{
						throw new RuntimeException("unziped file is null");
					}

					System.load(targetFile.getAbsolutePath());
				}
				catch (Throwable e)
				{
					unZipByZipInputStream(sourceApk, libraryName, targetFile);
					// load so here
					if (targetFile == null || !targetFile.exists())
					{
						throw new RuntimeException("unziped file is null");
					}
					System.load(targetFile.getAbsolutePath());
				}

				SharedPreferences.Editor edit = sSharedPreferences.edit();
				edit.putLong(libraryName + "_crc", getZipCrc(sourceApk));
				edit.putLong(libraryName + "_timestamp", getTimeStamp(sourceApk));
				edit.commit();

				return true;
			}
		}
		catch (Throwable e)
		{
			SharedPreferences.Editor edit = sSharedPreferences.edit();
			edit.putLong(libraryName + "_crc", NO_VALUE);
			edit.putLong(libraryName + "_timestamp", NO_VALUE);
			edit.commit();
		}
		return false;
	}

	private static boolean checkPrivateLibrary(String libraryName) throws IOException
	{
		File file = new File(PRIVATE_LIBRARY_DIR, libraryName);
		if (file == null || !file.exists())
		{
			return false;
		}

		ApplicationInfo info = sContext.getApplicationInfo();
		if (info == null)
		{
			return false;
		}
		File sourceApk = new File(info.sourceDir);
		if (sourceApk == null || !sourceApk.exists())
		{
			return false;
		}

		long currentCrc = getZipCrc(sourceApk);
		if (currentCrc == NO_VALUE)
		{
			return false;
		}

		long currentTimeStamp = getTimeStamp(sourceApk);
		if (currentTimeStamp == NO_VALUE)
		{
			return false;
		}

		long crc = sSharedPreferences.getLong(libraryName + "_crc", NO_VALUE);
		long timeStamp = sSharedPreferences.getLong(libraryName + "_timestamp", NO_VALUE);

		//这里需要判断下CRC,也需要判断下apk最后更新时间，保证apk的正确性
		if (crc == currentCrc && currentCrc != NO_VALUE && currentTimeStamp == timeStamp && currentTimeStamp != NO_VALUE)
		{
			return true;
		}

		return false;
	}

	private static void unZipByZipFile(File sourceApk, String libraryName, File targetFile) throws Throwable
	{
		ZipFile apk = null;
		FileOutputStream out = null;
		InputStream in = null;
		try
		{
			apk = new ZipFile(sourceApk);
			ZipEntry soFileEntry = apk.getEntry("lib/armeabi/" + libraryName);
			if (soFileEntry != null)
			{
				out = new FileOutputStream(targetFile);
				in = apk.getInputStream(soFileEntry);

				byte[] buffer = new byte[BUFFER_SIZE];
				int length = in.read(buffer);
				while (length != -1)
				{
					out.write(buffer, 0, length);
					length = in.read(buffer);
				}
				out.flush();
			}
			else
			{
				throw new RuntimeException("unZipByZipFile : ZipEntry is null");
			}
		}
		catch (Throwable e)
		{
			throw e;
		}
		finally
		{
			if (apk != null)
			{
				try
				{
					apk.close();
				}
				catch (Throwable e)
				{

				}
			}
			if (in != null)
			{
				try
				{
					in.close();
				}
				catch (Throwable e)
				{
				}
			}
			if (out != null)
			{
				try
				{
					out.close();
				}
				catch (Throwable e)
				{
				}
			}
		}

	}

	private static void unZipByZipInputStream(File sourceApk, String libraryName, File targetFile) throws Throwable
	{
		FileInputStream fis = new FileInputStream(sourceApk);
		ZipInputStream zis = new ZipInputStream(new BufferedInputStream(fis));
		FileOutputStream fos = new FileOutputStream(targetFile);
		try
		{
			ZipEntry entry;
			byte[] buffer = new byte[BUFFER_SIZE];
			while ((entry = zis.getNextEntry()) != null)
			{
				String entryName = entry.getName();
				if (TextUtils.isEmpty(entryName) || !entryName.endsWith(".so") || entryName.contains("../"))
				{// 过滤../异常字符串
					continue;
				}
				int index = entryName.lastIndexOf(File.separator);
				if (index >= entryName.length() - 2)
				{
					continue;
				}
				entryName = (index != -1 ? entryName.substring(index + 1) : entryName);
				if (TextUtils.equals(entryName, libraryName))
				{

					int count;
					while ((count = zis.read(buffer)) != -1)
					{
						fos.write(buffer, 0, count);
					}
					fos.flush();
					break;
				}
			}

		}
		finally
		{
			fos.close();
			zis.close();
		}
	}

	private static long getZipCrc(File archive) throws IOException
	{
		long computedValue = ZipUtil.getZipCrc(archive);
		if (computedValue == NO_VALUE)
		{
			computedValue--;
		}
		return computedValue;
	}

	private static long getTimeStamp(File archive)
	{
		long timeStamp = archive.lastModified();
		if (timeStamp == NO_VALUE)
		{
			// never return NO_VALUE
			timeStamp--;
		}
		return timeStamp;
	}

	private static String getPrivateLibraryPath(String libraryName)
	{
		if (TextUtils.isEmpty(PRIVATE_LIBRARY_DIR))
		{
			return null;
		}
		else
		{
			File file = new File(PRIVATE_LIBRARY_DIR, libraryName);
			if (file != null && file.exists())
			{
				return file.getAbsolutePath();
			}
		}
		return null;
	}

	/**
	 * Returns the platform specific file name format for the shared library
	 * named by the argument. On Android, this would turn {@code "MyLibrary"}
	 * into {@code "libMyLibrary.so"}.
	 */
	private static String mapLibraryName(String nickname)
	{
		if (nickname == null)
		{
			throw new NullPointerException("nickname == null");
		}
		return "lib" + nickname + ".so";
	}
}
