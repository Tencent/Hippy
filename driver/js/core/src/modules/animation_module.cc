/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#include "core/modules/animation_module.h"

#include <limits>
#include <regex>

#include "base/unicode_string_view.h"
#include "core/base/string_view_utils.h"
#include "core/modules/ui_manager_module.h"
#include "core/napi/js_native_api_types.h"
#include "core/scope.h"
#include "dom/node_props.h"

template<typename T>
using InstanceDefine = hippy::napi::InstanceDefine<T>;

template<typename T>
using FunctionDefine = hippy::napi::FunctionDefine<T>;

using DomValue = tdf::base::DomValue;
using DomArgument = hippy::dom::DomArgument;
using unicode_string_view = tdf::base::unicode_string_view;

using AnimationSetChild = hippy::AnimationSet::AnimationSetChild;
using Ctx = hippy::napi::Ctx;
using CtxValue = hippy::napi::CtxValue;
using CallbackInfo = hippy::napi::CallbackInfo;
using DomEvent = hippy::dom::DomEvent;
using DomManager = hippy::dom::DomManager;
using DomNode = hippy::dom::DomNode;
using RegisterFunction = hippy::base::RegisterFunction;
using RegisterMap = hippy::base::RegisterMap;
using StringViewUtils = hippy::base::StringViewUtils;

using CtxValue = hippy::napi::CtxValue;

