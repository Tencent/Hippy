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
 * A `Map` type that can be used as reference by Js
 *
 * The following data types are supported:
 * - **As primitive**: int/long/double/String/boolean/HippyMap/HippyArray
 * - **As reference**: TurboArray/TurboMap
 */
@HippyTurboObj
class TurboMap {
    private val mData: HashMap<String, Any?> = HashMap()

    override fun toString(): String = mData.toString()

    fun containsKey(key: String): Boolean = mData.containsKey(key)

    @HippyTurboProp(expose = true)
    fun size(): Int = mData.size

    fun keySet(): Set<String> = mData.keys

    fun entrySet(): Set<Map.Entry<String, Any?>> = mData.entries

    @HippyTurboProp(expose = true)
    fun getString(key: String): String? = mData[key]?.toString()

    fun remove(key: String) {
        mData.remove(key)
    }

    @HippyTurboProp(expose = true)
    fun getDouble(key: String): Double = (mData[key] as? Number)?.toDouble() ?: 0.0

    @HippyTurboProp(expose = true)
    fun getInt(key: String): Int = (mData[key] as? Number)?.toInt() ?: 0

    @HippyTurboProp(expose = true)
    fun getBoolean(key: String): Boolean = mData[key] as? Boolean ?: false

    @HippyTurboProp(expose = true)
    fun getLong(key: String): Long = (mData[key] as? Number)?.toLong() ?: 0

    @HippyTurboProp(expose = true)
    fun getTurboMap(key: String): TurboMap? = mData[key] as? TurboMap

    @HippyTurboProp(expose = true)
    fun getTurboArray(key: String): TurboArray? = mData[key] as? TurboArray

    @HippyTurboProp(expose = true)
    fun getHippyMap(key: String): HippyMap? = mData[key] as? HippyMap

    @HippyTurboProp(expose = true)
    fun getHippyArray(key: String): HippyArray? = mData[key] as? HippyArray

    fun isNull(key: String): Boolean = mData[key] == null

    fun pushNull(key: String) {
        mData[key] = null
    }

    fun pushInt(key: String, value: Int) {
        mData[key] = value
    }

    fun pushString(key: String, value: String?) {
        mData[key] = value
    }

    fun pushBoolean(key: String, value: Boolean) {
        mData[key] = value
    }

    fun pushDouble(key: String, value: Double) {
        mData[key] = value
    }

    fun pushLong(key: String, value: Long) {
        mData[key] = value
    }

    fun pushTurboArray(key: String, array: TurboArray?) {
        mData[key] = array
    }

    fun pushTurboMap(key: String, map: TurboMap?) {
        mData[key] = map
    }

    fun pushHippyArray(key: String, array: HippyArray?) {
        mData[key] = array
    }

    fun pushHippyMap(key: String, map: HippyMap?) {
        mData[key] = map
    }

    fun pushAll(map: Map<*, *>?) {
        map?.forEach { (key, value) -> mData[key.toString()] = value }
    }

    fun clear() {
        mData.clear()
    }
}