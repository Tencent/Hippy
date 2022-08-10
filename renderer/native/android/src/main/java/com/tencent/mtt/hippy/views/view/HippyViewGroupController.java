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

package com.tencent.mtt.hippy.views.view;

import android.content.Context;
import android.os.Build;
import android.view.View;

import androidx.annotation.NonNull;

import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.uimanager.HippyGroupController;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.utils.PixelUtil;

import com.tencent.renderer.utils.ArrayUtils;

import java.util.List;
import java.util.WeakHashMap;

@HippyController(name = HippyViewGroupController.CLASS_NAME, dispatchWithStandardType = true)
public class HippyViewGroupController extends HippyGroupController<HippyViewGroup> {

    private static final String TAG = "HippyViewGroupController";
    public static final String CLASS_NAME = "View";
    private static final String FUNC_SET_PRESSED = "setPressed";
    private static final String FUNC_SET_HOTSPOT = "setHotspot";
    private static final WeakHashMap<View, Integer> mZIndexHash = new WeakHashMap<>();

    public static void setViewZIndex(View view, int zIndex) {
        mZIndexHash.put(view, zIndex);
    }

    public static void removeViewZIndex(View view) {
        mZIndexHash.remove(view);
    }

    public static Integer getViewZIndex(View view) {
        return mZIndexHash.get(view);
    }

    @Override
    protected View createViewImpl(Context context) {
        return new HippyViewGroup(context);
    }

    @HippyControllerProps(name = NodeProps.OVERFLOW, defaultType = HippyControllerProps.STRING,
            defaultString = "visible")
    public void setOverflow(HippyViewGroup viewGroup, String overflow) {
        viewGroup.setOverflow(overflow);
    }

    @Override
    public void dispatchFunction(@NonNull HippyViewGroup viewGroup, @NonNull String functionName,
            @NonNull HippyArray params) {
        dispatchFunction(viewGroup, functionName, params.getInternalArray());
    }

    public void onBatchComplete(@NonNull HippyViewGroup viewGroup) {
        viewGroup.onBatchComplete();
    }

    @SuppressWarnings("rawtypes")
    @Override
    public void dispatchFunction(@NonNull HippyViewGroup viewGroup, @NonNull String functionName,
            @NonNull List params) {
        super.dispatchFunction(viewGroup, functionName, params);
        switch (functionName) {
            case FUNC_SET_PRESSED: {
                boolean pressed = ArrayUtils.getBooleanValue(params, 0);
                viewGroup.setPressed(pressed);
                break;
            }
            case FUNC_SET_HOTSPOT: {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    float x = ArrayUtils.getFloatValue(params, 0);
                    float y = ArrayUtils.getFloatValue(params, 1);
                    viewGroup.drawableHotspotChanged(PixelUtil.dp2px(x), PixelUtil.dp2px(y));
                }
                break;
            }
            default:
                LogUtils.w(TAG, "Unknown function name: " + functionName);
        }
    }
}
