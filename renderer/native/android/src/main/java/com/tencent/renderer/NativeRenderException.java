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

import android.view.ViewGroup;

import androidx.annotation.Nullable;

import com.tencent.mtt.hippy.dom.flex.FlexMeasureMode;
import com.tencent.mtt.hippy.views.textinput.HippyTextInput;

import java.lang.reflect.Type;
import java.util.List;
import java.util.Map;

public class NativeRenderException extends RuntimeException {

    public enum ExceptionCode {
        /**
         * If get an invalid or illegal node data from C dom manager, such as node id or parent id
         * is negative number
         *
         * @see com.tencent.renderer.NativeRenderer
         * @see com.tencent.mtt.hippy.uimanager.RenderManager#createNode(ViewGroup, int, int,
         *         int, String, Map)
         */
        INVALID_NODE_DATA_ERR,

        /**
         * If the data length read by deserializer not equal to expected length
         *
         * @see com.tencent.renderer.serialization.Deserializer
         */
        DESERIALIZE_READ_LENGTH_ERR,

        /**
         * If the node data object type not support by native renderer
         *
         * @see com.tencent.renderer.serialization.Deserializer
         */
        DESERIALIZE_NOT_SUPPORTED_ERR,

        /**
         * If the data object type not support by Serializer
         *
         * @see com.tencent.renderer.serialization.Serializer#writeValue(Object) 
         */
        SERIALIZER_NOT_SUPPORTED_ERR,

        /**
         * If the node to measure is not text node or node parent is virtual node
         *
         * @see com.tencent.renderer.component.text.VirtualNodeManager#measure(int, float,
         *         FlexMeasureMode)
         */
        INVALID_MEASURE_STATE_ERR,

        /**
         * If fail to insert an element into the ui task queue because of ClassCastException |
         * NullPointerException | IllegalArgumentException
         *
         * @see com.tencent.renderer.NativeRenderer#addUITask(UITaskExecutor)
         */
        UI_TASK_QUEUE_ADD_ERR,

        /**
         * If fail to insert an element into the ui task queue because of IllegalStateException
         *
         * @see com.tencent.renderer.NativeRenderer#addUITask(UITaskExecutor)
         */
        UI_TASK_QUEUE_UNAVAILABLE_ERR,

        /**
         * If fail to get controller by specify class name
         *
         * @see com.tencent.mtt.hippy.uimanager.ControllerRegistry#getViewController(String)
         */
        GET_VIEW_CONTROLLER_FAILED_ERR,

        /**
         * If fail to get call ui function params
         *
         * @see com.tencent.mtt.hippy.views.textinput.HippyTextInputController#handleSetValueFunction(HippyTextInput,
         *         List)
         */
        HANDLE_CALL_UI_FUNCTION_ERR,

        /**
         * If fail to add child view to parent
         *
         * @see com.tencent.mtt.hippy.uimanager.ControllerManager#addChild(int, int, int)
         */
        ADD_CHILD_VIEW_FAILED_ERR,

        /**
         * If fail to update props of view, such as unknown type or convert failed
         *
         * @see com.tencent.renderer.utils.PropertyUtils#convertProperty(Type, Object)
         */
        UPDATE_VIEW_PROPS_ERR,
    }

    public ExceptionCode mCode;

    public NativeRenderException(ExceptionCode code, @Nullable String message) {
        super(message);
        mCode = code;
    }

    public NativeRenderException(ExceptionCode code, @Nullable Throwable cause) {
        super(cause);
        mCode = code;
    }
}
