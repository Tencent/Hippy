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

/**
 * Error-related serialization tags.
 */
@SuppressWarnings({"unused"})
public enum ErrorTag {
  EVAL_ERROR('E'), // kEvalErrorPrototype
  RANGE_ERROR('R'), // kRangeErrorPrototype
  REFERENCE_ERROR('F'), // kReferenceErrorPrototype
  SYNTAX_ERROR('S'), // kSyntaxErrorPrototype
  TYPE_ERROR('T'), // kTypeErrorPrototype
  URI_ERROR('U'), // kUriErrorPrototype
  MESSAGE('m'), // kMessage
  STACK('s'), // kStack
  END('.'); // kEnd

  private final byte tag;

  ErrorTag(char tag) {
    this.tag = (byte) tag;
  }

  public byte getTag() {
    return tag;
  }

  public static ErrorTag fromTag(byte tag) {
    for (ErrorTag t : values()) {
      if (t.tag == tag) {
        return t;
      }
    }
    return null;
  }
}
