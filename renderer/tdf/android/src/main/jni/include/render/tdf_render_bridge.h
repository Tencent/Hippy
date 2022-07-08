#pragma once

#include <memory>
#include <jni.h>
#include "core/scope.h"

class TDFRenderBridge {
 public:
  static void Init(JavaVM* j_vm, __unused void* reserved);

  static void Destroy();

  // TODO: need a better implementation.
  static void RegisterScopeForUriLoader(uint32_t render_id, const std::shared_ptr<Scope>& scope);
};

