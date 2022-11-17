/* Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2022 THL A29 Limited, a Tencent company. All rights reserved.
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

package com.tencent.renderer;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.Application.ActivityLifecycleCallbacks;
import android.content.Context;
import android.os.Bundle;
import android.widget.FrameLayout;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.tencent.tdf.TDFEngine;
import com.tencent.tdf.TDFEngineConfig;
import com.tencent.tdf.view.TDFOutputView;

@SuppressLint("ViewConstructor")
public class TDFHippyRootView extends FrameLayout {

    private final Context mContext;
    private Activity mAttachActivity;
    private ActivityLifecycleCallbacks mActivityLifecycleCallbacks;
    private TDFRenderEngine mTDFEngine;
    private TDFOutputView mTDFView;

    public TDFHippyRootView(Context context) {
        super(context);
        mContext = context;
        mTDFEngine = setupTDFEngine();
        mTDFView = createTDFView(mTDFEngine);
        if (mContext instanceof Activity) {
            addActivityLifecycleObserver((Activity) mContext);
        }
    }

    public TDFRenderEngine getTDFEngine() {
        return mTDFEngine;
    }

    @Override protected void onAttachedToWindow() {
        super.onAttachedToWindow();
        if (mTDFEngine != null) {
            mTDFEngine.onResume();
        }
    }

    @Override protected void onDetachedFromWindow() {
        super.onDetachedFromWindow();
        destroy();
    }

    private TDFRenderEngine setupTDFEngine() {
        TDFEngineConfig tdfEngineConfig = new TDFEngineConfig();
        tdfEngineConfig.setViewMode(TDFEngineConfig.TDFViewMode.TextureView);
        return new TDFRenderEngine(mContext, tdfEngineConfig);
    }

    private TDFOutputView createTDFView(TDFEngine engine) {
        TDFOutputView tdfView = null;
        if (engine != null) {
            tdfView = engine.getTDFView();
            LayoutParams layoutParams = new LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT);
            addView(tdfView, layoutParams);
        }
        return tdfView;
    }

    private void destroy() {
        if (mTDFEngine != null) {
            mTDFEngine.onDestroy();
        }
        mTDFEngine = null;
        if (mAttachActivity != null) {
            mAttachActivity.getApplication()
                .unregisterActivityLifecycleCallbacks(mActivityLifecycleCallbacks);
        }
    }

    private void addActivityLifecycleObserver(Activity activity) {
        mAttachActivity = activity;
        mActivityLifecycleCallbacks = new ActivityLifecycleCallbacks() {
            @Override public void onActivityCreated(@NonNull Activity activity,
                @Nullable Bundle savedInstanceState) {

            }

            @Override public void onActivityStarted(@NonNull Activity activity) {
            }

            @Override public void onActivityResumed(@NonNull Activity activity) {
                if (activity == mAttachActivity && mTDFEngine != null) {
                    mTDFEngine.onResume();
                }
            }

            @Override public void onActivityPaused(@NonNull Activity activity) {
                if (activity == mAttachActivity && mTDFEngine != null) {
                    mTDFEngine.onPause();
                }
            }

            @Override public void onActivityStopped(@NonNull Activity activity) {
                if (activity == mAttachActivity && mTDFEngine != null) {
                    mTDFEngine.onStop();
                }
            }

            @Override public void onActivitySaveInstanceState(@NonNull Activity activity,
                @NonNull Bundle outState) {

            }

            @Override public void onActivityDestroyed(@NonNull Activity activity) {
                if (activity == mAttachActivity) {
                    destroy();
                }
            }
        };
        mAttachActivity.getApplication()
            .registerActivityLifecycleCallbacks(mActivityLifecycleCallbacks);
    }

}
