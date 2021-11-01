//
// Created by longquan on 2020/8/31.
//

#include "ffi/bridge_define.h"

call_native callNativeFunc = nullptr;
post_code_cache_runnable postCodeCacheRunnableFunc = nullptr;
report_json_exception reportJsonExceptionFunc = nullptr;
report_js_exception reportJsExceptionFunc = nullptr;
check_code_cache_sanity checkCodeCacheSanityFunc = nullptr;
send_response sendResponseFunc = nullptr;
send_notification sendNotificationFunc = nullptr;
destroy_function destroyFunc = nullptr;
global_callback globalCallbackFunc = nullptr;