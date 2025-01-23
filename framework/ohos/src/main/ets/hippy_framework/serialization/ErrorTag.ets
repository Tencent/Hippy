/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
export class ErrorTag {
  static readonly UNKNOWN_TAG = -1;

  static readonly EVAL_ERROR = 'E'.charCodeAt(0); // kEvalErrorPrototype
  static readonly RANGE_ERROR = 'R'.charCodeAt(0); // kRangeErrorPrototype
  static readonly REFERENCE_ERROR = 'F'.charCodeAt(0); // kReferenceErrorPrototype
  static readonly SYNTAX_ERROR = 'S'.charCodeAt(0); // kSyntaxErrorPrototype
  static readonly TYPE_ERROR = 'T'.charCodeAt(0); // kTypeErrorPrototype
  static readonly URI_ERROR = 'U'.charCodeAt(0); // kUriErrorPrototype
  static readonly MESSAGE = 'm'.charCodeAt(0); // kMessage
  static readonly STACK = 's'.charCodeAt(0); // kStack
  static readonly END = '.'.charCodeAt(0); // kEnd

  static fromTag(tag: number): number {
    if (tag != ErrorTag.EVAL_ERROR &&
      tag != ErrorTag.RANGE_ERROR &&
      tag != ErrorTag.REFERENCE_ERROR &&
      tag != ErrorTag.SYNTAX_ERROR &&
      tag != ErrorTag.TYPE_ERROR &&
      tag != ErrorTag.URI_ERROR &&
      tag != ErrorTag.MESSAGE &&
      tag != ErrorTag.STACK &&
      tag != ErrorTag.END) {
      return ErrorTag.UNKNOWN_TAG
    }
    return tag
  }
}
