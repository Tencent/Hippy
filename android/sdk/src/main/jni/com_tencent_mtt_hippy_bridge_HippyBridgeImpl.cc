/* Tencent is pleased to support the open source community by making Hippy
 * available. Copyright (C) 2018 THL A29 Limited, a Tencent company. All rights
 * reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#include "com_tencent_mtt_hippy_bridge_HippyBridgeImpl.h"  // NOLINT(build/include)

#include <android/asset_manager.h>
#include <android/asset_manager_jni.h>
#include <jni.h>

#include "code-cache-runnable.h"      // NOLINT(build/include_subdir)
#include "code-cache-sanity-check.h"  // NOLINT(build/include_subdir)
#include "core/base/logging.h"
#include "core/base/macros.h"
#include "core/engine-impl.h"
#include "core/engine.h"
#include "core/environment.h"
#include "core/napi/v8/js-native-api-v8.h"
#include "core/task/javascript-task-runner.h"
#include "core/task/javascript-task.h"
#include "exception-handler.h"    // NOLINT(build/include_subdir)
#include "hippy-buffer.h"         // NOLINT(build/include_subdir)
#include "hippy-native-global.h"  // NOLINT(build/include_subdir)
#include "inspector/v8-inspector-client-impl.h"
#include "jni-env.h"    // NOLINT(build/include_subdir)
#include "jni-utils.h"  // NOLINT(build/include_subdir)
#include "runtime.h"    // NOLINT(build/include_subdir)
#include "scoped-java-ref.h"
#include "third_party/md5.h"

using namespace v8;
namespace napi = ::hippy::napi;
std::string LucasTestBussinessCalledCache;

namespace {
void CallJavaMethod(jobject obj, jlong value) {
  jclass javaClass = nullptr;

  do {
    if (!obj)
      break;

    javaClass = JNIEnvironment::AttachCurrentThread()->GetObjectClass(obj);
    if (!javaClass)
      break;

    jmethodID javaCallbackId =
        JNIEnvironment::AttachCurrentThread()->GetMethodID(javaClass,
                                                           "Callback", "(J)V");
    if (!javaCallbackId)
      break;

    JNIEnvironment::AttachCurrentThread()->CallVoidMethod(obj, javaCallbackId,
                                                          value);
    JNIEnvironment::clearJEnvException(JNIEnvironment::AttachCurrentThread());
  } while (0);

  if (javaClass) {
    JNIEnvironment::AttachCurrentThread()->DeleteLocalRef(javaClass);
  }
}
}  // namespace

bool runScript(const char* script,
               const char* script_name,
               jboolean canUseCodeCache,
               const char* codeCacheDir,
               jlong v8RuntimePtr);

static void v8CallNatives(const v8::FunctionCallbackInfo<v8::Value>& info) {
  auto data = info.Data().As<v8::External>();
  V8Runtime* runtime = static_cast<V8Runtime*>(data->Value());
  if (runtime == nullptr) {
    return;
  }

  v8::Isolate* isolate = info.GetIsolate();
  if (isolate == nullptr) {
    return;
  }
  v8::HandleScope handle_scope(isolate);

  v8::Local<v8::Context> context = isolate->GetCurrentContext();
  if (context.IsEmpty()) {
    HIPPY_LOG(hippy::Error, "v8CallNatives context empty");
    return;
  }

  v8::Context::Scope context_scope(context);

  jstring jModuleName = NULL;
  if (info.Length() >= 1 && !info[0].IsEmpty()) {
    v8::String::Utf8Value moduleName(isolate, info[0]);
    jModuleName = JNIEnvironment::AttachCurrentThread()->NewStringUTF(
        JniUtils::ToCString(moduleName));
  }

  jstring jModuleFunc = NULL;
  if (info.Length() >= 2 && !info[1].IsEmpty()) {
    v8::String::Utf8Value moduleFunc(isolate, info[1]);
    jModuleFunc = JNIEnvironment::AttachCurrentThread()->NewStringUTF(
        JniUtils::ToCString(moduleFunc));

    // for debug
    /*if (!info[0].IsEmpty()) {
      v8::String::Utf8Value moduleName(isolate, info[0]);
      HIPPY_LOG(hippy::Debug, "v8CallNatives module=%s func=%s loadInstances=%s",
                JniUtils::ToCString(moduleName),
                JniUtils::ToCString(moduleFunc),
		  LucasTestBussinessCalledCache.c_str());
    }*/
  }

  jstring jCallId = NULL;
  if (info.Length() >= 3 && !info[2].IsEmpty()) {
    v8::String::Utf8Value callId(isolate, info[2]);
    jCallId = JNIEnvironment::AttachCurrentThread()->NewStringUTF(
        JniUtils::ToCString(callId));
  }

  jbyteArray jParamsStr = NULL;
  HippyBuffer* hippyBuffer = NULL;
  if (info.Length() >= 4 && !info[3].IsEmpty() && info[3]->IsObject()) {
    if (!runtime->bridgeParamJson) {
      JniUtils utils;
      hippyBuffer =
          utils.writeToBuffer(isolate, v8::Local<v8::Object>::Cast(info[3]));
      if (hippyBuffer != NULL && hippyBuffer->data != NULL) {
        jParamsStr = JNIEnvironment::AttachCurrentThread()->NewByteArray(
            hippyBuffer->position);
        JNIEnvironment::AttachCurrentThread()->SetByteArrayRegion(
            jParamsStr, 0, hippyBuffer->position,
            reinterpret_cast<const jbyte*>(hippyBuffer->data));
      }
    } else {
      v8::Handle<v8::Object> global = context->Global();
      v8::Handle<v8::Value> JSON =
          global->Get(v8::String::NewFromUtf8(context->GetIsolate(), "JSON"));
      v8::Handle<v8::Value> fun = v8::Handle<v8::Object>::Cast(JSON)->Get(
          v8::String::NewFromUtf8(context->GetIsolate(), "stringify"));
      v8::Handle<v8::Value> argv[1] = {info[3]};
      v8::Handle<v8::Value> s =
          v8::Handle<v8::Function>::Cast(fun)->Call(JSON, 1, argv);

      v8::String::Utf8Value json(isolate, s);
      int strLen = strlen(JniUtils::ToCString(json));
      jParamsStr = JNIEnvironment::AttachCurrentThread()->NewByteArray(strLen);
      JNIEnvironment::AttachCurrentThread()->SetByteArrayRegion(
          jParamsStr, 0, strLen,
          reinterpret_cast<const jbyte*>(JniUtils::ToCString(json)));
    }
  }

  JNIEnvironment::AttachCurrentThread()->CallVoidMethod(
      runtime->hippyBridge,
      JNIEnvironment::getInstance()->wrapper.callNativesMethodID, jModuleName,
      jModuleFunc, jCallId, jParamsStr);

  JNIEnvironment::clearJEnvException(JNIEnvironment::AttachCurrentThread());

  // delete local ref
  JNIEnvironment::AttachCurrentThread()->DeleteLocalRef(jModuleName);
  JNIEnvironment::AttachCurrentThread()->DeleteLocalRef(jModuleFunc);
  JNIEnvironment::AttachCurrentThread()->DeleteLocalRef(jCallId);
  JNIEnvironment::AttachCurrentThread()->DeleteLocalRef(jParamsStr);
  if (hippyBuffer != NULL) {
    releaseBuffer(hippyBuffer);
  }
  hippyBuffer = NULL;
}

