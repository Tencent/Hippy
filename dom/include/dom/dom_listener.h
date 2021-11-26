#pragma once

#include <any>
#include <functional>

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

using OnClickEventListener = std::function<void()>;
using OnLongClickEventListener = std::function<void()>;

enum class DomTreeEvent {
  Create, Update, Delete
};

using OnDomTreeEventListener = std::function<void()>;

enum class DomEvent {
  Create, Update, Delete
};

using OnDomEventListener = std::function<void()> ;

enum class LayoutEvent {
  OnLayout
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

using OnLayoutEventListener = std::function<void(LayoutResult)>;

using DispatchFunctionCallback = std::function<void(std::any)>;

using CallFunctionCallback = std::function<void(std::any)>;

using OnAttachChangedListener = std::function<void(bool)>;

enum class ShowEvent {
  Show, Dismiss
};
using OnShowEventListener = std::function<void(std::any)>;

}
}
