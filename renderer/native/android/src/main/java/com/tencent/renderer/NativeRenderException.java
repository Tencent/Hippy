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
        INVALID_NODE_DATA_ERR(100),

        /**
         * If get an exception of Deserialize node data from C dom manager
         */
        DESERIALIZE_DATA_ERR(101);

        private final int iValue;

        ExceptionCode(int value) {
            iValue = value;
        }

        @SuppressWarnings("unused")
        public int value() {
            return iValue;
        }
    }

    public ExceptionCode code;

    public NativeRenderException(ExceptionCode code, String message) {
        super(message);
        this.code = code;
    }

}
