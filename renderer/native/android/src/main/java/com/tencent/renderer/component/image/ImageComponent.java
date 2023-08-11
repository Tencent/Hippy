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

package com.tencent.renderer.component.image;

import static com.tencent.renderer.utils.EventUtils.EVENT_IMAGE_LOAD_END;
import static com.tencent.renderer.utils.EventUtils.EVENT_IMAGE_LOAD_ERROR;
import static com.tencent.renderer.utils.EventUtils.EVENT_IMAGE_LOAD_PROGRESS;
import static com.tencent.renderer.utils.EventUtils.EVENT_IMAGE_LOAD_START;
import static com.tencent.renderer.utils.EventUtils.EVENT_IMAGE_ON_LOAD;

import android.graphics.drawable.Drawable;
import android.text.TextUtils;

import androidx.annotation.ColorInt;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.Px;

import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.renderer.node.RenderNode;
import com.tencent.renderer.component.Component;
import com.tencent.renderer.component.drawable.ContentDrawable.ScaleType;

import com.tencent.renderer.utils.EventUtils;

import com.tencent.vfs.UrlUtils;
import java.io.File;
import java.util.HashMap;
import java.util.Map;

public class ImageComponent extends Component {

    private static final String TAG = "ImageComponent";
    @Nullable
    private String mUri;
    @Nullable
    private String mDefaultUri;
    @Nullable
    private ImageLoaderAdapter mImageLoader;
    @Nullable
    private String mBundlePath;
    @Nullable
    private ImageDataSupplier mImageHolder;
    @Nullable
    private ImageDataSupplier mDefaultImageHolder;
    private ImageFetchState mImageFetchState = ImageFetchState.UNLOAD;
    private ImageFetchState mDefaultImageFetchState = ImageFetchState.UNLOAD;

    public enum ImageFetchState {
        UNLOAD,
        LOADING,
        LOADED
    }

    public enum ImageSourceType {
        SRC,
        DEFAULT
    }

    public ImageComponent(@NonNull RenderNode node) {
        super(node);
        init(node, null);
    }

    public ImageComponent(@NonNull RenderNode node, @NonNull Component component) {
        super(node);
        init(node, component);
    }

    private void init(@NonNull RenderNode node, @Nullable Component component) {
        mImageLoader = node.getNativeRender().getImageLoader();
        mBundlePath = node.getNativeRender().getBundlePath();
        if (component != null) {
            mBackgroundDrawable = component.getBackgroundDrawable();
            mContentDrawable = component.getContentDrawable();
            mRippleDrawable = component.getRippleDrawable();
            mTextDrawable = component.getTextDrawable();
        }
    }

    private void fetchImageIfNeeded() {
        if ((mDefaultImageHolder == null || !mDefaultImageHolder.checkImageData())
                && mDefaultImageFetchState != ImageFetchState.LOADING) {
            fetchImageWithUrl(mDefaultUri, ImageSourceType.DEFAULT);
        }
        if ((mImageHolder == null || !mImageHolder.checkImageData())
                && mImageFetchState != ImageFetchState.LOADING) {
            fetchImageWithUrl(mUri, ImageSourceType.SRC);
        }
    }

    @Override
    public void onHostViewAttachedToWindow() {
        super.onHostViewAttachedToWindow();
        fetchImageIfNeeded();
    }

    @Override
    public void onHostViewRemoved() {
        LogUtils.d(TAG, "onHostViewRemoved host id " + getHostId());
        super.onHostViewRemoved();
        clear();
        mImageFetchState = ImageFetchState.UNLOAD;
        mDefaultImageFetchState = ImageFetchState.UNLOAD;
    }

    @Override
    public void clear() {
        super.clear();
        if (mImageHolder != null) {
            mImageHolder.detached();
            mImageHolder = null;
        }
        if (mDefaultImageHolder != null) {
            mDefaultImageHolder.detached();
            mDefaultImageHolder = null;
        }
    }

