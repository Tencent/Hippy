#pragma once

#include <any>
#include <memory>
#include <string>

#include "footstone/hippy_value.h"

namespace hippy {
inline namespace dom {

class DomNode;

enum class EventPhase: uint8_t {
  kNone = 0,
  kCapturePhase = 1,
  kAtTarget = 2,
  kBubblePhase =3
};

class DomEvent {
 public:
  using HippyValue = footstone::value::HippyValue;
  DomEvent(std::string type, std::weak_ptr<DomNode> target,
           bool can_capture, bool can_bubble, std::shared_ptr<HippyValue> value)
      : type_(std::move(type)), target_(target), current_target_(target),
        prevent_capture_(false), prevent_bubble_(false), can_capture_(can_capture),
        can_bubble_(can_bubble), value_(value) {}
  DomEvent(std::string type, std::weak_ptr<DomNode> target,
           bool can_capture = false, bool can_bubble = false)
      : DomEvent(std::move(type), target, can_capture, can_bubble, nullptr) {}
  DomEvent(std::string type, std::weak_ptr<DomNode> target, std::shared_ptr<HippyValue> value)
      : DomEvent(std::move(type), target, false, false, value) {}
  void StopPropagation();
  inline void SetValue(std::shared_ptr<HippyValue> value) {
    value_ = value;
  }
  inline std::shared_ptr<HippyValue> GetValue() {
    return value_;
  }
  inline bool IsPreventCapture() {
    return prevent_capture_;
  }
  inline bool IsPreventBubble() {
    return prevent_bubble_;
  }
  inline bool CanCapture() {
    return can_capture_;
  }
  inline bool CanBubble() {
    return can_bubble_;
  }
  inline void SetCurrentTarget(std::weak_ptr<DomNode> current) {
    current_target_ = current;
  }
  inline std::weak_ptr<DomNode> GetCurrentTarget() {
    return current_target_;
  }
  inline std::weak_ptr<DomNode> GetTarget() {
    return target_;
  }
  inline std::string GetType() {
    return type_;
  }
  inline EventPhase GetEventPhase() {
    return event_phase_;
  }
  inline void SetEventPhase(EventPhase event_phase) {
    event_phase_ = event_phase;
  }

 private:
  std::string type_;
  std::weak_ptr<DomNode> target_;
  std::weak_ptr<DomNode> current_target_;
  bool prevent_capture_;
  bool prevent_bubble_;
  bool can_capture_;
  bool can_bubble_;
  EventPhase event_phase_ = EventPhase::kNone;
  std::shared_ptr<HippyValue> value_;
};

}
}
