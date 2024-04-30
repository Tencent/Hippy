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
package com.tencent.mtt.hippy.example;

import static com.tencent.mtt.hippy.bridge.HippyBridge.URI_SCHEME_ASSETS;

import android.app.Activity;
import android.os.Bundle;
import android.view.Window;

import com.tencent.mtt.hippy.HippyAPIProvider;
import com.tencent.mtt.hippy.HippyEngine;
import com.tencent.mtt.hippy.HippyEngine.EngineInitStatus;
import com.tencent.mtt.hippy.HippyEngine.ModuleLoadStatus;
import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.adapter.DefaultLogAdapter;
import com.tencent.mtt.hippy.adapter.exception.HippyExceptionHandlerAdapter;
import com.tencent.mtt.hippy.bridge.HippyBridgeImpl;
import com.tencent.mtt.hippy.bridge.libraryloader.LibraryLoader;
import com.tencent.mtt.hippy.common.HippyJsException;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.example.adapter.MyImageLoader;
import com.tencent.mtt.hippy.utils.FileUtils;
import com.tencent.mtt.hippy.utils.LogUtils;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@SuppressWarnings({"unused", "deprecation"})
public class MyActivity extends Activity
{
	private HippyEngine mHippyEngine;
	private HippyRootView mHippyView;

	@Override
	public void onCreate(Bundle savedInstanceState)
	{
		super.onCreate(savedInstanceState);
		getWindow().requestFeature(Window.FEATURE_NO_TITLE);

        HippyEngine.V8SnapshotType initType = HippyEngine.V8SnapshotType.NoSnapshot;

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
			initParams.debugMode = HippyEngine.DebugMode.None;
			// 可选：是否打印引擎的完整的log。默认为false
			initParams.enableLog = true;
			initParams.logAdapter = new DefaultLogAdapter();
			// 可选：debugMode = false 时必须设置coreJSAssetsPath或coreJSFilePath（debugMode = true时，所有jsbundle都是从debug server上下载）
			initParams.coreJSAssetsPath = "vendor.android.js";
			initParams.codeCacheTag = "common";

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

			// 可选： 是否启用turbo能力
			initParams.enableTurbo = true;

            initParams.v8InitParams = new HippyEngine.V8InitParams();

            switch (initType) {
                case UseSnapshot: { // 使用 Snapshot
                    File snapshotFile = FileUtils.getHippyFile(this);
                    assert snapshotFile != null;
                    String snapshotPath = snapshotFile.getAbsolutePath() + "/demo.snapshot";
                    initParams.v8InitParams.uri = snapshotPath;
                    initParams.v8InitParams.type = HippyEngine.V8SnapshotType.UseSnapshot.ordinal();

                    byte[] bytes;
                    try {
                        File file = new File(snapshotPath);
                        int size = (int) file.length();
                        bytes = new byte[size];
                        BufferedInputStream buf = new BufferedInputStream(new FileInputStream(file));
                        buf.read(bytes, 0, bytes.length);
                        buf.close();
                        final ByteBuffer buffer = ByteBuffer.allocateDirect(bytes.length);
                        buffer.put(bytes);
                        initParams.coreJSAssetsPath = "";
                        initParams.v8InitParams.uri = null;
                        initParams.v8InitParams.blob = buffer;
                        initParams.v8InitParams.type = HippyEngine.V8SnapshotType.UseSnapshot.ordinal();
                    } catch (IOException ignored) {

                    }
                    break;
                }
                case CreateSnapshot: { // 创建 Snapshot
                    initParams.v8InitParams.type = HippyEngine.V8SnapshotType.CreateSnapshot.ordinal();
                    initParams.v8InitParams.blob = null;
                    File snapshotFile = FileUtils.getHippyFile(this);
                    assert snapshotFile != null;
                    String basePath = URI_SCHEME_ASSETS + "/"; // 如果需要使用动态加载，需要告知创建Snapshot的主bundle目录路径，作为动态加载的基础路径
                    String snapshotPath = snapshotFile.getAbsolutePath() + "/demo.snapshot";

                    String[] list = new String[2];
                    StringBuilder sb = new StringBuilder();
                    String str;
                    try {
                        InputStream is = getAssets().open("vendor.android.js");
                        BufferedReader br = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));
                        while ((str = br.readLine()) != null) {
                            sb.append(str);
                        }
                        br.close();
                    } catch (IOException ignored) {

                    }
                    list[0] = sb.toString();
                    sb = new StringBuilder();
                    try {
                        InputStream is = getAssets().open("index.android.js");
                        BufferedReader br = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));
                        while ((str = br.readLine()) != null) {
                            sb.append(str);
                        }
                        br.close();
                    } catch (IOException ignored) {

                    }
                    list[1] = sb.toString();
                    LibraryLoader.loadLibraryIfNeeded(initParams.soLoader);
                    HippyBridgeImpl.createSnapshotFromScript(list,
                        basePath,
                        snapshotPath,
                        getApplicationContext());
                    if (initParams.v8InitParams.type == HippyEngine.V8SnapshotType.CreateSnapshot.ordinal()) {
                        return;
                    }
                }
                case NoSnapshot: { // 非 Snapshot 启动 v8
                    initParams.v8InitParams.type = HippyEngine.V8SnapshotType.NoSnapshot.ordinal();
                    initParams.v8InitParams.blob = null;
                    break;
                }
                default:
                    break;
            }

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

                    loadParams.codeCacheTag = "Demo";
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

                    HippyEngine.ModuleListener listener = new HippyEngine.ModuleListener() {
                        @Override
                        public void onLoadCompletedInCurrentThread(ModuleLoadStatus statusCode, String msg, HippyRootView hippyRootView) {

                        }

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
                    };
                    // 加载Hippy前端模块
                    if (initType == HippyEngine.V8SnapshotType.UseSnapshot) {
                        loadParams.jsAssetsPath = "";
                        mHippyView = mHippyEngine.loadInstance(loadParams, listener, null);
                    } else {
                        mHippyView = mHippyEngine.loadModule(loadParams, listener, null);
                    }
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
