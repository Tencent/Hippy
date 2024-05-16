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

package com.tencent.mtt.hippy.views.modal;

import static android.content.res.Configuration.ORIENTATION_LANDSCAPE;
import static android.content.res.Configuration.ORIENTATION_PORTRAIT;
import static android.content.res.Configuration.ORIENTATION_UNDEFINED;
import static com.tencent.renderer.utils.EventUtils.EVENT_ORIENTATION_CHANGED;

import android.app.Dialog;
import android.content.ComponentCallbacks;
import android.content.Context;
import android.content.res.Configuration;
import android.os.Bundle;
import android.view.View;
import androidx.annotation.NonNull;
import com.tencent.renderer.utils.EventUtils;
import java.lang.ref.WeakReference;
import java.util.HashMap;

public class HippyModalDialogView extends Dialog {
    private int mOrientation = ORIENTATION_UNDEFINED;
    private final ConfigurationChangedListener mListener = new ConfigurationChangedListener();;
    private final WeakReference<View> mHostView;

    public HippyModalDialogView(@NonNull Context context, int themeResId, @NonNull View hostView) {
        super(context, themeResId);
        mHostView = new WeakReference<>(hostView);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Configuration configuration = getContext().getResources().getConfiguration();
        mOrientation = configuration.orientation;
    }

    @Override
    protected void onStart() {
        super.onStart();
        getContext().registerComponentCallbacks(mListener);
    }

    @Override
    protected void onStop() {
        super.onStop();
        getContext().unregisterComponentCallbacks(mListener);
    }

    protected void sendOrientationChangeEvent(int orientation) {
        final View hostView = mHostView.get();
        if (hostView != null) {
            String value;
            switch (orientation) {
                case ORIENTATION_PORTRAIT:
                    value = "portrait";
                    break;
                case ORIENTATION_LANDSCAPE:
                    value = "landscape";
                    break;
                default:
                    value = "";
            }
            HashMap<String, Object> params = new HashMap<>();
            params.put("orientation", value);
            EventUtils.sendComponentEvent(hostView, EVENT_ORIENTATION_CHANGED, params);
        }
    }

    private class ConfigurationChangedListener implements ComponentCallbacks {
        @Override
        public void onConfigurationChanged(Configuration newConfig) {
            if (newConfig.orientation != mOrientation) {
                sendOrientationChangeEvent(newConfig.orientation);
                mOrientation = newConfig.orientation;
            }
        }

        @Override
        public void onLowMemory() {
            // Handle low memory event
        }
    }
}
