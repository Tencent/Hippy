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

import android.app.Dialog
import android.graphics.Color
import android.os.Bundle
import android.text.SpannableString
import android.text.Spanned
import android.text.style.ForegroundColorSpan
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.AppCompatEditText
import androidx.core.view.WindowInsetsControllerCompat
import com.tencent.mtt.hippy.HippyEngine
import com.tencent.mtt.hippy.utils.LogUtils

class PageConfiguration : AppCompatActivity(), View.OnClickListener {

    enum class DriverMode {
        JS_REACT, JS_VUE_2, JS_VUE_3, VL
    }

    enum class RenderMode {
        NATIVE, TDF_CORE, FLUTTER
    }

    companion object {
        var currentEngineId: Int = -1
    }

    private lateinit var pageConfigurationRoot: View
    private lateinit var pageConfigurationContainer: View
    private lateinit var pageConfigurationSetting: View
    private lateinit var pageConfigurationTitle: View
    private lateinit var driverSettingText: View
    private lateinit var rendererSettingText: View
    private var hasRunOnCreate = false
    private var hippyEngineWrapper: HippyEngineWrapper? = null
    private var debugMode: Boolean = false
    private var snapshotMode: Boolean = false
    private var debugServerHost: String = "localhost:38989"
    private var dialog: Dialog? = null
    private var driverMode: DriverMode = DriverMode.JS_REACT
    private var renderMode: RenderMode = RenderMode.NATIVE

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowInsetsControllerCompat(window, window.decorView).isAppearanceLightStatusBars = true
        window.statusBarColor = Color.WHITE
        pageConfigurationRoot = layoutInflater.inflate(R.layout.activity_page_configuration, null)
        pageConfigurationContainer =
            pageConfigurationRoot.findViewById(R.id.page_configuration_container)
        pageConfigurationSetting =
            pageConfigurationRoot.findViewById(R.id.page_configuration_setting)
        pageConfigurationTitle =
            pageConfigurationRoot.findViewById(R.id.page_configuration_navigation_title)

