/*****************************************************************************
 * @copyright Copyright (C), 1998-2020, Tencent Tech. Co., Ltd.
 * @file     js2dart.h
 * @brief    
 * @author   skindhu
 * @version  1.0.0
 * @date     2021/8/12
 *****************************************************************************/
#ifndef ANDROID_CORE_SRC_BRIDGE_ANDROID_JS2DART_H_
#define ANDROID_CORE_SRC_BRIDGE_ANDROID_JS2DART_H_

#pragma once

#include "core/core.h"
namespace voltron {
namespace bridge{

void callDartMethod(hippy::napi::CBDataTuple* data);

}  // namespace bridge
}  // namespace voltron

#endif  // ANDROID_CORE_SRC_BRIDGE_ANDROID_JS2DART_H_
