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

package com.tencent.renderer.node;

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
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.utils.ContextHolder;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.renderer.NativeRender;
import com.tencent.renderer.component.image.ImageDataSupplier;
import com.tencent.renderer.component.image.ImageLoaderAdapter;
import com.tencent.renderer.component.text.TextGestureSpan;
import com.tencent.renderer.component.text.TextImageSpan;
import java.util.List;

public class ImageVirtualNode extends VirtualNode {

    protected int mWidth;
    protected int mHeight;
    @Deprecated
    protected int mLeft;
    @Deprecated
    protected int mTop;
    @Deprecated
    protected int mVerticalAlignment = ImageSpan.ALIGN_BASELINE;
    protected float mMargin = Float.NaN;
    protected float mMarginVertical = Float.NaN;
    protected float mMarginHorizontal = Float.NaN;
    protected float mMarginLeft = Float.NaN;
    protected float mMarginTop = Float.NaN;
    protected float mMarginRight = Float.NaN;
    protected float mMarginBottom = Float.NaN;
    protected int mTintColor = Color.TRANSPARENT;
    protected int mBackgroundColor = Color.TRANSPARENT;
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

    public int getWidth() {
        return mWidth;
    }

    public int getHeight() {
        return mHeight;
    }

    @Deprecated
    public int getLeft() {
        return mLeft;
    }

    @Deprecated
    public int getTop() {
        return mTop;
    }

    /**
     * @deprecated use {@link #getVerticalAlign} instead
     */
    @Deprecated
    public int getVerticalAlignment() {
        return mVerticalAlignment;
    }

    public int getMarginLeft() {
        return getValue(mMarginLeft, mMarginHorizontal, mMargin);
    }

    public int getMarginTop() {
        return getValue(mMarginTop, mMarginVertical, mMargin);
    }

    public int getMarginRight() {
        return getValue(mMarginRight, mMarginHorizontal, mMargin);
    }

    public int getMarginBottom() {
        return getValue(mMarginBottom, mMarginVertical, mMargin);
    }

    private int getValue(float primary, float secondary, float tertiary) {
        if (!Float.isNaN(primary)) {
            return Math.round(primary);
        }
        if (!Float.isNaN(secondary)) {
            return Math.round(secondary);
        }
        if (!Float.isNaN(tertiary)) {
            return Math.round(tertiary);
        }
        return 0;
    }

    @NonNull
    protected TextImageSpan createImageSpan() {
        Drawable drawable = null;
        ImageLoaderAdapter imageLoader = mNativeRenderer.getImageLoader();
        if (mDefaultSource != null && imageLoader != null) {
            ImageDataSupplier supplier = imageLoader.fetchImageSync(mDefaultSource, null, mWidth,
                    mHeight);
            if (supplier != null) {
                Bitmap bitmap = supplier.getBitmap();
                if (bitmap != null) {
                    Resources resources = ContextHolder.getAppContext().getResources();
                    drawable = new BitmapDrawable(resources, bitmap);
                }
            }
        }
        if (drawable == null) {
            drawable = new ColorDrawable(Color.TRANSPARENT);
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
        if (mEventTypes != null && mEventTypes.size() > 0) {
            TextGestureSpan span = new TextGestureSpan(mId);
            span.addGestureTypes(mEventTypes);
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

    @Deprecated
    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.LEFT, defaultType = HippyControllerProps.NUMBER)
    public void setLeft(float left) {
        float lpx = PixelUtil.dp2px(left);
        mLeft = (Float.isNaN(lpx)) ? 0 : Math.round(lpx);
        markDirty();
    }

    @Deprecated
    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.TOP, defaultType = HippyControllerProps.NUMBER)
    public void setTop(float top) {
        float tpx = PixelUtil.dp2px(top);
        mTop = (Float.isNaN(tpx)) ? 0 : Math.round(tpx);
        markDirty();
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.MARGIN, defaultType = HippyControllerProps.NUMBER, defaultNumber = Float.NaN)
    public void setMargin(float value) {
        mMargin = Float.isNaN(value) ? Float.NaN : PixelUtil.dp2px(value);
        markDirty();
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.MARGIN_VERTICAL, defaultType = HippyControllerProps.NUMBER, defaultNumber
            = Float.NaN)
    public void setMarginVertical(float value) {
        mMarginVertical = Float.isNaN(value) ? Float.NaN : PixelUtil.dp2px(value);
        markDirty();
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.MARGIN_HORIZONTAL, defaultType = HippyControllerProps.NUMBER,
            defaultNumber = Float.NaN)
    public void setMarginHorizontal(float value) {
        mMarginHorizontal = Float.isNaN(value) ? Float.NaN : PixelUtil.dp2px(value);
        markDirty();
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.MARGIN_LEFT, defaultType = HippyControllerProps.NUMBER, defaultNumber =
            Float.NaN)
    public void setMarginLeft(float value) {
        mMarginLeft = Float.isNaN(value) ? Float.NaN : PixelUtil.dp2px(value);
        markDirty();
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.MARGIN_TOP, defaultType = HippyControllerProps.NUMBER, defaultNumber =
            Float.NaN)
    public void setMarginTop(float value) {
        mMarginTop = Float.isNaN(value) ? Float.NaN : PixelUtil.dp2px(value);
        markDirty();
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.MARGIN_RIGHT, defaultType = HippyControllerProps.NUMBER, defaultNumber =
            Float.NaN)
    public void setMarginRight(float value) {
        mMarginRight = Float.isNaN(value) ? Float.NaN : PixelUtil.dp2px(value);
        markDirty();
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.MARGIN_BOTTOM, defaultType = HippyControllerProps.NUMBER, defaultNumber =
            Float.NaN)
    public void setMarginBottom(float value) {
        mMarginBottom = Float.isNaN(value) ? Float.NaN : PixelUtil.dp2px(value);
        markDirty();
    }

    /**
     * @deprecated use {@link #setVerticalAlign} instead
     */
    @Deprecated
    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.PROP_VERTICAL_ALIGNMENT, defaultType = HippyControllerProps.NUMBER,
            defaultNumber = ImageSpan.ALIGN_BASELINE)
    public void setVerticalAlignment(int alignment) {
        if (alignment != mVerticalAlignment) {
            mVerticalAlignment = alignment;
            markDirty();
        }
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.VERTICAL_ALIGN, defaultType = HippyControllerProps.STRING)
    public void setVerticalAlign(String align) {
        super.setVerticalAlign(align);
    }

    @HippyControllerProps(name = NodeProps.OPACITY, defaultType = HippyControllerProps.NUMBER, defaultNumber = 1f)
    public void setOpacity(float opacity) {
        super.setOpacity(opacity);
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

    @HippyControllerProps(name = "tintColor", defaultType = HippyControllerProps.NUMBER)
    public void setTintColor(int tintColor) {
        mTintColor = tintColor;
        if (mImageSpan != null) {
            mImageSpan.setTintColor(tintColor);
        }
    }

    public int getTintColor() {
        return mTintColor;
    }

    @HippyControllerProps(name = NodeProps.BACKGROUND_COLOR, defaultType = HippyControllerProps.NUMBER)
    public void setBackgroundColor(int color) {
        mBackgroundColor = color;
        if (mImageSpan != null) {
            mImageSpan.setBackgroundColor(color);
        }
    }

    public int getBackgroundColor() {
        return mBackgroundColor;
    }
}