        val backButton =
            pageConfigurationRoot.findViewById<View>(R.id.page_configuration_navigation_back)
        backButton.setOnClickListener { v ->
            buildSnapshot {
                moveTaskToBack(true)
            }
        }
        initSettingView()
        hasRunOnCreate = true
        setContentView(pageConfigurationRoot)
    }

    override fun onStop() {
        hippyEngineWrapper?.onStop()
        super.onStop()
    }

    override fun onResume() {
        if (!hasRunOnCreate) {
            (pageConfigurationContainer as ViewGroup).removeAllViews()
            if (currentEngineId == -1) {
                (pageConfigurationTitle as TextView).text =
                    resources.getText(R.string.page_configuration_navigation_title)
                (pageConfigurationContainer as ViewGroup).addView(pageConfigurationSetting)
            } else {
                val hippyEngineList = HippyEngineHelper.getHippyEngineList()
                for (engine in hippyEngineList) {
                    if (engine.engineId == currentEngineId) {
                        hippyEngineWrapper = engine
                    }
                }
                (pageConfigurationTitle as TextView).text =
                    resources.getText(R.string.page_configuration_navigation_title_demo)
                hippyEngineWrapper?.let {
                    (pageConfigurationContainer as ViewGroup).addView(it.hippyRootView)
                    it.onResume(this)
                }
            }
        }
        hasRunOnCreate = false
        super.onResume()
    }

    override fun onBackPressed() {
        val goBack: () -> Unit = {
            buildSnapshot {
                moveTaskToBack(true)
            }
        }
        hippyEngineWrapper?.apply {
            if (hippyEngine.onBackPressed(goBack)) {
                return
            }
        }
        goBack()
    }

    private fun buildSnapshot(runnable: Runnable) {
        val rootView = hippyEngineWrapper?.hippyRootView
        if (rootView == null || currentEngineId == -1) {
            runnable.run()
        } else {
            hippyEngineWrapper?.let {
                if (!it.isDebugMode) {
                    hippyEngineWrapper?.recordRenderNodeSnapshot()
                }
                it.buildRootViewScreenshot(this, object : GenerateScreenshotCallback {
                    override fun onScreenshotBuildFinished() {
                        (pageConfigurationContainer as ViewGroup).removeAllViews()
                        runnable.run()
                        hippyEngineWrapper = null
                    }
                })
            }
        }
    }

    private fun initSettingView() {
        val driverSettingButton =
            pageConfigurationRoot.findViewById<View>(R.id.page_configuration_driver_setting)
        driverSettingText =
            pageConfigurationRoot.findViewById(R.id.page_configuration_driver_setting_title)
        driverSettingButton.setOnClickListener {
            onDriverSettingClick()
        }

        val rendererSettingButton =
            pageConfigurationRoot.findViewById<View>(R.id.page_configuration_renderer_setting)
        rendererSettingText =
            pageConfigurationRoot.findViewById(R.id.page_configuration_renderer_setting_title)
        rendererSettingButton.setOnClickListener {
            onRendererSettingClick()
        }
        val debugButton =
            pageConfigurationRoot.findViewById<View>(R.id.page_configuration_debug_setting_image)
        val debugServerHostParent =
            pageConfigurationRoot.findViewById<View>(R.id.page_configuration_debug_server_host)
        debugButton.setOnClickListener {
            if (debugMode) {
                (debugButton as ImageView).setImageResource(R.drawable.page_config_debug_off_2x)
                debugServerHostParent.visibility = View.GONE
                debugMode = false
            } else {
                (debugButton as ImageView).setImageResource(R.drawable.page_config_debug_on_2x)
                debugServerHostParent.visibility = View.VISIBLE
                debugMode = true
            }
        }
        val snapshotButton =
            pageConfigurationRoot.findViewById<View>(R.id.page_configuration_snapshot_setting_image)
        snapshotButton.setOnClickListener {
            snapshotMode = if (snapshotMode) {
                (snapshotButton as ImageView).setImageResource(R.drawable.page_config_debug_off_2x)
                false
            } else {
                (snapshotButton as ImageView).setImageResource(R.drawable.page_config_debug_on_2x)
                true
            }
        }
        val createButton =
            pageConfigurationRoot.findViewById<View>(R.id.page_configuration_create_image)
        createButton.setOnClickListener { v ->
            val debugServerHostInput =
                pageConfigurationRoot.findViewById<View>(R.id.page_configuration_debug_server_host_input)
            (debugServerHostInput as AppCompatEditText).let {
                debugServerHost = it.text.toString()
            }
            onCreateClick()
        }
    }

    private fun onCreateClick() {
        (pageConfigurationTitle as TextView).text =
            resources.getText(R.string.page_configuration_navigation_title_demo)
        (pageConfigurationContainer as ViewGroup).removeAllViews()
        pageConfigurationContainer.post {
            hippyEngineWrapper = HippyEngineHelper.createHippyEngine(
                driverMode,
                renderMode,
                debugMode,
                snapshotMode,
                debugServerHost
            )
            hippyEngineWrapper?.let {
                currentEngineId = it.engineId
            }
            hippyEngineWrapper?.load(this, object : HippyEngineWrapper.HippyEngineLoadCallback {
                override fun onInitEngineCompleted(
                    statusCode: HippyEngine.EngineInitStatus,
                    msg: String?
                ) {
                    LogUtils.e("hippy", "onInitEngineCompleted: statusCode $statusCode, msg $msg")
                }

                override fun onCreateRootView(hippyRootView: ViewGroup?) {
                    hippyRootView?.let {
                        (pageConfigurationContainer as ViewGroup).addView(hippyRootView)
                    }
                }

                override fun onReplaySnapshotViewCompleted(snapshotView: ViewGroup) {
                    (pageConfigurationContainer as ViewGroup).addView(snapshotView)
                }

                override fun onLoadModuleCompleted(
                    statusCode: HippyEngine.ModuleLoadStatus,
                    msg: String?
                ) {
                    LogUtils.e("hippy", "onLoadModuleCompleted: statusCode $statusCode, msg $msg")
                }
            })
        }
    }

    private fun onRendererSettingClick() {
        dialog = Dialog(this, R.style.PageConfigurationDialogStyle)
        val rendererSetting = layoutInflater.inflate(R.layout.renderer_setting, null)
        val rendererNative =
            rendererSetting.findViewById<View>(R.id.page_configuration_renderer_native)
        val rendererTdf =
            rendererSetting.findViewById<View>(R.id.page_configuration_renderer_tdf_core)
        val rendererFlutter =
            rendererSetting.findViewById<View>(R.id.page_configuration_renderer_flutter)
        rendererNative.setOnClickListener(this)
        rendererTdf.setOnClickListener(this)
        rendererFlutter.setOnClickListener(this)
        dialog?.setContentView(rendererSetting)
        val dialogWindow = dialog?.window
        dialogWindow?.setGravity(Gravity.BOTTOM)
        val lp = dialogWindow?.attributes
        lp?.width = (getScreenWidth() * 0.95).toInt()
        dialogWindow?.attributes = lp
        dialog?.show()
    }

    private fun onDriverSettingClick() {
        dialog = Dialog(this, R.style.PageConfigurationDialogStyle)
        val driverSetting = layoutInflater.inflate(R.layout.driver_setting, null)
        val driverJSReact = driverSetting.findViewById<View>(R.id.page_configuration_driver_react)
        val driverJSVue2 = driverSetting.findViewById<View>(R.id.page_configuration_driver_vue2)
        val driverJSVue3 = driverSetting.findViewById<View>(R.id.page_configuration_driver_vue3)
        val driverVL = driverSetting.findViewById<View>(R.id.page_configuration_driver_vl)
        driverJSReact.setOnClickListener(this)
        driverJSVue2.setOnClickListener(this)
        driverJSVue3.setOnClickListener(this)
        driverVL.setOnClickListener(this)
        dialog?.setContentView(driverSetting)
        val dialogWindow = dialog?.window
        dialogWindow?.setGravity(Gravity.BOTTOM)
        val lp = dialogWindow?.attributes
        lp?.width = (getScreenWidth() * 0.95).toInt()
        dialogWindow?.attributes = lp
        dialog?.show()
    }

    override fun onClick(p0: View?) {
        when (p0?.id) {
            R.id.page_configuration_driver_react -> {
                driverMode = DriverMode.JS_REACT
                (driverSettingText as TextView).text = resources.getText(R.string.driver_js_react)
                dialog?.dismiss()
            }
            R.id.page_configuration_driver_vue2 -> {
                driverMode = DriverMode.JS_VUE_2
                (driverSettingText as TextView).text = resources.getText(R.string.driver_js_vue2)
                dialog?.dismiss()
            }
            R.id.page_configuration_driver_vue3 -> {
                driverMode = DriverMode.JS_VUE_3
                (driverSettingText as TextView).text = resources.getText(R.string.driver_js_vue3)
                dialog?.dismiss()
            }
            R.id.page_configuration_renderer_native -> {
                renderMode = RenderMode.NATIVE
                (rendererSettingText as TextView).text = resources.getText(R.string.renderer_native)
                dialog?.dismiss()
            }
            R.id.page_configuration_renderer_tdf_core,
            R.id.page_configuration_renderer_flutter,
            R.id.page_configuration_driver_vl -> {
                val text = resources.getText(R.string.setting_not_available)
                val span = SpannableString(text)
                span.setSpan(
                    ForegroundColorSpan(Color.BLACK),
                    0,
                    text.length,
                    Spanned.SPAN_EXCLUSIVE_EXCLUSIVE
                )
                val toast: Toast =
                    Toast.makeText(
                        this,
                        span,
                        Toast.LENGTH_SHORT
                    )
                toast.setGravity(Gravity.CENTER, 0, 0)
                toast.show()
            }
        }
    }

    interface GenerateScreenshotCallback {
        fun onScreenshotBuildFinished()
    }
}