namespace hippy {

constexpr uint32_t kAnimationUpdateArgc = 1;
constexpr uint32_t kInvalidAnimationId = 0;
constexpr uint32_t kAddEventListenerArgc = 2;
constexpr uint32_t kAddEventListenerEventNameIndex = 0;
constexpr uint32_t kAddEventListenerCbIndex = 1;
constexpr uint32_t kRemoveEventListenerArgc = 1;
constexpr uint32_t kRemoveEventListenerEventNameIndex = 0;

constexpr char kAnimationModeKey[] = "mode";
constexpr char kAnimationDelayKey[] = "delay";
constexpr char kAnimationStartValueKey[] = "startValue";
constexpr char kAnimationToValueKey[] = "toValue";
constexpr char kAnimationValueTypeKey[] = "valueType";
constexpr char kAnimationDurationKey[] = "duration";
constexpr char kAnimationTimingFunctionKey[] = "timingFunction";
constexpr char kAnimationRepeatCountKey[] = "repeatCount";
constexpr char kAnimationFollowKey[] = "follow";
constexpr char kAnimationChildrenKey[] = "children";

constexpr char kAnimationMode[] = "timing";
constexpr char kAnimationValueTypeRad[] = "rad";
constexpr char kAnimationValueTypeDeg[] = "deg";
constexpr char kAnimationValueTypeColor[] = "color";
constexpr char kAnimationIdKey[] = "animationId";

struct ParseAnimationResult {
  Animation::Mode mode;
  uint64_t delay;
  uint32_t animation_id;
  double start_value;
  double to_value;
  Animation::ValueType type;
  uint64_t duration;
  std::string func;
  int32_t cnt;
};

std::shared_ptr<AnimationSet> ParseAnimationSet(
    const std::shared_ptr<Ctx>& context,
    size_t argument_count,
    const std::shared_ptr<CtxValue> arguments[]) {
  auto set_obj = arguments[0];
  if (context->IsNullOrUndefined(set_obj)) {
    context->ThrowException("AnimationSet argv error");
    return nullptr;
  }

  auto repeat_obj = context->GetProperty(set_obj, kAnimationRepeatCountKey);
  if (context->IsNullOrUndefined(repeat_obj)) {
    context->ThrowException("AnimationSet argv error");
    return nullptr;
  }

  int32_t repeat_cnt;
  auto flag = context->GetValueNumber(repeat_obj, &repeat_cnt);
  if (!flag) {
    context->ThrowException("AnimationSet repeat error");
    return nullptr;
  }

  auto children = context->GetProperty(set_obj, kAnimationChildrenKey);
  if (!context->IsArray(children)) {
    context->ThrowException("AnimationSet children error");
    return nullptr;
  }

  std::vector<AnimationSetChild> set_children;
  auto len = context->GetArrayLength(children);
  for (uint32_t i = 0; i < len; ++i) {
    auto child = context->CopyArrayElement(children, i);
    auto prop_id = context->GetProperty(child, kAnimationIdKey);
    int32_t id;
    flag = context->GetValueNumber(prop_id, &id);
    if (!flag) {
      context->ThrowException("AnimationSet animationId error");
      return nullptr;
    }
    auto prop_follow = context->GetProperty(child, kAnimationFollowKey);
    bool follow;
    flag = context->GetValueBoolean(prop_follow, &follow);
    if (!flag) {
      context->ThrowException("AnimationSet follow error");
      return nullptr;
    }
    set_children.emplace_back(AnimationSetChild{static_cast<uint32_t>(id), follow});
  }
  AnimationSet ret{
    std::move(set_children),
    repeat_cnt
  };
  return std::make_shared<AnimationSet>(std::move(ret));
}

std::shared_ptr<ParseAnimationResult> ParseAnimation(const std::shared_ptr<Ctx>& context,
                                                     size_t argument_count,
                                                     const std::shared_ptr<CtxValue> arguments[]) {
  if (argument_count != kAnimationUpdateArgc) {
    return nullptr;
  }

  auto animation_obj = arguments[0];
  unicode_string_view mode;
  auto mode_obj = context->GetProperty(animation_obj, kAnimationModeKey);
  auto flag = context->GetValueString(mode_obj, &mode);
  if (!flag) {
    context->ThrowException("animation mode error");
    return nullptr;
  }

  auto u8_mode = StringViewUtils::ToU8StdStr(mode);
  if (u8_mode != kAnimationMode) {
    context->ThrowException("animation mode value error");
    return nullptr;
  }

  double delay;
  auto delay_obj = context->GetProperty(animation_obj, kAnimationDelayKey);
  flag = context->GetValueNumber(delay_obj, &delay);
  if (!flag) {
    context->ThrowException("animation delay error");
    return nullptr;
  }

  double start_value;
  auto start_value_obj = context->GetProperty(animation_obj, kAnimationStartValueKey);
  uint32_t animation_id = kInvalidAnimationId;
  flag = context->GetValueNumber(start_value_obj, &start_value);
  if (!flag) {
    auto animation_id_obj = context->GetProperty(start_value_obj, kAnimationIdKey);
    if (context->IsNullOrUndefined(animation_id_obj)) {
      context->ThrowException("animation start_value error");
      return nullptr;
    }
    int32_t id;
    flag = context->GetValueNumber(animation_id_obj, &id);
    if (!flag) {
      context->ThrowException("animation start_value error");
      return nullptr;
    }
    animation_id = hippy::base::checked_numeric_cast<int32_t, uint32_t>(id);
    // todo 避免 release checked_numeric_cast crash
  }

  double to_value;
  auto to_value_obj = context->GetProperty(animation_obj, kAnimationToValueKey);
  flag = context->GetValueNumber(to_value_obj, &to_value);
  if (!flag) {
    context->ThrowException("animation to_value error");
    return nullptr;
  }

  unicode_string_view value_type;
  auto value_type_obj = context->GetProperty(animation_obj, kAnimationValueTypeKey);
  Animation::ValueType type = Animation::ValueType::kUndefined;
  if (!context->IsNullOrUndefined(value_type_obj)) {
    flag = context->GetValueString(value_type_obj, &value_type);
    if (!flag) {
      context->ThrowException("animation value_type error");
      return nullptr;
    }
    auto u8_value_type = StringViewUtils::ToU8StdStr(value_type);
    if (u8_value_type == kAnimationValueTypeRad) {
      type = Animation::ValueType::kRad;
    } else if (u8_value_type == kAnimationValueTypeDeg) {
      type = Animation::ValueType::kDeg;
    } else if (u8_value_type == kAnimationValueTypeColor) {
      type = Animation::ValueType::kColor;
    } else {
      context->ThrowException("animation value_type error");
      return nullptr;
    }
  }

  double duration;
  auto duration_obj = context->GetProperty(animation_obj, kAnimationDurationKey);
  flag = context->GetValueNumber(duration_obj, &duration);
  if (!flag) {
    context->ThrowException("animation duration error");
    return nullptr;
  }

  unicode_string_view timing_func;
  auto timing_func_obj = context->GetProperty(animation_obj, kAnimationTimingFunctionKey);
  flag = context->GetValueString(timing_func_obj, &timing_func);
  if (!flag) {
    context->ThrowException("animation timing_func error");
    return nullptr;
  }

  auto u8_timing_func = StringViewUtils::ToU8StdStr(timing_func);
  int32_t cnt;
  auto cnt_obj = context->GetProperty(animation_obj, kAnimationRepeatCountKey);
  flag = context->GetValueNumber(cnt_obj, &cnt);
  if (!flag) {
    context->ThrowException("animation timing_func error");
    return nullptr;
  }

  ParseAnimationResult ret{
      Animation::Mode::kTiming,
      static_cast<uint64_t>(delay),
      animation_id,
      start_value,
      to_value,
      type,
      static_cast<uint64_t>(duration),
      u8_timing_func,
      cnt
  };
  return std::make_shared<ParseAnimationResult>(std::move(ret));
}

// start 和 resume 会调用 StartAnimationSet
void StartAnimationSet(std::shared_ptr<DomManager> dom_manager, std::shared_ptr<AnimationSet> animation_set) {
  auto animation_manager = dom_manager->GetAnimationManager();
  auto children = animation_set->GetChildren();
  uint64_t follow_end_time = 0;  // follow_end_time 为上一个动画给下一个 follow 动画带来的延迟时间
  uint64_t follow_exec_time = 0; // follow 的上一个动画已执行时间
  uint64_t real_delay = 0;
  std::shared_ptr<Animation> start_animation;
  std::shared_ptr<Animation> end_animation;
  uint64_t min_delay = std::numeric_limits<uint64_t>::max();
  uint64_t max_delay = 0;
  auto now = hippy::base::MonotonicallyIncreasingTime();
  for (const auto& child: children) {
    auto animation = animation_manager->GetAnimation(child.animation_id);
    animation->SetLastBeginTime(now);
    if (!animation) {
      continue;
    }
    auto delay = animation->GetDelay();
    auto exec_time = animation->GetExecTime();
    if (child.follow) {
      real_delay = follow_end_time + delay;
    } else {
      real_delay = delay;
      follow_exec_time = 0;
    }
    if (min_delay > real_delay) {
      min_delay = real_delay;
      start_animation = animation;
    }
    if (max_delay <= real_delay) {
      max_delay = real_delay;
      end_animation = animation;
    }
    auto duration = animation->GetDuration();
    if (exec_time >= delay + duration) { // 该动画已经执行完了
      follow_end_time = real_delay + duration;
      follow_exec_time = exec_time;
      continue;
    }
    if (follow_exec_time < real_delay) {
      uint64_t interval = real_delay - follow_exec_time;
      std::weak_ptr<Animation> weak_animation = animation;
      std::weak_ptr<AnimationManager> weak_animation_manager = animation_manager;
      std::vector<std::function<void()>> ops = {[weak_animation, weak_animation_manager] {
        auto animation_manager = weak_animation_manager.lock();
        if (!animation_manager) {
          return;
        }
        auto animation = weak_animation.lock();
        if (!animation) {
          return;
        }
        animation_manager->RemoveDelayedAnimationRecord(animation->GetId());
        auto now = hippy::base::MonotonicallyIncreasingTime();
        auto delay = animation->GetDelay();
        animation->SetExecTime(delay);
        animation_manager->AddActiveAnimation(animation);
        animation->SetLastBeginTime(now);
        animation->SetStatus(Animation::Status::kStart);
      }};
      auto task = dom_manager->PostDelayedTask(Scene(std::move(ops)), interval);
      animation_manager->AddDelayedAnimationRecord(animation->GetId(), task);
    } else { // exec_time >= delay 说明正在执行
      animation_manager->AddActiveAnimation(animation);
    }
    follow_end_time = real_delay + duration;
    follow_exec_time = exec_time;
  }
  auto start_cb = animation_set->GetAnimationStartCb();
  animation_set->SetStartValue(start_animation->GetStartValue());
  if (start_cb && start_animation) {
    start_animation->AddEventListener(hippy::kAnimationStartKey, start_cb);
  }
  auto end_cb = animation_set->GetAnimationEndCb();
  if (end_cb && end_animation) {
    end_animation->AddEventListener(hippy::kAnimationEndKey, end_cb);
  }
}

std::shared_ptr<InstanceDefine<Animation>>
RegisterAnimation(const std::weak_ptr<Scope>& weak_scope) {
  InstanceDefine<Animation> def;
  def.name = "Animation";
  def.constructor = [weak_scope](size_t argument_count,
                                 const std::shared_ptr<CtxValue> arguments[])
                                     -> std::shared_ptr<Animation> {

    auto scope = weak_scope.lock();
    if (!scope) {
      return nullptr;
    }
    auto result = ParseAnimation(scope->GetContext(), argument_count, arguments);
    if (!result) {
      return nullptr;
    }
    auto animation = std::make_shared<Animation>(result->mode, result->delay, result->start_value,
                                                 result->to_value, result->type, result->duration,
                                                 result->func, result->cnt);
    auto weak_dom_manager = scope->GetDomManager();
    auto dom_manager = weak_dom_manager.lock();
    if (!dom_manager) {
      return nullptr;
    }
    // 避免多线程问题，此处从js线程拷贝到dom线程
    std::vector<std::function<void()>> ops = {[weak_dom_manager, animation_copy = *animation,
                                               related_id = result->animation_id] {
      auto dom_manager = weak_dom_manager.lock();
      if (!dom_manager) {
        return;
      }
      auto animation_manager = dom_manager->GetAnimationManager();
      auto copy = std::make_shared<Animation>(std::move(animation_copy));
      /*
       * * startValue ：动画开始时的值，可为 Number 类型或一个 Animation 的对象，格式为 { animationId: xxx }
       * 如果指定为一个 Animation 时，代表本动画的初始值为其指定的动画结束或中途 cancel 后的所处的动画值；
       */
      if (related_id != kInvalidAnimationId) {
        auto related_animation = animation_manager->GetAnimation(related_id);
        if (!related_animation) {
          return;
        }
        auto start_value = related_animation->GetCurrentValue();
        copy->SetStartValue(start_value);
      }
      animation_manager->AddAnimation(copy);
    }};
    dom_manager->PostTask(Scene(std::move(ops)));
    return animation;
  };

  FunctionDefine<Animation> id_func_def;
  id_func_def.name = "getId";
  id_func_def.cb = [weak_scope](
      Animation* animation,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[]) -> std::shared_ptr<CtxValue> {
    if (!animation) {
      return nullptr;
    }
    auto scope = weak_scope.lock();
    if (!scope) {
      return nullptr;
    }
    auto id = animation->GetId();
    return scope->GetContext()->CreateNumber(static_cast<double>(id));
  };
  def.functions.emplace_back(std::move(id_func_def));

  FunctionDefine<Animation> start_func_def;
  start_func_def.name = "start";
  start_func_def.cb = [weak_scope](
      Animation* animation,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[]) -> std::shared_ptr<CtxValue> {
    if (!animation) {
      return nullptr;
    }
    auto scope = weak_scope.lock();
    if (!scope) {
      return nullptr;
    }
    auto weak_dom_manager = scope->GetDomManager();
    auto dom_manager = weak_dom_manager.lock();
    if (!dom_manager) {
      return nullptr;
    }
    auto id = animation->GetId();
    std::vector<std::function<void()>> ops = {[weak_dom_manager, id] {
      auto dom_manager = weak_dom_manager.lock();
      if (!dom_manager) {
        return;
      }
      auto animation_manager = dom_manager->GetAnimationManager();
      auto animation = animation_manager->GetAnimation(id);
      if (!animation) {
        return;
      }
      auto status = animation->GetStatus();
      switch (status) {
        case Animation::Status::kCreated:
          animation->SetStatus(Animation::Status::kStart);
          break;
        case Animation::Status::kStart:
        case Animation::Status::kRunning:
        case Animation::Status::kPause:
        case Animation::Status::kResume:
        case Animation::Status::kEnd:
        case Animation::Status::kDestroy:
        default:
          return;
      }
      auto now = hippy::base::MonotonicallyIncreasingTime();
      animation->SetLastBeginTime(now);
      auto delay = animation->GetDelay();
      if (delay == 0) {
        animation_manager->AddActiveAnimation(animation);
      } else {
        std::weak_ptr<Animation> weak_animation = animation;
        std::weak_ptr<AnimationManager> weak_animation_manager = animation_manager;
        std::vector<std::function<void()>> ops = {[weak_animation, weak_dom_manager] {
          auto animation = weak_animation.lock();
          if (!animation) {
            return;
          }
          auto dom_manager = weak_dom_manager.lock();
          if (!dom_manager) {
            return;
          }

          auto animation_manager = dom_manager->GetAnimationManager();
          auto now = hippy::base::MonotonicallyIncreasingTime();
          auto exec_time = animation->GetExecTime();
          exec_time += (now - animation->GetLastBeginTime());
          animation->SetExecTime(exec_time);
          animation->SetLastBeginTime(now);
          animation_manager->RemoveDelayedAnimationRecord(animation->GetId());
          animation_manager->AddActiveAnimation(animation);
        }};
        auto task = dom_manager->PostDelayedTask(Scene(std::move(ops)), delay);
        animation_manager->AddDelayedAnimationRecord(id, task);
      }
    }};
    dom_manager->PostTask(Scene(std::move(ops)));
    return nullptr;
  };
  def.functions.emplace_back(std::move(start_func_def));

  FunctionDefine<Animation> destroy_func_def;
  destroy_func_def.name = "destroy";
  destroy_func_def.cb = [weak_scope](
      Animation* animation,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[]) -> std::shared_ptr<CtxValue> {
    if (!animation) {
      return nullptr;
    }
    auto scope = weak_scope.lock();
    if (!scope) {
      return nullptr;
    }
    auto weak_dom_manager = scope->GetDomManager();
    auto dom_manager = weak_dom_manager.lock();
    if (!dom_manager) {
      return nullptr;
    }
    auto id = animation->GetId();
    std::vector<std::function<void()>> ops = {[weak_dom_manager, id] {
      auto dom_manager = weak_dom_manager.lock();
      if (!dom_manager) {
        return;
      }
      auto animation_manager = dom_manager->GetAnimationManager();
      auto animation = animation_manager->GetAnimation(id);
      if (!animation) {
        return;
      }
      auto status = animation->GetStatus();
      switch (status) {
        case Animation::Status::kCreated:
        case Animation::Status::kStart:
        case Animation::Status::kRunning:
        case Animation::Status::kPause:
        case Animation::Status::kResume:
        case Animation::Status::kEnd:
          animation->SetStatus(Animation::Status::kDestroy);
          break;
        case Animation::Status::kDestroy:
        default:
          return;
      }
      animation_manager->RemoveAnimation(animation);
      animation_manager->RemoveActiveAnimation(id);
      if (status == Animation::Status::kRunning) {
        auto on_cancel = animation->GetAnimationCancelCb();
        if (on_cancel) {
          auto task_runner = dom_manager->GetDelegateTaskRunner().lock();
          if (task_runner) {
            auto task = std::make_shared<CommonTask>();
            task->func_ = [on_cancel = std::move(on_cancel)]() {
              on_cancel();
            };
            task_runner->PostTask(std::move(task));
          }
        }
      }
    }};
    dom_manager->PostTask(Scene(std::move(ops)));
    return nullptr;
  };
  def.functions.emplace_back(std::move(destroy_func_def));

  FunctionDefine<Animation> pause_func_def;
  pause_func_def.name = "pause";
  pause_func_def.cb = [weak_scope](
      Animation* animation,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[]) -> std::shared_ptr<CtxValue> {
    if (!animation) {
      return nullptr;
    }
    auto scope = weak_scope.lock();
    if (!scope) {
      return nullptr;
    }
    auto weak_dom_manager = scope->GetDomManager();
    auto dom_manager = weak_dom_manager.lock();
    if (!dom_manager) {
      return nullptr;
    }
    auto id = animation->GetId();
    std::vector<std::function<void()>> ops = {[weak_dom_manager, id] {
      auto dom_manager = weak_dom_manager.lock();
      if (!dom_manager) {
        return;
      }
      auto animation_manager = dom_manager->GetAnimationManager();
      auto animation = animation_manager->GetAnimation(id);
      if (!animation) {
        return;
      }
      auto status = animation->GetStatus();
      switch (status) {
        case Animation::Status::kStart:
        case Animation::Status::kRunning:
        case Animation::Status::kResume:
          animation->SetStatus(Animation::Status::kPause);
          break;
        case Animation::Status::kCreated:
        case Animation::Status::kPause:
        case Animation::Status::kEnd:
        case Animation::Status::kDestroy:
        default:
          return;
      }
      animation_manager->RemoveActiveAnimation(id);
      animation_manager->CancelDelayedAnimation(id);
      animation_manager->RemoveDelayedAnimationRecord(id);
      auto now = hippy::base::MonotonicallyIncreasingTime();
      auto exec_time = animation->GetExecTime();
      exec_time += (now - animation->GetLastBeginTime());
      animation->SetExecTime(exec_time);
      animation->SetLastBeginTime(now);
    }};
    dom_manager->PostTask(Scene(std::move(ops)));
    return nullptr;
  };
  def.functions.emplace_back(std::move(pause_func_def));

  FunctionDefine<Animation> resume_func_def;
  resume_func_def.name = "resume";
  resume_func_def.cb = [weak_scope](
      Animation* animation,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[]) -> std::shared_ptr<CtxValue> {
    if (!animation) {
      return nullptr;
    }
    auto scope = weak_scope.lock();
    if (!scope) {
      return nullptr;
    }
    auto weak_dom_manager = scope->GetDomManager();
    auto dom_manager = weak_dom_manager.lock();
    if (!dom_manager) {
      return nullptr;
    }
    auto id = animation->GetId();
    std::vector<std::function<void()>> ops = {[weak_dom_manager, id] {
      auto dom_manager = weak_dom_manager.lock();
      if (!dom_manager) {
        return;
      }
      auto animation_manager = dom_manager->GetAnimationManager();
      auto animation = animation_manager->GetAnimation(id);
      if (!animation) {
        return;
      }
      auto status = animation->GetStatus();
      switch (status) {
        case Animation::Status::kPause:
          animation->SetStatus(Animation::Status::kResume);
          break;
        case Animation::Status::kCreated:
        case Animation::Status::kStart:
        case Animation::Status::kRunning:
        case Animation::Status::kResume:
        case Animation::Status::kEnd:
        case Animation::Status::kDestroy:
        default:
          return;
      }
      auto exec_time = animation->GetExecTime();
      auto delay = animation->GetDelay();
      auto duration = animation->GetDuration();
      if (exec_time < delay) {
        auto interval = delay - exec_time;
        std::weak_ptr<Animation> weak_animation = animation;
        std::vector<std::function<void()>> ops = {[weak_animation, weak_dom_manager] {
          auto animation = weak_animation.lock();
          if (!animation) {
            return;
          }
          auto dom_manager = weak_dom_manager.lock();
          if (!dom_manager) {
            return;
          }
          auto animation_manager = dom_manager->GetAnimationManager();
          animation_manager->RemoveDelayedAnimationRecord(animation->GetId());
          auto now = hippy::base::MonotonicallyIncreasingTime();
          auto exec_time = animation->GetExecTime();
          exec_time += (now - animation->GetLastBeginTime());
          animation->SetExecTime(exec_time);
          animation->SetLastBeginTime(now);
          animation_manager->AddActiveAnimation(animation);
        }};
        auto task = dom_manager->PostDelayedTask(Scene(std::move(ops)), interval);
        animation_manager->AddDelayedAnimationRecord(id, task);
      } else if (exec_time >= delay && exec_time < delay + duration) {
        auto now = hippy::base::MonotonicallyIncreasingTime();
        animation->SetLastBeginTime(now);
        animation_manager->AddActiveAnimation(animation);
      }
    }};
    dom_manager->PostTask(Scene(std::move(ops)));
    return nullptr;
  };
  def.functions.emplace_back(std::move(resume_func_def));


  FunctionDefine<Animation> update_func_def;
  update_func_def.name = "updateAnimation";
  update_func_def.cb = [weak_scope](
      Animation* animation,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[]) -> std::shared_ptr<CtxValue> {
    if (!animation) {
      return nullptr;
    }
    auto scope = weak_scope.lock();
    if (!scope) {
      return nullptr;
    }
    std::shared_ptr<Ctx> context = scope->GetContext();
    auto result = ParseAnimation(context, argument_count, arguments);
    if (!result) {
      return nullptr;
    }
    animation->Update(result->mode, result->delay, result->start_value, result->to_value,
                      result->type, result->duration, result->func, result->cnt);
    auto weak_dom_manager = scope->GetDomManager();
    auto dom_manager = weak_dom_manager.lock();
    if (!dom_manager) {
      return nullptr;
    }
    auto id = animation->GetId();
    std::vector<std::function<void()>> ops = {[id, weak_dom_manager, copy = *result] {
      auto dom_manager = weak_dom_manager.lock();
      if (!dom_manager) {
        return;
      }
      auto animation_manager = dom_manager->GetAnimationManager();
      if (animation_manager->IsActive(id)) {
        return;
      }
      animation_manager->RemoveActiveAnimation(id);
      animation_manager->CancelDelayedAnimation(id);
      animation_manager->RemoveDelayedAnimationRecord(id);
      auto animation = animation_manager->GetAnimation(id);
      auto related_id = copy.animation_id;
      if (related_id != kInvalidAnimationId) {
        auto related_animation = animation_manager->GetAnimation(related_id);
        if (!related_animation) {
          return;
        }
        auto start_value = related_animation->GetCurrentValue();
        animation->SetStartValue(start_value);
      }
      animation->Update(copy.mode,
                        copy.delay,
                        copy.start_value,
                        copy.to_value,
                        copy.type,
                        copy.duration,
                        copy.func,
                        copy.cnt);
      animation->SetExecTime(0);
      animation->SetStatus(Animation::Status::kCreated);
    }};
    dom_manager->PostTask(Scene(std::move(ops)));
    return nullptr;
  };
  def.functions.emplace_back(std::move(update_func_def));

  FunctionDefine<Animation> add_event_listener_func_def;
  add_event_listener_func_def.name = "addEventListener";
  add_event_listener_func_def.cb = [weak_scope](
      Animation* animation,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[]) -> std::shared_ptr<CtxValue> {
    if (!animation) {
      return nullptr;
    }
    auto scope = weak_scope.lock();
    if (!scope) {
      return nullptr;
    }
    auto weak_dom_manager = scope->GetDomManager();
    auto dom_manager = weak_dom_manager.lock();
    if (!dom_manager) {
      return nullptr;
    }
    auto id = animation->GetId();
    auto context = scope->GetContext();
    if (argument_count != kAddEventListenerArgc) {
      context->ThrowException("argc error");
      return nullptr;
    }
    unicode_string_view event_name;
    auto flag = context->GetValueString(arguments[kAddEventListenerEventNameIndex], &event_name);
    if (!flag) {
      context->ThrowException("event_name error");
      return nullptr;
    }
    auto func = arguments[kAddEventListenerCbIndex];
    if (!context->IsFunction(func)) {
      context->ThrowException("cb is not a function");
      return nullptr;
    }
    std::weak_ptr<Ctx> weak_context = context;
    auto cb = [weak_context, func] { // run in js thread
      auto context = weak_context.lock();
      if (!context) {
        return;
      }
      context->CallFunction(func, 0, nullptr);
    };
    std::vector<std::function<void()>> ops = {[weak_dom_manager, id, event_name, cb] {
      // run in dom thread
      auto dom_manager = weak_dom_manager.lock();
      if (!dom_manager) {
        return;
      }
      auto animation_manager = dom_manager->GetAnimationManager();
      auto animation = animation_manager->GetAnimation(id);
      if (!animation) {
        return;
      }
      animation->AddEventListener(StringViewUtils::ToU8StdStr(event_name), std::move(cb));
    }};
    dom_manager->PostTask(Scene(std::move(ops)));
    return nullptr;
  };
  def.functions.emplace_back(std::move(add_event_listener_func_def));

  FunctionDefine<Animation> remove_listener_func_def;
  remove_listener_func_def.name = "removeEventListener";
  remove_listener_func_def.cb = [weak_scope](
      Animation* animation,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[]) -> std::shared_ptr<CtxValue> {
    if (!animation) {
      return nullptr;
    }
    auto scope = weak_scope.lock();
    if (!scope) {
      return nullptr;
    }
    auto weak_dom_manager = scope->GetDomManager();
    auto dom_manager = weak_dom_manager.lock();
    if (!dom_manager) {
      return nullptr;
    }
    auto id = animation->GetId();
    auto context = scope->GetContext();
    if (argument_count != kRemoveEventListenerArgc) {
      context->ThrowException("argc error");
      return nullptr;
    }
    unicode_string_view event_name;
    auto flag = context->GetValueString(arguments[kRemoveEventListenerEventNameIndex], &event_name);
    if (!flag) {
      context->ThrowException("event_name error");
      return nullptr;
    }
    std::vector<std::function<void()>> ops = {[weak_dom_manager, id, event_name] {
      auto dom_manager = weak_dom_manager.lock();
      if (!dom_manager) {
        return;
      }
      auto animation_manager = dom_manager->GetAnimationManager();
      auto animation = animation_manager->GetAnimation(id);
      if (!animation) {
        return;
      }
      animation->RemoveEventListener(StringViewUtils::ToU8StdStr(event_name));
    }};
    dom_manager->PostTask(Scene(std::move(ops)));
    return nullptr;
  };
  def.functions.emplace_back(std::move(remove_listener_func_def));

  std::shared_ptr<InstanceDefine<Animation>>
      instance_define = std::make_shared<InstanceDefine<Animation>>(def);
  auto scope = weak_scope.lock();
  if (scope) {
    scope->SaveHippyAnimationClassInstance(instance_define);
  }

  return instance_define;
}

std::shared_ptr<hippy::napi::InstanceDefine<AnimationSet>>
RegisterAnimationSet(const std::weak_ptr<Scope>& weak_scope) {
  InstanceDefine<AnimationSet> def;
  def.name = "AnimationSet";
  def.constructor = [weak_scope](size_t argument_count,
                                 const std::shared_ptr<CtxValue> arguments[])
                                     -> std::shared_ptr<AnimationSet> {
    auto scope = weak_scope.lock();
    if (!scope) {
      return nullptr;
    }
    auto weak_dom_manager = scope->GetDomManager();
    auto dom_manager = weak_dom_manager.lock();
    if (!dom_manager) {
      return nullptr;
    }
    auto result = ParseAnimationSet(scope->GetContext(), argument_count, arguments);
    if (!result) {
      return nullptr;
    }
    std::vector<std::function<void()>> ops = {[weak_dom_manager, copy = *result]() mutable {
      auto dom_manager = weak_dom_manager.lock();
      if (!dom_manager) {
        return;
      }
      auto animation_manager = dom_manager->GetAnimationManager();
      auto set = std::make_shared<AnimationSet>(std::move(copy));
      auto set_id = set->GetId();
      uint64_t min_delay = std::numeric_limits<uint64_t>::max();
      std::shared_ptr<Animation> start_animation;
      for (auto &child: set->GetChildren()) {
        auto animation = animation_manager->GetAnimation(child.animation_id);
        if (!animation) {
          continue;;
        }
        animation->SetAnimationSetId(set_id);
        if (!child.follow) {
          auto delay = animation->GetDelay();
          if (delay <= min_delay) {
            start_animation = animation;
            min_delay = delay;
          }
        }
      }
      if (start_animation) {
        set->SetStartValue(start_animation->GetStartValue());
      }
      animation_manager->AddAnimationSet(set);

    }};
    dom_manager->PostTask(Scene(std::move(ops)));
    return result;
  };

  FunctionDefine<AnimationSet> id_func_def;
  id_func_def.name = "getId";
  id_func_def.cb = [weak_scope](
      AnimationSet* animation_set,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[]) -> std::shared_ptr<CtxValue> {
    if (!animation_set) {
      return nullptr;
    }
    auto scope = weak_scope.lock();
    if (!scope) {
      return nullptr;
    }
    auto id = animation_set->GetId();
    return scope->GetContext()->CreateNumber(static_cast<double>(id));
  };
  def.functions.emplace_back(std::move(id_func_def));

  FunctionDefine<AnimationSet> start_func_def;
  start_func_def.name = "start";
  start_func_def.cb = [weak_scope](
      AnimationSet* animation_set,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[]) -> std::shared_ptr<CtxValue> {
    if (!animation_set) {
      return nullptr;
    }
    auto scope = weak_scope.lock();
    if (!scope) {
      return nullptr;
    }
    auto weak_dom_manager = scope->GetDomManager();
    auto dom_manager = weak_dom_manager.lock();
    if (!dom_manager) {
      return nullptr;
    }
    auto id = animation_set->GetId();
    std::vector<std::function<void()>> ops = {[weak_dom_manager, id] {
      auto dom_manager = weak_dom_manager.lock();
      if (!dom_manager) {
        return;
      }
      auto animation_manager = dom_manager->GetAnimationManager();
      auto animation_set = animation_manager->GetAnimationSet(id);
      if (!animation_set) {
        return;
      }
      auto status = animation_set->GetStatus();
      switch (status) {
        case AnimationSet::Status::kCreated:
          animation_set->SetStatus(AnimationSet::Status::kStart);
          break;
        case AnimationSet::Status::kStart:
        case AnimationSet::Status::kRunning:
        case AnimationSet::Status::kPause:
        case AnimationSet::Status::kResume:
        case AnimationSet::Status::kEnd:
        case AnimationSet::Status::kDestroy:
        default:
          return;
      }
      StartAnimationSet(dom_manager, animation_set);
    }};
    dom_manager->PostTask(Scene(std::move(ops)));
    return nullptr;
  };
  def.functions.emplace_back(std::move(start_func_def));

  FunctionDefine<AnimationSet> destroy_func_def;
  destroy_func_def.name = "destroy";
  destroy_func_def.cb = [weak_scope](
      AnimationSet* animation_set,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[]) -> std::shared_ptr<CtxValue> {
    if (!animation_set) {
      return nullptr;
    }
    auto scope = weak_scope.lock();
    if (scope) {
      return nullptr;
    }
    auto weak_dom_manager = scope->GetDomManager();
    auto dom_manager = weak_dom_manager.lock();
    if (!dom_manager) {
      return nullptr;
    }
    auto id = animation_set->GetId();
    std::vector<std::function<void()>> ops = {[id, weak_dom_manager] {
      auto dom_manager = weak_dom_manager.lock();
      if (!dom_manager) {
        return;
      }
      auto animation_manager = dom_manager->GetAnimationManager();
      if (!animation_manager) {
        return;
      }
      auto animation_set = animation_manager->GetAnimationSet(id);
      if (!animation_set) {
        return;
      }

      auto status = animation_set->GetStatus();
      switch (status) {
        case AnimationSet::Status::kCreated:
        case AnimationSet::Status::kStart:
        case AnimationSet::Status::kRunning:
        case AnimationSet::Status::kPause:
        case AnimationSet::Status::kResume:
        case AnimationSet::Status::kEnd:
          animation_set->SetStatus(AnimationSet::Status::kDestroy);
          break;
        case AnimationSet::Status::kDestroy:
        default:
          return;
      }

      animation_manager->RemoveAnimationSet(id);
      for (const auto& child : animation_set->GetChildren()) {
        auto animation = animation_manager->GetAnimation(child.animation_id);
        if (animation) {
          animation_manager->RemoveActiveAnimation(child.animation_id);
          animation_manager->RemoveAnimation(animation);
        }
      }
      if (status == AnimationSet::Status::kRunning) {
        auto on_cancel = animation_set->GetAnimationCancelCb();
        if (on_cancel) {
          auto task_runner = dom_manager->GetDelegateTaskRunner().lock();
          if (task_runner) {
            auto task = std::make_shared<CommonTask>();
            task->func_ = [on_cancel = std::move(on_cancel)]() {on_cancel();};
            task_runner->PostTask(std::move(task));
          }
        }
      }
    }};
    dom_manager->PostTask(Scene(std::move(ops)));
    return nullptr;
  };
  def.functions.emplace_back(std::move(destroy_func_def));

  FunctionDefine<AnimationSet> pause_func_def;
  pause_func_def.name = "pause";
  pause_func_def.cb = [weak_scope](
      AnimationSet* animation_set,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[]) -> std::shared_ptr<CtxValue> {
    if (!animation_set) {
      return nullptr;
    }
    auto scope = weak_scope.lock();
    if (!scope) {
      return nullptr;
    }
    auto weak_dom_manager = scope->GetDomManager();
    auto dom_manager = weak_dom_manager.lock();
    if (!dom_manager) {
      return nullptr;
    }
    auto id = animation_set->GetId();
    std::vector<std::function<void()>> ops = {[weak_dom_manager, id] {
      auto dom_manager = weak_dom_manager.lock();
      if (!dom_manager) {
        return;
      }
      auto animation_manager = dom_manager->GetAnimationManager();
      auto animation_set = animation_manager->GetAnimationSet(id);
      if (!animation_set) {
        return;
      }

      auto status = animation_set->GetStatus();
      switch (status) {
        case AnimationSet::Status::kStart:
        case AnimationSet::Status::kRunning:
        case AnimationSet::Status::kResume:
          animation_set->SetStatus(AnimationSet::Status::kPause);
          break;
        case AnimationSet::Status::kCreated:
        case AnimationSet::Status::kPause:
        case AnimationSet::Status::kEnd:
        case AnimationSet::Status::kDestroy:
        default:
          return;
      }

      auto now = hippy::base::MonotonicallyIncreasingTime();
      for (const auto& child : animation_set->GetChildren()) {
        auto animation_id = child.animation_id;
        auto animation = animation_manager->GetAnimation(animation_id);
        if (animation) {
          animation_manager->RemoveActiveAnimation(animation_id);
          animation_manager->CancelDelayedAnimation(animation_id);
          animation_manager->RemoveDelayedAnimationRecord(animation_id);
          auto exec_time = animation->GetExecTime();
          exec_time += (now - animation->GetLastBeginTime());
          animation->SetExecTime(exec_time);
          animation->SetLastBeginTime(now);
        }
      }
    }};
    dom_manager->PostTask(Scene(std::move(ops)));
    return nullptr;
  };
  def.functions.emplace_back(std::move(pause_func_def));

  FunctionDefine<AnimationSet> resume_func_def;
  resume_func_def.name = "resume";
  resume_func_def.cb = [weak_scope](
      AnimationSet* animation_set,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[]) -> std::shared_ptr<CtxValue> {
    if (!animation_set) {
      return nullptr;
    }
    auto scope = weak_scope.lock();
    if (!scope) {
      return nullptr;
    }
    auto weak_dom_manager = scope->GetDomManager();
    auto dom_manager = weak_dom_manager.lock();
    if (!dom_manager) {
      return nullptr;
    }
    auto id = animation_set->GetId();
    std::vector<std::function<void()>> ops = {[weak_dom_manager, id] {
      auto dom_manager = weak_dom_manager.lock();
      if (!dom_manager) {
        return;
      }
      auto animation_manager = dom_manager->GetAnimationManager();
      auto animation_set = animation_manager->GetAnimationSet(id);
      if (!animation_set) {
        return;
      }
      auto status = animation_set->GetStatus();
      switch (status) {
        case AnimationSet::Status::kPause:
          animation_set->SetStatus(AnimationSet::Status::kResume);
          break;
        case AnimationSet::Status::kCreated:
        case AnimationSet::Status::kStart:
        case AnimationSet::Status::kRunning:
        case AnimationSet::Status::kResume:
        case AnimationSet::Status::kEnd:
        case AnimationSet::Status::kDestroy:
        default:
          return;
      }
      StartAnimationSet(dom_manager, animation_set);
    }};
    dom_manager->PostTask(Scene(std::move(ops)));
    return nullptr;
  };
  def.functions.emplace_back(std::move(resume_func_def));


  FunctionDefine<AnimationSet> add_event_listener_func_def;
  add_event_listener_func_def.name = "addEventListener";
  add_event_listener_func_def.cb = [weak_scope](
      AnimationSet* animation_set,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[]) -> std::shared_ptr<CtxValue> {
    if (!animation_set) {
      return nullptr;
    }
    auto scope = weak_scope.lock();
    if (!scope) {
      return nullptr;
    }
    auto weak_dom_manager = scope->GetDomManager();
    auto dom_manager = weak_dom_manager.lock();
    if (!dom_manager) {
      return nullptr;
    }
    auto id = animation_set->GetId();
    auto context = scope->GetContext();
    if (argument_count != kAddEventListenerArgc) {
      context->ThrowException("argc error");
      return nullptr;
    }
    unicode_string_view event_name;
    auto flag = context->GetValueString(arguments[kAddEventListenerEventNameIndex], &event_name);
    if (!flag) {
      context->ThrowException("event_name error");
      return nullptr;
    }
    auto func = arguments[kAddEventListenerCbIndex];
    if (!context->IsFunction(func)) {
      context->ThrowException("cb is not a function");
      return nullptr;
    }
    std::weak_ptr<Ctx> weak_context = context;
    auto cb = [weak_context, func] {
      auto context = weak_context.lock();
      if (!context) {
        return;
      }
      context->CallFunction(func, 0, nullptr);
    };
    std::vector<std::function<void()>> ops = {[weak_dom_manager, id, event_name, cb] {
      auto dom_manager = weak_dom_manager.lock();
      if (!dom_manager) {
        return;
      }
      auto animation_manager = dom_manager->GetAnimationManager();
      auto animation_set = animation_manager->GetAnimationSet(id);
      if (!animation_set) {
        return;
      }
      animation_set->AddEventListener(StringViewUtils::ToU8StdStr(event_name),
                                      std::move(cb));
    }};
    dom_manager->PostTask(Scene(std::move(ops)));
    return nullptr;
  };
  def.functions.emplace_back(std::move(add_event_listener_func_def));

  FunctionDefine<AnimationSet> remove_listener_func_def;
  remove_listener_func_def.name = "removeEventListener";
  remove_listener_func_def.cb = [weak_scope](
      AnimationSet* animation_set,
      size_t argument_count,
      const std::shared_ptr<CtxValue> arguments[]) -> std::shared_ptr<CtxValue> {
    if (!animation_set) {
      return nullptr;
    }
    auto scope = weak_scope.lock();
    if (!scope) {
      return nullptr;
    }
    auto weak_dom_manager = scope->GetDomManager();
    auto dom_manager = weak_dom_manager.lock();
    if (!dom_manager) {
      return nullptr;
    }
    auto id = animation_set->GetId();
    auto context = scope->GetContext();
    if (argument_count != kRemoveEventListenerArgc) {
      context->ThrowException("argc error");
      return nullptr;
    }
    unicode_string_view event_name;
    auto flag = context->GetValueString(arguments[kRemoveEventListenerEventNameIndex],
                                        &event_name);
    if (!flag) {
      context->ThrowException("event_name error");
      return nullptr;
    }
    std::weak_ptr<Ctx> weak_context = context;
    std::vector<std::function<void()>> ops = {[weak_dom_manager, id, event_name] {
      auto dom_manager = weak_dom_manager.lock();
      if (!dom_manager) {
        return;
      }
      auto animation_manager = dom_manager->GetAnimationManager();
      auto animation_set = animation_manager->GetAnimationSet(id);
      if (!animation_set) {
        return;
      }
      animation_set->RemoveEventListener(StringViewUtils::ToU8StdStr(event_name));
    }};
    dom_manager->PostTask(Scene(std::move(ops)));
    return nullptr;
  };
  def.functions.emplace_back(std::move(remove_listener_func_def));

  std::shared_ptr<InstanceDefine<AnimationSet>>
      instance_define = std::make_shared<InstanceDefine<AnimationSet>>(def);
  auto scope = weak_scope.lock();
  if (scope) {
    scope->SaveHippyAnimationSetClassInstance(instance_define);
  }

  return instance_define;
}

}


