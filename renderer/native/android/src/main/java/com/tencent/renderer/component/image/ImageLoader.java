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

import java.lang.ref.WeakReference;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public abstract class ImageLoader implements ImageLoaderAdapter {

    private final ConcurrentHashMap<Integer, WeakReference<ImageDataSupplier>> mImageCache = new ConcurrentHashMap<>();
    @Nullable
    private ExecutorService mExecutorService;

    @Override
    public void getLocalImage(@NonNull final String source,
            @NonNull final ImageRequestListener listener) {
        if (!UIThreadUtils.isOnUiThread()) {
            ImageDataSupplier supplier = getLocalImageImpl(source);
            listener.onRequestSuccess(supplier);
            return;
        }
        if (mExecutorService == null) {
            mExecutorService = Executors.newSingleThreadExecutor();
        }
        mExecutorService.execute(new Runnable() {
            @Override
            public void run() {
                final ImageDataSupplier supplier = getLocalImageImpl(source);
                UIThreadUtils.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        listener.onRequestSuccess(supplier);
                    }
                });
            }
        });
    }

    @Override
    @NonNull
    public ImageDataSupplier getLocalImage(@NonNull String source) {
        return getLocalImageImpl(source);
    }

    @Nullable
    private ImageDataSupplier getCacheImage(Integer cacheCode) {
        WeakReference<ImageDataSupplier> supplierWeakReference = mImageCache
                .get(cacheCode);
        if (supplierWeakReference != null) {
            ImageDataSupplier supplier = supplierWeakReference.get();
            if (supplier == null) {
                mImageCache.remove(cacheCode);
            } else {
                return supplier;
            }
        }
        return null;
    }

    @NonNull
    private ImageDataSupplier getLocalImageImpl(@NonNull String source) {
        boolean canCacheImage = source.startsWith("data:") || source.startsWith("assets://");
        Integer cacheCode = source.hashCode();
        ImageDataSupplier supplier = null;
        if (canCacheImage) {
            supplier = getCacheImage(cacheCode);
        }
        if (supplier != null) {
            return supplier;
        }
        supplier = new ImageDataHolder();
        ((ImageDataHolder) supplier).setData(source);
        if (canCacheImage) {
            mImageCache.put(cacheCode, new WeakReference<>(supplier));
        }
        return supplier;
    }

    public void destroyIfNeed() {
        if (mExecutorService != null && !mExecutorService.isShutdown()) {
            mExecutorService.shutdown();
            mExecutorService = null;
        }
    }
}
