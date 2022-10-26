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

package com.tencent.mtt.hippy.views.scroll;

import static com.tencent.renderer.NativeRenderer.SCREEN_SNAPSHOT_ROOT_ID;

import android.content.Context;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.uimanager.HippyGroupController;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.mtt.hippy.views.hippypager.HippyPager;
import com.tencent.mtt.hippy.views.view.HippyViewGroup;
import com.tencent.renderer.NativeRenderContext;
import com.tencent.renderer.utils.ArrayUtils;

import java.util.List;
import java.util.Map;

@SuppressWarnings({"deprecation", "unused", "rawtypes"})
@HippyController(name = HippyScrollViewController.CLASS_NAME, dispatchWithStandardType = true)
public class HippyScrollViewController<T extends ViewGroup & HippyScrollView> extends
        HippyGroupController {

    private static final String TAG = "HippyScrollViewController";
    protected static final String SCROLL_TO = "scrollTo";
    private static final String SCROLL_TO_WITH_OPTIONS = "scrollToWithOptions";
    public static final String CLASS_NAME = "ScrollView";

    @Override
    protected View createViewImpl(@NonNull Context context, @Nullable Map props) {
        boolean isHorizontal = false;
        if (props != null) {
            if (props.get("horizontal") instanceof Boolean) {
                isHorizontal = (boolean) props.get("horizontal");
            }
        }
        View scrollView;
        if (isHorizontal) {
            scrollView = new HippyHorizontalScrollView(context);
        } else {
            scrollView = new HippyVerticalScrollView(context);
        }
        if (context instanceof NativeRenderContext) {
            int rootId = ((NativeRenderContext) context).getRootId();
            if (rootId == SCREEN_SNAPSHOT_ROOT_ID && scrollView instanceof HippyScrollView) {
                ((HippyScrollView) scrollView).setScrollEnabled(false);
            }
        }
        return scrollView;
    }

    @Override
    protected View createViewImpl(Context context) {
        return null;
    }

    @HippyControllerProps(name = "scrollEnabled", defaultType = HippyControllerProps.BOOLEAN, defaultBoolean = true)
    public void setScrollEnabled(HippyScrollView view, boolean flag) {
        view.setScrollEnabled(flag);
    }

    @HippyControllerProps(name = "showScrollIndicator", defaultType = HippyControllerProps.BOOLEAN)
    public void setShowScrollIndicator(HippyScrollView view, boolean flag) {
        view.showScrollIndicator(flag);
    }

    @HippyControllerProps(name = "flingEnabled", defaultType = HippyControllerProps.BOOLEAN, defaultBoolean = true)
    public void setFlingEnabled(HippyScrollView view, boolean flag) {
        view.setFlingEnabled(flag);
    }

    @HippyControllerProps(name = "contentOffset4Reuse")
    public void setContentOffset4Reuse(HippyScrollView view, HippyMap offsetMap) {
        view.setContentOffset4Reuse(offsetMap);
    }

    @HippyControllerProps(name = "pagingEnabled", defaultType = HippyControllerProps.BOOLEAN)
    public void setPagingEnabled(HippyScrollView view, boolean pagingEnabled) {
        view.setPagingEnabled(pagingEnabled);
    }

    @HippyControllerProps(name = "scrollEventThrottle", defaultType = HippyControllerProps.NUMBER, defaultNumber = 30.0D)
    public void setScrollEventThrottle(HippyScrollView view, int scrollEventThrottle) {
        view.setScrollEventThrottle(scrollEventThrottle);
    }

    @HippyControllerProps(name = "scrollMinOffset", defaultType = HippyControllerProps.NUMBER, defaultNumber = 5)
    public void setScrollMinOffset(HippyScrollView view, int scrollMinOffset) {
        view.setScrollMinOffset(scrollMinOffset);
    }

    @HippyControllerProps(name = "initialContentOffset", defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
    public void setInitialContentOffset(HippyScrollView view, int offset) {
        view.setInitialContentOffset((int) PixelUtil.dp2px(offset));
    }

    @HippyControllerProps(name = NodeProps.OVERFLOW, defaultType = HippyControllerProps.STRING, defaultString = "visible")
    public void setOverflow(HippyScrollView scrollView, String overflow) {
        if (scrollView instanceof ViewGroup) {
            HippyViewGroup.setOverflow(overflow, (ViewGroup) scrollView);
        }
    }

    @Override
    public void onBatchComplete(@NonNull View view) {
        super.onBatchComplete(view);

        if (view instanceof HippyScrollView) {
            ((HippyScrollView) view).scrollToInitContentOffset();
        }
    }

    private void handleScrollTo(@NonNull View view, @NonNull List<?> params) {
        double dx = ArrayUtils.getDoubleValue(params, 0);
        double dy = ArrayUtils.getDoubleValue(params, 1);
        int destX = Math.round(PixelUtil.dp2px(dx));
        int destY = Math.round(PixelUtil.dp2px(dy));
        boolean animated = ArrayUtils.getBooleanValue(params, 2);
        if (animated) {
            ((HippyScrollView) view).callSmoothScrollTo(destX, destY, 0);
        } else {
            view.scrollTo(destX, destY);
        }
    }

    private void handleScrollToWithOptions(@NonNull View view, @NonNull List<?> params) {
        if (params.isEmpty()) {
            return;
        }
        Object element = params.get(0);
        if (!(element instanceof Map)) {
            return;
        }
        Map<String, Object> valueMap = (Map) element;
        int destX = 0;
        int destY = 0;
        int duration = 0;
        Object value = valueMap.get("x");
        if (value instanceof Number) {
            destX = Math.round(PixelUtil.dp2px(((Number) value).intValue()));
        }
        value = valueMap.get("y");
        if (value instanceof Number) {
            destY = Math.round(PixelUtil.dp2px(((Number) value).intValue()));
        }
        value = valueMap.get("duration");
        if (value instanceof Number) {
            duration = ((Number) value).intValue();
        }
        if (duration > 0) {
            ((HippyScrollView) view).callSmoothScrollTo(destX, destY, duration);
        } else {
            view.scrollTo(destX, destY);
        }
    }

    @Override
    public void dispatchFunction(@NonNull View view, @NonNull String functionName,
            @NonNull HippyArray params) {
        dispatchFunction(view, functionName, params.getInternalArray());
    }

    @Override
    public void dispatchFunction(@NonNull View view, @NonNull String functionName,
            @NonNull List params) {
        super.dispatchFunction(view, functionName, params);
        if (!(view instanceof HippyScrollView)) {
            return;
        }
        switch (functionName) {
            case SCROLL_TO:
                handleScrollTo(view, params);
                break;
            case SCROLL_TO_WITH_OPTIONS:
                handleScrollToWithOptions(view, params);
                break;
            default:
                LogUtils.e(TAG, "Unknown function name: " + functionName);
        }
    }
}
