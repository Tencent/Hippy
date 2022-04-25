#include "core/napi/js_native_api_types.h"
#include "core/scope.h"
#include "dom/dom_event.h"

namespace hippy {

std::shared_ptr<hippy::napi::InstanceDefine<DomEvent>> MakeEventInstanceDefine(
    const std::weak_ptr<Scope>& weak_scope, std::shared_ptr<DomEvent>& dom_event);

} // namespace hippy
