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
import java.io.InputStream;
import java.nio.ByteBuffer;
import java.nio.charset.Charset;
import java.util.Locale;

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

@SuppressWarnings("JavaJniMissingFunction")
public class HippyBridgeImpl implements HippyBridge, DevRemoteDebugProxy.OnReceiveDataListener
{
	private static final Object sBridgeSyncLock;

	static
	{
		sBridgeSyncLock = new Object();
	}

	private static volatile String				mCodeCacheRootDir;
	private long								mV8RuntimeId				= 0;
	private BridgeCallback						mBridgeCallback;
	private boolean								mInit						= false;
	private boolean								mIsDevModule;
	private String                              mDebugServerHost;
	private boolean								mSingleThreadMode;
	private final boolean						mBridgeParamJson;
	private HippyBuffer                         mHippyBuffer;
	private DebugWebSocketClient				mDebugWebSocketClient;
	private String                              mDebugGobalConfig;
	private NativeCallback                      mDebugInitJSFrameworkCallback;
	private final HippyEngineContext            mContext;

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
			if (mCodeCacheRootDir == null)
			{
				Context context = mContext.getGlobalConfigs().getContext();
				File hippyFile = FileUtils.getHippyFile(context);
				if (hippyFile != null)
				{
					mCodeCacheRootDir = hippyFile.getAbsolutePath() + File.separator + "codecache" + File.separator;
				}
			}
		}

		if (!mBridgeParamJson)
		{
			mHippyBuffer = new HippyBuffer();
		}
	}

	@Override
	public void initJSBridge(String gobalConfig, NativeCallback callback, final int groupId) {
		mDebugGobalConfig = gobalConfig;
		mDebugInitJSFrameworkCallback = callback;

		if(this.mIsDevModule) {
			mDebugWebSocketClient = new DebugWebSocketClient();
			mDebugWebSocketClient.setOnReceiveDataCallback(this);
			if (TextUtils.isEmpty(mDebugServerHost)) {
				mDebugServerHost = "localhost:38989";
			}
			mDebugWebSocketClient.connect(String.format(Locale.US, "ws://%s/debugger-proxy?role=android_client", mDebugServerHost),
					new DebugWebSocketClient.JSDebuggerCallback() {
				@SuppressWarnings("unused")
				@Override
				public void onSuccess(String response) {
					LogUtils.d("hippyCore", "js debug socket connect success");
					initJSEngine(groupId);
				}

				@SuppressWarnings("unused")
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
		synchronized (HippyBridgeImpl.class) {
			mV8RuntimeId = initJSFramework(mDebugGobalConfig.getBytes(), mSingleThreadMode, mBridgeParamJson, mIsDevModule, mDebugInitJSFrameworkCallback, groupId);
			mInit = true;
		}
	}

	@Override
	public boolean runScriptFromUri(String uri, AssetManager assetManager, boolean canUseCodeCache,
			String codeCacheTag, NativeCallback callback) {
		if (!mInit) {
			return false;
		}

		if (!TextUtils.isEmpty(codeCacheTag) && !TextUtils.isEmpty(mCodeCacheRootDir)) {
			String codeCacheDir = mCodeCacheRootDir + codeCacheTag + File.separator;
			return runScriptFromUri(uri, assetManager, canUseCodeCache, codeCacheDir, mV8RuntimeId, callback);
		} else {
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

	public native boolean runScriptFromUri(String uri, AssetManager assetManager, boolean canUseCodeCache, String codeCacheDir, long V8RuntimId, NativeCallback callback);

	public native void destroy(long runtimeId, boolean useLowMemoryMode, NativeCallback callback);

	public native void callFunction(String action, byte[] params, int offset, int length, long V8RuntimId, NativeCallback callback);

	public native void onResourceReady(ByteBuffer output, long runtimeId, long resId);

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
			@SuppressWarnings("CharsetObjectCanBeUsed") String msg = new String(params, Charset.forName("UTF-16BE"));
			if (mDebugWebSocketClient != null)
			{
				mDebugWebSocketClient.sendMessage(msg);
			}
		} else {
			@SuppressWarnings("CharsetObjectCanBeUsed") String msg = new String(params, Charset.forName("UTF-16LE"));
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

	private HippyArray bytesToArgument(byte[] param)
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
