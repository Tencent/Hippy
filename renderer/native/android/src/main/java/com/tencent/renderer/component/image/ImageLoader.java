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

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.openhippy.pool.ImageDataKey;
import com.openhippy.pool.ImageDataPool;
import com.openhippy.pool.ImageRecycleObject;
import com.openhippy.pool.Pool;
import com.tencent.mtt.hippy.utils.UIThreadUtils;
import com.tencent.renderer.NativeRenderException;

import com.tencent.vfs.ResourceDataHolder;
import com.tencent.vfs.VfsManager;
import com.tencent.vfs.VfsManager.FetchResourceCallback;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class ImageLoader implements ImageLoaderAdapter {

    private static final String TAG = "ImageLoader";
    public static final String REQUEST_CONTENT_TYPE = "Content-Type";
    public static final String REQUEST_CONTENT_TYPE_IMAGE = "image";
    @Nullable
    private final ImageDecoderAdapter mImageDecoderAdapter;
    @NonNull
    private final VfsManager mVfsManager;
    @NonNull
    private final HashMap<ImageDataKey, ArrayList<ImageRequestListener>> mListenersMap = new HashMap<>();
    @NonNull
    private final Pool<ImageDataKey, ImageRecycleObject> mImagePool = new ImageDataPool();

    public ImageLoader(@NonNull VfsManager vfsManager,
            @Nullable ImageDecoderAdapter imageDecoderAdapter) {
        mVfsManager = vfsManager;
        mImageDecoderAdapter = imageDecoderAdapter;
    }

    @Nullable
    @Override
    public ImageDataSupplier getImageFromCache(@NonNull String url) {
        ImageRecycleObject imageObject = mImagePool.acquire(new ImageDataKey(url));
        return (imageObject instanceof ImageDataSupplier) ? ((ImageDataSupplier) imageObject)
                : null;
    }

    @Override
    public void saveImageToCache(@NonNull ImageDataSupplier data) {
        mImagePool.release((ImageDataHolder) data);
    }

    private void doListenerCallback(@NonNull final ImageRequestListener listener,
            @Nullable final ImageDataHolder imageHolder,
            @NonNull final String errorMessage) {
        if (imageHolder != null) {
            listener.onRequestSuccess(imageHolder);
        } else {
            listener.onRequestFail(new RuntimeException(errorMessage));
        }
    }

    private Runnable generateCallbackRunnable(final ImageDataKey urlKey,
            @Nullable final ImageDataHolder imageHolder,
            @Nullable String errorMessage) {
        final String error = (errorMessage != null) ? errorMessage : "";
        return new Runnable() {
            @Override
            public void run() {
                ArrayList<ImageRequestListener> listeners = mListenersMap.get(urlKey);
                mListenersMap.remove(urlKey);
                if (listeners != null && listeners.size() > 0) {
                    for (ImageRequestListener listener : listeners) {
                        if (listener != null) {
                            doListenerCallback(listener, imageHolder, error);
                        }
                    }
                }
            }
        };
    }

    private void handleResourceData(@NonNull String url, @NonNull final ImageDataKey urlKey,
            @Nullable Map<String, Object> initProps,
            @NonNull final ResourceDataHolder dataHolder, int width, int height) {
        ImageDataHolder imageHolder = null;
        String errorMessage = null;
        byte[] bytes = dataHolder.getBytes();
        if (dataHolder.resultCode
                == ResourceDataHolder.RESOURCE_LOAD_SUCCESS_CODE && bytes != null) {
            imageHolder = new ImageDataHolder(url, urlKey, width, height);
            try {
                imageHolder.decodeImageData(bytes, initProps, mImageDecoderAdapter);
                // Should check the request data returned from the host, if the data is
                // invalid, the request is considered to have failed
                if (!imageHolder.checkImageData()) {
                    imageHolder = null;
                    errorMessage = "Image data decoding failed!";
                }
            } catch (NativeRenderException e) {
                e.printStackTrace();
                imageHolder = null;
                errorMessage = e.getMessage();
            }
        } else {
            errorMessage = dataHolder.errorMessage;
        }
        Runnable callbackRunnable = generateCallbackRunnable(urlKey, imageHolder, errorMessage);
        if (UIThreadUtils.isOnUiThread()) {
            callbackRunnable.run();
        } else {
            UIThreadUtils.runOnUiThread(callbackRunnable);
        }
        dataHolder.recycle();
    }

    private void handleRequestProgress(final long total, final long loaded,
            @NonNull final ImageDataKey urlKey) {
        Runnable progressRunnable = new Runnable() {
            @Override
            public void run() {
                ArrayList<ImageRequestListener> listeners = mListenersMap.get(urlKey);
                if (listeners != null) {
                    for (ImageRequestListener listener : listeners) {
                        if (listener != null) {
                            listener.onRequestProgress(total, loaded);
                        }
                    }
                }
            }
        };
        if (UIThreadUtils.isOnUiThread()) {
            progressRunnable.run();
        } else {
            UIThreadUtils.runOnUiThread(progressRunnable);
        }
    }

    @NonNull
    private HashMap<String, String> generateRequestParams(int width, int height) {
        HashMap<String, String> requestParams = new HashMap<>();
        requestParams.put("width", String.valueOf(width));
        requestParams.put("height", String.valueOf(height));
        requestParams.put(REQUEST_CONTENT_TYPE, REQUEST_CONTENT_TYPE_IMAGE);
        return requestParams;
    }

    @Nullable
    public ImageDataSupplier fetchImageSync(@NonNull String url,
            @Nullable Map<String, Object> initProps, int width, int height) {
        HashMap<String, String> requestParams = generateRequestParams(width, height);
        ResourceDataHolder dataHolder = mVfsManager.fetchResourceSync(url, null, requestParams);
        byte[] bytes = dataHolder.getBytes();
        if (dataHolder.resultCode
                != ResourceDataHolder.RESOURCE_LOAD_SUCCESS_CODE || bytes == null) {
            return null;
        }
        ImageDataHolder imageHolder = ImageDataHolder.obtain();
        if (imageHolder != null) {
            imageHolder.init(url, null, width, height);
        } else {
            imageHolder = new ImageDataHolder(url, width, height);
        }
        try {
            imageHolder.decodeImageData(bytes, initProps, mImageDecoderAdapter);
            if (imageHolder.checkImageData()) {
                return imageHolder;
            }
        } catch (NativeRenderException e) {
            e.printStackTrace();
        } finally {
            dataHolder.recycle();
        }
        return null;
    }

    private boolean checkRepeatRequest(@NonNull ImageDataKey urlKey,
            @NonNull final ImageRequestListener listener) {
        ArrayList<ImageRequestListener> listenerList = mListenersMap.get(urlKey);
        if (listenerList != null) {
            listenerList.add(listener);
            return true;
        }
        ArrayList<ImageRequestListener> listeners = new ArrayList<>();
        listeners.add(listener);
        mListenersMap.put(urlKey, listeners);
        return false;
    }

    @Override
    public void fetchImageAsync(@NonNull final String url,
            @NonNull final ImageRequestListener listener,
            @Nullable final Map<String, Object> initProps, final int width, final int height) {
        final ImageDataKey urlKey = new ImageDataKey(url);
        // If the same image uri repeatedly requests, we need to filter these repeated requests
        // to avoid wasting system resources
        if (checkRepeatRequest(urlKey, listener)) {
            return;
        }
        HashMap<String, String> requestParams = generateRequestParams(width, height);
        mVfsManager.fetchResourceAsync(url, null, requestParams,
                new FetchResourceCallback() {
                    @Override
                    public void onFetchCompleted(@NonNull final ResourceDataHolder dataHolder) {
                        handleResourceData(url, urlKey, initProps, dataHolder, width, height);
                    }

                    @Override
                    public void onFetchProgress(long total, long loaded) {
                        handleRequestProgress(total, loaded, urlKey);
                    }
                });
    }

    @Override
    public void clear() {
        mImagePool.clear();
    }

    @Override
    public void destroy() {
        clear();
        mListenersMap.clear();
    }
}
