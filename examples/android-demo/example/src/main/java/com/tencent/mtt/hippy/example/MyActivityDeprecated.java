package com.tencent.mtt.hippy.example;

import android.app.Activity;
import android.os.Bundle;
import android.view.Window;

import com.tencent.mtt.hippy.HippyEngine;
import com.tencent.mtt.hippy.HippyEngineManager;
import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.HippyRootViewParams;
import com.tencent.mtt.hippy.bridge.bundleloader.HippyAssetBundleLoader;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.modules.nativemodules.deviceevent.DeviceEventModule;
import com.tencent.mtt.hippy.utils.LogUtils;

/**
 * Copyright (C) 2005-2020 TENCENT Inc.All Rights Reserved.
 * FileName: MyActivityDeprecated
 * 2019/3/26 harryguo注释：
 * 老的代码示例。将被废弃
 * 请参见{@link MyActivity}
 * 和{@link MyActivityTiny}（最精简的代码）
 * Description：
 */
@Deprecated
public class MyActivityDeprecated extends Activity implements HippyEngine.EngineListener, DeviceEventModule.InvokeDefaultBackPress
{
	private MyHippyEngineHost mHost;
	private HippyEngineManager mEngineManager;
	private HippyRootView mInstance;

	@Override
	public void onCreate(Bundle savedInstanceState)
	{
		super.onCreate(savedInstanceState);
		getWindow().requestFeature(Window.FEATURE_NO_TITLE);
		mHost = new MyHippyEngineHost(MyActivityDeprecated.this.getApplication());
		//mEngineManager = mHost.createHippyEngineManager();
		mEngineManager = mHost.createDebugHippyEngineManager("index.bundle");
		mEngineManager.addEngineEventListener(this);
		mEngineManager.initEngineInBackground();

		LogUtils.e("TestActivity", "onCreate");
	}

	@Override
	protected void onResume()
	{
		super.onResume();
	}

	@Override
	protected void onPause()
	{
		super.onPause();
	}

	@Override
	protected void onDestroy()
	{
		mEngineManager.destroyInstance(mInstance);
		mEngineManager.removeEngineEventListener(this);
		mEngineManager.destroyEngine();
		super.onDestroy();
	}

	@Override
	public void onBackPressed() {
		if (!mEngineManager.onBackPress(this))
			super.onBackPressed();
	}

	@Override
	public void onInitialized(int statusCode, String msg)
	{
		HippyRootViewParams.Builder builder = new HippyRootViewParams.Builder();
		HippyMap params = new HippyMap();
		HippyAssetBundleLoader hippyAssetBundleLoader = new HippyAssetBundleLoader(this,"index.android.js");
		if(!mEngineManager.isDebugMode())
		{
			builder.setBundleLoader(hippyAssetBundleLoader);
		}
		builder.setActivity(MyActivityDeprecated.this).setName("Demo")
				.setLaunchParams(params);
		mInstance = mEngineManager.loadInstance(builder.build());
		setContentView(mInstance);

    }

	@Override
	public void callSuperOnBackPress() {
		super.onBackPressed();
	}
}
