/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#include "oh_napi/oh_napi_object.h"

OhNapiObject::OhNapiObject(ArkTS arkTs, napi_value object) : arkTs_(arkTs), object_(object) {
}

napi_value OhNapiObject::GetProperty(std::string const &key) {
    return arkTs_.GetObjectProperty(object_, key);
}

napi_value OhNapiObject::GetProperty(napi_value key) {
    return arkTs_.GetObjectProperty(object_, key);
}

std::vector<std::pair<napi_value, napi_value>> OhNapiObject::GetKeyValuePairs() {
    return arkTs_.GetObjectProperties(object_);
}

std::vector<std::pair<napi_value, napi_value>> OhNapiObject::GetObjectPrototypeProperties() {
    return arkTs_.GetObjectPrototypeProperties(object_);
}

bool OhNapiObject::isNull() {
    auto type = arkTs_.GetType(object_);
    return type == napi_undefined || type == napi_null;
}
