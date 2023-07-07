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

// Annotate that this class can be used as reference by Js
@HippyTurboObj
class TurboConfig {
    // Annotate that these methods can be called by Js
    @get:HippyTurboProp(expose = true)
    @set:HippyTurboProp(expose = true)
    var info = "info from turboConfig"

    override fun toString(): String = "info:$info"
}