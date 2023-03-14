/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#include "dom/animation/animation_set.h"

#include <limits>

#include "dom/animation/animation_manager.h"
#include "dom/animation/cubic_bezier_animation.h"

namespace hippy {
inline namespace animation {

AnimationSet::AnimationSet(std::vector<AnimationSetChild>&& children_set,
                           int32_t cnt) :
    Animation(cnt), children_set_(std::move(children_set)),
    begin_animation_(nullptr), end_animation_(nullptr) {
}

AnimationSet::AnimationSet() : AnimationSet({}, 0) {}

}

void AnimationSet::Init() {
  auto animation_manager = animation_manager_.lock();
  if (!animation_manager) {
    return;
  }
  uint64_t begin_time = 0;
  uint64_t real_delay = 0;
  uint64_t min_delay = std::numeric_limits<uint64_t>::max();
  uint64_t max_delay = 0;
  for (const auto& child: children_set_) {
    auto animation = animation_manager->GetAnimation(child.animation_id);
    if (!animation) {
      continue;
    }
    animation_manager->RemoveAnimation(animation);
    animation->SetParentId(id_);
    children_->push_back(animation);
    auto delay = animation->GetDelay();
    if (child.follow) {
      real_delay = begin_time + delay;
      // The delay is adjusted to the delay relative to the animation set
      animation->SetDelay(real_delay);
    } else {
      real_delay = delay;
    }
    if (min_delay > real_delay) {
      min_delay = real_delay;
      begin_animation_ = animation;
    }
    if (max_delay <= real_delay) {
      max_delay = real_delay;
    }
    begin_time = real_delay + animation->GetDuration();
    if (begin_time >= duration_) {
      duration_ = begin_time;
      end_animation_ = animation;
    }
  }
  if (begin_animation_) {
    start_value_ = begin_animation_->GetStartValue();
    delay_ = begin_animation_->GetDelay();
  }
}

}
