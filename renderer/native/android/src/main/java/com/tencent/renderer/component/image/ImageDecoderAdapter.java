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

public interface ImageDecoderAdapter {

    void destroyIfNeeded();

    /**
     * Decode image data by host adapter.
     *
     * </p> After the image data is obtained from vfs, it will be given priority to the adapter
     * provided by the host for processing. If the host does not process it, the SDK will decode the
     * image data internally.
     *
     * Before calling this method, the SDK has decoded the image data header and obtained relevant
     * image information {@link BitmapFactory.Options}, such as image width and height and image type
     * {@link BitmapFactory.Options#outMimeType}.
     * </p>
     *
     * @param data the image date fetch from vfs
     * @param imageHolder {@link ImageDataHolder}
     * @param options {@link BitmapFactory.Options}
     * @return {@code true} the image data has been processed by the host adapter {@code false} host
     *         adapter did not process this image data
     */
    boolean decodeImageData(@NonNull byte[] data, @NonNull ImageDataHolder imageHolder, @NonNull
            BitmapFactory.Options options);

}
