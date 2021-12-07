#pragma once

#include <any>
#include <functional>

#include "dom/dom_event.h"
#include "dom/dom_listener.h"

namespace hippy {
inline namespace dom {

constexpr char kTouchStartEvent[] = "TouchStart";
constexpr char kTouchMoveEvent[] = "TouchMove";
constexpr char kTouchEndEvent[] = "TouchEnd";
constexpr char kTouchCancelEvent[] = "TouchCancel";
constexpr char kLayoutEvent[] = "Layout";
constexpr char kClickEvent[] = "Click";
constexpr char kLongClickEvent[] = "LongClick";
constexpr char kShow[] = "Show";
constexpr char kDismiss[] = "Dismiss";

using EventCallback = std::function<void(const std::shared_ptr<DomEvent>&)>;
using CallFunctionCallback = std::function<std::any(const std::any&)>;

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
