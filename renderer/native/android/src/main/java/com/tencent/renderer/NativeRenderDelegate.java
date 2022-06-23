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

import com.tencent.link_supplier.proxy.renderer.RenderExceptionHandler;
import java.util.List;

public interface NativeRenderDelegate extends RenderExceptionHandler {

    void createNode(int rootId, @NonNull List<Object> nodeList) throws NativeRenderException;

    void updateNode(int rootId, @NonNull List<Object> nodeList) throws NativeRenderException;

    void deleteNode(int rootId, @NonNull int[] ids) throws NativeRenderException;

    void moveNode(int rootId, int[] ids, int newPid, int oldPid) throws NativeRenderException;

    void updateLayout(int rootId, @NonNull List<Object> list) throws NativeRenderException;

    void updateEventListener(int rootId, @NonNull List<Object> eventList) throws NativeRenderException;

    void callUIFunction(int rootId, int id, long callbackId, String functionName,
            @NonNull List<Object> eventList) throws NativeRenderException;

    void measureInWindow(int rootId, int id, long callbackId);

    long measure(int rootId, int id, float width, int widthMode, float height, int heightMode);

    void endBatch(int rootId) throws NativeRenderException;
}
