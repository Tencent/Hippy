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

import android.view.View
import com.tencent.mtt.hippy.annotation.HippyController
import com.tencent.mtt.hippy.annotation.HippyControllerProps
import com.tencent.mtt.hippy.common.HippyMap
import com.tencent.mtt.hippy.utils.LogUtils
import com.tencent.mtt.hippy.views.custom.HippyCustomPropsController

@HippyController(name = HippyCustomPropsController.CLASS_NAME)
class ExampleCustomPropsController : HippyCustomPropsController() {

    val TAG = "ExampleCustomPropsController"

    @HippyControllerProps(name = "pageParams", defaultType = HippyControllerProps.MAP)
    fun setDtPageParams(view: View, params: HippyMap?) {
        LogUtils.d(TAG, "setDtPageParams id " + view.id + ", params " + params)
    }

    @HippyControllerProps(name = "elementParams", defaultType = HippyControllerProps.MAP)
    fun setDtElementParams(view: View, params: HippyMap?) {
        LogUtils.d(TAG, "setDtElementParams id " + view.id + ", params " + params)
    }
}
