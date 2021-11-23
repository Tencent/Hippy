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

import com.tencent.mtt.hippy.serialization.StringLocation;

import java.io.UnsupportedEncodingException;
import java.nio.ByteBuffer;

/**
 * A String pool, used to store and lookup frequently construct string objects.
 */
public interface StringTable {

  /**
   * <p>Use the specified {@code byteBuffer} and its {@code encoding} to find a string in the string
   * table,
   * if it exists, return its reference, if not, constructs a new one.</p>
   *
   * <p>If the string to be lookup is located in {@link StringLocation#VOID},
   * this means that the string will not be used, can simply return an empty string.</p>
   *
   * @param byteBuffer The byte buffer used to lookup
   * @param encoding   The name of a supported encoding
   * @param location   The location of the string
   * @param relatedKey If the string located in the value position of the k-v structure, (like a
   *                   {@link StringLocation#OBJECT_VALUE}, {@link StringLocation#DENSE_ARRAY_ITEM},
   *                   {@link StringLocation#SPARSE_ARRAY_ITEM} and {@link StringLocation#MAP_VALUE})
   *                   {@code relatedKey} is its related key object
   * @return The string corresponding to {@code byteBuffer}
   * @throws UnsupportedEncodingException If the encoding is not supported
   */
  String lookup(ByteBuffer byteBuffer, String encoding, StringLocation location, Object relatedKey)
      throws UnsupportedEncodingException;

  /**
   * Release string table
   */
  void release();
}
