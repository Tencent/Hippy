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
package com.tencent.mtt.hippy.serialization.memory.string;

import android.util.LruCache;

import com.tencent.mtt.hippy.exception.UnreachableCodeException;
import com.tencent.mtt.hippy.serialization.StringLocation;

import java.io.UnsupportedEncodingException;
import java.util.HashMap;

public class InternalizedStringTable extends DirectStringTable {
  // region key
  private static final int MAX_KEY_CALC_LENGTH	= 32;
  private static final int KEY_TABLE_SIZE = 2 * 1024;
  private final String[] keyTable = new String[KEY_TABLE_SIZE];
  private final char[] keyCompareTempBuffer = new char[MAX_KEY_CALC_LENGTH];
  // endregion

  // region value - local
  private final int VALUE_CACHE_SIZE = 32;
  private final LruCache<Integer, String> valueCache = new LruCache<>(VALUE_CACHE_SIZE);
  // endregion

  /** byte of "data:image/" URI string */
  private final static char[] DATA_IMAGE_URI = new char[] { 'd', 'a', 't', 'a', ':', 'i', 'm', 'a', 'g', 'e', '/' };
  private final HashMap<String, char[]> cacheablesProperty = new HashMap<String, char[]>() {{
    put("uri", DATA_IMAGE_URI);
    put("src", DATA_IMAGE_URI);
    put("source", DATA_IMAGE_URI);
  }};

  public HashMap<String, char[]> getCacheablesProperty() {
    return cacheablesProperty;
  }

  // region hash algorithm
  /**
   * This algorithm implements the DJB hash function
   * developed by <i>Daniel J. Bernstein</i>.
   */
  public static <T> int DJB_HASH(T value) {
    long hash = 5381;

    if (value instanceof byte[]) {
      final int end = ((byte[]) value).length;
      for (int i = 0; i < end; i++) {
        hash = ((hash << 5) + hash) + ((byte[]) value)[i];
      }
    } else if (value instanceof char[]) {
      final int end = ((char[]) value).length;
      for (int i = 0; i < end; i++) {
        hash = ((hash << 5) + hash) + (byte)(((char[]) value)[i]);
      }
    } else {
      throw new UnreachableCodeException();
    }

    return (int) hash;
  }

  /**
   * The algorithm forked from the {@link String#hashCode()}.
   */
  private static <T> int STRING_HASH(T value) {
    int hash = 0;

    if (value instanceof char[]) {
      final int end = ((char[]) value).length;
      for (int i = 0; i < end; i++) {
        hash = hash * 31 + ((char[]) value)[i];
      }
    } else if (value instanceof byte[]) {
      final int end = ((byte[]) value).length;
      for (int i = 0; i < end; i++) {
        hash = hash * 31 + (((byte[]) value)[i] & 0xff);
      }
    } else {
      throw new UnreachableCodeException();
    }

    return hash;
  }
  // endregion

  // region equals
  private <T> boolean equals(T sequence, String string) {
    final int expected;
    boolean isByteArray = false;
    if (sequence instanceof char[]) {
      expected = ((char[]) sequence).length;
    } else if (sequence instanceof byte[]) {
      isByteArray = true;
      expected = ((byte[]) sequence).length;
    } else {
      throw new UnreachableCodeException();
    }

    final int length = string.length();
    if (length != expected) {
      return false;
    }

    string.getChars(0, length, keyCompareTempBuffer, 0);

    if (isByteArray) {
      for (int i = 0; i < length; i++) {
        if ((((byte[]) sequence)[i] & 0xff) != keyCompareTempBuffer[i]) {
          return false;
        }
      }
      return true;
    }

    for (int i = 0; i < length; i++) {
      if (((char[]) sequence)[i] != keyCompareTempBuffer[i]) {
        return false;
      }
    }
    return true;
  }
  // endregion

