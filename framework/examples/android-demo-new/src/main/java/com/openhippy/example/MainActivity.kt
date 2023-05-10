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
import android.view.ViewGroup.LayoutParams.MATCH_PARENT
import android.view.ViewGroup.LayoutParams.WRAP_CONTENT
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.ScrollView
import androidx.appcompat.app.AppCompatActivity
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.core.view.WindowInsetsControllerCompat

lateinit var mainActivityContext: Context

class MainActivity : AppCompatActivity() {

    private lateinit var activityMainRoot: View

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        mainActivityContext = this
        WindowInsetsControllerCompat(window, window.decorView).isAppearanceLightStatusBars = true
        activityMainRoot = layoutInflater.inflate(R.layout.activity_main, null)
        intPageIndexScrollerView()
        intPageMain()
        setContentView(activityMainRoot)
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

    private fun intPageIndexScrollerView() {
        scrollerView = ScrollView(this)
        scrollerView.setBackgroundColor(resources.getColor(R.color.home_background))
        val constraintLayout = ConstraintLayout(this)
        constraintLayout.id = pageItemIdCounter.getAndIncrement()
        val layoutParams = ConstraintLayout.LayoutParams(MATCH_PARENT, WRAP_CONTENT)
        constraintLayout.setPadding(
            0,
            0,
            0,
            resources.getDimension(R.dimen.page_index_item_margin).toInt()
        )
        scrollerView.addView(constraintLayout, layoutParams)
    }

}