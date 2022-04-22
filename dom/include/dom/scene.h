#pragma once

#include <functional>
#include <vector>

namespace hippy {
inline namespace dom {

class Scene {
 public:
  Scene(std::vector<std::function<void()>>&& ops);
  ~Scene() = default;

  void Build() const;

 private:
  std::vector<std::function<void()>> ops_;
};

}
}
