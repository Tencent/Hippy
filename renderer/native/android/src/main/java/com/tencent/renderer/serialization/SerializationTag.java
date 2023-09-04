/*
 * Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2022 THL A29 Limited, a Tencent company. All rights reserved.
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
 *
 */
package com.tencent.renderer.serialization;

public interface SerializationTag {
  byte TRUE_OBJECT = (byte) 'y';
  byte FALSE_OBJECT = (byte) 'x';
  byte NUMBER_OBJECT = (byte) 'n';
  byte BIG_INT_OBJECT = (byte) 'z';
  byte STRING_OBJECT = (byte) 's';
  byte BEGIN_MAP = (byte) ';';
  byte END_MAP = (byte) ':';
  byte BEGIN_OBJECT = (byte) 'o';
  byte END_OBJECT = (byte) '{';
  byte BEGIN_DENSE_ARRAY = (byte) 'A';
  byte END_DENSE_ARRAY = (byte) '$';
  byte BEGIN_SPARSE_JS_ARRAY = (byte) 'a'; // kBeginSparseJSArray
  byte END_SPARSE_JS_ARRAY = (byte) '@'; // kEndSparseJSArray
}
