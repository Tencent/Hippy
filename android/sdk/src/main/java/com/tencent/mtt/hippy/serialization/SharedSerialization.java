/* Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2021 THL A29 Limited, a Tencent company. All rights reserved.
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
package com.tencent.mtt.hippy.serialization;

import java.nio.ByteOrder;

/**
 * Implementation of {@code v8::(internal::)ValueSerializer}.
 */
public abstract class SharedSerialization {
  static protected final byte LATEST_VERSION = (byte) 13; // kLatestVersion
  static protected final String NATIVE_UTF16_ENCODING = (ByteOrder.nativeOrder() == ByteOrder.BIG_ENDIAN) ? "UTF-16BE" : "UTF-16LE";

  protected final Object Null;
  protected final Object Undefined;
  protected final Object Hole;

  SharedSerialization() {
    Null = getNull();
    Undefined = getUndefined();
    Hole = getHole();
  }

  protected abstract Object getUndefined();
  protected abstract Object getNull();
  protected abstract Object getHole();
}
