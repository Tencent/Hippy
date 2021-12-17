#pragma once

#include <any>
#include <memory>
#include <string>

#include "dom/dom_value.h"

namespace hippy {
inline namespace dom {

class DomNode;

class DomEvent {
 public:
  using DomValue = tdf::base::DomValue;
  DomEvent(std::string type, std::weak_ptr<DomNode> target,
           bool prevent_capture, bool prevent_bubble, std::shared_ptr<DomValue> value)
      : type_(std::move(type)), target_(target), current_target_(target),
        prevent_capture_(prevent_capture), prevent_bubble_(prevent_bubble), value_(value) {}
  DomEvent(std::string type, std::weak_ptr<DomNode> target,
           bool prevent_capture = false, bool prevent_bubble = false)
      : DomEvent(std::move(type), target, prevent_capture, prevent_bubble, nullptr) {}
  DomEvent(std::string type, std::weak_ptr<DomNode> target, std::shared_ptr<DomValue> value)
      : DomEvent(std::move(type), target, false, false, value) {}
  void StopPropagation();
  inline void SetValue(std::shared_ptr<DomValue> value) {
    value_ = value;
  }
  inline std::shared_ptr<DomValue> GetValue() {
    return value_;
  }
  inline bool IsPreventCapture() {
    return prevent_capture_;
  }
  inline bool IsPreventBubble() {
    return prevent_bubble_;
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

 private:
  std::string type_;
  std::weak_ptr<DomNode> target_;
  std::weak_ptr<DomNode> current_target_;
  bool prevent_capture_;
  bool prevent_bubble_;
  std::shared_ptr<DomValue> value_;
};

}
}
