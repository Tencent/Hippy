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


#include "ios_loader.h"

#include "core/core.h"


IOSLoader::IOSLoader(NormalizeFuncPtr normalize, LoadFuncPtr load): normalize_(normalize), load_(load) {}
IOSLoader::IOSLoader(const std::string& base) : base_(base) {}

std::string IOSLoader::Normalize(const std::string& uri) {
  return normalize_(uri);
}

std::string IOSLoader::Load(const std::string& uri) {
  return load_(uri);
}
