//
// Created by longquan on 2020/8/31.
//

#include "ffi/bridge_define.h"

call_native call_native_func = nullptr;
post_code_cache_runnable post_code_cache_runnable_func = nullptr;
report_json_exception report_json_exception_func = nullptr;
report_js_exception report_js_exception_func = nullptr;
check_code_cache_sanity check_code_cache_sanity_func = nullptr;
send_response send_response_func = nullptr;
send_notification send_notification_func = nullptr;
destroy_function destroy_func = nullptr;
global_callback global_callback_func = nullptr;
post_render_op post_render_op_func = nullptr;
calculate_node_layout calculate_node_layout_func = nullptr;