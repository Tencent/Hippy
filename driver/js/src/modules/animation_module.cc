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

#include "driver/modules/animation_module.h"

#include <limits>
#include <regex>
#include <cmath>

#include "dom/node_props.h"
#include "driver/modules/ui_manager_module.h"
#include "driver/napi/js_native_api_types.h"
#include "driver/scope.h"
#include "footstone/unicode_string_view.h"
#include "footstone/string_view_utils.h"
#include "footstone/task.h"

template<typename T>
using InstanceDefine = hippy::napi::InstanceDefine<T>;

template<typename T>
using FunctionDefine = hippy::napi::FunctionDefine<T>;

using HippyValue = footstone::value::HippyValue;
using DomArgument = hippy::dom::DomArgument;
using unicode_string_view = footstone::stringview::unicode_string_view;

using AnimationSetChild = hippy::AnimationSet::AnimationSetChild;
using Ctx = hippy::napi::Ctx;
using CtxValue = hippy::napi::CtxValue;
using CallbackInfo = hippy::napi::CallbackInfo;
using CubicBezierAnimation = hippy::CubicBezierAnimation;
using DomEvent = hippy::dom::DomEvent;
using DomManager = hippy::dom::DomManager;
using DomNode = hippy::dom::DomNode;
using RegisterFunction = hippy::base::RegisterFunction;
using RegisterMap = hippy::base::RegisterMap;
using StringViewUtils = hippy::base::StringViewUtils;

using CtxValue = hippy::napi::CtxValue;

namespace hippy {

constexpr uint32_t kAnimationUpdateArgc = 1;

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
  CubicBezierAnimation::Mode mode;
  uint64_t delay;
  uint32_t animation_id;
  double start_value;
  double to_value;
  CubicBezierAnimation::ValueType type;
  uint64_t duration;
  std::string func;
  int32_t cnt;
};