JNIEXPORT jlong JNICALL
Java_com_tencent_mtt_hippy_bridge_HippyBridgeImpl_initJSFramework(
    JNIEnv* env,
    jobject object,
    jbyteArray globalConfig,
    jboolean singleThreadMode,
    jboolean bridgeParamJson,
    jboolean isDevModule,
    jobject jcallback,
    jlong groupId) {
  V8Runtime* runtime = new V8Runtime();
  runtime->pEngine = EngineImpl::instance()->CreateEngine(
      isDevModule ? EngineImpl::kDebuggerEngineId : groupId);

  runtime->hippyBridge = env->NewGlobalRef(object);
  runtime->bIsDevModule = isDevModule;

  if (bridgeParamJson) {
    runtime->bridgeParamJson = true;
  } else {
    runtime->bridgeParamJson = false;
  }

  auto char_globalConfig = JniUtils::ConvertJByteArrayToString(env, globalConfig, 0, 0);

  std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
  std::shared_ptr<JavaRef> save_object =
      std::make_shared<JavaRef>(env, jcallback);
  task->callback = [runtime, char_globalConfig = std::move(char_globalConfig),
                    save_object_ = std::move(save_object)] {
    //HIPPY_LOG(hippy::Debug, "initJSFramework enter task");

    if (runtime->pEngine.lock()) {
      runtime->env = runtime->pEngine.lock()->CreateEnvironment("");
    }
    std::shared_ptr<Environment> environment = runtime->env.lock();
    napi::napi_context napi_ctx = nullptr;
    if (environment) {
      napi_ctx = environment->getContext();
    }
    if (napi_ctx == nullptr) {
      CallJavaMethod(save_object_->obj(), 0);
      return;
    }

    v8::Isolate* isolate = napi_ctx->isolate_;
    v8::HandleScope handle_scope(isolate);

    runtime->isolate = isolate;
    v8::Local<v8::Context> context =
        v8::Local<v8::Context>::New(isolate, napi_ctx->context_persistent);
    v8::Context::Scope context_scope(context);
    v8::Local<v8::Object> globalObject = context->Global();
    context->SetEmbedderData(0, v8::External::New(isolate, (void*)runtime));

    // for v8 inspector debug
    if (runtime->bIsDevModule) {
      //HIPPY_LOG(hippy::Debug, "initJSFramework init inspector for debug");
      V8InspectorClientImpl::initInspectorClient(runtime);
    }

    v8::Local<v8::FunctionTemplate> functionTemplate =
        v8::FunctionTemplate::New(isolate, v8CallNatives,
                                  v8::External::New(isolate, (void*)runtime));
    functionTemplate->RemovePrototype();
    globalObject->Set(v8::String::NewFromUtf8(isolate, "hippyCallNatives"),
                      functionTemplate->GetFunction());

    HippyNativeGlobal::registerGlobal(char_globalConfig.c_str(), runtime);

    // load bootstrap.js after load config
    if (environment) {
      environment->loadModules();
    }

    jlong value = reinterpret_cast<jlong>(runtime);
    CallJavaMethod(save_object_->obj(), value);

    //HIPPY_LOG(hippy::Debug, "initJSFramework leave task");
  };

  if (runtime->pEngine.lock()) {
    runtime->pEngine.lock()->jsRunner()->postTask(task);
  }

  //HIPPY_LOG(hippy::Debug, "initJSFramework end");

  return reinterpret_cast<jlong>(runtime);
}

