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

import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.devsupport.DevServerCallBack;
import com.tencent.mtt.hippy.devsupport.DevSupportManager;
import com.tencent.mtt.hippy.utils.UIThreadUtils;
import com.tencent.mtt.hippy.utils.UrlUtils;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FilenameFilter;
import java.io.InputStream;
import java.nio.charset.Charset;
import java.util.Locale;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import android.content.Context;
import android.content.res.AssetManager;
import android.text.TextUtils;
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
	private static int TIMEOUT = 3000;

	static
	{
		sBridgeSyncLock = new Object();
	}

	private static volatile String				mCodeCacheRootDir;
	private long								mV8RuntimeId				= 0;
	private BridgeCallback						mBridgeCallback;
	private boolean								mInit						= false;
	private boolean								mIsDevModule				= false;
	private String                              mDebugServerHost;
	private boolean								mSingleThreadMode			= false;
	private boolean								mBridgeParamJson;
	private HippyBuffer                         mHippyBuffer;
	private DebugWebSocketClient				mDebugWebSocketClient;
	private String                              mDebugGobalConfig;
	private NativeCallback                      mDebugInitJSFrameworkCallback;
	private HippyEngineContext                  mContext;

	public HippyBridgeImpl(HippyEngineContext engineContext, BridgeCallback callback, boolean singleThreadMode, boolean jsonBrige, boolean isDevModule, String debugServerHost)
	{
		this.mBridgeCallback = callback;
		this.mSingleThreadMode = singleThreadMode;
		this.mBridgeParamJson = jsonBrige;
		this.mIsDevModule = isDevModule;
		this.mDebugServerHost = debugServerHost;
		this.mContext = engineContext;

		synchronized (sBridgeSyncLock)
		{
			++sBridgeNum;

			if (mCodeCacheRootDir == null)
			{
				Context context = mContext.getGlobalConfigs().getContext();
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
			if (TextUtils.isEmpty(mDebugServerHost)) {
				mDebugServerHost = "localhost:38989";
			}
			mDebugWebSocketClient.connect(String.format(Locale.US, "ws://%s/debugger-proxy?role=android_client", mDebugServerHost), new DebugWebSocketClient.JSDebuggerCallback()
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

                    initJSEngine(groupId);
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
	public boolean runScriptFromUri(String uri, AssetManager assetManager, boolean canUseCodeCache, String codeCacheTag, NativeCallback callback)
	{
		if (!mInit) {
			return false;
		}

		if (!TextUtils.isEmpty(codeCacheTag) && !TextUtils.isEmpty(mCodeCacheRootDir))
		{
			LogUtils.d("HippyEngineMonitor", "runScriptFromAssets ======core====== " + codeCacheTag + ", canUseCodeCache == " + canUseCodeCache);
			String codeCacheDir = mCodeCacheRootDir + codeCacheTag + File.separator;
			File file = new File(codeCacheDir);
			LogUtils.d("HippyEngineMonitor", "codeCacheDir file size : " + (file.listFiles() != null ? file.listFiles().length : 0));
			return runScriptFromUri(uri, assetManager, canUseCodeCache, codeCacheDir, mV8RuntimeId, callback);
		}
		else
		{
			boolean ret = false;
			LogUtils.d("HippyEngineMonitor", "runScriptFromAssets codeCacheTag is null");
			try {
				ret = runScriptFromUri(uri, assetManager, false, "" + codeCacheTag + File.separator, mV8RuntimeId, callback);
			} catch (Throwable e) {
				LogUtils.e("HippyBridgeImpl", "runScriptFromUri:" + e.getMessage());
			}
			return ret;
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
    public void onDestroy() {
		if (mDebugWebSocketClient != null) {
			mDebugWebSocketClient.closeQuietly();
			mDebugWebSocketClient = null;
		}

		if (!mInit) {
			return;
		}

		mInit = false;
		synchronized (sBridgeSyncLock) {
			--sBridgeNum;
			if (sBridgeNum == 0) {
				try {
					if (mCodeCacheThreadExecutor != null) {
						mCodeCacheThreadExecutor.shutdownNow();
					}
				} catch (Throwable e) {
					LogUtils.d("HippyBridgeImpl", "onDestroy: " + e.getMessage());
				}
				mCodeCacheThreadExecutor = null;
			}
		}

		if (!mBridgeParamJson && mHippyBuffer != null) {
			mHippyBuffer.release();
		}

		mV8RuntimeId = 0;
		mBridgeCallback = null;
	}

	@Override
	public void destroy(NativeCallback callback) {
		destroy(mV8RuntimeId, mSingleThreadMode, callback);
	}

	/**
	 * 创建C层的v8引擎
	 * @param groupId 对于同一个组内的HippyEngine的多个实例，它们会共用C层的同一个v8实例，全局变量共享；groupId的默认值为-1（无效组，即不属于任何group组）
	 */
	public native long initJSFramework(byte[] gobalConfig, boolean useLowMemoryMode, boolean useBrigeParamJson, boolean isDevModule, NativeCallback callback, long groupId);

	public native boolean runScriptFromFile(String filePath, String scriptName, boolean canUseCodeCache, String codeCacheDir, long V8RuntimId, NativeCallback callback);

	public native boolean runScriptFromAssets(String fileName, AssetManager assetManager, boolean canUseCodeCache, String codeCacheDir, long V8RuntimId, NativeCallback callback);

	public native boolean runScriptFromUri(String uri, AssetManager assetManager, boolean canUseCodeCache, String codeCacheDir, long V8RuntimId, NativeCallback callback);

	public native void destroy(long runtimeId, boolean useLowMemoryMode, NativeCallback callback);

	public native void callFunction(String action, byte[] params, int offset, int length, long V8RuntimId, NativeCallback callback);

	public native void runNativeRunnable(String codeCacheFile, long nativeRunnableId, long V8RuntimId, NativeCallback callback);

	public native void onResourceReady(byte[] output, long runtimeId, long resId);

	public native String getCrashMessage();

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

	public void fetchResourceWithUri(final String uri, final long resId) {
		UIThreadUtils.runOnUiThread(new Runnable() {
			@Override
			public void run() {
				DevSupportManager devManager = mContext.getDevSupportManager();
				if (mContext == null || TextUtils.isEmpty(uri) || !UrlUtils.isWebUrl(uri) || devManager == null) {
					LogUtils.e("HippyBridgeImpl", "fetchResourceWithUri: can not call loadRemoteResource with " + uri);
					return;
				}

				devManager.loadRemoteResource(uri, new DevServerCallBack() {
					@Override
					public void onDevBundleLoadReady(File bundle) {}

					@Override
					public void onDevBundleReLoad() {}

					@Override
					public void onDevBundleLoadReady(InputStream inputStream) {
						try {
							ByteArrayOutputStream output = new ByteArrayOutputStream();

							byte[] b = new byte[2048];
							int size = 0;
							while ((size = inputStream.read(b)) > 0) {
								output.write(b, 0, size);
							}

							onResourceReady(output.toByteArray(), mV8RuntimeId, resId);
						} catch (Throwable e) {
							LogUtils.e("HippyBridgeImpl", "fetchResourceWithUri: load failed!!! " + e.getMessage());
						}
					}

					@Override
					public void onInitDevError(Throwable e) {
						LogUtils.e("hippy", "requireSubResource: " + e.getMessage());
					}
				});
			}
		});
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

	public void postCodeCacheRunnable(String codeCacheFile, long nativeRunnableId) {
		try {
			synchronized (sBridgeSyncLock) {
				if (mCodeCacheThreadExecutor != null) {
					mCodeCacheThreadExecutor.execute(new CodeCacheRunnable(codeCacheFile, nativeRunnableId));
				}
			}
		} catch (Throwable e) {
			LogUtils.d("HippyBridgeImpl", "postCodeCacheRunnable: " + e.getMessage());
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
