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

import com.tencent.link_supplier.proxy.framework.ImageDataSupplier;
import com.tencent.link_supplier.proxy.framework.ImageLoaderAdapter;
import com.tencent.link_supplier.proxy.framework.ImageRequestListener;
import com.tencent.mtt.hippy.utils.UIThreadUtils;
import com.tencent.renderer.pool.ImageDataPool;
import com.tencent.renderer.pool.Pool;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public abstract class ImageLoader implements ImageLoaderAdapter {

    @NonNull
    private final Pool<Integer, ImageDataSupplier> mImagePool = new ImageDataPool();
    @Nullable
    private ExecutorService mExecutorService;

    @Override
    public void saveImageToCache(@NonNull ImageDataSupplier data) {
        mImagePool.release(data);
    }

    @Nullable
    public ImageDataSupplier getImageFromCache(@NonNull String source) {
        return mImagePool.acquire(ImageDataHolder.generateSourceKey(source));
    }

    @Override
    public void getLocalImage(@NonNull final String source,
            @NonNull final ImageRequestListener listener, final int width, final int height) {
        if (!UIThreadUtils.isOnUiThread()) {
            ImageDataSupplier supplier = getLocalImageImpl(source, width, height);
            if (supplier == null) {
                listener.onRequestFail(null);
            } else {
                listener.onRequestSuccess(supplier);
            }
            return;
        }
        if (mExecutorService == null) {
            mExecutorService = Executors.newSingleThreadExecutor();
        }
        mExecutorService.execute(new Runnable() {
            @Override
            public void run() {
                final ImageDataSupplier supplier = getLocalImageImpl(source, width, height);
                UIThreadUtils.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        if (supplier == null) {
                            listener.onRequestFail(null);
                        } else {
                            listener.onRequestSuccess(supplier);
                        }
                    }
                });
            }
        });
    }

    @Override
    @Nullable
    public ImageDataSupplier getLocalImage(@NonNull String source, int width, int height) {
        return getLocalImageImpl(source, width, height);
    }

    @Nullable
    private ImageDataSupplier getLocalImageImpl(@NonNull String source, int width, int height) {
        ImageDataHolder dataHolder = new ImageDataHolder(source, width, height);
        dataHolder.loadImageResource();
        // The source decoding may fail, if bitmap and gif movie does not exist,
        // return null object directly.
        if (!dataHolder.checkImageData()) {
            return null;
        }
        return dataHolder;
    }

    public void clear() {
        mImagePool.clear();
    }

    public void destroyIfNeed() {
        clear();
        if (mExecutorService != null && !mExecutorService.isShutdown()) {
            mExecutorService.shutdown();
            mExecutorService = null;
        }
    }
}
