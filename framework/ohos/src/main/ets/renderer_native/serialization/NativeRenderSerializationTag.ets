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
export class NativeRenderSerializationTag {
  static readonly TRUE_OBJECT = 'y'.charCodeAt(0);
  static readonly FALSE_OBJECT = 'x'.charCodeAt(0);
  static readonly NUMBER_OBJECT = 'n'.charCodeAt(0);
  static readonly BIG_INT_OBJECT = 'z'.charCodeAt(0);
  static readonly STRING_OBJECT = 's'.charCodeAt(0);
  static readonly BEGIN_MAP = ';'.charCodeAt(0);
  static readonly END_MAP = ':'.charCodeAt(0);
  static readonly BEGIN_OBJECT = 'o'.charCodeAt(0);
  static readonly END_OBJECT = '{'.charCodeAt(0);
  static readonly BEGIN_DENSE_ARRAY = 'A'.charCodeAt(0);
  static readonly END_DENSE_ARRAY = '$'.charCodeAt(0);
  static readonly BEGIN_SPARSE_JS_ARRAY = 'a'.charCodeAt(0); // kBeginSparseJSArray
  static readonly END_SPARSE_JS_ARRAY = '@'.charCodeAt(0); // kEndSparseJSArray
}
