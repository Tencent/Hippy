//
// Created by howlpan on 2019/4/18.
//

#include "exception-handler.h"  // NOLINT(build/include_subdir)
#include "jni-env.h"    // NOLINT(build/include_subdir)
#include "jni-utils.h"  // NOLINT(build/include_subdir)
#include "core/base/logging.h"

void ExceptionHandler::reportJsException(v8::Isolate* isolate,
                                         std::stringstream& description_stream,
                                         std::stringstream& stack_stream) {
  v8::HandleScope handle_scope(isolate);
  v8::Local<v8::Context> context = isolate->GetCurrentContext();
  v8::Context::Scope context_scope(context);

  JNIEnv* env = JNIEnvironment::AttachCurrentThread();

  jstring jException = env->NewStringUTF(description_stream.str().c_str());
  jstring jStackTrace = env->NewStringUTF(stack_stream.str().c_str());

  v8::Local<v8::Value> cached_data = context->GetEmbedderData(0);
  if (!cached_data.IsEmpty())
  {
    V8Runtime* runtime =
        static_cast<V8Runtime*>(v8::External::Cast(*cached_data)->Value());
    env->CallVoidMethod(
        runtime->hippyBridge,
        JNIEnvironment::getInstance()->wrapper.reportExceptionMethodID,
        jException, jStackTrace);
  } else {
    HIPPY_LOG(hippy::Error, "reportJsException cached_data is empty");
  }

  // delete local ref
  env->DeleteLocalRef(jException);
  env->DeleteLocalRef(jStackTrace);
}

void ExceptionHandler::JSONException(V8Runtime* runtime, const char* jsonValue) {
  if (runtime == NULL) {
    return;
  }

  if (jsonValue == NULL) {
    return;
  }

  JNIEnv* env = JNIEnvironment::AttachCurrentThread();

  jstring jException = env->NewStringUTF("Hippy Bridge parse json error");
  jstring jStackTrace = env->NewStringUTF(jsonValue);

  // call function
  env->CallVoidMethod(runtime->hippyBridge, JNIEnvironment::getInstance()->wrapper.reportExceptionMethodID, jException, jStackTrace);

  // delete local ref
  env->DeleteLocalRef(jException);
  env->DeleteLocalRef(jStackTrace);
}
