/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

package com.tencent.mtt.hippy.example;

import android.app.Activity;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.os.Bundle;
import android.view.Window;

import com.tencent.mtt.hippy.HippyEngine;
import com.tencent.mtt.hippy.HippyEngine.EngineInitStatus;
import com.tencent.mtt.hippy.HippyEngine.EngineListener;
import com.tencent.mtt.hippy.HippyEngine.ModuleLoadStatus;
import com.tencent.mtt.hippy.HippyEngineManager;
import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.HippyRootViewParams;
import com.tencent.mtt.hippy.bridge.bundleloader.HippyAssetBundleLoader;
import com.tencent.mtt.hippy.common.HippyJsException;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.modules.nativemodules.deviceevent.DeviceEventModule;
import com.tencent.mtt.hippy.utils.LogUtils;

@SuppressWarnings({"deprecation", "unused"})
public class BaseActivity extends Activity implements EngineListener, DeviceEventModule.InvokeDefaultBackPress
{

    private HippyEngineManager		mEngineManager;
	private HippyRootView			mInstance;

	@SuppressWarnings("deprecation")
	@Override
	public void onCreate(Bundle savedInstanceState)
	{
		super.onCreate(savedInstanceState);
		getWindow().requestFeature(Window.FEATURE_NO_TITLE);

        MyHippyEngineHost mHost = new MyHippyEngineHost(BaseActivity.this.getApplication());
		mEngineManager = mHost.createDebugHippyEngineManager("index.bundle", getIntent().getStringExtra("remoteServerUrl"));
		mEngineManager.addEngineEventListener(this);
		mEngineManager.initEngineInBackground();

		getWindow().setBackgroundDrawable(new ColorDrawable(Color.WHITE));
	}

	@Override
	protected void onResume()
	{
		super.onResume();
		mEngineManager.onEngineResume();
	}


	@Override
	protected void onStop()
	{
		super.onStop();
		mEngineManager.onEnginePause();
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
		if (!mEngineManager.onBackPress(this)) {
			super.onBackPressed();
		}
	}


	@Override
	public void callSuperOnBackPress()
	{

		super.onBackPressed();
	}


	@Override
	public void onInitialized(EngineInitStatus i, String s) {
		HippyRootViewParams.Builder builder = new HippyRootViewParams.Builder();
		HippyMap params = new HippyMap();
		HippyAssetBundleLoader hippyAssetBundleLoader = new HippyAssetBundleLoader(this,"index.android.js");
		if(!mEngineManager.isDebugMode())
		{
			builder.setBundleLoader(hippyAssetBundleLoader);
		}
		builder.setActivity(BaseActivity.this).setName("Demo")
				.setLaunchParams(params);
		mInstance = mEngineManager.loadInstance(builder.build(), new HippyEngine.ModuleListener() {
                    @Override
                    public void onLoadCompletedInCurrentThread(ModuleLoadStatus statusCode, String msg, HippyRootView hippyRootView) {

                    }

                    // Hippy模块加载监听

                    /**
					 * @param  statusCode status code from initializing procedure
					 * @param  msg Message from initializing procedure
					 */
					@Override
					public void onLoadCompleted(ModuleLoadStatus statusCode, String msg, HippyRootView hippyRootView) {
						if (statusCode == ModuleLoadStatus.STATUS_OK) {
							LogUtils.d("BaseActivity", "onLoadCompleted: statusCode=ModuleLoadStatus.STATUS_OK");
						}
					}

					@Override
					public boolean onJsException(HippyJsException exception) {
						return true;
					}
				}
		);
		setContentView(mInstance);
	}
}
