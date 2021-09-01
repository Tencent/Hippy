#pragma once
#include <jni.h>
#include <jsi/jsi.h>
#include "core/mmkv/MMKV.h"

namespace hippy{
    namespace bridge{
        void install(jsi::Runtime& jsiRuntime);
        std::string jstringToStdString(JNIEnv *env, jstring jStr);
        
    }
}