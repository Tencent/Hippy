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
package com.tencent.mtt.hippy.serialization.string;

import androidx.annotation.NonNull;

import com.tencent.mtt.hippy.serialization.StringLocation;

import java.io.UnsupportedEncodingException;
import java.nio.ByteBuffer;

/**
 * Non-reusable string pool implement, it will not store string objects.
 */
@SuppressWarnings({"unused"})
public class DirectStringTable implements StringTable {

  @Override
  public String lookup(ByteBuffer byteBuffer, @NonNull String encoding, StringLocation location,
                       Object relatedKey) throws UnsupportedEncodingException {
    if (location == StringLocation.VOID) {
      return "";
    }

    final int offset = byteBuffer.arrayOffset() + byteBuffer.position();
    final int length = byteBuffer.arrayOffset() + byteBuffer.limit();

    return new String(byteBuffer.array(), offset, length, encoding);
  }

  @Override
  public void release() {

  }
}
