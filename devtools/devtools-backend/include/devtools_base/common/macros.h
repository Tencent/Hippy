//
// Copyright (c) Tencent Corporation. All rights reserved.
//

#pragma once

#define TDF_BASE_DISALLOW_COPY_AND_ASSIGN(TypeName) \
  TypeName(const TypeName&) = delete;               \
  TypeName& operator=(const TypeName&) = delete
