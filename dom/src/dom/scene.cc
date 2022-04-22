#include "dom/scene.h"
#include "dom/scene.h"

#include <utility>

namespace hippy {
inline namespace dom {

Scene::Scene(std::vector<std::function<void()>>&& ops): ops_(std::move(ops)) {}

void Scene::Build() const {
  for (const auto& op: ops_) {
    op();
  }
}

}
}
