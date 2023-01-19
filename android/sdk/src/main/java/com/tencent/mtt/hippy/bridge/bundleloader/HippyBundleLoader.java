/* Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2018 THL A29 Limited, a Tencent company. All rights reserved.
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
package com.tencent.mtt.hippy.bridge.bundleloader;

import com.tencent.mtt.hippy.bridge.HippyBridge;
import com.tencent.mtt.hippy.bridge.NativeCallback;

@SuppressWarnings({"unused"})
public interface HippyBundleLoader {

  void load(HippyBridge bridge, NativeCallback callback);

  String getPath();

  String getRawPath();

  String getBundleUniKey();

  boolean canUseCodeCache();

  String getCodeCacheTag();

  String getUri();
}
