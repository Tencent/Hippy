#pragma once

#include <cstdint>
#include <functional>
#include <memory>
#include <string>
#include <vector>
#include <array>

#include "dom/dom_listener.h"
#include "dom/dom_manager.h"
#include "dom/dom_value.h"
#include "dom/layout_node.h"

namespace hippy {
inline namespace dom {

class LayoutNode;
class DomManager;

constexpr uint32_t kCapture = 0;
constexpr uint32_t kBubble = 1;
constexpr uint32_t kInvalidId = 0;
constexpr int32_t kInvalidIndex = -1;

class DomNode : public std::enable_shared_from_this<DomNode> {
 public:
  using DomValue = tdf::base::DomValue;

  DomNode(uint32_t id, uint32_t pid, int32_t index, std::string tag_name, std::string view_name,
          std::unordered_map<std::string, std::shared_ptr<DomValue>> &&style_map,
          std::unordered_map<std::string, std::shared_ptr<DomValue>> &&dom_ext_map,
          const std::shared_ptr<DomManager> &dom_manager);
  DomNode(uint32_t id, uint32_t pid, int32_t index);
  ~DomNode();

  // 层级优化后的RenderNode信息
  struct RenderInfo {
    uint32_t id = kInvalidId; // RenderNode的id
    uint32_t pid = kInvalidId; // 父RenderNode的id
    int32_t index = kInvalidIndex;  // 本节点在父RenderNode上的索引
  };

  struct EventListenerInfo {
    uint32_t id;
    EventCallback cb;

    EventListenerInfo(uint32_t id, EventCallback cb) : id(id), cb(std::move(cb)) {}
  };

  inline std::shared_ptr<DomNode> GetParent() { return parent_.lock(); }
  inline void SetParent(std::shared_ptr<DomNode> parent) { parent_ = parent; }
  inline uint32_t GetChildCount() const {
    return hippy::base::checked_numeric_cast<size_t, uint32_t>(children_.size());
  }
  inline void SetTagName(const std::string &tag_name) { tag_name_ = tag_name; }
  inline const std::string &GetTagName() { return tag_name_; }
  inline const std::string &GetViewName() { return view_name_; }
  inline std::shared_ptr<LayoutNode> GetLayoutNode() { return layout_node_; }
  inline void SetId(uint32_t id) { id_ = id; }
  inline uint32_t GetId() const { return id_; }
  inline void SetPid(uint32_t pid) { pid_ = pid; }
  inline uint32_t GetPid() const { return pid_; }
  inline const RenderInfo& GetRenderInfo() const { return render_info_; }
  inline void SetRenderInfo(const RenderInfo& render_info) { render_info_ = render_info; }
  inline bool IsLayoutOnly() const { return layout_only_; }
  inline void SetLayoutOnly(bool layout_only) { layout_only_ = layout_only; }
  inline bool IsVirtual() { return is_virtual_; }
  inline void SetIsVirtual(bool is_virtual) { is_virtual_ = is_virtual; }
  inline void SetIndex(int32_t index) { index_ = index; }
  inline int32_t GetIndex() const { return index_; }

  int32_t IndexOf(const std::shared_ptr<DomNode> &child);
  std::shared_ptr<DomNode> GetChildAt(size_t index);
  const std::vector<std::shared_ptr<DomNode>> &GetChildren() { return children_; }
  void AddChildAt(const std::shared_ptr<DomNode> &dom_node, int32_t index);
  std::shared_ptr<DomNode> RemoveChildAt(int32_t index);
  void DoLayout();
  void DoLayout(std::vector<std::shared_ptr<DomNode>>& changed_nodes);
  void HandleEvent(std::shared_ptr<DomEvent> &event);
  void ParseLayoutStyleInfo();
  /**
   * this method should run in dom taskrunner
   * */
  LayoutResult GetLayoutInfoFromRoot();
  void TransferLayoutOutputsRecursive(std::vector<std::shared_ptr<DomNode>>& changed_nodes);
  std::tuple<float, float> GetLayoutSize();
  void SetLayoutSize(float width, float height);
  const LayoutResult &GetLayoutResult() const { return layout_; }
  const LayoutResult &GetRenderLayoutResult() const { return render_layout_; }

  void AddEventListener(const std::string &name, bool use_capture, const EventCallback &cb,
                        const CallFunctionCallback& callback);
  void RemoveEventListener(const std::string &name, uint32_t id);

  // RenderListener 没有捕获冒泡流程，EventListener 拥有捕获冒泡流程
  void AddRenderListener(const std::string& name, const RenderCallback& cb,
                             const CallFunctionCallback& callback);
  void RemoveRenderListener(const std::string& name, uint32_t id);
  std::vector<std::shared_ptr<DomNode::EventListenerInfo>> GetEventListener(const std::string &name,
                                                                            bool is_capture);
  const std::shared_ptr<std::unordered_map<std::string, std::shared_ptr<DomValue>>> GetStyleMap() const {
    return style_map_;
  }
  void SetStyleMap(std::shared_ptr<std::unordered_map<std::string, std::shared_ptr<DomValue>>> style) {
    style_map_ = style;
  }
  void CallFunction(const std::string& name, const DomArgument& param, const CallFunctionCallback& cb);
  const std::shared_ptr<std::unordered_map<std::string, std::shared_ptr<DomValue>>> GetExtStyle() {
    return dom_ext_map_;
  }
  void SetExtStyleMap(std::shared_ptr<std::unordered_map<std::string, std::shared_ptr<DomValue>>> style) {
    dom_ext_map_ = style;
  }
  const std::shared_ptr<std::unordered_map<std::string, std::shared_ptr<DomValue>>> GetDiffStyle() { return diff_; }
  void SetDiffStyle(std::shared_ptr<std::unordered_map<std::string, std::shared_ptr<DomValue>>> diff) {
    diff_ = std::move(diff);
  }
  const std::shared_ptr<std::vector<std::string>> GetDeleteProps() { return delete_props_; }
  void SetDeleteProps(std::shared_ptr<std::vector<std::string>> delete_props) { delete_props_ = delete_props; }

  CallFunctionCallback GetCallback(const std::string &name, uint32_t id);
  bool HasEventListeners();

  /**
   * @brief 递归替换或插入属性到 style_map
   * @param key 插入的 key
   * @param value 插入的 value
   * @example {a: 1, b: {b1: 2}} -> emplace(b1, 3) -> {a: 1, b: {b1: 3}} -> emplcace(c, 3) -> {a: 1, b: {b1: 3}, c: 3}
   */
  void EmplaceStyleMap(const std::string key, const DomValue& value);

  void UpdateProperties(const std::unordered_map<std::string, std::shared_ptr<DomValue>>& update_style,
                        const std::unordered_map<std::string, std::shared_ptr<DomValue>>& update_dom_ext);

  void UpdateDomNodeStyleAndParseLayoutInfo(const std::unordered_map<std::string, std::shared_ptr<DomValue>>& update_style);
 private:
  void UpdateDiff(const std::unordered_map<std::string, std::shared_ptr<DomValue>>& update_style,
                  const std::unordered_map<std::string, std::shared_ptr<DomValue>>& update_dom_ext);
  void UpdateDomExt(const std::unordered_map<std::string, std::shared_ptr<DomValue>>& update_dom_ext);
  void UpdateStyle(const std::unordered_map<std::string, std::shared_ptr<DomValue>>& update_style);
  void UpdateObjectStyle(DomValue& style_map, const DomValue& update_style);
  bool ReplaceStyle(DomValue& object, const std::string&key, const DomValue& value);
  inline void SetDomManager(std::weak_ptr<DomManager> dom_manager) { dom_manager_ = dom_manager; }

 private:
  uint32_t id_;             // 节点唯一id
  uint32_t pid_;            // 父节点id
  int32_t index_;          // 当前节点在父节点孩子数组中的索引位置
  std::string tag_name_;   // DSL 中定义的组件名称
  std::string view_name_;  // 底层映射的组件
  std::shared_ptr<std::unordered_map<std::string, std::shared_ptr<DomValue>>> style_map_;
  // 样式预处理后结果
  std::shared_ptr<std::unordered_map<std::string, std::shared_ptr<DomValue>>> dom_ext_map_;
  //  用户自定义数据
  std::shared_ptr<std::unordered_map<std::string, std::shared_ptr<DomValue>>> diff_;
  std::shared_ptr<std::vector<std::string>> delete_props_;
  // Update 时用户自定义数据差异，UpdateRenderNode 完成后会清空 map，以节省内存

  std::shared_ptr<LayoutNode> layout_node_;
  LayoutResult layout_;  // Layout 结果
  LayoutResult render_layout_;  // 层级优化后的Layout 结果
  bool is_virtual_;
  bool layout_only_ = false;

  std::weak_ptr<DomNode> parent_;
  std::vector<std::shared_ptr<DomNode>> children_;

  RenderInfo render_info_;
  std::weak_ptr<DomManager> dom_manager_;
  uint32_t current_callback_id_;
  // 大部分DomNode没有监听，使用shared_ptr可以有效节约内存
  std::shared_ptr<std::unordered_map<std::string,
    std::unordered_map<uint32_t, CallFunctionCallback>>> func_cb_map_;
  std::shared_ptr<std::unordered_map<std::string,
                                     std::array<std::vector<std::shared_ptr<EventListenerInfo>>,
                                                2>>>
      event_listener_map_;

  friend DomManager;
};

}  // namespace dom
}  // namespace hippy
