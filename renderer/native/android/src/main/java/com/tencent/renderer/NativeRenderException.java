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

public class NativeRenderException extends RuntimeException {

    public enum ExceptionCode {
        /**
         * If get an invalid or illegal node data from C dom manager, such as node id or parent id
         * is negative number
         */
        INVALID_NODE_DATA_ERR,

        /**
         * If the data length read by deserializer not equal to expected length
         */
        DESERIALIZE_READ_LENGTH_ERR,

        /**
         * If the node data object type not support by native renderer
         */
        DESERIALIZE_NOT_SUPPORTED_ERR,

        /**
         * If the node to measure is not text node or node parent is virtual node
         */
        INVALID_MEASURE_STATE_ERR,

        /**
         * If fail to retrieves and removes the head of ui task queue
         */
        UI_TASK_QUEUE_POLL_ERR,

        /**
         * If fail to insert an element into the ui task queue
         */
        UI_TASK_QUEUE_OFFER_ERR
    }

    public ExceptionCode mCode;

    public NativeRenderException(ExceptionCode code, String message) {
        super(message);
        mCode = code;
    }

    public NativeRenderException(ExceptionCode code, Throwable cause) {
        super(cause);
        mCode = code;
    }
}
