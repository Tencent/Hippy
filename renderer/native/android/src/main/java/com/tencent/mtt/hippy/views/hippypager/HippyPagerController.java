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

package com.tencent.mtt.hippy.views.hippypager;

import android.content.Context;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.uimanager.HippyViewController;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.mtt.hippy.views.view.HippyViewGroup;
import com.tencent.mtt.hippy.views.viewpager.HippyViewPagerItem;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@HippyController(name = HippyPagerController.CLASS_NAME, dispatchWithStandardType = true)
public class HippyPagerController extends HippyViewController<HippyPager> {

    public static final String CLASS_NAME = "ViewPager";
    private static final String TAG = "HippyPagerController";
    private static final String FUNC_SET_PAGE = "setPage";
    private static final String FUNC_SET_PAGE_WITHOUT_ANIM = "setPageWithoutAnimation";
    private static final String FUNC_SET_INDEX = "setIndex";
    private static final String FUNC_NEXT_PAGE = "next";
    private static final String FUNC_PREV_PAGE = "prev";
    private static final String FUNC_PARAMS_INDEX = "index";
    private static final String FUNC_PARAMS_ANIMATED = "animated";

    @Override
    protected View createViewImpl(Context context) {
        return new HippyPager(context);
    }

    @Override
    protected View createViewImpl(@NonNull Context context, @Nullable Map<String, Object> props) {
        boolean isVertical = false;
        if (props != null) {
            Object valueObj = props.get("direction");
            if ((valueObj instanceof String && valueObj.equals("vertical")) || props
                    .containsKey("vertical")) {
                isVertical = true;
            }
        }
        return new HippyPager(context, isVertical);
    }

    @Override
    public View getChildAt(HippyPager hippyViewPager, int i) {
        return hippyViewPager.getViewFromAdapter(i);
    }

    @Override
    public int getChildCount(HippyPager hippyViewPager) {
        return hippyViewPager.getAdapter().getCount();
    }

    @Override
    protected void addView(ViewGroup parentView, View view, int index) {
        LogUtils.d(TAG, "addView: " + parentView.hashCode() + ", index=" + index);
        if (parentView instanceof HippyPager && view instanceof HippyViewPagerItem) {
            HippyPager hippyViewPager = (HippyPager) parentView;
            hippyViewPager.addViewToAdapter((HippyViewPagerItem) view, index);
        } else {
            LogUtils.e(TAG, "add view got invalid params");
        }
    }

    @Override
    protected void deleteChild(ViewGroup parentView, View childView) {
        LogUtils.d(TAG, "deleteChild: " + parentView.hashCode());
        if (parentView instanceof HippyPager && childView instanceof HippyViewPagerItem) {
            ((HippyPager) parentView).removeViewFromAdapter((HippyViewPagerItem) childView);
        } else {
            LogUtils.e(TAG, "delete view got invalid params");
        }
    }

    @Override
    public void onBatchComplete(HippyPager viewPager) {
        viewPager.setChildCountAndUpdate(viewPager.getAdapter().getItemViewSize());
    }

    @HippyControllerProps(name = "initialPage", defaultNumber = 0, defaultType = HippyControllerProps.NUMBER)
    public void setInitialPage(HippyPager parent, int initialPage) {
        parent.setInitialPageIndex(initialPage);
    }

    @HippyControllerProps(name = "scrollEnabled", defaultBoolean = true, defaultType = HippyControllerProps.BOOLEAN)
    public void setScrollEnabled(HippyPager viewPager, boolean value) {
        viewPager.setScrollEnabled(value);
    }

    @HippyControllerProps(name = "pageMargin", defaultNumber = 0, defaultType = HippyControllerProps.NUMBER)
    public void setPageMargin(HippyPager pager, float margin) {
        pager.setPageMargin((int) PixelUtil.dp2px(margin));
    }

    @HippyControllerProps(name = NodeProps.OVERFLOW, defaultType = HippyControllerProps.STRING, defaultString = "visible")
    public void setOverflow(HippyPager pager, String overflow) {
        HippyViewGroup.setOverflow(overflow, pager);
    }

    private void resolveInvalidParams(@Nullable Promise promise) {
        if (promise != null) {
            String msg = "Invalid parameter!";
            Map<String, Object> result = new HashMap<>();
            result.put("msg", msg);
            promise.resolve(result);
        }
    }

    private void handleSetIndexFunction(@NonNull Map<String, Object> elementMap,
            @NonNull HippyPager viewPager, @Nullable Promise promise) {
        Object value = elementMap.get(FUNC_PARAMS_INDEX);
        if (!(value instanceof Number)) {
            resolveInvalidParams(promise);
            return;
        }
        boolean animated = false;
        final int index = ((Number) value).intValue();
        value = elementMap.get(FUNC_PARAMS_ANIMATED);
        if (value instanceof Boolean) {
            animated = (boolean) value;
        }
        viewPager.setCallBackPromise(promise);
        viewPager.switchToPage(index, animated);
    }

    @Override
    public void dispatchFunction(@NonNull HippyPager viewPager, @NonNull String functionName,
            @NonNull HippyArray params) {
        dispatchFunction(viewPager, functionName, params.getInternalArray());
    }

    @Override
    public void dispatchFunction(@NonNull HippyPager viewPager, @NonNull String functionName,
            @NonNull List params) {
        super.dispatchFunction(viewPager, functionName, params);
        int currentItem = viewPager.getCurrentItem();
        Object element = (params.isEmpty()) ? null : params.get(0);
        switch (functionName) {
            case FUNC_SET_PAGE:
                if (element instanceof Number) {
                    viewPager.switchToPage(((Number) element).intValue(), true);
                }
                break;
            case FUNC_SET_PAGE_WITHOUT_ANIM:
                if (element instanceof Number) {
                    viewPager.switchToPage(((Number) element).intValue(), false);
                }
                break;
            case FUNC_SET_INDEX:
                if (element instanceof Map) {
                    handleSetIndexFunction((Map) element, viewPager, null);
                }
                break;
            case FUNC_NEXT_PAGE:
                int total = viewPager.getAdapter().getCount();
                if (currentItem < total - 1) {
                    viewPager.switchToPage(currentItem + 1, true);
                }
                break;
            case FUNC_PREV_PAGE:
                if (currentItem > 0) {
                    viewPager.switchToPage(currentItem - 1, true);
                }
                break;
            default:
                LogUtils.e(TAG, "Unknown function name: " + functionName);
        }
    }

    @Override
    public void dispatchFunction(@NonNull HippyPager viewPager, @NonNull String functionName,
            @NonNull HippyArray params, @NonNull Promise promise) {
        dispatchFunction(viewPager, functionName, params.getInternalArray(), promise);
    }

    @Override
    public void dispatchFunction(@NonNull HippyPager viewPager, @NonNull String functionName,
            @NonNull List params, @NonNull Promise promise) {
        super.dispatchFunction(viewPager, functionName, params, promise);
        if (FUNC_SET_INDEX.equals(functionName)) {
            Object element = (params.isEmpty()) ? null : params.get(0);
            if (element instanceof Map) {
                handleSetIndexFunction((Map) element, viewPager, promise);
            } else {
                resolveInvalidParams(promise);
            }
        }
    }
}
