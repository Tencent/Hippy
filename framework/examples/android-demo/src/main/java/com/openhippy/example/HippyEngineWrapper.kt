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
import android.os.Handler
import android.os.Looper
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

class HippyEngineWrapper//TODO: Coming soon
    (
    dm: PageConfiguration.DriverMode,
    rm: PageConfiguration.RenderMode,
    isDebug: Boolean,
    useNodeSnapshot: Boolean,
    debugServerHost: String
) {

    var hippyEngine: HippyEngine
    var hippyRootView: ViewGroup? = null
    var hippySnapshotView: ViewGroup? = null
    var devButton: View? = null
    var screenshot: Bitmap? = null
    var pageItem: View? = null
    var isDebugMode: Boolean = isDebug
    var isSnapshotMode: Boolean = useNodeSnapshot
    val driverMode: PageConfiguration.DriverMode = dm
    val renderMode: PageConfiguration.RenderMode = rm
    val engineId: Int

    companion object {
        val renderNodeSnapshot: HashMap<PageConfiguration.DriverMode, ByteArray> = HashMap()
    }

    init {
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
        hippySnapshotView = null
    }

    fun recordRenderNodeSnapshot() {
        hippyEngine.recordSnapshot(hippyRootView as View) {
                buffer, e ->
            run {
                buffer?.let {
                    renderNodeSnapshot[driverMode] = buffer
                }
            }
        }
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
                    var snapshotView: View? = null
                    if (!isDebugMode && isSnapshotMode) {
                        val buffer = renderNodeSnapshot[driverMode]
                        buffer?.let {
                            snapshotView = hippyEngine.replaySnapshot(context, it)
                        }
                        snapshotView?.let {
                            hippySnapshotView = snapshotView as ViewGroup
                        }
                    }
                    hippyRootView = hippyEngine.loadModule(loadParams, object : ModuleListener {
                        override fun onLoadCompleted(statusCode: ModuleLoadStatus, msg: String?) {
                            callback.onLoadModuleCompleted(statusCode, msg)
                        }

                        override fun onJsException(exception: HippyJsException): Boolean {
                            return true
                        }

                        override fun onFirstViewAdded() {
                            snapshotView?.let {
                                val handler = Handler(Looper.getMainLooper())
                                handler.postDelayed({
                                    hippyEngine.removeSnapshotView()
                                }, 400)
                            }
                        }
                    })

                    val loadCallbackTask = Runnable {
                        callback.onCreateRootView(hippyRootView)
                        snapshotView?.let {
                            callback.onReplaySnapshotViewCompleted(snapshotView as ViewGroup)
                        }
                    }
                    if (UIThreadUtils.isOnUiThread()) {
                        loadCallbackTask.run()
                    } else {
                        UIThreadUtils.runOnUiThread {
                            loadCallbackTask.run()
                        }
                    }
                }
            }
        })
    }

    fun buildRootViewScreenshot(context: Context, callback: PageConfiguration.GenerateScreenshotCallback) {
        hippyRootView?:let {
            callback.onScreenshotBuildFinished()
            return
        }
        try {
            hippyEngine.getScreenshotBitmapForView(context, hippyRootView as View
            ) { bitmap, result ->
                run {
                    if (result == 0) {
                        screenshot = bitmap
                    } else {
                        LogUtils.e("Demo", "buildRootViewScreenshot error code: $result")
                    }
                    callback.onScreenshotBuildFinished()
                }
            }
        } catch (e: IllegalArgumentException) {
            LogUtils.e("Demo", "buildRootViewScreenshot exception message: ${e.message}")
            callback.onScreenshotBuildFinished()
        }
    }

    interface HippyEngineLoadCallback {
        fun onInitEngineCompleted(statusCode: EngineInitStatus, msg: String?)
        fun onCreateRootView(hippyRootView: ViewGroup?)
        fun onReplaySnapshotViewCompleted(snapshotView: ViewGroup)
        fun onLoadModuleCompleted(statusCode: ModuleLoadStatus, msg: String?)
    }
}