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
package com.tencent.mtt.hippy.bridge;

import java.io.File;
import java.io.FilenameFilter;
import java.nio.charset.Charset;
import java.util.Locale;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import android.content.Context;
import android.content.res.AssetManager;
import android.text.TextUtils;
import com.tencent.mtt.hippy.bridge.libraryloader.LibraryLoader;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.devsupport.DebugWebSocketClient;
import com.tencent.mtt.hippy.devsupport.DevRemoteDebugProxy;
import com.tencent.mtt.hippy.utils.ArgumentUtils;
import com.tencent.mtt.hippy.utils.FileUtils;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.utils.HippyBuffer;
import java.nio.ByteOrder;

public class HippyBridgeImpl implements HippyBridge, DevRemoteDebugProxy.OnReceiveDataListener
{
	private static volatile ThreadPoolExecutor	mCodeCacheThreadExecutor	= null;
	private static volatile int					sBridgeNum					= 0;
	private static Object						sBridgeSyncLock;

	static
	{
		sBridgeSyncLock = new Object();
		LibraryLoader.loadLibraryIfNeed("hippybridge");
	}

	private static volatile String				mCodeCacheRootDir;
	private long								mV8RuntimeId				= 0;
	private BridgeCallback						mBridgeCallback;
	private boolean								mInit						= false;
	private boolean								mIsDevModule				= false;
	private boolean								mSingleThreadMode			= false;
	private boolean								mBridgeParamJson;
	private HippyBuffer                         mHippyBuffer;
	private DebugWebSocketClient				mDebugWebSocketClient;
	private String                              mDebugGobalConfig;
	private NativeCallback                      mDebugInitJSFrameworkCallback;

	public HippyBridgeImpl(Context context, BridgeCallback callback, boolean singleThreadMode, boolean jsonBrige, boolean isDevModule)
	{
		this.mBridgeCallback = callback;
		this.mSingleThreadMode = singleThreadMode;
		this.mBridgeParamJson = jsonBrige;
		this.mIsDevModule = isDevModule;

		synchronized (sBridgeSyncLock)
		{
			++sBridgeNum;

			if (mCodeCacheRootDir == null)
			{
				File hippyFile = FileUtils.getHippyFile(context);
				if (hippyFile != null)
				{
					this.mCodeCacheRootDir = hippyFile.getAbsolutePath() + File.separator + "codecache" + File.separator;
				}
			}

			if (mCodeCacheThreadExecutor == null)
			{
				this.mCodeCacheThreadExecutor = new ThreadPoolExecutor(1, 1, 120L, TimeUnit.SECONDS, new LinkedBlockingQueue<Runnable>());
				this.mCodeCacheThreadExecutor.allowCoreThreadTimeOut(true);
			}
		}
        
		if (!mBridgeParamJson)
		{
			mHippyBuffer = new HippyBuffer();
		}
	}

	/*
	 * 有一个数量较多的libmttv8.so的crash可能是这里没加锁导致
	 * according to ccyongwang: 应该是多线程时序的问题。你加个锁， 在initJSFramework
	 * harryguo: initJSFramework native函数须加锁。否则可能导致:
	 * C层的v8Platform变量在A线程中刚赋值（但尚未调用Initialize）时，就被B线程拿去使用了，导致crash
	 * paulzeng: 这里只对调用initJSFramework代码块加锁即可
	 */
	@Override
	public void initJSBridge(String gobalConfig, NativeCallback callback, final int groupId)
	{
		mDebugGobalConfig = gobalConfig;
		mDebugInitJSFrameworkCallback = callback;

		if(this.mIsDevModule)
		{
			mDebugWebSocketClient = new DebugWebSocketClient();
			mDebugWebSocketClient.setOnReceiveDataCallback(this);
			mDebugWebSocketClient.connect(String.format(Locale.US, "ws://%s/debugger-proxy?role=android_client", "localhost:38989"), new DebugWebSocketClient.JSDebuggerCallback()
			{
				@Override
				public void onSuccess(String response)
				{
					LogUtils.e("hippyCore", "js debug socket connect success");

					initJSEngine(groupId);
				}

				@Override
				public void onFailure(final Throwable cause)
				{
					LogUtils.e("hippyCore", "js debug socket connect failed");
				}
			});
		}
		else
		{
			initJSEngine(groupId);
		}
	}

	private void initJSEngine(int groupId)
	{
		// harryguo: initJSFramework native函数须加锁。否则可能导致: C层的v8Platform变量在A线程中刚赋值（但尚未调用Initialize）时，就被B线程拿去使用了，导致crash
        // paulzeng: 这里只对调用initJSFramework代码块加锁即可
		synchronized (HippyBridgeImpl.class) {
			mV8RuntimeId = initJSFramework(mDebugGobalConfig.getBytes(), mSingleThreadMode, mBridgeParamJson, mIsDevModule, mDebugInitJSFrameworkCallback, groupId);
			mInit = true;
		}
	}

