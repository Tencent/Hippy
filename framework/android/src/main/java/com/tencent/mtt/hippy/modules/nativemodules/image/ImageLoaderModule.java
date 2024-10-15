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

package com.tencent.mtt.hippy.modules.nativemodules.image;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.text.TextUtils;
import androidx.annotation.NonNull;
import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.annotation.HippyMethod;
import com.tencent.mtt.hippy.annotation.HippyNativeModule;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleBase;
import com.tencent.mtt.hippy.runtime.builtins.JSObject;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.vfs.ResourceDataHolder;
import com.tencent.vfs.VfsManager;
import com.tencent.vfs.VfsManager.FetchResourceCallback;
import java.util.HashMap;

@HippyNativeModule(name = "ImageLoaderModule")
public class ImageLoaderModule extends HippyNativeModuleBase {

    private final String TAG = "ImageLoaderModule";
    private final VfsManager mVfsManager;
    private static final String ERROR_KEY_MESSAGE = "message";

    public ImageLoaderModule(HippyEngineContext context) {
        super(context);
        mVfsManager = context.getVfsManager();
    }

    private void decodeImageData(@NonNull final String url, @NonNull byte[] data, final Promise promise) {
        try {
            final BitmapFactory.Options options = new BitmapFactory.Options();
            options.inJustDecodeBounds = true;
            BitmapFactory.decodeByteArray(data, 0, data.length, options);
            JSObject jsObject = new JSObject();
            jsObject.set("width", options.outWidth);
            jsObject.set("height", options.outHeight);
            promise.resolve(jsObject);
        } catch (OutOfMemoryError | Exception e) {
            JSObject jsObject = new JSObject();
            jsObject.set(ERROR_KEY_MESSAGE, "Fetch image failed, url=" + url + ", msg=" + e.getMessage());
            promise.reject(jsObject);
        }
    }

    @NonNull
    private HashMap<String, String> generateRequestParams() {
        HashMap<String, String> requestParams = new HashMap<>();
        requestParams.put("Content-Type", "image");
        return requestParams;
    }

    private void onFetchFailed(final String url, final Promise promise, @NonNull final ResourceDataHolder dataHolder) {
        String message =
                dataHolder.errorMessage != null ? dataHolder.errorMessage : "";
        String errorMsg = "Fetch image failed, url=" + url + ", msg=" + message;
        JSObject jsObject = new JSObject();
        jsObject.set(ERROR_KEY_MESSAGE, errorMsg);
        promise.reject(jsObject);
    }

    private void handleFetchResult(final String url, final Promise promise, @NonNull final ResourceDataHolder dataHolder) {
        byte[] bytes = dataHolder.getBytes();
        Bitmap bitmap = dataHolder.bitmap;
        LogUtils.d(TAG, "handleFetchResult: url " + url + ", result " + dataHolder.resultCode);
        if (dataHolder.resultCode == ResourceDataHolder.RESOURCE_LOAD_SUCCESS_CODE) {
            if (bitmap != null && !bitmap.isRecycled()) {
                LogUtils.d(TAG, "handleFetchResult: url " + url
                        + ", bitmap width " + bitmap.getWidth() + ", bitmap height " + bitmap.getHeight());
                JSObject jsObject = new JSObject();
                jsObject.set("width", bitmap.getWidth());
                jsObject.set("height", bitmap.getHeight());
                promise.resolve(jsObject);
            } else if (bytes != null && bytes.length > 0) {
                decodeImageData(url, bytes, promise);
            } else {
                if (TextUtils.isEmpty(dataHolder.errorMessage)) {
                    dataHolder.errorMessage = "Invalid image data or bitmap!";
                }
                onFetchFailed(url, promise, dataHolder);
            }
        } else {
            onFetchFailed(url, promise, dataHolder);
        }
        dataHolder.recycle();
    }

    @HippyMethod(name = "getSize")
    public void getSize(final String url, final Promise promise) {
        if (TextUtils.isEmpty(url)) {
            JSObject jsObject = new JSObject();
            jsObject.set(ERROR_KEY_MESSAGE, "Url parameter is empty!");
            promise.reject(jsObject);
            return;
        }
        mVfsManager.fetchResourceAsync(url, null, generateRequestParams(),
                new FetchResourceCallback() {
                    @Override
                    public void onFetchCompleted(@NonNull final ResourceDataHolder dataHolder) {
                        handleFetchResult(url, promise, dataHolder);
                    }

                    @Override
                    public void onFetchProgress(long total, long loaded) {
                        // Nothing need to do here.
                    }
                });
    }

    @HippyMethod(name = "prefetch")
    public void prefetch(String url) {
        mVfsManager.fetchResourceAsync(url, null, generateRequestParams(),
                new FetchResourceCallback() {
                    @Override
                    public void onFetchCompleted(@NonNull final ResourceDataHolder dataHolder) {
                        dataHolder.recycle();
                    }

                    @Override
                    public void onFetchProgress(long total, long loaded) {
                        // Nothing need to do here.
                    }
                });
    }
}
