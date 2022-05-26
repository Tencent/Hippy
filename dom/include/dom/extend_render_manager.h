#pragma once

#include "dom/render_manager.h"
namespace hippy {
inline namespace dom {

class ExtendRenderManager : public RenderManager {
 public:
  ExtendRenderManager() : id_(ExtendRenderManager::GenerateRenderId()) {}

  inline void SetDensity(float density) { density_ = density; }
  inline float GetDensity() const { return density_; }

  inline void SetDomManager(std::weak_ptr<DomManager> dom_manager) {
    dom_manager_ = dom_manager;

  }
  inline std::shared_ptr<DomManager> GetDomManager() const { return dom_manager_.lock(); }

  int32_t GetId() const { return id_; }

  static int32_t GenerateRenderId();
  static void Insert(const std::shared_ptr<ExtendRenderManager>& render_manager);
  static std::shared_ptr<ExtendRenderManager> Find(int32_t id);
  static bool Erase(int32_t id);
  static bool Erase(const std::shared_ptr<ExtendRenderManager>& render_manager);

 private:
  int32_t id_;
  float density_ = 1.0f;
  std::weak_ptr<DomManager> dom_manager_;
};

}  // namespace dom
}  // namespace hippy
