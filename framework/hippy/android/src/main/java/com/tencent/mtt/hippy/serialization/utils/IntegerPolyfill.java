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
package com.tencent.mtt.hippy.serialization.utils;

public final class IntegerPolyfill {

  private IntegerPolyfill() {

  }

  /**
   * Converts the argument to a {@code long} by an unsigned conversion.  In an unsigned conversion
   * to a {@code long}, the high-order 32 bits of the {@code long} are zero and the low-order 32
   * bits are equal to the bits of the integer argument.
   * <p>
   * Consequently, zero and positive {@code int} values are mapped to a numerically equal {@code
   * long} value and negative {@code int} values are mapped to a {@code long} value equal to the
   * input plus 2<sup>32</sup>.
   *
   * @param x the value to convert to an unsigned {@code long}
   * @return the argument converted to {@code long} by an unsigned conversion
   */
  public static long toUnsignedLong(int x) {
    return ((long) x) & 0xffffffffL;
  }
}
