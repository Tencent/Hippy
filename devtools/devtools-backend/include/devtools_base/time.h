//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
//

#pragma once

#include <chrono>
#include <sstream>
#include <string>
namespace tdf {
namespace devtools {
using Clock = std::chrono::steady_clock;
using TimePoint = std::chrono::time_point<Clock>;
using Duration = std::chrono::nanoseconds;
constexpr Duration kDefaultFrameBudget = Duration(std::chrono::nanoseconds(1000000000LL / 60LL));
/**
 * @brief 简易的时间戳获取工具类
 *        对系统的 steady_clock 的简单封装，方便使用
 */
class SteadyClockTime {
 public:
  enum class TimeUnit : uint32_t {
    kNanoSeconds,   // 纳秒
    kMicroSeconds,  // 微秒
    kMilliSeconds,  // 毫秒
    kSeconds,       // 秒
    kMinutes,       // 分
    kHours          // 时
  };

  /**
   * @brief 获取时间间隔
   *        时间起点为系统启动时间，不随系统时间修改而变化
   * @param time_unit 时间单位
   * @return 时间间隔 类型为uint64_t
   */
  static uint64_t NowTimeSinceEpoch(TimeUnit time_unit = TimeUnit::kNanoSeconds) {
    auto now = std::chrono::steady_clock::now();
    auto duration =
        std::chrono::time_point_cast<std::chrono::nanoseconds>(now).time_since_epoch().count();
    switch (time_unit) {
      case TimeUnit::kMicroSeconds:
        duration =
            std::chrono::time_point_cast<std::chrono::microseconds>(now).time_since_epoch().count();
        break;
      case TimeUnit::kMilliSeconds:
        duration =
            std::chrono::time_point_cast<std::chrono::milliseconds>(now).time_since_epoch().count();
        break;
      case TimeUnit::kSeconds:
        duration =
            std::chrono::time_point_cast<std::chrono::seconds>(now).time_since_epoch().count();
        break;
      case TimeUnit::kMinutes:
        duration =
            std::chrono::time_point_cast<std::chrono::minutes>(now).time_since_epoch().count();
        break;
      case TimeUnit::kHours:
        duration = std::chrono::time_point_cast<std::chrono::hours>(now).time_since_epoch().count();
        break;
      default:
        break;
    }
    return duration;
  }

  /**
   * @brief 获取时间间隔字符串
   * @param time_unit 时间单位
   * @return 时间间隔字符串
   */
  static const std::string NowTimeSinceEpochStr(TimeUnit time_unit = TimeUnit::kNanoSeconds) {
    auto duration = NowTimeSinceEpoch(time_unit);
    std::stringstream time_string_stream;
    time_string_stream << duration;
    return time_string_stream.str();
  }
};

}  // namespace devtools
}  // namespace tdf
