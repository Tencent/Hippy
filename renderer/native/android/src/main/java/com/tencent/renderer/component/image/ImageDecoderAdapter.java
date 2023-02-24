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

import android.graphics.BitmapFactory;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import java.util.Map;

public interface ImageDecoderAdapter {

    /**
     * Clear adapter if needed when the engine is destroyed.
     */
    void destroyIfNeeded();

    /**
     * Pre decode image data by host adapter.
     *
     * </p> After the image data is obtained from vfs, it will be given priority to the adapter
     * provided by the host for processing. If the host does not process it, the SDK will decode the
     * image data internally.
     *
     * Before calling this method, the SDK has decoded the image data header and obtained relevant
     * image information {@link BitmapFactory.Options}, such as image width and height and image
     * type {@link BitmapFactory.Options#outMimeType}.
     * </p>
     *
     * @param data the image date fetch from vfs
     * @param initProps the initial attribute of image node
     * @param imageHolder {@link ImageDataHolder}
     * @param options {@link BitmapFactory.Options}
     * @return {@code true} the image data has been processed by the host adapter {@code false} host
     * adapter did not process this image data
     */
    boolean preDecode(@NonNull byte[] data, @Nullable Map<String, Object> initProps,
            @NonNull ImageDataHolder imageHolder, @NonNull BitmapFactory.Options options);

    /**
     * On decode image data Completed.
     *
     * </p>
     * After decoding, the host can perform secondary processing on the generated bitmap in this interface.
     * </p>
     *
     * @param initProps the initial attribute of image node
     * @param imageHolder {@link ImageDataHolder}
     * @param options {@link BitmapFactory.Options}
     */
    void afterDecode(@Nullable Map<String, Object> initProps, @NonNull ImageDataHolder imageHolder,
            @NonNull BitmapFactory.Options options);
}