JNIEXPORT jboolean JNICALL
Java_com_tencent_mtt_hippy_bridge_HippyBridgeImpl_runScriptFromFile(
    JNIEnv* env,
    jobject obj,
    jstring filePath,
    jstring scriptName,
    jboolean canUseCodeCache,
    jstring codeCacheDir,
    jlong v8RuntimePtr,
    jobject jcallback) {
  //HIPPY_LOG(hippy::Debug, "runScriptFromFile start");

  /*auto time1 = std::chrono::time_point_cast<std::chrono::milliseconds>(
                    std::chrono::system_clock::now())
                    .time_since_epoch().count();*/

  if (v8RuntimePtr == 0) {
    return false;
  }

  auto str_filePath = JniUtils::ConvertJStrToString(env, filePath);
  auto str_scriptName = JniUtils::ConvertJStrToString(env, scriptName);
  auto str_codeCacheDir = JniUtils::ConvertJStrToString(env, codeCacheDir);

  env->DeleteLocalRef(filePath);
  env->DeleteLocalRef(scriptName);
  env->DeleteLocalRef(codeCacheDir);

  V8Runtime* runtime = reinterpret_cast<V8Runtime*>(v8RuntimePtr);
  std::shared_ptr<JavaRef> save_object =
      std::make_shared<JavaRef>(env, jcallback);
  std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
  task->callback = [v8RuntimePtr, save_object_ = std::move(save_object),
                    str_filePath = std::move(str_filePath), str_scriptName = std::move(str_scriptName),
                    str_codeCacheDir = std::move(str_codeCacheDir), canUseCodeCache] {
    //HIPPY_LOG(hippy::Debug, "runScriptFromFile enter tast");

	/*auto time2 = std::chrono::time_point_cast<std::chrono::milliseconds>(
                     std::chrono::system_clock::now())
                     .time_since_epoch()
                     .count();*/

    std::vector<char> buf;
    {
      std::ifstream jsfile(str_filePath);
      if (jsfile) {
        jsfile.seekg(0, std::ios::end);
        buf.resize(static_cast<size_t>(jsfile.tellg()) + 1);
        jsfile.seekg(0, std::ios::beg);
        jsfile.read(buf.data(), buf.size());
        buf.back() = 0;
        jsfile.close();
      } else {
        return false;
      }
    }

	/*auto time3 = std::chrono::time_point_cast<std::chrono::milliseconds>(
                     std::chrono::system_clock::now())
                     .time_since_epoch()
                     .count();*/

    bool flag = runScript(buf.data(), str_scriptName.c_str(), canUseCodeCache,
                          str_codeCacheDir.c_str(), v8RuntimePtr);

	/*auto time4 = std::chrono::time_point_cast<std::chrono::milliseconds>(
                     std::chrono::system_clock::now())
                     .time_since_epoch()
                     .count();*/

    jlong value = flag == false ? 0 : 1;
    CallJavaMethod(save_object_->obj(), value);

    //HIPPY_LOG(hippy::Debug, "runScriptFromFile leave tast");

	/*auto time5 = std::chrono::time_point_cast<std::chrono::milliseconds>(
                     std::chrono::system_clock::now())
                     .time_since_epoch()
                     .count();*/

	//HIPPY_LOG(hippy::Debug, "LucasTimeTest pre_time=%d load_js=%d run_js=%d after_time=%d total=%d", time2-time1, time3-time2, time4-time3, time5-time4, time5-time1);

    return flag;
  };

  std::shared_ptr<Engine> engine = runtime->pEngine.lock();
  if (engine) {
    engine->jsRunner()->postTask(task);
  }

  //HIPPY_LOG(hippy::Debug, "runScriptFromFile end");

  return true;
}