	@Override
	public boolean runScriptFromFile(String filePath, String scriptName, boolean canUseCodeCache, String codeCacheTag, NativeCallback callback)
	{
		if (!mInit)
		{
			return false;
		}
		if (!TextUtils.isEmpty(codeCacheTag) && !TextUtils.isEmpty(mCodeCacheRootDir))
		{
			LogUtils.e("HippyEngineMonitor", "runScriptFromFile ======core====== " + codeCacheTag + ", canUseCodeCache == " + canUseCodeCache);
			String codeCacheDir = mCodeCacheRootDir + codeCacheTag + File.separator;
			File file = new File(codeCacheDir);
			LogUtils.d("HippyEngineMonitor", "codeCacheDir file size : " + (file.listFiles() != null ? file.listFiles().length : 0));
			return runScriptFromFile(filePath, scriptName, canUseCodeCache, codeCacheDir, mV8RuntimeId, callback);
		}
		else
		{
			LogUtils.e("HippyEngineMonitor", "runScriptFromFile codeCacheTag is null");
			return runScriptFromFile(filePath, scriptName, false, "" + codeCacheTag + File.separator, mV8RuntimeId, callback);
		}
	}

	@Override
	public boolean runScriptFromAssets(String fileName, AssetManager assetManager, boolean canUseCodeCache, String codeCacheTag, NativeCallback callback)
	{
		if (!mInit)
		{
			return false;
		}
		if (!TextUtils.isEmpty(codeCacheTag) && !TextUtils.isEmpty(mCodeCacheRootDir))
		{
			LogUtils.e("HippyEngineMonitor", "runScriptFromAssets ======core====== " + codeCacheTag + ", canUseCodeCache == " + canUseCodeCache);
			String codeCacheDir = mCodeCacheRootDir + codeCacheTag + File.separator;
			File file = new File(codeCacheDir);
			LogUtils.d("HippyEngineMonitor", "codeCacheDir file size : " + (file.listFiles() != null ? file.listFiles().length : 0));
			return runScriptFromAssets(fileName, assetManager, canUseCodeCache, codeCacheDir, mV8RuntimeId, callback);
		}
		else
		{
			LogUtils.e("HippyEngineMonitor", "runScriptFromAssets codeCacheTag is null");
			return runScriptFromAssets(fileName, assetManager, false, "" + codeCacheTag + File.separator, mV8RuntimeId, callback);
		}
	}

	@Override
	public void callFunction(String action, String params, NativeCallback callback)
	{
		if (!mInit || TextUtils.isEmpty(action) || TextUtils.isEmpty(params))
		{
			return;
		}
		final byte[] bytes = params.getBytes();
		callFunction(action, bytes, 0, bytes.length , mV8RuntimeId, callback);
	}

    @Override
    public void callFunction(String action, byte[] bytes, int offset, int length, NativeCallback callback)
    {
        if (!mInit || TextUtils.isEmpty(action) || bytes == null || bytes.length == 0 || offset < 0 || length < 0 || offset + length > bytes.length)
        {
            return;
        }
        callFunction(action, bytes, offset, length, mV8RuntimeId, callback);
    }

	@Override
	public void runOnJSThread(Runnable runnable) {
		runOnJSThread(mV8RuntimeId, runnable);
	}

	@Override
	public long[] getV8Runtime() {
		return getV8Runtime(mV8RuntimeId);
	}

	@Override
	public void destroy(NativeCallback callback)
	{
		if (mDebugWebSocketClient != null)
		{
			mDebugWebSocketClient.closeQuietly();
		}

		if (!mInit)
		{
			return;
		}
		mInit = false;
		synchronized (sBridgeSyncLock)
		{
			--sBridgeNum;
			if (sBridgeNum == 0)
			{
				try
				{
					if (mCodeCacheThreadExecutor != null)
					{
						mCodeCacheThreadExecutor.shutdownNow();
					}
				}
				catch (Throwable e)
				{

				}
				mCodeCacheThreadExecutor = null;
			}
		}
		
		if (!mBridgeParamJson && mHippyBuffer != null)
		{
			mHippyBuffer.release();
		}

		destroy(mV8RuntimeId, mSingleThreadMode, callback);
		mBridgeCallback = null;
	}

	/**
	 * 创建C层的v8引擎
	 * @param groupId 对于同一个组内的HippyEngine的多个实例，它们会共用C层的同一个v8实例，全局变量共享；groupId的默认值为-1（无效组，即不属于任何group组）
	 */
	public native long initJSFramework(byte[] gobalConfig, boolean useLowMemoryMode, boolean useBrigeParamJson, boolean isDevModule, NativeCallback callback, long groupId);

	public native boolean runScriptFromFile(String filePath, String scriptName, boolean canUseCodeCache, String codeCacheDir, long V8RuntimId, NativeCallback callback);

	public native boolean runScriptFromAssets(String fileName, AssetManager assetManager, boolean canUseCodeCache, String codeCacheDir, long V8RuntimId, NativeCallback callback);

	public native void destroy(long V8RuntimId, boolean useLowMemoryMode, NativeCallback callback);

	public native void callFunction(String action, byte[] params, int offset, int length, long V8RuntimId, NativeCallback callback);

