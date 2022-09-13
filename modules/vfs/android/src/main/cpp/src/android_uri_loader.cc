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

#include "android_vfs/android_uri_loader.h"

#include "android_vfs/uri.h"
#include "footstone/logging.h"


namespace hippy {
inline namespace vfs {

footstone::string_view AndroidUriLoader::GetScheme(const string_view& uri) {
  auto uri_obj = Uri::Create(uri);
  if (!uri_obj) {
    FOOTSTONE_LOG(ERROR) << "uri error, uri = " << uri;
    return string_view();
  }
  return uri_obj->GetScheme();
}

}
}
