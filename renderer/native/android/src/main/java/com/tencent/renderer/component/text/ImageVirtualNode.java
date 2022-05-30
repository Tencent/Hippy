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

import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.ColorDrawable;
import android.graphics.drawable.Drawable;
import android.text.SpannableStringBuilder;
import android.text.style.ImageSpan;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.tencent.link_supplier.proxy.framework.ImageDataSupplier;
import com.tencent.link_supplier.proxy.framework.ImageLoaderAdapter;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.utils.ContextHolder;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.renderer.NativeRender;

import java.util.List;

public class ImageVirtualNode extends VirtualNode {

    public static final String PROP_VERTICAL_ALIGNMENT = "verticalAlignment";
    protected int mWidth;
    protected int mHeight;
    protected int mLeft;
    protected int mTop;
    protected int mVerticalAlignment = ImageSpan.ALIGN_BASELINE;
    @Nullable
    protected TextImageSpan mImageSpan;
    @Nullable
    protected String mUrl;
    @Nullable
    protected String mDefaultSource;
    @NonNull
    private final NativeRender mNativeRenderer;

    public ImageVirtualNode(int rootId, int id, int pid, int index,
            @NonNull NativeRender nativeRender) {
        super(rootId, id, pid, index);
        mNativeRenderer = nativeRender;
    }

    @NonNull
    protected TextImageSpan createImageSpan() {
        Drawable drawable = null;
        ImageLoaderAdapter adapter = mNativeRenderer.getImageLoaderAdapter();
        if (mDefaultSource != null && adapter != null) {
            ImageDataSupplier supplier = adapter.getLocalImage(mDefaultSource);
            Bitmap bitmap = supplier.getBitmap();
            if (bitmap != null) {
                Resources resources = ContextHolder.getAppContext().getResources();
                drawable = new BitmapDrawable(resources, bitmap);
            }
        }
        if (drawable == null) {
            drawable = new ColorDrawable(Color.WHITE);
        }
        drawable.setBounds(0, 0, mWidth, mHeight);
        return new TextImageSpan(drawable, mUrl, this, mNativeRenderer);
    }

    @Override
    protected void createSpanOperation(List<SpanOperation> ops,
            SpannableStringBuilder builder, boolean useChild) {
        mImageSpan = createImageSpan();
        int start = builder.length();
        builder.append(IMAGE_SPAN_TEXT);
        int end = start + IMAGE_SPAN_TEXT.length();
        ops.add(new SpanOperation(start, end, mImageSpan));
        if (mGestureTypes != null && mGestureTypes.size() > 0) {
            TextGestureSpan span = new TextGestureSpan(mId);
            span.addGestureTypes(mGestureTypes);
            ops.add(new SpanOperation(start, end, span));
        }
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.WIDTH, defaultType = HippyControllerProps.NUMBER)
    public void setWidth(float width) {
        mWidth = Math.round(PixelUtil.dp2px(width));
        markDirty();
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.HEIGHT, defaultType = HippyControllerProps.NUMBER)
    public void setHeight(float height) {
        mHeight = Math.round(PixelUtil.dp2px(height));
        markDirty();
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.LEFT, defaultType = HippyControllerProps.NUMBER)
    public void setLeft(float left) {
        float lpx = PixelUtil.dp2px(left);
        mLeft = (Float.isNaN(lpx)) ? 0 : Math.round(lpx);
        markDirty();
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.TOP, defaultType = HippyControllerProps.NUMBER)
    public void setTop(float top) {
        float tpx = PixelUtil.dp2px(top);
        mTop = (Float.isNaN(tpx)) ? 0 : Math.round(tpx);
        markDirty();
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = PROP_VERTICAL_ALIGNMENT, defaultType = HippyControllerProps.NUMBER,
            defaultNumber = ImageSpan.ALIGN_BASELINE)
    public void setVerticalAlignment(int alignment) {
        if (alignment != mVerticalAlignment) {
            mVerticalAlignment = alignment;
            if (mImageSpan != null) {
                mImageSpan.setVerticalAlignment(alignment);
            }
        }
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = "defaultSource", defaultType = HippyControllerProps.STRING)
    public void setDefaultSource(String defaultSource) {
        mDefaultSource = defaultSource;
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = "src", defaultType = HippyControllerProps.STRING)
    public void setUrl(String src) {
        if (mUrl == null || !mUrl.equals(src)) {
            mUrl = src;
            if (mImageSpan != null) {
                mImageSpan.setUrl(src);
            }
        }
    }
}
