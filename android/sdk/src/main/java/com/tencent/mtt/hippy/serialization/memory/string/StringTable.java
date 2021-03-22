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

import com.tencent.mtt.hippy.serialization.StringLocation;

import java.io.UnsupportedEncodingException;

public interface StringTable {
  public String lookup(char[] chars, StringLocation location, Object relatedKey);
  public String lookup(byte[] bytes, String encoding, StringLocation location, Object relatedKey) throws UnsupportedEncodingException;
  public void release();
}
