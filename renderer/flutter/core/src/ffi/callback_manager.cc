#include "ffi/callback_manager.h"

Dart_PostCObjectType dartPostCObject = NULL;
Dart_Port callbackPort = 0;

EXTERN_C void VoltronRegisterDartPostCObject(Dart_PostCObjectType _dartPostCObject, int64_t port) {
  dartPostCObject = _dartPostCObject;
  callbackPort = port;
}

EXTERN_C void VoltronExecuteCallback(Work* work_ptr) {
  RENDER_CORE_LOG(rendercore::LoggingLevel::Info, "real callback");
  const Work work = *work_ptr;
  work();
  delete work_ptr;
}

bool PostWorkToDart(const Work* work) {
  if (callbackPort != 0) {
    const auto workAddress = reinterpret_cast<intptr_t>(work);
    Dart_CObject dart_object;
    dart_object.type = Dart_CObject_kInt64;
    dart_object.value.as_int64 = workAddress;

    const bool result = dartPostCObject(callbackPort, &dart_object);
    return result;
  }
  return false;

}
