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

#pragma once

#include <cstdlib>
#include <cstring>
#include <string>

namespace voltron {
char16_t *CopyChar16(const char16_t *source_char, int length);

char16_t *CopyCharToChar16(const char *source_char, int length);

char *CopyCharToChar(const char *source_char, int length);

uint8_t *CopyBytes(const uint8_t *source_bytes, int length);

void ReleaseCopy(void *copy_pointer);

std::string C16CharToString(const char16_t *source_char);
}