  // region lookupKey
  private <T> String lookupKey(T sequence, String encoding) throws UnsupportedEncodingException {
    final int length;
    boolean isByteArray = false;
    if (sequence instanceof char[]) {
      length = ((char[]) sequence).length;
    } else if (sequence instanceof byte[]) {
      isByteArray = true;
      length = ((byte[]) sequence).length;
    } else {
      throw new UnreachableCodeException();
    }
    if (length >= MAX_KEY_CALC_LENGTH) {
      if (isByteArray) {
        return new String((byte[]) sequence, encoding);
      }
      return new String((char[]) sequence);
    }

    final int hashCode = DJB_HASH(sequence);
    final int hashIndex = (keyTable.length - 1) & hashCode;
    String internalized = keyTable[hashIndex];
    if (internalized != null && equals(sequence, internalized)) {
      return internalized;
    }
    internalized = isByteArray ? new String((byte[]) sequence, encoding) : new String((char[]) sequence);
    keyTable[hashIndex] = internalized;
    return internalized;
  }
  // endregion

  // region lookupValue
  private <T> String lookupValue(T sequence, String encoding, Object relatedKey) throws UnsupportedEncodingException {
    if (relatedKey instanceof String) {
      char[] valuePrefix = cacheablesProperty.get(relatedKey);
      if (valuePrefix != null) {
        boolean cacheables = true;
        boolean isByteArray = false;
        if (sequence instanceof byte[]) {
          isByteArray = true;
          for (int i = 0; i < valuePrefix.length; i++) {
            if (((byte) valuePrefix[i]) != ((byte[]) sequence)[i]) {
              cacheables = false;
              break;
            }
          }
        } else if (sequence instanceof char[]) {
          for (int i = 0; i < valuePrefix.length; i++) {
            if (valuePrefix[i] != ((char[]) sequence)[i]) {
              cacheables = false;
              break;
            }
          }
        } else {
          throw new UnreachableCodeException();
        }

        String value = null;
        int hashCode = -1;
        if (cacheables) {
          hashCode = STRING_HASH(sequence);
          value = valueCache.get(hashCode);
        }
        if (value == null) {
          value = isByteArray ? new String((byte[]) sequence, encoding) : new String((char[]) sequence);
          if (cacheables) {
            valueCache.put(hashCode, value);
          }
        }
        return value;
      }
    }

    if (sequence instanceof char[]) {
      return new String((char[]) sequence);
    } else if (sequence instanceof byte[]) {
      return new String((byte[]) sequence, encoding);
    } else {
      throw new UnreachableCodeException();
    }
  }
  // endregion

  // region lookup
  private <T> String lookupString(T sequence, String encoding, StringLocation location, Object relatedKey) throws UnsupportedEncodingException {
    switch (location) {
      case OBJECT_KEY: // [[fallthrough]]
      case DENSE_ARRAY_KEY: // [[fallthrough]]
      case SPARSE_ARRAY_KEY: // [[fallthrough]]
      case MAP_KEY: {
        return lookupKey(sequence, encoding);
      }
      case OBJECT_VALUE: // [[fallthrough]]
      case DENSE_ARRAY_ITEM: // [[fallthrough]]
      case SPARSE_ARRAY_ITEM: // [[fallthrough]]
      case MAP_VALUE: {
        return lookupValue(sequence, encoding, relatedKey);
      }
      case ERROR_MESSAGE: // [[fallthrough]]
      case ERROR_STACK: // [[fallthrough]]
      case REGEXP: // [[fallthrough]]
      case SET_ITEM: // [[fallthrough]]
      case TOP_LEVEL: {
        if (sequence instanceof byte[]) {
          return super.lookup((byte[]) sequence, encoding, location, relatedKey);
        } else if (sequence instanceof char[]) {
          return super.lookup((char[]) sequence, location, relatedKey);
        }
        throw new UnreachableCodeException();
      }
      case VOID: {
        return "";
      }
      default: {
        throw new UnreachableCodeException();
      }
    }
  }

  @Override
  public String lookup(char[] chars, StringLocation location, Object relatedKey) {
    try {
      return lookupString(chars, null, location, relatedKey);
    } catch (UnsupportedEncodingException e) {
      throw new UnreachableCodeException();
    }
  }

  @Override
  public String lookup(byte[] bytes, String encoding, StringLocation location, Object relatedKey) throws UnsupportedEncodingException {
    return lookupString(bytes, encoding, location, relatedKey);
  }
  // endregion

  @Override
  public void release() {
    valueCache.evictAll();
    super.release();
  }
}
