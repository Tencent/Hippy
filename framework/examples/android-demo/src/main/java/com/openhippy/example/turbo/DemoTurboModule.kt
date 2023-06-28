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

import com.tencent.mtt.hippy.HippyEngineContext
import com.tencent.mtt.hippy.annotation.HippyMethod
import com.tencent.mtt.hippy.annotation.HippyNativeModule
import com.tencent.mtt.hippy.common.HippyArray
import com.tencent.mtt.hippy.common.HippyMap
import com.tencent.mtt.hippy.modules.Promise
import com.tencent.mtt.hippy.modules.PromiseImpl
import com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleBase
import com.tencent.mtt.hippy.utils.LogUtils

@HippyNativeModule(name = "demoTurbo")
class DemoTurboModule(context: HippyEngineContext?) : HippyNativeModuleBase(context) {
    companion object {
        private const val TAG = "ExampleTurboModule"
    }

    @HippyMethod(isSync = true)
    fun getNum(num: Double): Double = num

    @HippyMethod(isSync = true)
    fun getString(info: String?): String = "demoTurbo:$info"

    @HippyMethod(isSync = true)
    fun getBoolean(b: Boolean?): Boolean {
        LogUtils.d(TAG, "getBoolean $b")
        return b ?: false
    }

    @HippyMethod(isSync = true)
    fun getMap(map: HippyMap): HippyMap {
        LogUtils.d(TAG, "getMap ")
        return map
    }

    @HippyMethod(isSync = true)
    fun getArray(array: HippyArray): HippyArray {
        LogUtils.d(TAG, "getArray ")
        return array
    }

    @HippyMethod(isSync = true)
    fun getMapRef(): TurboMap {
        LogUtils.d(TAG, "getMapRef ")
        val turboMap = TurboMap()
        for (i in 0..99) {
            turboMap.pushInt(i.toString(), i)
        }
        val turboArray = TurboArray()
        for (i in 0..99) {
            turboArray.pushInt(i)
        }
        turboMap.pushTurboArray("arrayRef", turboArray)
        return turboMap
    }

    @HippyMethod(isSync = true)
    fun nativeWithPromise(info: String, promise: Promise) {
        LogUtils.d(TAG, "nativeWithPromise $info${Thread.currentThread()} id=${Thread.currentThread().id}")
        if (promise is PromiseImpl) {
            promise.setContext(mContext)
        }
        promise.resolve("resolve from demoTurbo: $info")
    }

    @HippyMethod(isSync = true)
    fun getTurboConfig(): TurboConfig = TurboConfig()

    @HippyMethod(isSync = true)
    fun printTurboConfig(turboConfig: TurboConfig?): String = turboConfig?.toString() ?: "turboConfig == null"
}