
#include "hippy-native-global.h"  // NOLINT(build/include_subdir)

#include <stdio.h>

#include "core/base/logging.h"
#include "exception-handler.h"  // NOLINT(build/include_subdir)
#include "jni-env.h"            // NOLINT(build/include_subdir)

void HippyNativeGlobal::registerGlobal(const char* char_globalConfig,
                                       V8Runtime* runtime) {
  if (char_globalConfig == nullptr || runtime == nullptr) {
    return;
  }

  v8::Isolate* isolate = runtime->isolate;
  v8::HandleScope handle_scope(isolate);
  v8::Local<v8::Context> context =
      v8::Local<v8::Context>::New(isolate, isolate->GetCurrentContext());
  if (context.IsEmpty()) {
    return;
  }

  v8::Context::Scope context_scope(context);
  //v8::TryCatch try_catch(isolate);

  v8::Handle<v8::Object> global = context->Global();
  v8::Handle<v8::Value> JSON =
      global->Get(v8::String::NewFromUtf8(isolate, "JSON"));
  v8::Handle<v8::Value> jsonParseFun = v8::Handle<v8::Object>::Cast(JSON)->Get(
      v8::String::NewFromUtf8(isolate, "parse"));
  v8::Handle<v8::String> v8GlobalConfig =
      v8::String::NewFromUtf8(isolate, char_globalConfig);
  v8::Handle<v8::Value> argv[1] = {v8GlobalConfig};
  v8::Handle<v8::Value> jsonObj =
      v8::Handle<v8::Function>::Cast(jsonParseFun)->Call(JSON, 1, argv);

  if (!jsonObj.IsEmpty()) {
    global->Set(v8::String::NewFromUtf8(isolate, "__HIPPYNATIVEGLOBAL__"),
                jsonObj);
  } else {
    HIPPY_LOG(hippy::Error, "registerGlobal failed");
    ExceptionHandler exception;
    exception.JSONException(runtime, char_globalConfig);
  }
}
