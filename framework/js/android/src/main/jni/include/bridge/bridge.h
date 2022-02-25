#pragma once

#include "core/runtime/v8/bridge.h"

#include <memory>

#include "jni/scoped_java_ref.h"

namespace hippy {
  class ADRBridge: public Bridge {
   public:
    ADRBridge(JNIEnv* j_env, jobject j_obj): ref_(std::make_shared<JavaRef>(j_env, j_obj)){}
    virtual ~ADRBridge() = default;
#ifdef ENABLE_INSPECTOR
    virtual void SendResponse(std::unique_ptr<v8_inspector::StringBuffer> message) override;
    virtual void SendNotification(std::unique_ptr<v8_inspector::StringBuffer> message) override;
#endif
    inline jobject GetObj() {
      return ref_->GetObj();
    }
    inline std::shared_ptr<JavaRef> GetRef() {
      return ref_;
    }
   private:
    std::shared_ptr<JavaRef> ref_;
  };
}
