package com.tencent.mtt.hippy.example;

import android.app.Application;

import com.tencent.mtt.hippy.HippyEngineHost;
import com.tencent.mtt.hippy.HippyGlobalConfigs;
import com.tencent.mtt.hippy.HippyAPIProvider;
import com.tencent.mtt.hippy.bridge.bundleloader.HippyAssetBundleLoader;
import com.tencent.mtt.hippy.bridge.bundleloader.HippyBundleLoader;
import com.tencent.mtt.hippy.example.adapter.MyExceptionHandler;
import com.tencent.mtt.hippy.example.adapter.MyImageLoader;

import java.util.ArrayList;
import java.util.List;

@SuppressWarnings({"DeprecatedIsStillUsed", "unused", "deprecation"})
@Deprecated
public class MyHippyEngineHost extends HippyEngineHost
{
	final private Application mApplication;

	public MyHippyEngineHost(Application application)
	{
		super(application);
		this.mApplication = application;
	}

	@Override
	protected List<HippyAPIProvider> getPackages()
	{
		List<HippyAPIProvider> providers = new ArrayList<>();
		providers.add(new MyAPIProvider());
		return providers;
	}

	@Override
	protected HippyBundleLoader getCoreBundleLoader()
	{
		return new HippyAssetBundleLoader(mApplication, "vendor.android.js");
	}

	@Override
	public HippyGlobalConfigs getHippyGlobalConfigs()
	{
		return new HippyGlobalConfigs.Builder().setContext(mApplication).setExceptionHandler(new MyExceptionHandler()).setImageLoaderAdapter(new MyImageLoader(mApplication)).build();
	}

	@Override
	protected boolean enableHippyBufferBridge()
	{
		return true;
	}
}
