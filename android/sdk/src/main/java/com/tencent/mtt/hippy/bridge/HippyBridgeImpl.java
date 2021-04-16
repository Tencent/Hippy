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
import com.tencent.mtt.hippy.serialization.compatible.Deserializer;
import com.tencent.mtt.hippy.serialization.nio.reader.BinaryReader;
import com.tencent.mtt.hippy.serialization.nio.reader.SafeDirectReader;
import com.tencent.mtt.hippy.serialization.nio.reader.SafeHeapReader;
import com.tencent.mtt.hippy.serialization.string.InternalizedStringTable;
import com.tencent.mtt.hippy.utils.UIThreadUtils;
import com.tencent.mtt.hippy.utils.UrlUtils;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FilenameFilter;
import java.io.InputStream;
import java.nio.ByteBuffer;
import java.nio.charset.Charset;
import java.util.Locale;
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
import java.nio.ByteOrder;

public class HippyBridgeImpl implements HippyBridge, DevRemoteDebugProxy.OnReceiveDataListener {
	private static volatile ThreadPoolExecutor mCodeCacheThreadExecutor	= null;
	private static volatile int sBridgeNum = 0;
	private static final Object sBridgeSyncLock;

	static {
		sBridgeSyncLock = new Object();
	}

	private static volatile String mCodeCacheRootDir;
	private long mV8RuntimeId = 0;
	private BridgeCallback mBridgeCallback;
	private boolean mInit	= false;
	private final boolean mIsDevModule;
	private String mDebugServerHost;
	private final boolean mSingleThreadMode;
	private final boolean mBridgeParamJson;
	private DebugWebSocketClient mDebugWebSocketClient;
	private String mDebugGlobalConfig;
	private NativeCallback mDebugInitJSFrameworkCallback;
	private final HippyEngineContext mContext;
  private Deserializer deserializer;
  private BinaryReader safeHeapReader;
  private BinaryReader safeDirectReader;

