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
package com.tencent.renderer.component.text;


import static com.tencent.mtt.hippy.dom.node.NodeProps.IMAGE_SPAN_TEXT;

import android.graphics.Bitmap;
import android.graphics.Color;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.ColorDrawable;
import android.graphics.drawable.Drawable;
import android.text.SpannableStringBuilder;
import android.text.TextUtils;
import android.text.style.ImageSpan;
import androidx.annotation.Nullable;
import com.tencent.mtt.hippy.adapter.image.HippyDrawable;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.dom.node.HippyImageSpan;
import com.tencent.mtt.hippy.dom.node.HippyNativeGestureSpan;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.mtt.hippy.views.image.HippyImageView;
import com.tencent.mtt.hippy.views.image.HippyImageView.ImageEvent;
import com.tencent.mtt.supportui.adapters.image.IDrawableTarget;
import com.tencent.mtt.supportui.adapters.image.IImageLoaderAdapter;
import java.util.ArrayList;
import java.util.List;

public class ImageVirtualNode extends VirtualNode {

    public static final String PROP_VERTICAL_ALIGNMENT = "verticalAlignment";
    private float width = 0.0f;
    private float height = 0.0f;
    private @Nullable
    HippyImageSpan imageSpan;
    private @Nullable
    String url;
    private @Nullable
    String defaultSource;
    private int verticalAlignment = ImageSpan.ALIGN_BASELINE;
    private final boolean[] shouldSendImageEvent;
    private @Nullable
    ArrayList<String> gestureTypes;
    protected final IImageLoaderAdapter imageAdapter;

    public ImageVirtualNode(int id, int pid, int index, IImageLoaderAdapter adapter) {
        super(id, pid, index);
        imageAdapter = adapter;
        shouldSendImageEvent = new boolean[ImageEvent.values().length];
    }

    @HippyControllerProps(name = NodeProps.WIDTH, defaultType = HippyControllerProps.NUMBER)
    public void setWidth(float width) {
        this.width = PixelUtil.dp2px(width);
    }

    @HippyControllerProps(name = NodeProps.HEIGHT, defaultType = HippyControllerProps.NUMBER)
    public void setHeight(float height) {
        this.height = PixelUtil.dp2px(height);
    }

    @Override
    protected void createSpanOperation(List<SpanOperation> ops,
            SpannableStringBuilder builder, boolean useChild) {
        Drawable drawable = null;
        if (!TextUtils.isEmpty(defaultSource) && imageAdapter != null) {
            IDrawableTarget hippyDrawable = imageAdapter.getImage(defaultSource, null);
            Bitmap bitmap = hippyDrawable.getBitmap();
            if (bitmap != null) {
                drawable = new BitmapDrawable(bitmap);
            }
        }
        if (drawable == null) {
            drawable = new ColorDrawable(Color.parseColor("#00000000"));
        }
        drawable.setBounds(0, 0, Math.round(width), Math.round(height));
//        imageSpan = new HippyImageSpan(drawable, url, this, imageAdapter,
//                engineContext);
        int start = builder.length();
        builder.append(IMAGE_SPAN_TEXT);
        int end = start + IMAGE_SPAN_TEXT.length();
        ops.add(new SpanOperation(start, end, imageSpan));
    }

    public void setImageSpan(HippyImageSpan imageSpan) {
        imageSpan = imageSpan;
    }

    public boolean isEnableImageEvent(ImageEvent event) {
        return shouldSendImageEvent[event.ordinal()];
    }

    public int getVerticalAlignment() {
        return verticalAlignment;
    }

    public ArrayList<String> getGestureTypes() {
        return gestureTypes;
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = PROP_VERTICAL_ALIGNMENT, defaultType = HippyControllerProps.NUMBER, defaultNumber = ImageSpan.ALIGN_BASELINE)
    public void setVerticalAlignment(int alignment) {
        verticalAlignment = alignment;
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = "defaultSource", defaultType = HippyControllerProps.STRING)
    public void setDefaultSource(String defaultSource) {
        this.defaultSource = defaultSource;
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = "src", defaultType = HippyControllerProps.STRING)
    public void setUrl(String src) {
        url = src;
        if (imageSpan != null) {
            imageSpan.setUrl(url);
        }
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = "onLoad", defaultType = HippyControllerProps.BOOLEAN)
    public void setOnLoadEnd(boolean enable) {
        shouldSendImageEvent[ImageEvent.ONLOAD.ordinal()] = enable;
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = "onError", defaultType = HippyControllerProps.BOOLEAN)
    public void setOnError(boolean enable) {
        shouldSendImageEvent[ImageEvent.ONERROR.ordinal()] = enable;
    }
}