JNIEXPORT jboolean JNICALL
Java_com_tencent_mtt_hippy_bridge_HippyBridgeImpl_runScriptFromAssets(
    JNIEnv* env,
    jobject obj,
    jstring assetName,
    jobject assetManager,
    jboolean canUseCodeCache,
    jstring codeCacheDir,
    jlong v8RuntimePtr,
    jobject jcallback) {
  //HIPPY_LOG(hippy::Debug, "runScriptFromAssets start");

  if (v8RuntimePtr == 0) {
    return false;
  }

  auto char_assetName = JniUtils::ConvertJStrToString(env, assetName);
  auto char_codeCacheDir = JniUtils::ConvertJStrToString(env, codeCacheDir);

  env->DeleteLocalRef(assetName);
  env->DeleteLocalRef(codeCacheDir);

  AAssetManager* aassetManager = AAssetManager_fromJava(env, assetManager);
  V8Runtime* runtime = reinterpret_cast<V8Runtime*>(v8RuntimePtr);

  std::shared_ptr<JavaRef> save_object =
      std::make_shared<JavaRef>(env, jcallback);
  std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
  task->callback = [v8RuntimePtr, save_object_ = std::move(save_object),
                    aassetManager, canUseCodeCache, char_assetName = std::move(char_assetName),
                    char_codeCacheDir = std::move(char_codeCacheDir)] {
    //HIPPY_LOG(hippy::Debug, "runScriptFromAssets enter task");

    std::vector<char> buf;
    if (aassetManager) {
      auto asset = AAssetManager_open(aassetManager, char_assetName.c_str(),
                                      AASSET_MODE_STREAMING);
      if (asset) {
        buf.resize(AAsset_getLength(asset) + 1);
        size_t offset = 0;
        int readbytes;
        while ((readbytes = AAsset_read(asset, buf.data() + offset,
                                        buf.size() - offset)) > 0) {
          offset += readbytes;
        }
        buf.back() = 0;
        AAsset_close(asset);
      } else {
        CallJavaMethod(save_object_->obj(), 0);
        return;
      }
    } else {
      CallJavaMethod(save_object_->obj(), 0);
      return;
    }

    bool flag = runScript(buf.data(), char_assetName.c_str(), canUseCodeCache,
                          char_codeCacheDir.c_str(), v8RuntimePtr);

    jlong value = flag == true ? 1 : 0;
    CallJavaMethod(save_object_->obj(), value);

    //HIPPY_LOG(hippy::Debug, "runScriptFromAssets leave task");
  };

  std::shared_ptr<Engine> engine = runtime->pEngine.lock();
  if (engine) {
    engine->jsRunner()->postTask(task);
  }

  //HIPPY_LOG(hippy::Debug, "runScriptFromAssets end");

  return true;
}