	public HippyBridgeImpl(HippyEngineContext engineContext, BridgeCallback callback, boolean singleThreadMode, boolean jsonBridge, boolean isDevModule, String debugServerHost) {
		this.mBridgeCallback = callback;
		this.mSingleThreadMode = singleThreadMode;
		this.mBridgeParamJson = jsonBridge;
		this.mIsDevModule = isDevModule;
		this.mDebugServerHost = debugServerHost;
		this.mContext = engineContext;

		synchronized (sBridgeSyncLock) {
			++sBridgeNum;

			if (mCodeCacheRootDir == null) {
				Context context = mContext.getGlobalConfigs().getContext();
				File hippyFile = FileUtils.getHippyFile(context);
				if (hippyFile != null) {
					mCodeCacheRootDir = hippyFile.getAbsolutePath() + File.separator + "codecache" + File.separator;
				}
			}

			if (mCodeCacheThreadExecutor == null) {
				mCodeCacheThreadExecutor = new ThreadPoolExecutor(1, 1, 120L, TimeUnit.SECONDS, new LinkedBlockingQueue<Runnable>());
				mCodeCacheThreadExecutor.allowCoreThreadTimeOut(true);
			}
		}

		if (!mBridgeParamJson) {
		  deserializer = new Deserializer(null, new InternalizedStringTable());
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
	public void initJSBridge(String globalConfig, NativeCallback callback, final int groupId) {
		mDebugGlobalConfig = globalConfig;
		mDebugInitJSFrameworkCallback = callback;

		if(this.mIsDevModule) {
			mDebugWebSocketClient = new DebugWebSocketClient();
			mDebugWebSocketClient.setOnReceiveDataCallback(this);
			if (TextUtils.isEmpty(mDebugServerHost)) {
				mDebugServerHost = "localhost:38989";
			}
			mDebugWebSocketClient.connect(String.format(Locale.US, "ws://%s/debugger-proxy?role=android_client", mDebugServerHost), new DebugWebSocketClient.JSDebuggerCallback() {
				@Override
				public void onSuccess(String response) {
					LogUtils.e("hippyCore", "js debug socket connect success");

					initJSEngine(groupId);
				}

				@Override
				public void onFailure(final Throwable cause) {
					LogUtils.e("hippyCore", "js debug socket connect failed");

					initJSEngine(groupId);
				}
			});
		} else {
			initJSEngine(groupId);
		}
	}

	private void initJSEngine(int groupId) {
		// harryguo: initJSFramework native函数须加锁。否则可能导致: C层的v8Platform变量在A线程中刚赋值（但尚未调用Initialize）时，就被B线程拿去使用了，导致crash
		// paulzeng: 这里只对调用initJSFramework代码块加锁即可
		synchronized (HippyBridgeImpl.class) {
			mV8RuntimeId = initJSFramework(mDebugGlobalConfig.getBytes(), mSingleThreadMode, mBridgeParamJson, mIsDevModule, mDebugInitJSFrameworkCallback, groupId);
			mInit = true;
		}
	}

	@Override
	public boolean runScriptFromFile(String filePath, String scriptName, boolean canUseCodeCache, String codeCacheTag, NativeCallback callback) {
		if (!mInit) {
			return false;
		}

		if (!TextUtils.isEmpty(codeCacheTag) && !TextUtils.isEmpty(mCodeCacheRootDir)) {
			LogUtils.e("HippyEngineMonitor", "runScriptFromFile ======core====== " + codeCacheTag + ", canUseCodeCache == " + canUseCodeCache);
			String codeCacheDir = mCodeCacheRootDir + codeCacheTag + File.separator;
			File file = new File(codeCacheDir);
			LogUtils.d("HippyEngineMonitor", "codeCacheDir file size : " + (file.listFiles() != null ? file.listFiles().length : 0));
			return runScriptFromFile(filePath, scriptName, canUseCodeCache, codeCacheDir, mV8RuntimeId, callback);
		} else {
			LogUtils.e("HippyEngineMonitor", "runScriptFromFile codeCacheTag is null");
			return runScriptFromFile(filePath, scriptName, false, "" + codeCacheTag + File.separator, mV8RuntimeId, callback);
		}
	}

	@Override
	public boolean runScriptFromAssets(String fileName, AssetManager assetManager, boolean canUseCodeCache, String codeCacheTag, NativeCallback callback) {
		if (!mInit) {
			return false;
		}

		if (!TextUtils.isEmpty(codeCacheTag) && !TextUtils.isEmpty(mCodeCacheRootDir)) {
			LogUtils.e("HippyEngineMonitor", "runScriptFromAssets ======core====== " + codeCacheTag + ", canUseCodeCache == " + canUseCodeCache);
			String codeCacheDir = mCodeCacheRootDir + codeCacheTag + File.separator;
			File file = new File(codeCacheDir);
			LogUtils.d("HippyEngineMonitor", "codeCacheDir file size : " + (file.listFiles() != null ? file.listFiles().length : 0));
			return runScriptFromAssets(fileName, assetManager, canUseCodeCache, codeCacheDir, mV8RuntimeId, callback);
		} else {
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
	public void callFunction(String action, NativeCallback callback, ByteBuffer buffer)	{
		if (!mInit || TextUtils.isEmpty(action) || buffer == null || buffer.limit() == 0) {
			return;
		}

		int offset = buffer.arrayOffset() + buffer.position();
		int length = buffer.limit() - buffer.position();
		callFunction(action, mV8RuntimeId, callback, buffer, offset, length);
	}

	@Override
  public void callFunction(String action, NativeCallback callback, byte[] buffer) {
    callFunction(action, callback, buffer, 0, buffer.length);
  }

	@Override
	public void callFunction(String action, NativeCallback callback, byte[] buffer, int offset, int length) {
		if (!mInit || TextUtils.isEmpty(action) || buffer == null || offset < 0 || length < 0 || offset + length > buffer.length) {
			return;
		}

		callFunction(action,  mV8RuntimeId, callback, buffer, offset, length);
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

		if (!mBridgeParamJson) {
      deserializer.getStringTable().release();
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

	public native void callFunction(String action, long V8RuntimId, NativeCallback callback, ByteBuffer buffer, int offset, int length);
  public native void callFunction(String action, long V8RuntimId, NativeCallback callback, byte[] buffer, int offset, int length);

	public native void runNativeRunnable(String codeCacheFile, long nativeRunnableId, long V8RuntimId, NativeCallback callback);

	public native void onResourceReady(ByteBuffer output, long runtimeId, long resId);

	public native String getCrashMessage();

  public void callNatives(String moduleName, String moduleFunc, String callId, byte[] buffer) {
    callNatives(moduleName, moduleFunc, callId, ByteBuffer.wrap(buffer));
  }

	public void callNatives(String moduleName, String moduleFunc, String callId, ByteBuffer buffer) {
		LogUtils.d("jni_callback", "callNatives [moduleName:" + moduleName + " , moduleFunc: " + moduleFunc + "]");

		if (mBridgeCallback != null) {
			HippyArray hippyParam = bytesToArgument(buffer);
			mBridgeCallback.callNatives(moduleName, moduleFunc, callId, hippyParam);
		}
	}

	public void InspectorChannel(byte[] params) {
		String encoding = ByteOrder.nativeOrder() == ByteOrder.BIG_ENDIAN ? "UTF-16BE" : "UTF-16LE";
		String msg = new String(params, Charset.forName(encoding));
		if (mDebugWebSocketClient != null) {
			mDebugWebSocketClient.sendMessage(msg);
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
							int size;
							while ((size = inputStream.read(b)) > 0) {
								output.write(b, 0, size);
							}

							byte[] resBytes = output.toByteArray();
							if (resBytes != null) {
								final ByteBuffer buffer = ByteBuffer.allocateDirect(resBytes.length);
								buffer.put(resBytes);
								onResourceReady(buffer, mV8RuntimeId, resId);
							} else {
								LogUtils.e("HippyBridgeImpl", "fetchResourceWithUri: output buffer length==0!!!");
								onResourceReady(null, mV8RuntimeId, resId);
							}
						} catch (Throwable e) {
							LogUtils.e("HippyBridgeImpl", "fetchResourceWithUri: load failed!!! " + e.getMessage());
							onResourceReady(null, mV8RuntimeId, resId);
						}
					}

					@Override
					public void onInitDevError(Throwable e) {
						LogUtils.e("hippy", "requireSubResource: " + e.getMessage());
						onResourceReady(null, mV8RuntimeId, resId);
					}
				});
			}
		});
	}

