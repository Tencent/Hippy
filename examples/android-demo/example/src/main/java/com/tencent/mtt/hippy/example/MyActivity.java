package com.tencent.mtt.hippy.example;

import android.app.Activity;
import android.os.Bundle;
import android.view.Window;

import com.tencent.mtt.hippy.HippyEngine;
import com.tencent.mtt.hippy.HippyAPIProvider;
import com.tencent.mtt.hippy.HippyEngine.EngineInitStatus;
import com.tencent.mtt.hippy.HippyEngine.ModuleLoadStatus;
import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.adapter.exception.HippyExceptionHandlerAdapter;
import com.tencent.mtt.hippy.common.HippyJsException;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.example.adapter.MyImageLoader;
import com.tencent.mtt.hippy.utils.LogUtils;

import java.util.ArrayList;
import java.util.List;

public class MyActivity extends Activity
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
			// 必须：宿主（Hippy的使用者）的Context
			// 若存在多个Activity加载多个业务jsbundle的情况，则这里初始化引擎时建议使用Application的Context
			initParams.context = this;
			// 必须：图片加载器
			initParams.imageLoader = new MyImageLoader(this.getApplicationContext());
			initParams.debugServerHost = "localhost:38989";
			// 可选：是否设置为debug模式，默认为false。调试模式下，所有jsbundle都是从debug server上下载
			initParams.debugMode = false;
			// 可选：是否打印引擎的完整的log。默认为false
			initParams.enableLog = true;
			// 可选：debugMode = false 时必须设置coreJSAssetsPath或coreJSFilePath（debugMode = true时，所有jsbundle都是从debug server上下载）
			initParams.coreJSAssetsPath = "vendor.android.js";

			// 可选：异常处理器
			initParams.exceptionHandler = new HippyExceptionHandlerAdapter() {
				// JavaScript执行异常
				@Override
				public void handleJsException(HippyJsException exception) {
					LogUtils.e("hippy", exception.getMessage() + exception.getStack());
				}

				// Native代码执行异常：包括sdk和业务定制代码
				@Override
				public void handleNativeException(Exception exception, boolean haveCaught) {
					LogUtils.e("hippy", exception.getMessage());
				}

				// JavaScript代码Trace，业务层一般不需要
				@Override
				public void handleBackgroundTracing(String details) {
					LogUtils.e("hippy", details);
				}
			};
			List<HippyAPIProvider> providers = new ArrayList<>();
			providers.add(new MyAPIProvider());
			// 可选：自定义的，用来提供Native modules、JavaScript modules、View controllers的管理器。1个或多个
			initParams.providers = providers;

			// 根据EngineInitParams创建引擎实例
			mHippyEngine = HippyEngine.create(initParams);
			// 异步初始化Hippy引擎
			mHippyEngine.initEngine(new HippyEngine.EngineListener() {
				// Hippy引擎初始化完成
				/**
				 * @param  statusCode
				 *         status code from initializing procedure
				 * @param  msg
				 *         Message from initializing procedure
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
						loadParams.context = MyActivity.this;
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
						/*
						  可选：二选一设置。自己开发的业务模块的jsbundle的文件路径（assets路径和文件路径二选一，优先使用assets路径）
						  debugMode = false 时必须设置jsAssetsPath或jsFilePath（debugMode = true时，所有jsbundle都是从debug server上下载）
						 */
						loadParams.jsFilePath = null;
						// 可选：发送给Hippy前端模块的参数
						loadParams.jsParams = new HippyMap();
						loadParams.jsParams.pushString("msgFromNative", "Hi js developer, I come from native code!");
						// 加载Hippy前端模块
						mHippyView = mHippyEngine.loadModule(loadParams, new HippyEngine.ModuleListener() {
							@Override
							public void onLoadCompleted(ModuleLoadStatus statusCode, String msg, HippyRootView hippyRootView) {
								if (statusCode != ModuleLoadStatus.STATUS_OK) {
									LogUtils.e("MyActivity", "loadModule failed code:" + statusCode + ", msg=" + msg);
								}
							}

							@Override
							public boolean onJsException(HippyJsException exception) {
								return true;
							}
						});

						setContentView(mHippyView);
					}
				}
			});
		}
	}

	@Override
	protected void onResume() {
		super.onResume();
		mHippyEngine.onEngineResume();
	}

	@Override
	protected void onStop() {
		super.onStop();
		mHippyEngine.onEnginePause();
	}

	@Override
	protected void onDestroy() {
		// 3/3. 摧毁hippy前端模块，摧毁hippy引擎
		mHippyEngine.destroyModule(mHippyView);
		mHippyEngine.destroyEngine();
		super.onDestroy();
	}

	@Override
	public void onBackPressed() {
		// 可选：让hippy前端能够监听并拦截back事件
		boolean handled = mHippyEngine.onBackPressed(new HippyEngine.BackPressHandler() {
			@Override
			public void handleBackPress() {
				MyActivity.this.doActivityBack();
			}
		});

		if (!handled) {
			super.onBackPressed();
		}
	}

	// 可选：让hippy前端能够监听并拦截back事件
	public void doActivityBack() {
		super.onBackPressed();
	}
}
