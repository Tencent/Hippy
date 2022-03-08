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

import static com.tencent.mtt.hippy.dom.node.NodeProps.BACKGROUND_RIPPLE;
import static com.tencent.mtt.hippy.uimanager.DrawableFactory.DrawableType.DRAWABLE_TYPE_RIPPLE;

import android.content.Context;
import android.graphics.drawable.Drawable;
import android.os.Build;
import android.util.Log;
import android.view.View;

import com.tencent.mtt.hippy.HippyInstanceContext;
import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.uimanager.DrawableFactory;
import com.tencent.mtt.hippy.uimanager.HippyGroupController;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.mtt.hippy.views.image.HippyImageView;

import java.util.WeakHashMap;

import androidx.annotation.RequiresApi;

@SuppressWarnings({"unused"})
@HippyController(name = HippyViewGroupController.CLASS_NAME)
public class HippyViewGroupController extends HippyGroupController<HippyViewGroup> {

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

    @HippyControllerProps(name = NodeProps.OVERFLOW, defaultType = HippyControllerProps.STRING, defaultString = "visible")
    public void setOverflow(HippyViewGroup hippyViewGroup, String overflow) {
        hippyViewGroup.setOverflow(overflow);
    }

    @HippyControllerProps(name = NodeProps.BACKGROUND_IMAGE, defaultType = HippyControllerProps.STRING)
    public void setBackgroundImage(HippyViewGroup hippyViewGroup, String url) {
        hippyViewGroup
                .setUrl(getInnerPath((HippyInstanceContext) hippyViewGroup.getContext(), url));
    }

    @HippyControllerProps(name = NodeProps.BACKGROUND_SIZE, defaultType = HippyControllerProps.STRING, defaultString = "origin")
    public void setBackgroundImageSize(HippyImageView hippyImageView, String resizeModeValue) {
        if ("contain".equals(resizeModeValue)) {
            // 在保持图片宽高比的前提下缩放图片，直到宽度和高度都小于等于容器视图的尺寸
            // 这样图片完全被包裹在容器中，容器中可能留有空白
            hippyImageView.setScaleType(HippyImageView.ScaleType.CENTER_INSIDE);
        } else if ("cover".equals(resizeModeValue)) {
            // 在保持图片宽高比的前提下缩放图片，直到宽度和高度都大于等于容器视图的尺寸
            // 这样图片完全覆盖甚至超出容器，容器中不留任何空白
            hippyImageView.setScaleType(HippyImageView.ScaleType.CENTER_CROP);
        } else if ("center".equals(resizeModeValue)) {
            // 居中不拉伸
            hippyImageView.setScaleType(HippyImageView.ScaleType.CENTER);
        } else if ("origin".equals(resizeModeValue)) {
            // 不拉伸，居左上
            hippyImageView.setScaleType(HippyImageView.ScaleType.ORIGIN);
        } else {
            // stretch and other mode
            // 拉伸图片且不维持宽高比，直到宽高都刚好填满容器
            hippyImageView.setScaleType(HippyImageView.ScaleType.FIT_XY);
        }
    }

    @HippyControllerProps(name = NodeProps.BACKGROUND_POSITION_X, defaultType = HippyControllerProps.NUMBER)
    public void setBackgroundImagePositionX(HippyViewGroup hippyViewGroup, int positionX) {
        hippyViewGroup.setImagePositionX((int) PixelUtil.dp2px(positionX));
    }

    @HippyControllerProps(name = NodeProps.BACKGROUND_POSITION_Y, defaultType = HippyControllerProps.NUMBER)
    public void setBackgroundImagePositionY(HippyViewGroup hippyViewGroup, int positionY) {
        hippyViewGroup.setImagePositionY((int) PixelUtil.dp2px(positionY));
    }

    @RequiresApi(api = Build.VERSION_CODES.M)
    @HippyControllerProps(name = BACKGROUND_RIPPLE, defaultType = HippyControllerProps.MAP)
    public void setNativeBackground(HippyViewGroup hippyViewGroup, HippyMap params) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP && params.size() > 0) {
            Drawable drawable = DrawableFactory.createDrawable(DRAWABLE_TYPE_RIPPLE, params);
            if (drawable != null) {
                hippyViewGroup.setRippleDrawable(drawable);
            }
        }
    }

    @Override
    public void dispatchFunction(HippyViewGroup viewGroup, String functionName, HippyArray params) {
        super.dispatchFunction(viewGroup, functionName, params);
        switch (functionName) {
            case FUNC_SET_PRESSED: {
                boolean pressed = params.getBoolean(0);
                viewGroup.setPressed(pressed);
                break;
            }
            case FUNC_SET_HOTSPOT: {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    double x = params.getDouble(0);
                    double y = params.getDouble(1);
                    viewGroup.drawableHotspotChanged(PixelUtil.dp2px(x), PixelUtil.dp2px(y));
                }
                break;
            }
            default:
                break;
        }
    }
}
