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

package com.tencent.renderer;

import androidx.annotation.NonNull;

import java.util.ArrayList;

public interface NativeRenderDelegate extends NativeRenderExceptionHandler {

    void createNode(@NonNull ArrayList<Object> nodeList) throws NativeRenderException;

    void updateNode(@NonNull ArrayList<Object> nodeList) throws NativeRenderException;

    void deleteNode(@NonNull int[] ids) throws NativeRenderException;

    void updateLayout(@NonNull ArrayList<Object> list) throws NativeRenderException;

    void updateEventListener(@NonNull ArrayList<Object> eventList) throws NativeRenderException;

    long measure(int id, float width, int widthMode, float height, int heightMode)
            throws NativeRenderException;

    void startBatch();

    void endBatch();
}