JNIEXPORT void JNICALL
Java_com_tencent_mtt_hippy_bridge_HippyBridgeImpl_callFunction(
    JNIEnv* env,
    jobject obj,
    jstring action,
    jbyteArray params,
    jint offset,
    jint length,
    jlong v8RuntimePtr,
    jobject jcallback) {
  if (v8RuntimePtr == 0) {
    return;
  }

  V8Runtime* runtime = reinterpret_cast<V8Runtime*>(v8RuntimePtr);
  auto char_action = JniUtils::ConvertJStrToString(env, action);

  env->DeleteLocalRef(action);

  auto str_params = JniUtils::ConvertJByteArrayToString(env, params, offset, length);

  std::shared_ptr<JavaRef> save_object =
      std::make_shared<JavaRef>(env, jcallback);
  std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
  task->callback = [runtime, save_object_ = std::move(save_object),
                    char_action = std::move(char_action), str_params = std::move(str_params)] {
    if (runtime->isolate == NULL) {
      CallJavaMethod(save_object_->obj(), 0);
      return;
    }

    v8::Isolate* isolate = runtime->isolate;
    v8::HandleScope handle_scope(isolate);

    napi::napi_context napi_ctx = nullptr;
    std::shared_ptr<Environment> environment = runtime->env.lock();
    if (environment) {
      napi_ctx = environment->getContext();
    }
    if (napi_ctx == nullptr) {
      CallJavaMethod(save_object_->obj(), 0);
      return;
    }

    v8::Local<v8::Context> context =
        v8::Local<v8::Context>::New(isolate, napi_ctx->context_persistent);
    v8::Context::Scope context_scope(context);

    if (runtime->bIsDevModule && (char_action == "onWebsocketMsg")) {
      V8InspectorClientImpl::sendMessageToV8(str_params.c_str());
    } else {
      if (runtime->hippyBridgeJSFunc.IsEmpty()) {
        v8::Local<v8::String> hippyBridgeStr =
            v8::String::NewFromUtf8(isolate, "hippyBridge");
        v8::Local<v8::Value> hippyBridgeJS =
            context->Global()->Get(hippyBridgeStr);
        runtime->hippyBridgeJSFunc.Reset(
            isolate, v8::Local<v8::Function>::Cast(hippyBridgeJS));
      }

      v8::Handle<v8::String> paramsValue =
          v8::String::NewFromUtf8(isolate, str_params.c_str());
      v8::Handle<v8::String> actionValue =
          v8::String::NewFromUtf8(isolate, char_action.c_str());

      v8::Handle<v8::Object> global = context->Global();
      v8::Handle<v8::Value> JSON =
          global->Get(v8::String::NewFromUtf8(isolate, "JSON"));
      v8::Handle<v8::Value> jsonParseFun =
          v8::Handle<v8::Object>::Cast(JSON)->Get(
              v8::String::NewFromUtf8(isolate, "parse"));
      v8::Handle<v8::Value> argv[1] = {paramsValue};

      v8::Handle<v8::Value> jsonObj =
          v8::Handle<v8::Function>::Cast(jsonParseFun)->Call(JSON, 1, argv);
      if (!jsonObj.IsEmpty()) {
        v8::Handle<v8::Value> result;
        v8::Handle<v8::Value> args[] = {actionValue, jsonObj};
        v8::Local<v8::Function> fun =
            v8::Local<v8::Function>::New(isolate, runtime->hippyBridgeJSFunc);
        if (!fun.IsEmpty()) {
          result = fun->Call(fun, arraysize(args), args);
        }

        // for debug
        if (char_action == "loadInstance") {
          size_t len = str_params.find("\"id") - 11;
          LucasTestBussinessCalledCache = str_params.substr(9, len) +
                                          std::string(" ") +
                                          LucasTestBussinessCalledCache;
          if (LucasTestBussinessCalledCache.length() >= 160) {
            LucasTestBussinessCalledCache =
                LucasTestBussinessCalledCache.substr(0, 160);
          }
        }
      } else {
        ExceptionHandler exception;
        exception.JSONException(runtime, str_params.c_str());
      }
    }

    CallJavaMethod(save_object_->obj(), 1);
  };

  std::shared_ptr<Engine> engine = runtime->pEngine.lock();
  if (engine) {
    engine->jsRunner()->postTask(task);
  }
}

