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

#pragma once

#include "footstone/hippy_value.h"
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wsign-conversion"
#pragma clang diagnostic ignored "-Wsign-compare"
#pragma clang diagnostic ignored "-Wextra-semi"
#pragma clang diagnostic ignored "-Wc++98-compat-extra-semi"
#pragma clang diagnostic ignored "-Wignored-qualifiers"
#pragma clang diagnostic ignored "-Wimplicit-float-conversion"
#pragma clang diagnostic ignored "-Wimplicit-int-conversion"
#pragma clang diagnostic ignored "-Wfloat-conversion"
#pragma clang diagnostic ignored "-Wshadow"
#include "core/support/gesture/recognizer/one_sequence_gesture_recognizer.h"
#pragma clang diagnostic pop

namespace hippy {
inline namespace render {
inline namespace tdf {
inline namespace gesture {

struct TouchDetails {
  tdfcore::TPoint position = tdfcore::TPoint::Make(0, 0);

  explicit TouchDetails(const tdfcore::TPoint &position) : position(position) {}
};

using tdfcore::OneSequenceGestureRecognizer;

using TouchClosure = std::function<void(const TouchDetails &details)>;

class TouchRecognizer : public OneSequenceGestureRecognizer {
 public:
  void SetTouchStart(const TouchClosure &on_touch_start) { on_touch_start_ = on_touch_start; }
  void SetTouchMove(const TouchClosure &on_touch_move) { on_touch_move_ = on_touch_move; }
  void SetTouchEnd(const TouchClosure &on_touch_end) { on_touch_end_ = on_touch_end; }
  void SetTouchCancel(const TouchClosure &on_touch_cancel) { on_touch_cancel_ = on_touch_cancel; }

  static std::shared_ptr<footstone::HippyValue> TouchDetails2HippyValue(
      uint32_t id, const char *name, const TouchDetails &details);

 protected:
  void HandlePointerDown(const tdfcore::PointerData &data) override;
  void HandlePointerMove(const tdfcore::PointerData &data) override;
  void HandlePointerUp(const tdfcore::PointerData &data) override;
  void HandlePointerCancel(const tdfcore::PointerData &data) override;

  bool CanAddPointer(const tdfcore::PointerData &data) const override;
  void AcceptGesture(tdfcore::PointerID pointer) override;
  void RejectGesture(tdfcore::PointerID pointer) override;

  void DidStopTrackingLastPointer(tdfcore::PointerID pointer) override;

 private:
  bool IsLegalPointer(tdfcore::PointerID pointer) const;
  void CheckStart(const tdfcore::TPoint &position);
  void CheckMove(const tdfcore::TPoint &position);
  void CheckEnd(const tdfcore::TPoint &position);
  void CheckCancel(const tdfcore::TPoint &position);

  bool sent_down_ = false;
  bool is_down_ = false;
  tdfcore::PointerID monitor_pointer_;
  tdfcore::TPoint initial_position_;
  tdfcore::TPoint move_position_;
  tdfcore::TPoint up_position_;

  TouchClosure on_touch_start_;
  TouchClosure on_touch_move_;
  TouchClosure on_touch_end_;
  TouchClosure on_touch_cancel_;

  FRIEND_OF_TDF_ALLOC
};

}  // namespace gesture
}  // namespace tdf
}  // namespace render
}  // namespace hippy