    public void setSrc(String uri) {
        uri = convertToLocalPathIfNeeded(uri);
        if (!TextUtils.equals(mUri, uri)) {
            mUri = uri;
            mImageFetchState = ImageFetchState.UNLOAD;
            if (mImageHolder != null) {
                mImageHolder.detached();
                mImageHolder = null;
                if (mDefaultImageHolder != null && mDefaultImageHolder.checkImageData()) {
                    setImageData(mDefaultImageHolder);
                } else {
                    clearImageData();
                }
            }
            fetchImageWithUrl(mUri, ImageSourceType.SRC);
        }
    }

    public void setDefaultSource(String uri) {
        uri = convertToLocalPathIfNeeded(uri);
        if (!TextUtils.equals(mDefaultUri, uri)) {
            mDefaultUri = uri;
            mDefaultImageFetchState = ImageFetchState.UNLOAD;
            if (mDefaultImageHolder != null) {
                mDefaultImageHolder.detached();
                mDefaultImageHolder = null;
                if (mImageHolder == null || !mImageHolder.checkImageData()) {
                    clearImageData();
                }
            }
            fetchImageWithUrl(uri, ImageSourceType.DEFAULT);
        }
    }

    public void setScaleType(ScaleType scaleType) {
        ensureContentDrawable().setScaleType(scaleType);
    }

    public void setImagePositionX(@Px int positionX) {
        ensureContentDrawable().setImagePositionX(positionX);
    }

    public void setImagePositionY(@Px int positionY) {
        ensureContentDrawable().setImagePositionY(positionY);
    }

    public void setTintColor(@ColorInt int tintColor) {
        ensureContentDrawable().setTintColor(tintColor);
    }

    public void setTintColorBlendMode(int tintColorBlendMode) {
        ensureContentDrawable().setTintColorBlendMode(tintColorBlendMode);
    }

    protected void onFetchImageStart() {
        if (mHostRef.get() != null) {
            // send onLoadStart event
            EventUtils.sendComponentEvent(mHostRef.get(), EVENT_IMAGE_LOAD_START, null);
        }
    }

    private void setImageData(@NonNull ImageDataSupplier imageHolder) {
        Drawable drawable = imageHolder.getDrawable();
        if (drawable != null) {
            drawable.setCallback(this);
        }
        ensureContentDrawable().setImageData(imageHolder);
    }

    private void clearImageData() {
        if (mContentDrawable != null) {
            mContentDrawable.clear();
        }
    }

    private void onFetchImageSuccess(@NonNull String uri, ImageSourceType sourceType,
            @NonNull ImageDataSupplier imageHolder, boolean loadFromCache) {
        if (sourceType == ImageSourceType.SRC) {
            LogUtils.d(TAG, "onFetchImageSuccess: host id " + getHostId() + ", uri " + uri);
            if (!uri.equals(mUri)) {
                imageHolder.detached();
                return;
            }
            mImageHolder = imageHolder;
            mImageFetchState = ImageFetchState.LOADED;
            setImageData(imageHolder);
            if (mHostRef.get() != null && !loadFromCache) {
                // send onLoad event
                EventUtils.sendComponentEvent(mHostRef.get(), EVENT_IMAGE_ON_LOAD, null);
                HashMap<String, Object> params = new HashMap<>();
                params.put("success", 1);
                HashMap<String, Object> imageSize = new HashMap<>();
                imageSize.put("width", imageHolder.getImageWidth());
                imageSize.put("height", imageHolder.getImageHeight());
                params.put("image", imageSize);
                // send onLoadEnd event
                EventUtils.sendComponentEvent(mHostRef.get(), EVENT_IMAGE_LOAD_END, params);
            }
        } else if (sourceType == ImageSourceType.DEFAULT) {
            if (!uri.equals(mDefaultUri)) {
                imageHolder.detached();
                return;
            }
            mDefaultImageHolder = imageHolder;
            mDefaultImageFetchState = ImageFetchState.LOADED;
            if (mImageHolder == null || !mImageHolder.checkImageData()) {
                setImageData(imageHolder);
            }
        }
        imageHolder.attached();
        if (mImageLoader != null) {
            mImageLoader.saveImageToCache(imageHolder);
        }
        postInvalidateDelayed(0);
    }

