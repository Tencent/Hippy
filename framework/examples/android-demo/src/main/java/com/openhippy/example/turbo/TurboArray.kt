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
package com.openhippy.example.turbo

import com.tencent.mtt.hippy.annotation.HippyTurboObj
import com.tencent.mtt.hippy.annotation.HippyTurboProp
import com.tencent.mtt.hippy.common.HippyArray
import com.tencent.mtt.hippy.common.HippyMap

/**
 * An `Array` type that can be used as reference by Js
 *
 * The following data types are supported:
 * - **As primitive**: int/long/double/String/boolean/HippyMap/HippyArray
 * - **As reference**: TurboArray/TurboMap
 */
@HippyTurboObj
class TurboArray {
    private val mData: ArrayList<Any?> = ArrayList()

    @HippyTurboProp(expose = true)
    fun size(): Int = mData.size

    @HippyTurboProp(expose = true)
    fun getInt(index: Int): Int = (mData.getOrNull(index) as? Number)?.toInt() ?: 0

    @HippyTurboProp(expose = true)
    fun getLong(index: Int): Long = (mData.getOrNull(index) as? Number)?.toLong() ?: 0

    @HippyTurboProp(expose = true)
    fun getDouble(index: Int): Double = (mData.getOrNull(index) as? Number)?.toDouble() ?: 0.0

    @HippyTurboProp(expose = true)
    fun getString(index: Int): String? = mData.getOrNull(index)?.toString()

    @HippyTurboProp(expose = true)
    fun getBoolean(index: Int): Boolean = (mData.getOrNull(index) as? Boolean) ?: false

    @HippyTurboProp(expose = true)
    fun getTurboArray(index: Int): TurboArray? = mData.getOrNull(index) as? TurboArray

    @HippyTurboProp(expose = true)
    fun getTurboMap(index: Int): TurboMap? = mData.getOrNull(index) as? TurboMap

    @HippyTurboProp(expose = true)
    fun getHippyArray(index: Int): HippyArray? = mData.getOrNull(index) as? HippyArray

    @HippyTurboProp(expose = true)
    fun getHippyMap(index: Int): HippyMap? = mData.getOrNull(index) as? HippyMap

    fun pushInt(value: Int) {
        mData.add(value)
    }

    fun pushLong(value: Long) {
        mData.add(value)
    }

    fun pushDouble(value: Double) {
        mData.add(value)
    }

    fun pushBoolean(value: Boolean) {
        mData.add(value)
    }

    fun pushString(value: String?) {
        mData.add(value)
    }

    fun pushTurboArray(array: TurboArray?) {
        mData.add(array)
    }

    fun pushTurboMap(map: TurboMap?) {
        mData.add(map)
    }

    fun pushHippyArray(array: HippyArray?) {
        mData.add(array)
    }

    fun pushHippyMap(map: HippyMap?) {
        mData.add(map)
    }

    fun pushNull() {
        mData.add(null)
    }

    fun clear() {
        mData.clear()
    }

    override fun toString(): String = mData.toString()
}