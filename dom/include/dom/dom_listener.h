#pragma once

#include <any>

namespace hippy {
inline namespace dom {

enum class TouchEvent {
  Start, Move, End, Cancel
};

struct TouchEventInfo {
  float x;
  float y;
};

using OnTouchEventListener = std::function<void(TouchEventInfo)>;

using OnClickEventListener = std::function<void(TouchEventInfo)>;

enum class DomTreeEvent {
  Create, Update, Delete
};

using OnDomTreeEventListener = std::function<void()>;

enum class DomEvent {
  Create, Update, Delete
};

using OnDomEventListener = std::function<void(std::any)> ;

enum class LayoutEvent {
  OnLayout
};

struct LayoutResult {
  float x;
  float y;
  float w;
  float h;
};

enum class LayoutDiffMapKey {
  x, y, w, h
};

using OnLayoutEventListener = std::function<void(LayoutResult)>;

using DispatchFunctionCallback = std::function<void(std::any)>;

using CallFunctionCallback = std::function<void(std::any)>;

}
}
