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

import android.app.Activity
import android.content.Context
import android.graphics.Bitmap
import android.view.View
import android.view.ViewGroup
import android.view.ViewParent
import com.tencent.mtt.hippy.HippyAPIProvider
import com.tencent.mtt.hippy.HippyEngine
import com.tencent.mtt.hippy.HippyEngine.*
import com.tencent.mtt.hippy.HippyEngineManagerImpl
import com.tencent.mtt.hippy.adapter.DefaultLogAdapter
import com.tencent.mtt.hippy.adapter.exception.HippyExceptionHandlerAdapter
import com.tencent.mtt.hippy.common.HippyJsException
import com.tencent.mtt.hippy.common.HippyMap
import com.tencent.mtt.hippy.utils.LogUtils
import com.tencent.mtt.hippy.utils.UIThreadUtils

class HippyEngineWrapper {

    var hippyEngine: HippyEngine
    var hippyRootView: ViewGroup? = null
    var devButton: View? = null
    var snapshot: Bitmap? = null
    var pageItem: View? = null
    var isDebugMode: Boolean = false
    val driverMode: PageConfiguration.DriverMode
    val renderMode: PageConfiguration.RenderMode
    val engineId: Int

    constructor(dm: PageConfiguration.DriverMode,
                rm: PageConfiguration.RenderMode,
                isDebug: Boolean,
                debugServerHost: String) {
        driverMode = dm
        renderMode = rm
        isDebugMode = isDebug
        val initParams = EngineInitParams()
        initParams.context = applicationContext
        initParams.debugServerHost = debugServerHost
        initParams.debugMode = isDebug
        initParams.enableLog = true
        initParams.logAdapter = DefaultLogAdapter()
        when(driverMode) {
            PageConfiguration.DriverMode.JS_REACT -> {
                initParams.coreJSAssetsPath = "react/vendor.android.js"
            }
            PageConfiguration.DriverMode.JS_VUE_2 -> {
                initParams.coreJSAssetsPath = "vue2/vendor.android.js"
            }
            PageConfiguration.DriverMode.JS_VUE_3 -> {
                initParams.coreJSAssetsPath = "vue3/vendor.android.js"
            }
            PageConfiguration.DriverMode.VL -> {
                //TODO: Coming soon
            }
        }
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
        providers.add(ExampleAPIProvider())
        initParams.providers = providers
        initParams.enableTurbo = true
        hippyEngine = create(initParams)
        engineId = hippyEngine.engineId
    }

    fun onStop() {
        if (devButton == null) {
            hippyRootView?.let {
                devButton = (hippyEngine as HippyEngineManagerImpl).getDevButton(it.id)
            }
        }
        devButton?.let {
            val parent: ViewParent? = it.parent
            parent?.let {
                (parent as ViewGroup).removeView(devButton)
            }
        }
    }

    fun onResume(context: Context) {
        hippyRootView?.let {
            devButton = (hippyEngine as HippyEngineManagerImpl).getDevButton(it.id)
            if (devButton != null) {
                val parent: ViewParent? = devButton?.parent
                if (parent == null) {
                    val decorView = (context as Activity).window.decorView as ViewGroup
                    decorView.addView(devButton)
                }
            }
        }
    }

    fun destroy() {
        hippyEngine.destroyModule(hippyRootView) { result, e ->
            hippyEngine.destroyEngine()
        }
        hippyRootView = null
    }

    fun load(context: Context, callback: HippyEngineLoadCallback) {
        hippyEngine.initEngine(object: EngineListener {
            override fun onInitialized(statusCode: EngineInitStatus, msg: String?) {
                callback.onInitEngineCompleted(statusCode, msg)
                if (statusCode == EngineInitStatus.STATUS_OK) {
                    val loadParams = ModuleLoadParams()
                    loadParams.context = context
                    loadParams.componentName = "Demo"
                    loadParams.codeCacheTag = "Demo"
                    when(driverMode) {
                        PageConfiguration.DriverMode.JS_REACT -> {
                            loadParams.jsAssetsPath = "react/index.android.js"
                        }
                        PageConfiguration.DriverMode.JS_VUE_2 -> {
                            loadParams.jsAssetsPath = "vue2/index.android.js"
                        }
                        PageConfiguration.DriverMode.JS_VUE_3 -> {
                            loadParams.jsAssetsPath = "vue3/index.android.js"
                        }
                        PageConfiguration.DriverMode.VL -> {
                            //TODO: Coming soon
                        }
                    }
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