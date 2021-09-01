#include "cpp_adapter.h"

namespace hippy{
namespace bridge{

void install(jsi::Runtime& jsiRuntime) {
    // MMKV.set(key: string, value: string | number | bool)
    auto mmkvSet = jsi::Function::createFromHostFunction(jsiRuntime,
                                                         jsi::PropNameID::forAscii(jsiRuntime, "mmkvSet"),
                                                         2,  // key, value
                                                         [](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments, size_t count) -> jsi::Value {
        if (!arguments[0].isString()) throw jsi::JSError(runtime, "MMKV::set: First argument ('key') has to be of type string!");
        auto keyName = arguments[0].getString(runtime).utf8(runtime);

        if (arguments[1].isBool()) {
            MMKV::defaultMMKV()->set(arguments[1].getBool(), keyName);
        } else if (arguments[1].isNumber()) {
            MMKV::defaultMMKV()->set(arguments[1].getNumber(), keyName);
        } else if (arguments[1].isString()) {
            auto stringValue = arguments[1].getString(runtime).utf8(runtime);
            MMKV::defaultMMKV()->set(stringValue, keyName);
        } else {
            throw jsi::JSError(runtime, "MMKV::set: 'value' argument is not of type bool, number or string!");
        }
        return jsi::Value::undefined();
    });
    jsiRuntime.global().setProperty(jsiRuntime, "mmkvSet", std::move(mmkvSet));


    // MMKV.getBoolean(key: string)
    auto mmkvGetBoolean = jsi::Function::createFromHostFunction(jsiRuntime,
                                                                jsi::PropNameID::forAscii(jsiRuntime, "mmkvGetBoolean"),
                                                                1,  // key
                                                                [](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments, size_t count) -> jsi::Value {
        if (!arguments[0].isString()) throw jsi::JSError(runtime, "First argument ('key') has to be of type string!");
        auto keyName = arguments[0].getString(runtime).utf8(runtime);

        auto value = MMKV::defaultMMKV()->getBool(keyName);
        return jsi::Value(value);
    });
    jsiRuntime.global().setProperty(jsiRuntime, "mmkvGetBoolean", std::move(mmkvGetBoolean));


    // MMKV.getString(key: string)
    auto mmkvGetString = jsi::Function::createFromHostFunction(jsiRuntime,
                                                               jsi::PropNameID::forAscii(jsiRuntime, "mmkvGetString"),
                                                               1,  // key
                                                               [](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments, size_t count) -> jsi::Value {
        if (!arguments[0].isString()) throw jsi::JSError(runtime, "First argument ('key') has to be of type string!");
        auto keyName = arguments[0].getString(runtime).utf8(runtime);

        std::string result;
        bool hasValue = MMKV::defaultMMKV()->getString(keyName, result);
        if (hasValue)
            return jsi::Value(runtime, jsi::String::createFromUtf8(runtime, result));
        else
            return jsi::Value::undefined();
    });
    jsiRuntime.global().setProperty(jsiRuntime, "mmkvGetString", std::move(mmkvGetString));


    // MMKV.getNumber(key: string)
    auto mmkvGetNumber = jsi::Function::createFromHostFunction(jsiRuntime,
                                                               jsi::PropNameID::forAscii(jsiRuntime, "mmkvGetNumber"),
                                                               1,  // key
                                                               [](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments, size_t count) -> jsi::Value {
        if (!arguments[0].isString()) throw jsi::JSError(runtime, "First argument ('key') has to be of type string!");
        auto keyName = arguments[0].getString(runtime).utf8(runtime);

        auto value = MMKV::defaultMMKV()->getDouble(keyName);
        return jsi::Value(value);
    });
    jsiRuntime.global().setProperty(jsiRuntime, "mmkvGetNumber", std::move(mmkvGetNumber));


    // MMKV.delete(key: string)
    auto mmkvDelete = jsi::Function::createFromHostFunction(jsiRuntime,
                                                            jsi::PropNameID::forAscii(jsiRuntime, "mmkvDelete"),
                                                            1,  // key
                                                            [](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments, size_t count) -> jsi::Value {
        if (!arguments[0].isString()) throw jsi::JSError(runtime, "First argument ('key') has to be of type string!");
        auto keyName = arguments[0].getString(runtime).utf8(runtime);

        MMKV::defaultMMKV()->removeValueForKey(keyName);
        return jsi::Value::undefined();
    });
    jsiRuntime.global().setProperty(jsiRuntime, "mmkvDelete", std::move(mmkvDelete));


    // MMKV.getAllKeys()
    auto mmkvGetAllKeys = jsi::Function::createFromHostFunction(jsiRuntime,
                                                                jsi::PropNameID::forAscii(jsiRuntime, "mmkvGetAllKeys"),
                                                                0,
                                                                [](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments, size_t count) -> jsi::Value {
        auto keys = MMKV::defaultMMKV()->allKeys();
        auto array = jsi::Array(runtime, keys.size());
        for (int i = 0; i < keys.size(); i++) {
            array.setValueAtIndex(runtime, i, keys[i]);
        }
        return array;
    });
    jsiRuntime.global().setProperty(jsiRuntime, "mmkvGetAllKeys", std::move(mmkvGetAllKeys));

    // MMKV.clearAll()
    auto mmkvClearAll = jsi::Function::createFromHostFunction(jsiRuntime,
                                                              jsi::PropNameID::forAscii(jsiRuntime, "mmkvClearAll"),
                                                              0,
                                                              [](jsi::Runtime& runtime, const jsi::Value& thisValue, const jsi::Value* arguments, size_t count) -> jsi::Value {
        MMKV::defaultMMKV()->clearAll();
        return jsi::Value::undefined();
    });
    jsiRuntime.global().setProperty(jsiRuntime, "mmkvClearAll", std::move(mmkvClearAll));
}

std::string jstringToStdString(JNIEnv *env, jstring jStr) {
    if (!jStr) return "";

    const auto stringClass = env->GetObjectClass(jStr);
    const auto getBytes = env->GetMethodID(stringClass, "getBytes", "(Ljava/lang/String;)[B");
    const auto stringJbytes = (jbyteArray) env->CallObjectMethod(jStr, getBytes, env->NewStringUTF("UTF-8"));

    auto length = (size_t) env->GetArrayLength(stringJbytes);
    auto pBytes = env->GetByteArrayElements(stringJbytes, nullptr);

    std::string ret = std::string((char *)pBytes, length);
    env->ReleaseByteArrayElements(stringJbytes, pBytes, JNI_ABORT);

    env->DeleteLocalRef(stringJbytes);
    env->DeleteLocalRef(stringClass);
    return ret;
}

} //namespace bridge
} //namespace hippy


