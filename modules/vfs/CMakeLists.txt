#
# Tencent is pleased to support the open source community by making
# Hippy available.
#
# Copyright (C) 2022 THL A29 Limited, a Tencent company.
# All rights reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

cmake_minimum_required(VERSION 3.14)

project("vfs")

set(CMAKE_CXX_STANDARD 17)

if (VOLTRON)
  add_subdirectory(${PROJECT_ROOT_DIR}/modules/vfs/voltron/core)
elseif (ANDROID)
  add_subdirectory(${PROJECT_ROOT_DIR}/modules/vfs/android/src/main/cpp)
elseif (IOS)
  add_subdirectory(${PROJECT_ROOT_DIR}/modules/vfs/ios)
elseif (OHOS)
  add_subdirectory(${PROJECT_ROOT_DIR}/modules/vfs/ohos)
endif ()
