/*
 * Tencent is pleased to support the open source community by making Hippy
 * available.
 * Copyright (C) 2018 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.openhippy.example

import android.graphics.Bitmap
import android.view.View
import android.view.ViewGroup
import com.tencent.mtt.hippy.HippyAPIProvider
import com.tencent.mtt.hippy.HippyEngine
import com.tencent.mtt.hippy.HippyEngine.*
import com.tencent.mtt.hippy.adapter.DefaultLogAdapter
import com.tencent.mtt.hippy.adapter.exception.HippyExceptionHandlerAdapter
import com.tencent.mtt.hippy.common.HippyJsException
import com.tencent.mtt.hippy.common.HippyMap
import com.tencent.mtt.hippy.utils.LogUtils
import com.tencent.mtt.hippy.utils.UIThreadUtils

class HippyEngineWrapper {

    var hippyEngine: HippyEngine
    var hippyRootView: ViewGroup? = null
    var snapshot: Bitmap? = null
    var pageItem: View? = null

    constructor(driverType: PageConfiguration.DriverType,
                rendererType: PageConfiguration.RendererType,
                isDebugMode: Boolean,
                debugServerHost: String) {
        val initParams = EngineInitParams()
        initParams.context = mainActivityContext.applicationContext
        initParams.debugServerHost = debugServerHost
        initParams.debugMode = isDebugMode
        initParams.enableLog = true
        initParams.logAdapter = DefaultLogAdapter()
        initParams.coreJSAssetsPath = "vendor.android.js"
        initParams.codeCacheTag = "common"
        initParams.exceptionHandler = object : HippyExceptionHandlerAdapter {
            override fun handleJsException(e: HippyJsException) {
                LogUtils.e("hippy", e.message)
            }
            override fun handleNativeException(e: Exception, haveCaught: Boolean) {
                LogUtils.e("hippy", e.message)
            }
            override fun handleBackgroundTracing(details: String) {
                LogUtils.e("hippy", details)
            }
        }
        val providers: MutableList<HippyAPIProvider> = ArrayList()
        initParams.providers = providers
        initParams.enableTurbo = true
        hippyEngine = create(initParams)
    }

    fun load(callback: HippyEngineLoadCallback) {
        hippyEngine.initEngine(object: EngineListener {
            override fun onInitialized(statusCode: EngineInitStatus, msg: String?) {
                callback.onInitEngineCompleted(statusCode, msg)
                if (statusCode == EngineInitStatus.STATUS_OK) {
                    val loadParams = ModuleLoadParams()
                    loadParams.context = mainActivityContext
                    loadParams.componentName = "Demo"
                    loadParams.codeCacheTag = "Demo"
                    loadParams.jsAssetsPath = "index.android.js"
                    loadParams.jsFilePath = null
                    loadParams.jsParams = HippyMap()
                    loadParams.jsParams.pushString(
                        "msgFromNative",
                        "Hi js developer, I come from native code!"
                    )
                    hippyRootView = hippyEngine.loadModule(loadParams, object : ModuleListener {
                        override fun onLoadCompleted(statusCode: ModuleLoadStatus, msg: String?) {
                            callback.onLoadModuleCompleted(statusCode, msg)
                        }

                        override fun onJsException(exception: HippyJsException): Boolean {
                            return true
                        }

                        override fun onFirstViewAdded() {
                            LogUtils.e("MyActivity", "onFirstViewAdded")
                        }
                    })
                    if (UIThreadUtils.isOnUiThread()) {
                        callback.onCreateRootView(hippyRootView)
                    } else {
                        UIThreadUtils.runOnUiThread {
                            callback.onCreateRootView(hippyRootView)
                        }
                    }
                }
            }
        })
    }

    interface HippyEngineLoadCallback {
        fun onInitEngineCompleted(statusCode: EngineInitStatus, msg: String?)
        fun onCreateRootView(hippyRootView: ViewGroup?)
        fun onLoadModuleCompleted(statusCode: ModuleLoadStatus, msg: String?)
    }

}