JNIEXPORT void JNICALL
Java_com_tencent_mtt_hippy_bridge_HippyBridgeImpl_runNativeRunnable(
    JNIEnv* env,
    jobject object,
    jstring codeCachePath,
    jlong runnableId,
    jlong v8RuntimePtr,
    jobject jcallback) {
  //HIPPY_LOG(hippy::Debug, "runNativeRunnable start");

  auto char_codeCachePath = JniUtils::ConvertJStrToString(env, codeCachePath);
  env->DeleteLocalRef(codeCachePath);

  V8Runtime* runtime = reinterpret_cast<V8Runtime*>(v8RuntimePtr);

  std::shared_ptr<JavaRef> save_object =
      std::make_shared<JavaRef>(env, jcallback);
  std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
  task->callback = [char_codeCachePath = std::move(char_codeCachePath),
                    save_object_ = std::move(save_object), runnableId] {
    //HIPPY_LOG(hippy::Debug, "runNativeRunnable enter task");

    if (runnableId == 0) {
      CallJavaMethod(save_object_->obj(), 0);
      return;
    }

    CodeCacheRunnable* runnable =
        reinterpret_cast<CodeCacheRunnable*>(runnableId);

    if (runnable) {
      runnable->run(char_codeCachePath.c_str());
      delete runnable;
    }
    runnable = NULL;

    CallJavaMethod(save_object_->obj(), 1);

    //HIPPY_LOG(hippy::Debug, "runNativeRunnable leave task");
  };

  std::shared_ptr<Engine> engine = runtime->pEngine.lock();
  if (engine) {
    engine->jsRunner()->postTask(task);
  }

  //HIPPY_LOG(hippy::Debug, "runNativeRunnable end");
}

JNIEXPORT jstring JNICALL
Java_com_tencent_mtt_hippy_bridge_HippyBridgeImpl_getCrashMessage(JNIEnv* env, jobject object)
{
  return env->NewStringUTF("lucas_crash_report_test");
}

