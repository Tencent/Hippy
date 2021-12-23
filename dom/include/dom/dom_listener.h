#pragma once

#include <any>
#include <functional>

#include "dom/dom_event.h"
#include "dom/dom_listener.h"
#include "dom/dom_argument.h"

namespace hippy {
inline namespace dom {

constexpr char kClickEvent[] = "click";
constexpr char kLongClickEvent[] = "longclick";
constexpr char kTouchStartEvent[] = "touchstart";
constexpr char kTouchMoveEvent[] = "tourchmove";
constexpr char kTouchEndEvent[] = "touchend";
constexpr char kPressIn[] = "pressin";
constexpr char kPressOut[] = "pressout";
constexpr char kTouchCancelEvent[] = "touchcancel";
constexpr char kLayoutEvent[] = "layout";
constexpr char kShowEvent[] = "show";
constexpr char kDismissEvent[] = "dismiss";

using EventCallback = std::function<void(const std::shared_ptr<DomEvent>&)>;
using CallFunctionCallback = std::function<void(std::shared_ptr<DomArgument>)>;

struct TouchEventInfo {
  float x;
  float y;
};

struct LayoutResult {
  float left = 0;
  float top = 0;
  float width = 0;
  float height = 0;
  float marginLeft = 0;
  float marginTop = 0;
  float marginRight = 0;
  float marginBottom = 0;
  float paddingLeft = 0;
  float paddingTop = 0;
  float paddingRight = 0;
  float paddingBottom = 0;
};

enum class LayoutDiffMapKey {
  x, y, w, h
};

}
}