  private HippyArray bytesToArgument(ByteBuffer buffer) {
		HippyArray hippyParam = null;
		if (mBridgeParamJson) {
			LogUtils.d("hippy_bridge", "bytesToArgument using JSON");
      byte[] bytes;
			if (buffer.isDirect()) {
        bytes = new byte[buffer.limit()];
        buffer.get(bytes);
      } else {
			  bytes = buffer.array();
      }
			hippyParam = ArgumentUtils.parseToArray(new String(bytes));
		} else {
			LogUtils.d("hippy_bridge", "bytesToArgument using Buffer");
			Object paramObj;
			try {
        final BinaryReader binaryReader;
			  if (buffer.isDirect()) {
			    if (safeDirectReader == null) {
            safeDirectReader = new SafeDirectReader();
          }
			    binaryReader = safeDirectReader;
        } else {
			    if (safeHeapReader == null) {
			      safeHeapReader = new SafeHeapReader();
          }
			    binaryReader = safeHeapReader;
        }
			  binaryReader.reset(buffer);
			  deserializer.setReader(binaryReader);
        deserializer.reset();
        deserializer.readHeader();
				paramObj = deserializer.readValue();
			} catch (Throwable e) {
				e.printStackTrace();
				LogUtils.e("compatible.Deserializer", "Error Parsing Buffer", e);
				return new HippyArray();
			}
			if (paramObj instanceof HippyArray) {
				hippyParam = (HippyArray) paramObj;
			}
		}

		return hippyParam == null ? new HippyArray() : hippyParam;
	}

	public static boolean deleteCodeCache(String fileName) {
		File codeCacheDir = new File(mCodeCacheRootDir);
		String[] deleteFilesName = codeCacheDir.list(new CodeCacheFilter(fileName));

		if (deleteFilesName != null && deleteFilesName.length > 0) {
			File file = new File(mCodeCacheRootDir + File.separator + deleteFilesName[0], fileName);
			return file.delete();
		}
		return true;
	}

	public void reportException(String exception, String stackTrace) {
		LogUtils.e("reportException", "!!!!!!!!!!!!!!!!!!!");

		LogUtils.e("reportException",exception);
		LogUtils.e("reportException",stackTrace);

		if (mBridgeCallback != null) {
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

	static class CodeCacheFilter implements FilenameFilter {
		String fileName;

		public CodeCacheFilter(String fileName) {
			this.fileName = fileName;
		}

		@Override
		public boolean accept(File dir, String name) {
			File file = new File(dir, name);
			if (file.isDirectory()) {
				String[] files = file.list();
				if (files != null && files.length > 0) {
					return files[0].equals(fileName);
				}
				return false;
			}
			return false;
		}
	}

	public class CodeCacheRunnable implements Runnable
	{
		private final String mPath;
		private final long mNativeId;

		public CodeCacheRunnable(String path, long nativeId) {
			this.mPath = path;
			this.mNativeId = nativeId;
		}

		@Override
		public void run() {
			try {
				if (TextUtils.isEmpty(mPath)) {
					return;
				}

				File dir = new File(mPath.substring(0, mPath.lastIndexOf(File.separator)));
				deleteDirWithFile(dir);
				dir.mkdirs();
				File file = new File(mPath);
				file.createNewFile();

				runNativeRunnable(mPath, mNativeId, mV8RuntimeId, null);
			} catch (Throwable e) {
				e.printStackTrace();
			}
		}

		public void deleteDirWithFile(File dir)	{
			if (dir == null || !dir.exists() || !dir.isDirectory()) {
				return;
			}

			File[] childs = dir.listFiles();
			if (childs != null) {
				for (File file : childs) {
					if (file.isFile()) {
						file.delete();
					} else if (file.isDirectory()) {
						deleteDirWithFile(file);
					}
				}
			}
			dir.delete();
		}
	}

	@Override
	public void onReceiveData(String msg) {
		if (this.mIsDevModule) {
		  callFunction("onWebsocketMsg", null, msg.getBytes());
		}
	}
}