JNIEXPORT void JNICALL
Java_com_tencent_mtt_hippy_bridge_HippyBridgeImpl_destroy(
    JNIEnv* env,
    jobject object,
    jlong v8RuntimePtr,
    jboolean singleThreadMode,
    jobject jcallback) {
  if (v8RuntimePtr == 0) {
    return;
  }

  //HIPPY_LOG(hippy::Debug, "destroy start");

  V8Runtime* runtime = reinterpret_cast<V8Runtime*>(v8RuntimePtr);
  std::shared_ptr<Engine> engine = runtime->pEngine.lock();
  if (engine) {
    engine->UnRefEnvironment();
  }

  std::shared_ptr<JavaRef> save_object =
      std::make_shared<JavaRef>(env, jcallback);
  std::shared_ptr<JavaScriptTask> task = std::make_shared<JavaScriptTask>();
  task->callback = [runtime, save_object_ = std::move(save_object)] {
    if (runtime->bIsDevModule) {
      V8InspectorClientImpl::onContextDestroyed(runtime);
    }

    //HIPPY_LOG(hippy::Debug, "destroy enter task");

    runtime->hippyBridgeJSFunc.Reset();
    JNIEnvironment::AttachCurrentThread()->DeleteGlobalRef(
        runtime->hippyBridge);

    std::shared_ptr<Engine> strong_engine = runtime->pEngine.lock();
    if (strong_engine) {
      strong_engine->RemoveEnvironment(runtime->env);
    }

    CallJavaMethod(save_object_->obj(), 1);

    delete runtime;

    //HIPPY_LOG(hippy::Debug, "destroy leave task");
  };
  if (engine) {
    engine->jsRunner()->postTask(task);
    if (engine->GetEnvironmentCount() == 0) {
      EngineImpl::instance()->RemoveEngine(engine);
    }
  }

  HIPPY_LOG(hippy::Debug, "destroy end");
}

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void* reserved) {
  JNIEnv* env;
  jint onLoad_err = -1;
  if ((vm)->GetEnv((void**)&env, JNI_VERSION_1_4) != JNI_OK) {
    return onLoad_err;
  }
  if (env == NULL) {
    return onLoad_err;
  }

  JNIEnvironment::getInstance()->init(vm, env);

  return JNI_VERSION_1_4;
}

void JNI_OnUnload(JavaVM* vm, void* reserved) {
  hippy::napi::napi_vm__::PlatformDestroy();

  JNIEnvironment::destroyInstance();

  JNIEnv* env;
  if ((vm)->GetEnv((void**)&env, JNI_VERSION_1_4) != JNI_OK) {
    return;
  }
}

