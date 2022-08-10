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

import android.text.TextUtils;

import androidx.annotation.ColorInt;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.Px;

import com.tencent.link_supplier.proxy.framework.ImageDataSupplier;
import com.tencent.link_supplier.proxy.framework.ImageLoaderAdapter;
import com.tencent.link_supplier.proxy.framework.ImageRequestListener;
import com.tencent.mtt.hippy.uimanager.RenderNode;
import com.tencent.renderer.component.Component;
import com.tencent.renderer.component.drawable.ContentDrawable.ScaleType;

import com.tencent.renderer.utils.EventUtils;
import com.tencent.renderer.utils.UrlUtils;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

public class ImageComponent extends Component {

    @Nullable
    private String mUri;
    @Nullable
    private String mDefaultUri;
    @Nullable
    private ImageLoaderAdapter mImageLoaderAdapter;
    @Nullable
    private String mBundlePath;
    @Nullable
    private ImageDataSupplier mImageData;
    @Nullable
    private ImageDataSupplier mDefaultImageData;
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
        mImageLoaderAdapter = node.getNativeRender().getImageLoaderAdapter();
        mBundlePath = node.getNativeRender().getBundlePath();
        if (component != null) {
            mBackgroundDrawable = component.getBackgroundDrawable();
            mContentDrawable = component.getContentDrawable();
            mRippleDrawable = component.getRippleDrawable();
            mTextDrawable = component.getTextDrawable();
        }
    }

    private void fetchImageIfNeeded() {
        if ((mDefaultImageData == null || !mDefaultImageData.checkImageData())
                && mDefaultImageFetchState == ImageFetchState.UNLOAD) {
            fetchImageWithUrl(mDefaultUri, ImageSourceType.DEFAULT);
        }
        if ((mImageData == null || !mImageData.checkImageData())
                && mImageFetchState == ImageFetchState.UNLOAD) {
            fetchImageWithUrl(mUri, ImageSourceType.SRC);
        }
    }

    @Override
    protected void onHostViewAttachedToWindow() {
        fetchImageIfNeeded();
    }

    @Override
    public void onAttachedToHostView() {
        fetchImageIfNeeded();
    }

    @Override
    public void onDetachedFromHostView() {
        super.onDetachedFromHostView();
        if (mImageData != null) {
            mImageData.setAttachState(false);
            mImageData.clear();
            mImageData = null;
        }
        if (mDefaultImageData != null) {
            mDefaultImageData.setAttachState(false);
            mDefaultImageData.clear();
            mDefaultImageData = null;
        }
        mImageFetchState = ImageFetchState.UNLOAD;
        mDefaultImageFetchState = ImageFetchState.UNLOAD;
    }

    public void setSrc(String uri) {
        uri = convertToLocalPathIfNeeded(uri);
        if (!TextUtils.equals(mUri, uri)) {
            mUri = uri;
            mImageFetchState = ImageFetchState.UNLOAD;
            fetchImageWithUrl(uri, ImageSourceType.SRC);
        }
    }

    public void setDefaultSource(String uri) {
        uri = convertToLocalPathIfNeeded(uri);
        if (!TextUtils.equals(mDefaultUri, uri)) {
            mDefaultUri = uri;
            mDefaultImageFetchState = ImageFetchState.UNLOAD;
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
        mImageFetchState = ImageFetchState.LOADING;
        if (mHostRef.get() != null) {
            // send onLoadStart event
            EventUtils.sendComponentEvent(mHostRef.get(), EVENT_IMAGE_LOAD_START, null);
        }
    }

    private void onFetchImageSuccess(@NonNull String uri, ImageSourceType sourceType,
            @NonNull ImageDataSupplier imageData, boolean loadFromCache) {
        if (sourceType == ImageSourceType.SRC) {
            if (!uri.equals(mUri)) {
                return;
            }
            mImageData = imageData;
            mImageFetchState = ImageFetchState.LOADED;
            ensureContentDrawable().setContentBitmap(imageData.getBitmap());
            ensureContentDrawable().setGifMovie(imageData.getGifMovie());
            if (mHostRef.get() != null && !loadFromCache) {
                // send onLoad event
                EventUtils.sendComponentEvent(mHostRef.get(), EVENT_IMAGE_ON_LOAD, null);
                HashMap<String, Object> params = new HashMap<>();
                params.put("success", 1);
                HashMap<String, Object> imageSize = new HashMap<>();
                imageSize.put("width", imageData.getImageWidth());
                imageSize.put("height", imageData.getImageHeight());
                params.put("image", imageSize);
                // send onLoadEnd event
                EventUtils.sendComponentEvent(mHostRef.get(), EVENT_IMAGE_LOAD_END, params);
            }
        } else if (sourceType == ImageSourceType.DEFAULT) {
            if (!uri.equals(mDefaultUri)) {
                return;
            }
            mDefaultImageData = imageData;
            mDefaultImageFetchState = ImageFetchState.LOADED;
            if (mImageData == null || !mImageData.checkImageData()) {
                ensureContentDrawable().setContentBitmap(imageData.getBitmap());
            }
        }
        if (!loadFromCache) {
            mImageLoaderAdapter.saveImageToCache(imageData);
        }
        imageData.setAttachState(true);
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

    private void doFetchLocalImage(final String uri, final ImageSourceType sourceType) {
        assert mImageLoaderAdapter != null;
        mImageLoaderAdapter.getLocalImage(uri, new ImageRequestListener() {
            @Override
            public void onRequestStart(ImageDataSupplier imageData) {
            }

            @Override
            public void onRequestProgress(float total, float loaded) {
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
        });
    }

    private void doFetchRemoteImage(final String uri, final ImageSourceType sourceType) {
        Map<String, Object> params = new HashMap<>();
        if (mHostRef.get() != null) {
            params.put("props", mHostRef.get().getProps());
        }
        assert mImageLoaderAdapter != null;
        mImageLoaderAdapter.fetchImage(uri, new ImageRequestListener() {
            @Override
            public void onRequestStart(ImageDataSupplier imageData) {
            }

            @Override
            public void onRequestProgress(float total, float loaded) {
                if (sourceType == ImageSourceType.SRC) {
                    onFetchImageProgress(total, loaded);
                }
            }

            @Override
            public void onRequestSuccess(ImageDataSupplier imageData) {
                // Should check the remote request data returned from the host, if the data is
                // invalid, the request is considered to have failed
                if (imageData.checkImageData()) {
                    onFetchImageSuccess(uri, sourceType, imageData, false);
                } else {
                    onRequestFail(null);
                }
            }

            @Override
            public void onRequestFail(Throwable throwable) {
                if (sourceType == ImageSourceType.SRC) {
                    onFetchImageFail();
                } else {
                    mDefaultImageFetchState = ImageFetchState.UNLOAD;
                }
            }
        }, params);
    }

    private void fetchImageWithUrl(String uri, ImageSourceType sourceType) {
        if (TextUtils.isEmpty(uri) || mImageLoaderAdapter == null) {
            return;
        }
        ImageDataSupplier imageData = mImageLoaderAdapter.getImageFromCache(uri);
        if (imageData != null) {
            onFetchImageSuccess(uri, sourceType, imageData, true);
            return;
        }
        if (sourceType == ImageSourceType.SRC) {
            onFetchImageStart();
        } else {
            mDefaultImageFetchState = ImageFetchState.LOADING;
        }
        if (UrlUtils.isWebUrl(uri)) {
            String tempUrl = uri.trim().replaceAll(" ", "%20");
            doFetchRemoteImage(tempUrl, sourceType);
        } else {
            doFetchLocalImage(uri, sourceType);
        }
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
