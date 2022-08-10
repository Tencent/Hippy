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

import androidx.collection.LruCache;

import com.tencent.link_supplier.proxy.framework.ImageDataSupplier;
import com.tencent.link_supplier.proxy.framework.ImageLoaderAdapter;
import com.tencent.link_supplier.proxy.framework.ImageRequestListener;
import com.tencent.mtt.hippy.utils.UIThreadUtils;
import com.tencent.renderer.utils.UrlUtils;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public abstract class ImageLoader implements ImageLoaderAdapter {

    private static final int MAX_SOURCE_KEY_LEN = 32;
    @Nullable
    private LruCache<Integer, ImageDataSupplier> mLocalImageCache;
    @Nullable
    private LruCache<Integer, ImageDataSupplier> mRemoteImageCache;
    @Nullable
    private ExecutorService mExecutorService;

    public static int generateSourceKey(@NonNull String source) {
        if (source.length() > MAX_SOURCE_KEY_LEN) {
            source = source.substring(source.length() - MAX_SOURCE_KEY_LEN);
        }
        return source.hashCode();
    }

    @Override
    public void saveImageToCache(@NonNull ImageDataSupplier data) {
        if (data.getSource() == null) {
            return;
        }
        boolean isRemote = UrlUtils.isWebUrl(data.getSource());
        LruCache<Integer, ImageDataSupplier> cache =
                isRemote ? ensureRemoteImageCache() : ensureLocalImageCache();
        cache.put(generateSourceKey(data.getSource()), data);
        data.setCacheState(true);
    }

    @Nullable
    public ImageDataSupplier getImageFromCache(@NonNull String source) {
        boolean isRemote = UrlUtils.isWebUrl(source);
        LruCache<Integer, ImageDataSupplier> cache =
                isRemote ? mRemoteImageCache : mLocalImageCache;
        if (cache == null) {
            return null;
        }
        int key = generateSourceKey(source);
        ImageDataSupplier data = cache.get(key);
        if (data == null || !data.checkImageData()) {
            // Bitmap may have been recycled, must be removed from the cache and not
            // returned to the component.
            cache.remove(key);
            return null;
        }
        return data;
    }

    @Override
    public void onEntryEvicted(@NonNull ImageDataSupplier data) {
        data.setCacheState(false);
        data.clear();
    }

    @Override
    public void getLocalImage(@NonNull final String source,
            @NonNull final ImageRequestListener listener) {
        if (!UIThreadUtils.isOnUiThread()) {
            ImageDataSupplier supplier = getLocalImageImpl(source);
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
                final ImageDataSupplier supplier = getLocalImageImpl(source);
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
    public ImageDataSupplier getLocalImage(@NonNull String source) {
        return getLocalImageImpl(source);
    }

    @Nullable
    private ImageDataSupplier getLocalImageImpl(@NonNull String source) {
        ImageDataHolder dataHolder = new ImageDataHolder(source);
        dataHolder.setData(source);
        // The source decoding may fail, if bitmap and gif movie does not exist,
        // return null object directly.
        if (!dataHolder.checkImageData()) {
            return null;
        }
        return dataHolder;
    }

    public void clear() {
        if (mLocalImageCache != null) {
            mLocalImageCache.evictAll();
            mLocalImageCache = null;
        }
        if (mRemoteImageCache != null) {
            mRemoteImageCache.evictAll();
            mRemoteImageCache = null;
        }
    }

    public void destroyIfNeed() {
        clear();
        if (mExecutorService != null && !mExecutorService.isShutdown()) {
            mExecutorService.shutdown();
            mExecutorService = null;
        }
    }

    private LruCache<Integer, ImageDataSupplier> ensureLocalImageCache() {
        if (mLocalImageCache == null) {
            mLocalImageCache = new LruCache<Integer, ImageDataSupplier>(6) {
                @Override
                protected void entryRemoved(boolean evicted, @NonNull Integer key,
                        @NonNull ImageDataSupplier oldValue, @Nullable ImageDataSupplier newValue) {
                    if (evicted) {
                        onEntryEvicted(oldValue);
                    }
                }
            };
        }
        return mLocalImageCache;
    }

    private LruCache<Integer, ImageDataSupplier> ensureRemoteImageCache() {
        if (mRemoteImageCache == null) {
            mRemoteImageCache = new LruCache<Integer, ImageDataSupplier>(8) {
                @Override
                protected void entryRemoved(boolean evicted, @NonNull Integer key,
                        @NonNull ImageDataSupplier oldValue, @Nullable ImageDataSupplier newValue) {
                    if (evicted) {
                        onEntryEvicted(oldValue);
                    }
                }
            };
        }
        return mRemoteImageCache;
    }
}
