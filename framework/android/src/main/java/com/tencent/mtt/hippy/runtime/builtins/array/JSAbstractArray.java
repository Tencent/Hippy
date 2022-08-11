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
package com.tencent.mtt.hippy.runtime.builtins.array;

import com.tencent.mtt.hippy.runtime.builtins.JSObject;

@SuppressWarnings({"unused"})
public abstract class JSAbstractArray extends JSObject implements Iterable<Object> {

  // region static utils
  public static final long MAX_JS_ARRAY_LENGTH = 4294967295L;
  private static final long INVALID_ARRAY_INDEX = -1;
  private static final int MAX_UINT32_DIGITS = 10;

  public static boolean isArrayIndex(long longValue) {
    return 0L <= longValue && longValue < MAX_JS_ARRAY_LENGTH; // < 2^32-1, according to 15.4
  }

  private static boolean arrayIndexLengthInRange(String index) {
    int len = index.length();
    return 0 < len && len <= MAX_UINT32_DIGITS;
  }

  private static boolean isAsciiDigit(char c) {
    return '0' <= c && c <= '9';
  }

  private static long parseArrayIndexRaw(String string) {
    long value = 0;
    int pos = 0;
    int len = string.length();
    if (len > 1 && string.charAt(pos) == '0') {
      return INVALID_ARRAY_INDEX;
    }
    while (pos < len) {
      char c = string.charAt(pos);
      if (!isAsciiDigit(c)) {
        return INVALID_ARRAY_INDEX;
      }
      value *= 10;
      value += c - '0';
      pos++;
    }
    return value;
  }

  public static long stringToArrayIndex(String value) {
    if (value != null && arrayIndexLengthInRange(value)) {
      if (isAsciiDigit(value.charAt(0))) {
        return parseArrayIndexRaw(value);
      }
    }
    return INVALID_ARRAY_INDEX;
  }

  public static boolean isArrayIndex(String property) {
    long idx = stringToArrayIndex(property);
    return isArrayIndex(idx);
  }
  // endregion

  // region op
  public abstract void push(Object value);
  // endregion

  // region set
  @SuppressWarnings("UnusedReturnValue")
  public abstract Object set(int index, Object value);

  @Override
  public Object set(String key, Object value) {
    long index = stringToArrayIndex(key);
    if (isArrayIndex(index)) {
      if (index < Integer.MAX_VALUE - 1) {
        set((int) index, value);
        return value;
      }
      throw new IndexOutOfBoundsException("Index key(" + index + ") out of Java Arrays max size");
    }
    return super.set(key, value);
  }
  // endregion

  // region get
  public abstract Object get(int index);

  @Override
  public Object get(String key) {
    long index = stringToArrayIndex(key);
    if (isArrayIndex(index)) {
      if (index < Integer.MAX_VALUE - 1) {
        return get((int) index);
      }
      throw new IndexOutOfBoundsException("Index key(" + index + ") out of Java Arrays max size");
    }
    return super.get(key);
  }
  // endregion

  // region delete
  public abstract Object delete(int index);

  @Override
  public Object delete(String key) {
    long index = stringToArrayIndex(key);
    if (isArrayIndex(index)) {
      if (index < Integer.MAX_VALUE - 1) {
        return delete((int) index);
      }
      throw new IndexOutOfBoundsException("Index key(" + index + ") out of Java Arrays max size");
    }
    return super.delete(key);
  }
  // endregion
}