bool runScript(const char* script,
               const char* script_name,
               jboolean canUseCodeCache,
               const char* codeCacheDir,
               jlong v8RuntimePtr) {
  //HIPPY_LOG(hippy::Debug, "runScript start");

  std::vector<char> code_cache_data;
  jstring jCodeCacheFile = NULL;

  if (script == NULL || script_name == NULL) {
    HIPPY_LOG(hippy::Error, "runScript stript == NULL || script_name == NULL");
    return false;
  }

  if (canUseCodeCache) {
    MD5* md5 = new MD5();
    md5->update(script, strlen(script));
    md5->finalize();
    std::string scriptMd5 = md5->hexdigest();

    if (!scriptMd5.empty()) {
      std::string codeCacheDirStr(codeCacheDir, strlen(codeCacheDir));
      codeCacheDirStr.append(scriptMd5);
      jCodeCacheFile = JNIEnvironment::AttachCurrentThread()->NewStringUTF(
          codeCacheDirStr.data());

      std::ifstream jsfile(codeCacheDirStr);

      if (jsfile) {
        jsfile.seekg(0, std::ios::end);
        code_cache_data.resize(static_cast<size_t>(jsfile.tellg()) + 1);
        jsfile.seekg(0, std::ios::beg);
        jsfile.read(code_cache_data.data(), code_cache_data.size());
        code_cache_data.back() = 0;
        jsfile.close();
      }
    } else {
      canUseCodeCache = false;
    }

    if (md5) {
      delete md5;
    }
    md5 = NULL;
  }

  V8Runtime* runtime = reinterpret_cast<V8Runtime*>(v8RuntimePtr);
  if (runtime->isolate == NULL) {
    JNIEnvironment::AttachCurrentThread()->DeleteLocalRef(jCodeCacheFile);
    return false;
  }

  v8::Isolate* isolate = runtime->isolate;
  v8::HandleScope handle_scope(isolate);
  napi::napi_context napi_ctx = nullptr;
  std::shared_ptr<Environment> environment = runtime->env.lock();
  if (environment) {
    napi_ctx = environment->getContext();
  }
  if (napi_ctx == nullptr) {
    JNIEnvironment::AttachCurrentThread()->CallVoidMethod(
        runtime->hippyBridge,
        JNIEnvironment::getInstance()->wrapper.postCodeCacheRunnableMethodID,
        jCodeCacheFile, 0);
    return false;
  }
  // napi::napi_context napi_ctx = runtime->env->getContext();
  v8::Local<v8::Context> context =
      v8::Local<v8::Context>::New(isolate, napi_ctx->context_persistent);
  v8::Context::Scope context_scope(context);

  v8::Handle<v8::String> v8Source = v8::String::NewFromUtf8(isolate, script);
  v8::ScriptOrigin origin(v8::String::NewFromUtf8(isolate, script_name));
  v8::MaybeLocal<v8::Script> v8Script;

  if (!code_cache_data.empty()) {
    v8::ScriptCompiler::CachedData* cached_data =
        new v8::ScriptCompiler::CachedData(
            reinterpret_cast<const uint8_t*>(code_cache_data.data()),
            code_cache_data.size(),
            v8::ScriptCompiler::CachedData::BufferNotOwned);
    v8::ScriptCompiler::Source script_source(v8Source, origin, cached_data);
    v8Script = v8::ScriptCompiler::Compile(
        context, &script_source, v8::ScriptCompiler::kConsumeCodeCache);
  } else {
    if (canUseCodeCache) {
      v8::ScriptCompiler::Source script_source(v8Source, origin);
      v8Script = v8::ScriptCompiler::Compile(context, &script_source);
      Local<Script> local_script;
      if (!v8Script.ToLocal(&local_script)) {
        JNIEnvironment::AttachCurrentThread()->DeleteLocalRef(jCodeCacheFile);
        return false;
      }
      const v8::ScriptCompiler::CachedData* cached_data =
          v8::ScriptCompiler::CreateCodeCache(local_script->GetUnboundScript());
      if (cached_data) {
        V8Runtime* runtime = reinterpret_cast<V8Runtime*>(v8RuntimePtr);
        CodeCacheRunnable* runnable = new CodeCacheRunnable();
        std::string str((char*)(cached_data->data), cached_data->length);
        runnable->code_cache = str;
        JNIEnvironment::AttachCurrentThread()->CallVoidMethod(
            runtime->hippyBridge,
            JNIEnvironment::getInstance()
                ->wrapper.postCodeCacheRunnableMethodID,
            jCodeCacheFile, reinterpret_cast<jlong>(runnable));
        JNIEnvironment::clearJEnvException(
            JNIEnvironment::AttachCurrentThread());
      }
    } else {
      v8Script = v8::Script::Compile(context, v8Source, &origin);
    }
  }

  JNIEnvironment::AttachCurrentThread()->DeleteLocalRef(jCodeCacheFile);

  v8::MaybeLocal<v8::Value> result;
  bool flag = false;
  if (!v8Script.IsEmpty()) {
    result = v8Script.ToLocalChecked()->Run(context);

    if (!result.IsEmpty()) {
      flag = true;
    }
  }

  //HIPPY_LOG(hippy::Debug, "runScript end");
  return flag;
}
