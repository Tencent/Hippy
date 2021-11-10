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

using OnClickEventListener = std::function<void()>;
using OnLongClickEventListener = std::function<void()>;

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
  float left;
  float top;
  float width;
  float height;
  float marginLeft;
  float marginTop;
  float marginRight;
  float marginBottom;
  float paddingLeft;
  float paddingTop;
  float paddingRight;
  float paddingBottom;
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
