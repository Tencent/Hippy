#include "dom/dom_event.h"

namespace hippy {
inline namespace dom {

void DomEvent::StopPropagation() {
  prevent_bubble_ = true;
  prevent_capture_ = true;
}

}
}
