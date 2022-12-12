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

import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.utils.UIThreadUtils;
import com.tencent.renderer.pool.ImageDataPool;
import com.tencent.renderer.pool.Pool;

import com.tencent.vfs.ResourceDataHolder;
import com.tencent.vfs.VfsManager;
import com.tencent.vfs.VfsManager.FetchResourceCallback;
import java.util.HashMap;
import java.util.Map;

public class ImageLoader implements ImageLoaderAdapter {

    public static final String REQUEST_CONTENT_TYPE = "Content-Type";
    public static final String REQUEST_CONTENT_TYPE_IMAGE = "image";
    private final VfsManager mVfsManager;

    @NonNull
    private final Pool<Integer, ImageDataSupplier> mImagePool = new ImageDataPool();

    public ImageLoader(VfsManager vfsManager) {
        mVfsManager = vfsManager;
    }

    @Nullable
    public ImageDataSupplier getImageFromCache(@NonNull String source) {
        return mImagePool.acquire(ImageDataHolder.generateSourceKey(source));
    }

    private void doCallback(@NonNull final ResourceDataHolder dataHolder,
            @Nullable final ImageDataHolder imageHolder,
            @NonNull final ImageRequestListener listener) {
        UIThreadUtils.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                if (dataHolder.resultCode != ResourceDataHolder.RESOURCE_LOAD_SUCCESS_CODE) {
                    listener.onRequestFail(new RuntimeException(dataHolder.errorMessage));
                } else if (imageHolder == null || !imageHolder.checkImageData()) {
                    listener.onRequestFail(new RuntimeException(""));
                } else {
                    listener.onRequestSuccess(imageHolder);
                }
            }
        });
    }

    private void saveImageToCache(@NonNull ImageDataSupplier data) {
        mImagePool.release(data);
    }

    @NonNull
    private HashMap<String, String> generateRequestParams(@Nullable Map<String, Object> initProps,
            int width, int height) {
        HashMap<String, String> requestParams = new HashMap<>();
        requestParams.put("width", String.valueOf(width));
        requestParams.put("height", String.valueOf(height));
        requestParams.put(REQUEST_CONTENT_TYPE, REQUEST_CONTENT_TYPE_IMAGE);
        try {
            if (initProps != null) {
                requestParams.put(NodeProps.CUSTOM_PROP_IMAGE_TYPE,
                        String.valueOf(initProps.get(NodeProps.CUSTOM_PROP_IMAGE_TYPE)));
                requestParams.put(NodeProps.REPEAT_COUNT,
                        String.valueOf(initProps.get(NodeProps.REPEAT_COUNT)));
                requestParams.put(NodeProps.CUSTOM_PROP_ISGIF,
                        String.valueOf(initProps.get(NodeProps.CUSTOM_PROP_ISGIF)));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return requestParams;
    }

    @Nullable
    public ImageDataSupplier fetchImageSync(@NonNull String url,
            @Nullable Map<String, Object> initProps, int width, int height) {
        HashMap<String, String> requestParams = generateRequestParams(initProps, width, height);
        ResourceDataHolder dataHolder = mVfsManager.fetchResourceSync(url, null, requestParams);
        byte[] bytes = dataHolder.getBytes();
        if (dataHolder.resultCode
                != ResourceDataHolder.RESOURCE_LOAD_SUCCESS_CODE || bytes == null) {
            return null;
        }
        ImageDataHolder imageHolder = new ImageDataHolder(url, width, height);
        imageHolder.setData(bytes);
        if (!imageHolder.checkImageData()) {
            // The source decoding may fail, if bitmap and gif movie does not exist,
            // return null directly.
            return null;
        }
        saveImageToCache(imageHolder);
        return imageHolder;
    }

    @Override
    public void fetchImageAsync(@NonNull final String url,
            @NonNull final ImageRequestListener listener,
            @Nullable Map<String, Object> initProps, final int width, final int height) {
        HashMap<String, String> requestParams = generateRequestParams(initProps, width, height);
        mVfsManager.fetchResourceAsync(url, null, requestParams,
                new FetchResourceCallback() {
                    @Override
                    public void onFetchCompleted(@NonNull final ResourceDataHolder dataHolder) {
                        byte[] bytes = dataHolder.getBytes();
                        if (dataHolder.resultCode
                                != ResourceDataHolder.RESOURCE_LOAD_SUCCESS_CODE || bytes == null) {
                            doCallback(dataHolder, null, listener);
                        } else {
                            ImageDataHolder imageHolder = new ImageDataHolder(url, width, height);
                            imageHolder.setData(bytes);
                            if (!imageHolder.checkImageData()) {
                                // The source decoding may fail, if bitmap and gif movie does not exist,
                                // callback request failed.
                                doCallback(dataHolder, null, listener);
                            } else {
                                saveImageToCache(imageHolder);
                                doCallback(dataHolder, imageHolder, listener);
                            }
                        }
                    }
                });
    }

    public void clear() {
        mImagePool.clear();
    }

    public void destroyIfNeed() {
        clear();
    }
}