double DegreesToRadians(double degrees) {
  return degrees * M_PI / 180;
}

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
  uint32_t animation_id = hippy::kInvalidAnimationId;
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
    flag = footstone::check::numeric_cast(id, animation_id);
    if (!flag) {
      context->ThrowException("animation id error");
      return nullptr;
    }
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
  CubicBezierAnimation::ValueType type = CubicBezierAnimation::ValueType::kUndefined;
  if (!context->IsNullOrUndefined(value_type_obj)) {
    flag = context->GetValueString(value_type_obj, &value_type);
    if (!flag) {
      context->ThrowException("animation value_type error");
      return nullptr;
    }
    auto u8_value_type = StringViewUtils::ToU8StdStr(value_type);
    if (u8_value_type == kAnimationValueTypeRad) {
      type = CubicBezierAnimation::ValueType::kRad;
    } else if (u8_value_type == kAnimationValueTypeDeg) {
      type = CubicBezierAnimation::ValueType::kDeg;
      start_value = DegreesToRadians(start_value);
      to_value = DegreesToRadians(to_value);
    } else if (u8_value_type == kAnimationValueTypeColor) {
      type = CubicBezierAnimation::ValueType::kColor;
    } else {
      type = CubicBezierAnimation::ValueType::kUndefined;
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
      CubicBezierAnimation::Mode::kTiming,
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

std::shared_ptr<InstanceDefine<CubicBezierAnimation>>
RegisterAnimation(const std::weak_ptr<Scope>& weak_scope) {
  InstanceDefine<CubicBezierAnimation> def;
  def.name = "Animation";
  def.constructor = [weak_scope](size_t argument_count,
                                 const std::shared_ptr<CtxValue> arguments[])
      -> std::shared_ptr<CubicBezierAnimation> {
    auto scope = weak_scope.lock();
    if (!scope) {
      return nullptr;
    }
    auto weak_dom_manager = scope->GetDomManager();
    auto dom_manager = weak_dom_manager.lock();
    if (!dom_manager) {
      return nullptr;
    }
    auto weak_root_node = scope->GetRootNode();
    auto root_node = weak_root_node.lock();
    if (!root_node) {
      return nullptr;
    }
    auto result = ParseAnimation(scope->GetContext(), argument_count, arguments);
    if (!result) {
      return nullptr;
    }
    auto animation =
        std::make_shared<CubicBezierAnimation>(result->mode, result->delay, result->start_value,
                                               result->to_value, result->type, result->duration,
                                               result->func, result->cnt, result->animation_id);
    auto animation_manager = root_node->GetAnimationManager();
    animation->SetAnimationManager(animation_manager);
    animation_manager->AddAnimation(animation);
    return animation;
  };

  FunctionDefine<CubicBezierAnimation> id_func_def;
  id_func_def.name = "getId";
  id_func_def.cb = [weak_scope](
      CubicBezierAnimation* animation,
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

  FunctionDefine<CubicBezierAnimation> start_func_def;
  start_func_def.name = "start";
  start_func_def.cb = [weak_scope](
      CubicBezierAnimation* animation,
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
    auto weak_root_node = scope->GetRootNode();
    auto root_node = weak_root_node.lock();
    if (!root_node) {
      return nullptr;
    }
    animation->Start();
    return nullptr;
  };
  def.functions.emplace_back(std::move(start_func_def));

  FunctionDefine<CubicBezierAnimation> destroy_func_def;
  destroy_func_def.name = "destroy";
  destroy_func_def.cb = [weak_scope](
      CubicBezierAnimation* animation,
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
    auto weak_root_node = scope->GetRootNode();
    auto root_node = weak_root_node.lock();
    if (!root_node) {
      return nullptr;
    }
    animation->Destroy();
    return nullptr;
  };
  def.functions.emplace_back(std::move(destroy_func_def));

  FunctionDefine<CubicBezierAnimation> pause_func_def;
  pause_func_def.name = "pause";
  pause_func_def.cb = [weak_scope](
      CubicBezierAnimation* animation,
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
    auto weak_root_node = scope->GetRootNode();
    auto root_node = weak_root_node.lock();
    if (!root_node) {
      return nullptr;
    }
    animation->Pause();
    return nullptr;
  };
  def.functions.emplace_back(std::move(pause_func_def));

  FunctionDefine<CubicBezierAnimation> resume_func_def;
  resume_func_def.name = "resume";
  resume_func_def.cb = [weak_scope](
      CubicBezierAnimation* animation,
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
    auto weak_root_node = scope->GetRootNode();
    auto root_node = weak_root_node.lock();
    if (!root_node) {
      return nullptr;
    }
    animation->Resume();
    return nullptr;
  };
  def.functions.emplace_back(std::move(resume_func_def));

  FunctionDefine<CubicBezierAnimation> update_func_def;
  update_func_def.name = "updateAnimation";
  update_func_def.cb = [weak_scope](
      CubicBezierAnimation* animation,
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
    auto weak_root_node = scope->GetRootNode();
    auto root_node = weak_root_node.lock();
    if (!root_node) {
      return nullptr;
    }
    return nullptr;
  };
  def.functions.emplace_back(std::move(update_func_def));

  FunctionDefine<CubicBezierAnimation> add_event_listener_func_def;
  add_event_listener_func_def.name = "addEventListener";
  add_event_listener_func_def.cb = [weak_scope](
      CubicBezierAnimation* animation,
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
    auto weak_root_node = scope->GetRootNode();
    auto root_node = weak_root_node.lock();
    if (!root_node) {
      return nullptr;
    }
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
    auto cb = [weak_scope, func] { // run in js thread
      auto scope = weak_scope.lock();
      if (!scope) {
        return;
      }
      auto context = scope->GetContext();
      context->CallFunction(func, 0, nullptr);
    };
    animation->AddEventListener(StringViewUtils::ToU8StdStr(event_name), std::move(cb));
    return nullptr;
  };
  def.functions.emplace_back(std::move(add_event_listener_func_def));

  FunctionDefine<CubicBezierAnimation> remove_listener_func_def;
  remove_listener_func_def.name = "removeEventListener";
  remove_listener_func_def.cb = [weak_scope](
      CubicBezierAnimation* animation,
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
    auto weak_root_node = scope->GetRootNode();
    auto root_node = weak_root_node.lock();
    if (!root_node) {
      return nullptr;
    }
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
    animation->RemoveEventListener(StringViewUtils::ToU8StdStr(event_name));
    return nullptr;
  };
  def.functions.emplace_back(std::move(remove_listener_func_def));

  std::shared_ptr<InstanceDefine<CubicBezierAnimation>>
      instance_define = std::make_shared<InstanceDefine<CubicBezierAnimation>>(def);
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
    auto weak_root_node = scope->GetRootNode();
    auto root_node = weak_root_node.lock();
    if (!root_node) {
      return nullptr;
    }
    auto animation_manager = root_node->GetAnimationManager();
    if (!animation_manager) {
      return nullptr;
    }
    auto set = ParseAnimationSet(scope->GetContext(), argument_count, arguments);
    if (!set) {
      return nullptr;
    }
    set->SetAnimationManager(root_node->GetAnimationManager());
    set->Init();
    animation_manager->AddAnimation(set);
    return set;
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
    auto weak_root_node = scope->GetRootNode();
    auto root_node = weak_root_node.lock();
    if (!root_node) {
      return nullptr;
    }
    animation_set->Start();
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
    if (!scope) {
      return nullptr;
    }
    auto weak_dom_manager = scope->GetDomManager();
    auto dom_manager = weak_dom_manager.lock();
    if (!dom_manager) {
      return nullptr;
    }
    auto weak_root_node = scope->GetRootNode();
    auto root_node = weak_root_node.lock();
    if (!root_node) {
      return nullptr;
    }
    animation_set->Destroy();
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
    auto weak_root_node = scope->GetRootNode();
    auto root_node = weak_root_node.lock();
    if (!root_node) {
      return nullptr;
    }
    animation_set->Pause();
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
    auto weak_root_node = scope->GetRootNode();
    auto root_node = weak_root_node.lock();
    if (!root_node) {
      return nullptr;
    }
    animation_set->Resume();
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
    auto weak_root_node = scope->GetRootNode();
    auto root_node = weak_root_node.lock();
    if (!root_node) {
      return nullptr;
    }
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
    auto cb = [weak_scope, func] {
      auto scope = weak_scope.lock();
      if (!scope) {
        return;
      }
      auto context = scope->GetContext();
      context->CallFunction(func, 0, nullptr);
    };
    animation_set->AddEventListener(StringViewUtils::ToU8StdStr(event_name), std::move(cb));
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
    auto weak_root_node = scope->GetRootNode();
    auto root_node = weak_root_node.lock();
    if (!root_node) {
      return nullptr;
    }
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
    animation_set->RemoveEventListener(StringViewUtils::ToU8StdStr(event_name));
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


