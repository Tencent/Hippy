/*****************************************************************************
 * @copyright Copyright (C), 1998-2020, Tencent Tech. Co., Ltd.
 * @file     dart2js.h
 * @brief    
 * @author   skindhu
 * @version  1.0.0
 * @date     2021/8/15
 *****************************************************************************/
#ifndef ANDROID_CORE_INCLUDE_BRIDGE_ANDROID_DART2JS_H_
#define ANDROID_CORE_INCLUDE_BRIDGE_ANDROID_DART2JS_H_

#include "core/core.h"
namespace voltron {
namespace bridge {

using unicode_string_view = tdf::base::unicode_string_view;

void CallJSFunction(int64_t runtime_id,
                    const unicode_string_view &action_name,
                    const unicode_string_view &params_data,
                    std::function<void(int64_t)> callback);

}  // namespace bridge
}  // namespace voltron

#endif  // ANDROID_CORE_INCLUDE_BRIDGE_ANDROID_DART2JS_H_
