#pragma once

#include <any>
#include <cstdint>
#include <memory>

#include "dom/dom_argument.h"
#include "dom/dom_listener.h"
#include "dom/dom_node.h"
#include "dom/dom_value.h"

namespace hippy {
inline namespace dom {

class DomNode;

class RenderManager {
 public:
  virtual ~RenderManager() = default;

  RenderManager() : id_(RenderManager::GenerateRenderId()) {}

  virtual void CreateRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) = 0;
  virtual void UpdateRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) = 0;
  virtual void DeleteRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) = 0;
  virtual void UpdateLayout(const std::vector<std::shared_ptr<DomNode>>& nodes) = 0;
  virtual void MoveRenderNode(std::vector<int32_t>&& moved_ids, int32_t from_pid, int32_t to_pid) = 0;
  virtual void EndBatch() = 0;

  virtual void BeforeLayout() = 0;
  virtual void AfterLayout() = 0;
  
  virtual void RegisterVsyncSignal(const std::string &key, float rate, std::function<void()> vsync_callback) = 0;
  virtual void UnregisterVsyncSignal(const std::string &key) = 0;

  using DomArgument = hippy::dom::DomArgument;
  virtual void AddEventListener(std::weak_ptr<DomNode> dom_node, const std::string& name) = 0;
  virtual void RemoveEventListener(std::weak_ptr<DomNode> dom_node, const std::string& name) = 0;
  virtual void CallFunction(std::weak_ptr<DomNode> dom_node, const std::string& name, const DomArgument& param,
                            uint32_t cb_id) = 0;

  inline void SetDensity(float density) { density_ = density; }
  inline float GetDensity() const {
    assert(density_ > 0.0f);
    return density_;
  }

  inline void SetDomManager(std::weak_ptr<DomManager> dom_manager) { dom_manager_ = dom_manager; }
  inline std::shared_ptr<DomManager> GetDomManager() const { return dom_manager_.lock(); }

  int32_t GetId() const { return id_; }

  static int32_t GenerateRenderId();
  static void Insert(const std::shared_ptr<RenderManager>& render_manager);
  static std::shared_ptr<RenderManager> Find(int32_t id);
  static bool Erase(int32_t id);
  static bool Erase(const std::shared_ptr<RenderManager>& render_manager);

 private:
  int32_t id_;
  float density_ = -1.0f;
  std::weak_ptr<DomManager> dom_manager_;
};

}  // namespace dom
}  // namespace hippy
