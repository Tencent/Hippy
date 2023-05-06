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
import android.util.DisplayMetrics
import android.view.View
import android.widget.ScrollView

var appContext: Context? = null
var scrollerView: ScrollView? = null
var pageAddItem: View? = null

fun getScreenWidth() : Int {
    val displayMetrics: DisplayMetrics? = appContext?.resources?.displayMetrics
    displayMetrics?.let {
        return it.widthPixels
    }
    return 0
}

fun getScreenHeight() : Int {
    val displayMetrics: DisplayMetrics? = appContext?.resources?.displayMetrics
    displayMetrics?.let {
        return it.heightPixels
    }
    return 0
}

fun getPageIndexItemWidth() : Int {
    var margin = appContext?.resources?.getDimension(R.dimen.page_index_item_margin)
    margin?.let {
        var width = (getScreenWidth() - margin*3)/2
        return width.toInt()
    }
    return 0
}
