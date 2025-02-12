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

#include "oh_napi/oh_napi_object_builder.h"
#include <bits/alltypes.h>

OhNapiObjectBuilder::OhNapiObjectBuilder(napi_env env, ArkTS arkTs) : arkTs_(arkTs), env_(env) {
    napi_value obj;
    napi_create_object(env, &obj);
    object_ = obj;
}

OhNapiObjectBuilder::OhNapiObjectBuilder(napi_env env, ArkTS arkTs, napi_value object) : arkTs_(arkTs), env_(env), object_(object) {}

OhNapiObjectBuilder &OhNapiObjectBuilder::AddProperty(const char *name, napi_value value) {
    napi_set_named_property(env_, object_, name, value);
    return *this;
}

OhNapiObjectBuilder &OhNapiObjectBuilder::AddProperty(const char *name, bool value) {
    napi_set_named_property(env_, object_, name, arkTs_.CreateBoolean(value));
    return *this;
}

OhNapiObjectBuilder &OhNapiObjectBuilder::AddProperty(const char *name, int value) {
    napi_set_named_property(env_, object_, name, arkTs_.CreateInt(value));
    return *this;
}

OhNapiObjectBuilder &OhNapiObjectBuilder::AddProperty(const char *name, uint32_t value) {
    napi_set_named_property(env_, object_, name, arkTs_.CreateUint32(value));
    return *this;
}

OhNapiObjectBuilder &OhNapiObjectBuilder::AddProperty(const char *name, float value) {
    napi_set_named_property(env_, object_, name, arkTs_.CreateDouble(value));
    return *this;
}

OhNapiObjectBuilder &OhNapiObjectBuilder::AddProperty(const char *name, char const *value) {
    napi_set_named_property(env_, object_, name, arkTs_.CreateString(value));
    return *this;
}

OhNapiObjectBuilder &OhNapiObjectBuilder::AddProperty(const char *name, std::string value) {
    napi_set_named_property(env_, object_, name, arkTs_.CreateString(value));
    return *this;
}

OhNapiObjectBuilder &OhNapiObjectBuilder::AddProperty(const char *name, std::array<float, 16> matrix) {
    napi_value n_value;
    napi_create_array_with_length(env_, matrix.size(), &n_value);

    for (std::size_t i = 0; i < matrix.size(); ++i) {
        napi_set_element(env_, n_value, static_cast<uint32_t>(i), arkTs_.CreateDouble(matrix[i]));
    }

    napi_set_named_property(env_, object_, name, n_value);
    return *this;
}

napi_value OhNapiObjectBuilder::Build() {
    return object_;
}
