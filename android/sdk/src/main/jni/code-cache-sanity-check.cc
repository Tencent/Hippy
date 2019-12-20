//
// Created by howlpan on 2019/4/18.
//

#include "code-cache-sanity-check.h"  // NOLINT(build/include_subdir)

#include <string>

#include "jni-env.h"    // NOLINT(build/include_subdir)
#include "jni-utils.h"  // NOLINT(build/include_subdir)
#include "third_party/md5.h"

void CodeCacheSanityCheck::check(v8::Isolate *isolate,
                                 int result, v8::Local<v8::String> source) {
  if (result == 0) {
    return;
  }

  if (source.IsEmpty()) {
    return;
  }

  v8::String::Utf8Value sourceData(isolate, source);
  const char *script = JniUtils::ToCString(sourceData);
  MD5 *md5 = new MD5();
  md5->update(script, strlen(script));
  md5->finalize();
  std::string scriptMd5 = md5->hexdigest();
  delete md5;

  JNIEnv* env = JNIEnvironment::AttachCurrentThread();
  jstring jscriptMd5 = env->NewStringUTF(scriptMd5.c_str());

  jclass hippyBridgeCls =
      env->FindClass("com/tencent/mtt/hippy/bridge/HippyBridgeImpl");
  if (NULL !=
          JNIEnvironment::getInstance()->wrapper.deleteCodeCacheMethodID &&
      NULL != hippyBridgeCls) {
    env->CallStaticVoidMethod(
        hippyBridgeCls,
        JNIEnvironment::getInstance()->wrapper.deleteCodeCacheMethodID,
        jscriptMd5);
  }
  env->DeleteLocalRef(jscriptMd5);
  env->DeleteLocalRef(hippyBridgeCls);
}
