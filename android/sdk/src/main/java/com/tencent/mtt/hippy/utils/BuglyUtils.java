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

package com.tencent.mtt.hippy.utils;

import android.content.Context;
import android.content.SharedPreferences;
import androidx.annotation.Nullable;
import com.tencent.mtt.hippy.BuildConfig;

public class BuglyUtils {

    private static final String BUGLY_KEY = "BuglySdkInfos";
    private static final String SDK_APP_ID = "8aa644f958";
    private static boolean sHasCommitted = false;

    public static void registerSdkAppIdIfNeeded(@Nullable Context context) {
        if (!BuildConfig.ENABLE_BUGLY_REPORT || sHasCommitted || context == null) {
            return;
        }
        Context appContext = context.getApplicationContext();
        SharedPreferences settings = appContext.getSharedPreferences(BUGLY_KEY, Context.MODE_PRIVATE);
        String version = settings.getString(SDK_APP_ID, null);
        if (!BuildConfig.LIBRARY_VERSION.equals(version)) {
            SharedPreferences.Editor editor = settings.edit();
            editor.putString(SDK_APP_ID, BuildConfig.LIBRARY_VERSION);
            sHasCommitted = editor.commit();
        } else {
            sHasCommitted = true;
        }
    }
}