	public native void runNativeRunnable(String codeCacheFile, long nativeRunnableId, long V8RuntimId, NativeCallback callback);

	public native String getCrashMessage();

	private native void runOnJSThread(long runtimeId, Runnable runnable);

	private native long[] getV8Runtime(long runtimeId);

	public void callNatives(String moduleName, String moduleFunc, String callId, byte[] params)
	{
		LogUtils.d("jni_callback", "callNatives [moduleName:" + moduleName + " , moduleFunc: " + moduleFunc + "]");

		if (mBridgeCallback != null)
		{
			HippyArray hippyParam = bytesToArgument(params);
			mBridgeCallback.callNatives(moduleName, moduleFunc, callId, hippyParam);
		}
	}

	public void InspectorChannel(byte[] params)
	{
		if (ByteOrder.nativeOrder() == ByteOrder.BIG_ENDIAN) {
			String msg = new String(params, Charset.forName("UTF-16BE"));
			if (mDebugWebSocketClient != null)
			{
				mDebugWebSocketClient.sendMessage(msg);
			}
		} else {
			String msg = new String(params, Charset.forName("UTF-16LE"));
			if (mDebugWebSocketClient != null)
			{
				mDebugWebSocketClient.sendMessage(msg);
			}
		}
	}

	private HippyArray bytesToArgument(byte param[])
	{
		HippyArray hippyParam = null;
		if (mBridgeParamJson)
		{
			LogUtils.d("hippy_bridge", "bytesToArgument using JSON");
			String strParam = param == null ? "" : new String(param);
			hippyParam = ArgumentUtils.parseToArray(strParam);
		}
		else
		{
			LogUtils.d("hippy_bridge", "bytesToArgument using HippyBuffer");
			Object paramObj = mHippyBuffer.parse(param);
			if (paramObj instanceof HippyArray)
			{
				hippyParam = (HippyArray) paramObj;
			}
		}

		return hippyParam == null ? new HippyArray() : hippyParam;
	}

	public static void deleteCodeCache(String fileName)
	{
		File codeCacheDir = new File(mCodeCacheRootDir);
		String deleteFilesName[] = codeCacheDir.list(new CodeCacheFilter(fileName));

		if (deleteFilesName != null && deleteFilesName.length > 0)
		{
			File file = new File(mCodeCacheRootDir + File.separator + deleteFilesName[0], fileName);
			file.delete();
		}
	}

	public void reportException(String exception, String stackTrace)
	{
		LogUtils.e("reportException", "!!!!!!!!!!!!!!!!!!!");

		LogUtils.e("reportException",exception);
		LogUtils.e("reportException",stackTrace);


		if (mBridgeCallback != null)
		{
			mBridgeCallback.reportException(exception, stackTrace);
		}
	}

	public void postCodeCacheRunnable(String codeCacheFile, long nativeRunnableId)
	{
		try
		{
			synchronized (sBridgeSyncLock)
			{
				if (mCodeCacheThreadExecutor != null)
				{
					mCodeCacheThreadExecutor.execute(new CodeCacheRunnable(codeCacheFile, nativeRunnableId));
				}
			}
		}
		catch (Throwable e)
		{

		}
	}

	static class CodeCacheFilter implements FilenameFilter
	{
		String	fileName;

		public CodeCacheFilter(String fileName)
		{
			this.fileName = fileName;
		}

		@Override
		public boolean accept(File dir, String name)
		{
			File file = new File(dir, name);
			if (file.isDirectory())
			{
				String files[] = file.list();
				if (files != null && files.length > 0)
				{
					return files[0].equals(fileName);
				}
				else
				{
					return false;
				}
			}
			else
			{
				return false;
			}
		}
	}

	public class CodeCacheRunnable implements Runnable
	{
		private String	mPath;
		private long	mNativeId;

		public CodeCacheRunnable(String path, long nativeId)
		{
			this.mPath = path;
			this.mNativeId = nativeId;
		}

		@Override
		public void run()
		{
			try
			{
				if (TextUtils.isEmpty(mPath))
				{
					return;
				}
				File dir = new File(mPath.substring(0, mPath.lastIndexOf(File.separator)));
				deleteDirWithFile(dir);
				dir.mkdirs();
				File file = new File(mPath);
				file.createNewFile();

				runNativeRunnable(mPath, mNativeId, mV8RuntimeId, null);
			}
			catch (Throwable e)
			{
				e.printStackTrace();
			}
		}

		public void deleteDirWithFile(File dir)
		{
			if (dir == null || !dir.exists() || !dir.isDirectory())
				return;
			File[] childs = dir.listFiles();
			if (childs != null)
			{
				for (File file : childs)
				{
					if (file.isFile())
						file.delete();
					else if (file.isDirectory())
						deleteDirWithFile(file);
				}
			}
			dir.delete();
		}
	}

	@Override
	public void onReceiveData(String msg)
	{
		if(this.mIsDevModule)
		{
			final byte[] bytes = msg.getBytes();
			callFunction("onWebsocketMsg", bytes, 0, bytes.length , mV8RuntimeId, null);
		}
	}
}
