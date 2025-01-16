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
export enum StringLocation {
  TOP_LEVEL,
  OBJECT_KEY,
  MAP_KEY,
  SPARSE_ARRAY_KEY,
  DENSE_ARRAY_KEY,
  OBJECT_VALUE,
  MAP_VALUE,
  SPARSE_ARRAY_ITEM,
  DENSE_ARRAY_ITEM,
  SET_ITEM,
  ERROR_MESSAGE,
  ERROR_STACK,
  REGEXP,
  VOID
}
