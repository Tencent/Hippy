package com.tencent.mtt.hippy.example;

import android.app.Activity;
import android.os.Bundle;
import android.view.Window;

import com.tencent.mtt.hippy.HippyEngine;
import com.tencent.mtt.hippy.HippyEngine.EngineInitStatus;
import com.tencent.mtt.hippy.HippyEngineManager;
import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.HippyRootViewParams;
import com.tencent.mtt.hippy.bridge.bundleloader.HippyAssetBundleLoader;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.modules.nativemodules.deviceevent.DeviceEventModule;
import com.tencent.mtt.hippy.utils.LogUtils;

@SuppressWarnings("deprecation")
@Deprecated
public class MyActivityDeprecated extends Activity implements HippyEngine.EngineListener, DeviceEventModule.InvokeDefaultBackPress
{
	private HippyEngineManager mEngineManager;
	private HippyRootView mInstance;

	@Override
	public void onCreate(Bundle savedInstanceState)
	{
		super.onCreate(savedInstanceState);
		getWindow().requestFeature(Window.FEATURE_NO_TITLE);
		MyHippyEngineHost mHost = new MyHippyEngineHost(MyActivityDeprecated.this.getApplication());
		//mEngineManager = mHost.createHippyEngineManager();
		mEngineManager = mHost.createDebugHippyEngineManager("index.bundle");
		mEngineManager.addEngineEventListener(this);
		mEngineManager.initEngineInBackground();

		LogUtils.e("TestActivity", "onCreate");
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
	public void onInitialized(EngineInitStatus statusCode, String msg)
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
