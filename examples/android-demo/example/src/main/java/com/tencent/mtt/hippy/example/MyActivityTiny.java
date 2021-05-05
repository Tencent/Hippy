package com.tencent.mtt.hippy.example;

import android.app.Activity;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.view.Window;

import com.bumptech.glide.Glide;
import com.bumptech.glide.request.animation.GlideAnimation;
import com.bumptech.glide.request.target.SimpleTarget;
import com.tencent.mtt.hippy.HippyEngine;
import com.tencent.mtt.hippy.HippyEngine.EngineInitStatus;
import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.adapter.image.HippyDrawable;
import com.tencent.mtt.hippy.adapter.image.HippyImageLoader;
import com.tencent.mtt.hippy.utils.LogUtils;

/**
 * Copyright (C) 2005-2020 TENCENT Inc.All Rights Reserved.
 * FileName: MyActivityTiny 最简洁的demo，只展示了必须的代码
 * 加载出Hippy的View分为三步：
 * 1. 用EngineInitParams参数create出HippyEngine；
 * 2. HippyEngine.initEngine异步初始化；
 * 3. 用ModuleLoadParams参数loadModule加载出hippy的jsbundle，得到Hippy的View。
 * Description：
 */
public class MyActivityTiny extends Activity
{
	private HippyEngine mHippyEngine;
	private HippyRootView mHippyView;

	@Override
	public void onCreate(Bundle savedInstanceState)
	{
		super.onCreate(savedInstanceState);
		getWindow().requestFeature(Window.FEATURE_NO_TITLE);

		// 1/3. 初始化hippy引擎
		{
			HippyEngine.EngineInitParams initParams = new HippyEngine.EngineInitParams();
			// 必须：hippy运行环境的context。
			// 若存在多个Activity加载多个业务jsbundle的情况，则这里初始化引擎时建议使用Application的Context
			initParams.context = this;
			// 必须：图片加载器
			initParams.imageLoader = new HippyImageLoader()
			{
				// 网络图片加载，异步加载
				@Override
				public void fetchImage(final String url, final Callback requestCallback, Object param)
				{
					//noinspection unchecked,rawtypes
					Glide.with(MyActivityTiny.this).load(url).asBitmap().into(new SimpleTarget() {
						@Override
						public void onResourceReady(Object object, GlideAnimation glideAnimation) {
							HippyDrawable hippyTarget = new HippyDrawable();
							if (object instanceof Bitmap)
								hippyTarget.setData((Bitmap) object);
							requestCallback.onRequestSuccess(hippyTarget);
						}
					});
				}
			};

			// 可选：debugMode = false 时必须设置（debugMode = true时，所有jsbundle都是从debug server上下载）
			initParams.coreJSAssetsPath = "vendor.android.js";
			
			// 根据EngineInitParams创建引擎实例
			mHippyEngine = HippyEngine.create(initParams);
			// 异步初始化Hippy引擎
			mHippyEngine.initEngine(new HippyEngine.EngineListener() {
				// Hippy引擎初始化完成
				/**
				 * @param  statusCode status code from initializing procedure
				 * @param  msg Message from initializing procedure
				 */
				@Override
				public void onInitialized(EngineInitStatus statusCode, String msg) {
					if (statusCode != EngineInitStatus.STATUS_OK)
						LogUtils.e("MyActivity", "hippy engine init failed code:" + statusCode + ", msg=" + msg);
					// else
					{
						// 2/3. 加载hippy前端模块

						HippyEngine.ModuleLoadParams loadParams = new HippyEngine.ModuleLoadParams();
						// 必须：该Hippy模块将要挂在的Activity or Dialog的context
						loadParams.context = MyActivityTiny.this;
						/*
						  必须：指定要加载的Hippy模块里的组件（component）。componentName对应的是js文件中的"appName"，比如：
						  var hippy = new Hippy({
						      appName: "Demo",
						      entryPage: App
						  });
						  */
						loadParams.componentName = "Demo";
						/*
						  可选：二选一设置。自己开发的业务模块的jsbundle的assets路径（assets路径和文件路径二选一，优先使用assets路径）
						  debugMode = false 时必须设置jsAssetsPath或jsFilePath（debugMode = true时，所有jsbundle都是从debug server上下载）
						 */
						loadParams.jsAssetsPath = "index.android.js";
						// 加载Hippy前端模块
						mHippyView = mHippyEngine.loadModule(loadParams);
						setContentView(mHippyView);
					}
				}
			});
		}
	}

	@Override
	protected void onDestroy()
	{
		// 3/3. 摧毁hippy前端模块，摧毁hippy引擎
		mHippyEngine.destroyModule(mHippyView);
		mHippyEngine.destroyEngine();
		super.onDestroy();
	}
}
