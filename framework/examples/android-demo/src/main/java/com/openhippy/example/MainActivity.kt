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

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.MotionEvent
import android.view.View
import android.widget.ImageView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowInsetsControllerCompat

var appContext: Context? = null

class MainActivity : AppCompatActivity() {

    private lateinit var activityMainRoot: View

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        appContext = applicationContext
        setAppContext(this.applicationContext)
        WindowInsetsControllerCompat(window, window.decorView).isAppearanceLightStatusBars = true
        activityMainRoot = layoutInflater.inflate(R.layout.activity_main, null)
        intPageMain()
        setContentView(activityMainRoot)
    }

    override fun onResume() {
        super.onResume()
        HippyEngineHelper.clearAbandonHippyEngine()
    }

    private fun intPageMain() {
        val pageManagementButton = activityMainRoot.findViewById<View>(R.id.page_management_button)
        val pageManagementImage =
            pageManagementButton.findViewById<ImageView>(R.id.page_management_image)
        val settingButton = activityMainRoot.findViewById<View>(R.id.setting_button)
        val settingImage = settingButton.findViewById<ImageView>(R.id.setting_image)
        pageManagementButton.setOnClickListener { v ->
            val intent = Intent(this, PageManagement::class.java)
            startActivity(intent)
        }
        settingButton.setOnClickListener { v ->
            val intent = Intent(this, PageSetting::class.java)
            startActivity(intent)
        }
        pageManagementButton.setOnTouchListener { v, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    pageManagementImage.setImageResource(R.drawable.page_management_pressed_2x)
                }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                    pageManagementImage.setImageResource(R.drawable.page_management_2x)
                }
            }
            return@setOnTouchListener false

        }
        settingButton.setOnTouchListener { v, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    settingImage.setImageResource(R.drawable.setting_pressed_2x)
                }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                    settingImage.setImageResource(R.drawable.setting_2x)
                }
            }
            return@setOnTouchListener false

        }
    }
}