    private void onFetchImageFail() {
        mImageFetchState = ImageFetchState.UNLOAD;
        if (mHostRef.get() == null) {
            return;
        }
        // send onError event
        EventUtils.sendComponentEvent(mHostRef.get(), EVENT_IMAGE_LOAD_ERROR, null);
        HashMap<String, Object> params = new HashMap<>();
        params.put("success", 0);
        // send onLoadEnd event
        EventUtils.sendComponentEvent(mHostRef.get(), EVENT_IMAGE_LOAD_END, params);
    }

    protected void onFetchImageProgress(float total, float loaded) {
        if (mHostRef.get() == null) {
            return;
        }
        HashMap<String, Object> params = new HashMap<>();
        params.put("loaded", loaded);
        params.put("total", total);
        EventUtils.sendComponentEvent(mHostRef.get(), EVENT_IMAGE_LOAD_PROGRESS, params);
    }

    private void doFetchImage(final String uri, final ImageSourceType sourceType) {
        int width = (mHostRef.get() != null) ? mHostRef.get().getWidth() : 0;
        int height = (mHostRef.get() != null) ? mHostRef.get().getHeight() : 0;
        Map<String, Object> params = new HashMap<>();
        if (mHostRef.get() != null) {
            params.put("props", mHostRef.get().getProps());
        }
        assert mImageLoader != null;
        mImageLoader.fetchImageAsync(uri, new ImageRequestListener() {
            @Override
            public void onRequestStart(ImageDataSupplier imageData) {
            }

            @Override
            public void onRequestProgress(long total, long loaded) {
                if (sourceType == ImageSourceType.SRC) {
                    onFetchImageProgress(total, loaded);
                }
            }

            @Override
            public void onRequestSuccess(ImageDataSupplier imageData) {
                onFetchImageSuccess(uri, sourceType, imageData, false);
            }

            @Override
            public void onRequestFail(Throwable throwable) {
                if (sourceType == ImageSourceType.SRC) {
                    onFetchImageFail();
                } else {
                    mDefaultImageFetchState = ImageFetchState.UNLOAD;
                }
            }
        }, params, width, height);
    }

    private void fetchImageWithUrl(String uri, ImageSourceType sourceType) {
        if (TextUtils.isEmpty(uri) || mImageLoader == null) {
            return;
        }
        LogUtils.d(TAG, "fetchImageWithUrl: host id " + getHostId() + ", uri " + uri);
        ImageDataSupplier imageData = mImageLoader.getImageFromCache(uri);
        if (imageData != null && imageData.checkImageData()) {
            onFetchImageSuccess(uri, sourceType, imageData, true);
            return;
        }
        if (sourceType == ImageSourceType.SRC) {
            mImageFetchState = ImageFetchState.LOADING;
            onFetchImageStart();
        } else {
            mDefaultImageFetchState = ImageFetchState.LOADING;
        }
        if (UrlUtils.isWebUrl(uri)) {
            uri = uri.trim().replaceAll(" ", "%20");
        }
        doFetchImage(uri, sourceType);
    }

    private String convertToLocalPathIfNeeded(String uri) {
        //hpfile://./assets/file_banner02.jpg
        if (uri != null && uri.startsWith("hpfile://")) {
            String relativePath = uri.replace("hpfile://./", "");
            uri = mBundlePath == null ? null
                    : mBundlePath.subSequence(0, mBundlePath.lastIndexOf(File.separator) + 1)
                            + relativePath;
        }
        return uri;
    }
}
