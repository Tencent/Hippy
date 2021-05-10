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
 *     http://www.apache.org/licenses/LICENSE_2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#pragma once

#include "bridge/entry.h"
#include "bridge/java2js.h"
#include "bridge/js2java.h"
#include "bridge/runtime.h"
#include "bridge/serializer.h"
#include "inspector/v8_channel_impl.h"
#include "inspector/v8_inspector_client_impl.h"
#include "jni/exception_handler.h"
#include "jni/jni_env.h"
#include "jni/jni_register.h"
#include "jni/jni_utils.h"
#include "jni/scoped_java_ref.h"
#include "loader/adr_loader.h"
#include "v8/v8.h"
