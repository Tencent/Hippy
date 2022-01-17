//
// Copyright (c) 2020 Tencent Corporation. All rights reserved.
//

#define WEAK_THIS weak_this = weak_from_this()
#define SHARED_THIS self = this->shared_from_this()
// 表明该lambda不会被存储，可以安全使用this
#define THIS_NO_STORE this
#define HAS_SELF(type) auto self = std::static_pointer_cast<type>(weak_this.lock())
#define DEFINE_SELF(type) HAS_SELF(type);
#define DEFINE_AND_CHECK_SELF(type) \
  DEFINE_SELF(type)                 \
  if (!self) {                      \
    return;                         \
  }
