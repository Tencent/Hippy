//
// Created by howlpan on 2019/4/17.
//

#ifndef RUNTIME_H_
#define RUNTIME_H_

#include <jni.h>

#include "core/napi/js-native-api.h"
#include "third_party/v8/v8-inspector.h"
#include "third_party/v8/v8-profiler.h"
#include "third_party/v8/v8.h"

class Environment;
class Engine;

typedef struct V8Runtime_ {
  v8::Isolate* isolate;
  // v8::Persistent<v8::Context> context;
  jobject hippyBridge;
  bool bridgeParamJson;
  v8::Persistent<v8::Function> hippyBridgeJSFunc;
  std::weak_ptr<Engine> pEngine;
  std::weak_ptr<Environment> env;
  bool bIsDevModule = false;
} V8Runtime;

#endif  // RUNTIME_H_
