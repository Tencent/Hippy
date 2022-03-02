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

package com.tencent.mtt.hippy.views.viewpager;

import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.uimanager.HippyViewController;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.utils.PixelUtil;

import android.content.Context;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import java.util.HashMap;
import java.util.List;
import java.util.Map;


@HippyController(name = HippyViewPagerController.CLASS_NAME)
public class HippyViewPagerController extends HippyViewController<HippyViewPager> {

    public static final String CLASS_NAME = "ViewPager";
    private static final String TAG = "HippyViewPagerController";
    private static final String FUNC_SET_PAGE = "setPage";
    private static final String FUNC_SET_PAGE_WITHOUT_ANIM = "setPageWithoutAnimation";
    private static final String FUNC_SET_INDEX = "setIndex";
    private static final String FUNC_NEXT_PAGE = "next";
    private static final String FUNC_PREV_PAGE = "prev";
    private static final String FUNC_PARAMS_INDEX = "index";
    private static final String FUNC_PARAMS_ANIMATED = "animated";

    @Override
    protected View createViewImpl(Context context) {
        return new HippyViewPager(context);
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
        return new HippyViewPager(context, isVertical);
    }

    @Override
    public View getChildAt(HippyViewPager hippyViewPager, int i) {
        return hippyViewPager.getViewFromAdapter(i);
    }

    @Override
    public int getChildCount(HippyViewPager hippyViewPager) {
        return hippyViewPager.getAdapter().getCount();
    }

    @Override
    protected void addView(ViewGroup parentView, View view, int index) {
        LogUtils.d(TAG, "addView: " + parentView.hashCode() + ", index=" + index);
        if (parentView instanceof HippyViewPager && view instanceof HippyViewPagerItem) {
            HippyViewPager hippyViewPager = (HippyViewPager) parentView;
            hippyViewPager.addViewToAdapter((HippyViewPagerItem) view, index);
        } else {
            LogUtils.e(TAG, "add view got invalid params");
        }
    }

    @Override
    protected void deleteChild(ViewGroup parentView, View childView) {
        LogUtils.d(TAG, "deleteChild: " + parentView.hashCode());
        if (parentView instanceof HippyViewPager && childView instanceof HippyViewPagerItem) {
            ((HippyViewPager) parentView).removeViewFromAdapter((HippyViewPagerItem) childView);
        } else {
            LogUtils.e(TAG, "delete view got invalid params");
        }
    }

    @Override
    public void onBatchComplete(@NonNull HippyViewPager viewPager) {
        viewPager.setChildCountAndUpdate(viewPager.getAdapter().getItemViewSize());
    }

    @HippyControllerProps(name = "initialPage", defaultNumber = 0, defaultType = HippyControllerProps.NUMBER)
    public void setInitialPage(HippyViewPager parent, int initialPage) {
        parent.setInitialPageIndex(initialPage);
    }

    @HippyControllerProps(name = "scrollEnabled", defaultBoolean = true, defaultType = HippyControllerProps.BOOLEAN)
    public void setScrollEnabled(HippyViewPager viewPager, boolean value) {
        viewPager.setScrollEnabled(value);
    }

    @HippyControllerProps(name = "pageMargin", defaultNumber = 0, defaultType = HippyControllerProps.NUMBER)
    public void setPageMargin(HippyViewPager pager, float margin) {
        pager.setPageMargin((int) PixelUtil.dp2px(margin));
    }

    @HippyControllerProps(name = NodeProps.OVERFLOW, defaultType = HippyControllerProps.STRING,
            defaultString = "visible")
    public void setOverflow(HippyViewPager pager, String overflow) {
        pager.setOverflow(overflow);
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
            @NonNull HippyViewPager viewPager, @Nullable Promise promise) {
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
    public void dispatchFunction(@NonNull HippyViewPager viewPager, @NonNull String functionName,
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
    public void dispatchFunction(@NonNull HippyViewPager viewPager, @NonNull String functionName,
            @NonNull List params, @Nullable Promise promise) {
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
