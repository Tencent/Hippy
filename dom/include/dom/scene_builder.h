#pragma once

#include <functional>
#include <vector>
#include <mutex>

#include "dom/dom_manager.h"
#include "dom/dom_node.h"
#include "dom/scene.h"

namespace hippy {
inline namespace dom {

class SceneBuilder {
 public:
  SceneBuilder() = default;
  ~SceneBuilder() = default;

  void Create(const std::weak_ptr<DomManager>& dom_manager, std::vector<std::shared_ptr<DomNode>>&& nodes);
  void Update(const std::weak_ptr<DomManager>& dom_manager, std::vector<std::shared_ptr<DomNode>>&& nodes);
  void Delete(const std::weak_ptr<DomManager>& dom_manager, std::vector<std::shared_ptr<DomNode>>&& nodes);
  Scene Build(const std::weak_ptr<DomManager>& dom_manager);
 private:
  std::vector<std::function<void()>> ops_;
  std::mutex mutex_;
};

}
}
