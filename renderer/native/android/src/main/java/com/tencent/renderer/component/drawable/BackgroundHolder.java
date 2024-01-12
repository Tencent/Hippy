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

package com.tencent.renderer.component.drawable;

import android.graphics.Path;
import android.graphics.RectF;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

public interface BackgroundHolder {

    /**
     * the content region rect that excluded border width
     */
    @NonNull
    RectF getContentRegion();

    /**
     * the content path that excluded border width
     *
     * @return a rectangle with rounded corners, or null if there are no rounded corners
     */
    @Nullable
    Path getContentPath();

    /**
     * the component path that included border width
     *
     * @returna a rectangle with rounded corners, or null if there are no rounded corners
     */
    @Nullable
    Path getBorderPath();
}
