//
// Created by longquan on 2020/8/31.
//

#ifndef ANDROID_CORE_BRIDGE_DEFINE_H_
#define ANDROID_CORE_BRIDGE_DEFINE_H_

#include <cstdint>

#define CALL_NATIVE_FUNC_TYPE 0
#define POST_CODE_CACHE_RUNNABLE_FUNC_TYPE 1
#define REPORT_JSON_EXCEPTION_FUNC_TYPE 2
#define REPORT_JS_EXCEPTION_FUNC_TYPE 3
#define CHECK_CODE_CACHE_SANITY_FUNC_TYPE 4
#define SEND_RESPONSE_FUNC_TYPE 5
#define SEND_NOTIFICATION_FUNC_TYPE 6
#define DESTROY_FUNC_TYPE 7
#define GLOBAL_CALLBACK_TYPE 8
#define POST_RENDER_OP_TYPE 9

// hippy call native方法
typedef void (*call_native)(int32_t engine_id, int32_t root_id,
                            const char16_t * module_name,
                            const char16_t * module_func,
                            const char16_t * call_id,
                            const void * params_data,
                            uint32_t params_len,
                            int32_t bridge_param_json);
typedef void (*post_code_cache_runnable)(int32_t engine_id, int32_t root_id,
                                         const char *code_cache_dir_char,
                                         int64_t runnable_id,
                                         int32_t need_clear_exception);
typedef void (*report_json_exception)(int32_t engine_id, int32_t root_id, const char * json_value);
typedef void (*report_js_exception)(int32_t engine_id, int32_t root_id, const char16_t *description_stream, const char16_t *stack_stream);
typedef void (*check_code_cache_sanity)(int32_t engine_id, int32_t root_id, const char * script_md5);
typedef void (*send_response)(int32_t engine_id, int32_t root_id, const uint16_t *source, int32_t len);
typedef void (*send_notification)(int32_t engine_id, int32_t root_id, const uint16_t *source, int32_t len);
// 销毁
typedef void (*destroy_function)(int32_t engine_id, int32_t root_id);
typedef void (*global_callback)(int32_t callback_id, int64_t value);
typedef void (*post_render_op)(int32_t engine_id, int32_t root_id, const void* data, int64_t length);

extern call_native call_native_func;
extern post_code_cache_runnable post_code_cache_runnable_func;
extern report_json_exception report_json_exception_func;
extern report_js_exception report_js_exception_func;
extern check_code_cache_sanity check_code_cache_sanity_func;
extern send_response send_response_func;
extern send_notification send_notification_func;
extern destroy_function destroy_func;
extern global_callback global_callback_func;
extern post_render_op post_render_op_func;

#endif //ANDROID_CORE_BRIDGE_DEFINE_H_
