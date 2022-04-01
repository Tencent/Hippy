//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by ivanfanwu on 2021/10/15.
//

#pragma once

namespace tdf {
namespace devtools {

typedef int ErrorType;

constexpr const ErrorType kErrorNotSupport = -1;  // 当前框架不支持，如 delegate 未注入
constexpr const ErrorType kErrorParams = -2;  // 参数异常
constexpr const ErrorType kErrorFailCode = -3;  // 结果异常
constexpr const ErrorType kErrorImpl = -4;  // 实现异常，如第三方框架实现适配器异常

}  // namespace devtools
}  // namespace tdf
