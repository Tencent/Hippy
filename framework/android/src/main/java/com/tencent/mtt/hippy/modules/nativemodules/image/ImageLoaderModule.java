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

import android.graphics.BitmapFactory;
import android.text.TextUtils;
import androidx.annotation.NonNull;
import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.annotation.HippyMethod;
import com.tencent.mtt.hippy.annotation.HippyNativeModule;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleBase;
import com.tencent.mtt.hippy.runtime.builtins.JSObject;
import com.tencent.vfs.ResourceDataHolder;
import com.tencent.vfs.VfsManager;
import com.tencent.vfs.VfsManager.FetchResourceCallback;
import java.util.HashMap;

@HippyNativeModule(name = "ImageLoaderModule")
public class ImageLoaderModule extends HippyNativeModuleBase {

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
                        byte[] bytes = dataHolder.getBytes();
                        if (dataHolder.resultCode
                                != ResourceDataHolder.RESOURCE_LOAD_SUCCESS_CODE || bytes == null
                                || bytes.length <= 0) {
                            String message =
                                    dataHolder.errorMessage != null ? dataHolder.errorMessage : "";
                            String errorMsg = "Fetch image failed, url=" + url + ", msg=" + message;
                            JSObject jsObject = new JSObject();
                            jsObject.set(ERROR_KEY_MESSAGE, errorMsg);
                            promise.reject(jsObject);
                        } else {
                            decodeImageData(url, bytes, promise);
                        }
                        dataHolder.recycle();
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
