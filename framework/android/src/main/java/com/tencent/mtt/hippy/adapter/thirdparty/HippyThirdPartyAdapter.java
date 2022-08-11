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

package com.tencent.mtt.hippy.adapter.thirdparty;

import org.json.JSONObject;

@SuppressWarnings({"unused"})
public abstract class HippyThirdPartyAdapter {

  public abstract void onRuntimeInit(long runtimeId);

  public abstract void onRuntimeDestroy();

  public abstract String getPackageName();

  public abstract String getAppVersion();

  public abstract void setPageUrl(String url);

  public abstract String getPageUrl();

  public abstract void setExtraData(JSONObject extraData);

  public abstract JSONObject getExtraData();
}
