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

package com.tencent.mtt.hippy.modules.nativemodules.clipboard;

import android.content.ClipData;
import android.content.Context;

import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.annotation.HippyMethod;
import com.tencent.mtt.hippy.annotation.HippyNativeModule;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleBase;
import android.content.ClipboardManager;
import com.tencent.mtt.hippy.utils.ContextHolder;

@HippyNativeModule(name = "ClipboardModule")
public class ClipboardModule extends HippyNativeModuleBase {

    private final ClipboardManager mClipboardManager;

    public ClipboardModule(HippyEngineContext context) {
        super(context);
        mClipboardManager = (ClipboardManager) (mContext.getGlobalConfigs()).getContext()
                .getSystemService(Context.CLIPBOARD_SERVICE);
    }

    private ClipboardManager getClipboardService() {
        return mClipboardManager;
    }

    @SuppressWarnings("unused")
    @HippyMethod(name = "getString")
    public void getString(Promise promise) {
        if (android.os.Build.VERSION.SDK_INT < android.os.Build.VERSION_CODES.Q) {
            if (ContextHolder.isAppOnBackground()) {
                promise.resolve("");
                return;
            }
        }
        try {
            ClipboardManager clipboard = getClipboardService();
            ClipData clipData = clipboard.getPrimaryClip();
            if (clipData != null && clipData.getItemCount() >= 1) {
                ClipData.Item firstItem = clipboard.getPrimaryClip().getItemAt(0);
                promise.resolve("" + firstItem.getText());
            } else {
                promise.resolve("");
            }
        } catch (Exception e) {
            promise.reject(e);
        }
    }

    @SuppressWarnings("unused")
    @HippyMethod(name = "setString")
    public void setString(String text) {
        if (android.os.Build.VERSION.SDK_INT < android.os.Build.VERSION_CODES.Q) {
            if (ContextHolder.isAppOnBackground()) {
                return;
            }
        }
        ClipData clipdata = ClipData.newPlainText(null, text);
        ClipboardManager clipboard = getClipboardService();
        clipboard.setPrimaryClip(clipdata);
    }
}
