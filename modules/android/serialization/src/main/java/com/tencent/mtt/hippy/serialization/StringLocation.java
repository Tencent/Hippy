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

public enum StringLocation {
  /**
   * Independent Value
   */
  TOP_LEVEL,

  /**
   * Only string properties key, for {@link com.tencent.mtt.hippy.runtime.builtins.JSObject}
   */
  OBJECT_KEY,

  /**
   * Only string properties key, for {@link com.tencent.mtt.hippy.runtime.builtins.JSMap}
   */
  MAP_KEY,

  /**
   * Only string properties key, for {@link com.tencent.mtt.hippy.runtime.builtins.array.JSSparseArray}
   */
  SPARSE_ARRAY_KEY,

  /**
   * Only string properties key, for {@link com.tencent.mtt.hippy.runtime.builtins.array.JSDenseArray}
   */
  DENSE_ARRAY_KEY,

  /**
   * Related Property key is associated with {@link com.tencent.mtt.hippy.runtime.builtins.JSObject},
   * and its type is {@link java.lang.String}
   */
  OBJECT_VALUE,

  /**
   * Related Property key is associated with {@link com.tencent.mtt.hippy.runtime.builtins.JSMap},
   * and its type is {@link java.lang.Object}
   */
  MAP_VALUE,

  /**
   * Related Property key is associated with {@link com.tencent.mtt.hippy.runtime.builtins.array.JSSparseArray},
   * and its type is {@link java.lang.Integer} if properties, {@link java.lang.String} if elements
   */
  SPARSE_ARRAY_ITEM,

  /**
   * Related Property key is associated with {@link com.tencent.mtt.hippy.runtime.builtins.array.JSDenseArray},
   * and its type is {@link java.lang.Integer} if properties, {@link java.lang.String} if elements
   */
  DENSE_ARRAY_ITEM,

  /**
   * String for {@link com.tencent.mtt.hippy.runtime.builtins.JSSet} item
   */
  SET_ITEM,

  /**
   * String for {@link JSError#getMessage()}
   */
  ERROR_MESSAGE,

  /**
   * String for {@link JSError#getStack()}
   */
  ERROR_STACK,

  /**
   * String for compiles the given regular expression into a {@link java.util.regex.Pattern}
   */
  REGEXP,

  /**
   * String is not used in anywhere
   */
  VOID
}
