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
import android.view.Gravity
import android.view.View
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowInsetsControllerCompat


class PageConfiguration : AppCompatActivity(), View.OnClickListener {

    enum class DriverType {
        JS_REACT, JS_VUE
    }

    enum class RendererType {
        NATIVE, TDF_CORE, FLUTTER
    }

    private lateinit var pageConfigurationRoot: View
    private lateinit var driverSettingText: View
    private lateinit var rendererSettingText: View
    private var debugMode: Boolean = false
    private var dialog: Dialog? = null
    private var driverType: DriverType = DriverType.JS_REACT
    private var rendererType: RendererType = RendererType.NATIVE

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowInsetsControllerCompat(window, window.decorView).isAppearanceLightStatusBars = true
        window.statusBarColor = Color.WHITE
        pageConfigurationRoot = layoutInflater.inflate(R.layout.activity_page_configuration, null)

        val backButton =
            pageConfigurationRoot.findViewById<View>(R.id.page_configuration_navigation_back)
        backButton.setOnClickListener { v ->
            onBackPressedDispatcher.onBackPressed()
        }

        val driverSettingButton =
            pageConfigurationRoot.findViewById<View>(R.id.page_configuration_driver_setting)
        driverSettingText =
            pageConfigurationRoot.findViewById(R.id.page_configuration_driver_setting_title)
        driverSettingButton.setOnClickListener { v ->
            onDriverSettingClick()
        }

        val rendererSettingButton =
            pageConfigurationRoot.findViewById<View>(R.id.page_configuration_renderer_setting)
        rendererSettingText =
            pageConfigurationRoot.findViewById(R.id.page_configuration_renderer_setting_title)
        rendererSettingButton.setOnClickListener { v ->
            onRendererSettingClick()
        }
        val debugButton =
            pageConfigurationRoot.findViewById<View>(R.id.page_configuration_debug_setting_image)
        val debugServerHost =
            pageConfigurationRoot.findViewById<View>(R.id.page_configuration_debug_server_host)
        debugButton.setOnClickListener { v ->
            if (debugMode) {
                (debugButton as ImageView).setImageResource(R.drawable.page_config_debug_off_2x)
                debugMode = false
                debugServerHost.visibility = View.GONE
            } else {
                (debugButton as ImageView).setImageResource(R.drawable.page_config_debug_on_2x)
                debugMode = true
                debugServerHost.visibility = View.VISIBLE
            }
        }

        setContentView(pageConfigurationRoot)
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
        val driverJSVue = driverSetting.findViewById<View>(R.id.page_configuration_driver_vue)
        driverJSReact.setOnClickListener(this)
        driverJSVue.setOnClickListener(this)
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
                driverType = DriverType.JS_REACT
                (driverSettingText as TextView).text = resources.getText(R.string.driver_js_react)
                dialog?.dismiss()
            }
            R.id.page_configuration_driver_vue -> {
                driverType = DriverType.JS_VUE
                (driverSettingText as TextView).text = resources.getText(R.string.driver_js_vue)
                dialog?.dismiss()
            }
            R.id.page_configuration_renderer_native -> {
                rendererType = RendererType.NATIVE
                (rendererSettingText as TextView).text = resources.getText(R.string.renderer_native)
                dialog?.dismiss()
            }
            R.id.page_configuration_renderer_tdf_core, R.id.page_configuration_renderer_flutter -> {
                val toast: Toast =
                    Toast.makeText(
                        this,
                        resources.getText(R.string.setting_not_available),
                        Toast.LENGTH_SHORT
                    )
                toast.setGravity(Gravity.CENTER_VERTICAL or Gravity.CENTER_HORIZONTAL, 0, 0)
                val v = toast.view!!.findViewById(android.R.id.message) as TextView
                v.setTextColor(Color.WHITE)
                toast.show()
            }
        }
    }
}