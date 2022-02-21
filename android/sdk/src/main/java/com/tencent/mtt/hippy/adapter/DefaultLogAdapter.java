/* Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2018 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.tencent.mtt.hippy.adapter;

import androidx.annotation.NonNull;
import com.tencent.mtt.hippy.utils.LogUtils;

public class DefaultLogAdapter implements HippyLogAdapter {

    @Override
    public void onReceiveLogMessage(int level, @NonNull String tag, @NonNull String msg) {
        switch (level) {
            case LOG_SEVERITY_INFO:
                LogUtils.i(tag, msg);
                break;
            case LOG_SEVERITY_WARNING:
                LogUtils.w(tag, msg);
                break;
            case LOG_SEVERITY_ERROR:
                // fall through
            case LOG_SEVERITY_FATAL:
                LogUtils.e(tag, msg);
                break;
            case LOG_SEVERITY_DEBUG:
                // fall through
            default:
                LogUtils.d(tag, msg);
        }
    }
}
