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

import android.content.Intent
import android.graphics.Color
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import android.view.ViewGroup.LayoutParams.MATCH_PARENT
import android.view.ViewGroup.LayoutParams.WRAP_CONTENT
import android.view.ViewGroup.MarginLayoutParams
import android.widget.ImageView
import androidx.core.view.WindowInsetsControllerCompat

class PageManagement : AppCompatActivity() {

    private lateinit var pageManagementRoot: View
    private lateinit var pageManagementContainer: View

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowInsetsControllerCompat(window, window.decorView).isAppearanceLightStatusBars = true
        window.statusBarColor = Color.WHITE
        pageManagementRoot = layoutInflater.inflate(R.layout.activity_page_management, null)
        setContentView(pageManagementRoot)
        pageManagementContainer =
            pageManagementRoot.findViewById(R.id.page_management_container)
        val pageManagementBackButton =
            pageManagementRoot.findViewById<View>(R.id.page_management_navigation_back)
        pageManagementBackButton.setOnClickListener { v ->
            onBackPressedDispatcher.onBackPressed()
        }
        addPageIndexScrollView()
    }

    override fun onDestroy() {
        (pageManagementContainer as? ViewGroup) ?.removeAllViews()
        super.onDestroy()
    }

    private fun addPageIndexScrollView() {
        var layoutParams = ViewGroup.LayoutParams(MATCH_PARENT, MATCH_PARENT)
        (pageManagementContainer as? ViewGroup) ?.addView(scrollerView, layoutParams)
        initPageAddItemIfNeeded()
    }

    private fun initPageAddItemIfNeeded() {
        if (scrollerView?.childCount == 0 && pageAddItem == null) {
            val addItem = layoutInflater.inflate(R.layout.page_index_item, null)
            val pageItemContainer = addItem.findViewById<View>(R.id.page_item_container)
            val pageItemImage = addItem.findViewById<ImageView>(R.id.page_item_image)
            pageItemImage.setImageResource(R.drawable.add_page_2x)
            pageItemContainer.layoutParams?.let {
                var ratio: Float = it.height.toFloat()/it.width.toFloat()
                it.width = getPageIndexItemWidth()
                it.height = (it.width*ratio).toInt()
            }
            pageItemImage.layoutParams?.let {
                it.width = resources.getDimension(R.dimen.page_item_add_image_width).toInt()
                it.height = resources.getDimension(R.dimen.page_item_add_image_height).toInt()
            }
            pageItemImage.setOnClickListener { v ->
                val intent = Intent(this, PageConfiguration::class.java)
                startActivity(intent)
            }
            val layoutParams = MarginLayoutParams(WRAP_CONTENT, WRAP_CONTENT)
            layoutParams.leftMargin = resources.getDimension(R.dimen.page_index_item_margin).toInt()
            layoutParams.topMargin = resources.getDimension(R.dimen.page_index_item_margin).toInt()
            scrollerView?.addView(addItem, layoutParams)
            pageAddItem = addItem
        }
    }
}