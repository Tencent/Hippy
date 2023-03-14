/**
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

#include "renderer/tdf/gesture/touch_recognizer.h"
#include "footstone/logging.h"

namespace hippy {
inline namespace render {
inline namespace tdf {
inline namespace gesture {

void TouchRecognizer::HandlePointerDown(const tdfcore::PointerData &data) {
  FOOTSTONE_LOG(INFO) << "TDFRenderer touch HandleEventDown";
  auto pointer = data.pointer;
  StartTrackingPointer(pointer);
  if (is_down_) {
    return;
  }
  is_down_ = true;
  monitor_pointer_ = pointer;
  initial_position_ = data.position;
  CheckStart(initial_position_);
}

void TouchRecognizer::HandlePointerMove(const tdfcore::PointerData &data) {
  FOOTSTONE_LOG(INFO) << "TDFRenderer touch HandleEventMove";
  auto pointer = data.pointer;
  if (!IsLegalPointer(pointer)) {
    StopTrackingPointer(pointer);
    return;
  }
  move_position_ = data.position;
  CheckMove(move_position_);
}

void TouchRecognizer::HandlePointerUp(const tdfcore::PointerData &data) {
  FOOTSTONE_LOG(INFO) << "TDFRenderer touch HandleEventUp";
  auto pointer = data.pointer;
  if (!IsLegalPointer(pointer)) {
    StopTrackingPointer(pointer);
    return;
  }
  up_position_ = data.position;
  // Touch not win other gestures, so do not use Accept() method
  AcceptGesture(pointer);
  StopTrackingPointer(pointer);
}

void TouchRecognizer::HandlePointerCancel(const tdfcore::PointerData &data) {
  FOOTSTONE_LOG(INFO) << "TDFRenderer touch HandleEventCancel";
  auto pointer = data.pointer;
  if (!IsLegalPointer(pointer)) {
    StopTrackingPointer(pointer);
    return;
  }
  Reject();
  if (sent_down_) {
    CheckCancel(data.position);
  }
  StopTrackingPointer(pointer);
}

bool TouchRecognizer::CanAddPointer(const tdfcore::PointerData &data) const {
  if (on_touch_start_ == nullptr &&
      on_touch_move_ == nullptr &&
      on_touch_end_ == nullptr &&
      on_touch_cancel_ == nullptr) {
    return false;
  }
  if (data.button_type == tdfcore::PointerButtonType::kNone) {
    return false;
  }
  return OneSequenceGestureRecognizer::CanAddPointer(data);
}

void TouchRecognizer::AcceptGesture(tdfcore::PointerID pointer) {
  FOOTSTONE_LOG(INFO) << "TDFRenderer touch AcceptGesture";
  if (pointer != monitor_pointer_) {
    StopTrackingPointer(pointer);
    return;
  }
  CheckStart(initial_position_);
  CheckEnd(up_position_);
  StopTrackingPointer(pointer);
}

void TouchRecognizer::RejectGesture(tdfcore::PointerID pointer) {
  FOOTSTONE_LOG(INFO) << "TDFRenderer touch RejectGesture";
  if (pointer != monitor_pointer_) {
    StopTrackingPointer(pointer);
    return;
  }
  if (sent_down_) {
    CheckCancel(move_position_);
  }
  StopTrackingPointer(pointer);
}

void TouchRecognizer::DidStopTrackingLastPointer(tdfcore::PointerID pointer) {
  FOOTSTONE_LOG(INFO) << "TDFRenderer touch DidStopTrackingLastPointer";
  is_down_ = false;
  sent_down_ = false;
}

bool TouchRecognizer::IsLegalPointer(tdfcore::PointerID pointer) const {
  if (!IsTrackingPointer(pointer) ||
      pointer != monitor_pointer_ ||
      !is_down_) {
    return false;
  }
  return true;
}

void TouchRecognizer::CheckStart(const tdfcore::TPoint &position) {
  if (sent_down_) return;
  if (on_touch_start_ != nullptr) {
    auto details = TouchDetails(position);
    on_touch_start_(details);
  }
  sent_down_ = true;
}

void TouchRecognizer::CheckMove(const tdfcore::TPoint &position) {
  if (on_touch_move_ != nullptr) {
    auto details = TouchDetails(position);
    on_touch_move_(details);
  }
}

void TouchRecognizer::CheckEnd(const tdfcore::TPoint &position) {
  if (on_touch_end_ != nullptr) {
    auto details = TouchDetails(position);
    on_touch_end_(details);
  }
}

void TouchRecognizer::CheckCancel(const tdfcore::TPoint &position) {
  if (on_touch_cancel_ != nullptr) {
    auto details = TouchDetails(position);
    on_touch_cancel_(details);
  }
}

std::shared_ptr<footstone::HippyValue> TouchRecognizer::TouchDetails2HippyValue(
    uint32_t id, const char *name, const TouchDetails &details) {
  footstone::HippyValue::HippyValueObjectType obj;
  obj["id"] = footstone::HippyValue(id);
  obj["name"] = footstone::HippyValue(name);
  obj["page_x"] = footstone::HippyValue(details.position.x);
  obj["page_y"] = footstone::HippyValue(details.position.y);
  return std::make_shared<footstone::HippyValue>(obj);
}

}  // namespace gesture
}  // namespace tdf
}  // namespace render
}  // namespace hippy
