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

import androidx.annotation.NonNull;;
import android.util.LruCache;

import com.tencent.mtt.hippy.exception.UnreachableCodeException;
import com.tencent.mtt.hippy.serialization.StringLocation;

import java.io.UnsupportedEncodingException;
import java.nio.ByteBuffer;
import java.util.HashMap;

/**
 * Internalized string pool implement, it will store string objects.
 */
@SuppressWarnings({"unused"})
public class InternalizedStringTable extends DirectStringTable {

  // region key
  private static final int MAX_KEY_CALC_LENGTH = 32;
  private static final int KEY_TABLE_SIZE = 2 * 1024;
  private final String[] keyTable = new String[KEY_TABLE_SIZE];
  // endregion

  // region value - local
  private final int VALUE_CACHE_SIZE = 32;
  private final LruCache<Integer, String> valueCache = new LruCache<>(VALUE_CACHE_SIZE);
  // endregion

  /**
   * byte of "data:image/" URI string
   */
  private final static char[] DATA_IMAGE_URI = new char[]{'d', 'a', 't', 'a', ':', 'i', 'm', 'a',
      'g', 'e', '/'};
  private final HashMap<String, char[]> cacheablesProperty = new HashMap<String, char[]>() {{
    put("uri", DATA_IMAGE_URI);
    put("src", DATA_IMAGE_URI);
    put("source", DATA_IMAGE_URI);
  }};

  public HashMap<String, char[]> getCacheablesProperty() {
    return cacheablesProperty;
  }

  // region algorithm

  /**
   * This algorithm implements the DJB hash function developed by <i>Daniel J. Bernstein</i>.
   *
   * @param value  The bytes to be calculated
   * @param offset The offset
   * @param length The length
   * @return a hash code value for this bytes
   */
  public static int DJB_HASH(byte[] value, int offset, int length) {
    long hash = 5381;

    for (int i = offset; i < length; i++) {
      hash = ((hash << 5) + hash) + value[i];
    }

    return (int) hash;
  }

  /**
   * The algorithm forked from the {@link String#hashCode()}.
   *
   * @param value  The bytes to be calculated
   * @param offset The offset
   * @param length The length
   * @return a hash code value for this bytes
   */
  private static int STRING_HASH(byte[] value, int offset, int length) {
    int hash = 0;

    for (int i = offset; i < length; i++) {
      hash = hash * 31 + (value[i] & 0xff);
    }

    return hash;
  }

  /**
   * Fast compares {@link String} and {@link Byte[]} is equal Basic performance considerations,
   * <strong>only support {@link String} as one or two byte encoding</strong>
   *
   * @param sequence byte sequence
   * @param offset   The offset
   * @param length   The length
   * @param encoding The name of a supported charset
   * @param string   an string
   * @return {@code true} if it's equal, {@code false} otherwise
   */
  private boolean equals(byte[] sequence, int offset, int length, @NonNull String encoding, @NonNull String string) {
    final int bytesPerCharacter = encoding.equals("UTF-16LE") ? 2 : 1;
    final int count = string.length();
    // fast negative check
    if (length / bytesPerCharacter != count) {
      return false;
    }

    for (int i = 0; i < count; i++) {
      // MAX_KEY_CALC_LENGTH set to 32, use charAt method to iterate the chars in a String has more efficient
      char c = string.charAt(i);
      // Android is always little-endian
      if (sequence[offset + i] != (byte) c || (bytesPerCharacter == 2
          && sequence[offset + i + 1] != (byte) (c >> 8))) {
        return false;
      }
    }

    return true;
  }
  // endregion

  // region lookup
  private String lookupKey(byte[] sequence, int offset, int length, @NonNull String encoding)
      throws UnsupportedEncodingException {
    // only calculate one or two byte encoding
    if (length >= MAX_KEY_CALC_LENGTH || encoding.equals("UTF-8")) {
      return new String(sequence, offset, length, encoding);
    }

    final int hashCode = DJB_HASH(sequence, offset, length);
    final int hashIndex = (keyTable.length - 1) & hashCode;
    String internalized = keyTable[hashIndex];
    if (internalized != null && equals(sequence, offset, length, encoding, internalized)) {
      return internalized;
    }
    internalized = new String(sequence, offset, length, encoding);
    keyTable[hashIndex] = internalized;
    return internalized;
  }

  private String lookupValue(byte[] sequence, int offset, int length, @NonNull String encoding,
      Object relatedKey) throws UnsupportedEncodingException {
    if (relatedKey instanceof String) {
      char[] valuePrefix = cacheablesProperty.get(relatedKey);
      if (valuePrefix != null) {
        boolean cacheables = true;

        for (int i = 0; i < valuePrefix.length; i++) {
          if (((byte) valuePrefix[i]) != sequence[i]) {
            cacheables = false;
            break;
          }
        }

        String value = null;
        int hashCode = -1;
        if (cacheables) {
          hashCode = STRING_HASH(sequence, offset, length);
          value = valueCache.get(hashCode);
        }
        if (value == null) {
          value = new String(sequence, offset, length, encoding);
          if (cacheables) {
            valueCache.put(hashCode, value);
          }
        }
        return value;
      }
    }

    return new String(sequence, offset, length, encoding);
  }

  @Override
  public String lookup(@NonNull ByteBuffer byteBuffer, @NonNull String encoding, StringLocation location,
      Object relatedKey) throws UnsupportedEncodingException {
    final byte[] sequence = byteBuffer.array();
    final int offset = byteBuffer.arrayOffset() + byteBuffer.position();
    final int length = byteBuffer.limit() - byteBuffer.position();
    switch (location) {
      case OBJECT_KEY: // [[fallthrough]]
      case DENSE_ARRAY_KEY: // [[fallthrough]]
      case SPARSE_ARRAY_KEY: // [[fallthrough]]
      case MAP_KEY: {
        return lookupKey(sequence, offset, length, encoding);
      }
      case OBJECT_VALUE: // [[fallthrough]]
      case DENSE_ARRAY_ITEM: // [[fallthrough]]
      case SPARSE_ARRAY_ITEM: // [[fallthrough]]
      case MAP_VALUE: {
        return lookupValue(sequence, offset, length, encoding, relatedKey);
      }
      case ERROR_MESSAGE: // [[fallthrough]]
      case ERROR_STACK: // [[fallthrough]]
      case REGEXP: // [[fallthrough]]
      case SET_ITEM: // [[fallthrough]]
      case TOP_LEVEL: {
        return super.lookup(byteBuffer, encoding, location, relatedKey);
      }
      case VOID: {
        return "";
      }
      default: {
        throw new UnreachableCodeException();
      }
    }
  }
  // endregion

  @Override
  public void release() {
    valueCache.evictAll();
    super.release();
  }
}
