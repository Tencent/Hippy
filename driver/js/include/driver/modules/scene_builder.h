#include "driver/scope.h"
#include "driver/napi/js_native_api_types.h"

namespace hippy {

std::shared_ptr<hippy::napi::InstanceDefine<SceneBuilder>>
RegisterSceneBuilder(const std::weak_ptr<Scope>& weak_scope);

}

